import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/types/database";

/** Staff-only gate for poll APIs (kitchen/waiter). */
export async function requireStaffForRestaurant(restaurantId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("role, restaurant_id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!membership) return null;
  return {
    userId: user.id,
    role: membership.role as MemberRole,
    restaurantId: membership.restaurant_id as string,
  };
}
