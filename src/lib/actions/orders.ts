"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { placeOrderSchema, serviceRequestSchema } from "@/lib/schemas/orders";
import { recomputeAvailability, depletionCheck } from "@/lib/engine/recompute";
import { computePriority } from "@/lib/engine";
import { allocateDisplayId } from "@/lib/orders/displayId";
import type { ActionResult } from "@/types/database";
import { log } from "@/lib/log";

export async function startTableSession(
  token: string
): Promise<
  ActionResult<{
    sessionId: string;
    tableNumber: number;
    slug: string;
    restaurantId: string;
    token: string;
  }>
> {
  const admin = createAdminClient();
  const { data: table } = await admin
    .from("tables")
    .select("id, number, status, restaurant_id, restaurants(slug)")
    .eq("qr_token", token)
    .maybeSingle();

  if (!table) {
    return { ok: false, code: "invalid_token", message: "Invalid or expired QR code" };
  }
  if (table.status === "cleaning") {
    return { ok: false, code: "table_cleaning", message: "Table is being cleaned — please wait a moment" };
  }

  const sessionToken = token;
  const { data: existing } = await admin
    .from("qr_sessions")
    .select("id, ended_at")
    .eq("token", sessionToken)
    .maybeSingle();

  let sessionId = existing?.id;
  if (sessionId && existing?.ended_at) {
    // Same table QR token is unique — reopen the prior session after bill/feedback close
    const { error } = await admin
      .from("qr_sessions")
      .update({ ended_at: null, started_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (error) {
      return { ok: false, code: "session_fail", message: "Could not restart session" };
    }
  } else if (!sessionId) {
    const { data: session, error } = await admin
      .from("qr_sessions")
      .insert({ table_id: table.id, token: sessionToken })
      .select("id")
      .single();
    if (error || !session) {
      return {
        ok: false,
        code: "session_fail",
        message: error?.message
          ? `Could not start session (${error.message})`
          : "Could not start session",
      };
    }
    sessionId = session.id;
  }

  if (table.status === "available" || table.status === "reserved") {
    await admin.from("tables").update({ status: "occupied" }).eq("id", table.id);
  }

  const restaurants = table.restaurants as unknown as
    | { slug?: string }
    | { slug?: string }[]
    | null;
  const slug = (Array.isArray(restaurants) ? restaurants[0]?.slug : restaurants?.slug) ??
    "spice-garden";
  return {
    ok: true,
    data: {
      sessionId,
      tableNumber: table.number,
      slug,
      restaurantId: table.restaurant_id,
      token: sessionToken,
    },
  };
}

/**
 * Resolve a live table session. Prefers QR token; if stale/missing after seed,
 * recovers via restaurant slug + table number using the current qr_token.
 */
export async function ensureTableSession(input: {
  token?: string | null;
  restaurantSlug?: string | null;
  tableNumber?: number | null;
}): Promise<
  ActionResult<{
    sessionId: string;
    tableNumber: number;
    slug: string;
    restaurantId: string;
    token: string;
  }>
> {
  const token = input.token?.trim();
  if (token && token.length >= 8) {
    const started = await startTableSession(token);
    if (started.ok) return started;
  }

  const slug = input.restaurantSlug?.trim();
  const tableNumber = input.tableNumber ?? 7;
  if (!slug) {
    return {
      ok: false,
      code: "invalid_token",
      message: "Table session missing — open the Table QR link again",
    };
  }

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) {
    return { ok: false, code: "not_found", message: "Restaurant not found" };
  }

  const { data: table } = await admin
    .from("tables")
    .select("qr_token, number")
    .eq("restaurant_id", restaurant.id)
    .eq("number", tableNumber)
    .maybeSingle();

  if (!table?.qr_token) {
    return {
      ok: false,
      code: "invalid_token",
      message: "No QR for this table — run seed and open the Table QR link",
    };
  }

  return startTableSession(table.qr_token);
}

export async function placeOrder(
  input: unknown
): Promise<ActionResult<{ orderId: string; displayId: string; sessionToken: string }>> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid order payload" };
  }

  const admin = createAdminClient();
  const { items, note } = parsed.data;

  const ensured = await ensureTableSession({
    token: parsed.data.sessionToken,
    restaurantSlug: parsed.data.restaurantSlug,
    tableNumber: parsed.data.tableNumber,
  });
  if (!ensured.ok) {
    return {
      ok: false,
      code: ensured.code,
      message: ensured.message,
    };
  }

  const sessionToken = ensured.data.token;

  // Ensure an active QR session exists (menu link may not have gone through /t/[token])
  let { data: session } = await admin
    .from("qr_sessions")
    .select("id, table_id, ended_at, tables(id, restaurant_id, restaurants(tax_rate))")
    .eq("token", sessionToken)
    .maybeSingle();

  if (session?.ended_at) {
    await admin
      .from("qr_sessions")
      .update({ ended_at: null, started_at: new Date().toISOString() })
      .eq("id", session.id);
    session = { ...session, ended_at: null };
  }

  if (!session) {
    const { data: fresh } = await admin
      .from("qr_sessions")
      .select("id, table_id, tables(id, restaurant_id, restaurants(tax_rate))")
      .eq("id", ensured.data.sessionId)
      .maybeSingle();
    session = fresh as typeof session;
  }

  if (!session) {
    return {
      ok: false,
      code: "invalid_token",
      message: "Session expired — open the Table QR link again",
    };
  }

  const table = session.tables as unknown as {
    id: string;
    restaurant_id: string;
    restaurants: { tax_rate: number } | null;
  } | null;
  if (!table) {
    return { ok: false, code: "invalid_table", message: "Table not found" };
  }

  const menuIds = items.map((i) => i.menuItemId);
  const { data: menuItems } = await admin
    .from("menu_items")
    .select("*")
    .in("id", menuIds)
    .eq("restaurant_id", table.restaurant_id);

  if (!menuItems || menuItems.length !== menuIds.length) {
    return { ok: false, code: "item_missing", message: "One or more items not found" };
  }

  for (const mi of menuItems) {
    if (mi.availability === "unavailable" || mi.availability === "paused") {
      return {
        ok: false,
        code: "item_unavailable",
        message: `${mi.name} is currently unavailable`,
      };
    }
  }

  // Decrement inventory atomically per recipe
  const { data: recipes } = await admin
    .from("menu_item_ingredients")
    .select("menu_item_id, ingredient_id, qty_required")
    .in("menu_item_id", menuIds);

  const touched = new Set<string>();
  for (const line of items) {
    const itemRecipes = (recipes ?? []).filter((r) => r.menu_item_id === line.menuItemId);
    for (const r of itemRecipes) {
      const need = Number(r.qty_required) * line.qty;
      const { data: inv } = await admin
        .from("inventory_items")
        .select("id, qty")
        .eq("ingredient_id", r.ingredient_id)
        .eq("restaurant_id", table.restaurant_id)
        .maybeSingle();
      if (!inv || Number(inv.qty) < need) {
        const mi = menuItems.find((m) => m.id === line.menuItemId);
        return {
          ok: false,
          code: "item_unavailable",
          message: `${mi?.name ?? "Item"} just ran out — pick an alternative`,
        };
      }
      const newQty = Number(inv.qty) - need;
      const { error } = await admin
        .from("inventory_items")
        .update({ qty: newQty })
        .eq("id", inv.id)
        .gte("qty", need);
      if (error) {
        return {
          ok: false,
          code: "item_unavailable",
          message: "Stock race — please retry",
        };
      }
      await admin.from("inventory_transactions").insert({
        inventory_item_id: inv.id,
        delta: -need,
        type: "consumption",
      });
      touched.add(r.ingredient_id);
    }
  }

  const subtotal = items.reduce((sum, line) => {
    const mi = menuItems.find((m) => m.id === line.menuItemId)!;
    return sum + Number(mi.price) * line.qty;
  }, 0);
  const taxRate = Number(table.restaurants?.tax_rate ?? 0.05);
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const displayId = await allocateDisplayId(admin, table.restaurant_id);

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      restaurant_id: table.restaurant_id,
      table_id: table.id,
      qr_session_id: session.id,
      status: "placed",
      subtotal,
      tax,
      total,
      note: note ?? null,
      placed_at: new Date().toISOString(),
      display_id: displayId,
    })
    .select("id, display_id")
    .single();

  if (orderErr || !order) {
    return { ok: false, code: "order_fail", message: "Could not place order" };
  }

  const orderItems = items.map((line) => {
    const mi = menuItems.find((m) => m.id === line.menuItemId)!;
    return {
      order_id: order.id,
      menu_item_id: mi.id,
      qty: line.qty,
      unit_price: mi.price,
      status: "queued" as const,
      station: mi.station,
      priority: computePriority({
        minutesWaiting: 0,
        basePrepMin: mi.base_prep_min,
        siblingsReady: 0,
        siblingsTotal: items.length,
      }),
      eta_min: mi.current_eta_min,
      note: line.note ?? null,
    };
  });

  await admin.from("order_items").insert(orderItems);
  await recomputeAvailability(table.restaurant_id, Array.from(touched));
  await depletionCheck(table.restaurant_id, Array.from(touched));

  log("orders", "placed", {
    orderId: order.id,
    displayId: order.display_id,
    restaurantId: table.restaurant_id,
  });
  return {
    ok: true,
    data: {
      orderId: order.id,
      displayId: String(order.display_id ?? displayId),
      sessionToken,
    },
  };
}

