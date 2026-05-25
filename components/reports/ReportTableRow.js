<<<<<<< HEAD
import { Eye, Lock, MapPin, UserCheck, Clock, CheckCircle, ShieldCheck, Send, Loader2 } from "lucide-react";
=======
import { Eye, Lock, MapPin, User, ShieldAlert } from "lucide-react";
>>>>>>> feature/update
import { useRouter } from "next/navigation";

import { navigateTo } from "@/utils/navigateTo";
import { useDashboardView } from "@/context/DashboardViewContext";
import { getDerivedStatus } from "@/utils/reportStatus";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:     { Icon: Clock,      dot: "bg-yellow-400", bg: "bg-yellow-50",  border: "border-yellow-200", text: "text-yellow-700",  label: "Pending"     },
  assigned:    { Icon: UserCheck,  dot: "bg-blue-400",   bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",    label: "Assigned"    },
  offer_sent:  { Icon: Send,       dot: "bg-amber-400",  bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   label: "Offer Sent"  },
  in_progress: { Icon: Loader2,    dot: "bg-indigo-400", bg: "bg-indigo-50",  border: "border-indigo-200", text: "text-indigo-700",  label: "In Progress" },
  completed:   { Icon: ShieldCheck,dot: "bg-emerald-500",bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700", label: "Completed"   },
  resolved:    { Icon: ShieldCheck,dot: "bg-emerald-500",bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700", label: "Resolved"    },
  cancelled:   { Icon: Clock,      dot: "bg-red-400",    bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",     label: "Cancelled"   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const { Icon, dot, bg, border, text, label } = cfg;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${border} ${text}`}>
      {/* Animated dot for active states */}
      <span className="relative flex h-2 w-2 shrink-0">
        {(status === "in_progress" || status === "offer_sent") && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-60`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`} />
      </span>
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </span>
  );
}

// ─── Worker cell ──────────────────────────────────────────────────────────────

function getAssignment(report) {
  const assignment = (report.report_assignments || [])[0];
  if (!assignment) return null;
  const task = (assignment.service_tasks || [])[0];
  return { worker: assignment.worker, taskStatus: task?.status ?? null };
}

function WorkerCell({ report }) {
  const assignment = getAssignment(report);

  if (!assignment) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const { worker, taskStatus } = assignment;
  const name    = worker?.full_name ?? "Unknown";
  const initial = name.charAt(0).toUpperCase();

  const config =
    taskStatus === "completed"
      ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", Icon: ShieldCheck, iconColor: "text-emerald-500", label: "Completed"   }
      : taskStatus === "in_progress"
      ? { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  Icon: CheckCircle, iconColor: "text-indigo-500",  label: "In progress" }
      : taskStatus === "pending"
      ? { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   Icon: Clock,       iconColor: "text-amber-500",   label: "Offer sent"  }
      : { bg: "bg-gray-50",    text: "text-gray-600",    border: "border-gray-200",    Icon: UserCheck,   iconColor: "text-gray-400",    label: "Assigned"    };

  const { bg, text, border, Icon, iconColor, label } = config;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${bg} ${border} max-w-[160px]`}>
      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
        {initial}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold truncate ${text}`}>{name}</p>
        <div className={`flex items-center gap-0.5 ${iconColor}`}>
          <Icon className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px] font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

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

const FALLBACK_STYLE = "bg-gray-50 text-gray-600 border-gray-200";
const CELL = "px-5 py-3.5 border-r border-gray-300 last:border-r-0";

function RiskScoreBadge({ risk }) {
  if (!risk) return <span className="text-xs text-gray-300">—</span>;

  const { risk_score, priority_level, escalation_required } = risk;
  const cls = RISK_STYLES[priority_level] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
        <ShieldAlert className="w-3 h-3" />
        {risk_score}
      </span>
      {escalation_required && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Escalation required" />
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

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
        {worker.full_name?.charAt(0).toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{worker.full_name}</p>
        <p className={`text-[10px] font-medium ${WORKER_STATUS_COLOR[status] ?? "text-yellow-600"}`}>
          {status?.replace(/_/g, " ")}
        </p>
      </div>
    </div>
  );
}

export default function ReportTableRow({ report, profile, formatTimeAgo }) {
<<<<<<< HEAD
  const router   = useRouter();
  const dashCtx  = useDashboardView();
  const isInDashboard = !!dashCtx?.setView;
=======
  const router  = useRouter();
  const dashCtx = useDashboardView();
>>>>>>> feature/update

  const handleView = () => {
    if (dashCtx?.setView) {
      dashCtx.setView("reportDetail", { id: report.id });
    } else {
      router.push(`/reports/${report.id}`);
    }
  };

<<<<<<< HEAD
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-50 text-red-700 border-red-200";
      case "high":     return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":   return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":      return "bg-blue-50 text-blue-700 border-blue-200";
      default:         return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Derive the true status from service_tasks, not just report.status
  const derivedStatus = getDerivedStatus(report);

  const cell = "px-5 py-3.5 border-r border-gray-300 last:border-r-0";
=======
  const severityCls = SEVERITY_STYLES[report.severity?.toLowerCase()] ?? FALLBACK_STYLE;
  const statusCls   = STATUS_STYLES[report.status?.toLowerCase()]     ?? FALLBACK_STYLE;
>>>>>>> feature/update

  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50/60 transition-colors">
      <td className={`${CELL} whitespace-nowrap`}>
        <span className="text-emerald-600 font-mono text-xs font-semibold tracking-wide">
          {report.reference_id}
        </span>
      </td>

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

      <td className={`${CELL} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityCls}`}>
          {report.severity}
        </span>
      </td>

<<<<<<< HEAD
      {/* ── Derived status — reads from service_tasks first ─────── */}
      <td className={`${cell} whitespace-nowrap`}>
        <StatusBadge status={derivedStatus} />
      </td>

      {/* ── Assigned worker ──────────────────────────────────────── */}
      <td className={`${cell} whitespace-nowrap`}>
        <WorkerCell report={report} />
=======
      <td className={`${CELL} whitespace-nowrap`}>
        <RiskScoreBadge risk={report.risk} />
      </td>

      <td className={`${CELL} whitespace-nowrap`}>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCls}`}>
          {report.status?.replace(/_/g, " ")}
        </span>
>>>>>>> feature/update
      </td>

      <td className={CELL}>
        <WorkerCell worker={report.worker} status={report.status} />
      </td>

      <td className={`${CELL} whitespace-nowrap text-xs text-gray-400`}>
        {formatTimeAgo(report.created_at)}
      </td>

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
