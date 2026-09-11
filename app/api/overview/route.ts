import { NextResponse } from "next/server";
import { districts } from "@/lib/locations/districts";
import { assessLocation } from "@/lib/risk-engine/assess";
import { mapWithConcurrency } from "@/lib/concurrency";
import { RiskResult } from "@/lib/types";

export const revalidate = 600;

export interface OverviewEntry {
  slug: string;
  state: string;
  result: RiskResult | null;
}

export async function GET() {
  const entries = await mapWithConcurrency(districts, 3, async (district): Promise<OverviewEntry> => {
    try {
      const result = await assessLocation(district.name, district.lat, district.lon);
      return { slug: district.slug, state: district.state, result };
    } catch (err) {
      console.error(`overview: failed to assess ${district.slug}`, err);
      return { slug: district.slug, state: district.state, result: null };
    }
  });

  return NextResponse.json({ entries, generatedAt: new Date().toISOString() });
}
