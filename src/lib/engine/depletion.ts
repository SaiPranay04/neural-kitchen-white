export function hoursToDepletion(stock: number, consumptionPerHour: number): number {
  if (stock <= 0) return 0;
  if (consumptionPerHour <= 0) return Infinity;
  return stock / consumptionPerHour;
}

export function reorderQty(forecastTomorrow: number, stock: number, buffer = 1.2): number {
  return Math.max(0, Math.ceil(forecastTomorrow * buffer - stock));
}

export function consumptionRate(transactions: { delta: number; created_at: string }[], hours = 3) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const consumed = transactions
    .filter((t) => new Date(t.created_at).getTime() >= cutoff && t.delta < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.delta)), 0);
  return consumed / hours;
}
