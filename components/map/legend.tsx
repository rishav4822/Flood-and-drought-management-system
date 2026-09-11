import { SEVERITY_ORDER, SEVERITY_CSS_VAR } from "@/lib/severity-ui";

const LABEL: Record<string, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe",
};

export function MapLegend() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
      <span className="font-medium text-foreground">Risk:</span>
      {SEVERITY_ORDER.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full border border-white/60"
            style={{ background: SEVERITY_CSS_VAR[s] }}
          />
          {LABEL[s]}
        </span>
      ))}
    </div>
  );
}
