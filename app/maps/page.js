"use client";

import dynamic from "next/dynamic";
import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Custom Hooks
import { useMapData } from "@/hooks/useMapData";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import { useGPSTracking } from "@/hooks/useGPSTracking";
import { useMapsUI } from "@/hooks/useMapsUI";
import { useUserRoute } from "@/hooks/useUserRoute";

// Layout Components
import MapHeader from "@/components/maps/MapHeader";
import MapFooter from "@/components/maps/MapFooter";
import MapLoadingScreen from "@/components/maps/MapLoadingScreen";
import MapRightPanel from "@/components/maps/MapRightPanel";

// Desktop Components
import LocationSlugs from "@/components/maps/LocationSlugs";

// Mobile Components
import MobileControls from "@/components/maps/MobileControls";
import MobileLocationsOverlay from "@/components/maps/MobileLocationsOverlay";
import MobileIncidentsOverlay from "@/components/maps/MobileIncidentsOverlay";
import MobileWorkersOverlay from "@/components/maps/MobileWorkersOverlay";
import WorkersFab from "@/components/maps/WorkersFab";

// Leaflet must be client-only
const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-50 text-emerald-500 font-mono text-xs tracking-widest animate-pulse">
      LOADING MAP...
    </div>
  ),
});

/**
 * Reads ?lat=&lng=&name= from the URL and flies the map to that location.
 * Must be wrapped in <Suspense> because useSearchParams() opts out of SSR.
 */
function DeepLinkHandler({ setActiveLocation }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const name = searchParams.get("name");

    if (!isNaN(lat) && !isNaN(lng)) {
      setActiveLocation({
        id: `shared-${lat}-${lng}`,
        name: name ? decodeURIComponent(name) : "Shared Location",
        coords: [lat, lng],
        color: "#4285F4",
      });
    }
  }, [searchParams, setActiveLocation]);

  return null;
}

