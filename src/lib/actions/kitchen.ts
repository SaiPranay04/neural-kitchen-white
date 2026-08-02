"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, KITCHEN_ROLES, roleAtLeast } from "@/lib/auth";
import {
  pauseItemSchema,
  set86Schema,
  updateItemStatusSchema,
} from "@/lib/schemas/orders";
import { canTransitionItem, deriveOrderStatus } from "@/lib/transitions";
import { recomputeAvailability } from "@/lib/engine/recompute";
import { rankSubstitutes } from "@/lib/engine";
import type { ActionResult, ItemStatus } from "@/types/database";

export async function updateItemStatus(
  input: unknown
): Promise<ActionResult<{ orderStatus: string }>> {
  const parsed = updateItemStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid status update" };
  }

  const membership = await getMembership();
  if (!membership) {
    return { ok: false, code: "unauthorized", message: "Login required" };
  }

  const role = membership.membership.role;
  const allowed =
    parsed.data.next === "served"
      ? (["restaurant_admin", "manager", "waiter", "kitchen"] as const)
      : KITCHEN_ROLES;
  if (!roleAtLeast(role, [...allowed])) {
    return { ok: false, code: "unauthorized", message: "Insufficient role" };
  }
  const admin = createAdminClient();

  const { data: item } = await admin
    .from("order_items")
    .select("*, orders(id, restaurant_id, status)")
    .eq("id", parsed.data.itemId)
    .maybeSingle();

  if (!item) {
    return { ok: false, code: "not_found", message: "Item not found" };
  }

  const order = item.orders as { id: string; restaurant_id: string; status: string } | null;
  if (!order || order.restaurant_id !== membership.membership.restaurant_id) {
    return { ok: false, code: "forbidden", message: "Wrong restaurant" };
  }

  if (!canTransitionItem(item.status as ItemStatus, parsed.data.next, role)) {
    return { ok: false, code: "invalid_transition", message: `Cannot go ${item.status} → ${parsed.data.next}` };
  }

  const patch: Record<string, unknown> = { status: parsed.data.next };
  if (parsed.data.next === "preparing") patch.started_at = new Date().toISOString();
  if (parsed.data.next === "ready") patch.ready_at = new Date().toISOString();

  await admin.from("order_items").update(patch).eq("id", item.id);

  const { data: siblings } = await admin
    .from("order_items")
    .select("status")
    .eq("order_id", order.id);

  const orderStatus = deriveOrderStatus(
    (siblings ?? []).map((s) => s.status as ItemStatus)
  );
  await admin.from("orders").update({ status: orderStatus }).eq("id", order.id);

  return { ok: true, data: { orderStatus } };
}

export async function pauseMenuItem(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = pauseItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid pause request" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, KITCHEN_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Kitchen access required" };
  }

  const admin = createAdminClient();
  await admin
    .from("menu_items")
    .update({ is_paused: parsed.data.paused })
    .eq("id", parsed.data.menuItemId)
    .eq("restaurant_id", membership.membership.restaurant_id);

  await recomputeAvailability(membership.membership.restaurant_id);
  return { ok: true, data: { ok: true } };
}

export async function set86(
  input: unknown
): Promise<
  ActionResult<{
    affectedDishes: string[];
    substitutes: { for: string; alts: { id: string; name: string }[] }[];
  }>
> {
  const parsed = set86Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid 86 request" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, KITCHEN_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Kitchen access required" };
  }

  const admin = createAdminClient();
  const restaurantId = membership.membership.restaurant_id;

  const { data: inv } = await admin
    .from("inventory_items")
    .select("id, qty, ingredients(name)")
    .eq("ingredient_id", parsed.data.ingredientId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!inv) {
    return { ok: false, code: "not_found", message: "Ingredient not in inventory" };
  }

  await admin.from("inventory_items").update({ qty: 0 }).eq("id", inv.id);
  await admin.from("inventory_transactions").insert({
    inventory_item_id: inv.id,
    delta: -Number(inv.qty),
    type: "waste",
  });

  await recomputeAvailability(restaurantId, [parsed.data.ingredientId]);

  const { data: recipes } = await admin
    .from("menu_item_ingredients")
    .select("menu_item_id")
    .eq("ingredient_id", parsed.data.ingredientId);

  const affectedIds = (recipes ?? []).map((r) => r.menu_item_id);
  const { data: affected } = await admin
    .from("menu_items")
    .select("id, name, category_id, price, availability, current_eta_min, popularity")
    .in("id", affectedIds.length ? affectedIds : ["00000000-0000-0000-0000-000000000000"]);

  const { data: allMenu } = await admin
    .from("menu_items")
    .select("id, name, category_id, price, availability, current_eta_min, popularity")
    .eq("restaurant_id", restaurantId);

  const substitutes = (affected ?? []).map((dish) => ({
    for: dish.name,
    alts: rankSubstitutes(dish, allMenu ?? []).map((a) => ({
      id: a.id,
      name: a.name,
    })),
  }));

  const ingredientName =
    (inv.ingredients as { name?: string } | null)?.name ?? "Ingredient";

  await admin.from("notifications").insert({
    restaurant_id: restaurantId,
    audience_role: "manager",
    title: `86'd: ${ingredientName}`,
    body: `${(affected ?? []).map((d) => d.name).join(", ") || "Dishes"} marked unavailable. Substitutes suggested.`,
    severity: "alert",
  });

  await admin.from("activity_logs").insert({
    restaurant_id: restaurantId,
    actor: membership.user.email,
    action: "86",
    entity: ingredientName,
    meta: { affected: affectedIds, substitutes },
  });

  return {
    ok: true,
    data: {
      affectedDishes: (affected ?? []).map((d) => d.name),
      substitutes,
    },
  };
}
