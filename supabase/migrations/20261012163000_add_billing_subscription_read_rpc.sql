CREATE OR REPLACE FUNCTION public.billing_get_candidate_subscription(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, billing
AS $function$
DECLARE
  v_candidate_id uuid;
  v_entitlement jsonb;
  v_scheduled_change jsonb;
  v_pending_order jsonb;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'invalid_candidate_request' USING ERRCODE = '22023';
  END IF;

  SELECT c.id
    INTO v_candidate_id
    FROM public.candidates AS c
   WHERE c.user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidate_profile_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT jsonb_build_object(
    'planCode', p.plan_code,
    'planVersion', p.plan_version,
    'startsAt', p.starts_at,
    'expiresAt', p.ends_at
  )
    INTO v_entitlement
    FROM billing.entitlement_periods AS p
   WHERE p.candidate_id = v_candidate_id
     AND p.starts_at <= now()
     AND p.ends_at > now()
   ORDER BY p.starts_at DESC
   LIMIT 1;

  IF v_entitlement IS NULL THEN
    SELECT jsonb_build_object(
      'planCode', e.plan_code,
      'planVersion', e.plan_version,
      'startsAt', e.starts_at,
      'expiresAt', e.expires_at
    )
      INTO v_entitlement
      FROM billing.candidate_entitlements AS e
     WHERE e.candidate_id = v_candidate_id
       AND e.expires_at > now();
  END IF;

  IF v_entitlement IS NULL THEN
    v_entitlement := jsonb_build_object(
      'planCode', 'free',
      'planVersion', 1,
      'startsAt', NULL,
      'expiresAt', NULL
    );
  END IF;

  SELECT jsonb_build_object(
    'targetPlanCode', s.target_plan_code,
    'effectiveAt', s.effective_at,
    'status', s.status,
    'reasonCode', s.reason_code
  )
    INTO v_scheduled_change
    FROM billing.scheduled_changes AS s
   WHERE s.candidate_id = v_candidate_id
     AND s.status IN ('pending', 'awaiting_payment', 'paid_scheduled')
   ORDER BY s.created_at DESC
   LIMIT 1;

  SELECT jsonb_build_object(
    'orderId', o.id,
    'planCode', o.plan_code,
    'amountXaf', o.gross_xaf,
    'currency', o.currency,
    'status', o.status,
    'depositId', a.merchant_reference,
    'attemptStatus', a.status
  )
    INTO v_pending_order
    FROM billing.payment_orders AS o
    LEFT JOIN LATERAL (
      SELECT pa.merchant_reference, pa.status
        FROM billing.payment_attempts AS pa
       WHERE pa.order_id = o.id
         AND pa.status IN ('created', 'submitted', 'pending', 'unknown')
       ORDER BY pa.created_at DESC
       LIMIT 1
    ) AS a ON true
   WHERE o.candidate_id = v_candidate_id
     AND o.status = 'pending'
   ORDER BY o.created_at DESC
   LIMIT 1;

  RETURN jsonb_build_object(
    'entitlement', v_entitlement,
    'scheduledChange', v_scheduled_change,
    'pendingOrder', v_pending_order
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_get_candidate_subscription(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.billing_get_candidate_subscription(uuid) TO service_role;
ALTER FUNCTION public.billing_get_candidate_subscription(uuid) OWNER TO postgres;

NOTIFY pgrst, 'reload schema';
