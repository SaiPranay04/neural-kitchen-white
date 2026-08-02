import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMembership(restaurantId?: string) {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;

  let query = supabase
    .from("restaurant_members")
    .select("id, restaurant_id, role, restaurants(id, name, slug)")
    .eq("user_id", user.id);

  if (restaurantId) query = query.eq("restaurant_id", restaurantId);

  // Prefer super_admin membership if multiple
  const { data: rows } = await query;
  if (!rows?.length) return null;

  const data =
    rows.find((r) => r.role === "super_admin") ??
    rows.find((r) => r.role === "restaurant_admin") ??
    rows[0];

  const restaurantsRaw = data.restaurants as
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
  const restaurants = Array.isArray(restaurantsRaw)
    ? restaurantsRaw[0] ?? null
    : restaurantsRaw;

  return {
    user,
    membership: {
      id: data.id as string,
      restaurant_id: data.restaurant_id as string,
      role: data.role as MemberRole,
      restaurants,
    },
  };
}

export function roleAtLeast(role: MemberRole, allowed: MemberRole[]) {
  return allowed.includes(role);
}

export const MANAGER_ROLES: MemberRole[] = [
  "super_admin",
  "restaurant_admin",
  "manager",
];
export const KITCHEN_ROLES: MemberRole[] = [
  "super_admin",
  "restaurant_admin",
  "manager",
  "kitchen",
];
export const WAITER_ROLES: MemberRole[] = [
  "super_admin",
  "restaurant_admin",
  "manager",
  "waiter",
];
