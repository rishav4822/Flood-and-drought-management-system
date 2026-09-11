import { Droplets, Sprout, ThermometerSun, type LucideIcon } from "lucide-react";

export type Hazard = "drought" | "flood" | "heat";

const ICONS: Record<Hazard, LucideIcon> = {
  drought: Sprout,
  flood: Droplets,
  heat: ThermometerSun,
};

export const HAZARD_LABEL: Record<Hazard, string> = {
  drought: "Drought",
  flood: "Flood",
  heat: "Heatwave",
};

export function HazardIcon({ hazard, className }: { hazard: Hazard; className?: string }) {
  const Icon = ICONS[hazard];
  return <Icon className={className} />;
}
