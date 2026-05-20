import { Clock } from "lucide-react";

export default function StatusHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Status History
      </h2>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-0"
          >
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {item.old_status} → {item.new_status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.changed_at).toLocaleString()}
              </p>
              {item.changed_by_profile && (
                <p className="text-xs text-gray-500">
                  by {item.changed_by_profile.full_name}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-gray-700 mt-1">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
