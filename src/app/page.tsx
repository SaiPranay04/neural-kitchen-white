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
      <nav style={{ position: "fixed", top: 0, width: "100%", background: "rgba(250,250,248,0.92)", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, minHeight: 108 }}>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
            onClick={() => router.push("/")}
          >
            <img
              src="/logo.png"
              alt="The Neural Kitchen — Where Intelligence Meets Flavor"
              style={{
                height: 96,
                width: "auto",
                maxWidth: "min(340px, 55vw)",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexShrink: 0 }}>
            <span onClick={() => router.push("/features/platform")} style={{ color: C.slate600, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>Features</span>
            <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", boxShadow: `0 8px 24px ${C.navy}40` }}>
              Request Demo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 180, paddingBottom: 60, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
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

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-block", background: `${C.navy}08`, color: C.navy, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>The Flow</div>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", marginBottom: 16 }}>From QR scan to plated dish<br />in one intelligent loop.</h2>
            </motion.div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Guest scans the QR code", desc: "Your beautiful digital menu loads instantly on their phone. No app download needed. They browse, filter by allergens, and order directly.", icon: <UtensilsCrossed size={28} /> },
              { step: "02", title: "Kitchen gets the ticket live", desc: "The order appears on the KDS instantly, color-coded by priority and station. Chefs tap to start, mark ready, and never miss a modification.", icon: <ChefHat size={28} /> },
              { step: "03", title: "You track everything live", desc: "Revenue, prep times, and guest satisfaction update in real-time on your dashboard. Zara AI flags bottlenecks before they happen.", icon: <BarChart3 size={28} /> },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ padding: 32, borderRadius: 24, background: C.cream, border: `1px solid ${C.slate200}`, position: "relative" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: `${C.navy}10`, position: "absolute", top: 16, right: 24, letterSpacing: "-0.04em" }}>{item.step}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "white", border: `1px solid ${C.slate200}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.orange, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: C.slate600, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-block", background: `${C.orange}12`, color: C.orange, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform</div>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", marginBottom: 16 }}>Every tool. One nervous system.</h2>
              <p style={{ fontSize: 18, color: C.slate600, maxWidth: 560, margin: "0 auto" }}>Stop duct-taping apps together. Neural Kitchen is the complete operating layer your restaurant was missing.</p>
            </motion.div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { icon: <UtensilsCrossed size={28} />, title: "Interactive Digital Menus", tagline: "Beautiful. Real-time. QR-powered.", desc: "Guests scan a QR code and get a stunning, interactive menu on their phone. When you run out of salmon, it vanishes instantly. AI suggests pairings to boost your average check size.", color: C.orange, link: "/features/menu", stats: "3x upsell conversion" },
              { icon: <ChefHat size={28} />, title: "Kitchen Display System", tagline: "Zero paper. Zero chaos.", desc: "Color-coded tickets land on the right station automatically. Chefs see modifications, timers, and rush alerts. Average ticket time drops by 20%.", color: C.emerald, link: "/features/kds", stats: "20% faster tickets" },
              { icon: <Brain size={28} />, title: "Zara AI Copilot", tagline: "Your 24/7 operations assistant.", desc: "Zara predicts Friday's rush using historical data and local events. She warns you before flour runs out. She answers guest allergen questions right on the menu, in any language.", color: C.purple, link: "/features/ai", stats: "Predictive demand forecasting" },
              { icon: <BarChart3 size={28} />, title: "Executive Dashboard", tagline: "Your restaurant's financial heartbeat.", desc: "Live revenue, food cost %, labor %, and table turnover — all in one glance. Health scores tell you what's working and what's bleeding money.", color: C.navy, link: "/features/admin", stats: "Real-time P&L visibility" },
              { icon: <Package size={28} />, title: "Inventory Intelligence", tagline: "Never run out. Never over-order.", desc: "Ingredient levels update with every plate served. Auto-reorder alerts hit your phone before you hit zero. Waste tracking shows exactly where money walks out the door.", color: C.cyan, link: "/features/platform", stats: "Auto low-stock alerts" },
              { icon: <Users size={28} />, title: "Staff & CRM", tagline: "Happy team. Loyal guests.", desc: "Shift scheduling, performance tracking, and guest profiles with loyalty triggers. Know who your VIPs are and when it's their birthday.", color: C.rose, link: "/features/platform", stats: "VIP guest tagging" },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => router.push(f.link)}
                style={{ background: "white", borderRadius: 24, padding: 32, border: `1.5px solid ${hoveredFeature === i ? f.color + "40" : C.slate200}`, cursor: "pointer", transition: "all 0.25s ease", transform: hoveredFeature === i ? "translateY(-4px)" : "none", boxShadow: hoveredFeature === i ? `0 16px 48px ${f.color}15` : "0 2px 8px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}12`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {f.icon}
                  </div>
                  <AnimatePresence>
                    {hoveredFeature === i && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ color: f.color }}>
                        <ArrowUpRight size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{f.title}</h3>
                <div style={{ fontSize: 13, fontWeight: 600, color: f.color, marginBottom: 12 }}>{f.tagline}</div>
                <p style={{ fontSize: 14, color: C.slate600, lineHeight: 1.65, marginBottom: 20 }}>{f.desc}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${f.color}10`, color: f.color, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  <Star size={12} fill={f.color} /> {f.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding: "80px 24px", background: C.navy }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={22} fill={C.orange} color={C.orange} />)}
            </div>
            <blockquote style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, color: "white", lineHeight: 1.4, marginBottom: 32, letterSpacing: "-0.01em" }}>
              "We cut ticket times by 18 minutes and our average check went up ₹220 after switching to Neural Kitchen. The AI upselling alone paid for the whole system in the first month."
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>RK</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: "white", fontSize: 15 }}>Rajesh Kumar</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Owner, Spice Route · Hyderabad</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em" }}>Why restaurant owners choose Neural Kitchen.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: <CheckCircle2 size={22} />, title: "Works in 1 day", desc: "No 3-month implementation. Scan, seed your menu, and you're live by dinner service." },
              { icon: <MessageSquare size={22} />, title: "Built for Indian kitchens", desc: "Handles multi-station Indian restaurants — tandoor, Chinese, south Indian — with separate routing." },
              { icon: <Shield size={22} />, title: "Your data stays yours", desc: "Hosted securely. No selling guest data. Full export anytime. You own everything." },
              { icon: <WalletCards size={22} />, title: "Pays for itself", desc: "Most restaurants recover the monthly cost in the first week from reduced waste and higher average checks." },
              { icon: <Building2 size={22} />, title: "Grows with you", desc: "One location or twenty. Multi-branch control, centralized menus, and side-by-side performance." },
              { icon: <Zap size={22} />, title: "AI that actually helps", desc: "Not a chatbot bolted on. Zara is woven into every module — menu, kitchen, inventory, and reviews." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", gap: 16, padding: 24, borderRadius: 18, background: "white", border: `1px solid ${C.slate200}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.orange}12`, color: C.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 16, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: C.slate600, lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: `radial-gradient(circle, ${C.orange}15, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, background: `radial-gradient(circle, ${C.purple}10, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
              Ready to run a<br />smarter restaurant?
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40, lineHeight: 1.6 }}>Stop fighting with outdated POS systems and paper tickets. See how Neural Kitchen can transform your operations in a 15-minute guided tour.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 14, border: "none", background: C.orange, color: "white", fontWeight: 700, fontSize: 17, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", boxShadow: `0 12px 32px ${C.orange}50` }}>
                Book Your Free Demo <ArrowRight size={20} />
              </button>
              <button onClick={() => router.push("/features/platform")} style={{ padding: "18px 40px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.25)", background: "transparent", color: "white", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>
                Explore Features
              </button>
            </div>
            <div style={{ marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>No credit card required · 15-minute personalized tour</div>
          </motion.div>
        </div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 24px", borderTop: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <img
            src="/logo.png"
            alt="The Neural Kitchen"
            style={{ height: 88, width: "auto", objectFit: "contain", display: "block" }}
          />
          <div style={{ color: C.slate400, fontSize: 13 }}>© {new Date().getFullYear()} Vezora Digital. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
