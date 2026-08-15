# Gestion des documents candidat – site web EmploiPlus

## 1. Identification du candidat connecté
- Le point de départ est `src/features/candidates/hooks/useCandidate.ts`: `useAuthContext()` fournit `user` et `isAuthenticated`.
- Si `isAuthenticated && user?.id`, `useCandidate()` appelle `getCandidateProfileByUserId(user.id)`.
- `src/features/candidates/api/profileApi.ts` fait la requête `supabase.from("candidates").select(..., "cv_text, embedding_vector, cv_url").eq("user_id", userId).maybeSingle()`.
- `candidate.id` est donc retrouvé dans `public.candidates` via `user_id = auth.uid()`.

## 2. Structure de la base
- Il n’existe pas de table dédiée aux documents dans le code ou les migrations.
- La table principale est `public.candidates` créée dans `supabase/migrations/20260702_create_candidates_table.sql`.
- Colonnes concernées: `id`, `user_id`, `cv_url`, `cv_text`, `embedding_vector`.
- `cv_url` est ajouté par `supabase/migrations/20260727_add_cv_url_to_candidates.sql`.
- `cv_text` et `embedding_vector` sont ajoutés par `supabase/migrations/2026_add_pgvector_matching.sql`.
- Les documents non-CV ne sont pas stockés en table DB; leur métadonnée est seulement dans `localStorage`.

## 3. Supabase Storage
- Bucket configuré côté code: `src/services/storageService.ts` -> `CANDIDATE_DOCUMENTS_BUCKET = env.VITE_SUPABASE_CANDIDATE_BUCKET || env.VITE_SUPABASE_STORAGE_BUCKET || "public"`.
- Chemin CV: `candidates/${candidateId}/cv`.
- Chemin autres docs: `candidates/${candidateId}/documents`.
- Nom de fichier généré: `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`.
- `resolveStorageUrl()` appelle `supabase.storage.from(bucket).getPublicUrl(filename)` puis `createSignedUrl(filename, 60 * 60)`.
- Le SQL de migration `20260704_add_candidate_documents_storage_policies.sql` applique des policies pour `storage.objects` avec `bucket_id = 'candidat-doc'`; le code front n’utilise pas cette valeur littérale, il utilise le bucket env/fallback.

## 4. Upload réel
- Fonction principale: `src/features/candidates/api/documentsApi.ts` -> `uploadAndProcessCandidateCV()` et `uploadCandidateDocument()`.
- `uploadFileToStorage(file, folder, bucketName, forceSignedUrl)` dans `src/services/storageService.ts` upload le PDF dans Supabase Storage.
- Validation: `ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"]`; `MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024`.
- `uploadCandidateCV()` appelle `uploadFileToStorage(file, \'candidates/${candidateId}/cv\', CANDIDATE_DOCUMENTS_BUCKET, true)`.
- `uploadCandidateDocument()` appelle `uploadFileToStorage(file, \'candidates/${candidateId}/documents\', CANDIDATE_DOCUMENTS_BUCKET, true)`.
- Pour le CV, le code enregistre localement `{ cv, documents }` dans `localStorage` puis appelle `processCandidateCvUpload(candidateId, file, path ?? url)`.

## 5. Données enregistrées
- `candidates.cv_text`: texte extrait du PDF, stocké en DB.
- `candidates.cv_url`: URL ou chemin Storage du PDF, stocké en DB.
- `localStorage` key: `emploiplus-candidate-documents-${candidateId}`.
- Structure: `{ cv, documents }`; `cv` et `documents[]` contiennent `id`, `name`, `displayName`, `date`, `size`, `url`, `customType`.
- `CandidateDocument.type` exacts: `motivation | diploma | certificate | attestation | portfolio | other | recepisse`.
- Le CV n’est pas un `CandidateDocument.type`; c’est un objet séparé `CandidateCVState`.

