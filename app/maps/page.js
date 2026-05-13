"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import LocationSlugs from "../../components/maps/LocationSlugs";
import IncidentsPanel from "../../components/maps/IncidentsPanel";
import MapFooter from "../../components/maps/MapFooter";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 text-blue-500 font-mono text-xs tracking-widest animate-pulse">
      LOADING MAP...
    </div>
  ),
});

// Icons for mobile toggles
const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const locations = [
  {
    id: 1,
    name: "Tamale Central",
    slug: "tamale-central",
    coords: [9.4034, -0.8424],
    incidents: 5,
    color: "#ff4444",
  },
  {
    id: 2,
    name: "Savelugu Township",
    slug: "savelugu-township",
    coords: [9.6247, -0.8253],
    incidents: 2,
    color: "#ffaa00",
  },
  {
    id: 3,
    name: "Yendi Urban Area",
    slug: "yendi-urban-area",
    coords: [9.4423, -0.0095],
    incidents: 1,
    color: "#ff6600",
  },
  {
    id: 4,
    name: "Walewale Community",
    slug: "walewale-community",
    coords: [10.3696, -0.4197],
    incidents: 3,
    color: "#ff4444",
  },
  {
    id: 5,
    name: "Damongo District",
    slug: "damongo-district",
    coords: [9.0833, -1.8167],
    incidents: 1,
    color: "#ffaa00",
  },
  {
    id: 6,
    name: "Bimbilla Area",
    slug: "bimbilla-area",
    coords: [8.8633, -0.05],
    incidents: 2,
    color: "#ff6600",
  },
  {
    id: 7,
    name: "Gushegu Zone",
    slug: "gushegu-zone",
    coords: [9.5167, -0.5167],
    incidents: 0,
    color: "#00cc66",
  },
];

export const recentIncidents = [
  {
    id: 1,
    title: "Flooded Latrine",
    location: "Tamale Central",
    locationId: 1,
    time: "12m ago",
    severity: "high",
  },
  {
    id: 2,
    title: "Contaminated Water Reported",
    location: "Savelugu Township",
    locationId: 2,
    time: "34m ago",
    severity: "high",
  },
  {
    id: 3,
    title: "Toilet Collapse After Heavy Rain",
    location: "Walewale Community",
    locationId: 4,
    time: "1h ago",
    severity: "high",
  },
  {
    id: 4,
    title: "Low Water Supply for Sanitation",
    location: "Damongo District",
    locationId: 5,
    time: "2h ago",
    severity: "medium",
  },
  {
    id: 5,
    title: "Blocked Drain Near School",
    location: "Yendi Urban Area",
    locationId: 3,
    time: "3h ago",
    severity: "medium",
  },
];

export default function MapsPage() {
  const [activeLocation, setActiveLocation] = useState(locations[0]);
  const [showLocations, setShowLocations] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-['Syne',sans-serif] overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-12 sm:h-14 bg-white border-b border-gray-200 shrink-0 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] text-gray-900 uppercase">
            Incident Monitor
          </span>
        </div>

        <h1 className="text-xs sm:text-sm font-extrabold tracking-[0.2em] sm:tracking-[0.4em] uppercase relative text-gray-900">
          Maps
          <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-linear-to-r from-brand-primary to-brand-highlight rounded-full" />
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[8px] sm:text-[10px] text-gray-00">
          <span className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
          <span className="hidden sm:inline">LIVE</span>
        </div>
      </header>

      {/* MOBILE CONTROLS - Only visible on mobile/tablet */}
      <div className="lg:hidden flex gap-2 p-2 bg-gray-50 border-b border-gray-200 shrink-0 relative z-10">
        <button
          onClick={() => {
            setShowLocations(!showLocations);
            setShowIncidents(false);
          }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: activeLocation.color }} />
            Locations ({locations.length})
          </span>
          <ChevronIcon isOpen={showLocations} />
        </button>
        <button
          onClick={() => {
            setShowIncidents(!showIncidents);
            setShowLocations(false);
          }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Incidents ({recentIncidents.length})
          </span>
          <ChevronIcon isOpen={showIncidents} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar - Locations */}
        <div className="hidden lg:flex">
          <LocationSlugs
            locations={locations}
            activeLocation={activeLocation}
            onSelect={setActiveLocation}
          />
        </div>

        {/* Mobile Overlay - Locations */}
        {showLocations && (
          <div className="lg:hidden absolute inset-0 z-20 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
                Location Slugs
              </span>
              <button
                onClick={() => setShowLocations(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-2">
                {locations.map((loc) => {
                  const isActive = activeLocation.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setActiveLocation(loc);
                        setShowLocations(false);
                      }}
                      className={[
                        "relative w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 overflow-hidden",
                        isActive
                          ? "border-slate-300 bg-brand-primary shadow-lg"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                        style={{ background: loc.color, opacity: isActive ? 1 : 0.4 }}
                      />
                      <span
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                        style={{
                          background: `${loc.color}22`,
                          color: loc.color,
                          border: `1px solid ${loc.color}44`,
                        }}
                      >
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
          </div>
        )}

        {/* Map View - Always visible */}
        <MapView
          locations={locations}
          activeLocation={activeLocation}
          onSelectLocation={setActiveLocation}
        />

        {/* Desktop Sidebar - Incidents */}
        <div className="hidden lg:flex">
          <IncidentsPanel
            incidents={recentIncidents}
            locations={locations}
            onSelectLocation={setActiveLocation}
          />
        </div>

        {/* Mobile Overlay - Incidents */}
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
              <button
                onClick={() => setShowIncidents(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-2">
                {recentIncidents.map((inc) => {
                  const severityConfig = {
                    high: { dot: "#ff4444", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.18)", label: "HIGH", labelColor: "#ff4444" },
                    medium: { dot: "#ffaa00", bg: "rgba(255,170,0,0.06)", border: "rgba(255,170,0,0.18)", label: "MED", labelColor: "#ffaa00" },
                    low: { dot: "#00cc66", bg: "rgba(0,204,102,0.06)", border: "rgba(0,204,102,0.18)", label: "LOW", labelColor: "#00cc66" },
                  };
                  const s = severityConfig[inc.severity];
                  return (
                    <button
                      key={inc.id}
                      onClick={() => {
                        const loc = locations.find((l) => l.id === inc.locationId);
                        if (loc) {
                          setActiveLocation(loc);
                          setShowIncidents(false);
                        }
                      }}
                      className="w-full text-left rounded-lg border shadow-sm p-3 transition-all duration-150 hover:brightness-95"
                      style={{ background: s.bg, borderColor: s.border }}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="mt-0.5 relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: s.dot }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: s.dot }} />
                        </span>
                        <span className="text-sm font-semibold text-gray-500 leading-tight flex-1">
                          {inc.title}
                        </span>
                        <span className="font-mono text-[9px] font-semibold shrink-0 mt-0.5" style={{ color: s.labelColor }}>
                          {s.label}
                        </span>
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
          </div>
        )}
      </div>

      {/* FOOTER */}
      <MapFooter activeLocation={activeLocation} />
    </div>
  );
}
