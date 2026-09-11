import { fetchWeatherDaily } from "@/lib/data-sources/openMeteoWeather";
import { fetchFloodHistoricalBaseline, fetchFloodRecentAndForecast } from "@/lib/data-sources/openMeteoFlood";
import { fetchDroughtHistory } from "@/lib/data-sources/nasaPower";
import { findNearbyFloodAlert } from "@/lib/data-sources/gdacs";
import { RiskResult } from "@/lib/types";
import { computeDroughtScore } from "./drought";
import { computeFloodScore } from "./flood";
import { computeHeatScore } from "./heat";
import { combineScores } from "./combine";

export async function assessLocation(
  name: string,
  lat: number,
  lon: number,
): Promise<RiskResult> {
  const [droughtHistory, floodRecent, floodHistorical, weather, nearbyAlert] = await Promise.all([
    fetchDroughtHistory(lat, lon),
    fetchFloodRecentAndForecast(lat, lon),
    fetchFloodHistoricalBaseline(lat, lon),
    fetchWeatherDaily(lat, lon),
    findNearbyFloodAlert(lat, lon).catch(() => null),
  ]);

  const drought = computeDroughtScore(droughtHistory);
  const flood = computeFloodScore(floodRecent, floodHistorical, nearbyAlert);
  const heat = computeHeatScore(weather);
  const combined = combineScores(drought.score, flood.score, heat.score);

  return {
    location: { name, lat, lon },
    updatedAt: new Date().toISOString(),
    drought,
    flood,
    heat,
    combined,
  };
}
