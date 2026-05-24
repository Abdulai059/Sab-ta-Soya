"use client";

import { supabase } from "./supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_BASE_SCORE = {
  low:      5,
  medium:  15,
  high:    30,
  critical: 50,
};

const CHILDREN_SCORE_CAP = 20;
const BATCH_SIZE = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeRiskScore(severity, affectedCount) {
  const base     = SEVERITY_BASE_SCORE[severity?.toLowerCase()] ?? 5;
  const children = Math.min((affectedCount ?? 0) * 2, CHILDREN_SCORE_CAP);
  return base + children;
}

function computePriorityLevel(score) {
  if (score >= 50) return "critical";
  if (score >= 30) return "high";
  if (score >= 15) return "medium";
  return "low";
}

function buildAssessmentRow(report) {
  const score = computeRiskScore(report.severity, report.affected_people_count);
  return {
    report_id:               report.id,
    risk_score:              score,
    priority_level:          computePriorityLevel(score),
    near_school:             false,
    near_water_source:       false,
    flood_zone:              false,
    drought_zone:            false,
    repeated_incident:       false,
    affected_children_count: report.affected_people_count ?? 0,
    escalation_required:     score >= 50,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Backfills risk_assessments for any sanitation_report that doesn't have one.
 * Safe to call on every page load — skips reports that already have a row.
 */
export async function backfillRiskAssessments() {
  const [{ data: reports, error: reportsError }, { data: existing }] = await Promise.all([
    supabase
      .from("sanitation_reports")
      .select("id, severity, affected_people_count"),
    supabase
      .from("risk_assessments")
      .select("report_id"),
  ]);

  if (reportsError) {
    console.warn("[backfill] failed to fetch reports:", reportsError.message);
    return;
  }

  if (!reports?.length) return;

  const existingIds = new Set((existing ?? []).map((r) => r.report_id));
  const missing     = reports.filter((r) => !existingIds.has(r.id));

  if (!missing.length) return;

  console.log(`[backfill] inserting risk assessments for ${missing.length} reports`);

  const rows = missing.map(buildAssessmentRow);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const { error } = await supabase
      .from("risk_assessments")
      .insert(rows.slice(i, i + BATCH_SIZE));

    if (error) console.error("[backfill] batch insert error:", error.message);
  }
}
