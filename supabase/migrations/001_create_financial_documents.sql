CREATE TABLE public.estimates (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id bigint NOT NULL,
  estimate_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  currency text NOT NULL DEFAULT 'GHS',
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric,
  tax numeric,
  discount_rate numeric,
  discount numeric,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT estimates_booking_id_fkey
    FOREIGN KEY (booking_id)
    REFERENCES public.bookings(id)
    ON DELETE CASCADE,

  CONSTRAINT estimates_status_check
    CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),

  CONSTRAINT estimates_subtotal_check
    CHECK (subtotal >= 0),

  CONSTRAINT estimates_tax_rate_check
    CHECK (tax_rate IS NULL OR tax_rate >= 0),

  CONSTRAINT estimates_tax_check
    CHECK (tax IS NULL OR tax >= 0),

  CONSTRAINT estimates_discount_rate_check
    CHECK (discount_rate IS NULL OR discount_rate >= 0),

  CONSTRAINT estimates_discount_check
    CHECK (discount IS NULL OR discount >= 0),

  CONSTRAINT estimates_total_check
    CHECK (total >= 0)
);