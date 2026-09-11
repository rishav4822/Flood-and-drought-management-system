export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export function yearsAgo(n: number): Date {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - n);
  return d;
}

export function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d.getTime() - start) / 86_400_000) + 1;
}

export function circularDayDistance(a: number, b: number, yearLength = 365.25): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, yearLength - diff);
}
