import { Severity } from "@/lib/types";

export const SEVERITY_ORDER: Severity[] = ["low", "moderate", "high", "severe"];

export const SEVERITY_TREMOR_COLOR: Record<Severity, "emerald" | "amber" | "orange" | "red"> = {
  low: "emerald",
  moderate: "amber",
  high: "orange",
  severe: "red",
};

export const SEVERITY_CSS_VAR: Record<Severity, string> = {
  low: "var(--risk-low)",
  moderate: "var(--risk-moderate)",
  high: "var(--risk-high)",
  severe: "var(--risk-severe)",
};

export const SEVERITY_BADGE_CLASS: Record<Severity, string> = {
  low: "bg-risk-low/15 text-risk-low border-risk-low/30 dark:bg-risk-low/20",
  moderate: "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30 dark:bg-risk-moderate/20",
  high: "bg-risk-high/15 text-risk-high border-risk-high/30 dark:bg-risk-high/20",
  severe: "bg-risk-severe/15 text-risk-severe border-risk-severe/30 dark:bg-risk-severe/20",
};

export function isActionableSeverity(severity: Severity): boolean {
  return severity === "high" || severity === "severe";
}
