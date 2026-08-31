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
    ON DELETE RESTRICT,

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


CREATE TABLE public.estimate_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estimate_id bigint NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,

  CONSTRAINT estimate_items_estimate_id_fkey
    FOREIGN KEY (estimate_id)
    REFERENCES public.estimates(id)
    ON DELETE CASCADE,

  CONSTRAINT estimate_items_quantity_check
    CHECK (quantity > 0),

  CONSTRAINT estimate_items_unit_price_check
    CHECK (unit_price >= 0),

  CONSTRAINT estimate_items_line_total_check
    CHECK (line_total >= 0)
);


CREATE TABLE public.invoices (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id bigint NOT NULL,
  estimate_id bigint,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
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

  CONSTRAINT invoices_booking_id_fkey
    FOREIGN KEY (booking_id)
    REFERENCES public.bookings(id)
    ON DELETE RESTRICT,

  CONSTRAINT invoices_estimate_id_fkey
    FOREIGN KEY (estimate_id)
    REFERENCES public.estimates(id)
    ON DELETE SET NULL,

  CONSTRAINT invoices_status_check
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

  CONSTRAINT invoices_subtotal_check
    CHECK (subtotal >= 0),

  CONSTRAINT invoices_tax_rate_check
    CHECK (tax_rate IS NULL OR tax_rate >= 0),

  CONSTRAINT invoices_tax_check
    CHECK (tax IS NULL OR tax >= 0),

  CONSTRAINT invoices_discount_rate_check
    CHECK (discount_rate IS NULL OR discount_rate >= 0),

  CONSTRAINT invoices_discount_check
    CHECK (discount IS NULL OR discount >= 0),

  CONSTRAINT invoices_total_check
    CHECK (total >= 0)
);


CREATE TABLE public.invoice_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_id bigint NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,

  CONSTRAINT invoice_items_invoice_id_fkey
    FOREIGN KEY (invoice_id)
    REFERENCES public.invoices(id)
    ON DELETE CASCADE,

  CONSTRAINT invoice_items_quantity_check
    CHECK (quantity > 0),

  CONSTRAINT invoice_items_unit_price_check
    CHECK (unit_price >= 0),

  CONSTRAINT invoice_items_line_total_check
    CHECK (line_total >= 0)
);


CREATE TABLE public.document_sequences (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tradesperson_id uuid NOT NULL,
  document_type text NOT NULL,
  year integer NOT NULL,
  next_number integer NOT NULL DEFAULT 1,

  CONSTRAINT document_sequences_tradesperson_id_fkey
    FOREIGN KEY (tradesperson_id)
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT,

  CONSTRAINT document_sequences_document_type_check
    CHECK (document_type IN ('estimate', 'invoice')),

  CONSTRAINT document_sequences_year_check
    CHECK (year >= 2000),

  CONSTRAINT document_sequences_next_number_check
    CHECK (next_number > 0),

  CONSTRAINT document_sequences_unique
    UNIQUE (tradesperson_id, document_type, year)
);


CREATE INDEX estimates_booking_id_idx
  ON public.estimates (booking_id);

CREATE INDEX estimate_items_estimate_id_idx
  ON public.estimate_items (estimate_id);

CREATE INDEX invoices_booking_id_idx
  ON public.invoices (booking_id);

CREATE INDEX invoices_estimate_id_idx
  ON public.invoices (estimate_id);

CREATE INDEX invoice_items_invoice_id_idx
  ON public.invoice_items (invoice_id);

CREATE INDEX document_sequences_tradesperson_id_idx
  ON public.document_sequences (tradesperson_id);


ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Customers can view their bookings"
ON public.bookings
FOR SELECT
TO public
USING (auth.uid() = customer_id);

CREATE POLICY "Customers and tradespeople can view their estimates"
ON public.estimates
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = estimates.booking_id
      AND (
        auth.uid() = bookings.customer_id
        OR auth.uid() = bookings.tradesperson_id
      )
  )
);


CREATE POLICY "Tradespeople can create estimates for their bookings"
ON public.estimates
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = estimates.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
);



CREATE POLICY "Tradespeople can update their estimates"
ON public.estimates
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = estimates.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = estimates.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
);


CREATE POLICY "Customers and tradespeople can view estimate items"
ON public.estimate_items
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.estimates
    JOIN public.bookings
      ON bookings.id = estimates.booking_id
    WHERE estimates.id = estimate_items.estimate_id
      AND (
        auth.uid() = bookings.customer_id
        OR auth.uid() = bookings.tradesperson_id
      )
  )
);


CREATE POLICY "Tradespeople can create estimate items"
ON public.estimate_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.estimates
    JOIN public.bookings
      ON bookings.id = estimates.booking_id
    WHERE estimates.id = estimate_items.estimate_id
      AND auth.uid() = bookings.tradesperson_id
  )
);



CREATE POLICY "Tradespeople can update estimate items"
ON public.estimate_items
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.estimates
    JOIN public.bookings
      ON bookings.id = estimates.booking_id
    WHERE estimates.id = estimate_items.estimate_id
      AND auth.uid() = bookings.tradesperson_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.estimates
    JOIN public.bookings
      ON bookings.id = estimates.booking_id
    WHERE estimates.id = estimate_items.estimate_id
      AND auth.uid() = bookings.tradesperson_id
  )
);



CREATE POLICY "Tradespeople can delete estimate items"
ON public.estimate_items
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.estimates
    JOIN public.bookings
      ON bookings.id = estimates.booking_id
    WHERE estimates.id = estimate_items.estimate_id
      AND auth.uid() = bookings.tradesperson_id
  )
);



CREATE POLICY "Customers and tradespeople can view their invoices"
ON public.invoices
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = invoices.booking_id
      AND (
        auth.uid() = bookings.customer_id
        OR auth.uid() = bookings.tradesperson_id
      )
  )
);


CREATE POLICY "Tradespeople can create invoices for their bookings"
ON public.invoices
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = invoices.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
);




CREATE POLICY "Tradespeople can update their invoices"
ON public.invoices
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = invoices.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.id = invoices.booking_id
      AND auth.uid() = bookings.tradesperson_id
  )
);



CREATE POLICY "Customers and tradespeople can view invoice items"
ON public.invoice_items
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices
    JOIN public.bookings
      ON bookings.id = invoices.booking_id
    WHERE invoices.id = invoice_items.invoice_id
      AND (
        auth.uid() = bookings.customer_id
        OR auth.uid() = bookings.tradesperson_id
      )
  )
);



CREATE POLICY "Tradespeople can create invoice items"
ON public.invoice_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.invoices
    JOIN public.bookings
      ON bookings.id = invoices.booking_id
    WHERE invoices.id = invoice_items.invoice_id
      AND auth.uid() = bookings.tradesperson_id
  )
);


CREATE POLICY "Tradespeople can update invoice items"
ON public.invoice_items
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices
    JOIN public.bookings
      ON bookings.id = invoices.booking_id
    WHERE invoices.id = invoice_items.invoice_id
      AND auth.uid() = bookings.tradesperson_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.invoices
    JOIN public.bookings
      ON bookings.id = invoices.booking_id
    WHERE invoices.id = invoice_items.invoice_id
      AND auth.uid() = bookings.tradesperson_id
  )
);