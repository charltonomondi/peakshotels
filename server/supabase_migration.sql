-- Supabase Migration Script for Peaks Hotel Database (clean, idempotent)
-- Run this in the Supabase SQL editor or as a versioned migration

-- ========= Extensions =========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========= Types (create if missing) =========
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
    CREATE TYPE room_type AS ENUM ('standard', 'superior', 'executive');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_config') THEN
    CREATE TYPE room_config AS ENUM ('single', 'double', 'twin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_plan') THEN
    CREATE TYPE meal_plan AS ENUM ('bed_breakfast', 'half_board', 'full_board');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  END IF;
END$$;

-- ========= Tables =========
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number INTEGER NOT NULL UNIQUE,
  room_type room_type NOT NULL,
  floor INTEGER NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests > 0),
  bed_description VARCHAR(255),
  size VARCHAR(50),
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type room_type NOT NULL,
  room_config room_config NOT NULL,
  meal_plan meal_plan NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_type, room_config, meal_plan)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_first_name VARCHAR(100) NOT NULL,
  guest_last_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  room_type room_type NOT NULL,
  room_config room_config NOT NULL,
  meal_plan meal_plan NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests > 0),
  number_of_rooms INTEGER NOT NULL DEFAULT 1 CHECK (number_of_rooms > 0),
  number_of_nights INTEGER NOT NULL CHECK (number_of_nights > 0),
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  special_requests TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (check_in < check_out),
  CONSTRAINT chk_nights_consistency CHECK (number_of_nights = (check_out - check_in)),
  CONSTRAINT chk_total_consistency CHECK (total_price = price_per_night * number_of_nights * number_of_rooms)
);

CREATE TABLE IF NOT EXISTS room_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, date)
);

-- ========= Helpful indexes =========
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_availability_date ON room_availability(date);

-- ========= Updated-at trigger =========
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
    CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_room_pricing_updated_at') THEN
    CREATE TRIGGER update_room_pricing_updated_at BEFORE UPDATE ON room_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
    CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_room_availability_updated_at') THEN
    CREATE TRIGGER update_room_availability_updated_at BEFORE UPDATE ON room_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ========= Utility: booking reference =========
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS VARCHAR(20) AS $$
DECLARE
  ref VARCHAR(20);
BEGIN
  ref := 'PH' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN ref;
END; $$ LANGUAGE plpgsql;

-- ========= Availability helpers =========

-- Check if a room is free for range [check_in, check_out)
CREATE OR REPLACE FUNCTION is_room_available(p_room_id UUID, p_check_in DATE, p_check_out DATE)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM room_availability ra
    WHERE ra.room_id = p_room_id
      AND ra.date >= p_check_in
      AND ra.date < p_check_out
      AND ra.is_available = false
  );
$$;

