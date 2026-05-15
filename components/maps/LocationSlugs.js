"use client";

/**
 * LocationSlugs — desktop sidebar listing all infrastructure locations.
 * Shows the location's primary image (from location_images table) when available,
 * with a styled placeholder fallback when no image exists.
 *
 * @param {Array}    locations       - Location objects (include imageUrl, imageCaption)
 * @param {Object}   activeLocation  - Currently selected location
 * @param {Function} onSelect        - Callback when a location is clicked
 */
export default function LocationSlugs({ locations, activeLocation, onSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
        <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
          Locations
        </span>
        <span className="ml-2 font-mono text-[10px] text-gray-400">
          {locations.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {locations.map((loc) => {
          const isActive = activeLocation?.id === loc.id;

          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={[
                "relative w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group",
                isActive
                  ? "border-slate-300 bg-brand-primary shadow-md translate-x-0.5"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:translate-x-0.5",
              ].join(" ")}
            >
              {/* ── Image area ── */}
              <div className="relative w-full h-28 overflow-hidden bg-stone-100">
                {loc.imageUrl ? (
                  <ImageWithFallback loc={loc} />
                ) : (
                  <LocationPlaceholder loc={loc} />
                )}

                {/* Incident badge — top right over image */}
                <span
                  className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-sm z-10"
                  style={{
                    background: loc.incidents === 0 ? "rgba(0,204,102,0.9)" : `${loc.color}ee`,
                    color: "#fff",
                  }}
                >
                  {loc.incidents}
                </span>

                {/* Image count badge — bottom left */}
                {loc.imageCount > 1 && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm z-10">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {loc.imageCount}
                  </span>
                )}

                {/* Active left accent bar */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-opacity duration-200 z-10"
                  style={{
                    background: loc.color,
                    opacity: isActive ? 1 : 0,
                  }}
                />
              </div>

              {/* ── Text area ── */}
              <div className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[13px] font-semibold leading-tight transition-colors ${
                      isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {loc.name}
                  </span>

                  {/* Status dot */}
                  <span
                    className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
                      loc.status === "operational"
                        ? "bg-emerald-500"
                        : loc.status === "maintenance"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                    title={loc.status}
                  />
                </div>

                <div className="font-mono text-[10px] text-gray-400 truncate">
                  {loc.type && <span className="capitalize">{loc.type}</span>}
                  {loc.communityName && <span> · {loc.communityName}</span>}
                </div>
              </div>
            </button>
          );
        })}

        {locations.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-stone-300 gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-xs text-stone-400">No locations found</p>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Image with error fallback ───────────────────────────────────────────────── */
function ImageWithFallback({ loc }) {
  return (
    <div className="relative w-full h-full">
      <img
        src={loc.imageUrl}
        alt={loc.imageCaption || loc.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // Replace broken image with placeholder
          e.currentTarget.parentElement.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:${loc.color}18">
              <div style="width:40px;height:40px;border-radius:12px;background:${loc.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">
                ${loc.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
              <span style="font-family:monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:${loc.color}">No Image</span>
            </div>`;
        }}
      />
      {loc.imageCaption && (
        <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] px-2 py-1 truncate backdrop-blur-sm">
          {loc.imageCaption}
        </div>
      )}
    </div>
  );
}

/* ── Placeholder shown when a location has no image ─────────────────────────── */
function LocationPlaceholder({ loc }) {
  const initials = loc.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1.5"
      style={{ background: `${loc.color}18` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
        style={{ background: loc.color }}
      >
        {initials}
      </div>
      <span
        className="font-mono text-[9px] tracking-widest uppercase"
        style={{ color: loc.color }}
      >
        No Image
      </span>
    </div>
  );
}
