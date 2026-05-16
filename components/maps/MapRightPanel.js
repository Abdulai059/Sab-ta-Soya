import IncidentsPanel from "@/components/maps/IncidentsPanel";
import LiveTrackingPanel from "@/components/maps/LiveTrackingPanel";
import { PANEL_TYPES } from "@/lib/mapConstants";

export default function MapRightPanel({
  rightPanel,
  incidents,
  locations,
  fieldWorkers,
  isTracking,
  currentUserId,
  onSelectLocation,
  onStartTracking,
  onStopTracking,
  onSelectWorker,
  severityFilter,
  setSeverityFilter,
}) {
  return (
    <div className="hidden lg:flex h-full">
      {rightPanel === PANEL_TYPES.INCIDENTS ? (
        <IncidentsPanel
          incidents={incidents}
          locations={locations}
          onSelectLocation={onSelectLocation}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
        />
      ) : (
        <LiveTrackingPanel
          workers={fieldWorkers}
          isTracking={isTracking}
          onStartTracking={onStartTracking}
          onStopTracking={onStopTracking}
          onSelectWorker={onSelectWorker}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
