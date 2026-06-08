const MIN_INTERVAL_MINUTES = 5;
const MAX_INTERVAL_MINUTES = 1440;

export function normalizeScanIntervalMinutes(value: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : 30);
  return Math.max(MIN_INTERVAL_MINUTES, Math.min(MAX_INTERVAL_MINUTES, rounded));
}

export function intervalToMilliseconds(minutes: number): number {
  return normalizeScanIntervalMinutes(minutes) * 60 * 1000;
}
