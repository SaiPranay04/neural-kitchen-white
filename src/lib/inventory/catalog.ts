/** Fallback enrichment for known Indian kitchen ingredients (works pre-migration). */

export type IngredientMeta = {
  category: string;
  department: string;
  /** Cost per base unit (₹/g or ₹/ml) */
  avgCost: number;
  /** Typical purchase display */
  purchaseUom: string;
  purchaseConversion: number;
  yieldPct: number;
  perishable: boolean;
  /** Suggested last purchase rate in purchase UOM */
  lastPurchaseRate: number;
  supplier: string;
};

export const INGREDIENT_META: Record<string, IngredientMeta> = {
  Paneer: {
    category: "Dairy",
    department: "Kitchen",
    avgCost: 0.42,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: true,
    lastPurchaseRate: 420,
    supplier: "Amul Dairy Depot",
  },
  Chicken: {
    category: "Meat",
    department: "Kitchen",
    avgCost: 0.28,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 0.72,
    perishable: true,
    lastPurchaseRate: 220,
    supplier: "Coastal Fresh Meats",
  },
  "Basmati Rice": {
    category: "Groceries",
    department: "Kitchen",
    avgCost: 0.12,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: false,
    lastPurchaseRate: 120,
    supplier: "Godavari Grains",
  },
  Mushroom: {
    category: "Vegetables",
    department: "Kitchen",
    avgCost: 0.35,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 0.9,
    perishable: true,
    lastPurchaseRate: 280,
    supplier: "Green Valley Mandi",
  },
  Capsicum: {
    category: "Vegetables",
    department: "Kitchen",
    avgCost: 0.08,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 0.85,
    perishable: true,
    lastPurchaseRate: 60,
    supplier: "Green Valley Mandi",
  },
  Yogurt: {
    category: "Dairy",
    department: "Kitchen",
    avgCost: 0.08,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: true,
    lastPurchaseRate: 70,
    supplier: "Amul Dairy Depot",
  },
  Cream: {
    category: "Dairy",
    department: "Kitchen",
    avgCost: 0.25,
    purchaseUom: "L",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: true,
    lastPurchaseRate: 240,
    supplier: "Amul Dairy Depot",
  },
  Butter: {
    category: "Dairy",
    department: "Kitchen",
    avgCost: 0.55,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: true,
    lastPurchaseRate: 520,
    supplier: "Amul Dairy Depot",
  },
  Tomato: {
    category: "Vegetables",
    department: "Kitchen",
    avgCost: 0.04,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 0.9,
    perishable: true,
    lastPurchaseRate: 35,
    supplier: "Green Valley Mandi",
  },
  "Black Lentils": {
    category: "Groceries",
    department: "Kitchen",
    avgCost: 0.14,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: false,
    lastPurchaseRate: 140,
    supplier: "Godavari Grains",
  },
  "Soy Sauce": {
    category: "Groceries",
    department: "Kitchen",
    avgCost: 0.18,
    purchaseUom: "L",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: false,
    lastPurchaseRate: 160,
    supplier: "Indo Spices & Oils",
  },
  Flour: {
    category: "Groceries",
    department: "Kitchen",
    avgCost: 0.04,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 1,
    perishable: false,
    lastPurchaseRate: 38,
    supplier: "Godavari Grains",
  },
  Potato: {
    category: "Vegetables",
    department: "Kitchen",
    avgCost: 0.03,
    purchaseUom: "kg",
    purchaseConversion: 1000,
    yieldPct: 0.85,
    perishable: true,
    lastPurchaseRate: 28,
    supplier: "Green Valley Mandi",
  },
};

export function metaFor(name: string): IngredientMeta {
  return (
    INGREDIENT_META[name] ?? {
      category: "Other",
      department: "Kitchen",
      avgCost: 0.1,
      purchaseUom: "kg",
      purchaseConversion: 1000,
      yieldPct: 1,
      perishable: false,
      lastPurchaseRate: 100,
      supplier: "General Store",
    }
  );
}
