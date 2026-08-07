"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Camera,
  ChefHat,
  ClipboardList,
  Package,
  Scale,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { C } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { logWaste } from "@/lib/actions/inventory";
import {
  applyBillLines,
  extractBillFromImage,
  receiveByWeight,
  type BillExtractLine,
  type BillExtractResult,
} from "@/lib/actions/inventoryBill";
import { metaFor } from "@/lib/inventory/catalog";
import type { InventoryBundle, InventoryStockRow, RecipeCostRow } from "@/lib/inventory/types";

type SubTab =
  | "stock"
  | "purchases"
  | "recipes"
  | "variance"
  | "waste"
  | "analytics";

const TABS: { id: SubTab; label: string; icon: ReactNode }[] = [
  { id: "stock", label: "Stock", icon: <Boxes size={15} /> },
  { id: "purchases", label: "Purchases", icon: <ShoppingCart size={15} /> },
  { id: "recipes", label: "Recipes", icon: <ChefHat size={15} /> },
  { id: "variance", label: "Variance", icon: <Scale size={15} /> },
  { id: "waste", label: "Waste", icon: <Trash2 size={15} /> },
  { id: "analytics", label: "Analytics", icon: <TrendingUp size={15} /> },
];

const STATUS_STYLE: Record<
  InventoryStockRow["status"],
  { bg: string; color: string; label: string }
> = {
  ok: { bg: C.emeraldLight, color: C.emerald, label: "OK" },
  low: { bg: C.amberLight, color: C.amber, label: "Low" },
  critical: { bg: C.redLight, color: C.red, label: "Critical" },
  out: { bg: C.redLight, color: C.red, label: "Out" },
};

const ENG_STYLE: Record<
  RecipeCostRow["engineering"],
  { bg: string; color: string; label: string }
> = {
  star: { bg: C.emeraldLight, color: C.emerald, label: "Star" },
  plowhorse: { bg: C.amberLight, color: C.amber, label: "Plowhorse" },
  puzzle: { bg: C.cyanLight, color: C.cyan, label: "Puzzle" },
  dog: { bg: C.redLight, color: C.red, label: "Dog" },
};

