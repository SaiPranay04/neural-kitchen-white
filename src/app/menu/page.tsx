"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Brain, UtensilsCrossed, ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { C, MENU_CATEGORIES, MENU_ITEMS } from "@/lib/constants";
import { TagBadge, StarRating } from "@/components/Shared";
import { CartDrawer, ChatDrawer, OrderTracker } from "@/components/MenuComponents";

export default function MenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Zara, your AI dining assistant 🍽️ What are you in the mood for tonight? I can suggest dishes, flag allergens, or help you build the perfect meal." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders");
        const orders = await res.json();
        const updated = orders.find((o: any) => o.id === activeOrder.id);
        if (updated) setActiveOrder(updated);
      } catch (err) {
        console.error("Failed to fetch order status");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  const filtered = MENU_ITEMS.filter(item =>
    (activeCategory === "All" || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find(i => i.id === parseInt(id));
    return sum + (item?.price || 0) * qty;
  }, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: number) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id: number) => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const toggleLike = (id: number) => setLikedItems(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const placeOrder = async () => {
    const orderItems = Object.entries(cart)
      .map(([id, qty]) => {
        const item = MENU_ITEMS.find(i => i.id === parseInt(id));
        return item ? `${item.name} x${qty}` : null;
      })
      .filter(Boolean);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems }),
      });
      const newOrder = await res.json();
      setActiveOrder(newOrder);
      setCart({});
      setShowCart(false);
    } catch (err) {
      console.error("Failed to place order");
    }
  };

  const aiResponses = [
    "Great choice! Our Wagyu Burger pairs beautifully with the Truffle Fries. Also, tonight's specials include a Pan-Seared Halibut — limited availability!",
    "For a complete meal, I'd suggest starting with the Burrata & Heirloom, then the Salmon for your main. Our Lava Cake is the perfect finish!",
    "The Margherita Classica is wood-fired and made with San Marzano tomatoes. It's perfect if you prefer something lighter. Vegetarian too!",
    "Based on popular orders tonight, the Wagyu Burger and Truffle Arancini are flying out of the kitchen! Our guests love them together.",
  ];

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: aiResponses[Math.floor(Math.random() * aiResponses.length)] }]);
    }, 800);
  };

  return (
    <div style={{ background: C.slate50, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ORDER TRACKER OVERLAY */}
      <AnimatePresence>
        {activeOrder && (
          <OrderTracker order={activeOrder} onClose={() => setActiveOrder(null)} />
        )}
      </AnimatePresence>

      {/* MENU HEADER */}
      <div style={{ background: "white", borderBottom: `1px solid ${C.slate200}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => router.push("/")} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.slate200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.slate600 }}>
                ← Back
              </button>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>The Neural Kitchen</div>
                <div style={{ fontSize: 12, color: C.slate400, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} /><span>42 Innovation Drive · Open until 11PM</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.slate400 }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search menu..." style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: `1px solid ${C.slate200}`, fontSize: 14, width: 200, outline: "none", color: C.slate800 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, background: C.emeraldLight, color: C.emerald }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.emerald }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Kitchen Open</span>
              </div>
            </div>
          </div>

          {/* CATEGORY PILLS */}
          <div ref={categoryRef} style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {MENU_CATEGORIES.map(cat => (
              <motion.button key={cat} onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "8px 18px", borderRadius: 99, border: activeCategory === cat ? "none" : `1px solid ${C.slate200}`, background: activeCategory === cat ? C.navy : "white", color: activeCategory === cat ? "white" : C.slate600, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}>
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* AI BANNER */}
      <div style={{ maxWidth: 1100, margin: "20px auto 0", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500 }}>ZARA AI INSIGHT · </span>
            <span style={{ color: "white", fontSize: 13, fontWeight: 500 }}>The Wagyu Burger is selling 3× faster than usual tonight — order soon to avoid a wait. Lava Cake is our most-complimented dish this week!</span>
          </div>
          <button onClick={() => setShowChat(true)} style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            Ask Zara →
          </button>
        </motion.div>
      </div>

      {/* MENU GRID */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i}
                qty={cart[item.id] || 0}
                liked={likedItems.has(item.id)}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
                onLike={() => toggleLike(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.slate400 }}>
            <UtensilsCrossed size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 16 }}>No dishes found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* FLOATING CART */}
      {cartCount > 0 && (
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowCart(true)}
          style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: C.navy, color: "white", border: "none", borderRadius: 99, padding: "14px 28px", display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 32px ${C.navy}60`, zIndex: 30 }}>
          <ShoppingCart size={18} />
          View Cart · {cartCount} items · ${cartTotal.toFixed(2)}
        </motion.button>
      )}

      {/* FLOATING ZARA BUTTON */}
      <motion.button animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}
        onClick={() => setShowChat(true)}
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 8px 24px ${C.orange}50`, zIndex: 30 }}>
        <Brain size={22} />
      </motion.button>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <CartDrawer cart={cart} onClose={() => setShowCart(false)} onAdd={addToCart} onRemove={removeFromCart} total={cartTotal} onPlaceOrder={placeOrder} />
        )}
      </AnimatePresence>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {showChat && (
          <ChatDrawer messages={messages} input={chatInput} onInputChange={setChatInput} onSend={sendMessage} onClose={() => setShowChat(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuCard({ item, index, qty, liked, onAdd, onRemove, onLike }: any) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.slate200}`, boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-4px)" : "translateY(0)", transition: "all 0.25s ease", cursor: "default" }}>
      <div style={{ position: "relative", overflow: "hidden", height: 185 }}>
        <motion.img src={item.img} alt={item.name}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e: any) => { e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`; }}
        />
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <TagBadge text={item.tag} />
        </div>
        <motion.button onClick={onLike}
          whileTap={{ scale: 0.8 }}
          style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <Heart size={15} fill={liked ? C.rose : "none"} color={liked ? C.rose : C.slate400} />
        </motion.button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.45))", padding: "20px 12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <StarRating rating={item.rating} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>({item.reviews})</span>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{item.calories} cal</span>
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>{item.name}</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.navy, marginLeft: 8 }}>${item.price}</div>
        </div>
        <div style={{ fontSize: 12, color: C.slate400, marginBottom: 14 }}>{item.category}</div>

        {qty === 0 ? (
          <motion.button whileTap={{ scale: 0.95 }} onClick={onAdd}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: C.navy, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.orange}
            onMouseLeave={e => e.currentTarget.style.background = C.navy}>
            <Plus size={15} /> Add to Cart
          </motion.button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.slate100, borderRadius: 10, padding: "6px" }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onRemove}
              style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.slate600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <Minus size={15} />
            </motion.button>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>{qty}</span>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onAdd}
              style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: C.navy, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Plus size={15} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
