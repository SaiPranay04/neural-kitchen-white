import { redirect } from "next/navigation";

/** Analytics is merged into the executive dashboard Overview + Analytics tabs. */
export default function AnalyticsRedirectPage() {
  redirect("/dashboard?tab=analytics");
}
