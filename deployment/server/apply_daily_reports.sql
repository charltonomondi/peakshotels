-- ============================================================
-- DAILY REPORTS TABLE — paste entire file into Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_reports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID        NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  department    TEXT        NOT NULL,
  report_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  entries       JSONB       NOT NULL DEFAULT '{}',
  submitted     BOOLEAN     NOT NULL DEFAULT false,
  submitted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, report_date, department)
);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_reports_own"        ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_admin_read" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_insert_own" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_update_own" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_select_own" ON public.daily_reports;

CREATE POLICY "daily_reports_insert_own" ON public.daily_reports
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT id FROM public.staff_members WHERE user_id = auth.uid())
  );

CREATE POLICY "daily_reports_update_own" ON public.daily_reports
  FOR UPDATE USING (
    staff_id IN (SELECT id FROM public.staff_members WHERE user_id = auth.uid())
  );

CREATE POLICY "daily_reports_select_own" ON public.daily_reports
  FOR SELECT USING (
    staff_id IN (SELECT id FROM public.staff_members WHERE user_id = auth.uid())
  );

CREATE POLICY "daily_reports_admin_read" ON public.daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role IN ('manager', 'super_admin', 'ceo')
        AND status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_daily_reports_staff_date ON public.daily_reports(staff_id, report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date_dept  ON public.daily_reports(report_date, department);
