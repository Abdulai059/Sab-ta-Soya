"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* FIX LEAFLET ICONS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* SEVERITY COLOR */
const severityCount = (count) => {
  if (count === 0) return { ring: "#00cc66" };
  if (count === 1) return { ring: "#ffaa00" };
  return { ring: "#ff4444" };
};

/* CUSTOM MARKER */
function createCustomIcon(location) {
  const { ring } = severityCount(location.incidents);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="7" ry="2" fill="rgba(0,0,0,0.15)"/>
      <path d="M18 2 C10.3 2 4 8.3 4 16 C4 26 18 40 18 40 C18 40 32 26 32 16 C32 8.3 25.7 2 18 2Z"
        fill="${location.color}" opacity="0.95"/>
      <circle cx="18" cy="16" r="7" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <text x="18" y="20.5" text-anchor="middle" font-family="monospace" font-size="9" font-weight="bold" fill="white">
        ${location.incidents}
      </text>
      <circle cx="18" cy="16" r="13" fill="none" stroke="${ring}" stroke-width="1" opacity="0.6"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

/* FLY ANIMATION */
function FlyToLocation({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [coords, map]);

  return null;
}

export default function MapView({
  locations,
  activeLocation,
  onSelectLocation,
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 font-mono text-xs tracking-widest text-emerald-600 animate-pulse">
        LOADING MAP...
      </div>
    );
  }

  return (
    /* 🔥 IMPORTANT FIX: isolation prevents z-index leaking */
    <div className="flex-1 relative overflow-hidden isolate z-0">
      {/* ACTIVE ZONE BADGE */}
      <div className="absolute top-3 left-3 z-[500] bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg px-3 py-2 shadow-sm pointer-events-none">
        <div className="font-mono text-[9px] tracking-[0.2em] text-stone-400 uppercase">
          Active Zone
        </div>

        <div
          className="text-xs font-bold"
          style={{ color: activeLocation.color }}
        >
          {activeLocation.name}
        </div>
      </div>

      {/* COORDS */}
      <div className="absolute bottom-3 right-3 z-[500] font-mono text-[9px] text-stone-400 bg-white/80 backdrop-blur-sm border border-stone-200 rounded px-2 py-1 pointer-events-none">
        {activeLocation.coords[0].toFixed(3)}°N ·{" "}
        {Math.abs(activeLocation.coords[1]).toFixed(3)}°W
      </div>

      {/* MAP */}
      <MapContainer
        center={[5.558, -0.197]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <FlyToLocation coords={activeLocation.coords} />

        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coords}
            icon={createCustomIcon(loc)}
            eventHandlers={{
              click: () => onSelectLocation(loc),
            }}
          >
            <Popup offset={[0, -40]}>
              <div className="bg-white border border-stone-200 rounded-lg p-3 min-w-[140px] shadow-md">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: loc.color }}
                >
                  {loc.name}
                </div>

                <div className="font-mono text-[10px] text-stone-400">
                  /{loc.slug}
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 font-mono text-[10px]">
                  <span className="text-stone-400">Incidents: </span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        loc.incidents === 0
                          ? "#00cc66"
                          : loc.incidents === 1
                            ? "#ffaa00"
                            : "#ff4444",
                    }}
                  >
                    {loc.incidents}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* GLOBAL LEAFLET FIX */}
      <style jsx global>{`
        .leaflet-container {
          z-index: 0 !important;
        }

        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control {
          z-index: 0 !important;
        }

        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
