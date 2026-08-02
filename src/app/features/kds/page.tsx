"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChefHat, CheckCircle2, Clock, Zap, AlertTriangle, Layers, Timer, MonitorCheck } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function KDSFeaturePage() {
  const router = useRouter();

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20-%20KDS";
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
          <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.emerald, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: 80, right: "10%", width: 400, height: 400, background: `radial-gradient(circle, ${C.emerald}08, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.emerald}, ${C.emerald}CC)`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: `0 12px 32px ${C.emerald}30` }}>
            <ChefHat size={36} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Smart Kitchen<br />Display System
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 20, color: C.slate600, lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
            Throw away the paper tickets forever. Route orders automatically to the right station, track every second of prep time, and keep your kitchen firing on all cylinders.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: C.slate200, borderRadius: 16, overflow: "hidden" }}>
          {[
            { val: "0", label: "Lost Tickets", suffix: "" },
            { val: "20", label: "Faster Prep", suffix: "%" },
            { val: "100", label: "Digital Tracking", suffix: "%" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.emerald }}>{s.val}<span style={{ fontSize: 18 }}>{s.suffix}</span></div>
              <div style={{ fontSize: 13, color: C.slate400, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* The Problem / Solution */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Problem */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.redLight, color: C.red, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <AlertTriangle size={14} /> The Problem
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Paper tickets get lost. Shouting gets ignored.</h3>
              <p style={{ color: C.slate600, lineHeight: 1.7, fontSize: 16 }}>In a traditional kitchen, a busy Friday night means dozens of handwritten tickets pinned to a rail. Orders get lost, misread, or sent to the wrong station. The chef shouts, the servers panic, and the customer waits too long.</p>
            </motion.div>
            {/* Solution */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.emeraldLight, color: C.emerald, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <CheckCircle2 size={14} /> The Solution
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Every order, tracked. Every station, synced.</h3>
              <p style={{ color: C.slate600, lineHeight: 1.7, fontSize: 16 }}>Neural Kitchen's KDS replaces paper with beautiful, color-coded digital tickets on a screen. Orders flow automatically from guest to chef. Smart routing sends drinks to the bar and steaks to the grill — no shouting required.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>How your kitchen transforms.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: <Layers size={22} />, title: "Smart Station Routing", desc: "Each order item is automatically sent to the correct prep station. Drinks go to the bar, appetizers to cold prep, and mains to the grill. No manual sorting required.", color: C.emerald },
              { icon: <Timer size={22} />, title: "Live Prep Timers", desc: "Every ticket has a color-coded timer. Green means on track. Yellow means hurry. Red means the customer is waiting too long. Your team always knows what to prioritize.", color: C.amber },
              { icon: <MonitorCheck size={22} />, title: "Kanban-Style Workflow", desc: "Orders flow through visual columns: Placed → Preparing → Ready → Served. One tap advances a ticket. The entire team sees progress at a glance.", color: C.cyan },
              { icon: <Zap size={22} />, title: "Priority Escalation", desc: "VIP tables, large parties, and time-sensitive orders are automatically flagged with priority badges. Your kitchen never misses the important ones.", color: C.orange },
              { icon: <Clock size={22} />, title: "AI Time Forecasting", desc: "Zara AI learns your kitchen's rhythm and predicts when stations will be overloaded. She'll suggest pre-prepping 6 extra burgers before the Friday rush even starts.", color: C.purple },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: "white", padding: "28px 32px", borderRadius: 20, border: `1px solid ${C.slate200}`, display: "flex", gap: 20, alignItems: "flex-start", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
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
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.emerald}, #059669)`, textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>See the KDS in action.</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 40 }}>Book a 15-minute demo and watch live orders flow through the kitchen in real time.</p>
          <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: "white", color: C.emerald, fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}>
            Request a Demo <ArrowRight size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
}
