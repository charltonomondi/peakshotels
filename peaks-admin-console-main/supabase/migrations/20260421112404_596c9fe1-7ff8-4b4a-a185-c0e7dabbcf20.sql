-- Enable extensions for daterange exclusion
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'manager', 'receptionist');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role checker
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- Profile auto-create trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  -- Bootstrap: first user becomes super_admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Rooms
CREATE TYPE public.room_category AS ENUM ('single','double','deluxe','suite','family');
CREATE TYPE public.room_status AS ENUM ('available','booked','maintenance');

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  room_number TEXT UNIQUE NOT NULL,
  category public.room_category NOT NULL DEFAULT 'single',
  description TEXT,
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  capacity INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
  status public.room_status NOT NULL DEFAULT 'available',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bookings
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled','completed');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL DEFAULT ('PHN-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INT NOT NULL DEFAULT 1 CHECK (num_guests > 0),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending','confirmed'))
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX bookings_room_dates ON public.bookings (room_id, check_in, check_out);

-- Maintenance blocks
CREATE TABLE public.maintenance_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);
ALTER TABLE public.maintenance_blocks ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TYPE public.payment_method AS ENUM ('mpesa','card','cash','bank');
CREATE TYPE public.payment_status AS ENUM ('paid','pending','failed','refunded');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  transaction_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CMS content (key/value JSON)
CREATE TABLE public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cms_updated BEFORE UPDATE ON public.cms_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== RLS POLICIES ==========

-- profiles: user sees own; staff sees all; super_admin updates all
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

-- user_roles: staff can read; super_admin manages
CREATE POLICY "roles read staff" ON public.user_roles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "roles insert super" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "roles update super" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "roles delete super" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- rooms: public read, staff write
CREATE POLICY "rooms public read" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms staff insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "rooms staff update" ON public.rooms FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "rooms admin delete" ON public.rooms FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));

-- customers: staff only
CREATE POLICY "customers staff all" ON public.customers FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- bookings: staff full access
CREATE POLICY "bookings staff all" ON public.bookings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- maintenance: staff
CREATE POLICY "maint staff all" ON public.maintenance_blocks FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- payments: staff
CREATE POLICY "payments staff all" ON public.payments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- cms: public read, staff write
CREATE POLICY "cms public read" ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "cms staff write" ON public.cms_content FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "cms staff update" ON public.cms_content FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));