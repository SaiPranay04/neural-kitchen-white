import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffForRestaurant } from "@/lib/api/staffGate";

export async function GET(req: Request) {
  const restaurantId = new URL(req.url).searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const staff = await requireStaffForRestaurant(restaurantId);
  if (!staff) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [{ data: tables }, { data: requests }, { data: orders }] = await Promise.all([
    admin.from("tables").select("*").eq("restaurant_id", restaurantId).order("number"),
    admin
      .from("service_requests")
      .select("*, tables(number)")
      .eq("restaurant_id", restaurantId)
      .neq("status", "resolved")
      .order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .in("status", ["ready", "partially_ready", "preparing", "accepted", "placed"]),
  ]);

  const orderIds = (orders ?? []).map((o) => o.id);
  let ready: unknown[] = [];
  if (orderIds.length) {
    const { data } = await admin
      .from("order_items")
      .select("*, menu_items(name), orders(id, display_id, tables(number))")
      .in("order_id", orderIds)
      .eq("status", "ready");
    ready = data ?? [];
  }

  return NextResponse.json({
    tables: tables ?? [],
    requests: requests ?? [],
    ready,
  });
}
