"use client";

export default function LocationSlugs({ locations, activeLocation, onSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
          Location Slugs
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {locations.map((loc) => {
          const isActive = activeLocation.id === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={[
                "relative w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 overflow-hidden group",
                isActive
                  ? "border-slate-300 bg-brand-primary shadow-lg translate-x-0.5"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:translate-x-0.5",
              ].join(" ")}
            >
              <span
                className="absolute left-0 top-2 bottom-2 w-0.75 rounded-r-full transition-opacity duration-200"
                style={{
                  background: loc.color,
                  opacity: isActive ? 1 : 0.4,
                }}
              />

              {/* Incident badge */}
              <span
                className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[12px] font-bold"
                style={{
                  background: `${loc.color}22`,
                  color: loc.color,
                  border: `1px solid ${loc.color}44`,
                }}
              >
                {loc.incidents}
              </span>

              <div className="pl-2">
                <div
                  className={`text-[14px] font-semibold leading-tight mb-0.5 transition-colors ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  {loc.name}
                </div>
                <div className="font-mono text-[11px] text-gray-400 truncate">
                  /{loc.slug}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
