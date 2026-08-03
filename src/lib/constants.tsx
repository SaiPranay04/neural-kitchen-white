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

export const MENU_CATEGORIES = ["All", "Starters", "Tandoor", "Biryani", "Dosa", "Curries", "Desserts", "Drinks"];

export type DemoMenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tag: string;
  calories: number;
  img: string;
  veg: boolean;
  spicy: number; // 0 mild · 1 medium · 2 hot
  tags: string[];
  allergens: string[];
  desc: string;
};

export const MENU_ITEMS: DemoMenuItem[] = [
  { id: 1, name: "Paneer Tikka", category: "Tandoor", price: 249, rating: 4.8, reviews: 203, tag: "Chef's Pick", calories: 320, veg: true, spicy: 1, tags: ["paneer", "tandoor", "starter"], allergens: ["dairy"], desc: "Cottage cheese tikka with mint chutney.", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d9?w=400&h=300&fit=crop&q=80" },
  { id: 2, name: "Chicken Biryani", category: "Biryani", price: 299, rating: 4.9, reviews: 451, tag: "Best Seller", calories: 780, veg: false, spicy: 1, tags: ["biryani", "chicken", "rice"], allergens: ["dairy"], desc: "Dum biryani with raita.", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop&q=80" },
  { id: 3, name: "Masala Dosa", category: "Dosa", price: 129, rating: 4.7, reviews: 334, tag: "Breakfast", calories: 420, veg: true, spicy: 0, tags: ["dosa", "south-indian", "breakfast"], allergens: [], desc: "Crispy dosa with potato masala and coconut chutney.", img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop&q=80" },
  { id: 4, name: "Butter Paneer", category: "Curries", price: 249, rating: 4.8, reviews: 189, tag: "Veg Favourite", calories: 490, veg: true, spicy: 0, tags: ["paneer", "curry", "creamy"], allergens: ["dairy", "nuts"], desc: "Creamy tomato-butter gravy with soft paneer.", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&q=80" },
  { id: 5, name: "Idli Sambar", category: "Starters", price: 89, rating: 4.6, reviews: 127, tag: "", calories: 280, veg: true, spicy: 0, tags: ["idli", "south-indian", "light"], allergens: [], desc: "Steamed idli with hot sambar.", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop&q=80" },
  { id: 6, name: "Gulab Jamun", category: "Desserts", price: 99, rating: 4.9, reviews: 512, tag: "Fan Fave", calories: 360, veg: true, spicy: 0, tags: ["dessert", "sweet", "mithai"], allergens: ["dairy", "gluten"], desc: "Soft milk dumplings in rose syrup.", img: "https://images.unsplash.com/photo-1666190102466-4ee27f1c72b3?w=400&h=300&fit=crop&q=80" },
  { id: 7, name: "Chicken 65", category: "Starters", price: 219, rating: 4.7, reviews: 98, tag: "Spicy", calories: 390, veg: false, spicy: 2, tags: ["chicken", "spicy", "starter"], allergens: [], desc: "Crispy spicy chicken starter.", img: "https://images.unsplash.com/photo-1606491956689-2ea866880017?w=400&h=300&fit=crop&q=80" },
  { id: 8, name: "Veg Fried Rice", category: "Curries", price: 179, rating: 4.5, reviews: 167, tag: "Vegetarian", calories: 520, veg: true, spicy: 0, tags: ["rice", "veg"], allergens: ["soy"], desc: "Wok-tossed veg rice.", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&q=80" },
  { id: 9, name: "Mutton Rogan Josh", category: "Curries", price: 349, rating: 4.7, reviews: 188, tag: "", calories: 620, veg: false, spicy: 1, tags: ["mutton", "curry"], allergens: ["dairy"], desc: "Slow-cooked Kashmiri-style mutton curry.", img: "https://images.unsplash.com/photo-1545247181-516773cae754?w=400&h=300&fit=crop&q=80" },
  { id: 10, name: "Ghee Roast Dosa", category: "Dosa", price: 149, rating: 4.6, reviews: 156, tag: "Crispy", calories: 450, veg: true, spicy: 0, tags: ["dosa", "south-indian"], allergens: ["dairy"], desc: "Golden dosa roasted in ghee.", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop&q=80" },
  { id: 11, name: "Rasmalai", category: "Desserts", price: 119, rating: 4.7, reviews: 143, tag: "", calories: 310, veg: true, spicy: 0, tags: ["dessert", "sweet", "dairy"], allergens: ["dairy"], desc: "Soft paneer discs in saffron milk.", img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&q=80" },
  { id: 12, name: "Filter Coffee", category: "Drinks", price: 49, rating: 4.8, reviews: 201, tag: "Signature", calories: 80, veg: true, spicy: 0, tags: ["drink", "coffee", "south-indian"], allergens: ["dairy"], desc: "South Indian filter coffee.", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&q=80" },
];

export const KDS_ORDERS = {
  placed: [
    { id: "ORD-1042", table: 7, items: ["Chicken Biryani", "Raita"], time: 2, priority: "high" },
    { id: "ORD-1043", table: 12, items: ["Masala Dosa", "Filter Coffee"], time: 1, priority: "normal" },
  ],
  preparing: [
    { id: "ORD-1038", table: 3, items: ["Butter Paneer", "Butter Naan", "Jeera Rice"], time: 8, priority: "high" },
    { id: "ORD-1039", table: 9, items: ["Gulab Jamun x2", "Rasmalai"], time: 6, priority: "normal" },
    { id: "ORD-1040", table: 5, items: ["Chicken 65", "Veg Fried Rice"], time: 12, priority: "urgent" },
  ],
  ready: [
    { id: "ORD-1035", table: 2, items: ["Paneer Tikka", "Ghee Roast Dosa"], time: 4, priority: "normal" },
    { id: "ORD-1036", table: 11, items: ["Idli Sambar"], time: 2, priority: "normal" },
  ],
  served: [
    { id: "ORD-1030", table: 1, items: ["Idli x2", "Filter Coffee"], time: 0, priority: "normal" },
    { id: "ORD-1031", table: 6, items: ["Chicken Biryani", "Sweet Lassi"], time: 0, priority: "normal" },
    { id: "ORD-1032", table: 8, items: ["Masala Dosa x2", "Gulab Jamun"], time: 0, priority: "normal" },
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
  { name: "Biryani", value: 32, color: C.navy },
  { name: "Tandoor", value: 22, color: C.orange },
  { name: "Dosa", value: 18, color: C.emerald },
  { name: "Curries", value: 16, color: C.purple },
  { name: "Other", value: 12, color: C.slate400 },
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
