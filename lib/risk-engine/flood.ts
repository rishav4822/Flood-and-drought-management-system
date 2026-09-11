import { FloodDaily } from "@/lib/data-sources/openMeteoFlood";
import { isFiniteNum } from "@/lib/data-sources/fetchWithRetry";
import { ordinal } from "@/lib/format";
import { clampScore, FloodScore, GdacsAlert, scoreToSeverity } from "@/lib/types";
import { percentileRank, sameSeasonWindow } from "./stats";

const SEASON_TOLERANCE_DAYS = 15;
const PAST_DAYS = 7;

const ALERT_LEVEL_FLOOR: Record<GdacsAlert["alertLevel"], number> = {
  Green: 50,
  Orange: 70,
  Red: 90,
};

export function computeFloodScore(
  recent: FloodDaily,
  historical: FloodDaily,
  nearbyAlert: GdacsAlert | null,
): FloodScore {
  const series = recent.time
    .map((date, i) => ({ date, value: recent.river_discharge[i] }))
    .filter((p): p is { date: string; value: number } => isFiniteNum(p.value))
    .map((p) => ({ date: p.date, value: Math.round(p.value * 10) / 10 }));

  const todayIndex = Math.min(PAST_DAYS, recent.time.length - 1);
  const forecastValues = recent.river_discharge.slice(todayIndex).filter(isFiniteNum);

  if (forecastValues.length === 0) {
    const score = nearbyAlert ? ALERT_LEVEL_FLOOR[nearbyAlert.alertLevel] : 0;
    return {
      score,
      severity: scoreToSeverity(score),
      summary: nearbyAlert
        ? `No modeled river channel at this exact point, but GDACS has an active ${nearbyAlert.alertLevel} flood alert for ${nearbyAlert.country} (${nearbyAlert.eventName}) nearby.`
        : "No river discharge model is available at this exact point (likely a coastal or non-river location) — flood risk here isn't captured by this signal.",
      series,
      activeAlert: nearbyAlert,
    };
  }

  const historyPoints = historical.time
    .map((date, i) => ({ date, value: historical.river_discharge[i] }))
    .filter((p): p is { date: string; value: number } => isFiniteNum(p.value));

  const peakForecast = Math.max(...forecastValues);
  const anchor = new Date(recent.time[todayIndex] + "T00:00:00Z");

  const seasonalSample = sameSeasonWindow(historyPoints, anchor, SEASON_TOLERANCE_DAYS).map(
    (p) => p.value,
  );
  const percentile = percentileRank(peakForecast, seasonalSample);

  let score = clampScore(percentile);
  if (nearbyAlert) {
    score = Math.max(score, ALERT_LEVEL_FLOOR[nearbyAlert.alertLevel]);
  }

  const summary = buildSummary(peakForecast, percentile, seasonalSample, nearbyAlert);

  return {
    score,
    severity: scoreToSeverity(score),
    summary,
    series,
    activeAlert: nearbyAlert,
  };
}

function buildSummary(
  peakForecast: number,
  percentile: number,
  seasonalSample: number[],
  alert: GdacsAlert | null,
): string {
  const median = seasonalSample.length
    ? [...seasonalSample].sort((a, b) => a - b)[Math.floor(seasonalSample.length / 2)]
    : 0;

  const level =
    percentile >= 90
      ? "far above"
      : percentile >= 70
        ? "above"
        : percentile <= 20
          ? "well below"
          : "near";

  let text = `Forecast peak discharge of ${peakForecast.toFixed(0)} m³/s is ${level} the seasonal median (~${median.toFixed(0)} m³/s), the ${ordinal(percentile)} percentile for this time of year.`;

  if (alert) {
    text += ` GDACS has an active ${alert.alertLevel} flood alert for ${alert.country} (${alert.eventName})${alert.population ? `, affecting an estimated ${alert.population.toLocaleString()} people` : ""}.`;
  }

  return text;
}
