"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { recomputeAvailability } from "@/lib/engine/recompute";
import { callGeminiVisionJson } from "@/lib/ai/geminiVision";
import { metaFor } from "@/lib/inventory/catalog";
import type { ActionResult } from "@/types/database";

const receiveWeightSchema = z.object({
  inventoryItemId: z.string().uuid(),
  /** Quantity in purchase UOM (kg / L / bag) OR base unit if unitMode=base */
  qty: z.number().positive().max(500000),
  unitMode: z.enum(["purchase", "base"]).default("purchase"),
  rate: z.number().nonnegative().optional(),
  note: z.string().max(200).optional(),
});

/**
 * Restock by entered weight/qty — converts purchase UOM → base units.
 * Example: 2.5 kg paneer with conversion 1000 → +2500 g stock.
 */
export async function receiveByWeight(
  input: unknown
): Promise<ActionResult<{ qty: number; addedBase: number }>> {
  const parsed = receiveWeightSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Enter a valid quantity" };
  }
  const membership = await getMembership();
  if (
    !membership ||
    !roleAtLeast(membership.membership.role, MANAGER_ROLES.concat(["kitchen"]))
  ) {
    return { ok: false, code: "unauthorized", message: "Manager access required" };
  }

  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("inventory_items")
    .select("*, ingredients(id, name, unit, purchase_conversion, avg_cost)")
    .eq("id", parsed.data.inventoryItemId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .maybeSingle();

  if (!inv) {
    return { ok: false, code: "not_found", message: "Inventory item not found" };
  }

  const ing = inv.ingredients as {
    id?: string;
    name?: string;
    unit?: string;
    purchase_conversion?: number;
    avg_cost?: number;
  } | null;
  const meta = metaFor(ing?.name ?? "");
  const conversion =
    ing?.purchase_conversion && Number(ing.purchase_conversion) > 0
      ? Number(ing.purchase_conversion)
      : meta.purchaseConversion;

  const addedBase =
    parsed.data.unitMode === "base"
      ? parsed.data.qty
      : parsed.data.qty * conversion;

  const nextQty = Number(inv.qty) + addedBase;
  const unitCost =
    parsed.data.rate != null && parsed.data.unitMode === "purchase" && conversion > 0
      ? parsed.data.rate / conversion
      : ing?.avg_cost != null && Number(ing.avg_cost) > 0
        ? Number(ing.avg_cost)
        : meta.avgCost;

  await admin.from("inventory_items").update({ qty: nextQty }).eq("id", inv.id);

  const note =
    parsed.data.note ||
    (parsed.data.unitMode === "purchase"
      ? `Received ${parsed.data.qty} ${meta.purchaseUom}`
      : `Received ${parsed.data.qty} ${ing?.unit ?? "g"}`);

  const { error: txnErr } = await admin.from("inventory_transactions").insert({
    inventory_item_id: inv.id,
    delta: addedBase,
    type: "purchase",
    unit_cost: unitCost,
    note,
    actor_id: membership.user.id,
  });
  if (txnErr) {
    await admin.from("inventory_transactions").insert({
      inventory_item_id: inv.id,
      delta: addedBase,
      type: "purchase",
    });
  }

  // Update avg_cost when rate provided (WAC-lite)
  if (parsed.data.rate != null && ing?.id && parsed.data.unitMode === "purchase") {
    const newAvg = unitCost;
    await admin
      .from("ingredients")
      .update({ avg_cost: newAvg, last_purchase_rate: parsed.data.rate })
      .eq("id", ing.id);
  }

  await recomputeAvailability(membership.membership.restaurant_id, [inv.ingredient_id]);

  return { ok: true, data: { qty: nextQty, addedBase } };
}

const billLineSchema = z.object({
  name: z.string(),
  qty: z.number().positive(),
  unit: z.string().optional(),
  rate: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  matchedInventoryItemId: z.string().uuid().optional().nullable(),
  matchedName: z.string().optional().nullable(),
});

export type BillExtractLine = z.infer<typeof billLineSchema>;

export type BillExtractResult = {
  supplier: string | null;
  invoiceNumber: string | null;
  date: string | null;
  lines: BillExtractLine[];
  total: number | null;
  provider: "gemini" | "fallback";
};

const extractSchema = z.object({
  imageBase64: z.string().min(40),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
});

function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchIngredient(
  billName: string,
  catalog: { id: string; name: string }[]
): { id: string; name: string } | null {
  const n = normalizeName(billName);
  // exact / contains
  for (const c of catalog) {
    const cn = normalizeName(c.name);
    if (n === cn || n.includes(cn) || cn.includes(n)) return c;
  }
  // token overlap
  const tokens = n.split(" ").filter((t) => t.length > 2);
  let best: { id: string; name: string; score: number } | null = null;
  for (const c of catalog) {
    const cn = normalizeName(c.name);
    const score = tokens.filter((t) => cn.includes(t)).length;
    if (score > 0 && (!best || score > best.score)) best = { ...c, score };
  }
  return best ? { id: best.id, name: best.name } : null;
}

