# Flux actuel de la page Documents candidat

- Route: `/candidate/documents` -> `src/pages/candidate/CandidateDocumentsPage.tsx`.
- Page: `CandidateDocumentsPage` appelle `useCandidate()` (`src/features/candidates/hooks/useCandidate.ts`) puis `useCandidateDocuments(profile?.id)` (`src/features/candidates/hooks/useCandidateDocuments.ts`).
- Profil Supabase: `src/features/candidates/api/profileApi.ts` -> `getCandidateProfileByUserId(userId)` -> `supabase.from("candidates").select(..., cv_url, ...).eq("user_id", userId).maybeSingle()`.
- Documents locaux: `useCandidateDocuments` lit `localStorage` key `emploiplus-candidate-documents-${profileId}` et parse `{ cv, documents }`; ce JSON est la source principale des métadonnées affichées.
- `src/features/profile/components/sections/DocumentsSection.tsx` reçoit `cv`, `documents`, `candidateId`, `serverCvUrl`, `onAddDocument`, `onDeleteDocument` et construit `allDocuments = [cv, ...documents]` puis `documentsByType`.
- CV: `profile.cv_url` est le champ utilisé; si c’est un chemin Storage, `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(path, 3600)` génère une URL signée. Bucket défini dans `src/services/storageService.ts`.
- Autres docs: `uploadCandidateDocument()` dans `src/features/candidates/api/documentsApi.ts` télécharge le PDF via `uploadFileToStorage(file, "candidates/${candidateId}/documents", CANDIDATE_DOCUMENTS_BUCKET, true)` puis renvoie `{ id, type, ... , url, customType }`.
- Types réellement supportés: `cv`, `motivation`, `diploma`, `certificate`, `attestation`, `portfolio`, `recepisse`, `other`.
- Aucune table `candidate_documents` ou relation SQL n’est trouvée; les métadonnées sont JSON local (localStorage), tandis que les fichiers sont dans Supabase Storage.
- Le candidat est identifié par `user_id`/`profile.id` dans `candidates`, et le fichier est associé au candidat via le chemin Storage `candidates/{candidateId}/documents` ou via `candidates/{candidateId}/cv`.
- L’affichage est dans `DocumentsSection` via `allDocuments.map(...)`: nom, type, date, taille, aperçu, téléchargement et suppression.
- `documentsByType` sert à marquer les types complétés; `loading` et `liste vide` sont gérés dans le composant UI.
- Diagnostic technique: le CV suit un chemin distinct (`candidates.cv_url` + Storage + signed URL); les autres documents suivent le flux localStorage JSON + Storage URL; la liste complète est construite côté navigateur à partir de `cv` + `documents`.

AUDIT TERMINÉ
Fichier: WEB_DOCUMENTS_FLOW.md
Code source modifié: NON
