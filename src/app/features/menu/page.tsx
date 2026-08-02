"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, UtensilsCrossed, CheckCircle2, Smartphone, QrCode, ShoppingCart, Filter, Sparkles, Eye } from "lucide-react";
import { C } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function MenuFeaturePage() {
  const router = useRouter();

  const openMail = () => {
    window.location.href = "mailto:hello@vezoradigital.com?subject=Neural%20Kitchen%20Demo%20-%20Digital%20Menus";
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, width: "100%", background: "rgba(250,250,248,0.85)", backdropFilter: "blur(20px)", zIndex: 50, borderBottom: `1px solid ${C.slate200}`, padding: "14px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src="/image.png"
              alt="The Neural Kitchen"
              onClick={() => router.push("/")}
              style={{ height: 48, width: "auto", objectFit: "contain", display: "block", cursor: "pointer" }}
            />
            <button onClick={() => router.push("/")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: C.slate600, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              <ArrowLeft size={18} /> Back to Home
            </button>
          </div>
          <button onClick={openMail} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.orange, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Request Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: 80, left: "10%", width: 400, height: 400, background: `radial-gradient(circle, ${C.orange}08, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: `0 12px 32px ${C.orange}30` }}>
            <UtensilsCrossed size={36} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Interactive<br />Digital Menus
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 20, color: C.slate600, lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
            Beautiful, QR-powered menus that update in real-time. No app downloads. No printed menus. Just a stunning, interactive experience on the guest's own phone.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: C.slate200, borderRadius: 16, overflow: "hidden" }}>
          {[
            { val: "3x", label: "Upsell Conversion" },
            { val: "₹0", label: "Printing Costs" },
            { val: "<2s", label: "Menu Load Time" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.orange }}>{s.val}</div>
              <div style={{ fontSize: 13, color: C.slate400, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How the Guest Experiences It */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.orange}12`, color: C.orange, padding: "6px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Guest Experience</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>What your customers see.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", icon: <QrCode size={28} />, title: "Scan the QR Code", desc: "A beautiful, full menu loads instantly on their phone. No app download. No waiting. Works on every smartphone." },
              { step: "02", icon: <ShoppingCart size={28} />, title: "Browse & Order", desc: "High-res food photos, dietary filters, and AI-powered pairing suggestions. They add items to cart and submit directly to the kitchen." },
              { step: "03", icon: <Eye size={28} />, title: "Track Their Order", desc: "A live order tracker shows exactly when their food moves from 'Preparing' to 'Ready'. They know the kitchen is working, not wondering." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: C.slate100, lineHeight: 1, marginBottom: 16 }}>{s.step}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.orange}12`, color: C.orange, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: C.slate600, lineHeight: 1.6, fontSize: 15 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>The owner's superpowers.</h2>
            <p style={{ color: C.slate600, marginTop: 12, fontSize: 17 }}>Everything happening behind the scenes to boost your revenue.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: <Sparkles size={22} />, title: "AI-Powered Upselling", desc: "When a guest adds a Wagyu Burger, Zara suggests Truffle Fries. When they browse desserts, she recommends the perfect wine pairing. Average check size goes up without feeling pushy.", color: C.purple },
              { icon: <Smartphone size={22} />, title: "Live Inventory Sync", desc: "Ran out of salmon at 8:30 PM? It vanishes from the menu across all devices immediately. No awkward 'sorry, we're out of that' moments. No stale printed menus.", color: C.orange },
              { icon: <Filter size={22} />, title: "Dietary & Allergen Filters", desc: "Guests can tap 'Gluten-Free', 'Vegan', or 'Nut-Free' and the menu filters instantly. This builds trust and removes the anxiety of ordering at a new restaurant.", color: C.emerald },
              { icon: <CheckCircle2 size={22} />, title: "Instant Price Updates", desc: "Changed a price? Updated a description? Added a seasonal special? It's live in seconds across every table. No reprinting, no stickers over old prices.", color: C.navy },
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
      <section style={{ padding: "100px 24px", background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>See the menu experience live.</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40 }}>We'll show you exactly how guests will interact with your menu — on your phone, right in the demo.</p>
          <button onClick={openMail} style={{ padding: "18px 40px", borderRadius: 16, border: "none", background: "white", color: C.orange, fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}>
            Request a Demo <ArrowRight size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
}
