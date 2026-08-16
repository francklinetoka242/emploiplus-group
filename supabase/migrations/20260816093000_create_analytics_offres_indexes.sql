-- Performance indexes for Analytics-Offres.
-- Kept to the actual filters used by the application and offer analytics queries.

CREATE INDEX IF NOT EXISTS idx_job_applications_offer_status_applied_at
  ON public.job_applications (job_offer_id, status, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_applied_at
  ON public.job_applications (candidate_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_offers_company_status_created_at
  ON public.job_offers (company, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_offers_contract_status_publish_at
  ON public.job_offers (contract_type, status, publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_offers_location_status_publish_at
  ON public.job_offers (location_city, status, publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_offers_country_status_publish_at
  ON public.job_offers (location_country, status, publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_offers_publish_at_expires_at
  ON public.job_offers (publish_at, expires_at);

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at_status
  ON public.job_applications (applied_at DESC, status);
