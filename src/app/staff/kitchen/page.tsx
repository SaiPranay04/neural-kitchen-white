import { redirect } from "next/navigation";
import { getMembership, KITCHEN_ROLES, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { KitchenClient } from "@/components/kitchen/KitchenClient";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const membership = await getMembership();
  if (!membership) redirect("/staff/login");
  if (!roleAtLeast(membership.membership.role, KITCHEN_ROLES)) {
    redirect("/staff/waiter");
  }

  // Managers get the console-embedded KDS
  if (roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    redirect("/dashboard?tab=kitchen");
  }

  const restaurantId = membership.membership.restaurant_id;
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .in("status", ["placed", "accepted", "preparing", "partially_ready", "ready"]);

  const orderIds = (orders ?? []).map((o) => o.id);
  let tickets: unknown[] = [];
  if (orderIds.length) {
    const { data } = await admin
      .from("order_items")
      .select("*, menu_items(name, veg), orders(id, display_id, tables(number))")
      .in("order_id", orderIds)
      .in("status", ["queued", "accepted", "preparing", "ready"])
      .order("priority", { ascending: false });
    tickets = data ?? [];
  }

  const { data: ingredients } = await admin
    .from("ingredients")
    .select("id, name")
    .eq("restaurant_id", restaurantId)
    .in("name", ["Paneer", "Chicken", "Basmati Rice", "Mushroom"]);

  return (
    <KitchenClient
      restaurantId={restaurantId}
      initialTickets={tickets as never}
      ingredients={ingredients ?? []}
    />
  );
}