export default function MapsPage() {
  const { profile } = useAuth();

  const {
    locations,
    setLocations,
    communities,
    geofences,
    recentIncidents,
    setRecentIncidents,
    fieldWorkers,
    setFieldWorkers,
    activeLocation,
    setActiveLocation,
    loading,
  } = useMapData();

  useRealtimeSubscriptions(setLocations, setRecentIncidents, setFieldWorkers);

  const {
    isTracking,
    latestPosition,
    handleStartTracking,
    handleStopTracking,
  } = useGPSTracking(profile);

  // User route tracking (blue path like Google Maps)
  const { userRoute, currentPosition } = useUserRoute(
    profile?.id,
    isTracking,
    latestPosition,
  );

  const {
    activeLayers,
    handleToggleLayer,
    rightPanel,
    setRightPanel,
    showLocations,
    setShowLocations,
    showIncidents,
    setShowIncidents,
    showWorkers,
    setShowWorkers,
  } = useMapsUI();

  const [severityFilter, setSeverityFilter] = useState("all");

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [navigationRoute, setNavigationRoute] = useState([]);

  const handleSelectWorker = (worker) => {
    setActiveLocation({
      id: worker.id,
      name: worker.name,
      coords: worker.coords,
      color: "#10b981",
    });
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
    if (incident.locations?.[0]) {
      setActiveLocation(incident.locations[0]);
    }
  };

  const togglePinLocation = (location) => {
    setPinnedLocation((prev) => (prev?.id === location.id ? null : location));
  };

  const handleStartNavigation = (location) => {
    setNavigationDestination(location);
    if (currentPosition) {
      setNavigationRoute([
        [currentPosition.latitude, currentPosition.longitude],
        location.coords,
      ]);
    }
  };

  const handleStopNavigation = () => {
    setNavigationDestination(null);
    setNavigationRoute([]);
  };

  // Update navigation route as user moves
  useEffect(() => {
    if (navigationDestination && currentPosition) {
      setNavigationRoute([
        [currentPosition.latitude, currentPosition.longitude],
        navigationDestination.coords,
      ]);
    }
  }, [currentPosition, navigationDestination]);

  if (loading || !activeLocation) return <MapLoadingScreen />;

  return (
    <div className="flex flex-col h-full w-full bg-white text-gray-900 font-['Syne',sans-serif] overflow-hidden">
      {/* Deep-link handler — reads ?lat=&lng=&name= from URL */}
      <Suspense fallback={null}>
        <DeepLinkHandler setActiveLocation={setActiveLocation} />
      </Suspense>

      <div className="animate-slide-in-top relative z-9999">
        <MapHeader
          rightPanel={rightPanel}
          setRightPanel={setRightPanel}
          fieldWorkers={fieldWorkers}
          locations={locations}
          communities={communities}
          onSelectLocation={setActiveLocation}
          activeLocation={activeLocation}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          navigationDestination={navigationDestination}
          onStopNavigation={handleStopNavigation}
        />
      </div>

      <div className="relative z-9999">
        <MobileControls
          locations={locations}
          recentIncidents={recentIncidents}
          fieldWorkers={fieldWorkers}
          activeLocation={activeLocation}
          showLocations={showLocations}
          setShowLocations={setShowLocations}
          showIncidents={showIncidents}
          setShowIncidents={setShowIncidents}
          isTracking={isTracking}
          onStartTracking={handleStartTracking}
          onStopTracking={handleStopTracking}
          profile={profile}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:flex animate-slide-in-left">
          <LocationSlugs
            locations={locations}
            activeLocation={activeLocation}
            onSelect={setActiveLocation}
            togglePinLocation={togglePinLocation}
            pinnedLocation={pinnedLocation}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
            navigationDestination={navigationDestination}
          />
        </div>

        <MobileLocationsOverlay
          isVisible={showLocations}
          locations={locations}
          activeLocation={activeLocation}
          onSelectLocation={(loc) => {
            setActiveLocation(loc);
            setShowLocations(false);
          }}
          onClose={() => setShowLocations(false)}
          togglePinLocation={togglePinLocation}
          pinnedLocation={pinnedLocation}
          onStartNavigation={handleStartNavigation}
          onStopNavigation={handleStopNavigation}
          navigationDestination={navigationDestination}
        />

        <MobileIncidentsOverlay
          isVisible={showIncidents}
          incidents={recentIncidents}
          locations={locations}
          onSelectIncident={(loc) => {
            setActiveLocation(loc);
            setShowIncidents(false);
          }}
          onClose={() => setShowIncidents(false)}
          severityFilter={severityFilter}
          togglePinLocation={togglePinLocation}
          pinnedLocation={pinnedLocation}
          onStartNavigation={handleStartNavigation}
          onStopNavigation={handleStopNavigation}
          navigationDestination={navigationDestination}
        />

        <MobileWorkersOverlay
          isVisible={showWorkers}
          workers={fieldWorkers}
          currentUserId={profile?.id}
          onSelectWorker={(worker) => {
            handleSelectWorker(worker);
            setShowWorkers(false);
          }}
          onClose={() => setShowWorkers(false)}
        />

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
          userRoute={userRoute}
          currentPosition={currentPosition}
          isTracking={isTracking}
          currentUserId={profile?.id}
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
          hoveredLocation={hoveredLocation}
          setHoveredLocation={setHoveredLocation}
          pinnedLocation={pinnedLocation}
          setPinnedLocation={setPinnedLocation}
          togglePinLocation={togglePinLocation}
          navigationRoute={navigationRoute}
          navigationDestination={navigationDestination}
          onStartNavigation={handleStartNavigation}
          onStopNavigation={handleStopNavigation}
        />

        <div className="panel-enter">
          <MapRightPanel
            rightPanel={rightPanel}
            incidents={recentIncidents}
            locations={locations}
            fieldWorkers={fieldWorkers}
            isTracking={isTracking}
            currentUserId={profile?.id}
            onSelectLocation={setActiveLocation}
            onStartTracking={handleStartTracking}
            onStopTracking={handleStopTracking}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            onSelectWorker={handleSelectWorker}
            onSelectIncident={handleSelectIncident}
            selectedIncident={selectedIncident}
            togglePinLocation={togglePinLocation}
            pinnedLocation={pinnedLocation}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
            navigationDestination={navigationDestination}
          />
        </div>

        <WorkersFab
          fieldWorkers={fieldWorkers}
          onClick={() => setShowWorkers(true)}
          isVisible={!showWorkers && !showLocations && !showIncidents}
        />
      </div>

      <div className="animate-slide-in-bottom">
        <MapFooter activeLocation={activeLocation} />
      </div>
    </div>
  );
}
