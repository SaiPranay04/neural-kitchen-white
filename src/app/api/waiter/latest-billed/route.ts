import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const restaurantId = new URL(req.url).searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("status", "billed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "none" }, { status: 404 });
  return NextResponse.json({ orderId: data.id });
}
