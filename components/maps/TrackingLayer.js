"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";

/**
 * Create custom tracking marker icon
 */
function createTrackingIcon(user) {
  const roleColors = {
    admin: "#8b5cf6",
    operator: "#10b981",
    district_officer: "#3b82f6",
    response_team: "#ef4444",
    ngo: "#f59e0b",
  };

  const color = roleColors[user.role] || "#6b7280";
  const isMoving = user.isMoving;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <!-- Shadow -->
      <ellipse cx="20" cy="36" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Outer pulse ring (if moving) -->
      ${
        isMoving
          ? `<circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="2" opacity="0.3">
          <animate attributeName="r" from="18" to="22" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
        </circle>`
          : ""
      }
      
      <!-- Main circle -->
      <circle cx="20" cy="20" r="12" fill="${color}" opacity="0.9"/>
      
      <!-- Inner white circle -->
      <circle cx="20" cy="20" r="8" fill="white" opacity="0.3"/>
      
      <!-- Direction indicator (if moving) -->
      ${
        isMoving && user.heading !== null
          ? `<path d="M 20 12 L 24 20 L 20 18 L 16 20 Z" fill="white" transform="rotate(${user.heading || 0}, 20, 20)"/>`
          : `<circle cx="20" cy="20" r="4" fill="white"/>`
      }
      
      <!-- Accuracy circle -->
      <circle cx="20" cy="20" r="14" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="2,2" opacity="0.4"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "tracking-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

/**
 * TrackingLayer Component
 * Displays real-time tracked users on the map
 */
export default function TrackingLayer({ trackedUsers, onSelectUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTrails, setShowTrails] = useState(true);

  const roleColors = {
    admin: "#8b5cf6",
    operator: "#10b981",
    district_officer: "#3b82f6",
    response_team: "#ef4444",
    ngo: "#f59e0b",
  };

  function handleMarkerClick(user) {
    setSelectedUser(user);
    if (onSelectUser) onSelectUser(user);
  }

  return (
    <>
      {trackedUsers.map((user) => {
        const color = roleColors[user.role] || "#6b7280";

        return (
          <div key={user.id}>
            {/* User marker */}
            <Marker
              position={user.coords}
              icon={createTrackingIcon(user)}
              eventHandlers={{
                click: () => handleMarkerClick(user),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: color }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.role.replace("_", " ")}
                      </div>
                    </div>
                    {user.isMoving && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Moving
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last seen:</span>
                      <span className="font-medium text-gray-900">
                        {user.lastSeen}
                      </span>
                    </div>

                    {user.speed !== null && user.speed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Speed:</span>
                        <span className="font-medium text-gray-900">
                          {(user.speed * 3.6).toFixed(1)} km/h
                        </span>
                      </div>
                    )}

                    {user.accuracy && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="font-medium text-gray-900">
                          ±{Math.round(user.accuracy)}m
                        </span>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium text-gray-900">
                          {user.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-[10px] text-gray-400 font-mono">
                      {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Accuracy circle */}
            {user.accuracy && (
              <Circle
                center={user.coords}
                radius={user.accuracy}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: "5, 5",
                }}
              />
            )}
          </div>
        );
      })}

      {/* Global styles for tracking markers */}
      <style jsx global>{`
        .tracking-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  );
}
