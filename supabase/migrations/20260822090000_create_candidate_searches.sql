CREATE TABLE IF NOT EXISTS public.candidate_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidate_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_saved_searches_candidate
  ON public.candidate_saved_searches(candidate_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_search_history_candidate
  ON public.candidate_search_history(candidate_id, searched_at DESC);

ALTER TABLE public.candidate_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_search_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_saved_searches TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.candidate_search_history TO authenticated;

CREATE POLICY "Candidates manage their saved searches" ON public.candidate_saved_searches
  FOR ALL TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE POLICY "Candidates manage their search history" ON public.candidate_search_history
  FOR ALL TO authenticated
  USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()));

CREATE TRIGGER set_candidate_saved_searches_updated_at BEFORE UPDATE ON public.candidate_saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();