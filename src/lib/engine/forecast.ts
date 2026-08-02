export function weightedMovingAverage(a: number, b: number, c: number): number {
  return 0.5 * a + 0.3 * b + 0.2 * c;
}

export function dayType(date: Date): "weekday" | "weekend" {
  const d = date.getDay();
  return d === 0 || d === 6 ? "weekend" : "weekday";
}
