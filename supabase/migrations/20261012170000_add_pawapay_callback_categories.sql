CREATE TABLE billing.pawapay_refund_operations (
  refund_id uuid PRIMARY KEY,
  payment_attempt_id uuid NOT NULL
    REFERENCES billing.payment_attempts(id) ON DELETE RESTRICT,
  source_deposit_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (refund_id, payment_attempt_id)
);

CREATE TABLE billing.pawapay_callback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  callback_type text NOT NULL
    CHECK (callback_type IN ('checkouts', 'payouts', 'refunds')),
  operation_id uuid NOT NULL,
  provider_status text NOT NULL,
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  authentication_verified boolean NOT NULL,
  payment_attempt_id uuid
    REFERENCES billing.payment_attempts(id) ON DELETE SET NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (callback_type, operation_id),
  CONSTRAINT pawapay_callback_status_check CHECK (
    (callback_type = 'checkouts'
      AND provider_status IN ('COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'))
    OR
    (callback_type IN ('payouts', 'refunds')
      AND provider_status IN ('COMPLETED', 'FAILED'))
  )
);

ALTER TABLE billing.pawapay_refund_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.pawapay_refund_operations FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.pawapay_callback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.pawapay_callback_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE billing.pawapay_refund_operations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE billing.pawapay_callback_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE billing.pawapay_refund_operations TO service_role;
GRANT ALL ON TABLE billing.pawapay_callback_events TO service_role;

CREATE OR REPLACE FUNCTION public.billing_register_pawapay_refund(
  p_refund_id uuid,
  p_source_deposit_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_payment_attempt_id uuid;
  v_existing_attempt_id uuid;
  v_inserted_rows integer;
BEGIN
  SELECT a.id
    INTO v_payment_attempt_id
    FROM billing.payment_attempts AS a
    JOIN billing.payment_orders AS o ON o.id = a.order_id
   WHERE a.provider = 'pawapay'
     AND a.merchant_reference = p_source_deposit_id::text
     AND a.status = 'succeeded'
     AND o.status = 'paid'
   FOR SHARE OF a, o;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'successful_source_deposit_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO billing.pawapay_refund_operations (
    refund_id, payment_attempt_id, source_deposit_id
  )
  VALUES (p_refund_id, v_payment_attempt_id, p_source_deposit_id)
  ON CONFLICT (refund_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;

  IF v_inserted_rows > 0 THEN
    RETURN true;
  END IF;

  SELECT payment_attempt_id
    INTO v_existing_attempt_id
    FROM billing.pawapay_refund_operations
   WHERE refund_id = p_refund_id;
  RETURN v_existing_attempt_id = v_payment_attempt_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_record_pawapay_callback_event(
  p_callback_type text,
  p_operation_id uuid,
  p_provider_status text,
  p_payload_sha256 text,
  p_authentication_verified boolean
)
RETURNS TABLE (
  accepted boolean,
  is_new boolean,
  source_deposit_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_payment_attempt_id uuid;
  v_source_deposit_id uuid;
  v_previous_status text;
  v_inserted_rows integer;
BEGIN
  IF p_callback_type IS NULL
    OR p_operation_id IS NULL
    OR p_provider_status IS NULL
    OR p_payload_sha256 IS NULL
    OR p_authentication_verified IS NULL
    OR p_payload_sha256 !~ '^[0-9a-f]{64}$'
    OR p_callback_type NOT IN ('checkouts', 'payouts', 'refunds')
  THEN
    RAISE EXCEPTION 'invalid_pawapay_callback_event' USING ERRCODE = '22023';
  END IF;

  IF NOT (
    (p_callback_type = 'checkouts'
      AND p_provider_status IN ('COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'))
    OR
    (p_callback_type IN ('payouts', 'refunds')
      AND p_provider_status IN ('COMPLETED', 'FAILED'))
  ) THEN
    RAISE EXCEPTION 'invalid_pawapay_callback_status' USING ERRCODE = '22023';
  END IF;

  IF p_callback_type = 'refunds' THEN
    SELECT r.payment_attempt_id, r.source_deposit_id, r.status
      INTO v_payment_attempt_id, v_source_deposit_id, v_previous_status
      FROM billing.pawapay_refund_operations AS r
     WHERE r.refund_id = p_operation_id
     FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'pawapay_refund_not_registered' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  SELECT e.provider_status
    INTO v_previous_status
    FROM billing.pawapay_callback_events AS e
   WHERE e.callback_type = p_callback_type
     AND e.operation_id = p_operation_id
   FOR UPDATE;

  IF FOUND THEN
    IF v_previous_status <> p_provider_status THEN
      RETURN QUERY SELECT false, false, v_source_deposit_id;
      RETURN;
    END IF;
    RETURN QUERY SELECT true, false, v_source_deposit_id;
    RETURN;
  END IF;

  IF p_callback_type = 'refunds' THEN
    UPDATE billing.pawapay_refund_operations AS r
       SET status = lower(p_provider_status), updated_at = now()
     WHERE r.refund_id = p_operation_id
       AND (r.status = 'pending' OR r.status = lower(p_provider_status));
    IF NOT FOUND THEN
      RETURN QUERY SELECT false, false, v_source_deposit_id;
      RETURN;
    END IF;
  END IF;

  INSERT INTO billing.pawapay_callback_events (
    callback_type,
    operation_id,
    provider_status,
    payload_sha256,
    authentication_verified,
    payment_attempt_id
  )
  VALUES (
    p_callback_type,
    p_operation_id,
    p_provider_status,
    p_payload_sha256,
    p_authentication_verified,
    v_payment_attempt_id
  )
  ON CONFLICT (callback_type, operation_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;

  IF v_inserted_rows = 0 THEN
    SELECT e.provider_status
      INTO v_previous_status
      FROM billing.pawapay_callback_events AS e
     WHERE e.callback_type = p_callback_type
       AND e.operation_id = p_operation_id
     FOR UPDATE;
    IF NOT FOUND OR v_previous_status <> p_provider_status THEN
      RETURN QUERY SELECT false, false, v_source_deposit_id;
      RETURN;
    END IF;
    RETURN QUERY SELECT true, false, v_source_deposit_id;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, true, v_source_deposit_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_register_pawapay_refund(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_record_pawapay_callback_event(text, uuid, text, text, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.billing_register_pawapay_refund(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_record_pawapay_callback_event(text, uuid, text, text, boolean)
  TO service_role;
ALTER FUNCTION public.billing_register_pawapay_refund(uuid, uuid) OWNER TO postgres;
ALTER FUNCTION public.billing_record_pawapay_callback_event(text, uuid, text, text, boolean)
  OWNER TO postgres;

NOTIFY pgrst, 'reload schema';
