import { XMLParser } from "fast-xml-parser";
import { GdacsAlert } from "@/lib/types";

const FEED_URL = "https://www.gdacs.org/xml/rss.xml";
const REVALIDATE_SECONDS = 600;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

interface RssItem {
  title?: string;
  "gdacs:eventtype"?: string;
  "gdacs:eventname"?: string;
  "gdacs:country"?: string;
  "gdacs:alertlevel"?: string;
  "gdacs:fromdate"?: string;
  "gdacs:todate"?: string;
  "gdacs:population"?: { "#text"?: string | number } | string | number;
  "geo:lat"?: string | number;
  "geo:long"?: string | number;
  link?: string;
}

let cache: { fetchedAt: number; alerts: GdacsAlert[] } | null = null;

export async function fetchActiveAlerts(): Promise<GdacsAlert[]> {
  if (cache && Date.now() - cache.fetchedAt < REVALIDATE_SECONDS * 1000) {
    return cache.alerts;
  }

  const res = await fetch(FEED_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { "User-Agent": "TerraPulse-Hackathon-Demo/1.0" },
  });

  if (!res.ok) {
    throw new Error(`GDACS feed request failed: ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const rawItems: RssItem[] = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  const alerts: GdacsAlert[] = items
    .filter((item) => item && item["gdacs:eventtype"])
    .map((item) => {
      const level = normalizeLevel(item["gdacs:alertlevel"]);
      const pop = item["gdacs:population"];
      const population =
        typeof pop === "object" && pop !== null
          ? Number(pop["#text"] ?? 0)
          : Number(pop ?? 0);

      return {
        eventType: String(item["gdacs:eventtype"] ?? ""),
        eventName: String(item["gdacs:eventname"] ?? item.title ?? "Unnamed event"),
        alertLevel: level,
        country: String(item["gdacs:country"] ?? "Unknown"),
        lat: Number(item["geo:lat"] ?? 0),
        lon: Number(item["geo:long"] ?? 0),
        fromDate: String(item["gdacs:fromdate"] ?? ""),
        toDate: String(item["gdacs:todate"] ?? ""),
        population: Number.isFinite(population) && population > 0 ? population : undefined,
        link: item.link,
      } satisfies GdacsAlert;
    });

  cache = { fetchedAt: Date.now(), alerts };
  return alerts;
}

function normalizeLevel(raw: unknown): GdacsAlert["alertLevel"] {
  const s = String(raw ?? "").toLowerCase();
  if (s.startsWith("red")) return "Red";
  if (s.startsWith("orange")) return "Orange";
  return "Green";
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export async function findNearbyFloodAlert(
  lat: number,
  lon: number,
  radiusKm = 200,
): Promise<GdacsAlert | null> {
  const alerts = await fetchActiveAlerts();
  const floodAlerts = alerts.filter((a) => a.eventType === "FL");
  let closest: { alert: GdacsAlert; distance: number } | null = null;

  for (const alert of floodAlerts) {
    const distance = haversineKm(lat, lon, alert.lat, alert.lon);
    if (distance <= radiusKm && (!closest || distance < closest.distance)) {
      closest = { alert, distance };
    }
  }

  return closest?.alert ?? null;
}
