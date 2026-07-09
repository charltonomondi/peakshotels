-- ============================================================
-- Calendar / Schedule migration
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create staff_meetings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff_meetings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  event_type  TEXT        NOT NULL DEFAULT 'meeting',
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  location    TEXT,
  notes       TEXT,
  created_by  UUID        REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add event_type column if table already existed without it
ALTER TABLE public.staff_meetings
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'meeting';

-- 3. Enable RLS
ALTER TABLE public.staff_meetings ENABLE ROW LEVEL SECURITY;

-- 4. Policies — all active staff can read
DROP POLICY IF EXISTS "meetings_read_all"   ON public.staff_meetings;
DROP POLICY IF EXISTS "meetings_write_fo"   ON public.staff_meetings;
DROP POLICY IF EXISTS "meetings_delete_fo"  ON public.staff_meetings;

CREATE POLICY "meetings_read_all" ON public.staff_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Front Office (receptionist) + admins can insert
CREATE POLICY "meetings_write_fo" ON public.staff_meetings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('receptionist', 'manager', 'super_admin', 'ceo')
    )
  );

-- Front Office + admins can delete
CREATE POLICY "meetings_delete_fo" ON public.staff_meetings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('receptionist', 'manager', 'super_admin', 'ceo')
    )
  );

-- 5. Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_staff_meetings_start
  ON public.staff_meetings(start_time);
