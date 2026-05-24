import { useState, useRef } from "react";
import { startTracking } from "../../lib/trackingService";
import { PANEL } from "../constants";

export function useGpsTracking({ profile, setRightPanel, setActiveLayers }) {
  const [isTracking, setIsTracking] = useState(false);
  const trackerRef = useRef(null);

  function handleStartTracking() {
    if (!profile?.id) {
      alert("Please log in to share your location.");
      return;
    }

    trackerRef.current = startTracking(profile.id, {
      userName: profile.full_name || "Unknown User",
      userRole: profile.role || "operator",
      onUpdate: (position) => {
        // GPS position updated successfully
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

  return { isTracking, handleStartTracking, handleStopTracking };
}