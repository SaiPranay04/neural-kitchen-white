import { createAdminClient } from "@/lib/supabase/admin";
import { ensureTableSession } from "@/lib/actions/orders";
import { MenuClient } from "@/components/menu/MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; table?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center bg-nk-cream">
        <div>
          <h1 className="font-display text-2xl text-nk-navy">Restaurant not found</h1>
          <p className="mt-2 text-slate-500">Check the QR code or demo link.</p>
        </div>
      </main>
    );
  }

  const [{ data: categories }, { data: items }] = await Promise.all([
    admin
      .from("menu_categories")
      .select("id, name, sort")
      .eq("restaurant_id", restaurant.id)
      .order("sort"),
    admin
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("popularity", { ascending: false }),
  ]);

  const tableHint = Number(sp.table ?? 7);
  const ensured = await ensureTableSession({
    token: sp.token,
    restaurantSlug: restaurant.slug,
    tableNumber: Number.isFinite(tableHint) ? tableHint : 7,
  });

  if (!ensured.ok) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center bg-nk-cream">
        <div>
          <h1 className="font-display text-2xl text-nk-navy">No table session</h1>
          <p className="mt-2 text-slate-500">{ensured.message}</p>
          <p className="mt-2 text-xs text-slate-400">
            Run <code className="text-nk-orange">npm run seed</code> and open the printed Table QR link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <MenuClient
      slug={restaurant.slug}
      token={ensured.data.token}
      tableNumber={ensured.data.tableNumber}
      restaurantName={restaurant.name}
      categories={categories ?? []}
      items={(items ?? []) as never}
    />
  );
}
