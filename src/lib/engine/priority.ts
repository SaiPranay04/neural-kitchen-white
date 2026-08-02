export function computePriority(input: {
  minutesWaiting: number;
  basePrepMin: number;
  siblingsReady: number;
  siblingsTotal: number;
}): number {
  const waitScore = 0.5 * input.minutesWaiting;
  const speedScore = 0.3 * (10 / Math.max(1, input.basePrepMin));
  const completionBoost =
    input.siblingsTotal > 1 && input.siblingsReady > 0 ? 5 * 0.2 : 0;
  return Number((waitScore + speedScore + completionBoost).toFixed(2));
}
