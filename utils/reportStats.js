export function calculateReportStats(reports) {
  const total      = reports.length;
  const pending    = reports.filter((r) => r.status === "pending").length;
  const assigned   = reports.filter((r) => r.status === "assigned").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const disposed   = reports.filter((r) => r.status === "disposed").length;
  const verified   = reports.filter((r) => r.status === "verified").length;
  const critical   = reports.filter((r) => r.severity === "critical" || r.health_risk).length;

  return { total, pending, assigned, inProgress, disposed, verified, critical };
}
