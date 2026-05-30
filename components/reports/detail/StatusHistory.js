import { Clock, CheckCircle, AlertCircle, Loader, UserCheck } from "lucide-react";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     icon: Clock,        dot: "bg-yellow-400", text: "text-yellow-700" },
  assigned:    { label: "Assigned",    icon: UserCheck,    dot: "bg-blue-400",   text: "text-blue-700"   },
  in_progress: { label: "In Progress", icon: Loader,       dot: "bg-indigo-400", text: "text-indigo-700" },
  completed:   { label: "Completed",   icon: CheckCircle,  dot: "bg-emerald-500",text: "text-emerald-700"},
  resolved:    { label: "Resolved",    icon: CheckCircle,  dot: "bg-emerald-500",text: "text-emerald-700"},
  cancelled:   { label: "Cancelled",   icon: AlertCircle,  dot: "bg-red-400",    text: "text-red-700"    },
};

function fmt(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function StatusHistory({ history }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        Status History
      </h2>

      {!history || history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          No status changes recorded yet
        </p>
      ) : (
        <div className="space-y-0">
          {history.map((item, i) => {
            const cfg = STATUS_CONFIG[item.new_status?.toLowerCase()] ?? {
              dot: "bg-gray-400", text: "text-gray-600",
            };
            const isLast = i === history.length - 1;

            return (
              <div key={item.id} className="flex gap-3">
                {/* Dot + connector line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                </div>

                {/* Content */}
                <div className="pb-4 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.old_status && (
                      <span className="text-xs text-gray-400 capitalize">
                        {item.old_status.replace(/_/g, " ")}
                      </span>
                    )}
                    {item.old_status && (
                      <span className="text-gray-300 text-xs">→</span>
                    )}
                    <span className={`text-xs font-semibold capitalize ${cfg.text}`}>
                      {item.new_status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-0.5">{fmt(item.changed_at)}</p>

                  {item.changed_by_profile && (
                    <p className="text-[11px] text-gray-400">
                      by {item.changed_by_profile.full_name}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
