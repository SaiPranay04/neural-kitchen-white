"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeBadge } from "@/components/shared/RealtimeBadge";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { useRealtime } from "@/hooks/useRealtime";
import { set86, updateItemStatus } from "@/lib/actions/kitchen";
import type { OrderItem } from "@/types/database";

type Ticket = OrderItem & {
  menu_items?: { name?: string; veg?: boolean } | null;
  orders?: { id: string; tables?: { number: number } | null } | null;
};

type Ingredient = { id: string; name: string };

export function KitchenClient({
  restaurantId,
  initialTickets,
  ingredients,
}: {
  restaurantId: string;
  initialTickets: Ticket[];
  ingredients: Ingredient[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/kitchen/queue?restaurantId=${restaurantId}`, {
      cache: "no-store",
    });
    if (res.ok) setTickets(await res.json());
  }, [restaurantId]);

  const rtMode = useRealtime({
    table: "order_items",
    onChange: refresh,
    pollMs: 4000,
  });

  const columns = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => Number(b.priority) - Number(a.priority));
    return {
      new: sorted.filter((t) => t.status === "queued" || t.status === "accepted"),
      preparing: sorted.filter((t) => t.status === "preparing"),
      ready: sorted.filter((t) => t.status === "ready"),
    };
  }, [tickets]);

  function advance(item: Ticket) {
    // KDS: Accept jumps queued → preparing (one tap). accepted → preparing still supported.
    const next =
      item.status === "queued" || item.status === "accepted"
        ? "preparing"
        : item.status === "preparing"
          ? "ready"
          : null;
    if (!next) return;
    startTransition(async () => {
      const result = await updateItemStatus({ itemId: item.id, next });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(`${item.menu_items?.name} → ${next}`);
        refresh();
      }
    });
  }

  function eightySix(ingredientId: string, name: string) {
    startTransition(async () => {
      const result = await set86({ ingredientId });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(
          `86'd ${name}. Affected: ${result.data.affectedDishes.join(", ") || "none"}` +
            (result.data.substitutes?.length
              ? ` · Try: ${result.data.substitutes
                  .flatMap((s) => s.alts.map((a) => a.name))
                  .slice(0, 3)
                  .join(", ")}`
              : "")
        );
        refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-nk-cream px-4 py-4 lg:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Kitchen display · Supabase Auth
          </p>
          <h1 className="font-display text-3xl text-nk-navy">Live queue</h1>
          <div className="mt-2">
            <RealtimeBadge mode={rtMode} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SignOutButton />
          {ingredients.slice(0, 4).map((ing) => (
            <Button
              key={ing.id}
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={() => eightySix(ing.id, ing.name)}
            >
              86 {ing.name}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {(
          [
            ["New", columns.new],
            ["Preparing", columns.preparing],
            ["Ready", columns.ready],
          ] as const
        ).map(([title, list]) => (
          <section key={title} className="surface min-h-[60vh] p-3">
            <h2 className="mb-3 font-display text-xl text-nk-navy">
              {title}{" "}
              <span className="font-mono-num text-sm text-slate-500">{list.length}</span>
            </h2>
            <div className="space-y-3">
              {list.map((item) => (
                <article key={item.id} className="glow-in rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-xl text-nk-navy">
                        T{item.orders?.tables?.number ?? "?"}
                        {(item.orders as { display_id?: string } | null | undefined)
                          ?.display_id
                          ? ` · #${(item.orders as { display_id?: string }).display_id}`
                          : ""}
                      </p>
                      <p className="text-lg text-slate-100">
                        {item.menu_items?.name} × {item.qty}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge>{item.station}</Badge>
                        <span className="font-mono-num text-xs text-amber-300">
                          P{item.priority}
                        </span>
                      </div>
                    </div>
                    {(item.status === "queued" ||
                      item.status === "accepted" ||
                      item.status === "preparing") && (
                      <Button size="sm" disabled={pending} onClick={() => advance(item)}>
                        {item.status === "queued"
                          ? "Accept"
                          : item.status === "accepted"
                            ? "Start"
                            : "Ready"}
                      </Button>
                    )}
                  </div>
                </article>
              ))}
              {!list.length && (
                <p className="py-10 text-center text-slate-500">All caught up</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
