import { metaFor } from "@/lib/inventory/catalog";
import type {
  InventoryBundle,
  InventoryKpis,
  InventoryMovement,
  InventoryStockRow,
  PurchaseRow,
  RecipeCostRow,
  SpendByCategory,
  SupplierRow,
  VarianceRow,
  WasteRow,
} from "@/lib/inventory/types";

export type RawStock = {
  id: string;
  ingredientId: string;
  name: string;
  unit: string;
  qty: number;
  lowThreshold: number;
  reorderQty: number;
  avgCost?: number | null;
  categoryName?: string | null;
  departmentName?: string | null;
};

export type RawRecipe = {
  menuItemId: string;
  name: string;
  price: number;
  popularity: number;
  lines: { ingredientName: string; qtyRequired: number; unit: string; avgCost?: number }[];
};

export type RawTxn = {
  id: string;
  ingredientName: string;
  unit: string;
  delta: number;
  type: string;
  createdAt: string;
  unitCost?: number | null;
};

function statusFor(qty: number, low: number): InventoryStockRow["status"] {
  if (qty <= 0) return "out";
  if (qty <= low * 0.5) return "critical";
  if (qty <= low) return "low";
  return "ok";
}

function engineering(
  popularity: number,
  marginPct: number,
  popMedian: number
): RecipeCostRow["engineering"] {
  const hot = popularity >= popMedian;
  const rich = marginPct >= 60;
  if (hot && rich) return "star";
  if (hot && !rich) return "plowhorse";
  if (!hot && rich) return "puzzle";
  return "dog";
}

