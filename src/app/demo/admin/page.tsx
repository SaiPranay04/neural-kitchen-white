import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { buildPromoAnalytics, buildPromoOps } from "@/lib/analytics/promo";
import { buildPromoInventory } from "@/lib/inventory/promo";
import { formatDashboardDate } from "@/lib/utils";

/** Promo showcase — same executive UI as /dashboard, with sample data (no auth). */
export default function DemoAdminPage() {
  return (
    <ExecutiveDashboard
      mode="promo"
      analytics={buildPromoAnalytics()}
      ops={buildPromoOps()}
      inventory={buildPromoInventory()}
      actorName="Sai Pranay"
      initialTab="overview"
      dateLabel={formatDashboardDate()}
    />
  );
}
