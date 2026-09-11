import { WeatherDaily } from "@/lib/data-sources/openMeteoWeather";
import { clampScore, scoreToSeverity, SubScore } from "@/lib/types";
import { mean } from "./stats";

const PAST_DAYS = 7;

export function computeHeatScore(daily: WeatherDaily): SubScore {
  const todayIndex = Math.min(PAST_DAYS, daily.time.length - 1);
  const recentNormal = mean(daily.temperature_2m_max.slice(0, todayIndex));

  const forecastMax = daily.temperature_2m_max.slice(todayIndex);
  const forecastApparent = daily.apparent_temperature_max.slice(todayIndex);

  let consecutiveHeatwaveDays = 0;
  let peakDeparture = -Infinity;
  let hasSevereDay = false;

  for (let i = 0; i < forecastMax.length; i++) {
    const departure = forecastMax[i] - recentNormal;
    peakDeparture = Math.max(peakDeparture, departure);

    const isHeatwaveDay = forecastMax[i] >= 45 || (forecastMax[i] >= 40 && departure >= 4.5);
    const isSevere = forecastMax[i] >= 47 || departure >= 6.5;

    if (isSevere) hasSevereDay = true;

    if (isHeatwaveDay) {
      consecutiveHeatwaveDays += 1;
    } else {
      break;
    }
  }

  const durationScore = [0, 35, 55, 70, 82, 90, 95, 98][
    Math.min(consecutiveHeatwaveDays, 7)
  ];
  const score = clampScore(durationScore + (hasSevereDay ? 8 : 0));

  const peakMax = Math.max(...forecastMax);
  const peakApparent = Math.max(...forecastApparent);

  const series = daily.time.map((date, i) => ({
    date,
    value: Math.round(daily.temperature_2m_max[i] * 10) / 10,
  }));

  const summary = buildSummary(
    peakMax,
    peakApparent,
    peakDeparture,
    consecutiveHeatwaveDays,
    hasSevereDay,
  );

  return { score, severity: scoreToSeverity(score), summary, series };
}

function buildSummary(
  peakMax: number,
  peakApparent: number,
  peakDeparture: number,
  consecutiveDays: number,
  severe: boolean,
): string {
  if (consecutiveDays === 0) {
    return `Forecast peak of ${peakMax.toFixed(1)}°C (feels like ${peakApparent.toFixed(1)}°C), about ${peakDeparture >= 0 ? "+" : ""}${peakDeparture.toFixed(1)}°C vs. the recent normal — no sustained heatwave expected in the next 7 days.`;
  }

  const qualifier = severe ? "severe heatwave" : "heatwave";
  return `${consecutiveDays} consecutive day${consecutiveDays > 1 ? "s" : ""} forecast to meet ${qualifier} criteria, peaking at ${peakMax.toFixed(1)}°C (feels like ${peakApparent.toFixed(1)}°C), +${peakDeparture.toFixed(1)}°C above the recent normal.`;
}
