"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  CheckCircle,
  ChefHat,
  ChevronRight,
  ConciergeBell,
  Home,
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UtensilsCrossed,
} from "lucide-react";
import { C } from "@/lib/constants";
import type { AnalyticsBundle } from "@/lib/analytics/compute";
import type { DashboardOps } from "@/lib/analytics/types";
import { formatINR } from "@/lib/utils";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { StatusDot } from "@/components/shared/StatusDot";
import { InventoryActions } from "@/components/dashboard/InventoryActions";
import { StaffManager } from "@/components/dashboard/StaffManager";
import { KitchenClient } from "@/components/kitchen/KitchenClient";
import { WaiterClient } from "@/components/waiter/WaiterClient";
import type { MemberRole } from "@/types/database";

const PIE_COLORS = [C.navy, C.orange, C.emerald, C.purple, C.cyan, C.slate400];

type TabId =
  | "overview"
  | "analytics"
  | "orders"
  | "tables"
  | "inventory"
  | "staff"
  | "kitchen"
  | "waiter";

const TAB_TITLES: Record<TabId, string> = {
  overview: "Overview",
  analytics: "Analytics",
  orders: "Orders",
  tables: "Tables",
  inventory: "Inventory",
  staff: "Users",
  kitchen: "Kitchen",
  waiter: "Waiter",
};

type Props = {
  mode: "live" | "promo";
  analytics: AnalyticsBundle;
  ops: DashboardOps;
  canViewUsers?: boolean;
  actorName?: string;
  actorRole?: MemberRole;
  assignableRoles?: MemberRole[];
  kitchenIngredients?: { id: string; name: string }[];
  initialTab?: TabId;
  /** Preformatted on the server to avoid locale hydration mismatches */
  dateLabel: string;
};

