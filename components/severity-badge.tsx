import { cn } from "@/lib/utils";
import { Severity } from "@/lib/types";
import { SEVERITY_BADGE_CLASS } from "@/lib/severity-ui";

const LABEL: Record<Severity, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        SEVERITY_BADGE_CLASS[severity],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[severity]}
    </span>
  );
}
