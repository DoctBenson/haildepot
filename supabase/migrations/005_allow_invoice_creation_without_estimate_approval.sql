CREATE OR REPLACE FUNCTION public.create_invoice_from_estimate(
  p_estimate_id bigint
)
RETURNS TABLE (
  invoice_id bigint,
  invoice_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_booking_id bigint;
  v_booking_tradesperson_id uuid;
  v_invoice_id bigint;
  v_estimate_status text;
  v_currency text;
  v_subtotal numeric;
  v_tax_rate numeric;
  v_tax numeric;
  v_discount_rate numeric;
  v_discount numeric;
  v_total numeric;
  v_notes text;
  v_generated_invoice_number text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to create an invoice'
      USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_user_id
      AND role = 'tradesperson'
  ) THEN
    RAISE EXCEPTION 'Only tradespeople can create invoices'
      USING ERRCODE = '42501';
  END IF;

  SELECT
    estimates.booking_id,
    bookings.tradesperson_id,
    estimates.status,
    estimates.currency,
    estimates.subtotal,
    estimates.tax_rate,
    estimates.tax,
    estimates.discount_rate,
    estimates.discount,
    estimates.total,
    estimates.notes
  INTO
    v_booking_id,
    v_booking_tradesperson_id,
    v_estimate_status,
    v_currency,
    v_subtotal,
    v_tax_rate,
    v_tax,
    v_discount_rate,
    v_discount,
    v_total,
    v_notes
  FROM public.estimates AS estimates
  JOIN public.bookings AS bookings
    ON bookings.id = estimates.booking_id
  WHERE estimates.id = p_estimate_id
  FOR UPDATE OF estimates;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate was not found or is not owned by the caller'
      USING ERRCODE = '42501';
  END IF;

  IF v_booking_tradesperson_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Estimate was not found or is not owned by the caller'
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invoices
    WHERE estimate_id = p_estimate_id
  ) THEN
    RAISE EXCEPTION 'This estimate has already been invoiced'
      USING ERRCODE = '23505';
  END IF;

  IF v_currency IS NULL
     OR btrim(v_currency) = ''
     OR v_subtotal IS NULL
     OR v_subtotal < 0
     OR (v_tax_rate IS NOT NULL AND v_tax_rate < 0)
     OR (v_tax IS NOT NULL AND v_tax < 0)
     OR (v_discount_rate IS NOT NULL AND
         (v_discount_rate < 0 OR v_discount_rate > 100))
     OR (v_discount IS NOT NULL AND v_discount < 0)
     OR v_total IS NULL
     OR v_total < 0 THEN
    RAISE EXCEPTION 'Estimate contains invalid financial data'
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.estimate_items
    WHERE estimate_id = p_estimate_id
  ) OR EXISTS (
    SELECT 1
    FROM public.estimate_items
    WHERE estimate_id = p_estimate_id
      AND (
        description IS NULL
        OR btrim(description) = ''
        OR quantity IS NULL
        OR quantity <= 0
        OR unit_price IS NULL
        OR unit_price < 0
        OR line_total IS NULL
        OR line_total < 0
      )
  ) THEN
    RAISE EXCEPTION 'Estimate contains invalid or missing line items'
      USING ERRCODE = '22023';
  END IF;

  v_generated_invoice_number :=
    public.generate_document_number('invoice');

  INSERT INTO public.invoices (
    booking_id,
    estimate_id,
    invoice_number,
    status,
    currency,
    subtotal,
    tax_rate,
    tax,
    discount_rate,
    discount,
    total,
    notes
  )
  VALUES (
    v_booking_id,
    p_estimate_id,
    v_generated_invoice_number,
    'draft',
    v_currency,
    v_subtotal,
    v_tax_rate,
    v_tax,
    v_discount_rate,
    v_discount,
    v_total,
    v_notes
  )
  RETURNING id INTO v_invoice_id;

  INSERT INTO public.invoice_items (
    invoice_id,
    description,
    quantity,
    unit_price,
    line_total
  )
  SELECT
    v_invoice_id,
    estimate_items.description,
    estimate_items.quantity,
    estimate_items.unit_price,
    estimate_items.line_total
  FROM public.estimate_items AS estimate_items
  WHERE estimate_items.estimate_id = p_estimate_id
  ORDER BY estimate_items.id;

  invoice_id := v_invoice_id;
  invoice_number := v_generated_invoice_number;
  RETURN NEXT;
END;
$$;

REVOKE ALL
ON FUNCTION public.create_invoice_from_estimate(bigint)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.create_invoice_from_estimate(bigint)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.create_invoice_from_estimate(bigint)
TO authenticated;
