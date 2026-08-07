import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildInventoryBundle, type RawRecipe, type RawStock, type RawTxn } from "@/lib/inventory/compute";
import type { InventoryBundle } from "@/lib/inventory/types";

export async function loadInventoryBundle(restaurantId: string): Promise<InventoryBundle> {
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("name")
    .eq("id", restaurantId)
    .single();

  // Prefer enriched columns; fall back if migration 004 not applied yet
  let invRows: Record<string, unknown>[] | null = null;
  const enriched = await admin
    .from("inventory_items")
    .select(
      "id, qty, low_threshold, reorder_qty, ingredient_id, ingredients(id, name, unit, avg_cost, category_name, department_name)"
    )
    .eq("restaurant_id", restaurantId)
    .order("qty");

  if (!enriched.error) {
    invRows = (enriched.data as Record<string, unknown>[]) ?? [];
  } else {
    const bare = await admin
      .from("inventory_items")
      .select("id, qty, low_threshold, reorder_qty, ingredient_id, ingredients(id, name, unit)")
      .eq("restaurant_id", restaurantId)
      .order("qty");
    invRows = (bare.data as Record<string, unknown>[]) ?? [];
  }

  const stock: RawStock[] = (invRows ?? []).map((row) => {
    const ing = row.ingredients as {
      id?: string;
      name?: string;
      unit?: string;
      avg_cost?: number;
      category_name?: string;
      department_name?: string;
    } | null;
    return {
      id: String(row.id),
      ingredientId: String(row.ingredient_id ?? ing?.id ?? ""),
      name: ing?.name ?? "Item",
      unit: ing?.unit ?? "g",
      qty: Number(row.qty),
      lowThreshold: Number(row.low_threshold),
      reorderQty: Number(row.reorder_qty ?? 0),
      avgCost: ing?.avg_cost != null ? Number(ing.avg_cost) : null,
      categoryName: ing?.category_name ?? null,
      departmentName: ing?.department_name ?? null,
    };
  });

  const { data: menu } = await admin
    .from("menu_items")
    .select("id, name, price, popularity, menu_item_ingredients(qty_required, ingredients(name, unit))")
    .eq("restaurant_id", restaurantId);

  const recipes: RawRecipe[] = (menu ?? []).map((m) => {
    const lines = (
      (m.menu_item_ingredients as {
        qty_required: number;
        ingredients: { name?: string; unit?: string } | null;
      }[]) ?? []
    ).map((l) => ({
      ingredientName: l.ingredients?.name ?? "Item",
      qtyRequired: Number(l.qty_required),
      unit: l.ingredients?.unit ?? "g",
    }));
    return {
      menuItemId: m.id,
      name: m.name,
      price: Number(m.price),
      popularity: Number(m.popularity ?? 0),
      lines,
    };
  });

  const invIds = stock.map((s) => s.id);
  let transactions: RawTxn[] = [];
  if (invIds.length) {
    const { data: txns } = await admin
      .from("inventory_transactions")
      .select(
        "id, delta, type, created_at, inventory_item_id, inventory_items(ingredients(name, unit))"
      )
      .in("inventory_item_id", invIds)
      .order("created_at", { ascending: false })
      .limit(80);

    transactions = (txns ?? []).map((t) => {
      const invJoin = t.inventory_items as {
        ingredients?: { name?: string; unit?: string } | null;
      } | null;
      return {
        id: t.id,
        ingredientName: invJoin?.ingredients?.name ?? "Item",
        unit: invJoin?.ingredients?.unit ?? "g",
        delta: Number(t.delta),
        type: t.type as string,
        createdAt: t.created_at as string,
        unitCost: null,
      };
    });
  }

  return buildInventoryBundle({
    restaurantName: restaurant?.name ?? "Restaurant",
    stock,
    recipes,
    transactions,
  });
}
