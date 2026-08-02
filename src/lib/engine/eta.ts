export function computeEta(input: {
  basePrepMin: number;
  complexity: number;
  queueAhead: number;
  avgItemMin?: number;
  loadFactor: number;
  delayAdj?: number;
}): number {
  const avg = input.avgItemMin ?? 3;
  const delay = Math.max(
    -0.4 * input.basePrepMin,
    Math.min(0.4 * input.basePrepMin, input.delayAdj ?? 0)
  );
  const raw =
    input.basePrepMin * input.complexity +
    input.queueAhead * avg * Math.max(1, input.loadFactor) +
    delay;
  return Math.max(1, Math.round(raw));
}
