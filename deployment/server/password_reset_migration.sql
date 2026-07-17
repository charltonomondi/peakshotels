-- ============================================================
-- Password Reset Tickets — run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  full_name   TEXT,
  department  TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending',   -- pending | approved | rejected | completed
  token       UUID        DEFAULT gen_random_uuid(),    -- one-time token for reset link
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actioned_at  TIMESTAMPTZ,
  actioned_by  TEXT
);

ALTER TABLE public.password_reset_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT a ticket (unauthenticated — they've forgotten their password)
DROP POLICY IF EXISTS "prt_insert" ON public.password_reset_tickets;
CREATE POLICY "prt_insert" ON public.password_reset_tickets
  FOR INSERT WITH CHECK (true);

-- super_admin can read and update all tickets
DROP POLICY IF EXISTS "prt_admin_all" ON public.password_reset_tickets;
CREATE POLICY "prt_admin_all" ON public.password_reset_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role = 'super_admin' AND status = 'active'
    )
  );

-- Token holder can read their own ticket (for the reset page)
DROP POLICY IF EXISTS "prt_token_read" ON public.password_reset_tickets;
CREATE POLICY "prt_token_read" ON public.password_reset_tickets
  FOR SELECT USING (true);   -- read by token is filtered in app code
