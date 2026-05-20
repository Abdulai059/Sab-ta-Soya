import { Eye, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportTableRow({ report, profile, formatTimeAgo }) {
  const router = useRouter();

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
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-emerald-600 font-mono text-sm font-medium">
          {report.reference_id}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900  text-sm mb-1">
          {report.issue_type}
          {report.location?.name && ` — ${report.location.name}`}
        </div>
        <div className="text-gray-500 text-sm">
          {report.community?.name} · {report.community?.district}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 rounded-sm text-xs  ${getSeverityColor(
            report.severity
          )}`}
        >
          {report.severity}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-0.5 rounded-sm text-xs  border ${getStatusColor(
            report.status
          )}`}
        >
          {report.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
        {formatTimeAgo(report.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/reports/${report.id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          {!profile && (
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign in to take action"
            >
              <Lock className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
