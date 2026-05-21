export function calculateReportStats(reports) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const assigned = reports.filter((r) => r.status === "assigned").length;
  const resolved = reports.filter((r) => r.status === "completed").length;
  const critical = reports.filter(
    (r) => r.severity === "critical" || r.health_risk,
  ).length;

  return { total, pending, assigned, resolved, critical };
}
