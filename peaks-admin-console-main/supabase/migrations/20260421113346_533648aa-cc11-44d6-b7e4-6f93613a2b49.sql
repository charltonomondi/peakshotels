-- M-Pesa transactions ledger
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  phone text NOT NULL,
  amount numeric NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  merchant_request_id text,
  checkout_request_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','cancelled')),
  result_code text,
  result_desc text,
  mpesa_receipt text,
  transaction_date text,
  callback_payload jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request ON public.mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_booking ON public.mpesa_transactions(booking_id);

ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mpesa staff read" ON public.mpesa_transactions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "mpesa staff insert" ON public.mpesa_transactions
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "mpesa staff update" ON public.mpesa_transactions
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER mpesa_transactions_updated_at
  BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();