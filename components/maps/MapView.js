"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LayerControls from "./LayerControls";

/* ─────────────────────────────────────────────
   Leaflet Default Icon Fix
───────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─────────────────────────────────────────────
   Icon Helpers
───────────────────────────────────────────── */

const getIncidentColor = (count) =>
  count === 0 ? "#00cc66" : count <= 2 ? "#ffaa00" : "#ff4444";

function infraIcon(location) {
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
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(255,255,255,0.6)"
          stroke-width="1.5"/>

        <text x="18" y="20.5"
          text-anchor="middle"
          font-family="monospace"
          font-size="9"
          font-weight="bold"
          fill="white">
          ${location.incidents}
        </text>

        <circle cx="18" cy="16" r="13"
          fill="none"
          stroke="${ringColor}"
          stroke-width="1"
          opacity="0.6"/>
      </svg>
    `,
  });
}

function communityIcon(name) {
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
        <text x="17" y="21"
          text-anchor="middle"
          font-family="monospace"
          font-size="8"
          font-weight="bold"
          fill="white">
          ${initials}
        </text>
      </svg>
    `,
  });
}

function workerIcon(worker) {
  const color = worker.isMoving ? "#10b981" : "#6b7280";

  const pulse = worker.isMoving
    ? `
      <circle cx="17" cy="17" r="14" fill="${color}" opacity="0.15">
        <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
    `
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
      </svg>
    `,
  });
}

/* ─────────────────────────────────────────────
   Map Utilities
───────────────────────────────────────────── */

function FlyTo({ coords, zoom = 14 }) {
  const map = useMap();
  const prev = useRef(null);

  useEffect(() => {
    if (!coords) return;

    const key = coords.join(",");
    if (prev.current === key) return;

    prev.current = key;
    map.flyTo(coords, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [coords, zoom, map]);

  return null;
}

function PanToLive({ coords }) {
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

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */

export default function MapView({
  locations = [],
  activeLocation,
  onSelectLocation,
  communities = [],
  fieldWorkers = [],
  onSelectWorker,
  geofences = [],
  activeLayers,
  onToggleLayer,
  userRoute = [],
  currentPosition,
  isTracking,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 font-mono text-xs text-emerald-600 animate-pulse">
        LOADING MAP...
      </div>
    );
  }

  const liveCoords = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : null;

  return (
    <div className="flex-1 relative overflow-hidden z-0">
      {/* Active Location Badge */}
      {activeLocation && (
        <div className="absolute top-2 left-2 z-500 bg-brand-soft text-gray-900 px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-xs">
          <div className="uppercase text-[9px] text-stone-500">Active Zone</div>
          <div className="font-bold text-sm mt-1 text-stone-800">
            {activeLocation.name}
          </div>
        </div>
      )}

      {/* Coordinates */}
      {activeLocation && (
        <div className="absolute bottom-2 right-2 z-[500] font-mono text-[9px] text-stone-400 bg-white/90 px-2 py-1 rounded">
          {activeLocation.coords[0].toFixed(3)}°N ·{" "}
          {Math.abs(activeLocation.coords[1]).toFixed(3)}°W
        </div>
      )}

      {/* Layer Controls */}
      <LayerControls
        activeLayers={activeLayers}
        onToggle={onToggleLayer}
        fieldWorkerCount={fieldWorkers.length}
      />

      {/* Map */}
      <MapContainer
        center={[7.9465, -1.0232]}
        zoom={7}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {activeLocation && <FlyTo coords={activeLocation.coords} />}
        {isTracking && liveCoords && <PanToLive coords={liveCoords} />}

        {/* ── Infrastructure ── */}
        {activeLayers.infrastructure &&
          locations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={infraIcon(loc)}
              eventHandlers={{ click: () => onSelectLocation(loc) }}
            >
              <Popup>{/* keep your popup unchanged */}</Popup>
            </Marker>
          ))}

        {/* ── Communities ── */}
        {activeLayers.communities &&
          communities.map((c) => (
            <Marker key={c.id} position={c.coords} icon={communityIcon(c.name)}>
              <Popup>{/* unchanged */}</Popup>
            </Marker>
          ))}

        {/* ── Field Workers ── */}
        {activeLayers.fieldWorkers &&
          fieldWorkers.map((w) => (
            <Marker
              key={w.id}
              position={w.coords}
              icon={workerIcon(w)}
              eventHandlers={{ click: () => onSelectWorker?.(w) }}
            >
              <Popup>{/* unchanged */}</Popup>
            </Marker>
          ))}

        {/* ── Route ── */}
        {userRoute.length > 1 && (
          <>
            <Polyline
              positions={userRoute}
              pathOptions={{ color: "#4285F4", weight: 14, opacity: 0.12 }}
            />
            <Polyline
              positions={userRoute}
              pathOptions={{ color: "#fff", weight: 8, opacity: 0.5 }}
            />
            <Polyline
              positions={userRoute}
              pathOptions={{ color: "#4285F4", weight: 5, opacity: 0.85 }}
            />

            <Circle
              center={userRoute[0]}
              radius={6}
              pathOptions={{
                color: "#fff",
                fillColor: "#34A853",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          </>
        )}

        {/* ── Geofences ── */}
        {activeLayers.geofences &&
          geofences.map((g) => (
            <Circle
              key={g.id}
              center={g.center}
              radius={g.radius}
              pathOptions={{
                color: "#f59e0b",
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup>{/* unchanged */}</Popup>
            </Circle>
          ))}

        {/* Live Position */}
        {isTracking && liveCoords && (
          <>
            <Circle
              center={liveCoords}
              radius={currentPosition?.accuracy ?? 20}
              pathOptions={{ color: "#4285F4", fillOpacity: 0.1 }}
            />

            <Marker position={liveCoords}>
              <Popup>{/* unchanged */}</Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Global styles */}
      <style jsx global>{`
        .leaflet-container {
          z-index: 0 !important;
        }
      `}</style>
    </div>
  );
}
