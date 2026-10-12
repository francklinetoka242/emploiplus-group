# PawaPay Sandbox backend configuration

Payment APIs are server-side Vercel functions and reject any PawaPay API base URL other than the documented Sandbox host over HTTPS. Do not configure production credentials for this integration.

## Local development

Set the following names in the ignored local `.env` file; do not commit values:

- Existing server Supabase settings: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Required PawaPay settings: `PAWAPAY_API_TOKEN`, `PAWAPAY_BASE_URL`, `PAWAPAY_COUNTRY_CODE`.
- Callback endpoints: `PAWAPAY_CALLBACK_URL`, `PAWAPAY_CHECKOUT_CALLBACK_URL`, `PAWAPAY_PAYOUT_CALLBACK_URL`, `PAWAPAY_REFUND_CALLBACK_URL`, and `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED`.
- Reconciliation endpoint: `PAWAPAY_RECONCILE_SECRET` and `PAWAPAY_RECONCILE_AFTER_SECONDS`.

Use the official Sandbox base URL from PawaPay documentation for `PAWAPAY_BASE_URL`. Choose the country code only after confirming it is enabled for deposits in the merchant account. The backend verifies the selected provider and XAF support against the account's active configuration and validates the phone number/provider through PawaPay.

`PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` must be explicitly set to `true` or `false` after checking the merchant dashboard. When enabled, callbacks are verified using RFC 9421 and PawaPay's authenticated `/v2/public-key/http` endpoint. When disabled, callback contents are untrusted signals; the deposit handler and the checkout, payout, and refund handlers still confirm the operation status through the authenticated PawaPay API before recording an event.

Set each callback URL to the exact public HTTPS URL configured in the PawaPay Sandbox dashboard, without query parameters:

- `PAWAPAY_CALLBACK_URL`: `POST /api/payments/pawapay/callback` (Deposits).
- `PAWAPAY_CHECKOUT_CALLBACK_URL`: `POST /api/payments/pawapay/checkouts/callback`.
- `PAWAPAY_PAYOUT_CALLBACK_URL`: `POST /api/payments/pawapay/payouts/callback`.
- `PAWAPAY_REFUND_CALLBACK_URL`: `POST /api/payments/pawapay/refunds/callback`.

The project uses separate endpoints so the callback type and signed request path are unambiguous. PawaPay permits one URL to be reused for all types, but doing so is not necessary with these routes. Checkouts and payouts are recorded as provider-verified callback events only; they do not initiate or credit transactions. A refund must be registered against an already-paid source deposit before its callback can be acknowledged. The additive migration creates a service-role-only registration RPC, but this repository does not yet provide an operator refund-initiation workflow; Refunds are not ready for use until that workflow exists and pre-registers each refund.

`PAWAPAY_RECONCILE_AFTER_SECONDS` is the operator-selected minimum age before the scheduled/manual reconciliation endpoint considers an open attempt.

No PawaPay fee schedule or profitability threshold is configured. Immediate prorated upgrades remain disabled; upgrades and downgrades are scheduled at the current entitlement expiry using the applicable plan price.

## Vercel Sandbox project

Configure the same variable names in the Sandbox Vercel project environment. Keep all API tokens, Supabase service-role credentials and reconciliation secrets server-only (not `VITE_` variables). Set `CRON_SECRET` in Vercel for authenticated hourly reconciliation; the route also accepts manual `POST /api/payments/pawapay/reconcile` requests authenticated with `PAWAPAY_RECONCILE_SECRET`. The cron processes pending/ambiguous deposits and applies due expirations. Confirm that the Vercel plan supports hourly Cron Jobs before deploying this configuration.

Apply the billing migrations in order after confirming the Supabase migration history:

1. `supabase/migrations/20261012160000_add_billing_backend_rpcs.sql` provides the payment RPCs, if it has not already been applied.
2. `supabase/migrations/20261012163000_add_billing_subscription_read_rpc.sql` adds the candidate subscription read RPC.
3. `supabase/migrations/20261012164000_distinguish_rejected_billing_attempts.sql` records an explicit PawaPay initiation rejection separately from a failed deposit.
4. `supabase/migrations/20261012170000_add_pawapay_callback_categories.sql` adds durable event records for Checkout, Payout, and Refund callbacks plus the Refund-to-deposit registration RPC. It has not been executed; review and apply it once, after confirming the deployed migration history.

Do not rerun `20261012153900_create_billing_schema.sql`. Apply only migrations not already recorded as applied, in timestamp order. This repository change does not execute SQL or inspect/change any Supabase or Vercel settings.
