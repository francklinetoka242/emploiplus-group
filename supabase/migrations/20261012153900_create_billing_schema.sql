CREATE SCHEMA billing;

REVOKE ALL ON SCHEMA billing FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA billing TO service_role;

CREATE TABLE billing.plan_versions (
  plan_code text NOT NULL CHECK (plan_code IN ('free', 'premium', 'premium_plus')),
  version integer NOT NULL CHECK (version > 0),
  price_xaf bigint NOT NULL CHECK (price_xaf >= 0),
  currency text NOT NULL DEFAULT 'XAF' CHECK (currency = 'XAF'),
  duration_days smallint,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_code, version),
  CONSTRAINT plan_versions_duration_price_check CHECK (
    (plan_code = 'free' AND price_xaf = 0 AND duration_days IS NULL)
    OR
    (
      plan_code <> 'free'
      AND price_xaf > 0
      AND duration_days IS NOT NULL
      AND duration_days = 30
    )
  ),
  CONSTRAINT plan_versions_validity_check CHECK (
    valid_to IS NULL OR valid_to > valid_from
  )
);

CREATE UNIQUE INDEX plan_versions_one_current_per_plan_idx
  ON billing.plan_versions (plan_code)
  WHERE valid_to IS NULL;

INSERT INTO billing.plan_versions (plan_code, version, price_xaf, duration_days)
VALUES
  ('free', 1, 0, NULL),
  ('premium', 1, 550, 30),
  ('premium_plus', 1, 1050, 30);

CREATE TABLE billing.candidate_entitlements (
  candidate_id uuid PRIMARY KEY
    REFERENCES public.candidates(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  plan_version integer NOT NULL,
  starts_at timestamptz,
  expires_at timestamptz,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (plan_code, plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT,
  CONSTRAINT candidate_entitlements_period_check CHECK (
    (plan_code = 'free' AND starts_at IS NULL AND expires_at IS NULL)
    OR
    (
      plan_code <> 'free'
      AND starts_at IS NOT NULL
      AND expires_at IS NOT NULL
      AND expires_at > starts_at
    )
  )
);

CREATE TABLE billing.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  order_type text NOT NULL CHECK (
    order_type IN ('initial', 'renewal', 'scheduled_change', 'upgrade_proration')
  ),
  plan_code text NOT NULL,
  plan_version integer NOT NULL,
  gross_xaf bigint NOT NULL CHECK (gross_xaf > 0),
  currency text NOT NULL DEFAULT 'XAF' CHECK (currency = 'XAF'),
  idempotency_key text NOT NULL UNIQUE CHECK (length(btrim(idempotency_key)) > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'failed', 'cancelled', 'expired')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (plan_code, plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT,
  CONSTRAINT payment_orders_paid_at_check CHECK (
    (status = 'paid' AND paid_at IS NOT NULL)
    OR (status <> 'paid' AND paid_at IS NULL)
  )
);

CREATE INDEX payment_orders_candidate_created_idx
  ON billing.payment_orders (candidate_id, created_at DESC);
CREATE UNIQUE INDEX payment_orders_one_pending_per_candidate_idx
  ON billing.payment_orders (candidate_id)
  WHERE candidate_id IS NOT NULL AND status = 'pending';

CREATE TABLE billing.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL
    REFERENCES billing.payment_orders(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider = 'pawapay'),
  merchant_reference text NOT NULL UNIQUE
    CHECK (length(btrim(merchant_reference)) > 0),
  provider_reference text UNIQUE,
  payment_channel text CHECK (
    payment_channel IS NULL OR length(btrim(payment_channel)) > 0
  ),
  gross_xaf bigint NOT NULL CHECK (gross_xaf > 0),
  currency text NOT NULL DEFAULT 'XAF' CHECK (currency = 'XAF'),
  fee_estimated_xaf bigint CHECK (fee_estimated_xaf >= 0),
  fee_actual_xaf bigint CHECK (fee_actual_xaf >= 0),
  net_actual_xaf bigint,
  status text NOT NULL DEFAULT 'created' CHECK (
    status IN (
      'created', 'submitted', 'pending', 'succeeded', 'failed',
      'cancelled', 'expired', 'unknown'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT payment_attempts_actual_amounts_check CHECK (
    (fee_actual_xaf IS NULL AND net_actual_xaf IS NULL)
    OR (
      fee_actual_xaf IS NOT NULL
      AND net_actual_xaf IS NOT NULL
      AND fee_actual_xaf <= gross_xaf
      AND net_actual_xaf = gross_xaf - fee_actual_xaf
    )
  )
);

CREATE INDEX payment_attempts_order_created_idx
  ON billing.payment_attempts (order_id, created_at DESC);
CREATE INDEX payment_attempts_status_created_idx
  ON billing.payment_attempts (status, created_at);
CREATE UNIQUE INDEX payment_attempts_one_open_per_order_idx
  ON billing.payment_attempts (order_id)
  WHERE status IN ('created', 'submitted', 'pending', 'unknown');
CREATE UNIQUE INDEX payment_attempts_one_success_per_order_idx
  ON billing.payment_attempts (order_id)
  WHERE status = 'succeeded';

CREATE TABLE billing.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider = 'pawapay'),
  dedupe_key text NOT NULL CHECK (length(btrim(dedupe_key)) > 0),
  provider_event_key text,
  payment_attempt_id uuid
    REFERENCES billing.payment_attempts(id) ON DELETE SET NULL,
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  authentication_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'processing', 'processed', 'rejected')
  ),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_code text,
  UNIQUE (provider, dedupe_key),
  UNIQUE (provider, provider_event_key),
  CONSTRAINT webhook_events_processed_at_check CHECK (
    (status = 'processed' AND processed_at IS NOT NULL)
    OR (status <> 'processed' AND processed_at IS NULL)
  )
);

