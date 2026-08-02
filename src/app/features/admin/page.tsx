"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart3, TrendingUp, DollarSign, Users, PieChart, Target, CalendarDays } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function AdminFeaturePage() {
  const router = useRouter();

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20-%20Dashboard";
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, width: "100%", background: "rgba(250,250,248,0.85)", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${C.slate200}`, padding: "14px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src="/logo.png"
              alt="The Neural Kitchen"
              onClick={() => router.push("/")}
              style={{ height: 88, width: "auto", objectFit: "contain", display: "block", cursor: "pointer" }}
            />
            <button onClick={() => router.push("/")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: C.slate600, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              <ArrowLeft size={18} /> Back to Home
            </button>
          </div>
          <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: 100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${C.navy}05, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: `0 12px 32px ${C.navy}30` }}>
            <BarChart3 size={36} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Executive<br />Dashboard
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 20, color: C.slate600, lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
            Your restaurant's entire financial heartbeat at a glance. Real-time revenue, staff performance, and AI-driven insights — all in one beautiful interface.
          </motion.p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section style={{ padding: "0 24px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 1000, margin: "0 auto", background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 24, padding: "48px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, position: "relative" }}>
            {[
              { label: "Today's Revenue", val: "₹1,84,200", change: "+18%", icon: <DollarSign size={18} /> },
              { label: "Orders Completed", val: "127", change: "+12%", icon: <TrendingUp size={18} /> },
              { label: "Avg Check Size", val: "₹1,450", change: "+₹340", icon: <PieChart size={18} /> },
              { label: "Table Turnover", val: "3.2x", change: "Above avg", icon: <CalendarDays size={18} /> },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1 }}
                style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 18px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{kpi.icon}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{kpi.val}</div>
                <div style={{ fontSize: 12, color: C.emerald, fontWeight: 600, marginTop: 4 }}>{kpi.change}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* What You Can Track */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>Everything you need to know, instantly.</h2>
            <p style={{ color: C.slate600, marginTop: 12, fontSize: 17 }}>No more end-of-month surprises. Know exactly how your restaurant is performing right now.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { icon: <DollarSign size={22} />, title: "Real-Time P&L", desc: "Watch revenue and costs update in real-time. Compare today vs. yesterday, this week vs. last week. Spot trends before they become problems.", color: C.emerald },
              { icon: <Target size={22} />, title: "Bestseller Tracking", desc: "Know exactly which dishes are generating the highest profit margins. Identify underperformers that are costing you money and need to be cut or repriced.", color: C.orange },
              { icon: <Users size={22} />, title: "Staff Performance", desc: "See which servers are turning tables the fastest, upselling the most effectively, and generating the most tips. Reward your top performers with data.", color: C.navy },
              { icon: <PieChart size={22} />, title: "Category Breakdown", desc: "Understand your revenue mix — what percentage comes from mains, starters, desserts, and drinks. Optimize your menu based on actual sales data.", color: C.purple },
              { icon: <TrendingUp size={22} />, title: "Peak Hour Analysis", desc: "Discover your busiest hours, slowest days, and seasonal patterns. Schedule staff smarter and run promotions during off-peak times.", color: C.amber },
              { icon: <CalendarDays size={22} />, title: "Multi-Branch Comparison", desc: "If you have multiple locations, compare revenue, ticket times, and customer satisfaction side-by-side. Identify which branch needs attention.", color: C.cyan },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: C.slate50, padding: "28px 32px", borderRadius: 20, border: `1px solid ${C.slate100}`, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}12`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{f.title}</h4>
                  <p style={{ color: C.slate600, lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>See your numbers come alive.</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 40 }}>We'll walk you through the dashboard with real restaurant data so you can see exactly what your reports would look like.</p>
          <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: C.orange, color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: `0 16px 40px ${C.orange}60` }}>
            Request a Demo <ArrowRight size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
}
