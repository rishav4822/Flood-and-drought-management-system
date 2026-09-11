"use client";

import { AreaChart } from "@tremor/react";
import { SeriesPoint } from "@/lib/types";

export function TrendChart({
  series,
  valueLabel,
  color = "cyan",
}: {
  series: SeriesPoint[];
  valueLabel: string;
  color?: string;
}) {
  const data = series.map((p) => ({
    date: formatShort(p.date),
    [valueLabel]: p.value,
  }));

  return (
    <AreaChart
      className="h-56"
      data={data}
      index="date"
      categories={[valueLabel]}
      colors={[color]}
      showLegend={false}
      showAnimation
      curveType="monotone"
      yAxisWidth={72}
      valueFormatter={(v: number) => formatCompact(v)}
    />
  );
}

function formatCompact(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

function formatShort(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}
