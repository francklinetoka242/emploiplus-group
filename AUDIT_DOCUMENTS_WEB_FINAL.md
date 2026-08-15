# Audit final – documents candidat Supabase web

## 1. Identification du candidat
- Authentification: `src/features/candidates/hooks/useCandidate.ts` via `useAuthContext()`. `user` et `isAuthenticated` sont lus.
- Relation: `useCandidate()` appelle `getCandidateProfileByUserId(user.id)` quand `isAuthenticated && user?.id`.
- Fonction exacte: `src/features/candidates/api/profileApi.ts` -> `getCandidateProfileByUserId(userId)`.
- Requête réelle: `supabase.from("candidates").select("id, user_id, ..., cv_text, embedding_vector, cv_url, ...").eq("user_id", userId).maybeSingle()`.
- `candidate.id` est donc obtenu par `public.candidates` avec `user_id = auth.uid()`.
- La table est créée dans `supabase/migrations/20260702_create_candidates_table.sql`.
- RLS: `CREATE POLICY "Users see their own candidate profile" ... USING (user_id = auth.uid());`

## 2. CV
- Table: `public.candidates`.
- Colonnes: `id`, `user_id`, `cv_url`, `cv_text`, `embedding_vector`, plus profil standard.
- `cv_url` ajouté par `supabase/migrations/20260727_add_cv_url_to_candidates.sql`.
- `cv_text`/`embedding_vector` ajoutés par `supabase/migrations/2026_add_pgvector_matching.sql`.
- Rôle `cv_url`: URL ou chemin Storage pointant vers le PDF.
- Rôle `cv_text`: texte extrait du PDF pour IA/matching.
- PDF réel: fichier Supabase Storage, pas dans la table `candidates`.
- Quand `cv_url` existe: `CandidateCVPage` vérifie `profile?.cv_url`; si ce n’est pas une URL HTTP, il fait `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(serverCvUrl, 60 * 60)`.
- Quand localStorage est vide: le code regarde `profile.cv_url`; si absent, il n’a pas de source PDF client directe en DB autre que `cv_url`/`cv_text`.
- Requête exactes: `.from("candidates").select(..."cv_text, embedding_vector, cv_url").eq("user_id", userId).maybeSingle()`; `.from("candidates").update(payload).eq("id", candidateId)`.

## 3. Supabase Storage
- Bucket exact: `CANDIDATE_DOCUMENTS_BUCKET`.
- Origine: `src/services/storageService.ts` -> `import.meta.env.VITE_SUPABASE_CANDIDATE_BUCKET || import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public"`.
- Variable .env utilisée: `VITE_SUPABASE_CANDIDATE_BUCKET` puis `VITE_SUPABASE_STORAGE_BUCKET`.
- Valeur du dépôt: `.env` contient `VITE_SUPABASE_STORAGE_BUCKET=candidat-doc` et `VITE_SUPABASE_CANDIDATE_BUCKET=candidat-doc`.
- Chemins exacts: `candidates/${candidateId}/cv` pour le CV; `candidates/${candidateId}/documents` pour les autres documents.
- Nom généré: `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`.
- `resolveStorageUrl()` utilise `getPublicUrl(filename)` puis `createSignedUrl(filename, 60 * 60)`.

## 4. Autres documents
- Types réellement définis dans `src/features/candidates/api/documentsApi.ts`:
  `motivation | diploma | certificate | attestation | portfolio | other | recepisse`.
- CV est traité séparément par `CandidateCVState`.
- Fichier réel: Storage Supabase.
- Métadonnées: `localStorage` key `emploiplus-candidate-documents-${candidateId}` => `{ cv, documents }`.
- Structure de document: `id`, `type`, `name`, `displayName`, `date`, `size`, `url`, `customType`.
- `type` est stocké dans l’objet local, pas dans une table DB.
- Le nom, taille, date sont enregistrés dans le payload local; le fichier réel est dans Storage.

## 5. Table documentaire
- `candidate_documents n'est PAS utilisé par le site Web.`
- Il n’existe pas de migration `candidate_documents` dans le projet.
- Les documents ne sont pas stockés dans une table dédiée; ils sont représentés par le cache local et par le Storage.
- Aucune requête `SELECT/INSERT/UPDATE/DELETE` sur une table `candidate_documents` n’est présente dans le code source ou migrations.

