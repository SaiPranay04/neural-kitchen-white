"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeBadge } from "@/components/shared/RealtimeBadge";
import { useCart } from "@/hooks/useCart";
import { useRealtime } from "@/hooks/useRealtime";
import { formatINR, formatMins } from "@/lib/utils";
import type { MenuItem } from "@/types/database";

type Category = { id: string; name: string; sort: number };

type AiRec = {
  item_id: string;
  reason: string;
  name?: string;
  price?: number;
  veg?: boolean;
  availability?: string;
};

export function MenuClient({
  slug,
  token,
  tableNumber,
  restaurantName,
  categories,
  items,
}: {
  slug: string;
  token: string;
  tableNumber: number;
  restaurantName: string;
  categories: Category[];
  items: MenuItem[];
}) {
  const router = useRouter();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [liveItems, setLiveItems] = useState(items);
  const [filter, setFilter] = useState<"all" | "veg">("all");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState("desserts");
  const [aiResult, setAiResult] = useState<{
    message: string;
    recommendations: AiRec[];
    fallback?: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshMenu = useCallback(async () => {
    const res = await fetch(`/api/menu?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.items)) setLiveItems(data.items);
  }, [slug]);

  const rtMode = useRealtime({
    table: "menu_items",
    onChange: refreshMenu,
    pollMs: 8000,
  });

  useEffect(() => {
    setMounted(true);
    useCart.getState().setSession(slug, token);
  }, [slug, token]);

  useEffect(() => {
    setLiveItems(items);
  }, [items]);

  const visible = liveItems.filter((item) => {
    if (filter === "veg" && !item.veg) return false;
    if (activeCat !== "all" && item.category_id !== activeCat) return false;
    return true;
  });

  const cartCount = mounted ? cart.count() : 0;
  const cartTotal = mounted ? cart.total() : 0;

  function addItem(item: Pick<MenuItem, "id" | "name" | "price" | "veg" | "availability">) {
    if (item.availability === "unavailable" || item.availability === "paused") {
      toast.error(`${item.name} is unavailable`);
      return;
    }
    cart.add({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      veg: item.veg,
    });
    toast.success(`Added ${item.name}`);
  }

  function addFromRec(rec: AiRec) {
    const fromMenu = liveItems.find((i) => i.id === rec.item_id);
    addItem({
      id: rec.item_id,
      name: fromMenu?.name ?? rec.name ?? "Dish",
      price: fromMenu ? Number(fromMenu.price) : Number(rec.price ?? 0),
      veg: fromMenu?.veg ?? rec.veg ?? true,
      availability: (fromMenu?.availability ??
        rec.availability ??
        "available") as MenuItem["availability"],
    });
  }

  function askAi() {
    startTransition(async () => {
      router.refresh();
      const res = await fetch("/api/ai/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: slug,
          sessionToken: token,
          query,
          diet: filter === "veg" ? "veg" : undefined,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    });
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-nk-cream pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-nk-cream/95 px-4 py-4 backdrop-blur">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Table {tableNumber}
            </p>
            <h1 className="font-display text-2xl text-nk-navy">{restaurantName}</h1>
            <div className="mt-2">
              <RealtimeBadge mode={rtMode} />
            </div>
          </div>
          <button
            onClick={() => setAiOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 text-sm text-violet-700"
          >
            <Bot className="h-4 w-4" />
            Ask AI
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter(filter === "veg" ? "all" : "veg")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              filter === "veg" ? "bg-emerald-500/20 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            Veg
          </button>
          <button
            onClick={() => setActiveCat("all")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              activeCat === "all" ? "bg-nk-navy/10 text-nk-navy" : "bg-slate-100 text-slate-600"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${
                activeCat === c.id ? "bg-nk-navy/10 text-nk-navy" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3 px-4 py-4">
        {visible.map((item) => (
          <article key={item.id} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-sm ${item.veg ? "bg-emerald-400" : "bg-rose-400"}`}
                  />
                  <h2 className="font-display text-base text-nk-navy">{item.name}</h2>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={item.availability}>
                    {item.availability.replace("_", " ")}
                  </Badge>
                  <span className="font-mono-num text-xs text-slate-500">
                    {formatMins(item.current_eta_min)}
                  </span>
                  {item.portions_left < 20 && (
                    <span className="font-mono-num text-xs text-amber-300">
                      {item.portions_left} left
                    </span>
                  )}
                </div>
                {item.explanation && item.availability !== "available" && (
                  <p className="mt-1 text-xs text-slate-500">{item.explanation}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono-num text-sm text-nk-navy">{formatINR(Number(item.price))}</p>
                <Button
                  size="sm"
                  className="mt-2"
                  disabled={
                    item.availability === "unavailable" || item.availability === "paused"
                  }
                  onClick={() => addItem(item)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </article>
        ))}
        {!visible.length && (
          <p className="py-16 text-center text-slate-500">Menu being updated…</p>
        )}
      </div>

      {mounted && cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 px-4">
          <Link
            href={`/r/${slug}/cart?token=${token}&table=${tableNumber}`}
            className="mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-nk-orange px-4 py-3 text-nk-navy shadow-lg shadow-nk-orange/20"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <ShoppingBag className="h-4 w-4" />
              {cartCount} items
            </span>
            <span className="font-mono-num font-semibold">{formatINR(cartTotal)}</span>
          </Link>
        </div>
      )}

      {aiOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-nk-navy/40 p-4 sm:items-center sm:justify-center">
          <div className="surface w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-nk-navy">Menu assistant</h3>
              <button className="text-slate-500" onClick={() => setAiOpen(false)}>
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Grounded on live availability & ETAs — never invents dishes.
            </p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-nk-navy outline-none focus:border-cyan-400/50"
              rows={3}
            />
            <Button className="mt-3 w-full" onClick={askAi} disabled={pending}>
              <Sparkles className="h-4 w-4" />
              {pending ? "Thinking…" : "Get recommendations"}
            </Button>
            {aiResult && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  {aiResult.message}
                  {aiResult.fallback ? " · Quick picks" : ""}
                </p>
                {aiResult.recommendations.map((rec) => (
                  <div
                    key={rec.item_id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-nk-navy">
                        {rec.name ??
                          liveItems.find((i) => i.id === rec.item_id)?.name ??
                          "Dish"}
                      </p>
                      <p className="text-xs text-slate-500">{rec.reason}</p>
                    </div>
                    <Button size="sm" onClick={() => addFromRec(rec)}>
                      Add
                    </Button>
                  </div>
                ))}
                {!aiResult.recommendations.length && (
                  <p className="text-xs text-slate-500">No matching dishes to add.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
