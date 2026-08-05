import type { AnalyticsBundle } from "@/lib/analytics/compute";
import type { DashboardOps } from "@/lib/analytics/types";

/** Static showcase data for unauthenticated promo demos */
export function buildPromoAnalytics(): AnalyticsBundle {
  return {
    restaurantName: "Neural Kitchen",
    kpis: [
      { label: "Today's revenue", value: "₹8,412", delta: "+18.2% vs last week", positive: true },
      { label: "Total orders", value: "147", delta: "+23 vs last week", positive: true },
      { label: "Avg order value", value: "₹57", delta: "+₹4 vs last week", positive: true },
      { label: "Table turnover", value: "2.8×", delta: "+0.4× vs last week", positive: true },
      { label: "Est. margin", value: "34.8%", delta: "+2.1% healthy stock", positive: true },
    ],
    insights: [
      "Tonight's dinner revenue is tracking 23% above last Friday — consider extending kitchen hours by 45 min.",
      "Inventory alert: paneer stock is at 15% — auto-reorder recommended.",
      "Top mover: Chicken Biryani — keep basmati and gravy ready for the dinner rush.",
    ],
    health: { score: 94, guest: 97, food: 95, speed: 88, inventory: 92 },
    categories: [
      { name: "Biryani", pct: 32, revenue: 3200 },
      { name: "Tandoor", pct: 24, revenue: 2020 },
      { name: "Dosa", pct: 18, revenue: 1510 },
      { name: "Curries", pct: 14, revenue: 1010 },
      { name: "Other", pct: 12, revenue: 670 },
    ],
    hourly: [
      { hour: "10:00", revenue: 420 },
      { hour: "11:00", revenue: 680 },
      { hour: "12:00", revenue: 1420 },
      { hour: "13:00", revenue: 1680 },
      { hour: "14:00", revenue: 920 },
      { hour: "15:00", revenue: 540 },
      { hour: "16:00", revenue: 480 },
      { hour: "17:00", revenue: 710 },
      { hour: "18:00", revenue: 1320 },
      { hour: "19:00", revenue: 1890 },
      { hour: "20:00", revenue: 2100 },
      { hour: "21:00", revenue: 1560 },
      { hour: "22:00", revenue: 880 },
      { hour: "23:00", revenue: 320 },
    ],
    daily: [
      { day: "03-20", revenue: 6200, orders: 98 },
      { day: "03-21", revenue: 7100, orders: 112 },
      { day: "03-22", revenue: 6800, orders: 105 },
      { day: "03-23", revenue: 7900, orders: 128 },
      { day: "03-24", revenue: 8400, orders: 140 },
      { day: "03-25", revenue: 9100, orders: 152 },
      { day: "03-26", revenue: 8412, orders: 147 },
    ],
    topDishes: [
      { name: "Chicken Biryani", qty: 48, revenue: 14352 },
      { name: "Butter Paneer", qty: 36, revenue: 8964 },
      { name: "Paneer Tikka", qty: 29, revenue: 7221 },
      { name: "Masala Dosa", qty: 41, revenue: 5289 },
      { name: "Gulab Jamun", qty: 52, revenue: 5148 },
      { name: "Idli Sambar", qty: 38, revenue: 3382 },
    ],
    activity: [
      { text: "Table 7 — Order served (avg 18min)", ago: "2m ago", tone: "ok" },
      { text: "Table 5 order delayed — Kitchen congestion", ago: "4m ago", tone: "warn" },
      { text: "Order #043 placed — Table 12", ago: "6m ago", tone: "info" },
      { text: "Revenue milestone: ₹8,000 crossed today", ago: "14m ago", tone: "ok" },
    ],
    totals: { revenue: 8412, orders: 147, aov: 57 },
  };
}

export function buildPromoOps(): DashboardOps {
  return {
    restaurantId: "promo",
    activeOrderCount: 23,
    occupiedTables: 9,
    restaurantSlug: "spice-garden",
    appUrl: "https://neuralkitchen.vezoradigital.com",
    liveOrders: [
      { id: "1", status: "preparing", total: 1840, tableNumber: 7, displayId: "042" },
      { id: "2", status: "ready", total: 920, tableNumber: 3, displayId: "041" },
      { id: "3", status: "placed", total: 1560, tableNumber: 12, displayId: "043" },
      { id: "4", status: "served", total: 2100, tableNumber: 5, displayId: "038" },
      { id: "5", status: "completed", total: 609, tableNumber: 7, displayId: "036" },
      { id: "6", status: "completed", total: 458, tableNumber: 12, displayId: "035" },
    ],
    tables: Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      number: i + 1,
      status: [3, 5, 7, 9].includes(i + 1) ? "occupied" : "available",
      qrToken: `demo-t${i + 1}`,
    })),
    inventory: [
      { id: "p1", name: "Paneer", unit: "g", qty: 340, lowThreshold: 200 },
      { id: "p2", name: "Soy Sauce", unit: "ml", qty: 520, lowThreshold: 50 },
      { id: "p3", name: "Butter", unit: "g", qty: 780, lowThreshold: 100 },
      { id: "p4", name: "Basmati Rice", unit: "g", qty: 920, lowThreshold: 600 },
      { id: "p5", name: "Cream", unit: "ml", qty: 960, lowThreshold: 200 },
      { id: "p6", name: "Yogurt", unit: "g", qty: 1170, lowThreshold: 200 },
    ],
  };
}
