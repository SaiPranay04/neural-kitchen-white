import React from "react";
import { UtensilsCrossed, ChefHat, LayoutDashboard, Package, Users, UserCheck, BarChart3, Brain, Star, Globe, Cpu } from "lucide-react";

export const C = {
  navy: "#1B2B5E",
  navyLight: "#2D3F7C",
  orange: "#E87722",
  orangeLight: "#F59340",
  cream: "#FAFAF8",
  white: "#FFFFFF",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  emerald: "#10B981",
  emeraldLight: "#D1FAE5",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEE2E2",
  cyan: "#06B6D4",
  cyanLight: "#CFFAFE",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  rose: "#F43F5E",
  roseLight: "#FFE4E6",
};

export const MENU_CATEGORIES = ["All", "Starters", "Mains", "Burgers", "Pizza", "Salads", "Desserts", "Drinks"];

export const MENU_ITEMS = [
  { id: 1, name: "Truffle Arancini", category: "Starters", price: 14.99, rating: 4.8, reviews: 203, tag: "Chef's Pick", calories: 320, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80" },
  { id: 2, name: "Wagyu Beef Burger", category: "Burgers", price: 26.99, rating: 4.9, reviews: 451, tag: "Best Seller", calories: 780, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80" },
  { id: 3, name: "Margherita Classica", category: "Pizza", price: 18.99, rating: 4.7, reviews: 334, tag: "New", calories: 620, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80" },
  { id: 4, name: "Pan-Seared Salmon", category: "Mains", price: 32.99, rating: 4.8, reviews: 189, tag: "Healthy", calories: 490, img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&q=80" },
  { id: 5, name: "Caesar Supreme", category: "Salads", price: 16.99, rating: 4.6, reviews: 127, tag: "", calories: 380, img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop&q=80" },
  { id: 6, name: "Lava Chocolate Cake", category: "Desserts", price: 12.99, rating: 4.9, reviews: 512, tag: "Fan Fave", calories: 560, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&q=80" },
  { id: 7, name: "Burrata & Heirloom", category: "Starters", price: 17.99, rating: 4.7, reviews: 98, tag: "Seasonal", calories: 290, img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop&q=80" },
  { id: 8, name: "Truffle Mushroom Pasta", category: "Mains", price: 24.99, rating: 4.8, reviews: 267, tag: "Vegetarian", calories: 560, img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=80" },
  { id: 9, name: "Smash Burger Stack", category: "Burgers", price: 21.99, rating: 4.7, reviews: 388, tag: "", calories: 720, img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&q=80" },
  { id: 10, name: "Spicy Tuna Pizza", category: "Pizza", price: 22.99, rating: 4.6, reviews: 156, tag: "Spicy", calories: 690, img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop&q=80" },
  { id: 11, name: "Berry Panna Cotta", category: "Desserts", price: 11.99, rating: 4.7, reviews: 143, tag: "", calories: 340, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&q=80" },
  { id: 12, name: "Mango Passion Cooler", category: "Drinks", price: 8.99, rating: 4.8, reviews: 201, tag: "Signature", calories: 180, img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&q=80" },
];

export const KDS_ORDERS = {
  placed: [
    { id: "ORD-1042", table: 7, items: ["Wagyu Burger", "Truffle Fries"], time: 2, priority: "high" },
    { id: "ORD-1043", table: 12, items: ["Margherita", "Caesar"], time: 1, priority: "normal" },
  ],
  preparing: [
    { id: "ORD-1038", table: 3, items: ["Salmon", "Burrata", "Pasta"], time: 8, priority: "high" },
    { id: "ORD-1039", table: 9, items: ["Lava Cake x2", "Panna Cotta"], time: 6, priority: "normal" },
    { id: "ORD-1040", table: 5, items: ["Smash Burger", "Onion Rings"], time: 12, priority: "urgent" },
  ],
  ready: [
    { id: "ORD-1035", table: 2, items: ["Arancini", "Spicy Tuna Pizza"], time: 4, priority: "normal" },
    { id: "ORD-1036", table: 11, items: ["Berry Panna Cotta"], time: 2, priority: "normal" },
  ],
  served: [
    { id: "ORD-1030", table: 1, items: ["Caesar x2", "Salmon"], time: 0, priority: "normal" },
    { id: "ORD-1031", table: 6, items: ["Wagyu Burger", "Mango Cooler"], time: 0, priority: "normal" },
    { id: "ORD-1032", table: 8, items: ["Pizza x2", "Lava Cake"], time: 0, priority: "normal" },
  ],
};

export const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, orders: 1240, profit: 14000 },
  { month: "Feb", revenue: 48000, orders: 1380, profit: 16200 },
  { month: "Mar", revenue: 51000, orders: 1490, profit: 17800 },
  { month: "Apr", revenue: 46000, orders: 1320, profit: 15400 },
  { month: "May", revenue: 58000, orders: 1680, profit: 20100 },
  { month: "Jun", revenue: 62000, orders: 1820, profit: 22400 },
  { month: "Jul", revenue: 71000, orders: 2100, profit: 26200 },
];

export const CATEGORY_DATA = [
  { name: "Mains", value: 38, color: C.navy },
  { name: "Burgers", value: 24, color: C.orange },
  { name: "Pizza", value: 18, color: C.emerald },
  { name: "Desserts", value: 12, color: C.purple },
  { name: "Other", value: 8, color: C.slate400 },
];

export const BENTO_MODULES = [
  { icon: <UtensilsCrossed size={22} />, label: "Customer Menu", desc: "AI-curated digital menus with live inventory sync", color: C.orange, page: "menu", size: "large" },
  { icon: <ChefHat size={22} />, label: "Kitchen Display", desc: "Real-time KDS with smart station routing", color: C.emerald, page: "kds", size: "large" },
  { icon: <LayoutDashboard size={22} />, label: "Executive Dashboard", desc: "P&L, health scores, live revenue analytics", color: C.navy, page: "admin", size: "large" },
  { icon: <Package size={22} />, label: "Inventory Intelligence", desc: "Auto-reorder, waste prediction, cost control", color: C.purple, size: "small" },
  { icon: <Users size={22} />, label: "CRM & Loyalty", desc: "Guest profiles, rewards, birthday triggers", color: C.rose, size: "small" },
  { icon: <UserCheck size={22} />, label: "Staff Management", desc: "Shifts, performance, payroll integration", color: C.cyan, size: "small" },
  { icon: <BarChart3 size={22} />, label: "Analytics Suite", desc: "Cohort analysis, funnel, heatmaps", color: C.amber, size: "small" },
  { icon: <Brain size={22} />, label: "AI Forecasting", desc: "Demand prediction, staffing recommendations", color: C.navyLight, size: "small" },
  { icon: <Star size={22} />, label: "Review Intelligence", desc: "Sentiment analysis across all platforms", color: C.orange, size: "small" },
  { icon: <Globe size={22} />, label: "Multi-Branch", desc: "Centralized control across all locations", color: C.emerald, size: "small" },
  { icon: <Cpu size={22} />, label: "AI Copilot", desc: "24/7 operational AI for every department", color: C.navy, size: "small" },
];
