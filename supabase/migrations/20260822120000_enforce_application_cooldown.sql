-- Allow a candidate to reapply after 30 days while blocking rapid duplicates.
ALTER TABLE public.job_applications
  DROP CONSTRAINT IF EXISTS job_applications_candidate_id_job_offer_id_key;

CREATE OR REPLACE FUNCTION public.enforce_application_cooldown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Serialize attempts for the same candidate and offer to close the double-submit race.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.candidate_id::text || ':' || NEW.job_offer_id::text, 0));

  IF EXISTS (
    SELECT 1
    FROM public.job_applications
    WHERE candidate_id = NEW.candidate_id
      AND job_offer_id = NEW.job_offer_id
      AND applied_at > now() - interval '30 days'
  ) THEN
    RAISE EXCEPTION 'Une candidature pour cette offre existe déjà avant le délai de 30 jours.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_application_cooldown ON public.job_applications;
CREATE TRIGGER trg_enforce_application_cooldown
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_application_cooldown();
