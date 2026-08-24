CREATE TABLE IF NOT EXISTS public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT,
  custom_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate_id
  ON public.candidate_documents(candidate_id);

ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_documents TO authenticated;
GRANT ALL ON public.candidate_documents TO service_role;

DROP POLICY IF EXISTS "Users see their own candidate documents" ON public.candidate_documents;
CREATE POLICY "Users see their own candidate documents"
  ON public.candidate_documents FOR SELECT TO authenticated
  USING (candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users manage their own candidate documents" ON public.candidate_documents;
CREATE POLICY "Users manage their own candidate documents"
  ON public.candidate_documents FOR ALL TO authenticated
  USING (candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  ))
  WITH CHECK (candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  ));

DROP TRIGGER IF EXISTS set_candidate_documents_updated_at ON public.candidate_documents;
CREATE TRIGGER set_candidate_documents_updated_at
  BEFORE UPDATE ON public.candidate_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Authenticated users can read candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete candidate documents" ON storage.objects;

CREATE POLICY "Candidate owners can read candidate documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidat-doc'
    AND (storage.foldername(name))[1] = 'candidates'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidate owners can upload candidate documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'candidat-doc'
    AND (storage.foldername(name))[1] = 'candidates'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidate owners can update candidate documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'candidat-doc'
    AND (storage.foldername(name))[1] = 'candidates'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'candidat-doc'
    AND (storage.foldername(name))[1] = 'candidates'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidate owners can delete candidate documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'candidat-doc'
    AND (storage.foldername(name))[1] = 'candidates'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.candidates WHERE user_id = auth.uid()
    )
  );
