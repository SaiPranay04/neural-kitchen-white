"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeDiningSession } from "@/lib/actions/tables";
import { useCart } from "@/hooks/useCart";

function ThanksInner() {
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const token = search.get("token") ?? "";
  const displayId = search.get("displayId");
  const [closed, setClosed] = useState(false);
  const [pending, startTransition] = useTransition();
  const clearCart = useCart((s) => s.clear);

  useEffect(() => {
    if (!orderId || closed) return;
    startTransition(async () => {
      await closeDiningSession(orderId, token);
      clearCart();
      setClosed(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-nk-cream px-4 text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        Order #{displayId ?? "—"} closed
      </p>
      <h1 className="font-display mt-2 text-4xl text-nk-navy">Thank you</h1>
      <p className="mt-4 max-w-sm text-slate-500">
        {pending && !closed
          ? "Closing your table session…"
          : "Your session is closed. The table is vacant for the next guests. Hope to see you again at Spice Garden."}
      </p>
      <div className="surface mt-8 w-full max-w-sm space-y-2 p-4 text-left text-xs text-slate-500">
        <p>
          Display ID:{" "}
          <span className="font-mono-num text-nk-orange">#{displayId}</span>
        </p>
        <p>
          System order id:{" "}
          <span className="font-mono-num text-slate-400">
            {orderId?.slice(0, 8)}…
          </span>
        </p>
        <p>Table status: available</p>
      </div>
      <Button
        className="mt-8"
        variant="outline"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Back to home
      </Button>
    </main>
  );
}

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading…</div>}>
      <ThanksInner />
    </Suspense>
  );
}
