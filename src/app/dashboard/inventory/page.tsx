import { redirect } from "next/navigation";
import Link from "next/link";
import { getMembership, MANAGER_ROLES, roleAtLeast } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryActions } from "@/components/dashboard/InventoryActions";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, MANAGER_ROLES)) {
    redirect("/staff/login");
  }

  const admin = createAdminClient();
  const { data: items } = await admin
    .from("inventory_items")
    .select("*, ingredients(name, unit)")
    .eq("restaurant_id", membership.membership.restaurant_id)
    .order("qty");

  return (
    <div className="mx-auto max-w-4xl bg-nk-cream px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl text-nk-navy">Inventory risk</h1>
        <Link href="/dashboard" className="text-sm text-nk-navy">
          ← Command centre
        </Link>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Stock is live-decremented on every order. Paneer is seeded low for the 86 demo.
      </p>
      <div className="space-y-3">
        {(items ?? []).map((item) => {
          const low = Number(item.qty) <= Number(item.low_threshold);
          return (
            <div key={item.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-nk-navy">
                  {(item.ingredients as { name?: string } | null)?.name}
                </p>
                <p className={`font-mono-num text-sm ${low ? "text-amber-300" : "text-slate-500"}`}>
                  {item.qty} {(item.ingredients as { unit?: string } | null)?.unit}
                  {low ? " · below threshold" : ""}
                </p>
              </div>
              <InventoryActions inventoryItemId={item.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
