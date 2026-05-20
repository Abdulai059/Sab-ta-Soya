/**
 * MapLoadingScreen — animated splash shown while map data is being fetched.
 */
export default function MapLoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6 animate-scale-in">
        <div className="relative flex items-center justify-center w-20 h-20">
          <span
            className="absolute inset-0 rounded-sm "
            style={{ animation: "radarPulse 2s ease-out infinite" }}
          />
          <span
            className="absolute inset-2 rounded-sm"
            style={{ animation: "radarPulse 2s ease-out 0.4s infinite" }}
          />

          <div className="w-14 h-14 rounded-sm bg-brand-primary flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg
              className="w-7 h-7 text-white"
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
          </div>
        </div>

        <div
          className="text-center animate-slide-in-bottom"
          style={{ animationDelay: "100ms" }}
        >
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Sab'ta<span className="text-emerald-600">Soya</span>
          </h1>
          <p className="font-mono text-[11px] tracking-[0.2em] text-stone-400 uppercase mt-0.5">
            Sanitation GIS
          </p>
        </div>

        <div
          className="w-48 h-0.5 bg-stone-100 rounded-full overflow-hidden animate-slide-in-bottom"
          style={{ animationDelay: "200ms" }}
        >
          <div
            className="h-full bg-brand-primary rounded-sm text-gray-950"
            style={{
              animation: "shimmer 1.6s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        <p
          className="font-mono text-[11px] text-stone-400 animate-slide-in-bottom"
          style={{ animationDelay: "300ms" }}
        >
          Loading map data…
        </p>
      </div>
    </div>
  );
}
