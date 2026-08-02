import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeAvailability,
  computeCongestion,
  computeEta,
  computePortions,
  computePriority,
  consumptionRate,
  hoursToDepletion,
  loadFactor,
} from "@/lib/engine";
import { log } from "@/lib/log";

export async function recomputeAvailability(
  restaurantId: string,
  touchedIngredientIds?: string[]
) {
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("settings")
    .eq("id", restaurantId)
    .single();

  const stations: Record<string, number> =
    restaurant?.settings?.stations ?? { tandoor: 4, wok: 6, fryer: 4, cold: 8 };

  const { data: openItems } = await admin
    .from("order_items")
    .select("id, station, status, order_id, created_at, menu_item_id, menu_items(base_prep_min)")
    .in("status", ["queued", "accepted", "preparing"])
    .eq("orders.restaurant_id", restaurantId);

  type ActiveItem = {
    id: string;
    station: string;
    status: string;
    order_id: string;
    created_at: string;
    menu_item_id: string;
    menu_items?: { base_prep_min?: number } | null;
  };

  let activeItems: ActiveItem[] = (openItems as ActiveItem[] | null) ?? [];
  if (!openItems) {
    const { data: orders } = await admin
      .from("orders")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .in("status", ["placed", "accepted", "preparing", "partially_ready", "ready"]);
    const orderIds = (orders ?? []).map((o) => o.id);
    if (orderIds.length) {
      const { data } = await admin
        .from("order_items")
        .select("id, station, status, order_id, created_at, menu_item_id")
        .in("order_id", orderIds)
        .in("status", ["queued", "accepted", "preparing"]);
      activeItems = (data as ActiveItem[] | null) ?? [];
    } else {
      activeItems = [];
    }
  }

  const stationLoads: Record<string, number> = {};
  for (const item of activeItems) {
    stationLoads[item.station] = (stationLoads[item.station] ?? 0) + 1;
  }

  const menuQuery = admin.from("menu_items").select("*").eq("restaurant_id", restaurantId);
  const { data: menuItems } = await menuQuery;
  if (!menuItems?.length) return;

  const { data: recipes } = await admin
    .from("menu_item_ingredients")
    .select("menu_item_id, ingredient_id, qty_required");

  const { data: inventory } = await admin
    .from("inventory_items")
    .select("id, ingredient_id, qty")
    .eq("restaurant_id", restaurantId);

  const invByIngredient = new Map(
    (inventory ?? []).map((i) => [i.ingredient_id, i])
  );

  const recipeByItem = new Map<string, { ingredientId: string; qtyRequired: number; stock: number }[]>();
  for (const r of recipes ?? []) {
    if (touchedIngredientIds?.length && !touchedIngredientIds.includes(r.ingredient_id)) {
      // still include full recipes for items that use touched ingredients
    }
    const inv = invByIngredient.get(r.ingredient_id);
    const list = recipeByItem.get(r.menu_item_id) ?? [];
    list.push({
      ingredientId: r.ingredient_id,
      qtyRequired: Number(r.qty_required),
      stock: Number(inv?.qty ?? 0),
    });
    recipeByItem.set(r.menu_item_id, list);
  }

  const itemsToUpdate = touchedIngredientIds?.length
    ? menuItems.filter((m) => {
        const recipe = recipeByItem.get(m.id) ?? [];
        return recipe.some((r) => touchedIngredientIds.includes(r.ingredientId));
      })
    : menuItems;

  for (const item of itemsToUpdate) {
    const recipe = recipeByItem.get(item.id) ?? [];
    const portions = computePortions(recipe);
    const congestion = computeCongestion(
      stationLoads[item.station] ?? 0,
      stations[item.station] ?? 4
    );
    const avail = computeAvailability({
      isPaused: item.is_paused,
      portions,
      congestion,
    });
    const queueAhead = stationLoads[item.station] ?? 0;
    const eta = computeEta({
      basePrepMin: item.base_prep_min,
      complexity: Number(item.complexity),
      queueAhead,
      loadFactor: loadFactor(queueAhead, stations[item.station] ?? 4),
    });

    await admin
      .from("menu_items")
      .update({
        availability: avail.availability,
        portions_left: avail.portionsLeft === 999 ? 999 : avail.portionsLeft,
        current_eta_min: eta,
        explanation: avail.explanation,
      })
      .eq("id", item.id);
  }

  // Update priorities on open items
  for (const item of activeItems) {
    const waiting = (Date.now() - new Date(item.created_at).getTime()) / 60000;
    const siblings = activeItems.filter((i) => i.order_id === item.order_id);
    const readySiblings = siblings.filter((i) => i.status === "ready").length;
    const base =
      (item as { menu_items?: { base_prep_min?: number } }).menu_items?.base_prep_min ?? 12;
    const priority = computePriority({
      minutesWaiting: waiting,
      basePrepMin: base,
      siblingsReady: readySiblings,
      siblingsTotal: siblings.length,
    });
    await admin.from("order_items").update({ priority, eta_min: Math.round(12 + waiting) }).eq("id", item.id);
  }

  log("engine", "recomputeAvailability", {
    restaurantId,
    updated: itemsToUpdate.length,
  });
}

export async function depletionCheck(restaurantId: string, ingredientIds: string[]) {
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("settings")
    .eq("id", restaurantId)
    .single();
  const closeHours = restaurant?.settings?.close_hours ?? 4;

  for (const ingredientId of ingredientIds) {
    const { data: inv } = await admin
      .from("inventory_items")
      .select("id, qty, ingredients(name)")
      .eq("ingredient_id", ingredientId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (!inv) continue;

    const { data: txns } = await admin
      .from("inventory_transactions")
      .select("delta, created_at")
      .eq("inventory_item_id", inv.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const rate = consumptionRate(txns ?? [], 3);
    const hours = hoursToDepletion(Number(inv.qty), rate);
    if (hours < closeHours) {
      const name =
        (inv.ingredients as { name?: string } | null)?.name ?? "Ingredient";
      await admin.from("notifications").insert({
        restaurant_id: restaurantId,
        audience_role: "manager",
        title: `${name} running low`,
        body: `Estimated depletion in ~${Math.round(hours * 60)} minutes at current rate.`,
        severity: "warning",
      });
    }
  }
}
