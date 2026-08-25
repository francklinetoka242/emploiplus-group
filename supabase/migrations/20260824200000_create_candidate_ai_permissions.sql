CREATE TABLE public.candidate_ai_permissions (
  candidate_id UUID PRIMARY KEY REFERENCES public.candidates(id) ON DELETE CASCADE,
  identity_contact BOOLEAN NOT NULL DEFAULT false,
  cv BOOLEAN NOT NULL DEFAULT false,
  career_profile BOOLEAN NOT NULL DEFAULT false,
  preferences BOOLEAN NOT NULL DEFAULT false,
  applications BOOLEAN NOT NULL DEFAULT false,
  saved_offers_searches BOOLEAN NOT NULL DEFAULT false,
  alerts BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_ai_permissions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.candidate_ai_permissions TO authenticated;
GRANT ALL ON public.candidate_ai_permissions TO service_role;

CREATE POLICY "Candidates manage their own AI permissions"
  ON public.candidate_ai_permissions FOR ALL TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE TRIGGER set_candidate_ai_permissions_updated_at
  BEFORE UPDATE ON public.candidate_ai_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();