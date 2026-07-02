-- ============================================================
-- PEAKS LOYALTY PROGRAM — ADD-ON MIGRATION
-- Run this in Supabase SQL Editor if loyalty tables are missing
-- ============================================================

-- Loyalty members (linked to Supabase auth users)
CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  points        INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  tier          TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
  member_since  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER loyalty_updated
  BEFORE UPDATE ON public.loyalty_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS policies
CREATE POLICY "loyalty self read"   ON public.loyalty_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "loyalty self insert" ON public.loyalty_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "loyalty self update" ON public.loyalty_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "loyalty staff read"  ON public.loyalty_members FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired')),
  points      INT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_tx self read"   ON public.loyalty_transactions FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.loyalty_members WHERE user_id = auth.uid()));
CREATE POLICY "loyalty_tx self insert" ON public.loyalty_transactions FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.loyalty_members WHERE user_id = auth.uid()));
CREATE POLICY "loyalty_tx staff read"  ON public.loyalty_transactions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Auto-update tier when points change
CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.points >= 5000 THEN 'Gold'
    WHEN NEW.points >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER loyalty_tier_update
  BEFORE UPDATE OF points ON public.loyalty_members
  FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_tier();

-- Add loyalty columns to bookings if not already there
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS loyalty_member_id UUID REFERENCES public.loyalty_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS loyalty_points_earned INT DEFAULT 0;

-- ============================================================
-- FIX: Auto-create loyalty_member on auth signup via trigger
-- This avoids the RLS race condition where auth.uid() is null
-- immediately after signUp() before the session is established
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_loyalty_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.loyalty_members (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists to allow re-running safely
DROP TRIGGER IF EXISTS on_auth_user_created_loyalty ON auth.users;

CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_loyalty_member();
