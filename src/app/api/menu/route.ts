import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Public live menu snapshot for customer realtime refresh after 86 / stock changes. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: items } = await admin
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("popularity", { ascending: false });

  return NextResponse.json({ items: items ?? [] });
}
