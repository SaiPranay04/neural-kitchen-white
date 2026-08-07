"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, MessageSquare, Package, TrendingUp, Shield, Globe, Zap } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function AIFeaturePage() {
  const router = useRouter();

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20-%20AI%20Copilot";
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
          <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.purple, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: 60, left: "20%", width: 500, height: 500, background: `radial-gradient(circle, ${C.purple}06, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, right: "15%", width: 300, height: 300, background: `radial-gradient(circle, ${C.orange}05, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: `0 12px 32px ${C.purple}30` }}>
            <Brain size={36} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.purple}10`, color: C.purple, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Zap size={12} /> Powered by Advanced AI
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Meet Zara,<br />Your AI Copilot
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 20, color: C.slate600, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            Zara is your 24/7 operations assistant. She predicts demand before it happens, manages your inventory automatically, and helps your guests like a knowledgeable concierge — all without hiring anyone.
          </motion.p>
        </div>
      </section>

      {/* AI Chat Simulation */}
      <section style={{ padding: "0 24px 100px" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 500, margin: "0 auto", background: "white", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: `1px solid ${C.slate200}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.slate100}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>Zara AI</div>
              <div style={{ fontSize: 12, color: C.emerald, fontWeight: 500 }}>● Always online</div>
            </div>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { role: "user", text: "Any mild veg options for kids?" },
              { role: "ai", text: "Yes! I'd recommend Butter Paneer (₹249) — mild and popular. Ghee roast dosa with coconut chutney is also a safe pick. Want me to add sweet lassi for the table?" },
              { role: "user", text: "What goes well with the paneer?" },
              { role: "ai", text: "Great choice! Pair it with butter naan or jeera rice. Many guests also add a small raita. If you want something sweeter after, gulab jamun is our most ordered dessert tonight." },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? C.navy : C.slate50, color: m.role === "user" ? "white" : C.slate700, fontSize: 14, lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Three Pillars */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>Three AI superpowers for your restaurant.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: <TrendingUp size={28} />, title: "Predictive Demand", desc: "Zara cross-references your historical order data with local events, weather, and booking patterns. She'll tell you on Wednesday that Friday's dinner service will be 30% busier than usual — and exactly how much extra stock to prep.", color: C.purple },
              { icon: <Package size={28} />, title: "Auto-Inventory", desc: "Zara monitors consumption in real time. When paneer, cooking oil, or basmati rice drops below your safety threshold, she flags reorder before the dinner rush. No more running out of coconut chutney at 9 PM.", color: C.orange },
              { icon: <MessageSquare size={28} />, title: "Guest Concierge", desc: "On the customer's menu, Zara answers questions in natural language: 'What can I eat with a nut allergy?' She responds instantly in any language, builds trust, and removes ordering anxiety.", color: C.emerald },
            ].map((pillar, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                style={{ padding: 36, borderRadius: 24, background: C.slate50, border: `1px solid ${C.slate100}`, display: "flex", flexDirection: "column" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: `${pillar.color}12`, color: pillar.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>{pillar.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{pillar.title}</h3>
                <p style={{ color: C.slate600, lineHeight: 1.7, fontSize: 15, flex: 1 }}>{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra AI Capabilities */}
      <section style={{ padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>And that's just the beginning.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { icon: <Shield size={20} />, title: "Review Response AI", desc: "Zara drafts professional responses to Google and Zomato reviews. Positive or negative, she maintains your brand voice.", color: C.navy },
              { icon: <Globe size={20} />, title: "Multi-Language Support", desc: "Zara communicates with your international guests in their language — English, Hindi, Arabic, Japanese, and more.", color: C.cyan },
              { icon: <TrendingUp size={20} />, title: "Revenue Optimization", desc: "Zara identifies your most profitable times and suggests dynamic pricing or promotion strategies to fill your off-peak hours.", color: C.emerald },
              { icon: <Brain size={20} />, title: "Staff Scheduling AI", desc: "Based on predicted demand, Zara recommends how many servers and cooks you need for each shift. No more overstaffing Tuesdays.", color: C.purple },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: "white", padding: "24px 28px", borderRadius: 16, border: `1px solid ${C.slate200}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${f.color}10`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{f.title}</h4>
                  <p style={{ color: C.slate600, lineHeight: 1.5, fontSize: 14 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Experience Zara live.</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 40 }}>Ask her anything about your menu, inventory, or operations. See how she thinks, responds, and predicts — right in the demo.</p>
          <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: "white", color: C.purple, fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}>
            Request a Demo <ArrowRight size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
}
