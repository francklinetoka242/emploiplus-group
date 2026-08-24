CREATE TABLE public.candidate_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE REFERENCES public.candidates(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_onboarding_candidate_id ON public.candidate_onboarding(candidate_id);

ALTER TABLE public.candidate_onboarding ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.candidate_onboarding TO authenticated;
GRANT ALL ON public.candidate_onboarding TO service_role;

CREATE POLICY "Candidates read own onboarding" ON public.candidate_onboarding
  FOR SELECT TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE POLICY "Candidates create own onboarding" ON public.candidate_onboarding
  FOR INSERT TO authenticated
  WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE POLICY "Candidates update own onboarding" ON public.candidate_onboarding
  FOR UPDATE TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE TRIGGER set_candidate_onboarding_updated_at
  BEFORE UPDATE ON public.candidate_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
