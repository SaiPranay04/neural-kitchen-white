import { redirect } from "next/navigation";
import { getMembership, WAITER_ROLES, roleAtLeast } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { WaiterClient } from "@/components/waiter/WaiterClient";

export const dynamic = "force-dynamic";

export default async function WaiterPage() {
  const membership = await getMembership();
  if (!membership) redirect("/staff/login");
  if (!roleAtLeast(membership.membership.role, WAITER_ROLES)) {
    redirect("/staff/kitchen");
  }

  const restaurantId = membership.membership.restaurant_id;
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

  return (
    <WaiterClient
      restaurantId={restaurantId}
      initialTables={(tables ?? []) as never}
      initialRequests={(requests ?? []) as never}
      initialReady={ready as never}
    />
  );
}
