-- Allow managers and super_admins to read ALL staff members (for approval panel)
CREATE POLICY "managers_read_all_staff" ON public.staff_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members AS me
      WHERE me.user_id = auth.uid()
        AND me.status = 'active'
        AND me.role IN ('manager', 'super_admin')
    )
  );

-- Allow managers and super_admins to update any staff member (approve/suspend)
CREATE POLICY "managers_update_staff" ON public.staff_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.staff_members AS me
      WHERE me.user_id = auth.uid()
        AND me.status = 'active'
        AND me.role IN ('manager', 'super_admin')
    )
  );
