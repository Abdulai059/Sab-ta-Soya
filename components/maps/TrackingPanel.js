"use client";

import { useState } from "react";
import { formatDistance } from "@/lib/trackingService";

const roleColors = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  operator: "bg-emerald-100 text-emerald-700 border-emerald-200",
  district_officer: "bg-blue-100 text-blue-700 border-blue-200",
  response_team: "bg-red-100 text-red-700 border-red-200",
  ngo: "bg-amber-100 text-amber-700 border-amber-200",
  visitor: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function TrackingPanel({
  trackedUsers,
  onSelectUser,
  onStartTracking,
  onStopTracking,
  isTracking,
  currentUserId,
}) {
  const [filter, setFilter] = useState("all");

  const filteredUsers =
    filter === "all"
      ? trackedUsers
      : trackedUsers.filter((user) => user.role === filter);

  const activeCount = trackedUsers.filter((u) => u.isMoving).length;

  return (
    <aside className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
            Live Tracking
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">
              {trackedUsers.length} Active
            </span>
          </div>
        </div>

        {/* Start/Stop Tracking Button - Available for Everyone */}
        <button
          onClick={isTracking ? onStopTracking : onStartTracking}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isTracking
              ? "bg-red-500 hover:bg-red-600 text-white shadow-sm"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
          }`}
        >
          {isTracking ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop Tracking
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Start Tracking
            </span>
          )}
        </button>

        {/* Info message for non-logged-in users */}
        {!currentUserId && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              You'll appear as "Anonymous User" on the map
            </p>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="all">All Roles ({trackedUsers.length})</option>
          <option value="operator">Operators</option>
          <option value="response_team">Response Teams</option>
          <option value="district_officer">District Officers</option>
          <option value="ngo">NGO Workers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {trackedUsers.length}
            </div>
            <div className="text-xs text-gray-600">Total Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {activeCount}
            </div>
            <div className="text-xs text-gray-600">Moving Now</div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <p className="text-sm">No active tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const roleColor = roleColors[user.role] || "bg-gray-100 text-gray-700 border-gray-200";
              const isCurrentUser = user.id === currentUserId;

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all duration-150"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColor}`}
                      >
                        {user.role.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Status indicator */}
                    <div className="flex flex-col items-end gap-1">
                      {user.isMoving ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Moving
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Still
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Last seen:</span>
                      <span className="font-medium text-gray-700">
                        {user.lastSeen}
                      </span>
                    </div>

                    {user.speed !== null && user.speed > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Speed:</span>
                        <span className="font-medium text-gray-700">
                          {(user.speed * 3.6).toFixed(1)} km/h
                        </span>
                      </div>
                    )}

                    {user.accuracy && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="font-medium text-gray-700">
                          ±{formatDistance(user.accuracy)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      {user.latitude.toFixed(5)}, {user.longitude.toFixed(5)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
