import { SEVERITY_STYLES } from "./constants";

export function SeverityBadge({ severity }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full backdrop-blur-sm ${SEVERITY_STYLES[severity?.toLowerCase()] || "bg-gray-500/80 text-white"}`}>
      {severity}
    </span>
  );
}

export function WorkerInitials({ worker, size = "sm" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0`}>
      {(worker?.full_name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
