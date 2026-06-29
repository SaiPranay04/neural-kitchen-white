import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Brain, Send, Check } from "lucide-react";
import { C, MENU_ITEMS } from "@/lib/constants";

export function OrderTracker({ order, onClose }: any) {
  const STAGES = ["Placed", "Confirmed", "Preparing", "Ready", "Served"];
  const current = STAGES.indexOf(order.stage);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60 }} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: 400, background: "white", borderRadius: 24, padding: 32, zIndex: 70, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${C.emerald}, ${C.emeraldLight})`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${C.emerald}40` }}>
          <Check size={32} color="white" />
        </motion.div>
        <div style={{ fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 4 }}>Order {order.stage}</div>
        <div style={{ fontSize: 13, color: C.slate400, marginBottom: 24 }}>{order.id}</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STAGES.map((s, i) => {
            const done = i <= current;
            const active = i === current;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <motion.div animate={active ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, 
                      background: done ? C.emerald : C.slate100, 
                      color: done ? "white" : C.slate400,
                      boxShadow: active ? `0 0 0 4px ${C.emerald}20` : "none" }}>
                    {done ? <Check size={14} /> : i + 1}
                  </motion.div>
                  {i < STAGES.length - 1 && (
                    <div style={{ position: "absolute", top: 32, width: 2, height: 12, background: i < current ? C.emerald : C.slate200 }} />
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: active ? 700 : 500, color: active ? C.emerald : done ? C.navy : C.slate400 }}>{s}</div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{ marginTop: 32, width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${C.slate200}`, background: "white", color: C.navy, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          Close Tracker
        </button>
      </motion.div>
    </>
  );
}

export function CartDrawer({ cart, onClose, onAdd, onRemove, total, onPlaceOrder }: any) {
  const items = Object.entries(cart).map(([id, qty]) => ({ item: MENU_ITEMS.find(i => i.id === parseInt(id)), qty })).filter(x => x.item);
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, background: "white", zIndex: 50, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.slate200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>Your Order</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {items.map(({ item, qty }: any) => (
            <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
              <img src={item.img} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{item.name}</div>
                <div style={{ fontSize: 13, color: C.slate400 }}>${item.price} each</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => onRemove(item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={() => onAdd(item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: C.navy, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, minWidth: 52, textAlign: "right" }}>${(item.price * qty).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ background: C.slate50, borderRadius: 12, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.slate600, marginBottom: 6 }}>
              <span>Subtotal</span><span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.slate600, marginBottom: 6 }}>
              <span>Service (10%)</span><span>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div style={{ height: 1, background: C.slate200, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, color: C.navy }}>
              <span>Total</span><span>${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.slate200}` }}>
          <button onClick={onPlaceOrder} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: C.navy, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            Place Order · ${(total * 1.1).toFixed(2)}
          </button>
        </div>
      </motion.div>
    </>
  );
}

export function ChatDrawer({ messages, input, onInputChange, onSend, onClose }: any) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 440, maxHeight: "70vh", background: "white", zIndex: 50, display: "flex", flexDirection: "column", borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.slate200}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Zara AI Assistant</div>
            <div style={{ fontSize: 12, color: C.emerald, fontWeight: 500 }}>● Online</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? C.navy : C.slate100, color: m.role === "user" ? "white" : C.slate800, fontSize: 14, lineHeight: 1.5 }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.slate200}`, display: "flex", gap: 8 }}>
          <input value={input} onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSend()}
            placeholder="Ask about allergens, recommendations..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 14, outline: "none" }} />
          <button onClick={onSend} style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: C.orange, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
