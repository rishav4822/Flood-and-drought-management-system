import { clampScore, RiskResult, scoreToSeverity } from "@/lib/types";

const WEIGHTS = { flood: 0.4, drought: 0.3, heat: 0.3 } as const;

export function combineScores(
  drought: number,
  flood: number,
  heat: number,
): RiskResult["combined"] {
  const score = clampScore(
    drought * WEIGHTS.drought + flood * WEIGHTS.flood + heat * WEIGHTS.heat,
  );

  const entries: Array<[RiskResult["combined"]["drivingHazard"], number]> = [
    ["drought", drought],
    ["flood", flood],
    ["heat", heat],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const drivingHazard = entries[0][1] > 0 ? entries[0][0] : "flood";

  return { score, severity: scoreToSeverity(score), drivingHazard };
}