CREATE INDEX webhook_events_status_received_idx
  ON billing.webhook_events (status, received_at);
CREATE INDEX webhook_events_attempt_idx
  ON billing.webhook_events (payment_attempt_id);

CREATE TABLE billing.entitlement_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  order_id uuid NOT NULL UNIQUE
    REFERENCES billing.payment_orders(id) ON DELETE RESTRICT,
  plan_code text NOT NULL,
  plan_version integer NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (plan_code, plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT,
  CONSTRAINT entitlement_periods_dates_check CHECK (ends_at > starts_at)
);

CREATE INDEX entitlement_periods_candidate_dates_idx
  ON billing.entitlement_periods (candidate_id, starts_at DESC);

CREATE TABLE billing.scheduled_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  change_type text NOT NULL CHECK (change_type IN ('upgrade', 'downgrade')),
  target_plan_code text NOT NULL,
  target_plan_version integer NOT NULL,
  effective_at timestamptz NOT NULL,
  payment_order_id uuid UNIQUE
    REFERENCES billing.payment_orders(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending', 'awaiting_payment', 'paid_scheduled', 'applied',
      'cancelled', 'expired', 'superseded'
    )
  ),
  reason_code text NOT NULL CHECK (length(btrim(reason_code)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (target_plan_code, target_plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX scheduled_changes_one_open_per_candidate_idx
  ON billing.scheduled_changes (candidate_id)
  WHERE candidate_id IS NOT NULL
    AND status IN ('pending', 'awaiting_payment', 'paid_scheduled');
CREATE INDEX scheduled_changes_effective_idx
  ON billing.scheduled_changes (effective_at)
  WHERE status IN ('pending', 'awaiting_payment', 'paid_scheduled');

CREATE TABLE billing.entitlement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  payment_order_id uuid
    REFERENCES billing.payment_orders(id) ON DELETE RESTRICT,
  period_id uuid
    REFERENCES billing.entitlement_periods(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (
    event_type IN (
      'purchase', 'renewal', 'upgrade_proration', 'scheduled_change',
      'expiry', 'cancellation', 'account_deletion'
    )
  ),
  old_plan_code text,
  old_plan_version integer,
  new_plan_code text,
  new_plan_version integer,
  old_expires_at timestamptz,
  new_expires_at timestamptz,
  reason_code text NOT NULL CHECK (length(btrim(reason_code)) > 0),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (old_plan_code, old_plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT,
  FOREIGN KEY (new_plan_code, new_plan_version)
    REFERENCES billing.plan_versions(plan_code, version) ON DELETE RESTRICT,
  CONSTRAINT entitlement_events_plan_pairs_check CHECK (
    (old_plan_code IS NULL) = (old_plan_version IS NULL)
    AND (new_plan_code IS NULL) = (new_plan_version IS NULL)
  )
);

CREATE INDEX entitlement_events_candidate_occurred_idx
  ON billing.entitlement_events (candidate_id, occurred_at DESC);

ALTER TABLE billing.plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.plan_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.candidate_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.candidate_entitlements FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.webhook_events FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.entitlement_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.entitlement_periods FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.scheduled_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.scheduled_changes FORCE ROW LEVEL SECURITY;
ALTER TABLE billing.entitlement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.entitlement_events FORCE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA billing
  FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA billing TO service_role;
