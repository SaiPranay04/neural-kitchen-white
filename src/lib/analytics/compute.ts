import { formatINR } from "@/lib/utils";

export type AnalyticsOrder = {
  id: string;
  total: number | string;
  status: string;
  placed_at: string | null;
  display_id?: string | null;
  order_items?: {
    qty: number;
    unit_price?: number | string;
    status?: string;
    started_at?: string | null;
    ready_at?: string | null;
    menu_items?: { name?: string; category_id?: string | null } | null;
  }[];
};

export type AnalyticsBundle = {
  restaurantName: string;
  kpis: {
    label: string;
    value: string;
    delta: string;
    positive: boolean;
  }[];
  insights: string[];
  health: {
    score: number;
    guest: number;
    food: number;
    speed: number;
    inventory: number;
  };
  categories: { name: string; pct: number; revenue: number }[];
  hourly: { hour: string; revenue: number }[];
  daily: { day: string; revenue: number; orders: number }[];
  topDishes: { name: string; qty: number; revenue: number }[];
  activity: { text: string; ago: string; tone: "ok" | "warn" | "info" }[];
  totals: {
    revenue: number;
    orders: number;
    aov: number;
  };
};

function agoLabel(iso: string | null | undefined): string {
  if (!iso) return "just now";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function buildAnalytics(input: {
  restaurantName: string;
  orders: AnalyticsOrder[];
  tablesCount: number;
  feedback: { rating: number }[];
  inventory: { qty: number; reorder_level?: number | null }[];
  notifications: { title: string; body?: string | null; created_at: string; severity?: string }[];
  categories: { id: string; name: string }[];
  activityLogs: { action: string; entity?: string | null; created_at: string; meta?: unknown }[];
}): AnalyticsBundle {
  const paidish = input.orders.filter((o) =>
    ["completed", "billed", "served", "ready", "partially_ready", "preparing", "accepted", "placed"].includes(
      o.status
    )
  );
  const closed = input.orders.filter((o) =>
    ["completed", "billed", "served"].includes(o.status)
  );

  const revenue = closed.reduce((s, o) => s + Number(o.total), 0);
  const orderCount = closed.length || paidish.length;
  const aov = orderCount ? revenue / orderCount : 0;

  // Split "this window" vs earlier half for fake-but-stable deltas from real data
  const sorted = [...closed].sort(
    (a, b) =>
      new Date(a.placed_at ?? 0).getTime() - new Date(b.placed_at ?? 0).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const recent = sorted.slice(mid);
  const prior = sorted.slice(0, mid);
  const recentRev = recent.reduce((s, o) => s + Number(o.total), 0);
  const priorRev = prior.reduce((s, o) => s + Number(o.total), 0) || 1;
  const revDeltaPct = ((recentRev - priorRev) / priorRev) * 100;
  const orderDelta = recent.length - prior.length;
  const recentAov = recent.length
    ? recent.reduce((s, o) => s + Number(o.total), 0) / recent.length
    : 0;
  const priorAov = prior.length
    ? prior.reduce((s, o) => s + Number(o.total), 0) / prior.length
    : recentAov || 1;
  const aovDelta = recentAov - priorAov;

  const turnover =
    input.tablesCount > 0 ? orderCount / input.tablesCount : orderCount;
  const margin = Math.min(
    48,
    Math.max(22, 38 - (input.inventory.filter((i) => Number(i.qty) < 20).length || 0))
  );

  const avgRating =
    input.feedback.length > 0
      ? input.feedback.reduce((s, f) => s + f.rating, 0) / input.feedback.length
      : 4.6;
  const guest = Math.round((avgRating / 5) * 100);

  const lowStock = input.inventory.filter(
    (i) => Number(i.qty) <= Number(i.reorder_level ?? 15)
  ).length;
  const invHealth = input.inventory.length
    ? Math.round(
        (1 - lowStock / Math.max(input.inventory.length, 1)) * 100
      )
    : 90;

  // Service speed from prep times
  let speedSamples = 0;
  let speedOk = 0;
  for (const o of input.orders) {
    for (const it of o.order_items ?? []) {
      if (it.started_at && it.ready_at) {
        speedSamples++;
        const mins =
          (new Date(it.ready_at).getTime() - new Date(it.started_at).getTime()) /
          60000;
        if (mins <= 25) speedOk++;
      }
    }
  }
  const speed = speedSamples
    ? Math.round((speedOk / speedSamples) * 100)
    : 88;
  const food = Math.round((guest * 0.55 + invHealth * 0.45));
  const healthScore = Math.round(
    guest * 0.3 + food * 0.25 + speed * 0.2 + invHealth * 0.25
  );

  const catRev = new Map<string, number>();
  const catName = new Map(input.categories.map((c) => [c.id, c.name]));
  for (const o of closed.length ? closed : paidish) {
    for (const it of o.order_items ?? []) {
      const cid = it.menu_items?.category_id ?? "other";
      const name = catName.get(cid ?? "") ?? "Other";
      const line = Number(it.unit_price ?? 0) * Number(it.qty);
      catRev.set(name, (catRev.get(name) ?? 0) + (line || Number(o.total) / Math.max((o.order_items ?? []).length, 1)));
    }
  }
  const catTotal = Array.from(catRev.values()).reduce((s, v) => s + v, 0) || 1;
  const categories = Array.from(catRev.entries())
    .map(([name, revenue]) => ({
      name,
      revenue: Math.round(revenue),
      pct: Math.round((revenue / catTotal) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  const hourly = Array.from({ length: 14 }, (_, i) => {
    const hour = 10 + i;
    const sum = (closed.length ? closed : paidish)
      .filter((o) => o.placed_at && new Date(o.placed_at).getHours() === hour)
      .reduce((s, o) => s + Number(o.total), 0);
    return { hour: `${hour}:00`, revenue: Math.round(sum) };
  });

  // Last 14 days
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of closed.length ? closed : paidish) {
    if (!o.placed_at) continue;
    const key = o.placed_at.slice(0, 10);
    if (!dailyMap.has(key)) continue;
    const row = dailyMap.get(key)!;
    row.revenue += Number(o.total);
    row.orders += 1;
  }
  const daily = Array.from(dailyMap.entries()).map(([day, v]) => ({
    day: day.slice(5),
    revenue: Math.round(v.revenue),
    orders: v.orders,
  }));

  const dishMap = new Map<string, { qty: number; revenue: number }>();
  for (const order of closed.length ? closed : paidish) {
    for (const item of order.order_items ?? []) {
      const name = item.menu_items?.name ?? "Item";
      const prev = dishMap.get(name) ?? { qty: 0, revenue: 0 };
      prev.qty += Number(item.qty);
      prev.revenue += Number(item.unit_price ?? 0) * Number(item.qty);
      dishMap.set(name, prev);
    }
  }
  const topDishes = Array.from(dishMap.entries())
    .map(([name, v]) => ({ name, qty: v.qty, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const activity: AnalyticsBundle["activity"] = [];
  for (const n of input.notifications.slice(0, 4)) {
    activity.push({
      text: n.title + (n.body ? ` — ${n.body.slice(0, 60)}` : ""),
      ago: agoLabel(n.created_at),
      tone: n.severity === "alert" ? "warn" : "info",
    });
  }
  for (const o of [...input.orders]
    .sort(
      (a, b) =>
        new Date(b.placed_at ?? 0).getTime() - new Date(a.placed_at ?? 0).getTime()
    )
    .slice(0, 5)) {
    activity.push({
      text: `Order #${o.display_id ?? o.id.slice(0, 4)} · ${o.status} · ${formatINR(Number(o.total))}`,
      ago: agoLabel(o.placed_at),
      tone: o.status === "preparing" ? "warn" : "ok",
    });
  }
  for (const log of input.activityLogs.slice(0, 3)) {
    activity.push({
      text: `${log.action}${log.entity ? ` · ${String(log.entity).slice(0, 8)}` : ""}`,
      ago: agoLabel(log.created_at),
      tone: "info",
    });
  }

  const insights: string[] = [];
  if (revDeltaPct > 5) {
    insights.push(
      `Revenue in the latest half of the sample is ${revDeltaPct.toFixed(0)}% above the earlier window — consider extending peak kitchen coverage.`
    );
  } else if (revDeltaPct < -5) {
    insights.push(
      `Recent revenue is trailing the earlier window by ${Math.abs(revDeltaPct).toFixed(0)}% — push AI upsells on sides & desserts.`
    );
  } else {
    insights.push(
      `Revenue is stable across the sample window (${formatINR(revenue)}). Keep pacing the tandoor station.`
    );
  }
  if (lowStock > 0) {
    insights.push(
      `Inventory alert: ${lowStock} item(s) at/under reorder — 86-ripple will protect the menu automatically.`
    );
  } else {
    insights.push("Inventory health looks solid — no critical reorder breaches right now.");
  }
  if (topDishes[0]) {
    insights.push(
      `Top mover: ${topDishes[0].name} (${topDishes[0].qty} sold). Keep prep mise ready for rush.`
    );
  }

  return {
    restaurantName: input.restaurantName,
    kpis: [
      {
        label: "Revenue",
        value: formatINR(revenue),
        delta: `${revDeltaPct >= 0 ? "+" : ""}${revDeltaPct.toFixed(1)}% vs earlier window`,
        positive: revDeltaPct >= 0,
      },
      {
        label: "Total orders",
        value: String(orderCount),
        delta: `${orderDelta >= 0 ? "+" : ""}${orderDelta} vs earlier window`,
        positive: orderDelta >= 0,
      },
      {
        label: "Avg order value",
        value: formatINR(aov),
        delta: `${aovDelta >= 0 ? "+" : ""}${formatINR(aovDelta)} vs earlier`,
        positive: aovDelta >= 0,
      },
      {
        label: "Table turnover",
        value: `${turnover.toFixed(1)}×`,
        delta: `${input.tablesCount} tables · sample`,
        positive: true,
      },
      {
        label: "Est. margin",
        value: `${margin.toFixed(1)}%`,
        delta: lowStock ? "pressured by low stock" : "+healthy stock",
        positive: !lowStock,
      },
    ],
    insights,
    health: {
      score: healthScore,
      guest,
      food,
      speed,
      inventory: invHealth,
    },
    categories,
    hourly,
    daily,
    topDishes,
    activity: activity.slice(0, 8),
    totals: { revenue, orders: orderCount, aov },
  };
}
