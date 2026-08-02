"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeBadge } from "@/components/shared/RealtimeBadge";
import { useRealtime } from "@/hooks/useRealtime";
import { createServiceRequest } from "@/lib/actions/orders";
import { requestBillAsCustomer } from "@/lib/actions/tables";
import { formatINR, formatMins } from "@/lib/utils";
import type { Order } from "@/types/database";

const steps = ["queued", "accepted", "preparing", "ready", "served"] as const;

export function OrderTracker({
  initialOrder,
  token,
  slug,
}: {
  initialOrder: Order;
  token: string;
  slug: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/orders/${order.id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
    }
  }, [order.id]);

  const rtMode = useRealtime({
    table: "order_items",
    filter: `order_id=eq.${order.id}`,
    onChange: refresh,
    pollMs: 5000,
  });

  function request(type: "call_waiter" | "water" | "cutlery" | "bill") {
    startTransition(async () => {
      if (type === "bill") {
        const result = await requestBillAsCustomer(order.id, token);
        if (!result.ok) toast.error(result.message);
        else {
          toast.success("Bill requested");
          window.location.href = `/r/${slug}/bill?orderId=${order.id}&token=${token}`;
        }
        return;
      }
      const result = await createServiceRequest({ sessionToken: token, type });
      if (!result.ok) toast.error(result.message);
      else toast.success("Request sent to waiter");
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-nk-cream px-4 py-6">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        Live order · #{order.display_id ?? "—"}
      </p>
      <h1 className="font-display text-2xl text-nk-navy">Tracking your meal</h1>
      <div className="mt-2">
        <RealtimeBadge mode={rtMode} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Show kitchen <span className="font-mono-num text-nk-navy">#{order.display_id}</span>
        {" "}if they ask. System id {order.id.slice(0, 8)}…
      </p>

      <div className="mt-6 space-y-3">
        {(order.order_items ?? []).map((item) => (
          <div key={item.id} className="surface glow-in p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-nk-navy">
                  {(item.menu_items as { name?: string } | null)?.name ?? "Item"} ×{" "}
                  {item.qty}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={item.status === "ready" ? "available" : "default"}>
                    {item.status}
                  </Badge>
                  <span className="font-mono-num text-xs text-slate-500">
                    ETA {formatMins(item.eta_min)}
                  </span>
                </div>
              </div>
              <span className="font-mono-num text-sm text-slate-600">
                {formatINR(Number(item.unit_price) * item.qty)}
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {steps.map((step) => {
                const idx = steps.indexOf(step);
                const current = steps.indexOf(item.status as (typeof steps)[number]);
                const done = current >= idx;
                return (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full ${
                      done ? "bg-cyan-400" : "bg-slate-100"
                    }`}
                    title={step}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" disabled={pending} onClick={() => request("call_waiter")}>
          Call waiter
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => request("water")}>
          Water
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => request("cutlery")}>
          Cutlery
        </Button>
        <Button disabled={pending} onClick={() => request("bill")}>
          Request bill
        </Button>
      </div>
    </main>
  );
}
