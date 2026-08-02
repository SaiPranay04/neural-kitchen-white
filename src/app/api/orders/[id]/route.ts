import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = createAdminClient();
  const resolvedParams = await params;
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*, menu_items(name, veg, station)), tables(number)")
    .eq("id", resolvedParams.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
