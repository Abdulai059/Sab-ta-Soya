"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LayerControls from "./LayerControls";

/* ── Leaflet icon fix ──────────────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ── Icon factories ────────────────────────────────────────────────────────── */

// Infrastructure marker — pin shape, color-coded by incident count
function infraIcon(location) {
  const ring = location.incidents === 0 ? "#00cc66"
             : location.incidents <= 2  ? "#ffaa00"
             : "#ff4444";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="7" ry="2" fill="rgba(0,0,0,0.15)"/>
      <path d="M18 2C10.3 2 4 8.3 4 16c0 10 14 28 14 28s14-18 14-28C32 8.3 25.7 2 18 2Z"
        fill="${location.color}" opacity="0.95"/>
      <circle cx="18" cy="16" r="7" fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <text x="18" y="20.5" text-anchor="middle" font-family="monospace"
        font-size="9" font-weight="bold" fill="white">${location.incidents}</text>
      <circle cx="18" cy="16" r="13" fill="none" stroke="${ring}"
        stroke-width="1" opacity="0.6"/>
    </svg>`;

  return L.divIcon({ html: svg, className: "", iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] });
}

// Community marker — hexagon-style
function communityIcon(name) {
  const initials = name.slice(0, 2).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="15" fill="#8b5cf6" opacity="0.15"
        stroke="#8b5cf6" stroke-width="1.5"/>
      <circle cx="17" cy="17" r="10" fill="#8b5cf6" opacity="0.9"/>
      <text x="17" y="21" text-anchor="middle" font-family="monospace"
        font-size="8" font-weight="bold" fill="white">${initials}</text>
    </svg>`;

  return L.divIcon({ html: svg, className: "", iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -20] });
}

// Field worker marker — pulsing dot, green when moving
function workerIcon(worker) {
  const color = worker.isMoving ? "#10b981" : "#6b7280";
  const pulse = worker.isMoving
    ? `<circle cx="17" cy="17" r="14" fill="${color}" opacity="0.15">
         <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
         <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      ${pulse}
      <circle cx="17" cy="17" r="10" fill="${color}" opacity="0.95"
        stroke="white" stroke-width="2"/>
      <circle cx="17" cy="17" r="4" fill="white" opacity="0.9"/>
    </svg>`;

  return L.divIcon({ html: svg, className: "", iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -20] });
}

