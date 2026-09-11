"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, RefreshCw } from "lucide-react";
import { useOverview } from "@/lib/hooks/use-overview";
import { SeverityBadge } from "@/components/severity-badge";
import { HazardIcon, HAZARD_LABEL, Hazard } from "@/components/hazard-icon";
import { AlertBanner } from "@/components/alerts/alert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { isActionableSeverity } from "@/lib/severity-ui";
import { cn } from "@/lib/utils";
import { Severity } from "@/lib/types";

const HAZARDS: Hazard[] = ["flood", "drought", "heat"];

export default function AlertsPage() {
  const { entries, loading, generatedAt, refresh } = useOverview();
  const router = useRouter();
  const [filter, setFilter] = useState<Hazard | "all">("all");

  const activeAlerts = useMemo(() => {
    const rows: Array<{ slug: string; state: string; hazard: Hazard; score: number; severity: Severity; name: string; summary: string }> = [];
    for (const e of entries) {
      if (!e.result) continue;
      for (const hazard of HAZARDS) {
        const sub = e.result[hazard];
        if (isActionableSeverity(sub.severity)) {
          rows.push({
            slug: e.slug,
            state: e.state,
            hazard,
            score: sub.score,
            severity: sub.severity,
            name: e.result.location.name,
            summary: sub.summary,
          });
        }
      }
    }
    return rows
      .filter((r) => filter === "all" || r.hazard === filter)
      .sort((a, b) => b.score - a.score);
  }, [entries, filter]);

  const floodGdacsAlerts = useMemo(() => {
    const seen = new Set<string>();
    const alerts = [];
    for (const e of entries) {
      const alert = e.result?.flood.activeAlert;
      if (alert && !seen.has(alert.eventName)) {
        seen.add(alert.eventName);
        alerts.push(alert);
      }
    }
    return alerts;
  }, [entries]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BellRing className="h-5 w-5" /> Active Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Districts currently at high or severe risk, aggregated across drought, flood and heatwave signals.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {generatedAt ? <span>Updated {new Date(generatedAt).toLocaleTimeString()}</span> : null}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {floodGdacsAlerts.map((alert, i) => (
        <AlertBanner key={i} alert={alert} />
      ))}

      <div className="flex gap-2">
        {(["all", ...HAZARDS] as const).map((h) => (
          <button
            key={h}
            onClick={() => setFilter(h)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              filter === h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {h === "all" ? "All hazards" : HAZARD_LABEL[h]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {loading && activeAlerts.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : null}

        {!loading && activeAlerts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No high or severe alerts right now for the monitored districts. Check back later, or search a
            specific place from the dashboard.
          </div>
        ) : null}

        {activeAlerts.map((a, i) => (
          <button
            key={`${a.slug}-${a.hazard}-${i}`}
            onClick={() => router.push(`/location?slug=${a.slug}`)}
            className="flex items-center justify-between gap-3 rounded-xl border p-4 text-left hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-3 min-w-0">
              <HazardIcon hazard={a.hazard} className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  {a.name} <span className="text-xs font-normal text-muted-foreground">· {a.state}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{a.summary}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-muted-foreground">{HAZARD_LABEL[a.hazard]}</span>
              <SeverityBadge severity={a.severity} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
