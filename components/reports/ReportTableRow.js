import { Eye, Lock, MapPin, User, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/utils/navigateTo";
import { useDashboardView } from "@/context/DashboardViewContext";

function RiskScoreBadge({ risk }) {
  if (!risk) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const { risk_score, priority_level, escalation_required } = risk;

  const colors = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high:     "bg-orange-100 text-orange-700 border-orange-200",
    medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    low:      "bg-blue-100 text-blue-700 border-blue-200",
  };

  const cls = colors[priority_level] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
        <ShieldAlert className="w-3 h-3" />
        {risk_score}
      </span>
      {escalation_required && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Escalation required" />
      )}
    </div>
  );
}

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
      case "pending":     return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "assigned":    return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_progress": return "bg-purple-50 text-purple-700 border-purple-200";
      case "disposed":    return "bg-orange-50 text-orange-700 border-orange-200";
      case "verified":    return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":   return "bg-red-50 text-red-700 border-red-200";
      default:            return "bg-gray-50 text-gray-600 border-gray-200";
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
        <RiskScoreBadge risk={report.risk} />
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(report.status)}`}>
          {report.status?.replace(/_/g, " ")}
        </span>
      </td>

      <td className={cell}>
        {report.worker ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
              {report.worker.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{report.worker.full_name}</p>
              <p className={`text-[10px] font-medium ${
                report.status === "in_progress" ? "text-blue-600"
                : report.status === "disposed"  ? "text-orange-600"
                : report.status === "verified"  ? "text-emerald-600"
                : "text-yellow-600"
              }`}>
                {report.status?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400">
            <User className="w-3.5 h-3.5" />
            <span className="text-xs">Unassigned</span>
          </div>
        )}
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
