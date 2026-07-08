-- Daily Reports table
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  department TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entries JSONB NOT NULL DEFAULT '{}',  -- { "Date / Shift / HOD": "...", "Key KPI Figures": "...", ... }
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, report_date, department)
);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Staff can manage their own reports
CREATE POLICY "daily_reports_own" ON public.daily_reports
  FOR ALL USING (
    staff_id IN (SELECT id FROM public.staff_members WHERE user_id = auth.uid())
  );

-- Managers / admins / CEO can read all reports
CREATE POLICY "daily_reports_admin_read" ON public.daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
      AND role IN ('manager', 'super_admin', 'ceo')
      AND status = 'active'
    )
  );
