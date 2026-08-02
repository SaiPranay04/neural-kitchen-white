export function computeCongestion(activeCount: number, capacity: number): number {
  if (capacity <= 0) return 999;
  return activeCount / capacity;
}

export function loadFactor(activeCount: number, capacity: number): number {
  return Math.max(1, computeCongestion(activeCount, capacity));
}
