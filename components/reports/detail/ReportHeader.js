const SEVERITY_STYLES = {
  critical: "bg-red-500 text-white",
  high:     "bg-orange-500 text-white",
  medium:   "bg-yellow-500 text-white",
  low:      "bg-blue-500 text-white",
};

const STATUS_STYLES = {
  pending:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned:    "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  disposed:    "bg-orange-100 text-orange-800 border-orange-200",
  verified:    "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled:   "bg-red-100 text-red-800 border-red-200",
};

export default function ReportHeader({ report }) {
  const severityCls = SEVERITY_STYLES[report.severity?.toLowerCase()] ?? "bg-gray-500 text-white";
  const statusCls   = STATUS_STYLES[report.status?.toLowerCase()]     ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-emerald-600 font-mono text-sm font-medium">
            {report.reference_id}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityCls}`}>
            {report.severity}
          </span>
          {report.health_risk && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
              Health Risk
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.issue_type}</h1>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusCls}`}>
        {report.status?.replace(/_/g, " ")}
      </span>
    </div>
  );
}
