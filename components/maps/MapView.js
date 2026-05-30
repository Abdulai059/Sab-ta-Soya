"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRef, useState, useEffect } from "react";
import LayerControls from "./LayerControls";
import {
  infraIcon,
  communityIcon,
  workerIcon,
  FlyTo,
  PanToLive,
  ZoomBottomLeft,
  useMapMounted,
} from "@/hooks/mapUtils";

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
  hoveredLocation,
  setHoveredLocation,
  pinnedLocation,
  navigationRoute = [],
  navigationDestination,
}) {
  const mounted = useMapMounted();
  const containerRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContainerReady(true);
    }
  }, [mounted]);

  if (!mounted || !containerReady) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-stone-50 font-mono text-xs text-emerald-600 animate-pulse"
      >
        LOADING MAP...
      </div>
    );
  }

  const liveCoords = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : null;

  return (
    <div className="flex-1 relative overflow-hidden z-0">
      {/* Active location badge */}
      {activeLocation && (
        <div className="absolute top-2 left-2 z-[500] bg-brand-soft text-gray-900 px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-xs">
          <div className="uppercase text-[9px] text-stone-500">Active Zone</div>
          <div className="font-bold text-sm mt-1 text-stone-800">
            {activeLocation.name}
          </div>
        </div>
      )}

      {/* Coordinate readout */}
      {activeLocation && (
        <div className="absolute bottom-2 right-2 z-[500] font-mono text-[9px] text-stone-400 bg-white/90 px-2 py-1 rounded">
          {activeLocation.coords[0].toFixed(3)}°N ·{" "}
          {Math.abs(activeLocation.coords[1]).toFixed(3)}°W
        </div>
      )}

      <LayerControls
        activeLayers={activeLayers}
        onToggle={onToggleLayer}
        fieldWorkerCount={fieldWorkers.length}
      />

      <MapContainer
        center={[7.9465, -1.0232]}
        zoom={7}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <ZoomBottomLeft />
        {activeLocation && <FlyTo coords={activeLocation.coords} />}
        {pinnedLocation && <FlyTo coords={pinnedLocation.coords} />}
        {isTracking && liveCoords && <PanToLive coords={liveCoords} />}

        {/* Hover highlight */}
        {hoveredLocation?.coords && (
          <Circle
            center={hoveredLocation.coords}
            radius={50}
            pathOptions={{ color: "#f59e0b", fillOpacity: 0.2, weight: 2 }}
          />
        )}

        {/* Pinned location highlight */}
        {pinnedLocation?.coords && (
          <Circle
            center={pinnedLocation.coords}
            radius={100}
            pathOptions={{ color: "#10b981", fillOpacity: 0.15, weight: 2 }}
          />
        )}

        {/* Infrastructure markers */}
        {activeLayers.infrastructure &&
          locations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={infraIcon(loc)}
              eventHandlers={{
                click: () => onSelectLocation(loc),
                mouseover: () => setHoveredLocation?.(loc),
                mouseout: () => setHoveredLocation?.(null),
              }}
            >
              <Popup>
                <div className="p-2 min-w-50">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {loc.name}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Type:</span> {loc.type}
                    </p>
                    {loc.communityName && (
                      <p>
                        <span className="font-medium">Community:</span>{" "}
                        {loc.communityName}
                      </p>
                    )}
                    {loc.district && (
                      <p>
                        <span className="font-medium">District:</span>{" "}
                        {loc.district}
                      </p>
                    )}
                    {loc.region && (
                      <p>
                        <span className="font-medium">Region:</span>{" "}
                        {loc.region}
                      </p>
                    )}
                    {/* {loc.status && (
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {loc.status}
                      </p>
                    )} */}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Community markers */}
        {activeLayers.communities &&
          communities.map((c) => (
            <Marker key={c.id} position={c.coords} icon={communityIcon(c.name)}>
              <Popup>
                <div className="p-2 min-w-50">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {c.name}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    {c.district && (
                      <p>
                        <span className="font-medium">District:</span>{" "}
                        {c.district}
                      </p>
                    )}
                    {c.region && (
                      <p>
                        <span className="font-medium">Region:</span> {c.region}
                      </p>
                    )}
                    {c.floodRiskLevel && (
                      <p>
                        <span className="font-medium">Flood Risk:</span>{" "}
                        {c.floodRiskLevel}
                      </p>
                    )}
                    {c.droughtRiskLevel && (
                      <p>
                        <span className="font-medium">Drought Risk:</span>{" "}
                        {c.droughtRiskLevel}
                      </p>
                    )}
                    {c.climateStatus && (
                      <p>
                        <span className="font-medium">Climate Status:</span>{" "}
                        {c.climateStatus}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Field worker markers — pulse animation when moving */}
        {activeLayers.fieldWorkers &&
          fieldWorkers.map((w) => (
            <Marker
              key={w.id}
              position={w.coords}
              icon={workerIcon(w)}
              eventHandlers={{ click: () => onSelectWorker?.(w) }}
            >
              <Popup>
                <div className="p-2 min-w-50">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {w.name}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Role:</span> {w.role}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {w.isMoving ? "Moving" : "Stationary"}
                    </p>
                    {w.speed > 0 && (
                      <p>
                        <span className="font-medium">Speed:</span>{" "}
                        {w.speed.toFixed(1)} km/h
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Last Seen:</span>{" "}
                      {w.lastSeen}
                    </p>
                    {w.accuracy && (
                      <p>
                        <span className="font-medium">Accuracy:</span> ±
                        {w.accuracy.toFixed(0)}m
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* User tracking route — three stacked polylines for a Google Maps-style look */}
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

        {/* Navigation route to destination */}
        {navigationRoute.length > 1 && (
          <>
            <Polyline
              positions={navigationRoute}
              pathOptions={{
                color: "#4285F4",
                weight: 8,
                opacity: 0.3,
                dashArray: "10, 10",
              }}
            />
            <Polyline
              positions={navigationRoute}
              pathOptions={{ color: "#4285F4", weight: 4, opacity: 0.9 }}
            />
            {navigationDestination?.coords && (
              <Circle
                center={navigationDestination.coords}
                radius={10}
                pathOptions={{
                  color: "#fff",
                  fillColor: "#EA4335",
                  fillOpacity: 1,
                  weight: 3,
                }}
              />
            )}
          </>
        )}

        {/* Geofence boundaries */}
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
              <Popup />
            </Circle>
          ))}

        {/* Live GPS position — accuracy ring + position marker */}
        {isTracking && liveCoords && (
          <>
            <Circle
              center={liveCoords}
              radius={currentPosition?.accuracy ?? 20}
              pathOptions={{ color: "#4285F4", fillOpacity: 0.1 }}
            />
            <Marker position={liveCoords}>
              <Popup />
            </Marker>
          </>
        )}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          z-index: 0 !important;
        }
      `}</style>
    </div>
  );
}