export function ExecutiveDashboard({
  mode,
  analytics,
  ops,
  canViewUsers = false,
  actorName = "Manager",
  actorRole,
  assignableRoles = [],
  kitchenIngredients = [],
  initialTab = "overview",
  dateLabel,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [range, setRange] = useState<"1D" | "1W" | "2W">("1W");

  const navItems = useMemo(() => {
    const items: { id: TabId; label: string; icon: ReactNode; href?: string; section?: string }[] = [
      { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
      { id: "analytics", label: "Analytics", icon: <BarChart3 size={17} /> },
      { id: "orders", label: "Orders", icon: <ShoppingBag size={17} /> },
      { id: "tables", label: "Tables", icon: <UtensilsCrossed size={17} /> },
      { id: "inventory", label: "Inventory", icon: <Package size={17} /> },
    ];
    if (mode === "live" && canViewUsers) {
      items.push({
        id: "staff",
        label: "Users",
        icon: <UserCheck size={17} />,
      });
    }
    items.push(
      {
        id: "kitchen",
        label: "Kitchen",
        icon: <ChefHat size={17} />,
        href: mode === "promo" ? "/demo/kds" : undefined,
        section: "floor",
      },
      {
        id: "waiter",
        label: "Waiter",
        icon: <ConciergeBell size={17} />,
        href: mode === "promo" ? "/staff/login" : undefined,
        section: "floor",
      }
    );
    return items;
  }, [mode, canViewUsers]);

  const trend = useMemo(() => {
    if (range === "1D")
      return analytics.hourly.map((h) => ({ label: h.hour, revenue: h.revenue, orders: 0 }));
    if (range === "1W")
      return analytics.daily
        .slice(-7)
        .map((d) => ({ label: d.day, revenue: d.revenue, orders: d.orders }));
    return analytics.daily.map((d) => ({
      label: d.day,
      revenue: d.revenue,
      orders: d.orders,
    }));
  }, [analytics, range]);

  function selectTab(id: TabId) {
    setTab(id);
    if (mode === "live") {
      const url = id === "overview" ? "/dashboard" : `/dashboard?tab=${id}`;
      router.replace(url, { scroll: false });
    }
  }

  function onNav(item: (typeof navItems)[number]) {
    if (item.href) {
      router.push(item.href);
      return;
    }
    selectTab(item.id);
  }

  const health = analytics.health;
  const circumference = 2 * Math.PI * 52;

  return (
    <div
      className="flex flex-col md:flex-row h-screen overflow-hidden"
      style={{ background: C.slate50, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="w-full md:w-[240px] flex-shrink-0 flex flex-row md:flex-col overflow-x-auto z-30"
        style={{ background: C.navy }}
      >
        <div className="p-3 md:p-5 md:border-b border-white/10 flex flex-row md:flex-col items-center md:items-start flex-shrink-0">
          <div className="flex items-center gap-3 md:mb-2">
            <img
              src="/image.png"
              alt="Neural Kitchen"
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover"
            />
            <div className="hidden md:block">
              <div className="font-bold text-sm text-white">Neural Kitchen</div>
              <div className="text-[11px] text-white/50">
                {mode === "live" ? "Executive Console" : "Promo Preview"}
              </div>
            </div>
          </div>
          <p className="hidden md:block text-[11px] text-white/40 mt-1 truncate max-w-[200px]">
            {analytics.restaurantName}
          </p>
        </div>

        <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col gap-2 items-center md:items-stretch overflow-x-auto">
          <div className="hidden md:block text-[10px] font-semibold text-white/40 tracking-wider px-2 mb-1">
            MODULES
          </div>
          {navItems.map((item, idx) => {
            const active = !item.href && tab === item.id;
            const showFloorLabel =
              item.section === "floor" &&
              (idx === 0 || navItems[idx - 1]?.section !== "floor");
            return (
              <div key={item.id} className="contents md:block md:w-full">
                {showFloorLabel && (
                  <div className="hidden md:block text-[10px] font-semibold text-white/40 tracking-wider px-2 mt-3 mb-1">
                    FLOOR
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onNav(item)}
                  className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-[9px] rounded-lg border-none text-[13px] md:text-[14px] cursor-pointer transition-all whitespace-nowrap ${
                    active
                      ? "bg-white/10 text-white font-semibold"
                      : "bg-transparent text-white/55 font-normal hover:bg-white/5"
                  }`}
                  style={{ width: "100%" }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {active && <ChevronRight size={13} className="hidden md:block ml-auto" />}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="hidden md:block p-3 md:p-4 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => router.push(mode === "live" ? "/" : "/demo")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              width: "100%",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Home size={15} /> {mode === "live" ? "Marketing site" : "Back to Demo"}
          </button>
          <div style={{ display: "flex", gap: 10, padding: "8px 10px", alignItems: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: C.orange,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "white",
              }}
            >
              {actorName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{actorName}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {mode === "live" ? "Signed in" : "Showcase"}
              </div>
            </div>
          </div>
          {mode === "live" && (
            <div className="px-2">
              <SignOutButton />
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-20 px-4 md:px-7 h-[60px] flex items-center justify-between border-b"
          style={{
            background: "rgba(248,250,252,0.92)",
            backdropFilter: "blur(12px)",
            borderColor: C.slate200,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.navy }}>
              {TAB_TITLES[tab] ?? "Overview"}
            </div>
            <div style={{ fontSize: 12, color: C.slate400 }}>{dateLabel}</div>
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <div
              className="hidden md:flex px-3 py-[6px] rounded-lg text-[13px] font-semibold items-center gap-2"
              style={{ background: C.emeraldLight, color: C.emerald }}
            >
              <div className="w-[7px] h-[7px] rounded-full" style={{ background: C.emerald }} />
              {mode === "live" ? "Live · grounded on DB" : "Promo preview"}
            </div>
            <button
              type="button"
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg border bg-white flex items-center justify-center relative cursor-pointer"
              style={{ borderColor: C.slate200 }}
              aria-label="Notifications"
            >
              <Bell size={16} color={C.slate600} />
              {(ops.activeOrderCount > 0 || analytics.activity.some((a) => a.tone === "warn")) && (
                <div
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                  style={{ background: C.orange }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                mode === "live" ? selectTab("waiter") : router.push("/staff/login")
              }
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border font-semibold text-[12px] md:text-[13px] cursor-pointer whitespace-nowrap bg-white"
              style={{ borderColor: C.slate200, color: C.navy }}
            >
              Waiter
            </button>
            <button
              type="button"
              onClick={() =>
                mode === "live" ? selectTab("kitchen") : router.push("/demo/kds")
              }
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-none text-white font-semibold text-[12px] md:text-[13px] cursor-pointer whitespace-nowrap"
              style={{ background: C.navy }}
            >
              Open KDS
            </button>
          </div>
        </header>

        <div className="p-4 md:p-7">
          {tab === "overview" && (
            <OverviewTab
              analytics={analytics}
              ops={ops}
              mode={mode}
              trend={trend}
              range={range}
              setRange={setRange}
              health={health}
              circumference={circumference}
              onOpenAnalytics={() => selectTab("analytics")}
              onOpenOrders={() => selectTab("orders")}
              onOpenTables={() => selectTab("tables")}
              onOpenMenu={() =>
                router.push(
                  mode === "live" ? `/r/${ops.restaurantSlug}/menu` : "/demo/menu"
                )
              }
              onOpenKds={() =>
                mode === "live" ? selectTab("kitchen") : router.push("/demo/kds")
              }
              onOpenWaiter={() =>
                mode === "live" ? selectTab("waiter") : router.push("/staff/login")
              }
            />
          )}
          {tab === "analytics" && (
            <AnalyticsTab analytics={analytics} trend={trend} range={range} setRange={setRange} />
          )}
          {tab === "orders" && <OrdersTab ops={ops} />}
          {tab === "tables" && <TablesTab ops={ops} />}
          {tab === "inventory" && <InventoryTab ops={ops} mode={mode} />}
          {tab === "staff" && canViewUsers && actorRole && (
            <StaffTab actorRole={actorRole} assignableRoles={assignableRoles} />
          )}
          {tab === "kitchen" && mode === "live" && (
            <KitchenClient
              restaurantId={ops.restaurantId}
              initialTickets={[]}
              ingredients={kitchenIngredients}
              embedded
            />
          )}
          {tab === "waiter" && mode === "live" && (
            <WaiterClient
              restaurantId={ops.restaurantId}
              initialTables={[]}
              initialRequests={[]}
              initialReady={[]}
              embedded
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  analytics,
  ops,
  mode,
  trend,
  range,
  setRange,
  health,
  circumference,
  onOpenAnalytics,
  onOpenOrders,
  onOpenTables,
  onOpenMenu,
  onOpenKds,
  onOpenWaiter,
}: {
  analytics: AnalyticsBundle;
  ops: DashboardOps;
  mode: "live" | "promo";
  trend: { label: string; revenue: number; orders: number }[];
  range: "1D" | "1W" | "2W";
  setRange: (r: "1D" | "1W" | "2W") => void;
  health: AnalyticsBundle["health"];
  circumference: number;
  onOpenAnalytics: () => void;
  onOpenOrders: () => void;
  onOpenTables: () => void;
  onOpenMenu: () => void;
  onOpenKds: () => void;
  onOpenWaiter: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={22} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.orange,
              letterSpacing: "0.06em",
              marginBottom: 3,
            }}
          >
            AI COPILOT · {analytics.insights.length} INSIGHTS
          </div>
          <div style={{ fontSize: 14, color: "white", fontWeight: 500 }}>
            {analytics.insights[0]}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAnalytics}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Full analytics →
        </button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {analytics.kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[16px] p-4 md:p-5 border shadow-sm"
            style={{ borderColor: C.slate200 }}
          >
            <div style={{ fontSize: 12, color: C.slate400, fontWeight: 500, marginBottom: 10 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 6 }}>
              {kpi.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {kpi.positive ? (
                <TrendingUp size={12} color={C.emerald} />
              ) : (
                <TrendingDown size={12} color={C.amber} />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: kpi.positive ? C.emerald : C.amber,
                }}
              >
                {kpi.delta}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-4 md:gap-5 mb-6">
        <section
          className="bg-white rounded-[20px] p-5 md:p-6 border"
          style={{ borderColor: C.slate200 }}
        >
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Revenue trend</div>
              <div style={{ fontSize: 13, color: C.slate400 }}>
                {mode === "live" ? "From live orders" : "Showcase sample"}
              </div>
            </div>
            <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: C.slate200 }}>
              {(["1D", "1W", "2W"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: range === r ? C.navy : "transparent",
                    color: range === r ? "white" : C.slate600,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="execRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.navy} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: C.slate400 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              />
              <Tooltip
                formatter={(v) => [formatINR(Number(v ?? 0)), "Revenue"]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke={C.navy} strokeWidth={2.5} fill="url(#execRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section
          className="bg-white rounded-[20px] p-5 md:p-6 border flex flex-col"
          style={{ borderColor: C.slate200 }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Restaurant health</div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 12 }}>
            Feedback · prep · inventory
          </div>
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 16px" }}>
            <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="52" fill="none" stroke={C.slate100} strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke={C.emerald}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (health.score / 100) * circumference}
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: C.navy }}>{health.score}</div>
              <div style={{ fontSize: 11, color: C.slate400 }}>/ 100</div>
            </div>
          </div>
          {[
            ["Guest satisfaction", health.guest, C.emerald],
            ["Food quality", health.food, C.cyan],
            ["Service speed", health.speed, C.orange],
            ["Inventory health", health.inventory, C.purple],
          ].map(([label, val, color]) => (
            <div key={String(label)} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: C.slate600 }}>{label}</span>
                <span style={{ fontWeight: 700, color: C.navy }}>{val}%</span>
              </div>
              <div style={{ height: 5, background: C.slate100, borderRadius: 99 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${val}%`,
                    background: String(color),
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <section className="bg-white rounded-[20px] p-5 md:p-6 border" style={{ borderColor: C.slate200 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Sales by category</div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 16 }}>Revenue mix</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={analytics.categories}
                  dataKey="pct"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                >
                  {analytics.categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {analytics.categories.map((c, i) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.slate600 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    {c.name}
                  </span>
                  <span style={{ fontWeight: 700, color: C.navy }}>{c.pct}%</span>
                </div>
              ))}
              {!analytics.categories.length && (
                <p style={{ fontSize: 13, color: C.slate400 }}>Place orders to populate</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[20px] p-5 md:p-6 border" style={{ borderColor: C.slate200 }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Live activity</div>
              <div style={{ fontSize: 13, color: C.slate400 }}>Floor + system events</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 8,
                background: C.emeraldLight,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.emerald }}>Live</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analytics.activity.map((a, i) => (
              <div key={`${a.text}-${i}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background:
                      a.tone === "warn"
                        ? C.amberLight
                        : a.tone === "ok"
                          ? C.emeraldLight
                          : C.slate100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      a.tone === "warn" ? C.amber : a.tone === "ok" ? C.emerald : C.navy,
                    flexShrink: 0,
                  }}
                >
                  {a.tone === "warn" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.slate700, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: C.slate400, marginTop: 2 }}>{a.ago}</div>
                </div>
              </div>
            ))}
            {!analytics.activity.length && (
              <p style={{ fontSize: 13, color: C.slate400 }}>No recent events</p>
            )}
          </div>
        </section>
      </div>

      {/* Ops: floor + orders — promotional + operational */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <section className="bg-white rounded-[20px] p-5 md:p-6 border" style={{ borderColor: C.slate200 }}>
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
                Live orders
              </div>
              <div style={{ fontSize: 13, color: C.slate400, marginBottom: 12 }}>
                {ops.activeOrderCount} active · recent window
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenOrders}
              style={{
                border: "none",
                background: "transparent",
                color: C.orange,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {ops.liveOrders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: C.slate100, background: C.slate50 }}
              >
                <span style={{ color: C.slate700 }}>
                  T{o.tableNumber ?? "?"} · #{o.displayId ?? o.id.slice(0, 4)} ·{" "}
                  <span className="capitalize">{o.status.replace("_", " ")}</span>
                </span>
                <span className="font-semibold" style={{ color: C.navy }}>
                  {formatINR(o.total)}
                </span>
              </div>
            ))}
            {!ops.liveOrders.length && (
              <p style={{ fontSize: 13, color: C.slate400 }}>No orders yet</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-[20px] p-5 md:p-6 border" style={{ borderColor: C.slate200 }}>
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
                Floor map
              </div>
              <div style={{ fontSize: 13, color: C.slate400, marginBottom: 12 }}>
                {ops.occupiedTables} occupied
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenTables}
              style={{
                border: "none",
                background: "transparent",
                color: C.orange,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Manage →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ops.tables.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border p-3 text-center"
                style={{ borderColor: C.slate200, background: C.slate50 }}
              >
                <div className="flex items-center justify-center gap-1">
                  <StatusDot status={t.status} />
                  <span className="font-semibold" style={{ color: C.navy }}>
                    T{t.number}
                  </span>
                </div>
                <p className="mt-1 text-[10px] capitalize" style={{ color: C.slate400 }}>
                  {t.status.replace("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onOpenMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            border: `1px solid ${C.orange}30`,
            background: `${C.orange}08`,
            color: C.orange,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {mode === "live" ? "Customer menu" : "Open menu board"}
        </button>
        <button
          type="button"
          onClick={onOpenKds}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            border: `1px solid ${C.emerald}30`,
            background: `${C.emerald}08`,
            color: C.emerald,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Kitchen display
        </button>
        <button
          type="button"
          onClick={onOpenWaiter}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            border: `1px solid ${C.cyan}30`,
            background: `${C.cyan}08`,
            color: C.cyan,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Waiter panel
        </button>
      </div>
    </>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 20, color: C.navy }}>{title}</div>
      <div style={{ fontSize: 13, color: C.slate400, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

function OpsCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border"
      style={{ borderColor: C.slate200 }}
    >
      {children}
    </div>
  );
}

function OrdersTab({ ops }: { ops: DashboardOps }) {
  return (
    <div className="max-w-3xl">
      <PanelHeader
        title="Orders"
        subtitle={`${ops.liveOrders.length} recent · ${ops.activeOrderCount} still active on the floor`}
      />
      <div className="space-y-2">
        {ops.liveOrders.map((order) => (
          <OpsCard key={order.id}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: C.navy }}>
                Table {order.tableNumber ?? "—"}
                {order.displayId ? (
                  <span style={{ fontWeight: 500, color: C.slate400 }}> · #{order.displayId}</span>
                ) : null}
              </p>
              <p className="capitalize" style={{ fontSize: 13, color: C.slate400 }}>
                {order.status.replace("_", " ")}
              </p>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>
              {formatINR(order.total)}
            </span>
          </OpsCard>
        ))}
        {!ops.liveOrders.length && (
          <p style={{ fontSize: 14, color: C.slate400 }}>No orders yet for this restaurant.</p>
        )}
      </div>
    </div>
  );
}

function TablesTab({ ops }: { ops: DashboardOps }) {
  return (
    <div className="max-w-3xl">
      <PanelHeader
        title="Tables"
        subtitle={`${ops.occupiedTables} occupied · open a QR session for guest ordering`}
      />
      <div className="space-y-2">
        {ops.tables.map((table) => {
          const href = table.qrToken
            ? `${ops.appUrl}/r/${ops.restaurantSlug}/t/${table.qrToken}`
            : null;
          return (
            <OpsCard key={table.id}>
              <div className="flex items-center gap-2">
                <StatusDot status={table.status} />
                <span style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>
                  T{table.number}
                </span>
                <span className="capitalize" style={{ fontSize: 13, color: C.slate400 }}>
                  {table.status.replace("_", " ")}
                </span>
              </div>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: C.navy }}
                >
                  Open QR session
                </a>
              ) : (
                <span style={{ fontSize: 12, color: C.slate400 }}>No QR token</span>
              )}
            </OpsCard>
          );
        })}
      </div>
    </div>
  );
}

function InventoryTab({ ops, mode }: { ops: DashboardOps; mode: "live" | "promo" }) {
  return (
    <div className="max-w-3xl">
      <PanelHeader
        title="Inventory risk"
        subtitle="Stock is live-decremented on every order. Paneer is seeded low for the 86 demo."
      />
      <div className="space-y-2">
        {ops.inventory.map((item) => {
          const low = item.qty <= item.lowThreshold;
          return (
            <OpsCard key={item.id}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: C.navy }}>{item.name}</p>
                <p
                  style={{
                    fontSize: 13,
                    color: low ? C.amber : C.slate400,
                    fontWeight: low ? 600 : 400,
                  }}
                >
                  {item.qty} {item.unit}
                  {low ? " · below threshold" : ""}
                </p>
              </div>
              {mode === "live" ? (
                <InventoryActions inventoryItemId={item.id} />
              ) : (
                <div className="flex gap-2">
                  <span
                    className="px-3 py-1.5 rounded-lg border text-xs"
                    style={{ borderColor: C.slate200, color: C.slate400 }}
                  >
                    -5
                  </span>
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs text-white"
                    style={{ background: C.navy }}
                  >
                    +20 restock
                  </span>
                </div>
              )}
            </OpsCard>
          );
        })}
        {!ops.inventory.length && (
          <p style={{ fontSize: 14, color: C.slate400 }}>No inventory rows yet.</p>
        )}
      </div>
    </div>
  );
}

function StaffTab({
  actorRole,
  assignableRoles,
}: {
  actorRole: MemberRole;
  assignableRoles: MemberRole[];
}) {
  return (
    <div className="max-w-3xl">
      <PanelHeader
        title="Users"
        subtitle="Person-based accounts · invite-only · role-gated"
      />
      <div
        className="bg-white rounded-[20px] border p-4 md:p-5"
        style={{ borderColor: C.slate200 }}
      >
        <StaffManager actorRole={actorRole} assignableRoles={assignableRoles} />
      </div>
    </div>
  );
}

function AnalyticsTab({
  analytics,
  trend,
  range,
  setRange,
}: {
  analytics: AnalyticsBundle;
  trend: { label: string; revenue: number; orders: number }[];
  range: "1D" | "1W" | "2W";
  setRange: (r: "1D" | "1W" | "2W") => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div style={{ fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 4 }}>
          Analytics suite
        </div>
        <div style={{ fontSize: 14, color: C.slate400 }}>
          Deep-dive · {analytics.restaurantName} · {formatINR(analytics.totals.revenue)} sample
          window
        </div>
      </div>

      <ul className="bg-white rounded-[16px] border p-4 space-y-2" style={{ borderColor: C.slate200 }}>
        {analytics.insights.map((line) => (
          <li key={line} style={{ fontSize: 14, color: C.slate600, lineHeight: 1.5 }}>
            · {line}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-[20px] p-5 border" style={{ borderColor: C.slate200 }}>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>Orders over time</div>
            <div className="flex gap-1">
              {(["1D", "1W", "2W"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: `1px solid ${range === r ? C.navy : C.slate200}`,
                    background: range === r ? C.navy : "white",
                    color: range === r ? "white" : C.slate600,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }} />
              <Bar
                dataKey={range === "1D" ? "revenue" : "orders"}
                fill={C.orange}
                radius={[6, 6, 0, 0]}
                name={range === "1D" ? "Revenue" : "Orders"}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-[20px] p-5 border" style={{ borderColor: C.slate200 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 12 }}>
            Revenue vs window
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="aTabRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.navy} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [formatINR(Number(v ?? 0)), "Revenue"]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke={C.navy} strokeWidth={2} fill="url(#aTabRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-[20px] p-5 border" style={{ borderColor: C.slate200 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>
            Top dishes
          </div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 12 }}>Qty sold</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={analytics.topDishes.slice(0, 6)}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.slate400 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 10, fill: C.slate600 }}
              />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }} />
              <Bar dataKey="qty" fill={C.cyan} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-[20px] p-5 border" style={{ borderColor: C.slate200 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>
            Hourly revenue
          </div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 12 }}>
            Service-day profile (10:00–23:00)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: C.slate400 }} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} />
              <Tooltip
                formatter={(v) => [formatINR(Number(v ?? 0)), "Revenue"]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill={C.navy} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
