-- ============================================================
-- PEAKS HOTEL — COMPLETE FRESH SCHEMA
-- Run this in Supabase SQL Editor to reset everything
-- ============================================================

-- Drop all existing tables (cascade handles dependencies)
DROP TABLE IF EXISTS public.mpesa_transactions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.maintenance_blocks CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.cms_content CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old tables from previous schema versions
DROP TABLE IF EXISTS public.room_types CASCADE;
DROP TABLE IF EXISTS public.amenities CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.room_pricing CASCADE;
DROP TABLE IF EXISTS public.room_availability CASCADE;

-- Drop types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.room_category CASCADE;
DROP TYPE IF EXISTS public.room_status CASCADE;
DROP TYPE IF EXISTS public.booking_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.is_staff CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role     AS ENUM ('super_admin', 'manager', 'receptionist');
CREATE TYPE public.room_category AS ENUM ('single', 'double', 'deluxe', 'suite', 'family');
CREATE TYPE public.room_status   AS ENUM ('available', 'booked', 'maintenance');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'card', 'cash', 'bank');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed', 'refunded');

-- ============================================================
-- SHARED TRIGGER: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- Auto-create profile + bootstrap first user as super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROOMS
-- ============================================================
CREATE TABLE public.rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  room_number     TEXT UNIQUE NOT NULL,
  category        public.room_category NOT NULL DEFAULT 'single',
  description     TEXT,
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  capacity        INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
  status          public.room_status NOT NULL DEFAULT 'available',
  amenities       TEXT[] NOT NULL DEFAULT '{}',
  images          TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER rooms_updated BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE public.customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  id_number  TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BOOKINGS (includes all fields from the website booking form)
-- ============================================================
CREATE TABLE public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        TEXT UNIQUE NOT NULL DEFAULT ('PHN-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id      UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  room_id          UUID REFERENCES public.rooms(id) ON DELETE RESTRICT,

  -- Guest info
  guest_name       TEXT NOT NULL,
  guest_email      TEXT,
  guest_phone      TEXT,

  -- Stay details
  check_in         DATE NOT NULL,
  check_out        DATE NOT NULL,
  num_guests       INT NOT NULL DEFAULT 1 CHECK (num_guests > 0),
  number_of_rooms  INT NOT NULL DEFAULT 1,

  -- Room details from the booking form
  room_number      TEXT,
  room_type        TEXT,
  room_config      TEXT,
  meal_plan        TEXT,
  price_per_night  NUMERIC(10,2),
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Payment
  payment_method   TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  transaction_ref  TEXT,

  -- Status & notes
  status           public.booking_status NOT NULL DEFAULT 'pending',
  notes            TEXT,
  special_requests TEXT,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (check_out > check_in),

  -- Prevent double-booking same room for overlapping dates
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed') AND room_id IS NOT NULL)
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX bookings_room_dates ON public.bookings (room_id, check_in, check_out);
CREATE INDEX bookings_room_number ON public.bookings (room_number, check_in, check_out);

-- ============================================================
-- MAINTENANCE BLOCKS
-- ============================================================
CREATE TABLE public.maintenance_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);
ALTER TABLE public.maintenance_blocks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method          public.payment_method NOT NULL,
  status          public.payment_status NOT NULL DEFAULT 'pending',
  transaction_ref TEXT,
  paid_at         TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- MPESA TRANSACTIONS
-- ============================================================
CREATE TABLE public.mpesa_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_id          UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  phone               TEXT NOT NULL,
  amount              NUMERIC(10,2) NOT NULL,
  environment         TEXT NOT NULL DEFAULT 'sandbox',
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  mpesa_receipt       TEXT,
  result_code         TEXT,
  result_desc         TEXT,
  transaction_date    TIMESTAMPTZ,
  callback_payload    JSONB,
  status              TEXT NOT NULL DEFAULT 'pending',
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER mpesa_updated BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CMS CONTENT
-- ============================================================
CREATE TABLE public.cms_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section    TEXT UNIQUE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cms_updated BEFORE UPDATE ON public.cms_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "profiles self read"   ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- user_roles
CREATE POLICY "roles read"         ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "roles insert super" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "roles update super" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "roles delete super" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- rooms: public read, staff write
CREATE POLICY "rooms public read"  ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms staff insert" ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "rooms staff update" ON public.rooms FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "rooms admin delete" ON public.rooms FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manager'));

