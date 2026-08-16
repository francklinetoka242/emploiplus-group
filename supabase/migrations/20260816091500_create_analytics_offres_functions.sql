-- Analytics-Offres: secure PostgreSQL RPCs for admin dashboards.
-- Access is restricted to existing admin/super_admin roles.

DROP FUNCTION IF EXISTS public.analytics_offres_kpis(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_kpis(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_evolution(
  TEXT,
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_evolution(
  TEXT,
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_by_offer(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  TEXT,
  public.application_status,
  INTEGER
);

DROP FUNCTION IF EXISTS public.analytics_offres_by_offer(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status,
  INTEGER
);

DROP FUNCTION IF EXISTS public.analytics_offres_by_company(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status,
  INTEGER
);

DROP FUNCTION IF EXISTS public.analytics_offres_by_contract(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_by_location(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status,
  INTEGER
);

DROP FUNCTION IF EXISTS public.analytics_offres_status_breakdown(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status
);

DROP FUNCTION IF EXISTS public.analytics_offres_offer_performance(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status,
  INTEGER
);

DROP FUNCTION IF EXISTS public.analytics_offres_offers_without_applications(
  TEXT,
  public.contract_type,
  TEXT
);

DROP FUNCTION IF EXISTS public.analytics_offres_top_companies(
  TIMESTAMPTZ,
  TIMESTAMPTZ,
  TEXT,
  public.contract_type,
  TEXT,
  public.application_status,
  INTEGER
);

CREATE OR REPLACE FUNCTION public.analytics_offres_kpis(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL
)
RETURNS TABLE (
  total_applications BIGINT,
  unique_candidates BIGINT,
  avg_applications_per_candidate NUMERIC,
  offers_with_applications BIGINT,
  published_offers BIGINT,
  active_offers BIGINT,
  expired_offers BIGINT,
  offers_without_applications BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Access denied: Analytics-Offres admin access required';
  END IF;

  RETURN QUERY
  WITH filtered_apps AS (
    SELECT *
    FROM public.analytics_offres_application_fact a
    WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
      AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
      AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
      AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
      AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
      AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
      AND (p_status IS NULL OR a.application_status = p_status)
  ),
  filtered_offers AS (
    SELECT *
    FROM public.job_offers jo
    WHERE (p_company IS NULL OR lower(COALESCE(jo.company, '')) LIKE '%' || lower(p_company) || '%')
      AND (p_contract_type IS NULL OR jo.contract_type = p_contract_type)
      AND (p_location_city IS NULL OR lower(COALESCE(jo.location_city, '')) LIKE '%' || lower(p_location_city) || '%')
      AND (p_location_country IS NULL OR lower(COALESCE(jo.location_country, '')) LIKE '%' || lower(p_location_country) || '%')
      AND (p_start_date IS NULL OR (jo.publish_at IS NOT NULL AND jo.publish_at >= p_start_date))
      AND (p_end_date IS NULL OR (jo.publish_at IS NOT NULL AND jo.publish_at <= p_end_date))
  )
  SELECT
    COUNT(*)::BIGINT AS total_applications,
    COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates,
    ROUND(CAST(COUNT(*) AS NUMERIC) / NULLIF(COUNT(DISTINCT candidate_id), 0), 2) AS avg_applications_per_candidate,
    COUNT(DISTINCT job_offer_id)::BIGINT AS offers_with_applications,
    (SELECT COUNT(*) FROM filtered_offers WHERE status = 'published')::BIGINT AS published_offers,
    (SELECT COUNT(*) FROM filtered_offers WHERE status = 'published' AND (expires_at IS NULL OR expires_at > now()))::BIGINT AS active_offers,
    (SELECT COUNT(*) FROM filtered_offers WHERE status = 'expired' OR (status = 'published' AND expires_at IS NOT NULL AND expires_at <= now()))::BIGINT AS expired_offers,
    (SELECT COUNT(*) FROM filtered_offers fo LEFT JOIN public.job_applications ja ON ja.job_offer_id = fo.id WHERE ja.id IS NULL)::BIGINT AS offers_without_applications
  FROM filtered_apps;
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_evolution(
  p_group_by TEXT DEFAULT 'month',
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL
)
RETURNS TABLE (
  period_key TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  applications BIGINT,
  unique_candidates BIGINT,
  offers_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Access denied: Analytics-Offres admin access required';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT a.*
    FROM public.analytics_offres_application_fact a
    WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
      AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
      AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
      AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
      AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
      AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
      AND (p_status IS NULL OR a.application_status = p_status)
  )
  SELECT
    CASE p_group_by
      WHEN 'day' THEN to_char(date_trunc('day', applied_at), 'YYYY-MM-DD')
      WHEN 'week' THEN to_char(date_trunc('week', applied_at), 'YYYY-MM-DD')
      WHEN 'quarter' THEN to_char(date_trunc('quarter', applied_at), 'YYYY-MM')
      WHEN 'year' THEN to_char(date_trunc('year', applied_at), 'YYYY')
      ELSE to_char(date_trunc('month', applied_at), 'YYYY-MM')
    END AS period_key,
    date_trunc(
      CASE p_group_by
        WHEN 'day' THEN 'day'
        WHEN 'week' THEN 'week'
        WHEN 'quarter' THEN 'quarter'
        WHEN 'year' THEN 'year'
        ELSE 'month'
      END,
      applied_at
    ) AS period_start,
    (date_trunc(
      CASE p_group_by
        WHEN 'day' THEN 'day'
        WHEN 'week' THEN 'week'
        WHEN 'quarter' THEN 'quarter'
        WHEN 'year' THEN 'year'
        ELSE 'month'
      END,
      applied_at
    ) + INTERVAL '1 ' ||
      CASE p_group_by
        WHEN 'day' THEN 'day'
        WHEN 'week' THEN 'week'
        WHEN 'quarter' THEN 'quarter'
        WHEN 'year' THEN 'year'
        ELSE 'month'
      END - INTERVAL '1 microsecond') AS period_end,
    COUNT(*)::BIGINT AS applications,
    COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates,
    COUNT(DISTINCT job_offer_id)::BIGINT AS offers_count
  FROM filtered
  GROUP BY 1, 2, 3
  ORDER BY 2;
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_by_offer(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  offer_id UUID,
  offer_title TEXT,
  company TEXT,
  contract_type public.contract_type,
  location_city TEXT,
  applications_count BIGINT,
  unique_candidates BIGINT,
  offer_status TEXT,
  publish_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
SELECT
  jo.id AS offer_id,
  jo.title AS offer_title,
  jo.company,
  jo.contract_type,
  jo.location_city,
  COUNT(DISTINCT ja.id)::BIGINT AS applications_count,
  COUNT(DISTINCT ja.candidate_id)::BIGINT AS unique_candidates,
  jo.status::TEXT AS offer_status,
  jo.publish_at,
  jo.expires_at
FROM public.job_offers jo
LEFT JOIN public.job_applications ja
  ON ja.job_offer_id = jo.id
    AND (p_start_date IS NULL OR ja.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR ja.applied_at <= p_end_date)
    AND (p_status IS NULL OR ja.status = p_status)
WHERE (p_company IS NULL OR lower(COALESCE(jo.company, '')) LIKE '%' || lower(p_company) || '%')
  AND (p_contract_type IS NULL OR jo.contract_type = p_contract_type)
  AND (p_location_city IS NULL OR lower(COALESCE(jo.location_city, '')) LIKE '%' || lower(p_location_city) || '%')
  AND (p_location_country IS NULL OR lower(COALESCE(jo.location_country, '')) LIKE '%' || lower(p_location_country) || '%')
GROUP BY jo.id, jo.title, jo.company, jo.contract_type, jo.location_city, jo.status, jo.publish_at, jo.expires_at
ORDER BY applications_count DESC, jo.created_at DESC
LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_by_company(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  company TEXT,
  offers_count BIGINT,
  applications_count BIGINT,
  unique_candidates BIGINT,
  avg_applications_per_offer NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
), company_stats AS (
  SELECT
    company,
    COUNT(DISTINCT job_offer_id)::BIGINT AS offers_count,
    COUNT(*)::BIGINT AS applications_count,
    COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates
  FROM filtered
  GROUP BY company
)
SELECT
  company,
  offers_count,
  applications_count,
  unique_candidates,
  ROUND(CAST(applications_count AS NUMERIC) / NULLIF(offers_count, 0), 2) AS avg_applications_per_offer
FROM company_stats
ORDER BY applications_count DESC
LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_by_contract(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL
)
RETURNS TABLE (
  contract_type public.contract_type,
  applications_count BIGINT,
  unique_candidates BIGINT,
  percentage NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
), totals AS (
  SELECT COUNT(*)::NUMERIC AS total_count
  FROM filtered
)
SELECT
  contract_type,
  COUNT(*)::BIGINT AS applications_count,
  COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates,
  ROUND(CAST(COUNT(*) AS NUMERIC) / NULLIF((SELECT total_count FROM totals), 0) * 100, 2) AS percentage
FROM filtered
GROUP BY contract_type
ORDER BY applications_count DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_by_location(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  location_city TEXT,
  location_country TEXT,
  applications_count BIGINT,
  unique_candidates BIGINT,
  offers_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
)
SELECT
  COALESCE(offer_location_city, 'Non renseignée') AS location_city,
  COALESCE(offer_location_country, 'Non renseignée') AS location_country,
  COUNT(*)::BIGINT AS applications_count,
  COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates,
  COUNT(DISTINCT job_offer_id)::BIGINT AS offers_count
FROM filtered
GROUP BY COALESCE(offer_location_city, 'Non renseignée'), COALESCE(offer_location_country, 'Non renseignée')
ORDER BY applications_count DESC
LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_status_breakdown(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL
)
RETURNS TABLE (
  application_status public.application_status,
  applications_count BIGINT,
  percentage NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
), totals AS (
  SELECT COUNT(*)::NUMERIC AS total_count FROM filtered
)
SELECT
  application_status,
  COUNT(*)::BIGINT AS applications_count,
  ROUND(CAST(COUNT(*) AS NUMERIC) / NULLIF((SELECT total_count FROM totals), 0) * 100, 2) AS percentage
FROM filtered
GROUP BY application_status
ORDER BY applications_count DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_offer_performance(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  offer_id UUID,
  offer_title TEXT,
  company TEXT,
  applications_count BIGINT,
  unique_candidates BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered_applications AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
), offer_stats AS (
  SELECT
    job_offer_id AS offer_id,
    MAX(company) AS company,
    MAX(offer_title) AS offer_title,
    COUNT(*)::BIGINT AS applications_count,
    COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates
  FROM filtered_applications
  GROUP BY job_offer_id
)
SELECT
  offer_id,
  offer_title,
  company,
  applications_count,
  unique_candidates,
  ROUND(CAST(applications_count AS NUMERIC) / NULLIF((SELECT COUNT(*) FROM public.job_offers WHERE status = 'published'), 0) * 100, 2) AS conversion_rate
FROM offer_stats
ORDER BY applications_count DESC
LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_offers_without_applications(
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL
)
RETURNS TABLE (
  offer_id UUID,
  title TEXT,
  company TEXT,
  contract_type public.contract_type,
  location_city TEXT,
  publish_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  offer_status TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
SELECT
  jo.id AS offer_id,
  jo.title,
  jo.company,
  jo.contract_type,
  jo.location_city,
  jo.publish_at,
  jo.expires_at,
  jo.status::TEXT AS offer_status
FROM public.job_offers jo
LEFT JOIN public.job_applications ja
  ON ja.job_offer_id = jo.id
WHERE ja.id IS NULL
  AND (p_company IS NULL OR lower(COALESCE(jo.company, '')) LIKE '%' || lower(p_company) || '%')
  AND (p_contract_type IS NULL OR jo.contract_type = p_contract_type)
  AND (p_location_city IS NULL OR lower(COALESCE(jo.location_city, '')) LIKE '%' || lower(p_location_city) || '%')
  AND (p_location_country IS NULL OR lower(COALESCE(jo.location_country, '')) LIKE '%' || lower(p_location_country) || '%')
ORDER BY jo.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_offres_top_companies(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_contract_type public.contract_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_status public.application_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  company TEXT,
  applications_count BIGINT,
  offers_count BIGINT,
  unique_candidates BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
WITH filtered AS (
  SELECT a.*
  FROM public.analytics_offres_application_fact a
  WHERE (p_start_date IS NULL OR a.applied_at >= p_start_date)
    AND (p_end_date IS NULL OR a.applied_at <= p_end_date)
    AND (p_company IS NULL OR lower(COALESCE(a.company, '')) LIKE '%' || lower(p_company) || '%')
    AND (p_contract_type IS NULL OR a.contract_type = p_contract_type)
    AND (p_location_city IS NULL OR lower(COALESCE(a.offer_location_city, '')) LIKE '%' || lower(p_location_city) || '%')
    AND (p_location_country IS NULL OR lower(COALESCE(a.offer_location_country, '')) LIKE '%' || lower(p_location_country) || '%')
    AND (p_status IS NULL OR a.application_status = p_status)
)
SELECT
  company,
  COUNT(*)::BIGINT AS applications_count,
  COUNT(DISTINCT job_offer_id)::BIGINT AS offers_count,
  COUNT(DISTINCT candidate_id)::BIGINT AS unique_candidates
FROM filtered
GROUP BY company
ORDER BY applications_count DESC
LIMIT p_limit;
$$;

COMMENT ON FUNCTION public.analytics_offres_kpis IS 'Returns global KPI values for the admin Analytics-Offres dashboard.';
COMMENT ON FUNCTION public.analytics_offres_evolution IS 'Returns cumulative application trend grouped by day/week/month/quarter/year';
COMMENT ON FUNCTION public.analytics_offres_by_offer IS 'Returns offer-level application counts and unique candidate counts.';
COMMENT ON FUNCTION public.analytics_offres_by_company IS 'Returns application volume by company.';
COMMENT ON FUNCTION public.analytics_offres_by_contract IS 'Returns application distribution by contract type.';
COMMENT ON FUNCTION public.analytics_offres_by_location IS 'Returns application distribution by location.';
COMMENT ON FUNCTION public.analytics_offres_status_breakdown IS 'Returns distribution of application status values.';
COMMENT ON FUNCTION public.analytics_offres_offer_performance IS 'Returns most attractive offers by application count.';
COMMENT ON FUNCTION public.analytics_offres_offers_without_applications IS 'Returns offers without any applications.';
COMMENT ON FUNCTION public.analytics_offres_top_companies IS 'Returns companies with highest application counts.';