/* ── Fly-to helper ─────────────────────────────────────────────────────────── */
function FlyTo({ coords, zoom = 14 }) {
  const map = useMap();
  const prev = useRef(null);

  useEffect(() => {
    if (!coords) return;
    const key = coords.join(",");
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(coords, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [coords, zoom, map]);

  return null;
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function MapView({
  // infrastructure (locations table)
  locations = [],
  activeLocation,
  onSelectLocation,
  // communities
  communities = [],
  // field workers (user_locations)
  fieldWorkers = [],
  onSelectWorker,
  // geofences
  geofences = [],
  // layer visibility
  activeLayers,
  onToggleLayer,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 font-mono text-xs tracking-widest text-emerald-600 animate-pulse">
        LOADING MAP...
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden isolate z-0">

      {/* Active zone badge */}
      {activeLocation && (
        <div className="absolute top-3 left-3 z-[500] bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg px-3 py-2 shadow-sm pointer-events-none">
          <div className="font-mono text-[9px] tracking-[0.2em] text-stone-400 uppercase">
            Active Zone
          </div>
          <div className="text-xs font-bold" style={{ color: activeLocation.color }}>
            {activeLocation.name}
          </div>
        </div>
      )}

      {/* Coordinates */}
      {activeLocation && (
        <div className="absolute bottom-3 right-3 z-[500] font-mono text-[9px] text-stone-400 bg-white/80 backdrop-blur-sm border border-stone-200 rounded px-2 py-1 pointer-events-none">
          {activeLocation.coords[0].toFixed(3)}°N ·{" "}
          {Math.abs(activeLocation.coords[1]).toFixed(3)}°W
        </div>
      )}

      {/* Layer controls */}
      <LayerControls
        activeLayers={activeLayers}
        onToggle={onToggleLayer}
        fieldWorkerCount={fieldWorkers.length}
      />

      {/* Map */}
      <MapContainer
        center={[7.9465, -1.0232]}
        zoom={7}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {activeLocation && <FlyTo coords={activeLocation.coords} />}

        {/* ── Infrastructure layer ── */}
        {activeLayers.infrastructure &&
          locations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={infraIcon(loc)}
              eventHandlers={{ click: () => onSelectLocation(loc) }}
            >
              <Popup offset={[0, -40]}>
                <div className="bg-white border border-stone-200 rounded-lg p-3 min-w-[150px] shadow-md">
                  <div className="text-xs font-bold mb-0.5" style={{ color: loc.color }}>
                    {loc.name}
                  </div>
                  <div className="font-mono text-[10px] text-stone-400 mb-2">
                    {loc.type} · {loc.status}
                  </div>
                  <div className="font-mono text-[10px] border-t border-stone-100 pt-1.5">
                    <span className="text-stone-400">Incidents: </span>
                    <span className="font-bold" style={{
                      color: loc.incidents === 0 ? "#00cc66" : loc.incidents <= 2 ? "#ffaa00" : "#ff4444"
                    }}>
                      {loc.incidents}
                    </span>
                  </div>
                  {loc.district && (
                    <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                      {loc.district}, {loc.region}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ── Communities layer ── */}
        {activeLayers.communities &&
          communities.map((c) => (
            <Marker
              key={c.id}
              position={c.coords}
              icon={communityIcon(c.name)}
            >
              <Popup>
                <div className="bg-white border border-stone-200 rounded-lg p-3 min-w-[150px] shadow-md">
                  <div className="text-xs font-bold text-purple-700 mb-0.5">{c.name}</div>
                  <div className="font-mono text-[10px] text-stone-400 mb-2">
                    {c.district} · {c.region}
                  </div>
                  {c.floodRisk && (
                    <div className="font-mono text-[10px]">
                      <span className="text-stone-400">Flood risk: </span>
                      <span className="font-bold text-blue-600">{c.floodRisk}</span>
                    </div>
                  )}
                  {c.droughtRisk && (
                    <div className="font-mono text-[10px]">
                      <span className="text-stone-400">Drought risk: </span>
                      <span className="font-bold text-amber-600">{c.droughtRisk}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ── Field workers layer ── */}
        {activeLayers.fieldWorkers &&
          fieldWorkers.map((worker) => (
            <Marker
              key={worker.id}
              position={worker.coords}
              icon={workerIcon(worker)}
              eventHandlers={{ click: () => onSelectWorker?.(worker) }}
            >
              <Popup>
                <div className="bg-white border border-stone-200 rounded-lg p-3 min-w-[150px] shadow-md">
                  <div className="text-xs font-bold text-stone-800 mb-0.5">{worker.name}</div>
                  <div className="font-mono text-[10px] text-stone-400 mb-2 capitalize">
                    {worker.role?.replace("_", " ")}
                  </div>
                  <div className="font-mono text-[10px] space-y-0.5">
                    <div>
                      <span className="text-stone-400">Status: </span>
                      <span className={`font-bold ${worker.isMoving ? "text-emerald-600" : "text-stone-500"}`}>
                        {worker.isMoving ? "Moving" : "Stationary"}
                      </span>
                    </div>
                    {worker.speed > 0.5 && (
                      <div>
                        <span className="text-stone-400">Speed: </span>
                        <span className="font-bold">{(worker.speed * 3.6).toFixed(1)} km/h</span>
                      </div>
                    )}
                    <div>
                      <span className="text-stone-400">Last seen: </span>
                      <span className="font-bold">{worker.lastSeen}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ── Geofences layer ── */}
        {activeLayers.geofences &&
          geofences.map((g) => (
            <Circle
              key={g.id}
              center={g.center}
              radius={g.radius}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup>
                <div className="bg-white border border-stone-200 rounded-lg p-3 min-w-[150px] shadow-md">
                  <div className="text-xs font-bold text-amber-700 mb-0.5">{g.name}</div>
                  {g.description && (
                    <div className="font-mono text-[10px] text-stone-400 mb-1">{g.description}</div>
                  )}
                  <div className="font-mono text-[10px] text-stone-400">
                    Radius: {g.radius >= 1000 ? `${(g.radius / 1000).toFixed(1)} km` : `${g.radius} m`}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>

      {/* Leaflet z-index fix */}
      <style jsx global>{`
        .leaflet-container { z-index: 0 !important; }
        .leaflet-pane, .leaflet-top, .leaflet-bottom, .leaflet-control { z-index: 0 !important; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
}
