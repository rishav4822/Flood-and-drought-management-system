import { daysAgo, isoDate, yearsAgo } from "./dates";
import { fetchWithRetry } from "./fetchWithRetry";

const BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";
const REVALIDATE_SECONDS = 3600;

export interface PowerDailyPoint {
  date: string;
  precip: number;
  soilMoisture: number;
}

interface PowerResponse {
  properties: {
    parameter: {
      PRECTOTCORR?: Record<string, number>;
      GWETROOT?: Record<string, number>;
    };
  };
}

function ymd(d: Date): string {
  return isoDate(d).replaceAll("-", "");
}

export async function fetchDroughtHistory(lat: number, lon: number): Promise<PowerDailyPoint[]> {
  const start = ymd(yearsAgo(3));
  const end = ymd(daysAgo(2));

  const url = new URL(BASE_URL);
  url.searchParams.set("parameters", "PRECTOTCORR,GWETROOT");
  url.searchParams.set("community", "AG");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);
  url.searchParams.set("format", "JSON");

  const res = await fetchWithRetry(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`NASA POWER request failed: ${res.status}`);
  }

  const json = (await res.json()) as PowerResponse;
  const precip = json.properties.parameter.PRECTOTCORR ?? {};
  const soil = json.properties.parameter.GWETROOT ?? {};

  const dates = Object.keys(precip).sort();
  return dates.map((raw) => ({
    date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
    precip: valueOrZero(precip[raw]),
    soilMoisture: valueOrZero(soil[raw]),
  }));
}

function valueOrZero(v: number | undefined): number {
  if (v === undefined || v <= -900) return 0;
  return v;
}
