"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, CheckCircle, Star, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { C, KDS_ORDERS } from "@/lib/constants";

export default function KDSPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any>({ placed: [], preparing: [], ready: [], served: [] });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        const grouped: any = { placed: [], preparing: [], ready: [], served: [] };
        data.forEach((o: any) => {
          const key = o.stage.toLowerCase();
          if (grouped[key]) grouped[key].push(o);
        });
        setOrders(grouped);
      } catch (err) {
        console.error("Failed to fetch orders");
      }
    };
    
    fetchOrders();
    const t = setInterval(fetchOrders, 2000);
    const clockTimer = setInterval(() => setTime(n => n + 1), 30000);
    return () => {
      clearInterval(t);
      clearInterval(clockTimer);
    };
  }, []);

  const columns = [
    { key: "placed", label: "Placed", color: C.amber, bg: C.amberLight, icon: <Clock size={14} /> },
    { key: "preparing", label: "Preparing", color: C.cyan, bg: C.cyanLight, icon: <Flame size={14} /> },
    { key: "ready", label: "Ready", color: C.emerald, bg: C.emeraldLight, icon: <CheckCircle size={14} /> },
    { key: "served", label: "Served", color: C.slate400, bg: C.slate100, icon: <Star size={14} /> },
  ];

  const advance = async (order: any, fromKey: string) => {
    const keys = ["placed", "preparing", "ready", "served"];
    const toKey = keys[keys.indexOf(fromKey) + 1];
    if (!toKey) return;
    
    const newStage = toKey.charAt(0).toUpperCase() + toKey.slice(1);
    
    // Optimistic UI update
    setOrders((o: any) => ({
      ...o,
      [fromKey]: o[fromKey].filter((x: any) => x.id !== order.id),
      [toKey]: [{ ...order, time: 0, stage: newStage }, ...o[toKey]],
    }));

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, stage: newStage })
      });
    } catch(err) {
      console.error("Failed to update order");
    }
  };

  const priorityStyle: Record<string, any> = {
    urgent: { bg: C.redLight, color: C.red, label: "URGENT" },
    high: { bg: "#FFF7ED", color: C.orange, label: "HIGH" },
    normal: { bg: C.slate100, color: C.slate600, label: "NORMAL" },
  };

  return (
    <div style={{ background: C.slate50, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* KDS HEADER */}
      <div style={{ background: "white", borderBottom: `1px solid ${C.slate200}`, padding: "0 24px" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 md:py-0 md:h-16 gap-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => router.push("/")} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", fontSize: 13, color: C.slate600 }}>← Back</button>
            <div className="font-bold text-[16px] md:text-[20px]" style={{ color: C.navy }}>Kitchen Display System</div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: C.emeraldLight }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.emerald }}>Live</span>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-between md:justify-end w-full md:w-auto">
            <div className="sm:hidden flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: C.emeraldLight }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.emerald }}>Live</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 11, color: C.slate400 }}>Dinner Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI INSIGHT BANNER */}
      <div style={{ maxWidth: 1400, margin: "20px auto 0", padding: "0 24px" }}>
        <motion.div animate={{ x: [0, 0] }} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 md:p-4 rounded-xl" style={{ background: `linear-gradient(135deg, #FFF7ED, #FFFBEB)`, border: `1px solid ${C.amber}40` }}>
          <div className="flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 8, background: `${C.amber}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={16} color={C.amber} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.amber }}>AI FORECAST · </span>
            <span style={{ fontSize: 13, color: C.slate700 }}>Burger station may be overloaded in ~10 minutes based on incoming bookings. Consider pre-prepping 6 additional patties. Table 14 party of 8 arrives at 8:30PM.</span>
          </div>
          <div className="mt-2 md:mt-0 w-full md:w-auto md:ml-auto flex justify-between md:justify-end gap-6 flex-shrink-0">
            {[{ label: "Avg Time", val: "11m" }, { label: "Active Orders", val: "8" }, { label: "Queue Depth", val: "3" }].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.navy }}>{val}</div>
                <div style={{ fontSize: 10, color: C.slate400 }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* KDS KANBAN */}
      <div className="px-4 md:px-6 max-w-[1400px] mx-auto my-5 flex md:grid md:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
        {columns.map(col => (
          <div key={col.key} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-start">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: col.bg, color: col.color }}>
                {col.icon}
                <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.slate400 }}>{orders[col.key].length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence>
                {orders[col.key].map((order: any) => {
                  const p = priorityStyle[order.priority];
                  const isNextable = col.key !== "served";
                  return (
                    <motion.div key={order.id}
                      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88, x: 40 }}
                      layout
                      style={{ background: "white", borderRadius: 16, border: `1px solid ${C.slate200}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.slate100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{order.id}</div>
                          <div style={{ fontSize: 12, color: C.slate400, marginTop: 2 }}>Table {order.table}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: p.bg, color: p.color }}>{p.label}</span>
                          {order.time > 0 && (
                            <span style={{ fontSize: 11, color: order.time > 10 ? C.red : C.slate400, display: "flex", alignItems: "center", gap: 3 }}>
                              <Clock size={10} />{order.time}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: "10px 14px" }}>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: C.slate700 }}>{item}</span>
                          </div>
                        ))}
                        {isNextable && (
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => advance(order, col.key)}
                            style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: "none", background: col.color, color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                            → {columns[columns.findIndex(c => c.key === col.key) + 1]?.label}
                          </motion.button>
                        )}
                        {col.key === "served" && (
                          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 4, justifyContent: "center", color: C.emerald, fontSize: 12, fontWeight: 600 }}>
                            <CheckCircle size={13} /> Complete
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {orders[col.key].length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: C.slate300, fontSize: 13 }}>
                  No orders here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
