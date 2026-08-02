import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Unique-ish 3-digit code for customer tracking (100–999). */
export async function allocateDisplayId(
  admin: SupabaseClient,
  restaurantId: string
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const code = String(100 + Math.floor(Math.random() * 900));
    const { data } = await admin
      .from("orders")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("display_id", code)
      .in("status", [
        "draft",
        "placed",
        "accepted",
        "preparing",
        "partially_ready",
        "ready",
        "served",
        "billed",
      ])
      .limit(1)
      .maybeSingle();
    if (!data) return code;
  }
  return String(Date.now() % 900).padStart(3, "0");
}