/** OCR a supplier bill / mandi slip photo → structured lines matched to stock. */
export async function extractBillFromImage(
  input: unknown
): Promise<ActionResult<BillExtractResult>> {
  const parsed = extractSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Upload a clear bill photo (JPG/PNG)" };
  }

  const membership = await getMembership();
  // Allow promo-less extract only when signed in; promo UI uses mock path client-side
  if (!membership || !roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Manager access required" };
  }

  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("inventory_items")
    .select("id, ingredients(name)")
    .eq("restaurant_id", membership.membership.restaurant_id);

  const catalog = (inv ?? []).map((row) => ({
    id: row.id as string,
    name: ((row.ingredients as { name?: string } | null)?.name ?? "") as string,
  }));

  const system = `You extract Indian restaurant / mandi / grocery purchase bills.
Return STRICT JSON only:
{
  "supplier": string|null,
  "invoiceNumber": string|null,
  "date": string|null,
  "total": number|null,
  "lines": [{"name": string, "qty": number, "unit": string, "rate": number|null, "total": number|null}]
}
Rules:
- qty is the purchased quantity (prefer kg / L / pcs as on the bill).
- unit examples: kg, g, L, ml, pcs, bag, bunch.
- Convert Hindi/common misspellings: पनीर→Paneer, चिकन→Chicken, चावल→Basmati Rice, मक्खन→Butter, टमाटर→Tomato, दही→Yogurt.
- Ignore taxes as separate lines unless they are the only totals.
- Max 25 lines. No markdown.`;

  const text = await callGeminiVisionJson(
    system,
    parsed.data.imageBase64,
    parsed.data.mimeType
  );

  let raw: {
    supplier?: string | null;
    invoiceNumber?: string | null;
    date?: string | null;
    total?: number | null;
    lines?: {
      name: string;
      qty: number;
      unit?: string;
      rate?: number | null;
      total?: number | null;
    }[];
  } | null = null;

  if (text) {
    try {
      raw = JSON.parse(text);
    } catch {
      raw = null;
    }
  }

  if (!raw?.lines?.length) {
    // Deterministic demo fallback so pitch still works without Gemini
    const demoLines = catalog.slice(0, 4).map((c, i) => {
      const meta = metaFor(c.name);
      const qty = i === 0 ? 2 : i === 1 ? 5 : 1;
      return {
        name: c.name,
        qty,
        unit: meta.purchaseUom,
        rate: meta.lastPurchaseRate,
        total: qty * meta.lastPurchaseRate,
        matchedInventoryItemId: c.id,
        matchedName: c.name,
      };
    });
    return {
      ok: true,
      data: {
        supplier: "Green Valley Mandi",
        invoiceNumber: "CASH-DEMO",
        date: new Date().toISOString().slice(0, 10),
        lines: demoLines,
        total: demoLines.reduce((a, l) => a + (l.total ?? 0), 0),
        provider: "fallback",
      },
    };
  }

  const lines: BillExtractLine[] = raw.lines.map((l) => {
    const match = matchIngredient(l.name, catalog);
    return {
      name: l.name,
      qty: Number(l.qty),
      unit: l.unit ?? "kg",
      rate: l.rate != null ? Number(l.rate) : undefined,
      total: l.total != null ? Number(l.total) : undefined,
      matchedInventoryItemId: match?.id ?? null,
      matchedName: match?.name ?? null,
    };
  });

  return {
    ok: true,
    data: {
      supplier: raw.supplier ?? null,
      invoiceNumber: raw.invoiceNumber ?? null,
      date: raw.date ?? null,
      lines,
      total: raw.total != null ? Number(raw.total) : null,
      provider: "gemini",
    },
  };
}

const applyBillSchema = z.object({
  lines: z
    .array(
      z.object({
        inventoryItemId: z.string().uuid(),
        qty: z.number().positive(),
        unitMode: z.enum(["purchase", "base"]).default("purchase"),
        rate: z.number().nonnegative().optional(),
        note: z.string().max(200).optional(),
      })
    )
    .min(1)
    .max(40),
});

/** Apply reviewed OCR lines into stock. */
export async function applyBillLines(
  input: unknown
): Promise<ActionResult<{ applied: number }>> {
  const parsed = applyBillSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "No valid lines to apply" };
  }

  let applied = 0;
  for (const line of parsed.data.lines) {
    const result = await receiveByWeight(line);
    if (result.ok) applied += 1;
  }

  if (!applied) {
    return { ok: false, code: "apply_failed", message: "Could not apply any lines" };
  }
  return { ok: true, data: { applied } };
}
