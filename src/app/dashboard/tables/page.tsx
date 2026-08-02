import Link from "next/link";
import { redirect } from "next/navigation";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusDot } from "@/components/shared/StatusDot";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    redirect("/staff/login");
  }

  const admin = createAdminClient();
  const { data: tables } = await admin
    .from("tables")
    .select("*")
    .eq("restaurant_id", membership.membership.restaurant_id)
    .order("number");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl text-nk-navy">Tables</h1>
        <Link href="/dashboard" className="text-sm text-nk-navy">
          ← Command centre
        </Link>
      </div>
      <div className="space-y-2">
        {(tables ?? []).map((table) => (
          <div key={table.id} className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <StatusDot status={table.status} />
              <span className="font-display text-xl text-nk-navy">T{table.number}</span>
              <span className="text-sm capitalize text-slate-500">
                {table.status.replace("_", " ")}
              </span>
            </div>
            <a
              className="font-mono-num text-xs text-nk-navy"
              href={`${appUrl}/r/spice-garden/t/${table.qr_token}`}
              target="_blank"
              rel="noreferrer"
            >
              Open QR session
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
