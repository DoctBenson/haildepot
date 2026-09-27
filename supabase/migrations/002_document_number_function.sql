CREATE OR REPLACE FUNCTION public.generate_document_number(p_document_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tradesperson_id uuid := auth.uid();
  v_year integer := EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  v_number integer;
  v_prefix text;
BEGIN
  IF v_tradesperson_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to generate a document number'
      USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_tradesperson_id
      AND role = 'tradesperson'
  ) THEN
    RAISE EXCEPTION 'Only tradespeople can generate document numbers'
      USING ERRCODE = '42501';
  END IF;

  IF p_document_type = 'estimate' THEN
    v_prefix := 'EST';
  ELSIF p_document_type = 'invoice' THEN
    v_prefix := 'INV';
  ELSE
    RAISE EXCEPTION 'Document type must be estimate or invoice'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.document_sequences AS sequence (
    tradesperson_id,
    document_type,
    year,
    next_number
  )
  VALUES (
    v_tradesperson_id,
    p_document_type,
    v_year,
    2
  )
  ON CONFLICT (tradesperson_id, document_type, year)
  DO UPDATE
    SET next_number = sequence.next_number + 1
  RETURNING next_number - 1 INTO v_number;

  RETURN v_prefix || '-' || v_year::text || '-' || lpad(v_number::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.generate_document_number(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_document_number(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_document_number(text) TO authenticated;
