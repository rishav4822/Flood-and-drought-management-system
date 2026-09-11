import { daysAgo, isoDate, yearsAgo } from "./dates";
import { fetchWithRetry } from "./fetchWithRetry";

const BASE_URL = "https://flood-api.open-meteo.com/v1/flood";
const REVALIDATE_SECONDS = 900;

export interface FloodDaily {
  time: string[];
  river_discharge: number[];
}

interface FloodResponse {
  daily: FloodDaily;
}

async function requestFlood(params: Record<string, string>): Promise<FloodDaily> {
  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", params.latitude);
  url.searchParams.set("longitude", params.longitude);
  url.searchParams.set("daily", "river_discharge");
  url.searchParams.set("timezone", "auto");
  for (const [key, value] of Object.entries(params)) {
    if (key === "latitude" || key === "longitude") continue;
    url.searchParams.set(key, value);
  }

  const res = await fetchWithRetry(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo flood request failed: ${res.status}`);
  }

  const json = (await res.json()) as FloodResponse;
  return json.daily;
}

export async function fetchFloodRecentAndForecast(lat: number, lon: number): Promise<FloodDaily> {
  return requestFlood({
    latitude: String(lat),
    longitude: String(lon),
    past_days: "7",
    forecast_days: "7",
  });
}

export async function fetchFloodHistoricalBaseline(lat: number, lon: number): Promise<FloodDaily> {
  const start = isoDate(yearsAgo(3));
  const end = isoDate(daysAgo(1));
  return requestFlood({
    latitude: String(lat),
    longitude: String(lon),
    start_date: start,
    end_date: end,
  });
}
