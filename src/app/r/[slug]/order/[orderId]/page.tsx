import { createAdminClient } from "@/lib/supabase/admin";
import { OrderTracker } from "@/components/order/OrderTracker";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug, orderId } = await params;
  const sp = await searchParams;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*, order_items(*, menu_items(name, veg, station)), tables(number)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500 bg-nk-cream">
        Order not found
      </main>
    );
  }

  return (
    <OrderTracker
      initialOrder={order as never}
      token={sp.token ?? ""}
      slug={slug}
    />
  );
}