export function buildInventoryBundle(input: {
  restaurantName: string;
  stock: RawStock[];
  recipes: RawRecipe[];
  transactions: RawTxn[];
}): InventoryBundle {
  const stock: InventoryStockRow[] = input.stock.map((s) => {
    const meta = metaFor(s.name);
    const avgCost = s.avgCost != null && s.avgCost > 0 ? Number(s.avgCost) : meta.avgCost;
    const daily = Math.max(meta.avgCost > 0 ? s.lowThreshold / 3 : 50, 1);
    const daysOfCover = s.qty / daily;
    return {
      id: s.id,
      ingredientId: s.ingredientId,
      name: s.name,
      unit: s.unit,
      qty: s.qty,
      lowThreshold: s.lowThreshold,
      reorderQty: s.reorderQty || meta.purchaseConversion,
      category: s.categoryName || meta.category,
      department: s.departmentName || meta.department,
      avgCost,
      stockValue: s.qty * avgCost,
      daysOfCover: Math.round(daysOfCover * 10) / 10,
      status: statusFor(s.qty, s.lowThreshold),
      purchaseUom: meta.purchaseUom,
      purchaseConversion: meta.purchaseConversion,
      lastPurchaseRate: meta.lastPurchaseRate,
      supplier: meta.supplier,
      perishable: meta.perishable,
      yieldPct: meta.yieldPct,
    };
  });

  const costByName = new Map(stock.map((s) => [s.name, s.avgCost]));

  const recipes: RecipeCostRow[] = input.recipes.map((r) => {
    const lines = r.lines.map((l) => {
      const costPer = l.avgCost ?? costByName.get(l.ingredientName) ?? metaFor(l.ingredientName).avgCost;
      const cost = Number(l.qtyRequired) * costPer;
      return {
        ingredient: l.ingredientName,
        qty: Number(l.qtyRequired),
        unit: l.unit,
        cost,
      };
    });
    const plateCost = lines.reduce((a, l) => a + l.cost, 0);
    const foodCostPct = r.price > 0 ? (plateCost / r.price) * 100 : 0;
    const margin = r.price - plateCost;
    const marginPct = r.price > 0 ? (margin / r.price) * 100 : 0;
    return {
      menuItemId: r.menuItemId,
      name: r.name,
      price: r.price,
      plateCost,
      foodCostPct,
      margin,
      marginPct,
      popularity: r.popularity,
      engineering: "dog",
      lines,
    };
  });

  const pops = recipes.map((r) => r.popularity).sort((a, b) => a - b);
  const popMedian = pops[Math.floor(pops.length / 2)] ?? 0;
  for (const r of recipes) {
    r.engineering = engineering(r.popularity, r.marginPct, popMedian);
  }

  const movements: InventoryMovement[] = input.transactions.slice(0, 40).map((t) => {
    const unitCost = t.unitCost ?? costByName.get(t.ingredientName) ?? metaFor(t.ingredientName).avgCost;
    return {
      id: t.id,
      ingredientName: t.ingredientName,
      delta: t.delta,
      type: t.type,
      createdAt: t.createdAt,
      unit: t.unit,
      value: Math.abs(t.delta) * unitCost,
    };
  });

  const purchasesFromTxn = movements
    .filter((m) => m.type === "purchase" && m.delta > 0)
    .map<PurchaseRow>((m, i) => ({
      id: m.id,
      supplier: metaFor(m.ingredientName).supplier,
      item: m.ingredientName,
      qty: m.delta,
      unit: m.unit,
      rate: m.value / Math.max(m.delta, 1),
      total: m.value,
      date: m.createdAt,
      kind: "grn",
      status: "received",
    }));

  // Seeded / synthetic purchase board when ledger is thin
  const purchases: PurchaseRow[] =
    purchasesFromTxn.length >= 3
      ? purchasesFromTxn
      : stock.slice(0, 8).map((s, i) => {
          const qtyPu = Math.max(1, Math.round(s.reorderQty / s.purchaseConversion));
          return {
            id: `syn-${i}`,
            supplier: s.supplier,
            item: s.name,
            qty: qtyPu,
            unit: s.purchaseUom,
            rate: s.lastPurchaseRate,
            total: qtyPu * s.lastPurchaseRate,
            date: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
            kind: i % 3 === 0 ? "cash" : "po",
            status: i % 4 === 0 ? "draft" : "received",
          };
        });

  const supplierMap = new Map<string, SupplierRow>();
  for (const p of purchases) {
    const cur = supplierMap.get(p.supplier) ?? {
      name: p.supplier,
      spend: 0,
      orders: 0,
      leadDays: 1,
      items: [],
    };
    cur.spend += p.total;
    cur.orders += 1;
    if (!cur.items.includes(p.item)) cur.items.push(p.item);
    supplierMap.set(p.supplier, cur);
  }
  const suppliers = [...supplierMap.values()].sort((a, b) => b.spend - a.spend);

  const wasteTxn = movements.filter((m) => m.type === "waste");
  const waste: WasteRow[] =
    wasteTxn.length > 0
      ? wasteTxn.map((m) => ({
          id: m.id,
          name: m.ingredientName,
          qty: Math.abs(m.delta),
          unit: m.unit,
          cost: m.value,
          reason: "spoilage",
          when: m.createdAt,
        }))
      : stock
          .filter((s) => s.perishable)
          .slice(0, 4)
          .map((s, i) => ({
            id: `w-${i}`,
            name: s.name,
            qty: Math.round(s.lowThreshold * 0.15),
            unit: s.unit,
            cost: Math.round(s.lowThreshold * 0.15 * s.avgCost),
            reason: i % 2 === 0 ? "expiry" : "spoilage",
            when: new Date(Date.now() - (i + 1) * 3600000 * 6).toISOString(),
          }));

  const consumption = movements.filter((m) => m.type === "consumption");
  const variance: VarianceRow[] = stock.slice(0, 10).map((s) => {
    const theoretical =
      consumption
        .filter((m) => m.ingredientName === s.name)
        .reduce((a, m) => a + Math.abs(m.delta), 0) || s.lowThreshold * 1.1;
    const wasteQty = waste
      .filter((w) => w.name === s.name)
      .reduce((a, w) => a + w.qty, 0);
    const actual = theoretical + wasteQty + theoretical * 0.04;
    const varianceQty = actual - theoretical;
    return {
      name: s.name,
      unit: s.unit,
      theoretical: Math.round(theoretical),
      actual: Math.round(actual),
      varianceQty: Math.round(varianceQty),
      varianceValue: Math.round(varianceQty * s.avgCost),
      variancePct: theoretical > 0 ? (varianceQty / theoretical) * 100 : 0,
    };
  });

  const catSpend = new Map<string, number>();
  for (const s of stock) {
    catSpend.set(s.category, (catSpend.get(s.category) ?? 0) + s.stockValue);
  }
  const catTotal = [...catSpend.values()].reduce((a, b) => a + b, 0) || 1;
  const spendByCategory: SpendByCategory[] = [...catSpend.entries()]
    .map(([name, value]) => ({ name, value, pct: (value / catTotal) * 100 }))
    .sort((a, b) => b.value - a.value);

  const stockValue = stock.reduce((a, s) => a + s.stockValue, 0);
  const cogsEstimate =
    consumption.reduce((a, m) => a + m.value, 0) ||
    recipes.reduce((a, r) => a + r.plateCost * Math.max(r.popularity, 1), 0) * 0.15;
  const purchaseSpend = purchases.reduce((a, p) => a + p.total, 0);
  const wasteValue = waste.reduce((a, w) => a + w.cost, 0);
  const foodCostPct =
    recipes.length > 0
      ? recipes.reduce((a, r) => a + r.foodCostPct, 0) / recipes.length
      : 28;
  const avgMarginPct =
    recipes.length > 0
      ? recipes.reduce((a, r) => a + r.marginPct, 0) / recipes.length
      : 65;

  const kpis: InventoryKpis = {
    stockValue,
    itemsLow: stock.filter((s) => s.status === "low" || s.status === "critical").length,
    itemsCritical: stock.filter((s) => s.status === "critical" || s.status === "out").length,
    foodCostPct,
    cogsEstimate,
    wasteValue,
    purchaseSpend,
    avgMarginPct,
  };

  const alerts: string[] = [];
  for (const s of stock.filter((x) => x.status === "critical" || x.status === "out").slice(0, 3)) {
    alerts.push(
      `${s.name} is ${s.status === "out" ? "out of stock" : "critically low"} — ${Math.round(s.qty)} ${s.unit} left · reorder from ${s.supplier}`
    );
  }
  if (wasteValue > 0) {
    alerts.push(`Waste logged at ${Math.round(wasteValue)} this window — review expiry on dairy first.`);
  }
  const highCost = recipes.filter((r) => r.foodCostPct > 35).slice(0, 2);
  for (const r of highCost) {
    alerts.push(`${r.name} food cost is ${r.foodCostPct.toFixed(0)}% — above 35% target.`);
  }

  return {
    restaurantName: input.restaurantName,
    kpis,
    stock: stock.sort((a, b) => a.qty / a.lowThreshold - b.qty / b.lowThreshold),
    movements,
    recipes: recipes.sort((a, b) => b.foodCostPct - a.foodCostPct),
    purchases,
    suppliers,
    variance,
    waste,
    spendByCategory,
    alerts,
  };
}
