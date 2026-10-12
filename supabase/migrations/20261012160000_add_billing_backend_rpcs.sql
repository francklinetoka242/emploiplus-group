CREATE OR REPLACE FUNCTION public.billing_create_order(
  p_user_id uuid,
  p_plan_code text,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_candidate_id uuid;
  v_current_code text := 'free';
  v_current_version integer := 1;
  v_expires_at timestamptz;
  v_order_type text;
  v_price bigint;
  v_version integer;
  v_order billing.payment_orders%ROWTYPE;
  v_schedule billing.scheduled_changes%ROWTYPE;
BEGIN
  IF p_user_id IS NULL
    OR p_plan_code NOT IN ('premium', 'premium_plus')
    OR p_idempotency_key IS NULL
    OR length(btrim(p_idempotency_key)) < 8
    OR length(p_idempotency_key) > 200 THEN
    RAISE EXCEPTION 'invalid_order_request' USING ERRCODE = '22023';
  END IF;

  SELECT c.id
    INTO v_candidate_id
    FROM public.candidates AS c
   WHERE c.user_id = p_user_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate_profile_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.*
    INTO v_order
    FROM billing.payment_orders AS o
   WHERE o.idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_order.candidate_id IS DISTINCT FROM v_candidate_id
      OR v_order.plan_code IS DISTINCT FROM p_plan_code THEN
      RAISE EXCEPTION 'idempotency_key_conflict' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object(
      'orderId', v_order.id,
      'planCode', v_order.plan_code,
      'amountXaf', v_order.gross_xaf,
      'currency', v_order.currency,
      'orderType', v_order.order_type,
      'status', v_order.status
    );
  END IF;

  SELECT e.plan_code, e.plan_version, e.expires_at
    INTO v_current_code, v_current_version, v_expires_at
    FROM billing.candidate_entitlements AS e
   WHERE e.candidate_id = v_candidate_id;
  IF NOT FOUND OR v_expires_at IS NULL OR v_expires_at <= now() THEN
    v_current_code := 'free';
    v_current_version := 1;
    v_expires_at := NULL;
  END IF;

  PERFORM 1
    FROM billing.scheduled_changes AS s
   WHERE s.candidate_id = v_candidate_id
     AND s.status = 'paid_scheduled'
   FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION 'a_paid_scheduled_change_already_exists' USING ERRCODE = '55P03';
  END IF;

  SELECT p.version, p.price_xaf
    INTO v_version, v_price
    FROM billing.plan_versions AS p
   WHERE p.plan_code = p_plan_code
     AND p.valid_from <= now()
     AND (p.valid_to IS NULL OR p.valid_to > now())
   ORDER BY p.version DESC
   LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'plan_not_available' USING ERRCODE = '22023';
  END IF;

  IF v_current_code = 'free' THEN
    v_order_type := 'initial';
  ELSIF v_current_code = p_plan_code THEN
    v_order_type := 'renewal';
  ELSIF (v_current_code, p_plan_code) IN (
    ('premium', 'premium_plus'),
    ('premium_plus', 'premium')
  ) THEN
    v_order_type := 'scheduled_change';
  ELSE
    RAISE EXCEPTION 'unsupported_plan_transition' USING ERRCODE = '22023';
  END IF;

  SELECT o.*
    INTO v_order
    FROM billing.payment_orders AS o
   WHERE o.candidate_id = v_candidate_id
     AND o.status = 'pending'
   ORDER BY o.created_at DESC
   LIMIT 1;
  IF FOUND THEN
    IF v_order.plan_code = p_plan_code
      AND v_order.order_type = v_order_type THEN
      RETURN jsonb_build_object(
        'orderId', v_order.id,
        'planCode', v_order.plan_code,
        'amountXaf', v_order.gross_xaf,
        'currency', v_order.currency,
        'orderType', v_order.order_type,
        'status', v_order.status
      );
    END IF;
    RAISE EXCEPTION 'another_payment_is_pending' USING ERRCODE = '55P03';
  END IF;

  INSERT INTO billing.payment_orders (
    candidate_id, order_type, plan_code, plan_version,
    gross_xaf, currency, idempotency_key
  )
  VALUES (
    v_candidate_id, v_order_type, p_plan_code, v_version,
    v_price, 'XAF', p_idempotency_key
  )
  RETURNING * INTO v_order;

  IF v_order_type = 'scheduled_change' THEN
    SELECT s.*
      INTO v_schedule
      FROM billing.scheduled_changes AS s
     WHERE s.candidate_id = v_candidate_id
       AND s.status IN ('pending', 'awaiting_payment', 'paid_scheduled')
     FOR UPDATE;

    IF FOUND THEN
      IF v_schedule.status = 'paid_scheduled' THEN
        RAISE EXCEPTION 'a_paid_scheduled_change_already_exists' USING ERRCODE = '55P03';
      END IF;
      UPDATE billing.scheduled_changes
         SET change_type = CASE
               WHEN v_current_code = 'premium' THEN 'upgrade'
               ELSE 'downgrade'
             END,
             target_plan_code = p_plan_code,
             target_plan_version = v_version,
             effective_at = v_expires_at,
             payment_order_id = v_order.id,
             status = 'awaiting_payment',
             reason_code = 'plan_change_at_expiry',
             updated_at = now()
       WHERE id = v_schedule.id;
    ELSE
      INSERT INTO billing.scheduled_changes (
        candidate_id, change_type, target_plan_code, target_plan_version,
        effective_at, payment_order_id, status, reason_code
      )
      VALUES (
        v_candidate_id,
        CASE WHEN v_current_code = 'premium' THEN 'upgrade' ELSE 'downgrade' END,
        p_plan_code, v_version, v_expires_at, v_order.id,
        'awaiting_payment', 'plan_change_at_expiry'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'orderId', v_order.id,
    'planCode', v_order.plan_code,
    'amountXaf', v_order.gross_xaf,
    'currency', v_order.currency,
    'orderType', v_order.order_type,
    'status', v_order.status
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_get_order(
  p_user_id uuid,
  p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'orderId', o.id,
    'orderType', o.order_type,
    'planCode', o.plan_code,
    'amountXaf', o.gross_xaf,
    'currency', o.currency,
    'status', o.status,
    'paidAt', o.paid_at,
    'depositId', a.merchant_reference,
    'attemptStatus', a.status
  )
  INTO v_result
  FROM billing.payment_orders AS o
  JOIN public.candidates AS c ON c.id = o.candidate_id
  LEFT JOIN LATERAL (
    SELECT pa.merchant_reference, pa.status
      FROM billing.payment_attempts AS pa
     WHERE pa.order_id = o.id
     ORDER BY pa.created_at DESC
     LIMIT 1
  ) AS a ON true
  WHERE o.id = p_order_id
    AND c.user_id = p_user_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0002';
  END IF;
  RETURN v_result;
END;
$function$;

ALTER TABLE billing.payment_attempts
  ADD COLUMN request_fingerprint text
  CHECK (request_fingerprint ~ '^[0-9a-f]{64}$');

CREATE OR REPLACE FUNCTION public.billing_create_payment_attempt(
  p_user_id uuid,
  p_order_id uuid,
  p_deposit_id uuid,
  p_provider_code text,
  p_request_fingerprint text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_order billing.payment_orders%ROWTYPE;
  v_existing billing.payment_attempts%ROWTYPE;
  v_candidate_id uuid;
BEGIN
  IF p_deposit_id IS NULL OR p_provider_code IS NULL
    OR length(btrim(p_provider_code)) = 0
    OR p_request_fingerprint IS NULL
    OR p_request_fingerprint !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid_payment_attempt' USING ERRCODE = '22023';
  END IF;

  SELECT c.id
    INTO v_candidate_id
    FROM public.candidates AS c
   WHERE c.user_id = p_user_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate_profile_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.*
    INTO v_order
    FROM billing.payment_orders AS o
   WHERE o.id = p_order_id
     AND o.candidate_id = v_candidate_id
   FOR UPDATE;
  IF NOT FOUND OR v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'order_not_payable' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
    INTO v_existing
    FROM billing.payment_attempts AS a
   WHERE a.order_id = v_order.id
     AND a.status IN ('created', 'submitted', 'pending', 'unknown')
   FOR UPDATE;
  IF FOUND THEN
    IF v_existing.request_fingerprint IS DISTINCT FROM p_request_fingerprint THEN
      RAISE EXCEPTION 'deposit_retry_payload_conflict' USING ERRCODE = '55P03';
    END IF;
    RETURN jsonb_build_object(
      'depositId', v_existing.merchant_reference,
      'amountXaf', v_existing.gross_xaf,
      'currency', v_existing.currency,
      'status', v_existing.status,
      'providerCode', v_existing.payment_channel
    );
  END IF;

  INSERT INTO billing.payment_attempts (
    order_id, provider, merchant_reference, payment_channel,
    gross_xaf, currency, status, request_fingerprint
  )
  VALUES (
    v_order.id, 'pawapay', p_deposit_id::text, p_provider_code,
    v_order.gross_xaf, v_order.currency, 'created', p_request_fingerprint
  )
  RETURNING * INTO v_existing;

  RETURN jsonb_build_object(
    'depositId', v_existing.merchant_reference,
    'amountXaf', v_existing.gross_xaf,
    'currency', v_existing.currency,
    'status', v_existing.status,
    'providerCode', v_existing.payment_channel
  );
END;
$function$;

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
    'submitted', 'pending', 'unknown', 'failed', 'cancelled', 'expired'
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
           WHEN p_status IN ('failed', 'cancelled', 'expired') THEN now()
           ELSE completed_at
         END,
         updated_at = now()
   WHERE merchant_reference = p_deposit_id::text
     AND status <> 'succeeded';

  IF p_status IN ('failed', 'cancelled', 'expired') THEN
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

CREATE OR REPLACE FUNCTION public.billing_record_webhook_event(
  p_deposit_id uuid,
  p_provider_status text,
  p_payload_sha256 text,
  p_authentication_verified boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_attempt_id uuid;
  v_inserted_id uuid;
  v_dedupe_key text;
BEGIN
  IF p_payload_sha256 !~ '^[0-9a-f]{64}$'
    OR p_provider_status IS NULL OR length(p_provider_status) = 0 THEN
    RAISE EXCEPTION 'invalid_webhook_event' USING ERRCODE = '22023';
  END IF;

  SELECT a.id
    INTO v_attempt_id
    FROM billing.payment_attempts AS a
   WHERE a.merchant_reference = p_deposit_id::text;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_attempt_not_found' USING ERRCODE = 'P0002';
  END IF;

  v_dedupe_key := p_deposit_id::text || ':' || lower(p_provider_status) || ':' || p_payload_sha256;
  INSERT INTO billing.webhook_events (
    provider, dedupe_key, payment_attempt_id, payload_sha256,
    authentication_verified, status
  )
  VALUES (
    'pawapay', v_dedupe_key, v_attempt_id, p_payload_sha256,
    p_authentication_verified, 'received'
  )
  ON CONFLICT (provider, dedupe_key) DO NOTHING
  RETURNING id INTO v_inserted_id;

  RETURN v_inserted_id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_finish_webhook_event(
  p_deposit_id uuid,
  p_payload_sha256 text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
BEGIN
  UPDATE billing.webhook_events AS w
     SET status = 'processed', processed_at = now()
    FROM billing.payment_attempts AS a
   WHERE a.id = w.payment_attempt_id
     AND a.merchant_reference = p_deposit_id::text
     AND w.provider = 'pawapay'
     AND w.payload_sha256 = p_payload_sha256
     AND w.status IN ('received', 'processing');

  IF NOT FOUND AND NOT EXISTS (
    SELECT 1
      FROM billing.webhook_events AS w
      JOIN billing.payment_attempts AS a ON a.id = w.payment_attempt_id
     WHERE a.merchant_reference = p_deposit_id::text
       AND w.provider = 'pawapay'
       AND w.payload_sha256 = p_payload_sha256
       AND w.status = 'processed'
  ) THEN
    RAISE EXCEPTION 'webhook_event_not_found' USING ERRCODE = 'P0002';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_confirm_deposit(
  p_deposit_id uuid,
  p_provider_status text,
  p_amount numeric,
  p_currency text,
  p_provider_transaction_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_attempt billing.payment_attempts%ROWTYPE;
  v_order billing.payment_orders%ROWTYPE;
  v_schedule billing.scheduled_changes%ROWTYPE;
  v_candidate_id uuid;
  v_active_code text := 'free';
  v_active_version integer := 1;
  v_active_expiry timestamptz;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_period_id uuid;
  v_event_type text;
BEGIN
  IF p_provider_status IS NULL OR p_amount IS NULL OR p_currency IS NULL THEN
    RAISE EXCEPTION 'invalid_provider_status_response' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
    INTO v_attempt
    FROM billing.payment_attempts AS a
   WHERE a.merchant_reference = p_deposit_id::text
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_attempt_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.*
    INTO v_order
    FROM billing.payment_orders AS o
   WHERE o.id = v_attempt.order_id
   FOR UPDATE;

  IF p_amount <> v_order.gross_xaf OR p_currency <> v_order.currency THEN
    RAISE EXCEPTION 'provider_amount_or_currency_mismatch' USING ERRCODE = '22023';
  END IF;

  IF v_order.candidate_id IS NULL THEN
    RAISE EXCEPTION 'candidate_profile_deleted' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1
    FROM public.candidates AS c
   WHERE c.id = v_order.candidate_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate_profile_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_order.status = 'paid' AND v_attempt.status = 'succeeded' THEN
    RETURN jsonb_build_object('applied', false, 'status', 'paid');
  END IF;

  IF p_provider_status = 'FAILED' THEN
    UPDATE billing.payment_attempts
       SET status = 'failed', completed_at = now(), updated_at = now()
     WHERE id = v_attempt.id AND status <> 'succeeded';
    UPDATE billing.payment_orders
       SET status = 'failed', updated_at = now()
     WHERE id = v_order.id AND status <> 'paid';
    UPDATE billing.scheduled_changes
       SET status = 'expired', updated_at = now()
     WHERE payment_order_id = v_order.id AND status = 'awaiting_payment';
    RETURN jsonb_build_object('applied', false, 'status', 'failed');
  ELSIF p_provider_status <> 'COMPLETED' THEN
    UPDATE billing.payment_attempts
       SET status = CASE
             WHEN p_provider_status IN ('ACCEPTED', 'PROCESSING', 'IN_RECONCILIATION')
               THEN 'pending'
             ELSE 'unknown'
           END,
           updated_at = now()
     WHERE id = v_attempt.id AND status <> 'succeeded';
    RETURN jsonb_build_object('applied', false, 'status', 'pending');
  END IF;

  SELECT e.plan_code, e.plan_version, e.expires_at
    INTO v_active_code, v_active_version, v_active_expiry
    FROM billing.candidate_entitlements AS e
   WHERE e.candidate_id = v_order.candidate_id
   FOR UPDATE;
  IF NOT FOUND OR v_active_expiry IS NULL OR v_active_expiry <= now() THEN
    v_active_code := 'free';
    v_active_version := 1;
    v_active_expiry := NULL;
  END IF;

  IF v_order.order_type = 'scheduled_change' THEN
    SELECT s.*
      INTO v_schedule
      FROM billing.scheduled_changes AS s
     WHERE s.payment_order_id = v_order.id
       AND s.status = 'awaiting_payment'
     FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scheduled_change_not_pending' USING ERRCODE = '22023';
    END IF;
    IF NOT (
      (v_active_code = 'premium' AND v_order.plan_code = 'premium_plus')
      OR (v_active_code = 'premium_plus' AND v_order.plan_code = 'premium')
      OR v_active_code = 'free'
    ) THEN
      RAISE EXCEPTION 'scheduled_change_state_conflict' USING ERRCODE = '22023';
    END IF;
    v_starts_at := greatest(v_schedule.effective_at, now());
    v_event_type := 'scheduled_change';
  ELSIF v_active_code = v_order.plan_code AND v_active_expiry IS NOT NULL THEN
    v_starts_at := v_active_expiry;
    v_event_type := 'renewal';
  ELSE
    v_starts_at := now();
    v_event_type := 'purchase';
  END IF;

  SELECT (v_starts_at + make_interval(days => p.duration_days))
    INTO v_ends_at
    FROM billing.plan_versions AS p
   WHERE p.plan_code = v_order.plan_code
     AND p.version = v_order.plan_version;
  IF v_ends_at IS NULL OR v_ends_at <= v_starts_at THEN
    RAISE EXCEPTION 'invalid_plan_duration' USING ERRCODE = '22023';
  END IF;

  UPDATE billing.payment_attempts
     SET status = 'succeeded',
         provider_reference = COALESCE(p_provider_transaction_id, provider_reference),
         completed_at = now(),
         updated_at = now()
   WHERE id = v_attempt.id;
  UPDATE billing.payment_orders
     SET status = 'paid', paid_at = now(), updated_at = now()
   WHERE id = v_order.id;

  INSERT INTO billing.entitlement_periods (
    candidate_id, order_id, plan_code, plan_version, starts_at, ends_at
  )
  VALUES (
    v_order.candidate_id, v_order.id, v_order.plan_code,
    v_order.plan_version, v_starts_at, v_ends_at
  )
  RETURNING id INTO v_period_id;

  IF v_starts_at <= now() THEN
    INSERT INTO billing.candidate_entitlements (
      candidate_id, plan_code, plan_version, starts_at, expires_at, revision, updated_at
    )
    VALUES (
      v_order.candidate_id, v_order.plan_code, v_order.plan_version,
      v_starts_at, v_ends_at, 1, now()
    )
    ON CONFLICT (candidate_id) DO UPDATE
      SET plan_code = EXCLUDED.plan_code,
          plan_version = EXCLUDED.plan_version,
          starts_at = EXCLUDED.starts_at,
          expires_at = EXCLUDED.expires_at,
          revision = billing.candidate_entitlements.revision + 1,
          updated_at = now();
  ELSIF v_order.order_type IN ('initial', 'renewal') THEN
    UPDATE billing.candidate_entitlements
       SET expires_at = v_ends_at,
           revision = revision + 1,
           updated_at = now()
     WHERE candidate_id = v_order.candidate_id
       AND plan_code = v_order.plan_code
       AND expires_at = v_starts_at;
  END IF;

  IF v_order.order_type = 'scheduled_change' THEN
    UPDATE billing.scheduled_changes
       SET status = CASE WHEN v_starts_at <= now() THEN 'applied' ELSE 'paid_scheduled' END,
           updated_at = now()
     WHERE id = v_schedule.id;
  END IF;

  INSERT INTO billing.entitlement_events (
    candidate_id, payment_order_id, period_id, event_type,
    old_plan_code, old_plan_version, new_plan_code, new_plan_version,
    old_expires_at, new_expires_at, reason_code
  )
  VALUES (
    v_order.candidate_id, v_order.id, v_period_id, v_event_type,
    v_active_code, v_active_version, v_order.plan_code, v_order.plan_version,
    v_active_expiry, v_ends_at, v_order.order_type
  );

  RETURN jsonb_build_object(
    'applied', true,
    'status', 'paid',
    'planCode', v_order.plan_code,
    'startsAt', v_starts_at,
    'expiresAt', v_ends_at
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_apply_due_entitlements(
  p_limit integer DEFAULT 100
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_candidate record;
  v_period billing.entitlement_periods%ROWTYPE;
  v_count integer := 0;
BEGIN
  IF p_limit < 1 OR p_limit > 500 THEN
    RAISE EXCEPTION 'invalid_batch_limit' USING ERRCODE = '22023';
  END IF;

  FOR v_candidate IN
    SELECT e.candidate_id, e.plan_code, e.plan_version, e.expires_at
      FROM billing.candidate_entitlements AS e
     WHERE e.expires_at <= now()
     ORDER BY e.expires_at
     LIMIT p_limit
     FOR UPDATE SKIP LOCKED
  LOOP
    SELECT p.*
      INTO v_period
      FROM billing.entitlement_periods AS p
     WHERE p.candidate_id = v_candidate.candidate_id
       AND p.starts_at <= now()
       AND p.ends_at > now()
     ORDER BY p.starts_at DESC
     LIMIT 1;

    IF FOUND THEN
      UPDATE billing.candidate_entitlements
         SET plan_code = v_period.plan_code,
             plan_version = v_period.plan_version,
             starts_at = v_period.starts_at,
             expires_at = v_period.ends_at,
             revision = revision + 1,
             updated_at = now()
       WHERE candidate_id = v_candidate.candidate_id;
      UPDATE billing.scheduled_changes
         SET status = 'applied', updated_at = now()
       WHERE candidate_id = v_candidate.candidate_id
         AND payment_order_id = v_period.order_id
         AND status = 'paid_scheduled';
      INSERT INTO billing.entitlement_events (
        candidate_id, payment_order_id, period_id, event_type,
        old_plan_code, old_plan_version, new_plan_code, new_plan_version,
        old_expires_at, new_expires_at, reason_code
      )
      VALUES (
        v_candidate.candidate_id, v_period.order_id, v_period.id, 'scheduled_change',
        v_candidate.plan_code, v_candidate.plan_version,
        v_period.plan_code, v_period.plan_version,
        v_candidate.expires_at, v_period.ends_at, 'scheduled_period_started'
      );
    ELSE
      UPDATE billing.candidate_entitlements
         SET plan_code = 'free',
             plan_version = 1,
             starts_at = NULL,
             expires_at = NULL,
             revision = revision + 1,
             updated_at = now()
       WHERE candidate_id = v_candidate.candidate_id;
      INSERT INTO billing.entitlement_events (
        candidate_id, event_type, old_plan_code, old_plan_version,
        new_plan_code, new_plan_version, old_expires_at, reason_code
      )
      VALUES (
        v_candidate.candidate_id, 'expiry',
        v_candidate.plan_code, v_candidate.plan_version,
        'free', 1, v_candidate.expires_at, 'subscription_expired'
      );
    END IF;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.billing_list_reconcilable_attempts(
  p_before timestamptz,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (deposit_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
BEGIN
  IF p_before IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'invalid_reconciliation_request' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT a.merchant_reference::uuid
    FROM billing.payment_attempts AS a
   WHERE a.status IN ('created', 'submitted', 'pending', 'unknown')
     AND a.updated_at <= p_before
   ORDER BY a.updated_at
   LIMIT p_limit;
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_create_order(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_get_order(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_create_payment_attempt(uuid, uuid, uuid, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_update_payment_attempt(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_record_webhook_event(uuid, text, text, boolean)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_finish_webhook_event(uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_confirm_deposit(uuid, text, numeric, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_apply_due_entitlements(integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.billing_list_reconcilable_attempts(timestamptz, integer)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.billing_create_order(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_get_order(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_create_payment_attempt(uuid, uuid, uuid, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_update_payment_attempt(uuid, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_record_webhook_event(uuid, text, text, boolean)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_finish_webhook_event(uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_confirm_deposit(uuid, text, numeric, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_apply_due_entitlements(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.billing_list_reconcilable_attempts(timestamptz, integer)
  TO service_role;

ALTER FUNCTION public.billing_create_order(uuid, text, text) OWNER TO postgres;
ALTER FUNCTION public.billing_get_order(uuid, uuid) OWNER TO postgres;
ALTER FUNCTION public.billing_create_payment_attempt(uuid, uuid, uuid, text, text) OWNER TO postgres;
ALTER FUNCTION public.billing_update_payment_attempt(uuid, text, text) OWNER TO postgres;
ALTER FUNCTION public.billing_record_webhook_event(uuid, text, text, boolean) OWNER TO postgres;
ALTER FUNCTION public.billing_finish_webhook_event(uuid, text) OWNER TO postgres;
ALTER FUNCTION public.billing_confirm_deposit(uuid, text, numeric, text, text) OWNER TO postgres;
ALTER FUNCTION public.billing_apply_due_entitlements(integer) OWNER TO postgres;
ALTER FUNCTION public.billing_list_reconcilable_attempts(timestamptz, integer) OWNER TO postgres;

NOTIFY pgrst, 'reload schema';
