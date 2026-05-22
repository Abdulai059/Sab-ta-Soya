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
}
