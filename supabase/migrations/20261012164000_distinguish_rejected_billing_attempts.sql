ALTER TABLE billing.payment_orders
  DROP CONSTRAINT payment_orders_status_check,
  ADD CONSTRAINT payment_orders_status_check
    CHECK (status IN ('pending', 'paid', 'failed', 'rejected', 'cancelled', 'expired'));

ALTER TABLE billing.payment_attempts
  DROP CONSTRAINT payment_attempts_status_check,
  ADD CONSTRAINT payment_attempts_status_check
    CHECK (
      status IN (
        'created', 'submitted', 'pending', 'succeeded', 'rejected',
        'failed', 'cancelled', 'expired', 'unknown'
      )
    );

CREATE OR REPLACE FUNCTION public.billing_update_payment_attempt(
  p_deposit_id uuid,
  p_status text,
  p_provider_transaction_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_order_id uuid;
  v_candidate_id uuid;
BEGIN
  IF p_status IS NULL OR p_status NOT IN (
    'submitted', 'pending', 'unknown', 'rejected', 'failed', 'cancelled', 'expired'
  ) THEN
    RAISE EXCEPTION 'invalid_attempt_status' USING ERRCODE = '22023';
  END IF;

  SELECT a.order_id, o.candidate_id
    INTO v_order_id, v_candidate_id
    FROM billing.payment_attempts AS a
    JOIN billing.payment_orders AS o ON o.id = a.order_id
   WHERE a.merchant_reference = p_deposit_id::text
   FOR UPDATE OF a, o;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_attempt_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_candidate_id IS NOT NULL THEN
    PERFORM 1
      FROM public.candidates AS c
     WHERE c.id = v_candidate_id
     FOR UPDATE;
  END IF;

  UPDATE billing.payment_attempts
     SET status = p_status,
         provider_reference = COALESCE(p_provider_transaction_id, provider_reference),
         completed_at = CASE
           WHEN p_status IN ('rejected', 'failed', 'cancelled', 'expired') THEN now()
           ELSE completed_at
         END,
         updated_at = now()
   WHERE merchant_reference = p_deposit_id::text
     AND status <> 'succeeded';

  IF p_status IN ('rejected', 'failed', 'cancelled', 'expired') THEN
    UPDATE billing.payment_orders
       SET status = CASE WHEN status = 'paid' THEN status ELSE p_status END,
           updated_at = now()
     WHERE id = v_order_id;
    UPDATE billing.scheduled_changes
       SET status = 'expired', updated_at = now()
     WHERE payment_order_id = v_order_id
       AND status = 'awaiting_payment';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_update_payment_attempt(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.billing_update_payment_attempt(uuid, text, text)
  TO service_role;
ALTER FUNCTION public.billing_update_payment_attempt(uuid, text, text) OWNER TO postgres;

NOTIFY pgrst, 'reload schema';
