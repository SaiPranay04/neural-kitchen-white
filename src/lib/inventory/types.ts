export type StockStatus = "ok" | "low" | "critical" | "out";

export type InventoryStockRow = {
  id: string;
  ingredientId: string;
  name: string;
  unit: string;
  qty: number;
  lowThreshold: number;
  reorderQty: number;
  category: string;
  department: string;
  avgCost: number;
  stockValue: number;
  daysOfCover: number;
  status: StockStatus;
  purchaseUom: string;
  purchaseConversion: number;
  lastPurchaseRate: number;
  supplier: string;
  perishable: boolean;
  yieldPct: number;
};

export type InventoryMovement = {
  id: string;
  ingredientName: string;
  delta: number;
  type: string;
  createdAt: string;
  unit: string;
  value: number;
};

export type RecipeCostRow = {
  menuItemId: string;
  name: string;
  price: number;
  plateCost: number;
  foodCostPct: number;
  margin: number;
  marginPct: number;
  popularity: number;
  engineering: "star" | "plowhorse" | "puzzle" | "dog";
  lines: { ingredient: string; qty: number; unit: string; cost: number }[];
};

export type PurchaseRow = {
  id: string;
  supplier: string;
  item: string;
  qty: number;
  unit: string;
  rate: number;
  total: number;
  date: string;
  kind: "po" | "cash" | "grn";
  status: string;
};

export type SupplierRow = {
  name: string;
  spend: number;
  orders: number;
  leadDays: number;
  items: string[];
};

export type VarianceRow = {
  name: string;
  unit: string;
  theoretical: number;
  actual: number;
  varianceQty: number;
  varianceValue: number;
  variancePct: number;
};

export type WasteRow = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  cost: number;
  reason: string;
  when: string;
};

export type InventoryKpis = {
  stockValue: number;
  itemsLow: number;
  itemsCritical: number;
  foodCostPct: number;
  cogsEstimate: number;
  wasteValue: number;
  purchaseSpend: number;
  avgMarginPct: number;
};

export type SpendByCategory = { name: string; value: number; pct: number };

export type InventoryBundle = {
  restaurantName: string;
  kpis: InventoryKpis;
  stock: InventoryStockRow[];
  movements: InventoryMovement[];
  recipes: RecipeCostRow[];
  purchases: PurchaseRow[];
  suppliers: SupplierRow[];
  variance: VarianceRow[];
  waste: WasteRow[];
  spendByCategory: SpendByCategory[];
  alerts: string[];
};
