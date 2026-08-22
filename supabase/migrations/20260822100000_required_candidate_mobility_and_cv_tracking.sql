-- Required schema additions for missing candidate mobility and CV freshness tracking.
-- Execute manually in Supabase if the environment does not already include these columns.

ALTER TABLE public.candidate_preferences
  ADD COLUMN IF NOT EXISTS mobility_radius_km INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS mobility_modes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS cv_last_updated_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_cv_last_updated_at
  ON public.candidates(cv_last_updated_at);

CREATE INDEX IF NOT EXISTS idx_candidate_preferences_mobility_radius
  ON public.candidate_preferences(mobility_radius_km);
