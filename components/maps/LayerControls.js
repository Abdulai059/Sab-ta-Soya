"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  MapPin,
  Map,
  Layers3,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const layers = [
  {
    key: "infrastructure",
    label: "Infrastructure",
    description: "Toilets, dump sites, water points",
    color: "#3b82f6",
    icon: Building2,
  },
  {
    key: "communities",
    label: "Communities",
    description: "Regional reference points",
    color: "#8b5cf6",
    icon: Users,
  },
  {
    key: "incidents",
    label: "Incidents",
    description: "Active sanitation reports",
    color: "#ef4444",
    icon: AlertTriangle,
  },
  {
    key: "fieldWorkers",
    label: "Field Workers",
    description: "Live GPS positions",
    color: "#10b981",
    icon: MapPin,
  },
  {
    key: "geofences",
    label: "Geofences",
    description: "Risk zones and boundaries",
    color: "#f59e0b",
    icon: Map,
  },
];

export default function LayerControls({
  activeLayers,
  onToggle,
  fieldWorkerCount = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden absolute top-2 right-2 z-[500] flex items-center gap-2 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm transition-transform active:scale-95"
      >
        <Layers3 className="h-4 w-4 text-stone-600" />

        <span className="text-xs font-semibold text-stone-700">Layers</span>

        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
          {activeCount}
        </span>
      </button>

      {/* Mobile Panel */}
      {isExpanded && (
        <div className="md:hidden absolute inset-x-2 top-2 z-[501] overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 px-3 py-2.5">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Map Layers
            </span>

            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-lg p-1 transition-colors hover:bg-stone-100"
            >
              <X className="h-4 w-4 text-stone-600" />
            </button>
          </div>

          {/* Layers */}
          <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto p-2">
            {layers.map((layer) => (
              <LayerButton
                key={layer.key}
                layer={layer}
                isOn={activeLayers[layer.key]}
                onClick={() => onToggle(layer.key)}
                fieldWorkerCount={fieldWorkerCount}
                mobile
              />
            ))}
          </div>
        </div>
      )}

      {/* Desktop Panel */}
      <div className="hidden md:block absolute top-3 right-3 z-[500] w-52 overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-lg backdrop-blur-sm">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-stone-100 px-3 py-2.5 hover:bg-stone-50 transition-colors"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400">
            Map Layers
          </span>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
              {activeCount}
            </span>

            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-stone-400 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-stone-400 transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 p-2">
            {layers.map((layer) => (
              <LayerButton
                key={layer.key}
                layer={layer}
                isOn={activeLayers[layer.key]}
                onClick={() => onToggle(layer.key)}
                fieldWorkerCount={fieldWorkerCount}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                               LAYER BUTTON                                 */
/* -------------------------------------------------------------------------- */

function LayerButton({
  layer,
  isOn,
  onClick,
  fieldWorkerCount,
  mobile = false,
}) {
  const Icon = layer.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-2.5 rounded-lg text-left transition-all duration-150
        ${mobile ? "px-3 py-2.5" : "px-2.5 py-2"}
        ${isOn ? "bg-stone-50" : "opacity-50 hover:bg-stone-50"}
      `}
    >
      {/* Icon */}
      <span
        className={`
          flex shrink-0 items-center justify-center rounded-md transition-all
          ${mobile ? "h-6 w-6" : "h-5 w-5"}
        `}
        style={{
          background: isOn ? `${layer.color}20` : "#f3f4f6",
          color: isOn ? layer.color : "#9ca3af",
          border: `1px solid ${isOn ? `${layer.color}40` : "#e5e7eb"}`,
        }}
      >
        <Icon className={mobile ? "h-3.5 w-3.5" : "h-3 w-3"} />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-semibold leading-none text-stone-700 ${
              mobile ? "text-sm" : "text-xs"
            }`}
          >
            {layer.label}
          </span>

          {/* Live Worker Badge */}
          {layer.key === "fieldWorkers" && fieldWorkerCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold leading-none text-emerald-600">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              {fieldWorkerCount}
            </span>
          )}
        </div>

        <span
          className={`
            mt-0.5 block truncate leading-none text-stone-400
            ${mobile ? "text-[10px]" : "text-[10px]"}
          `}
        >
          {layer.description}
        </span>
      </div>

      {/* Toggle */}
      <span
        className={`
          relative shrink-0 rounded-full transition-colors duration-200
          ${mobile ? "h-5 w-8" : "h-4 w-7"}
          ${isOn ? "bg-emerald-500" : "bg-stone-200"}
        `}
      >
        <span
          className={`
            absolute rounded-full bg-white shadow-sm transition-transform duration-200
            ${mobile ? "top-0.5 h-4 w-4" : "top-0.5 h-3 w-3"}
            ${isOn ? "translate-x-3.5" : "translate-x-0.5"}
          `}
        />
      </span>
    </button>
  );
}
