"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Box, Users, Star, Building2, WalletCards, LayoutGrid, MessageCircle, TrendingDown, ImagePlus } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function PlatformFeaturePage() {
  const router = useRouter();

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20-%20Platform";
  };

  const features = [
    { 
      icon: <Box size={24} />, title: "Inventory Intelligence", color: C.emerald,
      tagline: "Never run out of ingredients again.",
      bullets: ["Automated low-stock alerts based on predictive consumption", "Smart reorder suggestions synced to your supplier catalog", "Waste tracking and cost-per-plate analysis", "Supplier Invoice OCR auto-extracts items & flags price hikes"]
    },
    { 
      icon: <Users size={24} />, title: "Staff Management", color: C.orange,
      tagline: "Schedule smarter, not harder.",
      bullets: ["Clock-in/out tracking with photo verification", "AI-optimized shift scheduling based on predicted demand", "Performance analytics: tables served, tips earned, upsell rate", "Payroll export integration ready"]
    },
    { 
      icon: <WalletCards size={24} />, title: "CRM & Loyalty", color: C.navy,
      tagline: "Turn first-time guests into regulars.",
      bullets: ["Auto-generated guest profiles from order history", "Birthday & anniversary discount triggers", "Loyalty points and rewards system", "VIP tagging for personalized kitchen priority"]
    },
    { 
      icon: <Star size={24} />, title: "Review Intelligence", color: C.purple,
      tagline: "Protect and grow your reputation.",
      bullets: ["Aggregate reviews from Google, Yelp, Zomato, and OpenTable", "AI sentiment analysis to catch negative trends early", "One-click professional response generation by Zara AI", "Weekly reputation score with improvement suggestions"]
    },
    { 
      icon: <Building2 size={24} />, title: "Multi-Branch Control", color: C.cyan,
      tagline: "One dashboard for all your locations.",
      bullets: ["Centralized menu and pricing management", "Side-by-side revenue and performance comparison", "Branch-specific promotions and scheduling", "AI Transfer Engine recommends stock moves between branches to prevent waste"]
    },
    {
      icon: <MessageCircle size={24} />, title: "WhatsApp & Omnichannel", color: C.emerald,
      tagline: "Meet your customers where they already are.",
      bullets: ["AI-powered ordering bot directly inside WhatsApp", "Automated post-meal feedback messages to intercept bad reviews", "Smart Waitlist SMS with precise table-ready predictions", "AI Voice Receptionist handles phone reservations and FAQs 24/7"]
    },
    {
      icon: <TrendingDown size={24} />, title: "Aggregator & Competitor Analytics", color: C.orange,
      tagline: "Stop bleeding margins to Swiggy & Zomato.",
      bullets: ["Auto-sync aggregator exports to reveal exact commission bleed per dish", "Competitor Price Monitor alerts you when nearby restaurants lower prices", "Identify which dishes lose money on delivery vs. dine-in", "Dynamic pricing suggestions for off-peak hours"]
    },
    {
      icon: <ImagePlus size={24} />, title: "AI Marketing Engine", color: C.purple,
      tagline: "Put your social media on autopilot.",
      bullets: ["Auto-generates Instagram captions and hashtags from daily specials", "Drafts professional, brand-aligned responses to Google & Yelp reviews", "Identifies your most photogenic dishes based on order volume", "Creates highly targeted email/SMS blast copy for loyalty members"]
    },
  ];

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, width: "100%", background: "rgba(250,250,248,0.85)", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${C.slate200}`, padding: "14px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: C.slate600, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
          <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 60, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.slate600}, ${C.slate800})`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}>
            <LayoutGrid size={36} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Platform Features
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 20, color: C.slate600, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            Beyond the core modules, Neural Kitchen includes everything you need to run a flawless operation — all integrated into one system.
          </motion.p>
        </div>
      </section>

      {/* Features List */}
      <section style={{ padding: "60px 24px 120px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: "white", borderRadius: 24, border: `1px solid ${C.slate200}`, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
              {/* Header */}
              <div style={{ padding: "32px 36px", borderBottom: `1px solid ${C.slate100}`, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${feature.color}12`, color: feature.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{feature.title}</h3>
                  <p style={{ color: feature.color, fontWeight: 600, fontSize: 14, marginTop: 4 }}>{feature.tagline}</p>
                </div>
              </div>
              {/* Bullet Points */}
              <div style={{ padding: "24px 36px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                {feature.bullets.map((bullet, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: `${feature.color}12`, color: feature.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                    </div>
                    <span style={{ fontSize: 15, color: C.slate600, lineHeight: 1.5 }}>{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Ready to see it all in action?</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 40 }}>Every feature. Every module. Connected. Book your personal walkthrough today.</p>
          <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: C.orange, color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: `0 16px 40px ${C.orange}60` }}>
            Request a Demo <ArrowRight size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
}
