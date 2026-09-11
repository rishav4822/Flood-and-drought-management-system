import { NextRequest, NextResponse } from "next/server";
import { assessLocation } from "@/lib/risk-engine/assess";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const name = searchParams.get("name") ?? "Selected location";

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
  }

  try {
    const result = await assessLocation(name, lat, lon);
    return NextResponse.json(result);
  } catch (err) {
    console.error("risk assessment failed", err);
    return NextResponse.json(
      { error: "Failed to fetch live climate data. Please try again shortly." },
      { status: 502 },
    );
  }
}
