"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AlertTriangle, Droplets, MapPinned, RefreshCw, Sprout, ThermometerSun } from "lucide-react";
import { useOverview } from "@/lib/hooks/use-overview";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { MapPoint } from "@/components/map/risk-map";
import { MapLegend } from "@/components/map/legend";
import { SeverityBadge } from "@/components/severity-badge";
import { HazardIcon } from "@/components/hazard-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { isActionableSeverity } from "@/lib/severity-ui";

const RiskMap = dynamic(() => import("@/components/map/risk-map").then((m) => m.RiskMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function DashboardPage() {
  const { entries, loading, error, generatedAt, refresh } = useOverview();
  const router = useRouter();

  const points: MapPoint[] = useMemo(
    () =>
      entries
        .filter((e) => e.result)
        .map((e) => ({
          slug: e.slug,
          name: e.result!.location.name,
          state: e.state,
          lat: e.result!.location.lat,
          lon: e.result!.location.lon,
          severity: e.result!.combined.severity,
          score: e.result!.combined.score,
        })),
    [entries],
  );

  const counts = useMemo(() => {
    let flood = 0;
    let drought = 0;
    let heat = 0;
    for (const e of entries) {
      if (!e.result) continue;
      if (isActionableSeverity(e.result.flood.severity)) flood++;
      if (isActionableSeverity(e.result.drought.severity)) drought++;
      if (isActionableSeverity(e.result.heat.severity)) heat++;
    }
    return { flood, drought, heat };
  }, [entries]);

  const ranked = useMemo(
    () =>
      [...entries]
        .filter((e) => e.result)
        .sort((a, b) => b.result!.combined.score - a.result!.combined.score),
    [entries],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Climate Risk Dashboard</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          One fused Climate Risk Index per district, built live from satellite and weather data — because the
          same district often swaps between drought and flood risk within a single season.
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {generatedAt ? <span>Updated {new Date(generatedAt).toLocaleTimeString()}</span> : null}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          {error ? (
            <span className="inline-flex items-center gap-1 text-risk-high">
              <AlertTriangle className="h-3 w-3" /> {error}
            </span>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Districts monitored" value={entries.length || "—"} icon={MapPinned} />
        <KpiCard
          label="High+ flood risk"
          value={counts.flood}
          tone={counts.flood > 0 ? "warning" : "default"}
          icon={Droplets}
        />
        <KpiCard
          label="High+ drought risk"
          value={counts.drought}
          tone={counts.drought > 0 ? "warning" : "default"}
          icon={Sprout}
        />
        <KpiCard
          label="High+ heat risk"
          value={counts.heat}
          tone={counts.heat > 0 ? "warning" : "default"}
          icon={ThermometerSun}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="relative h-[480px] overflow-hidden rounded-xl border lg:col-span-3">
          {loading && points.length === 0 ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <RiskMap points={points} onSelect={(slug) => router.push(`/location?slug=${slug}`)} />
          )}
          <div className="pointer-events-none absolute bottom-3 left-3">
            <MapLegend />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border p-3 lg:col-span-2">
          <h2 className="px-1 text-sm font-medium text-muted-foreground">Highest combined risk</h2>
          <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 440 }}>
            {loading && ranked.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : ranked.map((e) => (
                  <button
                    key={e.slug}
                    onClick={() => router.push(`/location?slug=${e.slug}`)}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{e.result!.location.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{e.state}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <HazardIcon
                        hazard={e.result!.combined.drivingHazard}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                      <SeverityBadge severity={e.result!.combined.severity} />
                    </div>
                  </button>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
