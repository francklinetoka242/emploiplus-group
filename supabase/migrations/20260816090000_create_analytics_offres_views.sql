-- Analytics-Offres: source views aligned with existing job_offers / job_applications schema.
-- This keeps stats derived from real data without duplicating core application records.

CREATE OR REPLACE VIEW public.analytics_offres_application_fact AS
SELECT
  ja.id AS application_id,
  ja.candidate_id,
  ja.job_offer_id,
  ja.status AS application_status,
  ja.applied_at,
  ja.updated_at,
  c.created_at AS candidate_created_at,
  c.location_city AS candidate_location_city,
  c.location_country AS candidate_location_country,
  jo.title AS offer_title,
  jo.company,
  jo.location_city AS offer_location_city,
  jo.location_country AS offer_location_country,
  jo.contract_type,
  jo.status AS offer_status,
  jo.publish_at,
  jo.expires_at,
  jo.created_at AS offer_created_at
FROM public.job_applications ja
LEFT JOIN public.job_offers jo
  ON jo.id = ja.job_offer_id
LEFT JOIN public.candidates c
  ON c.id = ja.candidate_id;

CREATE OR REPLACE VIEW public.analytics_offres_offer_fact AS
SELECT
  jo.id AS offer_id,
  jo.title,
  jo.company,
  jo.location_city,
  jo.location_country,
  jo.contract_type,
  jo.status AS offer_status,
  jo.publish_at,
  jo.expires_at,
  jo.created_at,
  COUNT(DISTINCT ja.id) AS applications_count,
  COUNT(DISTINCT ja.candidate_id) AS unique_candidates_count
FROM public.job_offers jo
LEFT JOIN public.job_applications ja
  ON ja.job_offer_id = jo.id
GROUP BY
  jo.id,
  jo.title,
  jo.company,
  jo.location_city,
  jo.location_country,
  jo.contract_type,
  jo.status,
  jo.publish_at,
  jo.expires_at,
  jo.created_at;

COMMENT ON VIEW public.analytics_offres_application_fact IS 'Fact table for Analytics-Offres built from existing job_applications and job_offers tables.';
COMMENT ON VIEW public.analytics_offres_offer_fact IS 'Offer-level aggregation view used by Analytics-Offres queries and RPCs.';