## 6. Récupération
- CV: ordre réel = `localStorage` -> `profile.cv_url` -> `profile.cv_text`/Storage.
- Autres documents: `getCandidateDocuments(candidateId)` lit `localStorage`; le front affiche `documents[]` sans `list()` Storage.
- `localStorage` key: `emploiplus-candidate-documents-${candidateId}`.
- `getPublicUrl()` est utilisé dans `src/services/storageService.ts`.
- `createSignedUrl()` est utilisé dans `src/services/storageService.ts` et `CandidateCVPage`.
- `list()` n’est pas utilisé pour les docs candidats dans le code réel vérifié.

## 7. Upload
- Fonction: `src/features/candidates/api/documentsApi.ts` -> `uploadAndProcessCandidateCV()` et `uploadCandidateDocument()`.
- Bucket: `CANDIDATE_DOCUMENTS_BUCKET`.
- Chemin CV: `candidates/${candidateId}/cv`.
- Chemin autres docs: `candidates/${candidateId}/documents`.
- Appel Supabase exact: `supabase.storage.from(bucket).upload(filename, file, { cacheControl: "3600", upsert: false, contentType: file.type || "application/octet-stream" })`.
- Type MIME autorisé: `application/pdf`.
- Taille max: `2 * 1024 * 1024` bytes.
- Données enregistrées après upload: `url`/`path` renvoyés par `uploadFileToStorage`; localStorage `{ cv, documents }`; `candidates.cv_url`/`cv_text` via `updateCandidateCvText()`.

## 8. Visualisation / téléchargement
- `DocumentsSection` / `CandidateCVPage` utilisent `window.open(doc.url, "_blank")` ou le `url` de `profile.cv_url` transformé en URL signée.
- `download` n’est pas utilisé explicitement comme attribut de fichier.
- Le document est ouvert dans un nouvel onglet, pas téléchargé via une API de fichier dédiée.

## 9. Suppression
- `deleteCandidateDocument(candidateId, documentId)` supprime uniquement les métadonnées locales: `filtered = existing.documents.filter(...); saveCandidateDocuments(...)`.
- `deleteCandidateCV(candidateId)` fait `cv: null` dans `localStorage`.
- Appels Storage exacts: aucun `supabase.storage.from(...).remove(...)` n’est présent dans les fonctions documentaires.
- Donc le code ne supprime pas réellement le fichier Storage; il ne fait que nettoyer le cache local.

## 10. Policies / RLS
- Table DB: `public.candidates` avec `user_id = auth.uid()` pour SELECT/INSERT/UPDATE.
- Storage: `supabase/migrations/20260704_add_candidate_documents_storage_policies.sql` crée des policies sur `storage.objects`:
  - `Authenticated users can read candidate documents` => `FOR SELECT ... USING (bucket_id = 'candidat-doc')`
  - `Authenticated users can upload candidate documents` => `FOR INSERT ... WITH CHECK (bucket_id = 'candidat-doc')`
  - `Authenticated users can update candidate documents` => `FOR UPDATE ... USING/ WITH CHECK (bucket_id = 'candidat-doc')`
  - `Authenticated users can delete candidate documents` => `FOR DELETE ... USING (bucket_id = 'candidat-doc')`
- Le bucket réel en logique front est `candidat-doc`.

## 11. Résumé pour le mobile
MOBILE MUST USE
- Auth: `auth.user.id`
- Table candidat: `public.candidates`
- Table documents: `candidate_documents n'est PAS utilisé par le site Web.`
- Bucket: `candidat-doc` (via `VITE_SUPABASE_CANDIDATE_BUCKET`/`VITE_SUPABASE_STORAGE_BUCKET`)
- CV path: `candidates/{candidateId}/cv`
- Other documents path: `candidates/{candidateId}/documents`
- CV column: `candidates.cv_url` and `candidates.cv_text`
- Signed URL: `supabase.storage.from(bucket).createSignedUrl(path, 60 * 60)`
- Upload: `supabase.storage.from(bucket).upload(filename, file, { ... })`
- Delete: no real file delete in web code; only local metadata cleanup
- Source of truth: `public.candidates` DB + Storage + localStorage cache
