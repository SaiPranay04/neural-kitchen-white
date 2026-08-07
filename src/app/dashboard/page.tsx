import { redirect } from "next/navigation";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { assignableRolesFor, canViewUsersTab } from "@/lib/rbac";
import { loadRestaurantAnalytics } from "@/lib/analytics/load";
import { loadInventoryBundle } from "@/lib/inventory/load";
import { createAdminClient } from "@/lib/supabase/admin";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { formatDashboardDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { tab?: string };

const SHELL_TABS = new Set([
  "overview",
  "analytics",
  "orders",
  "tables",
  "inventory",
  "staff",
  "kitchen",
  "waiter",
]);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Search>;
}) {
  const membership = await getMembership();
  if (!membership) redirect("/staff/login");
  if (!roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    redirect(
      membership.membership.role === "kitchen" ? "/staff/kitchen" : "/staff/waiter"
    );
  }

  const sp = (await searchParams) ?? {};
  const canUsers = canViewUsersTab(membership.membership.role);
  type ShellTab =
    | "overview"
    | "analytics"
    | "orders"
    | "tables"
    | "inventory"
    | "staff"
    | "kitchen"
    | "waiter";
  let initialTab: ShellTab = "overview";
  if (sp.tab && SHELL_TABS.has(sp.tab)) initialTab = sp.tab as ShellTab;
  if (initialTab === "staff" && !canUsers) initialTab = "overview";

  const restaurantId = membership.membership.restaurant_id;
  const [{ analytics, ops }, inventory, { data: kitchenIngredients }] = await Promise.all([
    loadRestaurantAnalytics(restaurantId),
    loadInventoryBundle(restaurantId),
    createAdminClient()
      .from("ingredients")
      .select("id, name")
      .eq("restaurant_id", restaurantId)
      .in("name", ["Paneer", "Chicken", "Basmati Rice", "Mushroom"]),
  ]);

  const actorName =
    (membership.user.user_metadata?.full_name as string | undefined) ||
    membership.user.email?.split("@")[0] ||
    "Manager";

  return (
    <ExecutiveDashboard
      mode="live"
      analytics={analytics}
      ops={ops}
      inventory={inventory}
      canViewUsers={canUsers}
      actorName={actorName}
      actorRole={membership.membership.role}
      assignableRoles={assignableRolesFor(membership.membership.role)}
      kitchenIngredients={kitchenIngredients ?? []}
      initialTab={initialTab}
      dateLabel={formatDashboardDate()}
    />
  );
}
