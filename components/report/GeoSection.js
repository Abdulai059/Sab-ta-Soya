"use client";

import { useState, useCallback } from "react";
import { Crosshair, RefreshCw, CircleCheck, RotateCcw, AlertCircle, Pencil } from "lucide-react";
import { FieldLabel, inputCls } from "./FormPrimitives";

export default function GeoSection({ geoData, setGeoData }) {
  const [state, setState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by this browser.");
      setState("error");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoData({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy) + "m",
        });
        setState("success");
      },
      (err) => {
        const msgs = {
          1: "Location access denied. Allow it in browser settings or enter manually.",
          2: "Location unavailable. Try again or enter manually.",
          3: "Location request timed out. Please try again.",
        };
        setErrorMsg(msgs[err.code] || "Unknown error getting location.");
        setState("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setGeoData]);

  const applyManual = () => {
    if (!manualLat || !manualLng) return;
    setGeoData({
      lat: parseFloat(manualLat).toFixed(6),
      lng: parseFloat(manualLng).toFixed(6),
      accuracy: "manual",
    });
    setState("success");
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {state === "idle" && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50">
          <div className="flex items-center gap-3">
            <Crosshair size={22} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Capture GPS location</p>
              <p className="text-xs text-gray-400 mt-0.5">Auto-detect your current coordinates</p>
            </div>
          </div>
          <button onClick={detect} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition">
            <Crosshair size={14} /> Detect
          </button>
        </div>
      )}

      {state === "loading" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-purple-50">
          <RefreshCw size={18} className="text-purple-500 animate-spin" />
          <span className="text-sm text-purple-700">Getting your location… please wait</span>
        </div>
      )}

      {state === "success" && (
        <div className="px-4 py-3 bg-emerald-50">
          <div className="flex items-center gap-2 mb-2.5">
            <CircleCheck size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Location captured</span>
            <button onClick={detect} className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 transition">
              <RotateCcw size={11} /> Retake
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Latitude",  val: geoData?.lat      },
              { label: "Longitude", val: geoData?.lng      },
              { label: "Accuracy",  val: geoData?.accuracy },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-mono text-emerald-900">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-700 flex-1">{errorMsg}</span>
          <button onClick={detect} className="text-xs px-2.5 py-1 rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 transition">Retry</button>
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-2.5 bg-white">
        <button onClick={() => setManualOpen((v) => !v)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition">
          <Pencil size={12} />
          {manualOpen ? "Hide manual entry" : "Enter coordinates manually"}
        </button>
        {manualOpen && (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div>
              <FieldLabel>Latitude</FieldLabel>
              <input type="text" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="e.g. 9.4034" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Longitude</FieldLabel>
              <input type="text" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="e.g. -0.8424" className={inputCls} />
            </div>
            <button onClick={applyManual} className="col-span-2 text-xs py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-medium">
              Apply coordinates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
