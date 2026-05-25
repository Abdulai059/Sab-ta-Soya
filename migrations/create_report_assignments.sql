-- ─────────────────────────────────────────────────────────────────────────────
-- report_assignments
-- Permanent audit log of every worker assignment on a sanitation report.
--
-- sanitation_reports.assigned_to  → current active worker (source of truth)
-- report_assignments              → full history, never deleted
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.report_assignments (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  report_id    uuid        NOT NULL,
  worker_id    uuid        NOT NULL,
  assigned_by  uuid        NOT NULL,
  status       text        NOT NULL DEFAULT 'pending',
  assigned_at  timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at  timestamp with time zone,
  rejected_at  timestamp with time zone,
  expired_at   timestamp with time zone,
  completed_at timestamp with time zone,
  notes        text,

  CONSTRAINT report_assignments_pkey
    PRIMARY KEY (id),

  CONSTRAINT report_assignments_report_id_fkey
    FOREIGN KEY (report_id)  REFERENCES public.sanitation_reports(id) ON DELETE CASCADE,

  CONSTRAINT report_assignments_worker_id_fkey
    FOREIGN KEY (worker_id)  REFERENCES public.profiles(id),

  CONSTRAINT report_assignments_assigned_by_fkey
    FOREIGN KEY (assigned_by) REFERENCES public.profiles(id),

  CONSTRAINT report_assignments_status_check
    CHECK (status = ANY (ARRAY['pending','accepted','rejected','expired','completed']))
);

-- Indexes
CREATE INDEX idx_report_assignments_report_id  ON public.report_assignments(report_id);
CREATE INDEX idx_report_assignments_worker_id  ON public.report_assignments(worker_id);
CREATE INDEX idx_report_assignments_status     ON public.report_assignments(status);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.report_assignments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read assignment history
CREATE POLICY "Authenticated users can view assignment history"
  ON public.report_assignments FOR SELECT
  TO authenticated
  USING (true);

-- Only admins / supervisors / district officers can insert (create assignments)
CREATE POLICY "Admins can create assignments"
  ON public.report_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'supervisor', 'district_officer')
    )
  );

-- Workers can update only their own assignment rows (accept / reject)
-- Admins can also update (for expiry / completion)
CREATE POLICY "Workers and admins can update assignments"
  ON public.report_assignments FOR UPDATE
  TO authenticated
  USING (
    worker_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'supervisor', 'district_officer')
    )
  );
