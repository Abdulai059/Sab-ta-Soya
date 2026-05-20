"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/* ─── Leaflet icon fix ───────────*/
// Must run once at module level — Leaflet's default icons break under webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Icon colour helper ────────── */
// Green = no incidents, amber = 1–2, red = 3+
export const getIncidentColor = (count) =>
  count === 0 ? "#00cc66" : count <= 2 ? "#ffaa00" : "#ff4444";

/* ─── SVG icon factories ──────── */

export function infraIcon(location) {
  const ringColor = getIncidentColor(location.incidents);
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
    html: `
      <svg width="36" height="44" viewBox="0 0 36 44">
        <ellipse cx="18" cy="42" rx="7" ry="2" fill="rgba(0,0,0,0.15)" />
        <path d="M18 2C10.3 2 4 8.3 4 16c0 10 14 28 14 28s14-18 14-28C32 8.3 25.7 2 18 2Z"
          fill="${location.color}" opacity="0.95"/>
        <circle cx="18" cy="16" r="7"
          fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
        <text x="18" y="20.5" text-anchor="middle"
          font-family="monospace" font-size="9" font-weight="bold" fill="white">
          ${location.incidents}
        </text>
        <circle cx="18" cy="16" r="13"
          fill="none" stroke="${ringColor}" stroke-width="1" opacity="0.6"/>
      </svg>`,
  });
}

export function communityIcon(name) {
  const initials = name.slice(0, 2).toUpperCase();
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
    html: `
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="15" fill="#8b5cf6" opacity="0.15"/>
        <circle cx="17" cy="17" r="10" fill="#8b5cf6" opacity="0.9"/>
        <text x="17" y="21" text-anchor="middle"
          font-family="monospace" font-size="8" font-weight="bold" fill="white">
          ${initials}
        </text>
      </svg>`,
  });
}

export function workerIcon(worker) {
  const color = worker.isMoving ? "#10b981" : "#6b7280";
  // Pulse ring only renders when worker is actively moving
  const pulse = worker.isMoving
    ? `<circle cx="17" cy="17" r="14" fill="${color}" opacity="0.15">
        <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
    html: `
      <svg width="34" height="34" viewBox="0 0 34 34">
        ${pulse}
        <circle cx="17" cy="17" r="10" fill="${color}" opacity="0.95" stroke="white" stroke-width="2"/>
        <circle cx="17" cy="17" r="4" fill="white"/>
      </svg>`,
  });
}

/* ─── Map utility components ──── */

// Smoothly flies the camera to a new location when activeLocation changes
export function FlyTo({ coords, zoom = 14 }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!coords) return;
    const key = coords.join(",");
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo(coords, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [coords, zoom, map]);
  return null;
}

// Pans the map to follow the user's live GPS position during tracking
export function PanToLive({ coords }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!coords) return;
    const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
    if (prev.current === key) return;
    prev.current = key;
    map.panTo(coords, { animate: true, duration: 0.8 });
  }, [coords, map]);
  return null;
}

export function ZoomBottomLeft() {
  const map = useMap();
  useEffect(() => {
    map.zoomControl.setPosition("bottomleft");
  }, [map]);
  return null;
}

// Leaflet reads window/document directly so it must only render on the client
export function useMapMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