## 6. Récupération du CV déjà enregistré
- `src/features/candidates/api/documentsApi.ts` -> `getCandidateDocuments(candidateId)` lit `localStorage` uniquement.
- Si le cache local est vide, `src/pages/candidate/CandidateCVPage.tsx` regarde `profile?.cv_url`.
- Si `profile.cv_url` n’est pas une URL HTTP, il transforme le chemin Storage avec `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(serverCvUrl, 60 * 60)`.
- Hiérarchie réelle: cache local -> `profile.cv_url` -> `profile.cv_text` -> Storage réel.
- `cv_text` sert surtout à l’IA/matching; l’URL sert à afficher/télécharger le fichier.

## 7. Récupération des autres documents
- `getCandidateDocuments(candidateId)` retourne le cache local `{ cv, documents }`.
- `CandidateDocumentsPage.tsx` et `DocumentsSection.tsx` affichent `documents[]` avec `url` et icônes preview/download/delete.
- `window.open(doc.url, "_blank")` est utilisé pour afficher/ouvrir; il n’y a pas de `list()` Storage côté app pour les documents candidats.

## 8. Sécurité / RLS
- Table `public.candidates`: `SELECT/INSERT/UPDATE` policy `user_id = auth.uid()`. `service_role` est autorisé.
- `public.is_staff(auth.uid())` a aussi accès en lecture.
- Storage migration: `storage.objects` policies `FOR SELECT/INSERT/UPDATE/DELETE TO authenticated` avec `bucket_id = 'candidat-doc'`.
- Le code front ne vérifie pas d’autre ownership que le couplage `auth.user.id -> candidates.user_id -> candidate.id`.

## 9. Suppression
- `deleteCandidateDocument(candidateId, documentId)` filtre le tableau local puis réécrit `localStorage`.
- `deleteCandidateCV(candidateId)` remet `cv: null` dans `localStorage`.
- Il n’y a pas d’appel `supabase.storage.from(...).remove(...)` dans ce flux.
- Donc la suppression réelle du fichier Storage n’est pas faite par ce code; seule la donnée locale est supprimée.

## 10. Flux réel complet
- `auth.user.id` -> `public.candidates.user_id` -> `candidate.id` -> `candidate.cv_url` / `candidate.cv_text` -> `Supabase Storage` (URL ou chemin) -> affichage UI / IA / matching.

## 11. Types documentaires
- `cv`: spécial, stocké en `candidates.cv_url` et `cv_text`.
- `motivation`: document local `documents[]`, type `motivation`.
- `diploma`: `documents[]`, type `diploma`.
- `certificate`: `documents[]`, type `certificate`.
- `attestation`: `documents[]`, type `attestation`.
- `portfolio`: `documents[]`, type `portfolio`.
- `recepisse`: `documents[]`, type `recepisse`.
- `other`: `documents[]`, type `other` avec `customType`.

## 12. Fichiers / fonctions / tables / buckets importants
- `src/features/candidates/hooks/useCandidate.ts` – `useCandidate()`
- `src/features/candidates/api/profileApi.ts` – `getCandidateProfileByUserId()`
- `src/features/candidates/api/documentsApi.ts` – `getCandidateDocuments()`, `saveCandidateDocuments()`, `uploadAndProcessCandidateCV()`, `uploadCandidateDocument()`, `deleteCandidateDocument()`, `deleteCandidateCV()`
- `src/services/storageService.ts` – `CANDIDATE_DOCUMENTS_BUCKET`, `uploadFileToStorage()`, `resolveStorageUrl()`
- `src/services/aiMatchingService.ts` – `extractTextFromPdf()`, `updateCandidateCvText()`, `processCandidateCvUpload()`
- `supabase/migrations/20260702_create_candidates_table.sql` – `public.candidates`
- `supabase/migrations/20260727_add_cv_url_to_candidates.sql` – `cv_url`
- `supabase/migrations/2026_add_pgvector_matching.sql` – `cv_text`, `embedding_vector`
- `supabase/migrations/20260704_add_candidate_documents_storage_policies.sql` – policies Storage
- Bucket réel côté code: `CANDIDATE_DOCUMENTS_BUCKET` (env-driven; default `public`)
- Key localStorage: `emploiplus-candidate-documents-${candidateId}`
