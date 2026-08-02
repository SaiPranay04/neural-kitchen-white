"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { adjustInventorySchema } from "@/lib/schemas/orders";
import { recomputeAvailability } from "@/lib/engine/recompute";
import type { ActionResult } from "@/types/database";

export async function adjustInventory(
  input: unknown
): Promise<ActionResult<{ qty: number }>> {
  const parsed = adjustInventorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid inventory adjust" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, MANAGER_ROLES.concat(["kitchen"]))) {
    return { ok: false, code: "unauthorized", message: "Manager access required" };
  }

  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("inventory_items")
    .select("*")
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

  await admin.from("inventory_items").update({ qty: nextQty }).eq("id", inv.id);
  await admin.from("inventory_transactions").insert({
    inventory_item_id: inv.id,
    delta: parsed.data.delta,
    type: parsed.data.type,
  });

  await recomputeAvailability(membership.membership.restaurant_id, [
    inv.ingredient_id,
  ]);

  return { ok: true, data: { qty: nextQty } };
}
