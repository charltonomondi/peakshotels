-- ============================================================
-- LIPA MDOGO MDOGO — Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Lipa members table
CREATE TABLE IF NOT EXISTS public.lipa_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  id_number         TEXT,
  employer          TEXT,
  monthly_income    NUMERIC(12,2),
  credit_limit      NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_used      NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_available NUMERIC(12,2) GENERATED ALWAYS AS (credit_limit - balance_used) STORED,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  member_since      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lipa_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER lipa_members_updated
  BEFORE UPDATE ON public.lipa_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "lipa self read"   ON public.lipa_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lipa self insert" ON public.lipa_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "lipa self update" ON public.lipa_members FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lipa staff read"  ON public.lipa_members FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "lipa staff update" ON public.lipa_members FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- Instalment plans linked to bookings
CREATE TABLE IF NOT EXISTS public.lipa_instalments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES public.lipa_members(id) ON DELETE CASCADE,
  booking_id          UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  booking_reference   TEXT,
  room_number         TEXT,
  total_amount        NUMERIC(12,2) NOT NULL,
  deposit_paid        NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_remaining    NUMERIC(12,2) NOT NULL DEFAULT 0,
  instalment_plan     INT NOT NULL DEFAULT 2 CHECK (instalment_plan IN (2, 3)),
  instalments_paid    INT NOT NULL DEFAULT 0,
  next_due_date       DATE,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lipa_instalments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER lipa_instalments_updated
  BEFORE UPDATE ON public.lipa_instalments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "lipa_inst self read" ON public.lipa_instalments FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.lipa_members WHERE user_id = auth.uid()));
CREATE POLICY "lipa_inst staff all" ON public.lipa_instalments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Auto-create lipa_member record on signup
CREATE OR REPLACE FUNCTION public.handle_new_lipa_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.lipa_members (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_lipa ON auth.users;

CREATE TRIGGER on_auth_user_created_lipa
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_lipa_member();
