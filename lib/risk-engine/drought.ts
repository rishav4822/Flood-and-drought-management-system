import { PowerDailyPoint } from "@/lib/data-sources/nasaPower";
import { ordinal } from "@/lib/format";
import { clampScore, scoreToSeverity, SubScore } from "@/lib/types";
import { mean, percentileRank, rollingSum, sameSeasonWindow } from "./stats";

const WINDOW_DAYS = 90;
const SEASON_TOLERANCE_DAYS = 20;

export function computeDroughtScore(history: PowerDailyPoint[]): SubScore {
  if (history.length < WINDOW_DAYS + 30) {
    return {
      score: 0,
      severity: "low",
      summary: "Not enough historical data to assess drought risk.",
      series: [],
    };
  }

  const precipValues = history.map((p) => p.precip);
  const rollingPrecip = rollingSum(precipValues, WINDOW_DAYS);

  const dated = history
    .map((p, i) => ({ date: p.date, sum: rollingPrecip[i], soil: p.soilMoisture }))
    .filter((p): p is { date: string; sum: number; soil: number } => p.sum !== null);

  const latest = dated[dated.length - 1];
  const anchor = new Date(latest.date + "T00:00:00Z");

  const seasonalPrecipSample = sameSeasonWindow(dated, anchor, SEASON_TOLERANCE_DAYS).map((p) => p.sum);
  const precipPercentile = percentileRank(latest.sum, seasonalPrecipSample);

  const recentSoil = mean(history.slice(-14).map((p) => p.soilMoisture));
  const seasonalSoilSample = sameSeasonWindow(history, anchor, SEASON_TOLERANCE_DAYS).map(
    (p) => p.soilMoisture,
  );
  const soilPercentile = percentileRank(recentSoil, seasonalSoilSample);

  const deficitScore = clampScore(0.55 * (100 - precipPercentile) + 0.45 * (100 - soilPercentile));

  const series = dated.slice(-90).map((p) => ({ date: p.date, value: Math.round(p.sum) }));

  const summary = buildSummary(latest.sum, precipPercentile, recentSoil, soilPercentile);

  return {
    score: deficitScore,
    severity: scoreToSeverity(deficitScore),
    summary,
    series,
  };
}

function buildSummary(
  precipSum: number,
  precipPercentile: number,
  soilMoisture: number,
  soilPercentile: number,
): string {
  const rain = Math.round(precipSum);
  const rainDesc =
    precipPercentile <= 20
      ? "well below the seasonal norm"
      : precipPercentile <= 40
        ? "below the seasonal norm"
        : precipPercentile >= 80
          ? "well above the seasonal norm"
          : "near the seasonal norm";

  const soilDesc =
    soilPercentile <= 25
      ? "root-zone soil moisture is critically low"
      : soilPercentile <= 45
        ? "soil moisture is trending dry"
        : "soil moisture is within a normal range";

  return `${rain} mm of rain over the last 90 days, ${rainDesc} (${ordinal(precipPercentile)} percentile for this time of year). ${soilDesc.charAt(0).toUpperCase()}${soilDesc.slice(1)} (${ordinal(soilPercentile)} percentile, ${(soilMoisture * 100).toFixed(0)}% saturation).`;
}
