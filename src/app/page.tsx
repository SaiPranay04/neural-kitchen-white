"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChefHat, BarChart3, Brain, UtensilsCrossed, Sparkles, Zap, Clock, TrendingUp, Shield, Star, CheckCircle2, ArrowUpRight, Play, Users, Package, Building2, WalletCards, MessageSquare } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function PortfolioPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20Request";
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
      
      {/* ── NAVBAR ── */}
      <nav style={{ position: "fixed", top: 0, width: "100%", background: "rgba(250,250,248,0.85)", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            <img
              src="/image.png"
              alt="The Neural Kitchen"
              style={{ height: 52, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span onClick={() => router.push("/features/platform")} style={{ color: C.slate600, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>Features</span>
            <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", boxShadow: `0 8px 24px ${C.navy}40` }}>
              Request Demo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 60, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
        {/* Background gradient orbs */}
        <div style={{ position: "absolute", top: 60, left: "10%", width: 500, height: 500, background: `radial-gradient(circle, ${C.orange}08, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 120, right: "5%", width: 400, height: 400, background: `radial-gradient(circle, ${C.purple}06, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.orange}12`, color: C.orange, padding: "8px 18px", borderRadius: 99, fontWeight: 700, fontSize: 13, marginBottom: 28, border: `1px solid ${C.orange}20` }}>
            <Sparkles size={14} /> AI-Powered Restaurant Operating System
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 24 }}>
            Your entire restaurant,<br />
            <span style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>perfectly synchronized.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ fontSize: "clamp(17px, 2vw, 20px)", color: C.slate600, maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.6 }}>
            From the moment a guest scans your menu to the second their plate leaves the kitchen — Neural Kitchen connects every touchpoint into one intelligent system.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <button onClick={openMail} style={{ padding: "16px 32px", borderRadius: 14, border: "none", background: C.navy, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", boxShadow: `0 12px 32px ${C.navy}40` }}>
              Book a Guided Tour <ArrowRight size={18} />
            </button>
            <button onClick={() => router.push("/features/platform")} style={{ padding: "16px 32px", borderRadius: 14, border: `2px solid ${C.slate200}`, background: "white", color: C.navy, fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
              <Play size={16} fill={C.navy} /> See All Features
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ padding: "40px 24px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: C.slate200, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
          {[
            { val: "20%", label: "Faster Ticket Times", icon: <Clock size={18} /> },
            { val: "3x", label: "Upsell Conversion", icon: <TrendingUp size={18} /> },
            { val: "₹0", label: "Paper Waste", icon: <Zap size={18} /> },
            { val: "24/7", label: "AI Monitoring", icon: <Shield size={18} /> },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", padding: "28px 16px", textAlign: "center" }}>
              <div style={{ color: C.orange, marginBottom: 8, display: "flex", justifyContent: "center" }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>{s.val}</div>
              <div style={{ fontSize: 13, color: C.slate400, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── HERO IMAGE MOCKUP ── */}
      <section style={{ padding: "0 24px 120px" }}>
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 1100, margin: "0 auto", background: "white", borderRadius: 24, padding: 8, boxShadow: "0 32px 80px rgba(0,0,0,0.1)", border: `1px solid ${C.slate200}` }}>
          <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 16, padding: "60px 40px", minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
            {/* Decorative grid */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, width: "100%", maxWidth: 800, position: "relative" }}>
              {[
                { label: "Live Orders", val: "24", sub: "Active tickets", color: C.orange },
                { label: "Revenue Today", val: "₹1,84,200", sub: "+18% vs yesterday", color: C.emerald },
                { label: "Avg Prep Time", val: "8.2m", sub: "Target: 10m", color: C.cyan },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15 }}
                  style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 16, padding: "24px 20px", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{card.val}</div>
                  <div style={{ fontSize: 12, color: card.color, fontWeight: 600, marginTop: 4 }}>{card.sub}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 32, color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500 }}>Live Dashboard Preview · Real-time data sync</div>
          </div>
        </motion.div>
      </section>

      {/* ── "HOW IT WORKS" ── */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.emerald}12`, color: C.emerald, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>How It Works</div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>From order to table in three steps.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
            {[
              { step: "01", title: "Guest scans the QR code", desc: "Your beautiful digital menu loads instantly on their phone. No app download needed. They browse, filter by allergens, and order directly.", icon: <UtensilsCrossed size={28} /> },
              { step: "02", title: "Kitchen receives the ticket", desc: "The order routes automatically to the correct station — grill, bar, or pastry. Timers start. The chef sees priority and special notes.", icon: <ChefHat size={28} /> },
              { step: "03", title: "You track everything live", desc: "Revenue, prep times, and guest satisfaction update in real-time on your dashboard. Zara AI flags bottlenecks before they happen.", icon: <BarChart3 size={28} /> },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} style={{ position: "relative" }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: C.slate100, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16 }}>{s.step}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: C.slate50, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: C.navy }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: C.slate600, lineHeight: 1.6, fontSize: 15 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP FEATURES ── */}
      <section style={{ padding: "120px 24px", background: C.cream }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.navy}10`, color: C.navy, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Core Modules</div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>Built for modern hospitality.</h2>
            <p style={{ fontSize: 18, color: C.slate600, marginTop: 16, maxWidth: 500, margin: "16px auto 0" }}>Four powerful modules that work together seamlessly.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {[
              { icon: <ChefHat size={28} />, title: "Smart Kitchen Display", tagline: "Zero lost tickets. 20% faster prep.", desc: "Every order flows digitally from guest to kitchen station. Color-coded timers keep your line accountable. Smart routing sends drinks to the bar and mains to the grill automatically.", color: C.emerald, link: "/features/kds", stats: "~11 min avg ticket time" },
              { icon: <UtensilsCrossed size={28} />, title: "Interactive Digital Menus", tagline: "Beautiful. Real-time. QR-powered.", desc: "Guests scan a QR code and get a stunning, interactive menu on their phone. When you run out of salmon, it vanishes instantly. AI suggests pairings to boost your average check size.", color: C.orange, link: "/features/menu", stats: "3x upsell conversion" },
              { icon: <BarChart3 size={28} />, title: "Executive Dashboard", tagline: "Your restaurant's heartbeat, live.", desc: "Track revenue down to the minute. See which dishes drive profit and which ones need to go. Compare locations, monitor staff performance, and spot trends before your competitors.", color: C.navy, link: "/features/admin", stats: "Real-time P&L tracking" },
              { icon: <Brain size={28} />, title: "Zara AI Copilot", tagline: "Your 24/7 operations assistant.", desc: "Zara predicts Friday's rush using historical data and local events. She warns you before flour runs out. She answers guest allergen questions right on the menu, in any language.", color: C.purple, link: "/features/ai", stats: "Predictive demand forecasting" },
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => router.push(feature.link)}
                style={{ padding: 40, borderRadius: 24, background: "white", border: `1px solid ${hoveredFeature === i ? feature.color + "40" : C.slate200}`, transition: "all 0.3s ease", cursor: "pointer", display: "flex", flexDirection: "column", boxShadow: hoveredFeature === i ? `0 20px 60px ${feature.color}15` : "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${feature.color}12`, color: feature.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {feature.icon}
                  </div>
                  <ArrowUpRight size={20} color={hoveredFeature === i ? feature.color : C.slate300} style={{ transition: "color 0.3s" }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{feature.title}</h3>
                <div style={{ fontSize: 14, fontWeight: 600, color: feature.color, marginBottom: 16 }}>{feature.tagline}</div>
                <p style={{ color: C.slate600, lineHeight: 1.6, flex: 1, fontSize: 15 }}>{feature.desc}</p>
                <div style={{ marginTop: 24, padding: "10px 14px", borderRadius: 10, background: C.slate50, display: "inline-flex", alignItems: "center", gap: 6, width: "max-content" }}>
                  <Zap size={14} color={feature.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.slate700 }}>{feature.stats}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button onClick={() => router.push("/features/platform")} style={{ padding: "14px 28px", borderRadius: 12, border: `2px solid ${C.slate200}`, background: "transparent", color: C.slate700, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              View All Platform Features <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TRUST ── */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>Why restaurant owners choose Neural Kitchen.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { quote: "We eliminated paper tickets overnight. Our kitchen runs 20% faster now, and I can track everything from my phone.", name: "Priya Sharma", role: "Owner, Spice Route Mumbai", stars: 5 },
              { quote: "The AI menu assistant pays for itself. Our average check size went up by ₹340 per table just from intelligent upselling.", name: "Rahul Mehta", role: "GM, The Blue Elephant", stars: 5 },
              { quote: "Managing 4 branches used to be chaos. Now I open one dashboard and see everything — revenue, inventory, staff, reviews.", name: "Anita Desai", role: "Founder, Desi Kitchen Chain", stars: 5 },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: 32, borderRadius: 20, background: C.slate50, border: `1px solid ${C.slate100}` }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={16} fill={C.amber} color={C.amber} />)}
                </div>
                <p style={{ color: C.slate700, lineHeight: 1.6, fontSize: 15, marginBottom: 20, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{t.name}</div>
                <div style={{ color: C.slate400, fontSize: 13, marginTop: 2 }}>{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: "120px 24px", background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, textAlign: "center", color: "white", position: "relative", overflow: "hidden" }}>
        {/* Decorative gradient orbs */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: `radial-gradient(circle, ${C.orange}20, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, background: `radial-gradient(circle, ${C.purple}15, transparent 70%)`, borderRadius: "50%" }} />
        
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.1 }}>Ready to modernize<br />your restaurant?</h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40, lineHeight: 1.6 }}>Stop fighting with outdated POS systems and paper tickets. See how Neural Kitchen can transform your operations in a 15-minute guided tour.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: C.orange, color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: `0 16px 40px ${C.orange}60`, display: "flex", alignItems: "center", gap: 10 }}>
                Request a Guided Demo <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>No credit card required · 15-minute personalized tour</div>
          </motion.div>
        </div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="/image.png"
              alt="The Neural Kitchen"
              style={{ height: 44, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
          <div style={{ color: C.slate400, fontSize: 13 }}>© {new Date().getFullYear()} Vezora Digital. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
