import { ProgressCircle } from "@tremor/react";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/severity-badge";
import { Severity } from "@/lib/types";
import { SEVERITY_TREMOR_COLOR } from "@/lib/severity-ui";
import { LucideIcon } from "lucide-react";

export function RiskScoreCard({
  title,
  icon: Icon,
  score,
  severity,
  summary,
  emphasis = false,
}: {
  title: string;
  icon?: LucideIcon;
  score: number;
  severity: Severity;
  summary: string;
  emphasis?: boolean;
}) {
  return (
    <Card className={emphasis ? "border-primary/40 shadow-md" : undefined}>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
            {title}
          </div>
          <SeverityBadge severity={severity} />
        </div>
        <div className="flex items-center gap-4">
          <ProgressCircle value={score} color={SEVERITY_TREMOR_COLOR[severity]} size="md">
            <span className="text-lg font-semibold">{score}</span>
          </ProgressCircle>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      </div>
    </Card>
  );
}
