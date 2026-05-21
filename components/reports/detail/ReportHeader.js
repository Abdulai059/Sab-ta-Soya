export default function ReportHeader({ report }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-emerald-600 font-mono text-sm font-medium">
            {report.reference_id}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
              report.severity
            )}`}
          >
            {report.severity}
          </span>
          {report.health_risk && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
              Health Risk
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {report.issue_type}
        </h1>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
          report.status
        )}`}
      >
        {report.status}
      </span>
    </div>
  );
}
