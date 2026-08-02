"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeBadge } from "@/components/shared/RealtimeBadge";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { StatusDot } from "@/components/shared/StatusDot";
import { useRealtime } from "@/hooks/useRealtime";
import { updateItemStatus } from "@/lib/actions/kitchen";
import { markPaid, resolveRequest, updateTableStatus } from "@/lib/actions/tables";
import type { OrderItem, ServiceRequest, TableRow } from "@/types/database";

type ReadyItem = OrderItem & {
  menu_items?: { name?: string } | null;
  orders?: { id: string; tables?: { number: number } | null } | null;
};

export function WaiterClient({
  restaurantId,
  initialTables,
  initialRequests,
  initialReady,
}: {
  restaurantId: string;
  initialTables: TableRow[];
  initialRequests: ServiceRequest[];
  initialReady: ReadyItem[];
}) {
  const [tab, setTab] = useState<"tables" | "requests" | "ready">("tables");
  const [tables, setTables] = useState(initialTables);
  const [requests, setRequests] = useState(initialRequests);
  const [ready, setReady] = useState(initialReady);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/waiter/state?restaurantId=${restaurantId}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    setTables(data.tables);
    setRequests(data.requests);
    setReady(data.ready);
  }, [restaurantId]);

  const tablesRt = useRealtime({
    table: "tables",
    filter: `restaurant_id=eq.${restaurantId}`,
    onChange: refresh,
    pollMs: 5000,
  });
  useRealtime({
    table: "service_requests",
    filter: `restaurant_id=eq.${restaurantId}`,
    onChange: refresh,
    pollMs: 5000,
  });
  useRealtime({ table: "order_items", onChange: refresh, pollMs: 5000 });

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-nk-cream px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Waiter · Supabase Auth
          </p>
          <h1 className="font-display text-3xl text-nk-navy">Waiter panel</h1>
          <div className="mt-2">
            <RealtimeBadge mode={tablesRt} />
          </div>
        </div>
        <SignOutButton />
      </div>
      <div className="mt-4 flex gap-2">
        {(["tables", "requests", "ready"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm capitalize ${
              tab === t ? "bg-cyan-400 text-nk-navy" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "tables" && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {tables.map((table) => (
            <button
              key={table.id}
              className="surface p-4 text-left"
              disabled={pending}
              onClick={() => {
                const next =
                  table.status === "cleaning"
                    ? "available"
                    : table.status === "needs_service"
                      ? "occupied"
                      : null;
                if (!next) return;
                startTransition(async () => {
                  const result = await updateTableStatus({ tableId: table.id, next });
                  if (!result.ok) toast.error(result.message);
                  else refresh();
                });
              }}
            >
              <div className="flex items-center gap-2">
                <StatusDot status={table.status} />
                <span className="font-display text-2xl text-nk-navy">T{table.number}</span>
              </div>
              <p className="mt-2 text-xs capitalize text-slate-500">
                {table.status.replace("_", " ")}
              </p>
            </button>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="mt-4 space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="surface flex items-center justify-between p-4">
              <div>
                <p className="text-nk-navy">
                  Table {(req.tables as { number?: number } | null)?.number} ·{" "}
                  {req.type.replace("_", " ")}
                </p>
                <Badge className="mt-1">{req.status}</Badge>
              </div>
              <div className="flex gap-2">
                {req.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await resolveRequest({ requestId: req.id, next: "acknowledged" });
                        refresh();
                      })
                    }
                  >
                    Ack
                  </Button>
                )}
                {req.status !== "resolved" && (
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await resolveRequest({ requestId: req.id, next: "resolved" });
                        refresh();
                      })
                    }
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!requests.length && (
            <p className="py-12 text-center text-slate-500">No open requests</p>
          )}
        </div>
      )}

      {tab === "ready" && (
        <div className="mt-4 space-y-3">
          {ready.map((item) => (
            <div key={item.id} className="surface flex items-center justify-between p-4">
              <div>
                <p className="font-display text-xl text-nk-navy">
                  T{item.orders?.tables?.number ?? "?"}
                  {(item.orders as { display_id?: string } | null | undefined)
                    ?.display_id
                    ? ` · #${(item.orders as { display_id?: string }).display_id}`
                    : ""}
                </p>
                <p className="text-slate-700">
                  {item.menu_items?.name} × {item.qty}
                </p>
              </div>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await updateItemStatus({
                      itemId: item.id,
                      next: "served",
                    });
                    if (!result.ok) toast.error(result.message);
                    else {
                      toast.success("Marked served");
                      refresh();
                    }
                  })
                }
              >
                Served
              </Button>
            </div>
          ))}
          {!ready.length && (
            <p className="py-12 text-center text-slate-500">Nothing ready to serve</p>
          )}

          <div className="pt-4">
            <p className="mb-2 text-sm text-slate-500">
              Mark bill paid (demo gateway) from open billed orders via dashboard, or tap a
              table in bill_requested state after payment confirmation.
            </p>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await fetch(
                    `/api/waiter/latest-billed?restaurantId=${restaurantId}`
                  );
                  if (!res.ok) {
                    toast.error("No billed order");
                    return;
                  }
                  const { orderId } = await res.json();
                  const result = await markPaid({ orderId });
                  if (!result.ok) toast.error(result.message);
                  else {
                    toast.success("Marked paid — ask guest for feedback / skip");
                    refresh();
                  }
                })
              }
            >
              Mark latest billed as paid
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
