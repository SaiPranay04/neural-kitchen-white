import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffForRestaurant } from "@/lib/api/staffGate";

export async function GET(req: Request) {
  const restaurantId = new URL(req.url).searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "missing restaurantId" }, { status: 400 });
  }

  const staff = await requireStaffForRestaurant(restaurantId);
  if (!staff) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .in("status", ["placed", "accepted", "preparing", "partially_ready", "ready"]);

  const orderIds = (orders ?? []).map((o) => o.id);
  if (!orderIds.length) return NextResponse.json([]);

  const { data } = await admin
    .from("order_items")
    .select("*, menu_items(name, veg), orders(id, display_id, tables(number))")
    .in("order_id", orderIds)
    .in("status", ["queued", "accepted", "preparing", "ready"])
    .order("priority", { ascending: false });

  return NextResponse.json(data ?? []);
}
