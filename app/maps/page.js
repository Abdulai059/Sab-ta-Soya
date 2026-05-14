"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import LocationSlugs from "../../components/maps/LocationSlugs";
import IncidentsPanel from "../../components/maps/IncidentsPanel";
import LiveTrackingPanel from "../../components/maps/LiveTrackingPanel";
import MapFooter from "../../components/maps/MapFooter";
import {
  fetchLocations,
  fetchRecentIncidents,
  fetchCommunities,
  fetchGeofences,
  subscribeToReports,
  subscribeToAlerts,
} from "../../lib/mapService";
import {
  fetchFieldWorkers,
  subscribeToFieldWorkers,
  startTracking,
} from "../../lib/trackingService";

// Leaflet must be client-only
const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-50 text-emerald-500 font-mono text-xs tracking-widest animate-pulse">
      LOADING MAP...
    </div>
  ),
});

// ── Chevron icon for mobile toggles ──────────────────────────────────────────
const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Fallback when DB is empty ─────────────────────────────────────────────────
const FALLBACK_LOCATION = {
  id: "fallback",
  name: "Tamale Central",
  slug: "tamale-central",
  coords: [9.4034, -0.8424],
  incidents: 0,
  color: "#00cc66",
  type: "community",
  status: "operational",
};

// ── Default layer visibility ──────────────────────────────────────────────────
const DEFAULT_LAYERS = {
  infrastructure: true,
  communities:    true,
  incidents:      true,   // controls IncidentsPanel visibility
  fieldWorkers:   true,
  geofences:      true,
};

// ── Right panel options ───────────────────────────────────────────────────────
const PANEL = { INCIDENTS: "incidents", TRACKING: "tracking" };

