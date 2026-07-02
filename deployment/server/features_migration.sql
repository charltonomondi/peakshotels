-- ============================================================
-- PEAKS HOTEL — FEATURES MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- mountain_bookings
CREATE TABLE IF NOT EXISTS public.mountain_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  climb_date        DATE NOT NULL,
  group_size        TEXT NOT NULL DEFAULT '1',
  package           TEXT NOT NULL DEFAULT 'Weekend Summit',
  experience        TEXT NOT NULL DEFAULT 'beginner',
  special_requests  TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  amount_paid       NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_ref   TEXT,
  mpesa_checkout_id TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mountain_bookings ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS mountain_bookings_updated ON public.mountain_bookings;
CREATE TRIGGER mountain_bookings_updated BEFORE UPDATE ON public.mountain_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "mountain public insert" ON public.mountain_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "mountain public select" ON public.mountain_bookings FOR SELECT USING (true);
CREATE POLICY "mountain staff all"     ON public.mountain_bookings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- guest_reviews
CREATE TABLE IF NOT EXISTS public.guest_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS guest_reviews_updated ON public.guest_reviews;
CREATE TRIGGER guest_reviews_updated BEFORE UPDATE ON public.guest_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "reviews public insert" ON public.guest_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews staff all"     ON public.guest_reviews FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- loyalty_members (idempotent)
CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  points       INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  tier         TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze','Silver','Gold')),
  member_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty self read"    ON public.loyalty_members FOR SELECT    TO authenticated USING (user_id = auth.uid());
CREATE POLICY "loyalty self insert"  ON public.loyalty_members FOR INSERT    TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "loyalty self update"  ON public.loyalty_members FOR UPDATE    TO authenticated USING (user_id = auth.uid());
CREATE POLICY "loyalty staff read"   ON public.loyalty_members FOR SELECT    TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "loyalty staff update" ON public.loyalty_members FOR UPDATE    TO authenticated USING (public.is_staff(auth.uid()));

-- loyalty_transactions (idempotent)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('earned','redeemed','bonus','expired')),
  points      INT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_tx self read" ON public.loyalty_transactions FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM public.loyalty_members WHERE user_id = auth.uid()));
CREATE POLICY "loyalty_tx staff all" ON public.loyalty_transactions FOR ALL   TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- lipa_members (idempotent)
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
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended')),
  member_since      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lipa_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lipa self read"   ON public.lipa_members FOR SELECT  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lipa self insert" ON public.lipa_members FOR INSERT  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "lipa self update" ON public.lipa_members FOR UPDATE  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lipa staff all"   ON public.lipa_members FOR ALL     TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- lipa_instalments (idempotent)
CREATE TABLE IF NOT EXISTS public.lipa_instalments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES public.lipa_members(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  booking_reference TEXT,
  room_number       TEXT,
  total_amount      NUMERIC(12,2) NOT NULL,
  deposit_paid      NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_remaining  NUMERIC(12,2) NOT NULL DEFAULT 0,
  instalment_plan   INT NOT NULL DEFAULT 2 CHECK (instalment_plan IN (2,3)),
  instalments_paid  INT NOT NULL DEFAULT 0,
  next_due_date     DATE,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','overdue','cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lipa_instalments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lipa_inst self read" ON public.lipa_instalments FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM public.lipa_members WHERE user_id = auth.uid()));
CREATE POLICY "lipa_inst staff all" ON public.lipa_instalments FOR ALL    TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