export async function createServiceRequest(
  input: unknown
): Promise<ActionResult<{ requestId: string }>> {
  const parsed = serviceRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid request" };
  }
  const admin = createAdminClient();
  const { data: session } = await admin
    .from("qr_sessions")
    .select("table_id, tables(restaurant_id)")
    .eq("token", parsed.data.sessionToken)
    .is("ended_at", null)
    .maybeSingle();

  if (!session) {
    return { ok: false, code: "invalid_token", message: "Session expired" };
  }

  const restaurantId = (session.tables as unknown as { restaurant_id: string } | null)
    ?.restaurant_id;
  if (!restaurantId) {
    return { ok: false, code: "invalid_table", message: "Table not found" };
  }

  if (parsed.data.type === "bill") {
    await admin
      .from("tables")
      .update({ status: "bill_requested" })
      .eq("id", session.table_id);
  } else {
    await admin
      .from("tables")
      .update({ status: "needs_service" })
      .eq("id", session.table_id);
  }

  const { data: req, error } = await admin
    .from("service_requests")
    .insert({
      restaurant_id: restaurantId,
      table_id: session.table_id,
      type: parsed.data.type,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !req) {
    return { ok: false, code: "request_fail", message: "Could not create request" };
  }
  return { ok: true, data: { requestId: req.id } };
}