export default function MapsPage() {
  const { profile } = useAuth();

  // ── Core map data ───────────────────────────────────────────────────────────
  const [locations,       setLocations]       = useState([]);
  const [communities,     setCommunities]     = useState([]);
  const [geofences,       setGeofences]       = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [fieldWorkers,    setFieldWorkers]    = useState([]);
  const [activeLocation,  setActiveLocation]  = useState(null);
  const [loading,         setLoading]         = useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeLayers,   setActiveLayers]   = useState(DEFAULT_LAYERS);
  const [rightPanel,     setRightPanel]     = useState(PANEL.INCIDENTS);
  const [showLocations,  setShowLocations]  = useState(false);
  const [showIncidents,  setShowIncidents]  = useState(false);

  // ── GPS tracking state ──────────────────────────────────────────────────────
  const [isTracking, setIsTracking] = useState(false);
  const trackerRef = useRef(null);

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [locs, incidents, comms, fences, workers] = await Promise.all([
        fetchLocations(),
        fetchRecentIncidents(),
        fetchCommunities(),
        fetchGeofences(),
        fetchFieldWorkers(),
      ]);

      const finalLocs = locs.length > 0 ? locs : [FALLBACK_LOCATION];
      setLocations(finalLocs);
      setRecentIncidents(incidents);
      setCommunities(comms);
      setGeofences(fences);
      setFieldWorkers(workers);
      setActiveLocation(finalLocs[0]);
      setLoading(false);
    }
    load();
  }, []);

  // ── Realtime subscriptions ──────────────────────────────────────────────────
  useEffect(() => {
    const reportsSub = subscribeToReports(async () => {
      const [locs, incidents] = await Promise.all([fetchLocations(), fetchRecentIncidents()]);
      if (locs.length > 0) setLocations(locs);
      setRecentIncidents(incidents);
    });

    const alertsSub = subscribeToAlerts(async () => {
      setRecentIncidents(await fetchRecentIncidents());
    });

    const workersSub = subscribeToFieldWorkers((workers) => {
      setFieldWorkers(workers);
    });

    return () => {
      reportsSub.unsubscribe();
      alertsSub.unsubscribe();
      workersSub.unsubscribe();
    };
  }, []);

  // ── Layer toggle ────────────────────────────────────────────────────────────
  function handleToggleLayer(key) {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    // Sync right panel with incidents layer toggle
    if (key === "incidents") {
      setRightPanel((prev) =>
        prev === PANEL.INCIDENTS ? PANEL.TRACKING : PANEL.INCIDENTS
      );
    }
    if (key === "fieldWorkers") {
      setRightPanel((prev) =>
        prev === PANEL.TRACKING ? PANEL.INCIDENTS : PANEL.TRACKING
      );
    }
  }

  // ── GPS tracking ────────────────────────────────────────────────────────────
  function handleStartTracking() {
    // Only logged-in users can track
    if (!profile?.id) {
      alert("Please log in to share your location.");
      return;
    }

    const userId   = profile.id;
    const userName = profile.full_name || "Unknown User";
    const userRole = profile.role || "operator";

    trackerRef.current = startTracking(userId, {
      userName,
      userRole,
      onUpdate: (position) => {
        console.log("📍 GPS Position:", position.latitude, position.longitude, "Accuracy:", position.accuracy, "m");
      },
      onError: (err) => {
        console.error("GPS Error:", err);
        alert("Location permission denied or GPS unavailable. Please enable location services.");
      },
    });
    setIsTracking(true);
    setRightPanel(PANEL.TRACKING);
    setActiveLayers((prev) => ({ ...prev, fieldWorkers: true }));
  }

  function handleStopTracking() {
    trackerRef.current?.stop();
    trackerRef.current = null;
    setIsTracking(false);
  }

  // ── Worker selected on map or panel ─────────────────────────────────────────
  function handleSelectWorker(worker) {
    setActiveLocation({
      id:     worker.id,
      name:   worker.name,
      coords: worker.coords,
      color:  "#10b981",
    });
  }

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading || !activeLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-stone-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-['Syne',sans-serif] overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-12 sm:h-14 bg-white border-b border-gray-200 shrink-0 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] text-gray-900 uppercase">
            Sanitation GIS
          </span>
        </div>

        <h1 className="text-xs sm:text-sm font-extrabold tracking-[0.2em] sm:tracking-[0.4em] uppercase relative text-gray-900">
          Live Map
          <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
        </h1>

        {/* Right: panel switcher + live badge */}
        <div className="flex items-center gap-2">
          {/* Panel toggle buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setRightPanel(PANEL.INCIDENTS)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                rightPanel === PANEL.INCIDENTS
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => setRightPanel(PANEL.TRACKING)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                rightPanel === PANEL.TRACKING
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Field Workers
              {fieldWorkers.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {fieldWorkers.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[8px] sm:text-[10px] text-gray-900">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            <span className="hidden sm:inline">LIVE</span>
          </div>
        </div>
      </header>

      {/* ── MOBILE CONTROLS ────────────────────────────────────────────────── */}
      <div className="lg:hidden flex gap-2 p-2 bg-gray-50 border-b border-gray-200 shrink-0 relative z-10">
        <button
          onClick={() => { setShowLocations(!showLocations); setShowIncidents(false); }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: activeLocation.color }} />
            Locations ({locations.length})
          </span>
          <ChevronIcon isOpen={showLocations} />
        </button>
        <button
          onClick={() => { setShowIncidents(!showIncidents); setShowLocations(false); }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Incidents ({recentIncidents.length})
          </span>
          <ChevronIcon isOpen={showIncidents} />
        </button>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Desktop left sidebar — locations */}
        <div className="hidden lg:flex">
          <LocationSlugs
            locations={locations}
            activeLocation={activeLocation}
            onSelect={setActiveLocation}
          />
        </div>

        {/* Mobile overlay — locations */}
        {showLocations && (
          <div className="lg:hidden absolute inset-0 z-20 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
                Locations
              </span>
              <button onClick={() => setShowLocations(false)} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {locations.map((loc) => {
                const isActive = activeLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => { setActiveLocation(loc); setShowLocations(false); }}
                    className={`relative w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 overflow-hidden ${
                      isActive ? "border-slate-300 bg-stone-50 shadow" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                      style={{ background: loc.color, opacity: isActive ? 1 : 0.4 }} />
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                      style={{ background: `${loc.color}22`, color: loc.color, border: `1px solid ${loc.color}44` }}>
                      {loc.incidents}
                    </span>
                    <div className="pl-2 pr-8">
                      <div className={`text-sm font-semibold leading-tight mb-1 ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {loc.name}
                      </div>
                      <div className="font-mono text-xs text-gray-400">/{loc.slug}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Map — always visible */}
        <MapView
          locations={locations}
          activeLocation={activeLocation}
          onSelectLocation={setActiveLocation}
          communities={communities}
          fieldWorkers={fieldWorkers}
          onSelectWorker={handleSelectWorker}
          geofences={geofences}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />

        {/* Desktop right sidebar — incidents or field workers */}
        <div className="hidden lg:flex">
          {rightPanel === PANEL.INCIDENTS ? (
            <IncidentsPanel
              incidents={recentIncidents}
              locations={locations}
              onSelectLocation={setActiveLocation}
            />
          ) : (
            <LiveTrackingPanel
              workers={fieldWorkers}
              isTracking={isTracking}
              onStartTracking={handleStartTracking}
              onStopTracking={handleStopTracking}
              onSelectWorker={handleSelectWorker}
              currentUserId={profile?.id}
            />
          )}
        </div>

        {/* Mobile overlay — incidents */}
        {showIncidents && (
          <div className="lg:hidden absolute inset-0 z-20 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
                  Recent Incidents
                </span>
                <span className="font-mono text-[9px] text-rose-500 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5">
                  {recentIncidents.length}
                </span>
              </div>
              <button onClick={() => setShowIncidents(false)} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {recentIncidents.map((inc) => {
                const cfg = {
                  high:   { dot: "#ff4444", bg: "rgba(255,68,68,0.06)",   border: "rgba(255,68,68,0.18)",   label: "HIGH", lc: "#ff4444" },
                  medium: { dot: "#ffaa00", bg: "rgba(255,170,0,0.06)",   border: "rgba(255,170,0,0.18)",   label: "MED",  lc: "#ffaa00" },
                  low:    { dot: "#00cc66", bg: "rgba(0,204,102,0.06)",   border: "rgba(0,204,102,0.18)",   label: "LOW",  lc: "#00cc66" },
                };
                const s = cfg[inc.severity] ?? cfg.medium;
                return (
                  <button
                    key={inc.id}
                    onClick={() => {
                      const loc = locations.find((l) => l.id === inc.locationId);
                      if (loc) { setActiveLocation(loc); setShowIncidents(false); }
                    }}
                    className="w-full text-left rounded-lg border shadow-sm p-3 transition-all duration-150 hover:brightness-95"
                    style={{ background: s.bg, borderColor: s.border }}
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="mt-0.5 relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: s.dot }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: s.dot }} />
                      </span>
                      <span className="text-sm font-semibold text-gray-500 leading-tight flex-1">{inc.title}</span>
                      <span className="font-mono text-[9px] font-semibold shrink-0 mt-0.5" style={{ color: s.lc }}>{s.label}</span>
                    </div>
                    <div className="flex items-center justify-between pl-4">
                      <span className="font-mono text-xs text-gray-500 truncate">{inc.location}</span>
                      <span className="font-mono text-xs text-gray-500">{inc.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <MapFooter activeLocation={activeLocation} />
    </div>
  );
}
