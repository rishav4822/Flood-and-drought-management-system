"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { Severity } from "@/lib/types";
import { SEVERITY_CSS_VAR } from "@/lib/severity-ui";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapPoint {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  severity: Severity;
  score: number;
}

export function RiskMap({
  points,
  onSelect,
  center = [22.5, 81],
  zoom = 4.4,
}: {
  points: MapPoint[];
  onSelect: (slug: string) => void;
  center?: [number, number];
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomSnap: 0.25,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: "abc",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const point of points) {
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 8,
        weight: 2,
        color: "#fff",
        fillColor: SEVERITY_CSS_VAR[point.severity],
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:inherit;min-width:140px">
             <div style="font-weight:600;font-size:13px">${escapeHtml(point.name)}</div>
             <div style="font-size:11px;color:#666;margin-bottom:4px">${escapeHtml(point.state)}</div>
             <div style="font-size:12px">Risk score: <b>${point.score}</b> · ${point.severity}</div>
           </div>`,
        )
        .on("click", () => onSelect(point.slug));

      markersRef.current.push(marker);
    }
  }, [points, onSelect]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