function fmtQty(n: number, unit: string) {
  if (unit === "g" || unit === "ml") {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)} ${unit === "g" ? "kg" : "L"}`;
  }
  return `${Math.round(n)} ${unit}`;
}

function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export function InventoryModule({
  data,
  mode,
}: {
  data: InventoryBundle;
  mode: "live" | "promo";
}) {
  const [tab, setTab] = useState<SubTab>("stock");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(
    data.recipes[0]?.menuItemId ?? null
  );
  const [restockItem, setRestockItem] = useState<InventoryStockRow | null>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => ["All", ...new Set(data.stock.map((s) => s.category))],
    [data.stock]
  );

  const filtered = data.stock.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q);
    const matchC = category === "All" || s.category === category;
    return matchQ && matchC;
  });

  const recipe = data.recipes.find((r) => r.menuItemId === selectedRecipe) ?? data.recipes[0];

  function openRestock(item: InventoryStockRow) {
    setRestockItem(item);
  }

  function confirmRestock(opts: {
    qty: number;
    unitMode: "purchase" | "base";
    rate?: number;
    note?: string;
  }) {
    if (!restockItem) return;
    if (mode !== "live") {
      toast.message(
        `Would add ${opts.qty} ${opts.unitMode === "purchase" ? restockItem.purchaseUom : restockItem.unit} — sign in for live stock`
      );
      setRestockItem(null);
      return;
    }
    startTransition(async () => {
      const result = await receiveByWeight({
        inventoryItemId: restockItem.id,
        qty: opts.qty,
        unitMode: opts.unitMode,
        rate: opts.rate,
        note: opts.note,
      });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(
          `Received ${opts.qty} ${opts.unitMode === "purchase" ? restockItem.purchaseUom : restockItem.unit} → stock ${fmtQty(result.data.qty, restockItem.unit)}`
        );
        setRestockItem(null);
        router.refresh();
      }
    });
  }

  function waste(item: InventoryStockRow, reason: "spoilage" | "expiry" = "spoilage") {
    if (mode !== "live") {
      toast.message("Promo mode — waste logging needs live stock");
      return;
    }
    const qty = Math.min(item.qty, Math.max(20, Math.round(item.lowThreshold * 0.1)));
    startTransition(async () => {
      const result = await logWaste({
        inventoryItemId: item.id,
        qty,
        reason,
      });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(`Wrote off ${fmtQty(qty, item.unit)} ${item.name}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: C.navy, letterSpacing: "-0.02em" }}>
            Inventory & cost control
          </div>
          <p style={{ fontSize: 13, color: C.slate400, marginTop: 4 }}>
            Stock · purchases · recipes · variance · waste — live for {data.restaurantName}
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: C.emeraldLight, color: C.emerald }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.emerald }} />
          {mode === "live" ? "Live ledger" : "Showcase sample"}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Stock value",
            value: formatINR(data.kpis.stockValue),
            hint: "On hand at WAC",
            icon: <Wallet size={16} />,
            color: C.navy,
          },
          {
            label: "Food cost",
            value: `${data.kpis.foodCostPct.toFixed(1)}%`,
            hint: "Avg plate cost / price",
            icon: <Package size={16} />,
            color: C.orange,
          },
          {
            label: "At risk",
            value: String(data.kpis.itemsLow),
            hint: `${data.kpis.itemsCritical} critical / out`,
            icon: <AlertTriangle size={16} />,
            color: C.amber,
          },
          {
            label: "Purchase spend",
            value: formatINR(data.kpis.purchaseSpend),
            hint: "Recent receipts",
            icon: <ShoppingCart size={16} />,
            color: C.emerald,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border bg-white p-4"
            style={{ borderColor: C.slate200 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: C.slate400, fontWeight: 500 }}>{k.label}</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${k.color}14`, color: k.color }}
              >
                {k.icon}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.slate400, marginTop: 4 }}>{k.hint}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div
          className="rounded-2xl border p-4 space-y-2"
          style={{ borderColor: `${C.amber}40`, background: C.amberLight }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} color={C.amber} />
            <span style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>Live alerts</span>
          </div>
          {data.alerts.slice(0, 3).map((a, i) => (
            <p key={i} style={{ fontSize: 13, color: C.slate700, lineHeight: 1.45 }}>
              · {a}
            </p>
          ))}
        </div>
      )}

      {/* Sub-nav */}
      <div
        className="flex gap-1 overflow-x-auto p-1 rounded-xl border bg-white"
        style={{ borderColor: C.slate200 }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap border-none cursor-pointer transition-all"
              style={{
                background: active ? C.navy : "transparent",
                color: active ? "white" : C.slate600,
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "stock" && (
            <StockPanel
              rows={filtered}
              categories={categories}
              category={category}
              setCategory={setCategory}
              query={query}
              setQuery={setQuery}
              pending={pending}
              onRestock={openRestock}
              onWaste={waste}
              mode={mode}
            />
          )}
          {tab === "purchases" && (
            <PurchasesPanel
              data={data}
              mode={mode}
              pending={pending}
              startTransition={startTransition}
              onRefresh={() => router.refresh()}
            />
          )}
          {tab === "recipes" && (
            <RecipesPanel
              recipes={data.recipes}
              selected={recipe}
              onSelect={setSelectedRecipe}
            />
          )}
          {tab === "variance" && <VariancePanel data={data} />}
          {tab === "waste" && (
            <WastePanel data={data} mode={mode} pending={pending} onWaste={waste} />
          )}
          {tab === "analytics" && <AnalyticsPanel data={data} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {restockItem && (
          <RestockModal
            item={restockItem}
            pending={pending}
            onClose={() => setRestockItem(null)}
            onConfirm={confirmRestock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RestockModal({
  item,
  pending,
  onClose,
  onConfirm,
}: {
  item: InventoryStockRow;
  pending: boolean;
  onClose: () => void;
  onConfirm: (opts: {
    qty: number;
    unitMode: "purchase" | "base";
    rate?: number;
    note?: string;
  }) => void;
}) {
  const [unitMode, setUnitMode] = useState<"purchase" | "base">("purchase");
  const [qty, setQty] = useState(
    String(Math.max(1, Math.round(item.reorderQty / item.purchaseConversion) || 1))
  );
  const [rate, setRate] = useState(String(item.lastPurchaseRate || ""));
  const [note, setNote] = useState("");

  const qtyNum = Number(qty);
  const rateNum = rate ? Number(rate) : undefined;
  const addedBase =
    unitMode === "purchase" ? qtyNum * item.purchaseConversion : qtyNum;
  const valid = Number.isFinite(qtyNum) && qtyNum > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 60 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(440px, calc(100vw - 32px))",
          background: "white",
          borderRadius: 20,
          zIndex: 70,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          padding: 24,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.navy }}>Receive stock</div>
            <div style={{ fontSize: 13, color: C.slate400, marginTop: 2 }}>
              {item.name} · on hand {fmtQty(item.qty, item.unit)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer bg-white"
            style={{ borderColor: C.slate200 }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: C.slate100 }}>
          {(
            [
              ["purchase", item.purchaseUom],
              ["base", item.unit],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setUnitMode(mode)}
              className="flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer border-none"
              style={{
                background: unitMode === mode ? "white" : "transparent",
                color: unitMode === mode ? C.navy : C.slate600,
                boxShadow: unitMode === mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Enter in {label}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: C.slate600 }}>
          Quantity ({unitMode === "purchase" ? item.purchaseUom : item.unit})
        </label>
        <input
          type="number"
          min={0}
          step="any"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder={unitMode === "purchase" ? "e.g. 2.5" : "e.g. 2500"}
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: C.slate200, color: C.navy, fontWeight: 700, fontSize: 18 }}
          autoFocus
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: C.slate600 }}>
          Rate ₹ / {item.purchaseUom} (optional)
        </label>
        <input
          type="number"
          min={0}
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder={`e.g. ${item.lastPurchaseRate}`}
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: C.slate200, color: C.navy }}
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: C.slate600 }}>Note</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Cash mandi / PO # / supplier"
          className="w-full mt-1 mb-4 px-3.5 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: C.slate200, color: C.navy }}
        />

        {valid && (
          <div
            className="rounded-xl px-3.5 py-3 mb-4 text-sm"
            style={{ background: `${C.navy}08`, color: C.slate700 }}
          >
            Will add <strong style={{ color: C.navy }}>{fmtQty(addedBase, item.unit)}</strong> to
            stock
            {rateNum != null && Number.isFinite(rateNum) && unitMode === "purchase" ? (
              <>
                {" "}
                · bill value <strong style={{ color: C.navy }}>{formatINR(qtyNum * rateNum)}</strong>
              </>
            ) : null}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer bg-white"
            style={{ borderColor: C.slate200, color: C.slate600 }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid || pending}
            onClick={() =>
              onConfirm({
                qty: qtyNum,
                unitMode,
                rate: rateNum != null && Number.isFinite(rateNum) ? rateNum : undefined,
                note: note || undefined,
              })
            }
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none disabled:opacity-50"
            style={{ background: C.navy }}
          >
            {pending ? "Saving…" : "Add to stock"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border bg-white ${className}`}
      style={{ borderColor: C.slate200 }}
    >
      {children}
    </div>
  );
}

