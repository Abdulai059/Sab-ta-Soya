import { Eye } from "lucide-react";
import { timeAgoLabel } from "./utils";

export default function WorkerRow({ worker, max, onViewCases }) {
  const pct = max > 0 ? Math.round((worker.cases / max) * 100) : 0;
  const time = timeAgoLabel(worker.lastResolved);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: worker.color + "22", color: worker.color }}
      >
        {worker.initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{worker.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 capitalize">{worker.role}</span>
          {time && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">last resolved {time}</span>
            </>
          )}
        </div>
      </div>

      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: worker.color + "18", color: worker.color }}
      >
        {worker.cases} {worker.cases === 1 ? "case resolved" : "cases"}
      </span>

      {/* <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: worker.color }}
        />
      </div> */}

      <button
        onClick={() => onViewCases(worker)}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2.5 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-50 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>
    </div>
  );
}
