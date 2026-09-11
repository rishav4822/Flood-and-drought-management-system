import { Card, Flex, Metric, Text } from "@tremor/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  helpText,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helpText?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <Card className="!bg-card !border-border !ring-0 !shadow-sm">
      <Flex alignItems="start" justifyContent="between">
        <div>
          <Text className="!text-muted-foreground">{label}</Text>
          <Metric className={cn("!mt-1", tone === "warning" && "!text-risk-high")}>{value}</Metric>
          {helpText ? <Text className="!mt-1 !text-muted-foreground">{helpText}</Text> : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-accent p-2 text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </Flex>
    </Card>
  );
}
