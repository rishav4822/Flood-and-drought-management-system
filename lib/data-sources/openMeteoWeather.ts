import { fetchWithRetry } from "./fetchWithRetry";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const REVALIDATE_SECONDS = 600;

export interface WeatherDaily {
  time: string[];
  temperature_2m_max: number[];
  apparent_temperature_max: number[];
}

export interface WeatherResponse {
  daily: WeatherDaily;
}

export async function fetchWeatherDaily(lat: number, lon: number): Promise<WeatherDaily> {
  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("daily", "temperature_2m_max,apparent_temperature_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("past_days", "7");
  url.searchParams.set("forecast_days", "7");

  const res = await fetchWithRetry(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo weather request failed: ${res.status}`);
  }

  const json = (await res.json()) as WeatherResponse;
  return json.daily;
}
