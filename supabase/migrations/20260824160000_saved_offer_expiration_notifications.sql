ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS job_offer_id uuid REFERENCES public.job_offers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS expiration_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_saved_offer_expiration_once
ON public.notifications (user_id, job_offer_id, expiration_at)
WHERE type = 'offre'::public.notification_type
  AND user_id IS NOT NULL
  AND job_offer_id IS NOT NULL
  AND expiration_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.notify_saved_offer_expirations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    status,
    is_read,
    link,
    job_offer_id,
    expiration_at
  )
  SELECT
    candidate.user_id,
    'offre'::public.notification_type,
    'L’offre « ' || job.title || ' » expire bientôt.',
    'Pensez à postuler avant sa clôture.',
    'active'::public.notification_status,
    false,
    '/jobs/' || job.slug,
    job.id,
    COALESCE(job.deadline, job.expires_at)
  FROM public.candidate_saved_offers AS saved
  JOIN public.candidates AS candidate ON candidate.id = saved.candidate_id
  JOIN public.job_offers AS job ON job.id = saved.job_offer_id
  CROSS JOIN LATERAL (SELECT COALESCE(job.deadline, job.expires_at) AS expiration) AS dates
  WHERE candidate.user_id = auth.uid()
    AND job.status = 'published'
    AND dates.expiration > now()
    AND dates.expiration <= now() + interval '7 days'
  ON CONFLICT (user_id, job_offer_id, expiration_at) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_saved_offer_expirations() TO authenticated;