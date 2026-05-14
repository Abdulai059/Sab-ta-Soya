"use client";

const layers = [
  {
    key: "infrastructure",
    label: "Infrastructure",
    description: "Toilets, dump sites, water points",
    color: "#3b82f6",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: "communities",
    label: "Communities",
    description: "Regional reference points",
    color: "#8b5cf6",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "incidents",
    label: "Incidents",
    description: "Active sanitation reports",
    color: "#ef4444",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    key: "fieldWorkers",
    label: "Field Workers",
    description: "Live GPS positions",
    color: "#10b981",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "geofences",
    label: "Geofences",
    description: "Risk zones and boundaries",
    color: "#f59e0b",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

export default function LayerControls({ activeLayers, onToggle, fieldWorkerCount = 0 }) {
  return (
    <div className="absolute top-3 right-3 z-[500] bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl shadow-lg overflow-hidden w-52">
      <div className="px-3 py-2.5 border-b border-stone-100">
        <span className="font-mono text-[9px] tracking-[0.2em] text-stone-400 uppercase">
          Map Layers
        </span>
      </div>

      <div className="p-2 flex flex-col gap-1">
        {layers.map((layer) => {
          const isOn = activeLayers[layer.key];
          return (
            <button
              key={layer.key}
              onClick={() => onToggle(layer.key)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                isOn ? "bg-stone-50" : "hover:bg-stone-50 opacity-50"
              }`}
            >
              {/* Color dot / toggle */}
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: isOn ? `${layer.color}20` : "#f3f4f6",
                  color: isOn ? layer.color : "#9ca3af",
                  border: `1px solid ${isOn ? `${layer.color}40` : "#e5e7eb"}`,
                }}
              >
                {layer.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-700 leading-none">
                    {layer.label}
                  </span>
                  {/* Live badge for field workers */}
                  {layer.key === "fieldWorkers" && fieldWorkerCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 leading-none">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      {fieldWorkerCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 leading-none mt-0.5 block truncate">
                  {layer.description}
                </span>
              </div>

              {/* Toggle pill */}
              <span
                className={`w-7 h-4 rounded-full shrink-0 transition-colors duration-200 relative ${
                  isOn ? "bg-emerald-500" : "bg-stone-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isOn ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
