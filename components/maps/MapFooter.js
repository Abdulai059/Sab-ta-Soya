"use client";

export default function MapFooter({ activeLocation }) {
  return (
    <footer className="h-10 sm:h-12 shrink-0 bg-white border-t border-gray-200 flex items-center justify-between px-3 sm:px-5 font-mono text-[8px] sm:text-[10px] text-gray-400 relative z-10">
      <span className="hidden md:inline">© 2026 MapSys</span>

      <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-initial justify-center md:justify-start">
        <span className="hidden lg:inline">Incident Monitoring Platform</span>
        <span className="text-gray-200 hidden lg:inline">|</span>
        <span className="truncate">
          <span className="hidden sm:inline">Zone: </span>
          <span className="font-bold" style={{ color: activeLocation.color }}>
            {activeLocation.name}
          </span>
        </span>
        <span className="text-gray-200 hidden xl:inline">|</span>
        <span className="hidden xl:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          All systems operational
        </span>
      </div>

      <span className="hidden md:inline">WR · GH</span>
    </footer>
  );
}
