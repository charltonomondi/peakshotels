-- Fix RLS for staff_members to allow signup insert
-- The issue: after signUp(), if email confirmation is ON, no session exists
-- so auth.uid() is NULL and the INSERT fails.

-- Drop the old restrictive insert policy
DROP POLICY IF EXISTS "staff_insert_own" ON public.staff_members;

-- New policy: allow insert if the row's user_id matches the authenticated user
-- This works when signUp returns a session (email confirmation disabled)
CREATE POLICY "staff_insert_own" ON public.staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also allow update of own record (for profile updates)
DROP POLICY IF EXISTS "staff_update_own" ON public.staff_members;
CREATE POLICY "staff_update_own" ON public.staff_members
  FOR UPDATE USING (auth.uid() = user_id);

-- If you have email confirmation enabled in Supabase Auth settings,
-- DISABLE it: Supabase Dashboard → Auth → Settings → "Enable email confirmations" → OFF
-- This allows signUp to return a session immediately, making auth.uid() available.
