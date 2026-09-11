import { Droplets, Satellite, Sprout, ThermometerSun } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          TerraPulse fuses three independent open climate data feeds into one Climate Risk Index per
          location, because in a growing number of Indian districts the dominant hazard now swaps between
          drought and flood within the same year — a single-hazard dashboard misses that.
        </p>
      </div>

      <Section
        icon={Droplets}
        title="Flood"
        body={
          <>
            Daily river discharge (m³/s) comes from the{" "}
            <ExtLink href="https://open-meteo.com/en/docs/flood-api">Open-Meteo Flood API</ExtLink>, backed by
            the Copernicus GloFAS v4 global hydrological model. We compare the forecast peak discharge for the
            next 7 days against the seasonal distribution of discharge at that point over the last 3 years (±15
            days of the same time of year) to get a percentile-based risk score. If{" "}
            <ExtLink href="https://www.gdacs.org/">GDACS</ExtLink> (the UN/EU Global Disaster Alert and
            Coordination System) has an active flood alert within 200&nbsp;km, the score is floored to match
            that alert&rsquo;s severity (Green/Orange/Red).
          </>
        }
      />

      <Section
        icon={Sprout}
        title="Drought"
        body={
          <>
            Precipitation and root-zone soil moisture come from{" "}
            <ExtLink href="https://power.larc.nasa.gov/">NASA POWER</ExtLink>, a satellite- and reanalysis-based
            dataset. We take the trailing 90-day rainfall total and recent soil moisture, and rank each against
            the same 90-day-of-year window from the previous 3 years. Drought risk score is a weighted blend of
            the rainfall deficit percentile (55%) and soil moisture deficit percentile (45%).
          </>
        }
      />

      <Section
        icon={ThermometerSun}
        title="Heatwave"
        body={
          <>
            Forecast daily max and &ldquo;feels like&rdquo; temperatures come from the{" "}
            <ExtLink href="https://open-meteo.com/en/docs">Open-Meteo Forecast API</ExtLink>. We apply a
            simplified version of the India Meteorological Department&rsquo;s heatwave definition: a day qualifies if
            max temperature ≥ 40°C and is at least 4.5°C above the recent local normal (or ≥ 45°C outright);
            &ldquo;severe&rdquo; if the departure is ≥ 6.5°C or max temp ≥ 47°C. The score scales with how many consecutive
            forecast days qualify.
          </>
        }
      />

      <Section
        icon={Satellite}
        title="Combined Climate Risk Index"
        body={
          <>
            The combined score is a weighted average — flood 40%, drought 30%, heat 30% — reflecting flood&rsquo;s
            typically faster onset and more acute short-term danger. The &ldquo;driving hazard&rdquo; shown is whichever
            sub-score is highest, which is what lets the same district visibly flip from a drought-driven score
            one month to a flood-driven score the next.
          </>
        }
      />

      <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">Why this matters</p>
        <p>
          Recent district-level assessments (CEEW; DST India climate risk mapping) found roughly three-quarters
          of Indian districts are hotspots for at least one extreme hydro-climatic hazard, and nearly 40% show a
          &ldquo;hazard swap&rdquo; — flood-prone areas turning drought-prone or vice versa. Single-hazard tools
          can&rsquo;t surface that shift; TerraPulse is built to.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        All data sources are free for non-commercial use and require no API key. This is a hackathon
        prototype — thresholds are simplified approximations of real meteorological definitions, not
        official forecasts. For life-safety decisions, always follow official IMD/NDMA/state disaster
        management guidance.
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
      {children}
    </a>
  );
}
