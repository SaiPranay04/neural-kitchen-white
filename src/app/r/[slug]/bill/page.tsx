import { createAdminClient } from "@/lib/supabase/admin";
import { BillClient } from "@/components/order/BillClient";

export const dynamic = "force-dynamic";

export default async function BillPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string; token?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  if (!sp.orderId) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500 bg-nk-cream">
        Missing order
      </main>
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*, order_items(*, menu_items(name)), payments(id)")
    .eq("id", sp.orderId)
    .maybeSingle();

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500 bg-nk-cream">
        Bill not found
      </main>
    );
  }

  const paid = Array.isArray(order.payments)
    ? order.payments.length > 0
    : !!order.payments;

  return (
    <BillClient
      slug={slug}
      token={sp.token ?? ""}
      orderId={order.id}
      displayId={order.display_id ?? null}
      subtotal={Number(order.subtotal)}
      tax={Number(order.tax)}
      total={Number(order.total)}
      paid={paid}
      items={(order.order_items ?? []) as never}
    />
  );
}
