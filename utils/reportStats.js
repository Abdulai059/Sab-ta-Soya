<<<<<<< HEAD
import { getDerivedStatus } from "@/utils/reportStatus";

export function calculateReportStats(reports) {
  const total = reports.length;

  const pending    = reports.filter((r) => getDerivedStatus(r) === "pending").length;
  const offerSent  = reports.filter((r) => getDerivedStatus(r) === "offer_sent").length;
  const inProgress = reports.filter((r) => getDerivedStatus(r) === "in_progress").length;
  const resolved   = reports.filter((r) =>
    ["completed", "resolved"].includes(getDerivedStatus(r))
  ).length;
  const critical   = reports.filter(
    (r) => r.severity?.toLowerCase() === "critical" || r.health_risk
  ).length;

  return { total, pending, offerSent, inProgress, resolved, critical };
=======
// New workflow: pending → assigned → in_progress → disposed → verified
export function calculateReportStats(reports) {
  const total      = reports.length;
  const pending    = reports.filter((r) => r.status === "pending").length;
  const assigned   = reports.filter((r) => r.status === "assigned").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const disposed   = reports.filter((r) => r.status === "disposed").length;
  const verified   = reports.filter((r) => r.status === "verified").length;
  const critical   = reports.filter((r) => r.severity === "critical" || r.health_risk).length;

  return { total, pending, assigned, inProgress, disposed, verified, critical };
>>>>>>> feature/update
}