-- Reserve dates for a booking (sets is_available=false and links booking_id)
CREATE OR REPLACE FUNCTION reserve_room_dates(p_booking_id UUID, p_room_id UUID, p_check_in DATE, p_check_out DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  d DATE;
BEGIN
  IF NOT is_room_available(p_room_id, p_check_in, p_check_out) THEN
    RAISE EXCEPTION 'Room % not available from % to %', p_room_id, p_check_in, p_check_out USING ERRCODE = 'check_violation';
  END IF;

  d := p_check_in;
  WHILE d < p_check_out LOOP
    INSERT INTO room_availability (room_id, date, is_available, booking_id)
    VALUES (p_room_id, d, false, p_booking_id)
    ON CONFLICT (room_id, date) DO UPDATE
      SET is_available = EXCLUDED.is_available,
          booking_id = EXCLUDED.booking_id,
          updated_at = NOW();
    d := d + INTERVAL '1 day';
  END LOOP;
END $$;

-- Free dates for a booking
CREATE OR REPLACE FUNCTION free_room_dates(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE room_availability
  SET is_available = true,
      booking_id = NULL,
      updated_at = NOW()
  WHERE booking_id = p_booking_id;
END $$;

-- ========= Pricing helper =========
CREATE OR REPLACE FUNCTION get_price(room_type_in room_type, room_config_in room_config, meal_plan_in meal_plan)
RETURNS DECIMAL(10,2)
LANGUAGE sql
AS $$
  SELECT rp.price
  FROM room_pricing rp
  WHERE rp.room_type = room_type_in
    AND rp.room_config = room_config_in
    AND rp.meal_plan = meal_plan_in
  LIMIT 1;
$$;

-- ========= RPCs =========

-- Check availability RPC
CREATE OR REPLACE FUNCTION rpc_check_availability(p_room_id UUID, p_check_in DATE, p_check_out DATE)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT is_room_available(p_room_id, p_check_in, p_check_out);
$$;

-- Quote price RPC
CREATE OR REPLACE FUNCTION rpc_quote_price(p_room_type room_type, p_room_config room_config, p_meal_plan meal_plan, p_check_in DATE, p_check_out DATE, p_num_rooms INT DEFAULT 1)
RETURNS TABLE (
  price_per_night DECIMAL(10,2),
  number_of_nights INT,
  total_price DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p DECIMAL(10,2);
  nights INT;
BEGIN
  nights := (p_check_out - p_check_in);
  IF nights <= 0 THEN
    RAISE EXCEPTION 'check_out must be after check_in';
  END IF;

  SELECT get_price(p_room_type, p_room_config, p_meal_plan) INTO p;
  IF p IS NULL THEN
    RAISE EXCEPTION 'No pricing found for %, %, %', p_room_type, p_room_config, p_meal_plan;
  END IF;

  RETURN QUERY SELECT p, nights, p * nights * p_num_rooms;
END $$;

-- Create booking RPC: atomic insert + reserve dates
CREATE OR REPLACE FUNCTION rpc_create_booking(
  p_room_id UUID,
  p_room_type room_type,
  p_room_config room_config,
  p_meal_plan meal_plan,
  p_check_in DATE,
  p_check_out DATE,
  p_number_of_guests INT,
  p_number_of_rooms INT,
  p_guest_first_name VARCHAR,
  p_guest_last_name VARCHAR,
  p_guest_email VARCHAR,
  p_guest_phone VARCHAR DEFAULT NULL
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  price NUMERIC;
  nights INT;
  ref VARCHAR(20);
  b bookings;
  uid UUID;
BEGIN
  -- Require authenticated user
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  -- Validate dates and compute pricing
  nights := (p_check_out - p_check_in);
  IF nights <= 0 THEN
    RAISE EXCEPTION 'check_out must be after check_in';
  END IF;

  -- Validate room type matches selected room
  PERFORM 1 FROM rooms r WHERE r.id = p_room_id AND r.room_type = p_room_type;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected room does not match requested room_type';
  END IF;

  SELECT get_price(p_room_type, p_room_config, p_meal_plan) INTO price;
  IF price IS NULL THEN
    RAISE EXCEPTION 'No pricing for selected combination';
  END IF;

  ref := generate_booking_reference();

  -- Create booking row
  INSERT INTO bookings (
    booking_reference, user_id, guest_first_name, guest_last_name, guest_email, guest_phone,
    room_id, room_type, room_config, meal_plan, check_in, check_out,
    number_of_guests, number_of_rooms, number_of_nights, price_per_night, total_price, status, payment_status
  )
  VALUES (
    ref, uid, p_guest_first_name, p_guest_last_name, p_guest_email, p_guest_phone,
    p_room_id, p_room_type, p_room_config, p_meal_plan, p_check_in, p_check_out,
    p_number_of_guests, p_number_of_rooms, nights, price, price * nights * p_number_of_rooms, 'pending', 'pending'
  )
  RETURNING * INTO b;

  -- Reserve dates for the booking
  PERFORM reserve_room_dates(b.id, p_room_id, p_check_in, p_check_out);

  RETURN b;

EXCEPTION
  WHEN others THEN
    -- On any error, ensure no partial reservations remain
    IF b.id IS NOT NULL THEN
      PERFORM free_room_dates(b.id);
      DELETE FROM bookings WHERE id = b.id;
    END IF;
    RAISE;
END $$;

-- Cancel booking RPC: owner-only, frees dates
CREATE OR REPLACE FUNCTION rpc_cancel_booking(p_booking_id UUID)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID := auth.uid();
  b bookings;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO b FROM bookings WHERE id = p_booking_id AND user_id = uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not owned by user' USING ERRCODE = '42501';
  END IF;

  IF b.status <> 'cancelled' THEN
    UPDATE bookings
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_booking_id
    RETURNING * INTO b;
  END IF;

  PERFORM free_room_dates(b.id);
  RETURN b;
END $$;

-- ========= Row Level Security =========
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Drop conflicting/legacy policies (guard with pg_policies.policyname)
DO $$
BEGIN
  -- Legacy names
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rooms' AND policyname = 'Public can view rooms') THEN
    DROP POLICY "Public can view rooms" ON public.rooms;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_pricing' AND policyname = 'Public can view pricing') THEN
    DROP POLICY "Public can view pricing" ON public.room_pricing;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_availability' AND policyname = 'Public can view availability') THEN
    DROP POLICY "Public can view availability" ON public.room_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can insert bookings') THEN
    DROP POLICY "Users can insert bookings" ON public.bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can update own bookings') THEN
    DROP POLICY "Users can update own bookings" ON public.bookings;
  END IF;

  -- Current names (cleanup for idempotency)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rooms' AND policyname = 'public_select_rooms') THEN
    DROP POLICY "public_select_rooms" ON public.rooms;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_pricing' AND policyname = 'public_select_pricing') THEN
    DROP POLICY "public_select_pricing" ON public.room_pricing;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_availability' AND policyname = 'public_select_availability') THEN
    DROP POLICY "public_select_availability" ON public.room_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_insert_auth') THEN
    DROP POLICY "bookings_insert_auth" ON public.bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_select_owner') THEN
    DROP POLICY "bookings_select_owner" ON public.bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_update_owner') THEN
    DROP POLICY "bookings_update_owner" ON public.bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_delete_owner') THEN
    DROP POLICY "bookings_delete_owner" ON public.bookings;
  END IF;
END $$;

-- Public read for rooms/pricing/availability
CREATE POLICY "public_select_rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "public_select_pricing" ON room_pricing
  FOR SELECT USING (true);

CREATE POLICY "public_select_availability" ON room_availability
  FOR SELECT USING (true);

-- Bookings: strict ownership
CREATE POLICY "bookings_insert_auth" ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "bookings_select_owner" ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "bookings_update_owner" ON bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_delete_owner" ON bookings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ========= Seeds (idempotent) =========

-- Pricing upsert
INSERT INTO room_pricing (room_type, room_config, meal_plan, price)
VALUES
('standard','single','bed_breakfast', 8400),
('standard','single','half_board', 10400),
('standard','single','full_board', 12400),
('standard','double','bed_breakfast',11400),
('standard','double','half_board', 15400),
('standard','double','full_board', 19400),
('standard','twin','bed_breakfast', 6200),
('standard','twin','half_board', 8200),
('standard','twin','full_board', 10200),
('superior','single','bed_breakfast', 9600),
('superior','single','half_board', 11600),
('superior','single','full_board', 13600),
('superior','double','bed_breakfast',12600),
('superior','double','half_board', 16600),
('superior','double','full_board', 20600),
('superior','twin','bed_breakfast', 6800),
('superior','twin','half_board', 8800),
('superior','twin','full_board', 10800),
('executive','single','bed_breakfast',13400),
('executive','single','half_board', 15400),
('executive','single','full_board', 17400),
('executive','double','bed_breakfast',16900),
('executive','double','half_board', 20900),
('executive','double','full_board', 24900)
ON CONFLICT (room_type, room_config, meal_plan)
DO UPDATE SET price = EXCLUDED.price, updated_at = NOW();

-- Rooms upsert (cast text literals to enums)
WITH data(room_number, room_type, floor, max_guests, bed_description, size) AS (
  VALUES
    (101, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (102, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (103, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (104, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (105, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (106, 'superior'::room_type, 1, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (107, 'superior'::room_type, 1, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (108, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (109, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (110, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (111, 'standard'::room_type, 1, 2, 'King Bed', '35 sqm'),
    (112, 'executive'::room_type,1, 4, '2 King Beds', '90 sqm'),
    (201, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (202, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (203, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (204, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (205, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (206, 'superior'::room_type, 2, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (207, 'superior'::room_type, 2, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (208, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (209, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (210, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (211, 'standard'::room_type, 2, 2, 'King Bed', '35 sqm'),
    (212, 'executive'::room_type,2, 4, '2 King Beds', '90 sqm'),
    (301, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (302, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (303, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (304, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (305, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (306, 'superior'::room_type, 3, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (307, 'superior'::room_type, 3, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (308, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (309, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (310, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (311, 'standard'::room_type, 3, 2, 'King Bed', '35 sqm'),
    (312, 'executive'::room_type,3, 4, '2 King Beds', '90 sqm'),
    (407, 'superior'::room_type, 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (408, 'superior'::room_type, 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (409, 'superior'::room_type, 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (410, 'superior'::room_type, 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (411, 'superior'::room_type, 4, 3, 'King Bed + Sofa Bed', '55 sqm'),
    (412, 'executive'::room_type,4, 4, '2 King Beds', '90 sqm')
)
INSERT INTO rooms (room_number, room_type, floor, max_guests, bed_description, size)
SELECT * FROM data
ON CONFLICT (room_number) DO UPDATE
SET room_type = EXCLUDED.room_type,
    floor = EXCLUDED.floor,
    max_guests = EXCLUDED.max_guests,
    bed_description = EXCLUDED.bed_description,
    size = EXCLUDED.size,
    updated_at = NOW();

-- ========= Grants for RPCs =========
REVOKE ALL ON FUNCTION rpc_create_booking FROM PUBLIC;
REVOKE ALL ON FUNCTION rpc_cancel_booking FROM PUBLIC;
REVOKE ALL ON FUNCTION rpc_check_availability FROM PUBLIC;
REVOKE ALL ON FUNCTION rpc_quote_price FROM PUBLIC;

GRANT EXECUTE ON FUNCTION rpc_create_booking TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_cancel_booking TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_check_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_quote_price TO anon, authenticated;

-- End of migration
