-- ============================================================
-- Run in Supabase SQL Editor
-- 1. Promotes your account to super_admin
-- 2. Adds delete policy on daily_reports for super_admin
-- ============================================================

-- Replace 'your@email.com' with your actual login email
UPDATE public.staff_members
SET role = 'super_admin', status = 'active'
WHERE email = 'your@email.com';

-- Allow super_admin to delete any daily report
DROP POLICY IF EXISTS "daily_reports_superadmin_delete" ON public.daily_reports;
CREATE POLICY "daily_reports_superadmin_delete" ON public.daily_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
    )
  );

-- Allow super_admin to delete staff members
DROP POLICY IF EXISTS "staff_superadmin_delete" ON public.staff_members;
CREATE POLICY "staff_superadmin_delete" ON public.staff_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.staff_members
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
    )
  );
