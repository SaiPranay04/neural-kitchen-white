"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ensureTableSession, placeOrder } from "@/lib/actions/orders";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const cart = useCart();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState(
    () => search.get("token") ?? cart.sessionToken ?? ""
  );
  const table = Number(search.get("table") ?? 7);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await ensureTableSession({
        token: search.get("token") ?? cart.sessionToken,
        restaurantSlug: params.slug,
        tableNumber: Number.isFinite(table) ? table : 7,
      });
      if (cancelled) return;
      if (result.ok) {
        setToken(result.data.token);
        cart.setSession(params.slug, result.data.token);
        if (search.get("token") !== result.data.token) {
          router.replace(
            `/r/${params.slug}/cart?token=${result.data.token}&table=${result.data.tableNumber}`
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, table]);

  function submit() {
    startTransition(async () => {
      const result = await placeOrder({
        sessionToken: token || undefined,
        restaurantSlug: params.slug,
        tableNumber: Number.isFinite(table) ? table : 7,
        note,
        items: cart.lines.map((l) => ({
          menuItemId: l.menuItemId,
          qty: l.qty,
          note: l.note,
        })),
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      cart.clear();
      toast.success(`Order #${result.data.displayId} placed`);
      const liveToken = result.data.sessionToken || token;
      cart.setSession(params.slug, liveToken);
      router.push(
        `/r/${params.slug}/order/${result.data.orderId}?token=${liveToken}&table=${table}`
      );
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-nk-cream px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-nk-navy">Your cart</h1>
        <Link
          href={`/r/${params.slug}/menu?token=${token}&table=${table}`}
          className="text-sm text-nk-orange"
        >
          Back to menu
        </Link>
      </div>

      <div className="space-y-3">
        {cart.lines.map((line) => (
          <div key={line.menuItemId} className="surface flex items-center justify-between p-4">
            <div>
              <p className="text-nk-navy">{line.name}</p>
              <p className="font-mono-num text-sm text-slate-500">
                {formatINR(line.price)} × {line.qty}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => cart.setQty(line.menuItemId, line.qty - 1)}>
                -
              </Button>
              <span className="font-mono-num w-6 text-center text-nk-navy">{line.qty}</span>
              <Button size="sm" variant="outline" onClick={() => cart.setQty(line.menuItemId, line.qty + 1)}>
                +
              </Button>
            </div>
          </div>
        ))}
        {!cart.lines.length && (
          <p className="py-20 text-center text-slate-500">Cart is empty</p>
        )}
      </div>

      {!!cart.lines.length && (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any notes for the kitchen?"
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-nk-navy outline-none focus:border-nk-orange"
            rows={2}
          />
          <div className="mt-4 flex items-center justify-between text-nk-navy">
            <span>Subtotal</span>
            <span className="font-mono-num text-lg">{formatINR(cart.total())}</span>
          </div>
          <Button className="mt-4 w-full" size="lg" disabled={pending} onClick={submit}>
            {pending ? "Placing…" : "Place order"}
          </Button>
        </>
      )}
    </main>
  );
}
