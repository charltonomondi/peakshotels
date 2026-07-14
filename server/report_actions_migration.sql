-- ============================================================
-- Report Actions — CEO/super_admin responses to dept reports
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.report_actions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id        UUID        NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  department       TEXT        NOT NULL,
  report_date      DATE        NOT NULL,
  action_type      TEXT        NOT NULL DEFAULT 'comment',
  comment          TEXT,
  scheduled_date   DATE,
  scheduled_time   TEXT,
  signed_off       BOOLEAN     NOT NULL DEFAULT false,
  actioned_by      UUID        REFERENCES public.staff_members(id) ON DELETE SET NULL,
  actioned_by_name TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_actions_write"       ON public.report_actions;
DROP POLICY IF EXISTS "report_actions_insert"      ON public.report_actions;
DROP POLICY IF EXISTS "report_actions_update"      ON public.report_actions;
DROP POLICY IF EXISTS "report_actions_read"        ON public.report_actions;

-- CEO and super_admin can INSERT
CREATE POLICY "report_actions_insert" ON public.report_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role IN ('ceo', 'super_admin')
        AND status = 'active'
    )
  );

-- CEO and super_admin can UPDATE
CREATE POLICY "report_actions_update" ON public.report_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role IN ('ceo', 'super_admin')
        AND status = 'active'
    )
  );

-- All active staff can READ
CREATE POLICY "report_actions_read" ON public.report_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_report_actions_report_id   ON public.report_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_actions_report_date ON public.report_actions(report_date);
CREATE INDEX IF NOT EXISTS idx_report_actions_dept_date   ON public.report_actions(department, report_date);
