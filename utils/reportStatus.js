/**
 * Derives the true operational status of a report from service_tasks.
 *
 * Priority: service_tasks.status > sanitation_reports.status
 *
 * Once a task exists, the task status is the source of truth.
 * sanitation_reports.status is only used when no active task exists.
 */
export function getDerivedStatus(report) {
  const task = report.report_assignments?.[0]?.service_tasks?.[0];

  // No task, or task was cancelled → fall back to report status
  if (!task || task.status === "cancelled") {
    return (report.status ?? "pending").toLowerCase();
  }

  // Task exists — task status wins
  switch (task.status) {
    case "pending":     return "offer_sent";   // worker hasn't accepted yet
    case "in_progress": return "in_progress";  // worker accepted, on the job
    case "completed":   return "completed";    // work done
    default:            return (report.status ?? "pending").toLowerCase();
  }
}

/**
 * Human-readable label for each derived status.
 */
export const STATUS_LABELS = {
  pending:     "Pending",
  assigned:    "Assigned",
  offer_sent:  "Offer Sent",
  in_progress: "In Progress",
  completed:   "Completed",
  resolved:    "Resolved",
  cancelled:   "Cancelled",
};

/**
 * Tailwind classes for each derived status badge.
 */
export const STATUS_COLORS = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  assigned:    "bg-blue-50 text-blue-700 border-blue-200",
  offer_sent:  "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  resolved:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:   "bg-red-50 text-red-700 border-red-200",
};
