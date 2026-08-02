import { redirect } from "next/navigation";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { canViewUsersTab } from "@/lib/rbac";
import { loadRestaurantAnalytics } from "@/lib/analytics/load";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { formatDashboardDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { tab?: string };

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
  const initialTab = sp.tab === "analytics" ? "analytics" : "overview";

  const { analytics, ops } = await loadRestaurantAnalytics(
    membership.membership.restaurant_id
  );

  const actorName =
    (membership.user.user_metadata?.full_name as string | undefined) ||
    membership.user.email?.split("@")[0] ||
    "Manager";

  return (
    <ExecutiveDashboard
      mode="live"
      analytics={analytics}
      ops={ops}
      canViewUsers={canViewUsersTab(membership.membership.role)}
      actorName={actorName}
      initialTab={initialTab}
      dateLabel={formatDashboardDate()}
    />
  );
}
