CREATE OR REPLACE FUNCTION public.create_estimate(
  p_booking_id bigint,
  p_items jsonb,
  p_discount_rate numeric DEFAULT NULL,
  p_tax_rate numeric DEFAULT NULL,
  p_expiry_date date DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_currency text DEFAULT 'GHS'
)
RETURNS TABLE (
  estimate_id bigint,
  estimate_number text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_description text;
  v_quantity numeric;
  v_unit_price numeric;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_tax numeric := 0;
  v_total numeric;
  v_generated_number text;
  v_currency text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to create an estimate'
      USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_user_id
      AND role = 'tradesperson'
  ) THEN
    RAISE EXCEPTION 'Only tradespeople can create estimates'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id
      AND tradesperson_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Booking does not exist or does not belong to the caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Items must be a JSON array'
      USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one estimate item is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_discount_rate IS NOT NULL
     AND (p_discount_rate < 0 OR p_discount_rate > 100) THEN
    RAISE EXCEPTION 'Discount rate must be between 0 and 100'
      USING ERRCODE = '22023';
  END IF;

  IF p_tax_rate IS NOT NULL
     AND p_tax_rate < 0 THEN
    RAISE EXCEPTION 'Tax rate cannot be negative'
      USING ERRCODE = '22023';
  END IF;

  v_currency := COALESCE(p_currency, 'GHS');

  IF btrim(v_currency) = '' THEN
    RAISE EXCEPTION 'Currency cannot be blank'
      USING ERRCODE = '22023';
  END IF;

  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items) AS item(value)
  LOOP
    IF jsonb_typeof(v_item) <> 'object' THEN
      RAISE EXCEPTION 'Each estimate item must be a JSON object'
        USING ERRCODE = '22023';
    END IF;

    v_description := v_item ->> 'description';

    IF v_description IS NULL OR btrim(v_description) = '' THEN
      RAISE EXCEPTION 'Estimate item descriptions cannot be blank'
        USING ERRCODE = '22023';
    END IF;

    IF v_item ->> 'quantity' IS NULL
       OR v_item ->> 'unit_price' IS NULL THEN
      RAISE EXCEPTION 'Each estimate item requires quantity and unit_price'
        USING ERRCODE = '22023';
    END IF;

    v_quantity := (v_item ->> 'quantity')::numeric;
    v_unit_price := (v_item ->> 'unit_price')::numeric;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Estimate item quantity must be greater than zero'
        USING ERRCODE = '22023';
    END IF;

    IF v_unit_price < 0 THEN
      RAISE EXCEPTION 'Estimate item unit price cannot be negative'
        USING ERRCODE = '22023';
    END IF;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  END LOOP;

  IF p_discount_rate IS NOT NULL THEN
    v_discount := v_subtotal * p_discount_rate / 100;
  END IF;

  IF p_tax_rate IS NOT NULL THEN
    v_tax := (v_subtotal - v_discount) * p_tax_rate / 100;
  END IF;

  v_total := v_subtotal - v_discount + v_tax;

  v_generated_number :=
    public.generate_document_number('estimate');

  INSERT INTO public.estimates (
    booking_id,
    estimate_number,
    status,
    expiry_date,
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
    p_booking_id,
    v_generated_number,
    'draft',
    p_expiry_date,
    v_currency,
    v_subtotal,
    p_tax_rate,
    v_tax,
    p_discount_rate,
    v_discount,
    v_total,
    p_notes
  )
  RETURNING id INTO estimate_id;

  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items) AS item(value)
  LOOP
    v_description := v_item ->> 'description';
    v_quantity := (v_item ->> 'quantity')::numeric;
    v_unit_price := (v_item ->> 'unit_price')::numeric;
    v_line_total := v_quantity * v_unit_price;

    INSERT INTO public.estimate_items (
      estimate_id,
      description,
      quantity,
      unit_price,
      line_total
    )
    VALUES (
      estimate_id,
      v_description,
      v_quantity,
      v_unit_price,
      v_line_total
    );
  END LOOP;

  estimate_number := v_generated_number;

  RETURN NEXT;
END;
$$;

REVOKE ALL
ON FUNCTION public.create_estimate(
  bigint,
  jsonb,
  numeric,
  numeric,
  date,
  text,
  text
)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.create_estimate(
  bigint,
  jsonb,
  numeric,
  numeric,
  date,
  text,
  text
)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.create_estimate(
  bigint,
  jsonb,
  numeric,
  numeric,
  date,
  text,
  text
)
TO authenticated;