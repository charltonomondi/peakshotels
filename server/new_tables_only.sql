-- ============================================================
-- Run this in Supabase SQL Editor
-- Only creates the NEW tables (mountain_bookings, guest_reviews)
-- Skips loyalty/lipa which already exist
-- ============================================================

-- ── MOUNTAIN BOOKINGS ──────────────────────────────────────
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
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  amount_paid       NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_ref   TEXT,
  mpesa_checkout_id TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mountain_bookings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mountain_bookings_updated') THEN
    CREATE TRIGGER mountain_bookings_updated
      BEFORE UPDATE ON public.mountain_bookings
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mountain_bookings' AND policyname = 'mountain public insert') THEN
    CREATE POLICY "mountain public insert" ON public.mountain_bookings FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mountain_bookings' AND policyname = 'mountain public select') THEN
    CREATE POLICY "mountain public select" ON public.mountain_bookings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mountain_bookings' AND policyname = 'mountain staff all') THEN
    CREATE POLICY "mountain staff all" ON public.mountain_bookings FOR ALL TO authenticated
      USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
  END IF;
END $$;

-- ── GUEST REVIEWS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'guest_reviews_updated') THEN
    CREATE TRIGGER guest_reviews_updated
      BEFORE UPDATE ON public.guest_reviews
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guest_reviews' AND policyname = 'reviews public insert') THEN
    CREATE POLICY "reviews public insert" ON public.guest_reviews FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guest_reviews' AND policyname = 'reviews staff all') THEN
    CREATE POLICY "reviews staff all" ON public.guest_reviews FOR ALL TO authenticated
      USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
  END IF;
END $$;

-- ── ADD mpesa_checkout_id to mountain_bookings if missing ──
ALTER TABLE public.mountain_bookings
  ADD COLUMN IF NOT EXISTS mpesa_checkout_id TEXT;
