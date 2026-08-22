ALTER TABLE public.candidate_preferences
  ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'immediately',
  ADD COLUMN IF NOT EXISTS availability_date TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS job_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS job_alert_frequency TEXT NOT NULL DEFAULT 'weekly';

CREATE INDEX IF NOT EXISTS idx_candidate_preferences_availability_status
  ON public.candidate_preferences(availability_status);