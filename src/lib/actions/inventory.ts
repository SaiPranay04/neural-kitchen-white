"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { adjustInventorySchema } from "@/lib/schemas/orders";
import { recomputeAvailability } from "@/lib/engine/recompute";
import { metaFor } from "@/lib/inventory/catalog";
import type { ActionResult } from "@/types/database";

export async function adjustInventory(
  input: unknown
): Promise<ActionResult<{ qty: number }>> {
  const parsed = adjustInventorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid inventory adjust" };
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
    .select("*, ingredients(name, unit)")
    .eq("id", parsed.data.inventoryItemId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .maybeSingle();

  if (!inv) {
    return { ok: false, code: "not_found", message: "Inventory item not found" };
  }

  const nextQty = Number(inv.qty) + parsed.data.delta;
  if (nextQty < 0) {
    return { ok: false, code: "negative_stock", message: "Stock cannot go negative" };
  }

  const ingName = (inv.ingredients as { name?: string } | null)?.name ?? "";
  const unitCost = metaFor(ingName).avgCost;

  await admin.from("inventory_items").update({ qty: nextQty }).eq("id", inv.id);

  const txn: Record<string, unknown> = {
    inventory_item_id: inv.id,
    delta: parsed.data.delta,
    type: parsed.data.type,
  };
  // Optional enriched columns (migration 004)
  txn.unit_cost = unitCost;
  txn.note =
    parsed.data.type === "purchase"
      ? "Manual restock"
      : parsed.data.type === "waste"
        ? "Manual waste"
        : "Manual adjustment";

  const { error: txnErr } = await admin.from("inventory_transactions").insert(txn);
  if (txnErr) {
    await admin.from("inventory_transactions").insert({
      inventory_item_id: inv.id,
      delta: parsed.data.delta,
      type: parsed.data.type,
    });
  }

  await recomputeAvailability(membership.membership.restaurant_id, [inv.ingredient_id]);

  return { ok: true, data: { qty: nextQty } };
}

const wasteSchema = z.object({
  inventoryItemId: z.string().uuid(),
  qty: z.number().positive().max(100000),
  reason: z.enum([
    "spoilage",
    "expiry",
    "overcook",
    "spillage",
    "customer_return",
    "staff_meal",
    "trial",
  ]),
  note: z.string().max(200).optional(),
});

export async function logWaste(
  input: unknown
): Promise<ActionResult<{ qty: number; cost: number }>> {
  const parsed = wasteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid waste entry" };
  }
  const membership = await getMembership();
  if (
    !membership ||
    !roleAtLeast(membership.membership.role, MANAGER_ROLES.concat(["kitchen"]))
  ) {
    return { ok: false, code: "unauthorized", message: "Kitchen or manager access required" };
  }

  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("inventory_items")
    .select("*, ingredients(id, name, unit)")
    .eq("id", parsed.data.inventoryItemId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .maybeSingle();

  if (!inv) {
    return { ok: false, code: "not_found", message: "Inventory item not found" };
  }

  const qty = parsed.data.qty;
  if (Number(inv.qty) < qty) {
    return { ok: false, code: "insufficient", message: "Not enough stock to write off" };
  }

  const nextQty = Number(inv.qty) - qty;
  const ing = inv.ingredients as { id?: string; name?: string; unit?: string } | null;
  const unitCost = metaFor(ing?.name ?? "").avgCost;
  const cost = qty * unitCost;

  await admin.from("inventory_items").update({ qty: nextQty }).eq("id", inv.id);

  const { error: txnErr } = await admin.from("inventory_transactions").insert({
    inventory_item_id: inv.id,
    delta: -qty,
    type: "waste",
    unit_cost: unitCost,
    note: `${parsed.data.reason}${parsed.data.note ? ` · ${parsed.data.note}` : ""}`,
    actor_id: membership.user.id,
  });
  if (txnErr) {
    await admin.from("inventory_transactions").insert({
      inventory_item_id: inv.id,
      delta: -qty,
      type: "waste",
    });
  }

  // Best-effort waste_logs table (migration 004)
  if (ing?.id) {
    await admin.from("waste_logs").insert({
      restaurant_id: membership.membership.restaurant_id,
      ingredient_id: ing.id,
      qty,
      cost,
      reason: parsed.data.reason,
      note: parsed.data.note ?? null,
      actor_id: membership.user.id,
    });
  }

  await recomputeAvailability(membership.membership.restaurant_id, [inv.ingredient_id]);

  return { ok: true, data: { qty: nextQty, cost } };
}

const receiveSchema = z.object({
  inventoryItemId: z.string().uuid(),
  qty: z.number().positive().max(500000),
  note: z.string().max(200).optional(),
});

/** Quick goods-in / restock (cash or PO receive shortcut). */
export async function receiveStock(
  input: unknown
): Promise<ActionResult<{ qty: number }>> {
  return adjustInventory({
    inventoryItemId: (input as { inventoryItemId: string }).inventoryItemId,
    delta: (input as { qty: number }).qty,
    type: "purchase",
  });
}

export async function receiveStockDetailed(
  input: unknown
): Promise<ActionResult<{ qty: number }>> {
  const parsed = receiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid receive" };
  }
  return adjustInventory({
    inventoryItemId: parsed.data.inventoryItemId,
    delta: parsed.data.qty,
    type: "purchase",
  });
}
