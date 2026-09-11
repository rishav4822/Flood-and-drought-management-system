"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Droplets, RefreshCw, Sprout, ThermometerSun } from "lucide-react";
import { findDistrict } from "@/lib/locations/districts";
import { RiskResult, Severity } from "@/lib/types";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { SeverityBadge } from "@/components/severity-badge";
import { AlertBanner } from "@/components/alerts/alert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_CSS_VAR, SEVERITY_TREMOR_COLOR } from "@/lib/severity-ui";

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-64 w-full" /></div>}>
      <LocationContent />
    </Suspense>
  );
}

function LocationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug");
  const seeded = slug ? findDistrict(slug) : undefined;

  const lat = seeded?.lat ?? Number(params.get("lat"));
  const lon = seeded?.lon ?? Number(params.get("lon"));
  const name = seeded?.name ?? params.get("name") ?? "Selected location";

  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/param-change is the intended behavior
    setLoading(true);
    setError(null);

    fetch(`/api/risk?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setResult(json);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load live climate data for this location. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, name]);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        No location selected. Go back to the dashboard and pick one from the map or search bar.
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <button
        onClick={() => router.push("/")}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          {seeded ? <p className="text-sm text-muted-foreground">{seeded.state}, India</p> : null}
        </div>
        {result ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Updated {new Date(result.updatedAt).toLocaleTimeString()}
            </span>
            <SeverityBadge severity={result.combined.severity} />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-risk-high/40 bg-risk-high/10 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-risk-high" /> {error}
        </div>
      ) : null}

      {loading && !result ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : null}

      {result ? (
        <>
          {result.flood.activeAlert ? <AlertBanner alert={result.flood.activeAlert} /> : null}

          <div>
            <RiskScoreCard
              title="Combined Climate Risk Index"
              score={result.combined.score}
              severity={result.combined.severity}
              summary={`Driven primarily by ${result.combined.drivingHazard} risk. Weighted fusion of flood, drought and heat signals for this location.`}
              emphasis
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <RiskScoreCard
              title="Flood"
              icon={Droplets}
              score={result.flood.score}
              severity={result.flood.severity}
              summary={result.flood.summary}
            />
            <RiskScoreCard
              title="Drought"
              icon={Sprout}
              score={result.drought.score}
              severity={result.drought.severity}
              summary={result.drought.summary}
            />
            <RiskScoreCard
              title="Heatwave"
              icon={ThermometerSun}
              score={result.heat.score}
              severity={result.heat.severity}
              summary={result.heat.summary}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TrendCard title="River discharge (m³/s), 7d past + forecast" severity={result.flood.severity}>
              <TrendChart series={result.flood.series} valueLabel="Discharge" color={SEVERITY_TREMOR_COLOR[result.flood.severity]} />
            </TrendCard>
            <TrendCard title="90-day rolling rainfall (mm)" severity={result.drought.severity}>
              <TrendChart series={result.drought.series} valueLabel="Rainfall" color={SEVERITY_TREMOR_COLOR[result.drought.severity]} />
            </TrendCard>
            <TrendCard title="Max temperature (°C), 7d past + forecast" severity={result.heat.severity}>
              <TrendChart series={result.heat.series} valueLabel="Max temp" color={SEVERITY_TREMOR_COLOR[result.heat.severity]} />
            </TrendCard>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-end">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
    </div>
  );
}

function TrendCard({
  title,
  severity,
  children,
}: {
  title: string;
  severity: Severity;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-l-4 border p-4" style={{ borderLeftColor: SEVERITY_CSS_VAR[severity] }}>
      <h3 className="mb-2 text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
