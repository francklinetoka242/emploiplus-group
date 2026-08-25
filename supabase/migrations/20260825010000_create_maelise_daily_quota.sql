CREATE TABLE public.maelise_daily_quota (
  candidate_id UUID PRIMARY KEY REFERENCES public.candidates(id) ON DELETE CASCADE,
  question_count INTEGER NOT NULL DEFAULT 0,
  period_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maelise_daily_quota ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.maelise_daily_quota TO authenticated;
GRANT ALL ON public.maelise_daily_quota TO service_role;

CREATE POLICY "Candidates read their own Maelise daily quota"
  ON public.maelise_daily_quota FOR SELECT TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.consume_maelise_daily_quota(
  p_candidate_id UUID,
  p_max_questions INTEGER DEFAULT 20
)
RETURNS TABLE (allowed BOOLEAN, available_at TIMESTAMPTZ, question_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window TIMESTAMPTZ := now();
  current_count INTEGER;
  current_period TIMESTAMPTZ;
BEGIN
  INSERT INTO public.maelise_daily_quota (candidate_id, question_count, period_started_at, updated_at)
  VALUES (p_candidate_id, 1, current_window, current_window)
  ON CONFLICT (candidate_id) DO UPDATE
  SET question_count = CASE
      WHEN public.maelise_daily_quota.period_started_at <= current_window - INTERVAL '24 hours'
        THEN 1
      WHEN public.maelise_daily_quota.question_count < p_max_questions
        THEN public.maelise_daily_quota.question_count + 1
      ELSE public.maelise_daily_quota.question_count
    END,
    period_started_at = CASE
      WHEN public.maelise_daily_quota.period_started_at <= current_window - INTERVAL '24 hours'
        THEN current_window
      ELSE public.maelise_daily_quota.period_started_at
    END,
    updated_at = current_window
  RETURNING maelise_daily_quota.question_count, maelise_daily_quota.period_started_at
  INTO current_count, current_period;

  allowed := current_count <= p_max_questions;
  available_at := current_period + INTERVAL '24 hours';
  question_count := current_count;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_maelise_daily_quota(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_maelise_daily_quota(UUID, INTEGER) TO service_role;

CREATE TRIGGER set_maelise_daily_quota_updated_at
  BEFORE UPDATE ON public.maelise_daily_quota
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();