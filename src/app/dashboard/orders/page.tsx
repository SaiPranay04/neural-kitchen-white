import Link from "next/link";
import { redirect } from "next/navigation";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    redirect("/staff/login");
  }

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*, tables(number)")
    .eq("restaurant_id", membership.membership.restaurant_id)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl text-nk-navy">Orders</h1>
        <Link href="/dashboard" className="text-sm text-nk-navy">
          ← Command centre
        </Link>
      </div>
      <div className="space-y-2">
        {(orders ?? []).map((order) => (
          <div
            key={order.id}
            className="surface flex items-center justify-between px-4 py-3 text-sm"
          >
            <div>
              <p className="text-nk-navy">
                Table {(order.tables as { number?: number } | null)?.number}
              </p>
              <p className="capitalize text-slate-500">
                {order.status.replace("_", " ")}
              </p>
            </div>
            <span className="font-mono-num text-nk-navy">
              {formatINR(Number(order.total))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
