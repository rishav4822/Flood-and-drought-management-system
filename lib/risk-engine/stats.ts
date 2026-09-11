import { circularDayDistance, dayOfYear } from "@/lib/data-sources/dates";

export function percentileRank(value: number, sample: number[]): number {
  if (sample.length === 0) return 50;
  const below = sample.filter((v) => v <= value).length;
  return (below / sample.length) * 100;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sameSeasonWindow<T extends { date: string }>(
  points: T[],
  anchor: Date,
  windowDays: number,
): T[] {
  const anchorDoy = dayOfYear(anchor);
  return points.filter((p) => {
    const d = new Date(p.date + "T00:00:00Z");
    return circularDayDistance(dayOfYear(d), anchorDoy) <= windowDays;
  });
}

export function rollingSum(values: number[], windowSize: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= windowSize) sum -= values[i - windowSize];
    if (i >= windowSize - 1) out[i] = sum;
  }
  return out;
}
