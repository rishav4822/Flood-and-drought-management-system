export type Severity = "low" | "moderate" | "high" | "severe";

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface SubScore {
  score: number;
  severity: Severity;
  summary: string;
  series: SeriesPoint[];
}

export interface GdacsAlert {
  eventType: string;
  eventName: string;
  alertLevel: "Green" | "Orange" | "Red";
  country: string;
  lat: number;
  lon: number;
  fromDate: string;
  toDate: string;
  population?: number;
  link?: string;
}

export interface FloodScore extends SubScore {
  activeAlert: GdacsAlert | null;
}

export interface RiskResult {
  location: { name: string; lat: number; lon: number };
  updatedAt: string;
  drought: SubScore;
  flood: FloodScore;
  heat: SubScore;
  combined: {
    score: number;
    severity: Severity;
    drivingHazard: "drought" | "flood" | "heat";
  };
}

export interface DistrictSeed {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  tags: Array<"drought" | "flood" | "heat">;
}

export function scoreToSeverity(score: number): Severity {
  if (score >= 75) return "severe";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

export function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
