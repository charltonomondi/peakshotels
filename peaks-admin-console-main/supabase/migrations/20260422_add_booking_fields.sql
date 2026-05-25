-- Add extra booking fields from the frontend flow (safe to run on existing schema)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS room_number TEXT,
  ADD COLUMN IF NOT EXISTS room_type TEXT,
  ADD COLUMN IF NOT EXISTS room_config TEXT,
  ADD COLUMN IF NOT EXISTS meal_plan TEXT,
  ADD COLUMN IF NOT EXISTS number_of_rooms INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS price_per_night NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT,
  ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- M-Pesa transactions table
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  mpesa_receipt TEXT,
  result_code TEXT,
  result_desc TEXT,
  transaction_date TIMESTAMPTZ,
  callback_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER mpesa_updated
  BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "mpesa staff all" ON public.mpesa_transactions
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Seed rooms if table is empty (matches frontend room numbers)
DO $$
DECLARE
  floor_num INT;
  room_num INT;
  cat TEXT;
  last_two INT;
BEGIN
  IF (SELECT COUNT(*) FROM public.rooms) = 0 THEN
    FOR floor_num IN 1..3 LOOP
      FOR room_num IN 1..12 LOOP
        last_two := room_num;
        IF last_two IN (1, 6, 7) THEN cat := 'double';
        ELSIF last_two = 12 THEN cat := 'suite';
        ELSE cat := 'single';
        END IF;
        INSERT INTO public.rooms (name, room_number, category, price_per_night, capacity, status)
        VALUES (
          CASE cat WHEN 'suite' THEN 'Executive Suite' WHEN 'double' THEN 'Superior Room' ELSE 'Standard Room' END,
          (floor_num * 100 + room_num)::TEXT,
          cat::public.room_category,
          CASE cat WHEN 'suite' THEN 13400 WHEN 'double' THEN 9600 ELSE 8400 END,
          CASE cat WHEN 'suite' THEN 2 WHEN 'double' THEN 2 ELSE 1 END,
          'available'
        );
      END LOOP;
    END LOOP;
    -- Floor 4: rooms 407-412
    FOR room_num IN 7..12 LOOP
      last_two := room_num;
      IF last_two = 7 THEN cat := 'double';
      ELSIF last_two = 12 THEN cat := 'suite';
      ELSE cat := 'single';
      END IF;
      INSERT INTO public.rooms (name, room_number, category, price_per_night, capacity, status)
      VALUES (
        CASE cat WHEN 'suite' THEN 'Executive Suite' WHEN 'double' THEN 'Superior Room' ELSE 'Standard Room' END,
        (400 + room_num)::TEXT,
        cat::public.room_category,
        CASE cat WHEN 'suite' THEN 13400 WHEN 'double' THEN 9600 ELSE 8400 END,
        CASE cat WHEN 'suite' THEN 2 WHEN 'double' THEN 2 ELSE 1 END,
        'available'
      );
    END LOOP;
  END IF;
END;
$$;
