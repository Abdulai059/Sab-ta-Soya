import { Eye, Lock, MapPin, User, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/utils/navigateTo";
import { useDashboardView } from "@/context/DashboardViewContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high:     "bg-orange-50 text-orange-700 border-orange-200",
  medium:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  low:      "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_STYLES = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  assigned:    "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  disposed:    "bg-orange-50 text-orange-700 border-orange-200",
  verified:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:   "bg-red-50 text-red-700 border-red-200",
};

const RISK_STYLES = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-blue-100 text-blue-700 border-blue-200",
};

const WORKER_STATUS_COLOR = {
  in_progress: "text-blue-600",
  disposed:    "text-orange-600",
  verified:    "text-emerald-600",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskScoreBadge({ risk }) {
  if (!risk) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const { risk_score, priority_level, escalation_required } = risk;
  const cls = RISK_STYLES[priority_level] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
        <ShieldAlert className="w-3 h-3" />
        {risk_score}
      </span>
      {escalation_required && (
        <span
          className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
          title="Escalation required"
        />
      )}
    </div>
  );
}

function WorkerCell({ worker, status }) {
  if (!worker) {
    return (
      <div className="flex items-center gap-1.5 text-gray-400">
        <User className="w-3.5 h-3.5" />
        <span className="text-xs">Unassigned</span>
      </div>
    );
  }

  const statusColor = WORKER_STATUS_COLOR[status] ?? "text-yellow-600";

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
        {worker.full_name?.charAt(0).toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{worker.full_name}</p>
        <p className={`text-[10px] font-medium ${statusColor}`}>
          {status?.replace(/_/g, " ")}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CELL = "px-5 py-3.5 border-r border-gray-300 last:border-r-0";

export default function ReportTableRow({ report, profile, formatTimeAgo }) {
  const router   = useRouter();
  const dashCtx  = useDashboardView();
  const isInDash = !!dashCtx?.setView;

  const handleView = () => {
    if (isInDash) {
      dashCtx.setView("reportDetail", { id: report.id });
    } else {
      router.push(`/reports/${report.id}`);
    }
  };

  const severityCls = SEVERITY_STYLES[report.severity?.toLowerCase()] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const statusCls   = STATUS_STYLES[report.status?.toLowerCase()]     ?? "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50/60 transition-colors">

      {/* Ref ID */}
      <td className={`${CELL} whitespace-nowrap`}>
        <span className="text-emerald-600 font-mono text-xs font-semibold tracking-wide">
          {report.reference_id}
        </span>
      </td>

      {/* Issue / Location */}
      <td className={CELL}>
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

      {/* Severity */}
      <td className={`${CELL} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${severityCls}`}>
          {report.severity}
        </span>
      </td>

      {/* Risk score */}
      <td className={`${CELL} whitespace-nowrap`}>
        <RiskScoreBadge risk={report.risk} />
      </td>

      {/* Status */}
      <td className={`${CELL} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusCls}`}>
          {report.status?.replace(/_/g, " ")}
        </span>
      </td>

      {/* Assigned worker */}
      <td className={CELL}>
        <WorkerCell worker={report.worker} status={report.status} />
      </td>

      {/* Reported time */}
      <td className={`${CELL} whitespace-nowrap text-xs text-gray-400`}>
        {formatTimeAgo(report.created_at)}
      </td>

      {/* Location map link */}
      <td className={`${CELL} whitespace-nowrap`}>
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

      {/* Actions */}
      <td className={`${CELL} whitespace-nowrap`}>
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
