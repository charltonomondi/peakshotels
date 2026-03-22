-- Add missing transaction_code column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'transaction_code'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_code text;
  END IF;
END;
$$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_tx_code ON public.payments(transaction_code);

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at trigger to payments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Create notification function if not exists (replace quietly)
CREATE OR REPLACE FUNCTION notify_guest_on_success()
RETURNS TRIGGER AS $$
DECLARE
  v_email text;
  v_phone text;
  v_name text;
  v_booking record;
  v_payload jsonb;
  v_webhook_url text := current_setting('app.notifications_webhook', true);
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'success') OR (TG_OP = 'UPDATE' AND NEW.status = 'success' AND COALESCE(OLD.status, '') <> 'success') THEN
    IF NEW.booking_id IS NOT NULL THEN
      SELECT guest_email, guest_phone, guest_first_name || ' ' || guest_last_name AS full_name
        INTO v_booking
      FROM public.bookings
      WHERE id = NEW.booking_id;

      v_email := COALESCE(NEW.email, v_booking.guest_email);
      v_phone := v_booking.guest_phone;
      v_name := v_booking.full_name;
    ELSE
      v_email := NEW.email;
    END IF;

    v_payload := jsonb_build_object(
      'type', 'payment_success',
      'booking_id', NEW.booking_id,
      'email', v_email,
      'phone', v_phone,
      'name', v_name,
      'amount', NEW.amount,
      'currency', NEW.currency,
      'reference', NEW.reference,
      'transaction_code', NEW.transaction_code,
      'method', NEW.method,
      'created_at', NEW.created_at
    );

    IF v_webhook_url IS NOT NULL AND v_webhook_url <> '' THEN
      PERFORM http_post(v_webhook_url, v_payload::text, 'application/json');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to invoke notifications on insert/update if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'payments_notify_on_success'
  ) THEN
    CREATE TRIGGER payments_notify_on_success
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION notify_guest_on_success();
  END IF;
END;
$$;

-- Enable RLS on payments (backend uses service role for writes)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
