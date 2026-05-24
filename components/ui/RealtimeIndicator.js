"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Real-time Connection Indicator
 * Shows a small badge indicating whether real-time updates are active
 */
export function RealtimeIndicator() {
  const [isConnected, setIsConnected] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Monitor Supabase real-time connection status
    const channel = supabase.channel("connection_monitor");

    channel
      .on("system", { event: "connected" }, () => {
        setIsConnected(true);
      })
      .on("system", { event: "disconnected" }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span className="hidden sm:inline">Live</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline</span>
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 z-50">
          <div className="flex items-start gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold mb-1">
                {isConnected ? "Real-time Active" : "Real-time Disconnected"}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {isConnected
                  ? "Changes to the database will appear instantly without refreshing the page."
                  : "Real-time updates are currently unavailable. Please refresh the page to see latest changes."}
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
