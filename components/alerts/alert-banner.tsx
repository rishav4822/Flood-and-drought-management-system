import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GdacsAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_CLASS: Record<GdacsAlert["alertLevel"], string> = {
  Green: "border-risk-low/40 bg-risk-low/10",
  Orange: "border-risk-high/40 bg-risk-high/10",
  Red: "border-risk-severe/40 bg-risk-severe/10",
};

export function AlertBanner({ alert }: { alert: GdacsAlert }) {
  return (
    <Alert className={cn("py-3", LEVEL_CLASS[alert.alertLevel])}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        GDACS {alert.alertLevel} flood alert — {alert.eventName}
      </AlertTitle>
      <AlertDescription>
        <p>
          {alert.country}
          {alert.population ? ` · ~${alert.population.toLocaleString()} people affected` : ""}
          {alert.fromDate ? ` · since ${new Date(alert.fromDate).toLocaleDateString()}` : ""}
        </p>
        {alert.link ? (
          <a href={alert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
            View on GDACS <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
