"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markPaidAsCustomer } from "@/lib/actions/tables";
import { formatINR } from "@/lib/utils";

type BillItem = {
  id: string;
  qty: number;
  unit_price: number;
  menu_items?: { name?: string } | null;
};

export function BillClient({
  slug,
  token,
  orderId,
  displayId,
  subtotal,
  tax,
  total,
  paid,
  items,
}: {
  slug: string;
  token: string;
  orderId: string;
  displayId: string | null;
  subtotal: number;
  tax: number;
  total: number;
  paid: boolean;
  items: BillItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function payDemo() {
    startTransition(async () => {
      const result = await markPaidAsCustomer(orderId, token);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Payment recorded");
      router.push(
        `/r/${slug}/feedback?orderId=${orderId}&token=${token}&displayId=${displayId ?? ""}`
      );
      router.refresh();
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-nk-cream px-4 py-6">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        Order #{displayId ?? "—"}
      </p>
      <h1 className="font-display text-2xl text-nk-navy">Your bill</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tracking code <span className="font-mono-num text-nk-navy">#{displayId}</span>
        {" · "}
        <span className="font-mono-num text-[10px] text-slate-500">
          id {orderId.slice(0, 8)}…
        </span>
      </p>

      <div className="surface mt-6 space-y-3 p-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-slate-700">
              {item.menu_items?.name} × {item.qty}
            </span>
            <span className="font-mono-num text-slate-600">
              {formatINR(Number(item.unit_price) * item.qty)}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono-num">{formatINR(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-slate-500">
            <span>Tax</span>
            <span className="font-mono-num">{formatINR(tax)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base text-nk-navy">
            <span>Total</span>
            <span className="font-mono-num font-semibold">{formatINR(total)}</span>
          </div>
        </div>
      </div>

      {!paid ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-500">
            Waiter can mark paid, or use demo pay below.
          </p>
          <Button className="w-full" size="lg" disabled={pending} onClick={payDemo}>
            {pending ? "Processing…" : "Mark paid (demo) → feedback"}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-emerald-700">Paid — one quick feedback?</p>
          <Link
            href={`/r/${slug}/feedback?orderId=${orderId}&token=${token}&displayId=${displayId ?? ""}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-400 font-medium text-nk-navy"
          >
            Leave feedback
          </Link>
        </div>
      )}
    </main>
  );
}