-- customers: staff only
CREATE POLICY "customers staff all" ON public.customers FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- bookings: staff full access + PUBLIC INSERT so the website can save bookings
CREATE POLICY "bookings staff all"     ON public.bookings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "bookings public insert" ON public.bookings FOR INSERT
  WITH CHECK (true);
-- Allow public SELECT so availability check works from the browser
CREATE POLICY "bookings public select" ON public.bookings FOR SELECT
  USING (true);

-- maintenance
CREATE POLICY "maint staff all" ON public.maintenance_blocks FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- payments: staff only
CREATE POLICY "payments staff all" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- mpesa_transactions: staff only
CREATE POLICY "mpesa staff all" ON public.mpesa_transactions FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- cms: public read, staff write
CREATE POLICY "cms public read"  ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "cms staff write"  ON public.cms_content FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "cms staff update" ON public.cms_content FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ============================================================
-- SEED ROOMS (101-112, 201-212, 301-312, 407-412)
-- Matches the frontend room number layout exactly
-- ============================================================
DO $$
DECLARE
  f INT; r INT; cat TEXT; last_two INT;
BEGIN
  -- Floors 1-3: rooms X01-X12
  FOR f IN 1..3 LOOP
    FOR r IN 1..12 LOOP
      last_two := r;
      IF last_two IN (1, 6, 7) THEN cat := 'double';
      ELSIF last_two = 12       THEN cat := 'suite';
      ELSE                           cat := 'single';
      END IF;
      INSERT INTO public.rooms (name, room_number, category, price_per_night, capacity, status)
      VALUES (
        CASE cat
          WHEN 'suite'  THEN 'Executive Suite'
          WHEN 'double' THEN 'Superior Room'
          ELSE               'Standard Room'
        END,
        (f * 100 + r)::TEXT,
        cat::public.room_category,
        CASE cat WHEN 'suite' THEN 13400 WHEN 'double' THEN 9600 ELSE 8400 END,
        CASE cat WHEN 'suite' THEN 2     WHEN 'double' THEN 2    ELSE 1    END,
        'available'
      );
    END LOOP;
  END LOOP;

  -- Floor 4: rooms 407-412
  FOR r IN 7..12 LOOP
    last_two := r;
    IF last_two = 7     THEN cat := 'double';
    ELSIF last_two = 12 THEN cat := 'suite';
    ELSE                     cat := 'single';
    END IF;
    INSERT INTO public.rooms (name, room_number, category, price_per_night, capacity, status)
    VALUES (
      CASE cat
        WHEN 'suite'  THEN 'Executive Suite'
        WHEN 'double' THEN 'Superior Room'
        ELSE               'Standard Room'
      END,
      (400 + r)::TEXT,
      cat::public.room_category,
      CASE cat WHEN 'suite' THEN 13400 WHEN 'double' THEN 9600 ELSE 8400 END,
      CASE cat WHEN 'suite' THEN 2     WHEN 'double' THEN 2    ELSE 1    END,
      'available'
    );
  END LOOP;
END;
$$;

-- ============================================================
-- PEAKS LOYALTY PROGRAM
-- ============================================================

-- Loyalty members (linked to Supabase auth users)
CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  points        INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  -- Tier: Bronze 0-999, Silver 1000-4999, Gold 5000+
  tier          TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
  member_since  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER loyalty_updated BEFORE UPDATE ON public.loyalty_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: members can only see/edit their own record
CREATE POLICY "loyalty self read"   ON public.loyalty_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "loyalty self insert" ON public.loyalty_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "loyalty self update" ON public.loyalty_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
-- Staff can see all members
CREATE POLICY "loyalty staff read"  ON public.loyalty_members FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Loyalty transactions (points earned/redeemed per booking)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired')),
  points        INT NOT NULL,  -- positive = earned, negative = redeemed
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_tx self read"   ON public.loyalty_transactions FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.loyalty_members WHERE user_id = auth.uid()));
CREATE POLICY "loyalty_tx self insert" ON public.loyalty_transactions FOR INSERT TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.loyalty_members WHERE user_id = auth.uid()));
CREATE POLICY "loyalty_tx staff read"  ON public.loyalty_transactions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Function: recalculate tier after points change
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

-- Add loyalty_member_id to bookings so we can link them
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS loyalty_member_id UUID REFERENCES public.loyalty_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS loyalty_points_earned INT DEFAULT 0;
