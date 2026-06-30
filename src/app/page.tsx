"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, TrendingDown, ArrowUpRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { C, BENTO_MODULES } from "@/lib/constants";

export default function LandingPage() {
  const router = useRouter();
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="px-4 md:px-8 flex items-center justify-between" style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,248,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.slate200}`, height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/image.png" alt="Neural Kitchen Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: C.navy, letterSpacing: "-0.02em" }}>Neural Kitchen</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ label: "Menu", page: "menu" }, { label: "Kitchen", page: "kds" }, { label: "Dashboard", page: "admin" }].map(({ label, page }) => (
            <button key={page} onClick={() => onNavigate(page)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "transparent", color: C.slate600, fontWeight: 500, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.slate100; e.currentTarget.style.color = C.navy; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.slate600; }}>
              {label}
            </button>
          ))}
          <button onClick={() => onNavigate("admin")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Live Demo →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="px-4 md:px-8 py-12 md:pt-20 md:pb-16 max-w-[1200px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: `1px solid ${C.orange}30`, borderRadius: 99, padding: "6px 16px", marginBottom: 28, boxShadow: `0 2px 12px ${C.orange}15` }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald, display: "inline-block" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>Now serving 200+ restaurants across 18 cities</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: C.navy, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
          The complete OS where<br />
          <span style={{ color: C.orange }}>intelligence runs</span> your restaurant.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: 19, color: C.slate600, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.65 }}>
          From the kitchen to the customer — one AI-native platform that learns, adapts, and grows with every single order.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate("menu")} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: C.orange, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 4px 20px ${C.orange}40` }}>
            Explore the Menu Experience
          </button>
          <button onClick={() => onNavigate("admin")} style={{ padding: "14px 32px", borderRadius: 12, border: `1.5px solid ${C.slate200}`, background: "white", color: C.navy, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            View Executive Dashboard
          </button>
        </motion.div>

        {/* STATS STRIP */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:flex justify-center gap-8 md:gap-12 mt-10 md:mt-14">
          {[["31%", "Revenue Uplift"], ["2.4×", "Table Turnover"], ["18 min", "Avg Order Time"], ["4.9★", "Guest Satisfaction"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>{val}</div>
              <div style={{ fontSize: 13, color: C.slate400, fontWeight: 500, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* HERO IMAGE STRIP */}
      <div className="px-4 md:px-8 max-w-[1200px] mx-auto mb-12 md:mb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 64px rgba(27,43,94,0.18)", border: `1px solid ${C.slate200}`, background: "white", position: "relative" }}>
          <div className="p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center gap-4" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)` }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57", "#FFBD2E", "#28CA41"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 28, display: "flex", alignItems: "center", paddingLeft: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>neural-kitchen.io/dashboard</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.emerald }} />
                <span style={{ color: C.emerald, fontSize: 12, fontWeight: 600 }}>All systems live</span>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-8" style={{ background: C.slate50 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[{ label: "Today's Revenue", val: "$8,412", up: true, change: "+18.2%" },
                { label: "Active Orders", val: "23", up: true, change: "+4" },
                { label: "Avg Table Time", val: "38 min", up: false, change: "-6 min" },
                { label: "Health Score", val: "94/100", up: true, change: "↑ 3pts" }].map(({ label, val, up, change }) => (
                <div key={label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.slate200}` }}>
                  <div style={{ fontSize: 12, color: C.slate400, fontWeight: 500, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{val}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    {up ? <TrendingUp size={12} color={C.emerald} /> : <TrendingDown size={12} color={C.red} />}
                    <span style={{ fontSize: 12, color: up ? C.emerald : C.red, fontWeight: 600 }}>{change}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.slate200}`, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {[55, 72, 48, 85, 63, 91, 74, 88, 67, 95, 78, 82].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 10 ? C.orange : `${C.navy}${i % 3 === 0 ? "40" : "20"}`, borderRadius: "4px 4px 0 0", height: `${h}%`, transition: "height 0.3s" }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BENTO GRID */}
      <div className="px-4 md:px-8 pb-12 md:pb-20 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: C.navy, letterSpacing: "-0.025em", marginBottom: 12 }}>
            Every tool your restaurant needs.
          </h2>
          <p style={{ fontSize: 17, color: C.slate600 }}>Eleven integrated modules. One intelligent platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENTO_MODULES.map((mod, i) => {
            const isLarge = mod.size === "large";
            const isHovered = hoveredModule === i;
            return (
              <motion.div key={mod.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onHoverStart={() => setHoveredModule(i)}
                onHoverEnd={() => setHoveredModule(null)}
                onClick={() => mod.page && onNavigate(mod.page)}
                className={isLarge ? "col-span-1 md:col-span-2" : "col-span-1"}
                style={{
                  background: isHovered ? `linear-gradient(135deg, ${mod.color}08, ${mod.color}15)` : "white",
                  borderRadius: 20, border: isHovered ? `1.5px solid ${mod.color}40` : `1px solid ${C.slate200}`,
                  padding: isLarge ? "32px" : "24px",
                  cursor: mod.page ? "pointer" : "default",
                  transition: "all 0.25s ease",
                  transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                  boxShadow: isHovered ? `0 12px 40px ${mod.color}20` : "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative", overflow: "hidden",
                }}
              >
                {isLarge && (
                  <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: `${mod.color}08` }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isLarge ? 16 : 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${mod.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: mod.color, flexShrink: 0 }}>
                    {mod.icon}
                  </div>
                  {mod.page && (
                    <span style={{ marginLeft: "auto", color: mod.color, opacity: isHovered ? 1 : 0, transition: "opacity 0.2s" }}>
                      <ArrowUpRight size={16} />
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: isLarge ? 20 : 15, color: C.navy, marginBottom: 6 }}>{mod.label}</div>
                <div style={{ fontSize: isLarge ? 14 : 13, color: C.slate600, lineHeight: 1.5 }}>{mod.desc}</div>
                {isLarge && (
                  <div style={{ marginTop: 20 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: mod.color, color: "white", fontSize: 13, fontWeight: 600 }}>
                      Open Module <ChevronRight size={13} />
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="py-16 md:py-20 px-4 md:px-8 text-center" style={{ background: C.navy }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-0.025em" }}>
          Ready to run the neural kitchen?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, marginBottom: 32 }}>
          Join 200+ restaurants already serving smarter.
        </p>
        <button onClick={() => onNavigate("admin")} style={{ padding: "16px 40px", borderRadius: 12, border: "none", background: C.orange, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 4px 24px ${C.orange}50` }}>
          Start Free Trial — No Card Required
        </button>

        {/* VEZORA DIGITAL SIGNATURE */}
        <div className="mt-12 md:mt-20 pt-8 flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/image.png" alt="Logo" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", opacity: 0.8 }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>Neural Kitchen</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
            © {new Date().getFullYear()} Neural Kitchen. Designed & Engineered by 
            <img src="/vezora-bg.png" alt="Vezora Digital" style={{ height: 80, objectFit: "contain" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
