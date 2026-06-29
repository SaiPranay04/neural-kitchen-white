"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, UtensilsCrossed, Package, Users, UserCheck, BarChart3, Search, ChevronRight, Home, Flame, Brain, Target, DollarSign, ShoppingBag, TrendingUp, TrendingDown, Bell, ArrowUpRight, CheckCircle, AlertTriangle, ShoppingCart, Star, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { C, REVENUE_DATA, CATEGORY_DATA } from "@/lib/constants";

export default function AdminDashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={17} /> },
    { id: "menu_mgmt", label: "Menu", icon: <UtensilsCrossed size={17} /> },
    { id: "staff", label: "Staff", icon: <UserCheck size={17} /> },
    { id: "inventory", label: "Inventory", icon: <Package size={17} /> },
    { id: "crm", label: "CRM", icon: <Users size={17} /> },
  ];

  const healthScore = 94;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (healthScore / 100) * circumference;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.slate50, fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: 240, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src="/image.png" alt="Neural Kitchen Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Neural Kitchen</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Admin Console</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <Search size={13} color="rgba(255,255,255,0.4)" />
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Search...</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", padding: "4px 8px", marginBottom: 4 }}>MODULES</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: activePage === item.id ? "rgba(255,255,255,0.12)" : "transparent", color: activePage === item.id ? "white" : "rgba(255,255,255,0.55)", fontWeight: activePage === item.id ? 600 : 400, fontSize: 14, cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%" }}>
              {item.icon} {item.label}
              {activePage === item.id && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", width: "100%", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>
            <Home size={15} /> Back to Home
          </button>
          <div style={{ display: "flex", gap: 10, padding: "8px 10px", alignItems: "center", marginTop: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>SM</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Sai M.</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Owner · Vezora</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* TOP BAR */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(248,250,252,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.slate200}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.navy }}>
              {navItems.find(n => n.id === activePage)?.label || "Overview"}
            </div>
            <div style={{ fontSize: 12, color: C.slate400 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: C.emeraldLight, color: C.emerald, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald }} />
              All Systems Operational
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Bell size={16} color={C.slate600} />
              <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: C.orange, border: "2px solid white" }} />
            </button>
            <button onClick={() => router.push("/kds")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Open KDS
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {activePage === "overview" && (
            <OverviewContent healthScore={healthScore} circumference={circumference} dashOffset={dashOffset} router={router} />
          )}
          {activePage === "analytics" && <AnalyticsContent />}
          {activePage !== "overview" && activePage !== "analytics" && (
            <PlaceholderContent module={navItems.find(n => n.id === activePage)} />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewContent({ healthScore, circumference, dashOffset, router }: any) {
  return (
    <>
      {/* AI ALERT */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 16, padding: "18px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Brain size={22} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: "0.06em", marginBottom: 3 }}>AI COPILOT · 3 INSIGHTS</div>
          <div style={{ fontSize: 14, color: "white", fontWeight: 500 }}>Tonight's dinner revenue is tracking 23% above last Friday. Recommend extending kitchen hours by 45 min. Inventory alert: mozzarella stock is at 15% — auto-reorder triggered.</div>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          View All →
        </button>
      </motion.div>

      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Today's Revenue", val: "$8,412", change: "+18.2%", up: true, color: C.navy, icon: <DollarSign size={17} /> },
          { label: "Total Orders", val: "147", change: "+23", up: true, color: C.orange, icon: <ShoppingBag size={17} /> },
          { label: "Avg Order Value", val: "$57.23", change: "+$4.10", up: true, color: C.purple, icon: <TrendingUp size={17} /> },
          { label: "Table Turnover", val: "2.8×", change: "+0.4×", up: true, color: C.emerald, icon: <RefreshCw size={17} /> },
          { label: "Profit Margin", val: "34.8%", change: "+2.1%", up: true, color: C.cyan, icon: <Target size={17} /> },
        ].map(({ label, val, change, up, color, icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.slate200}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: C.slate400, fontWeight: 500 }}>{label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{val}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {up ? <TrendingUp size={12} color={C.emerald} /> : <TrendingDown size={12} color={C.red} />}
              <span style={{ fontSize: 12, fontWeight: 600, color: up ? C.emerald : C.red }}>{change}</span>
              <span style={{ fontSize: 11, color: C.slate400 }}>vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 24 }}>
        {/* AREA CHART */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>Revenue Trend</div>
              <div style={{ fontSize: 13, color: C.slate400 }}>7-month performance overview</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["1W", "1M", "3M", "7M"].map((t, i) => (
                <button key={t} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${i === 3 ? C.navy : C.slate200}`, background: i === 3 ? C.navy : "transparent", color: i === 3 ? "white" : C.slate600, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.navy} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.emerald} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any, n) => [`$${v.toLocaleString()}`, n === "revenue" ? "Revenue" : "Profit"]} contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke={C.navy} strokeWidth={2.5} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="profit" stroke={C.emerald} strokeWidth={2} fill="url(#profGrad)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* HEALTH SCORE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4, alignSelf: "flex-start" }}>Restaurant Health</div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 20, alignSelf: "flex-start" }}>AI-generated composite score</div>

          <div style={{ position: "relative", width: 140, height: 140, marginBottom: 20 }}>
            <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="52" fill="none" stroke={C.slate100} strokeWidth="10" />
              <motion.circle cx="70" cy="70" r="52" fill="none" stroke={`url(#healthGrad)`} strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 - (94 / 100) * 2 * Math.PI * 52 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.emerald} />
                  <stop offset="100%" stopColor={C.cyan} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{ fontSize: 32, fontWeight: 800, color: C.navy }}>94</motion.div>
              <div style={{ fontSize: 11, color: C.slate400, fontWeight: 500 }}>/ 100</div>
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "Guest Satisfaction", val: 97, color: C.emerald },
              { label: "Food Quality", val: 95, color: C.cyan },
              { label: "Service Speed", val: 88, color: C.orange },
              { label: "Inventory Health", val: 92, color: C.purple }].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: C.slate600 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: C.navy }}>{val}%</span>
                </div>
                <div style={{ height: 5, background: C.slate100, borderRadius: 99 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: "100%", background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* CATEGORY CHART */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}` }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>Sales by Category</div>
          <div style={{ fontSize: 13, color: C.slate400, marginBottom: 16 }}>Revenue contribution this month</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
                  {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {CATEGORY_DATA.map(({ name, value, color }) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 13, color: C.slate600 }}>{name}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{value}%</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LIVE ACTIVITY */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Live Activity</div>
              <div style={{ fontSize: 13, color: C.slate400 }}>Real-time floor updates</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: C.redLight }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>Live</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: <CheckCircle size={14} />, text: "Table 7 — Order served (avg 18min)", time: "2m ago", color: C.emerald },
              { icon: <AlertTriangle size={14} />, text: "Table 5 order delayed — Kitchen congestion", time: "4m ago", color: C.amber },
              { icon: <ShoppingCart size={14} />, text: "ORD-1043 placed — Table 12, 2 guests", time: "6m ago", color: C.navy },
              { icon: <Star size={14} />, text: "New 5★ review on Google — 'Wagyu Burger outstanding'", time: "9m ago", color: C.orange },
              { icon: <TrendingUp size={14} />, text: "Revenue milestone: $8,000 crossed for today", time: "14m ago", color: C.purple },
            ].map(({ icon, text, time, color }, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.slate700, lineHeight: 1.4 }}>{text}</div>
                  <div style={{ fontSize: 11, color: C.slate400, marginTop: 2 }}>{time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* QUICK LINKS */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {[{ label: "Open Menu Board", page: "menu", color: C.orange }, { label: "Kitchen Display", page: "kds", color: C.emerald }].map(({ label, page, color }) => (
          <button key={page} onClick={() => router.push(`/${page}`)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: `1px solid ${color}30`, background: `${color}08`, color, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            {label} <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
    </>
  );
}

function AnalyticsContent() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 4 }}>Analytics Suite</div>
        <div style={{ fontSize: 14, color: C.slate400 }}>Deep-dive into your restaurant's performance data</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}` }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 16 }}>Monthly Orders</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 13 }} />
              <Bar dataKey="orders" fill={C.orange} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "24px", border: `1px solid ${C.slate200}` }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 16 }}>Revenue vs Profit</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.navy} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slate200} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.slate400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.slate400 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, fontSize: 13, border: `1px solid ${C.slate200}` }} />
              <Area type="monotone" dataKey="revenue" stroke={C.navy} strokeWidth={2} fill="url(#aRevGrad)" />
              <Area type="monotone" dataKey="profit" stroke={C.emerald} strokeWidth={2} fill="none" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PlaceholderContent({ module }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: C.slate100, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: C.slate400 }}>
        {module?.icon && <span style={{ fontSize: 28 }}>{module.icon}</span>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 8 }}>{module?.label} Module</div>
      <div style={{ fontSize: 15, color: C.slate400, maxWidth: 380 }}>
        This module is fully built in the complete Neural Kitchen OS. Click "Live Demo" on the landing page for the full experience.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 24 }}>
        {["Dashboard View", "Table View", "Export Data", "AI Insights"].map(btn => (
          <button key={btn} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", color: C.navy, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{btn}</button>
        ))}
      </div>
    </motion.div>
  );
}
