"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OverviewEntry } from "@/app/api/overview/route";

const AUTO_REFRESH_MS = 5 * 60 * 1000;

export function useOverview() {
  const [entries, setEntries] = useState<OverviewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    try {
      const res = await fetch("/api/overview", { cache: "no-store" });
      if (!res.ok) throw new Error(`overview request failed: ${res.status}`);
      const json = (await res.json()) as { entries: OverviewEntry[]; generatedAt: string };
      setEntries(json.entries);
      setGeneratedAt(json.generatedAt);
    } catch {
      setError("Couldn't refresh live data. Showing the last known results.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is the intended behavior
    load();
    const id = setInterval(load, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { entries, loading, error, generatedAt, refresh: load };
}
