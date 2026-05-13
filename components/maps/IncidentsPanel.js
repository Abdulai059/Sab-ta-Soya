"use client";

const severityConfig = {
  high: {
    dot: "#ff4444",
    bg: "rgba(255,68,68,0.06)",
    border: "rgba(255,68,68,0.18)",
    label: "HIGH",
    labelColor: "#ff4444",
  },
  medium: {
    dot: "#ffaa00",
    bg: "rgba(255,170,0,0.06)",
    border: "rgba(255,170,0,0.18)",
    label: "MED",
    labelColor: "#ffaa00",
  },
  low: {
    dot: "#00cc66",
    bg: "rgba(0,204,102,0.06)",
    border: "rgba(0,204,102,0.18)",
    label: "LOW",
    labelColor: "#00cc66",
  },
};

export default function IncidentsPanel({
  incidents,
  locations,
  onSelectLocation,
}) {
  function handleClick(inc) {
    const loc = locations.find((l) => l.id === inc.locationId);
    if (loc) onSelectLocation(loc);
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Label */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-mono text-sm tracking-[0.22em] uppercase text-gray-900">
          Recent Incidence
        </span>
        <span className="font-mono text-[9px] text-rose-500 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5">
          {incidents.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 p-3 flex-1 sh">
        {incidents.map((inc) => {
          const s = severityConfig[inc.severity];
          return (
            <button
              key={inc.id}
              onClick={() => handleClick(inc)}
              className="w-full text-left rounded-lg border shadow-sm p-3 transition-all duration-150 hover:-translate-x-0.5 hover:brightness-95 cursor-pointer"
              style={{ background: s.bg, borderColor: s.border }}
            >
              {/* Top row */}
              <div className="flex items-start gap-2 mb-1.5">
                <span className="mt-0.5 relative flex h-2 w-2 shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                    style={{ background: s.dot }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: s.dot }}
                  />
                </span>
                <span className="text-[15px] font-semibold text-gray-500 leading-tight flex-1">
                  {inc.title}
                </span>
                <span
                  className="font-mono text-[9px] font-semibold shrink-0 mt-0.5"
                  style={{ color: s.labelColor }}
                >
                  {s.label}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between pl-4">
                <span className="font-mono text-[13px] text-gray-500 truncate max-w-25">
                  {inc.location}
                </span>
                <span className="font-mono text-[13px] text-gray-500">
                  {inc.time}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
