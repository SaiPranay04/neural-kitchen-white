import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildAnalytics,
  type AnalyticsBundle,
  type AnalyticsOrder,
} from "@/lib/analytics/compute";
import type { DashboardOps } from "@/lib/analytics/types";

export type { DashboardOps };

export async function loadRestaurantAnalytics(restaurantId: string): Promise<{
  analytics: AnalyticsBundle;
  ops: DashboardOps;
}> {
  const admin = createAdminClient();

  const [
    { data: restaurant },
    { data: orders },
    { data: tables },
    { data: categories },
    { data: inventory },
    { data: notifications },
    { data: activityLogs },
  ] = await Promise.all([
    admin.from("restaurants").select("name").eq("id", restaurantId).single(),
    admin
      .from("orders")
      .select(
        "id, total, status, placed_at, display_id, tables(number), order_items(qty, unit_price, status, started_at, ready_at, menu_items(name, category_id))"
      )
      .eq("restaurant_id", restaurantId)
      .not("placed_at", "is", null)
      .order("placed_at", { ascending: false })
      .limit(800),
    admin
      .from("tables")
      .select("id, number, status")
      .eq("restaurant_id", restaurantId)
      .order("number"),
    admin
      .from("menu_categories")
      .select("id, name")
      .eq("restaurant_id", restaurantId),
    admin
      .from("inventory_items")
      .select("qty, low_threshold")
      .eq("restaurant_id", restaurantId),
    admin
      .from("notifications")
      .select("title, body, created_at, severity")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("activity_logs")
      .select("action, entity, created_at, meta")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const orderIds = (orders ?? []).map((o) => o.id);
  let feedback: { rating: number }[] = [];
  if (orderIds.length) {
    const { data: fb } = await admin
      .from("feedback")
      .select("rating")
      .in("order_id", orderIds.slice(0, 200));
    feedback = (fb ?? []).map((f) => ({ rating: Number(f.rating) }));
  }

  const analytics = buildAnalytics({
    restaurantName: restaurant?.name ?? "Restaurant",
    orders: (orders ?? []) as unknown as AnalyticsOrder[],
    tablesCount: tables?.length ?? 0,
    feedback,
    inventory: (inventory ?? []).map((i) => ({
      qty: Number(i.qty),
      reorder_level: i.low_threshold != null ? Number(i.low_threshold) : 15,
    })),
    notifications: notifications ?? [],
    categories: categories ?? [],
    activityLogs: activityLogs ?? [],
  });

  const liveOrders = (orders ?? []).slice(0, 12).map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    tableNumber: (o.tables as { number?: number } | null)?.number ?? null,
    displayId: o.display_id ?? null,
  }));

  const activeOrderCount = liveOrders.filter((o) =>
    ["placed", "accepted", "preparing", "partially_ready", "ready", "billed"].includes(
      o.status
    )
  ).length;

  const tableRows = (tables ?? []).map((t) => ({
    id: t.id,
    number: t.number,
    status: t.status,
  }));

  return {
    analytics,
    ops: {
      liveOrders,
      tables: tableRows,
      activeOrderCount,
      occupiedTables: tableRows.filter((t) => t.status === "occupied").length,
    },
  };
}