function StockPanel({
  rows,
  categories,
  category,
  setCategory,
  query,
  setQuery,
  pending,
  onRestock,
  onWaste,
  mode,
}: {
  rows: InventoryStockRow[];
  categories: string[];
  category: string;
  setCategory: (c: string) => void;
  query: string;
  setQuery: (q: string) => void;
  pending: boolean;
  onRestock: (item: InventoryStockRow) => void;
  onWaste: (item: InventoryStockRow) => void;
  mode: "live" | "promo";
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search item or supplier…"
          className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: C.slate200, color: C.navy }}
        />
        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap"
              style={{
                borderColor: category === c ? C.navy : C.slate200,
                background: category === c ? C.navy : "white",
                color: category === c ? "white" : C.slate600,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((item) => {
          const st = STATUS_STYLE[item.status];
          const coverPct = Math.min(100, (item.qty / Math.max(item.lowThreshold * 3, 1)) * 100);
          return (
            <Card key={item.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{item.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={{ background: C.slate100, color: C.slate600 }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.slate400 }}>
                    {fmtQty(item.qty, item.unit)} on hand · value{" "}
                    <strong style={{ color: C.navy }}>{formatINR(item.stockValue)}</strong>
                    {" · "}
                    {item.daysOfCover}d cover · {item.supplier}
                  </div>
                  <div
                    className="mt-2 h-1.5 rounded-full overflow-hidden"
                    style={{ background: C.slate100, maxWidth: 280 }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${coverPct}%`,
                        background:
                          item.status === "ok"
                            ? C.emerald
                            : item.status === "low"
                              ? C.amber
                              : C.red,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <div style={{ fontSize: 11, color: C.slate400 }}>WAC</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                      ₹{item.avgCost.toFixed(2)}/{item.unit}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pending || mode !== "live"}
                    onClick={() => onWaste(item)}
                    className="px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-50"
                    style={{ borderColor: C.slate200, color: C.slate600, background: "white" }}
                  >
                    Waste
                  </button>
                  <button
                    type="button"
                    disabled={pending || mode !== "live"}
                    onClick={() => onRestock(item)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50 border-none"
                    style={{ background: C.navy }}
                  >
                    Receive…
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        {!rows.length && (
          <p style={{ fontSize: 14, color: C.slate400, padding: 24, textAlign: "center" }}>
            No items match this filter.
          </p>
        )}
      </div>
    </div>
  );
}

function PurchasesPanel({
  data,
  mode,
  pending,
  startTransition,
  onRefresh,
}: {
  data: InventoryBundle;
  mode: "live" | "promo";
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <BillUploadCard
        stock={data.stock}
        mode={mode}
        pending={pending}
        startTransition={startTransition}
        onRefresh={onRefresh}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Purchases & receipts</div>
              <div style={{ fontSize: 12, color: C.slate400 }}>Where the money went</div>
            </div>
            <ClipboardList size={18} color={C.slate400} />
          </div>
          <div className="space-y-2">
            {data.purchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
                style={{ borderColor: C.slate100, background: C.slate50 }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{p.item}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        background: p.kind === "cash" ? C.orange + "18" : C.navy + "12",
                        color: p.kind === "cash" ? C.orange : C.navy,
                      }}
                    >
                      {p.kind}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                      style={{ background: C.slate100, color: C.slate600 }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.slate400, marginTop: 2 }}>
                    {p.supplier} · {p.qty} {p.unit} @ {formatINR(p.rate)} · {ago(p.date)}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, whiteSpace: "nowrap" }}>
                  {formatINR(p.total)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 12 }}>
              Suppliers
            </div>
            <div className="space-y-3">
              {data.suppliers.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between items-baseline gap-2">
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>{s.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>
                      {formatINR(s.spend)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.slate400, marginTop: 2 }}>
                    {s.orders} receipts · {s.items.slice(0, 3).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 8 }}>
              Suggested reorder
            </div>
            <div className="space-y-2">
              {data.stock
                .filter((s) => s.status !== "ok")
                .slice(0, 4)
                .map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl px-3 py-2.5 text-sm"
                    style={{ background: C.slate50 }}
                  >
                    <div style={{ fontWeight: 600, color: C.navy }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: C.slate400 }}>
                      Suggest ~{Math.ceil(s.reorderQty / s.purchaseConversion)} {s.purchaseUom} from{" "}
                      {s.supplier} — enter actual weight on receive
                    </div>
                  </div>
                ))}
              {!data.stock.some((s) => s.status !== "ok") && (
                <p style={{ fontSize: 13, color: C.slate400 }}>All items above reorder point.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BillUploadCard({
  stock,
  mode,
  pending,
  startTransition,
  onRefresh,
}: {
  stock: InventoryStockRow[];
  mode: "live" | "promo";
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [extract, setExtract] = useState<BillExtractResult | null>(null);
  const [lines, setLines] = useState<BillExtractLine[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  function mockExtract(): BillExtractResult {
    const demo = stock.slice(0, 4).map((s, i) => {
      const qty = i === 0 ? 2.5 : i === 1 ? 5 : 1;
      return {
        name: s.name,
        qty,
        unit: s.purchaseUom,
        rate: s.lastPurchaseRate,
        total: qty * s.lastPurchaseRate,
        matchedInventoryItemId: s.id,
        matchedName: s.name,
      };
    });
    return {
      supplier: "Green Valley Mandi",
      invoiceNumber: "CASH-" + new Date().getDate(),
      date: new Date().toISOString().slice(0, 10),
      lines: demo,
      total: demo.reduce((a, l) => a + (l.total ?? 0), 0),
      provider: "fallback",
    };
  }

  function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Upload a bill photo (JPG / PNG / WebP)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result ?? "");
      setPreview(base64);

      if (mode !== "live") {
        const mock = mockExtract();
        setExtract(mock);
        setLines(mock.lines);
        toast.success("Demo extract ready — review quantities, then apply on live login");
        return;
      }

      const mime = (file.type as "image/jpeg" | "image/png" | "image/webp") || "image/jpeg";
      startTransition(async () => {
        const result = await extractBillFromImage({ imageBase64: base64, mimeType: mime });
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setExtract(result.data);
        setLines(result.data.lines);
        toast.success(
          result.data.provider === "gemini"
            ? `Extracted ${result.data.lines.length} lines from bill`
            : `Sample extract (${result.data.lines.length} lines) — set GEMINI_API_KEY for real OCR`
        );
      });
    };
    reader.readAsDataURL(file);
  }

  function updateLine(idx: number, patch: Partial<BillExtractLine>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function apply() {
    const ready = lines.filter((l) => l.matchedInventoryItemId && l.qty > 0);
    if (!ready.length) {
      toast.error("Match at least one line to a stock item");
      return;
    }
    if (mode !== "live") {
      toast.message("Sign in to apply bill lines to live stock");
      return;
    }
    startTransition(async () => {
      const result = await applyBillLines({
        lines: ready.map((l) => {
          const stockRow = stock.find((s) => s.id === l.matchedInventoryItemId);
          const unit = (l.unit ?? "kg").toLowerCase();
          const isBase =
            unit === stockRow?.unit || unit === "g" || unit === "ml" || unit === "gram";
          return {
            inventoryItemId: l.matchedInventoryItemId!,
            qty: l.qty,
            unitMode: isBase ? ("base" as const) : ("purchase" as const),
            rate: l.rate,
            note: extract?.supplier
              ? `Bill ${extract.invoiceNumber ?? ""} · ${extract.supplier}`
              : "Bill OCR",
          };
        }),
      });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(`Applied ${result.data.applied} lines to stock`);
        setExtract(null);
        setLines([]);
        setPreview(null);
        onRefresh();
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>
            Scan bill / mandi slip
          </div>
          <div style={{ fontSize: 12, color: C.slate400 }}>
            Photo → auto-extract items, weights & rates → review → stock in
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-50"
            style={{ background: C.orange }}
          >
            <Camera size={16} />
            {pending ? "Reading…" : "Upload bill photo"}
          </button>
        </div>
      </div>

      {!extract && (
        <div
          className="rounded-xl border border-dashed px-4 py-8 text-center cursor-pointer"
          style={{ borderColor: C.slate300, background: C.slate50 }}
          onClick={() => fileRef.current?.click()}
        >
          <Camera size={28} color={C.slate400} style={{ margin: "0 auto 10px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>
            Drop a clear photo of the bill
          </div>
          <div style={{ fontSize: 12, color: C.slate400, marginTop: 4 }}>
            Works with GST invoices and handwritten mandi slips
          </div>
        </div>
      )}

      {extract && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Bill"
                className="w-16 h-16 rounded-lg object-cover border"
                style={{ borderColor: C.slate200 }}
              />
            )}
            <div className="text-sm" style={{ color: C.slate600 }}>
              <strong style={{ color: C.navy }}>{extract.supplier ?? "Unknown supplier"}</strong>
              {extract.invoiceNumber ? ` · #${extract.invoiceNumber}` : ""}
              {extract.date ? ` · ${extract.date}` : ""}
              {extract.total != null ? ` · ${formatINR(extract.total)}` : ""}
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{
                  background: extract.provider === "gemini" ? C.emeraldLight : C.amberLight,
                  color: extract.provider === "gemini" ? C.emerald : C.amber,
                }}
              >
                {extract.provider === "gemini" ? "AI OCR" : "Sample"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div
                key={`${line.name}-${idx}`}
                className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr] gap-2 rounded-xl border p-3"
                style={{ borderColor: C.slate100, background: C.slate50 }}
              >
                <div>
                  <div style={{ fontSize: 11, color: C.slate400 }}>Bill item</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>{line.name}</div>
                  <select
                    value={line.matchedInventoryItemId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      const match = stock.find((s) => s.id === id);
                      updateLine(idx, {
                        matchedInventoryItemId: id,
                        matchedName: match?.name ?? null,
                      });
                    }}
                    className="mt-1 w-full px-2 py-1.5 rounded-lg border text-xs"
                    style={{ borderColor: C.slate200, color: C.navy }}
                  >
                    <option value="">— not matched —</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slate400 }}>
                    Qty ({line.unit || metaFor(line.matchedName ?? line.name).purchaseUom})
                  </div>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={line.qty}
                    onChange={(e) => updateLine(idx, { qty: Number(e.target.value) })}
                    className="mt-1 w-full px-2 py-1.5 rounded-lg border text-sm font-semibold"
                    style={{ borderColor: C.slate200, color: C.navy }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slate400 }}>Rate ₹</div>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={line.rate ?? ""}
                    onChange={(e) =>
                      updateLine(idx, {
                        rate: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="mt-1 w-full px-2 py-1.5 rounded-lg border text-sm"
                    style={{ borderColor: C.slate200, color: C.navy }}
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div style={{ fontSize: 11, color: C.slate400 }}>Line total</div>
                    <div style={{ fontWeight: 700, color: C.navy }}>
                      {formatINR(line.total ?? (line.rate ?? 0) * line.qty)}
                    </div>
                  </div>
                  {!line.matchedInventoryItemId && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>Unmatched</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setExtract(null);
                setLines([]);
                setPreview(null);
              }}
              className="px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer bg-white"
              style={{ borderColor: C.slate200, color: C.slate600 }}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={apply}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-50"
              style={{ background: C.navy }}
            >
              {pending ? "Applying…" : "Apply to stock"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function RecipesPanel({
  recipes,
  selected,
  onSelect,
}: {
  recipes: RecipeCostRow[];
  selected?: RecipeCostRow;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: C.slate100 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Plate costing</div>
          <div style={{ fontSize: 12, color: C.slate400 }}>
            Every dish mapped to raw ingredients · live food cost %
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: C.slate100 }}>
          {recipes.map((r) => {
            const eng = ENG_STYLE[r.engineering];
            const active = selected?.menuItemId === r.menuItemId;
            return (
              <button
                key={r.menuItemId}
                type="button"
                onClick={() => onSelect(r.menuItemId)}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer border-none"
                style={{ background: active ? `${C.navy}06` : "white" }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{r.name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: eng.bg, color: eng.color }}
                    >
                      {eng.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.slate400, marginTop: 2 }}>
                    Sell {formatINR(r.price)} · plate {formatINR(r.plateCost)} · margin{" "}
                    {r.marginPct.toFixed(0)}%
                  </div>
                </div>
                <div className="text-right">
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: r.foodCostPct > 35 ? C.red : C.emerald,
                    }}
                  >
                    {r.foodCostPct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 10, color: C.slate400 }}>food cost</div>
                </div>
              </button>
            );
          })}
          {!recipes.length && (
            <p className="px-5 py-8 text-sm" style={{ color: C.slate400 }}>
              No recipes linked yet. Map ingredients to menu items in seed / admin.
            </p>
          )}
        </div>
      </Card>

      {selected && (
        <Card className="p-5 h-fit">
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>{selected.name}</div>
          <div style={{ fontSize: 12, color: C.slate400, marginBottom: 16 }}>Bill of materials</div>
          <div className="space-y-2 mb-4">
            {selected.lines.map((l) => (
              <div
                key={l.ingredient}
                className="flex justify-between text-sm rounded-lg px-3 py-2"
                style={{ background: C.slate50 }}
              >
                <span style={{ color: C.slate700 }}>
                  {l.ingredient}{" "}
                  <span style={{ color: C.slate400 }}>
                    · {fmtQty(l.qty, l.unit)}
                  </span>
                </span>
                <span style={{ fontWeight: 600, color: C.navy }}>{formatINR(l.cost)}</span>
              </div>
            ))}
            {!selected.lines.length && (
              <p style={{ fontSize: 13, color: C.slate400 }}>No ingredients mapped.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Plate cost", value: formatINR(selected.plateCost) },
              { label: "Menu price", value: formatINR(selected.price) },
              { label: "Contribution", value: formatINR(selected.margin) },
              {
                label: "At 30% target",
                value: formatINR(selected.plateCost / 0.3),
              },
            ].map((x) => (
              <div
                key={x.label}
                className="rounded-xl p-3"
                style={{ background: `${C.navy}08` }}
              >
                <div style={{ fontSize: 11, color: C.slate400 }}>{x.label}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{x.value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function VariancePanel({ data }: { data: InventoryBundle }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ borderColor: C.slate100 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>
          Theoretical vs actual usage
        </div>
        <div style={{ fontSize: 12, color: C.slate400 }}>
          Positive variance = more used than recipes explain — over-portioning, waste, or leakage
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.slate50, color: C.slate400, fontSize: 11, textAlign: "left" }}>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-3 py-3 font-semibold">Theoretical</th>
              <th className="px-3 py-3 font-semibold">Actual</th>
              <th className="px-3 py-3 font-semibold">Variance</th>
              <th className="px-3 py-3 font-semibold">₹ Impact</th>
              <th className="px-5 py-3 font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {data.variance.map((v) => {
              const bad = Math.abs(v.variancePct) > 5;
              const warn = Math.abs(v.variancePct) > 2;
              return (
                <tr key={v.name} className="border-t" style={{ borderColor: C.slate100 }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: C.navy }}>
                    {v.name}
                  </td>
                  <td className="px-3 py-3" style={{ color: C.slate600 }}>
                    {fmtQty(v.theoretical, v.unit)}
                  </td>
                  <td className="px-3 py-3" style={{ color: C.slate600 }}>
                    {fmtQty(v.actual, v.unit)}
                  </td>
                  <td className="px-3 py-3 font-semibold" style={{ color: bad ? C.red : C.slate700 }}>
                    {v.varianceQty > 0 ? "+" : ""}
                    {fmtQty(v.varianceQty, v.unit)}
                  </td>
                  <td className="px-3 py-3" style={{ color: C.navy, fontWeight: 600 }}>
                    {formatINR(Math.abs(v.varianceValue))}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{
                        background: bad ? C.redLight : warn ? C.amberLight : C.emeraldLight,
                        color: bad ? C.red : warn ? C.amber : C.emerald,
                      }}
                    >
                      {v.variancePct > 0 ? "+" : ""}
                      {v.variancePct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WastePanel({
  data,
  mode,
  pending,
  onWaste,
}: {
  data: InventoryBundle;
  mode: "live" | "promo";
  pending: boolean;
  onWaste: (item: InventoryStockRow, reason?: "spoilage" | "expiry") => void;
}) {
  const perishable = data.stock.filter((s) => s.perishable).slice(0, 6);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Waste log</div>
            <div style={{ fontSize: 12, color: C.slate400 }}>
              Total {formatINR(data.kpis.wasteValue)} this window
            </div>
          </div>
          <Trash2 size={18} color={C.red} />
        </div>
        <div className="space-y-2">
          {data.waste.map((w) => (
            <div
              key={w.id}
              className="flex justify-between gap-3 rounded-xl border px-3.5 py-3"
              style={{ borderColor: C.slate100, background: C.slate50 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{w.name}</div>
                <div style={{ fontSize: 12, color: C.slate400 }}>
                  {fmtQty(w.qty, w.unit)} · {w.reason} · {ago(w.when)}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: C.red }}>{formatINR(w.cost)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
          Quick write-off
        </div>
        <div style={{ fontSize: 12, color: C.slate400, marginBottom: 14 }}>
          Perishables first — log spoilage or expiry in one tap
        </div>
        <div className="space-y-2">
          {perishable.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor: C.slate200 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.slate400 }}>
                  {fmtQty(s.qty, s.unit)} on hand
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={pending || mode !== "live"}
                  onClick={() => onWaste(s, "expiry")}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer disabled:opacity-50"
                  style={{ borderColor: C.slate200, background: "white", color: C.amber }}
                >
                  Expiry
                </button>
                <button
                  type="button"
                  disabled={pending || mode !== "live"}
                  onClick={() => onWaste(s, "spoilage")}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white border-none cursor-pointer disabled:opacity-50"
                  style={{ background: C.red }}
                >
                  Spoilage
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AnalyticsPanel({ data }: { data: InventoryBundle }) {
  const maxCat = Math.max(...data.spendByCategory.map((c) => c.value), 1);
  const engCounts = {
    star: data.recipes.filter((r) => r.engineering === "star").length,
    plowhorse: data.recipes.filter((r) => r.engineering === "plowhorse").length,
    puzzle: data.recipes.filter((r) => r.engineering === "puzzle").length,
    dog: data.recipes.filter((r) => r.engineering === "dog").length,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
          Stock value by category
        </div>
        <div style={{ fontSize: 12, color: C.slate400, marginBottom: 16 }}>
          Working capital locked in inventory
        </div>
        <div className="space-y-3">
          {data.spendByCategory.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.slate700, fontWeight: 500 }}>{c.name}</span>
                <span style={{ color: C.navy, fontWeight: 700 }}>
                  {formatINR(c.value)} · {c.pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: C.slate100 }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(c.value / maxCat) * 100}%`,
                    background: `linear-gradient(90deg, ${C.navy}, ${C.orange})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
          Menu engineering
        </div>
        <div style={{ fontSize: 12, color: C.slate400, marginBottom: 16 }}>
          Popularity × contribution margin
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(
            [
              ["star", "Stars", C.emerald],
              ["plowhorse", "Plowhorses", C.amber],
              ["puzzle", "Puzzles", C.cyan],
              ["dog", "Dogs", C.red],
            ] as const
          ).map(([key, label, color]) => (
            <div
              key={key}
              className="rounded-xl p-4"
              style={{ background: `${color}12`, border: `1px solid ${color}30` }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{engCounts[key]}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.slate700 }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            {
              label: "Est. COGS",
              value: formatINR(data.kpis.cogsEstimate),
              icon: <ArrowDownRight size={14} color={C.red} />,
            },
            {
              label: "Avg dish margin",
              value: `${data.kpis.avgMarginPct.toFixed(0)}%`,
              icon: <ArrowUpRight size={14} color={C.emerald} />,
            },
            {
              label: "Waste",
              value: formatINR(data.kpis.wasteValue),
              icon: <Trash2 size={14} color={C.amber} />,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{ background: C.slate50 }}
            >
              <span className="flex items-center gap-2 text-sm" style={{ color: C.slate600 }}>
                {row.icon}
                {row.label}
              </span>
              <span style={{ fontWeight: 700, color: C.navy }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 12 }}>
          Recent stock movements
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.movements.slice(0, 8).map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border px-3.5 py-2.5"
              style={{ borderColor: C.slate100 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>
                  {m.ingredientName}
                </div>
                <div style={{ fontSize: 11, color: C.slate400 }}>
                  {m.type} · {ago(m.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: m.delta >= 0 ? C.emerald : C.red,
                  }}
                >
                  {m.delta >= 0 ? "+" : ""}
                  {fmtQty(m.delta, m.unit)}
                </div>
                <div style={{ fontSize: 11, color: C.slate400 }}>{formatINR(m.value)}</div>
              </div>
            </div>
          ))}
          {!data.movements.length && (
            <p style={{ fontSize: 13, color: C.slate400 }}>No movements yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
