"use client";

const roleColors = {
  admin:            { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  district_officer: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  operator:         { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
  response_team:    { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"    },
  ngo:              { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  visitor:          { bg: "bg-stone-50",   text: "text-stone-600",   border: "border-stone-200"  },
};

function RoleBadge({ role }) {
  const c = roleColors[role] ?? roleColors.visitor;
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
      {role?.replace("_", " ")}
    </span>
  );
}

export default function LiveTrackingPanel({
  workers,
  isTracking,
  onStartTracking,
  onStopTracking,
  onSelectWorker,
  currentUserId,
}) {
  const moving = workers.filter((w) => w.isMoving).length;
  const isLoggedIn = !!currentUserId;

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs tracking-[0.22em] uppercase text-gray-900">
            Field Workers
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-gray-500">{workers.length} active</span>
          </div>
        </div>

        {/* Start / Stop own tracking */}
        {isLoggedIn ? (
          <button
            onClick={isTracking ? onStopTracking : onStartTracking}
            className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isTracking
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isTracking ? (
              <>
                <span className="w-2 h-2 rounded-sm bg-white/80" />
                Stop Sharing Location
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Share My Location
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-blue-900 mb-0.5">Login Required</p>
                  <p className="text-[10px] text-blue-700 leading-tight">
                    You can view field workers. Login to share your location.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/login"}
              className="w-full py-2 px-3 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login to Track
            </button>
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 shrink-0">
        <div className="py-2.5 text-center">
          <div className="text-lg font-bold text-stone-800">{workers.length}</div>
          <div className="font-mono text-[9px] text-stone-400 uppercase tracking-wide">Total</div>
        </div>
        <div className="py-2.5 text-center">
          <div className="text-lg font-bold text-emerald-600">{moving}</div>
          <div className="font-mono text-[9px] text-stone-400 uppercase tracking-wide">Moving</div>
        </div>
      </div>

      {/* Worker list */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        {workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-300 gap-2 py-8">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-xs text-stone-400 text-center">No active field workers</p>
          </div>
        ) : (
          workers.map((worker) => {
            const isMe = worker.id === currentUserId;
            return (
              <button
                key={worker.id}
                onClick={() => onSelectWorker(worker)}
                className="w-full text-left p-2.5 rounded-lg border border-stone-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-semibold text-stone-800 truncate">
                        {worker.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                          YOU
                        </span>
                      )}
                    </div>
                    <RoleBadge role={worker.role} />
                  </div>

                  {/* Moving indicator */}
                  <div className="shrink-0 mt-0.5">
                    {worker.isMoving ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Moving
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-stone-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        Still
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>{worker.lastSeen}</span>
                  {worker.speed > 0.5 && (
                    <span>{(worker.speed * 3.6).toFixed(1)} km/h</span>
                  )}
                </div>

                {/* Coords */}
                <div className="mt-1.5 pt-1.5 border-t border-stone-50 font-mono text-[9px] text-stone-300 truncate">
                  {worker.coords[0].toFixed(5)}, {worker.coords[1].toFixed(5)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
