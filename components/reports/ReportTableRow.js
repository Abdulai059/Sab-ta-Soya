import { Eye, Lock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/utils/navigateTo";
import { useDashboardView } from "@/context/DashboardViewContext";

export default function ReportTableRow({ report, profile, formatTimeAgo }) {
  const router = useRouter();
  const dashCtx = useDashboardView();
  const isInDashboard = !!dashCtx?.setView;

  const handleView = () => {
    if (isInDashboard) {
      dashCtx.setView("reportDetail", { id: report.id });
    } else {
      router.push(`/reports/${report.id}`);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-50 text-red-700 border-red-200";
      case "high":     return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":   return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":      return "bg-blue-50 text-blue-700 border-blue-200";
      default:         return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":   return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "assigned":  return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default:          return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const cell = "px-5 py-3.5 border-r border-gray-300 last:border-r-0";

  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50/60 transition-colors">

      <td className={`${cell} whitespace-nowrap`}>
        <span className="text-emerald-600 font-mono text-xs font-semibold tracking-wide">
          {report.reference_id}
        </span>
      </td>

      <td className={cell}>
        <p className="text-sm text-gray-800 font-medium leading-snug">
          {report.issue_type}
          {report.location?.name && (
            <span className="text-gray-400 font-normal"> — {report.location.name}</span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {report.community?.name} · {report.community?.district}
        </p>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${getSeverityColor(report.severity)}`}>
          {report.severity}
        </span>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </td>

      <td className={`${cell} whitespace-nowrap text-xs text-gray-400`}>
        {formatTimeAgo(report.created_at)}
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        {report.location?.latitude && report.location?.longitude ? (
          <button
            onClick={() => navigateTo(report.location.latitude, report.location.longitude)}
            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
            title="Open in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            Open map
          </button>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleView}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            title="View details"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
          </button>
          {!profile && (
            <button
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              title="Sign in to take action"
            >
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </td>

    </tr>
  );
}