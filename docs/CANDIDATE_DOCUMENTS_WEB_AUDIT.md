# Audit documents candidat — Web EmploiPlus

## 1. PAGE DOCUMENTS
- Route : `/candidate/documents`.
- Page principale : `src/pages/candidate/CandidateDocumentsPage.tsx`.
- Enfant principal : `src/features/profile/components/sections/DocumentsSection.tsx`.
- Hooks : `useCandidate()` ; `useCandidateDocuments(profile?.id)`.
- API/services : `src/features/candidates/api/documentsApi.ts` ; `src/services/storageService.ts`.
- Contexte : none explicit; page works from `profile.id` and localStorage.
- Stockage : localStorage + Supabase Storage bucket (`CANDIDATE_DOCUMENTS_BUCKET`).
- Parcours : Authenticated route → `CandidateDocumentsPage` → `DocumentsSection` → upload/list/delete of PDF docs.

## 2. TYPES DE DOCUMENTS SUPPORTÉS
- `cv` / “Mon CV” : PDF, optional, max 2 Mo, used as CV for profile/AI matching.
- `motivation` / “Lettre de motivation” : PDF, optional, max 2 Mo, used as candidate file.
- `diploma` / “Diplôme” : PDF, optional, max 2 Mo, used as diplomas.
- `certificate` / “Certificat” : PDF, optional, max 2 Mo, used as certificates.
- `attestation` / “Attestation” : PDF, optional, max 2 Mo, used as attestations.
- `portfolio` / “Portfolio” : PDF, optional, max 2 Mo, used as portfolio.
- `recepisse` / “Récépissé ACPE” : PDF, optional, max 2 Mo, used as receipt.
- `other` / “Autre” : PDF, optional, max 2 Mo, custom label allowed.
- Source réel : `DOCUMENT_TYPES` in `DocumentsSection.tsx`.

## 3. AJOUT / UPLOAD
- UI : hidden file input triggered by “Choisir un PDF” button.
- Validation : `ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"]`; `MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024`.
- Messages : “Seuls les fichiers PDF sont acceptés…”, “Le fichier dépasse la limite de 2 Mo…”.
- Nommage : `Date.now() + random` stored as `candidates/{candidateId}/cv` or `/documents`; extension kept from original file name.
- Stockage : `uploadFileToStorage(file, folder, bucket, forceSignedUrl)` in `storageService.ts`.
- Bucket : `VITE_SUPABASE_CANDIDATE_BUCKET` or `VITE_SUPABASE_STORAGE_BUCKET` or `public`.
- Métadonnées : localStorage key `emploiplus-candidate-documents-${candidateId}`; object `{ cv, documents }` with `id`, `type`, `name`, `displayName`, `date`, `size`, `url`, `customType`.
- Upload flow : `uploadAndProcessCandidateCV()`/`uploadCandidateDocument()`, then save in localStorage; CV also triggers `processCandidateCvUpload()` for AI extraction.
- Succès : message success and toast; CV gets event `cv-uploaded`.
- Erreur : catch and display `error.message` in UI; no retry button.

## 4. LISTE DES DOCUMENTS AFFICHÉS
- Composant : `DocumentsSection`.
- Affichage par document : type label (or custom label), date formatted FR, size, eye icon, download icon, delete icon.
- No status badge or explicit “validated” state in the UI; only completion grid with check circles by type.
- Preview/download : both use `window.open(doc.url, "_blank", ...)`.

## 5. ACTIONS DISPONIBLES
- Aperçu : `window.open(doc.url, "_blank", ...)`.
- Téléchargement : same as preview, no `download` attribute.
- Suppression : `handleDelete` + confirm dialog.
- Remplacer : not explicit; same type upload reuses same input and overwrites local metadata for same document list.
- Définir comme CV : not a special action; “cv” is a document type and upload flows through `uploadAndProcessCandidateCV()`.
- Sélectionner pour candidature : not in documents page; handled in `CandidateJobApplyPage` via `selectedDocuments` set from saved docs.

## 6. SUPPRESSION
- `deleteCandidateDocument(candidateId, documentId)` filters localStorage list, then saves it back.
- `deleteCandidateCV(candidateId)` clears local `cv` in localStorage.
- Confirmation : `window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")`.
- Important : no Supabase Storage delete is called; server file itself is not deleted from bucket in this code.
- Error behavior : caught at UI layer, then displayed as feedback error.

## 7. DONNÉES ET BASE DE DONNÉES
- Supabase tables réellement utilisées pour le document candidat : `candidates` (for `cv_url`, `user_id`, profile metadata); no dedicated document table in code.
- Important columns : `candidates.id`, `candidates.user_id`, `candidates.cv_url`, `candidates.first_name`, `last_name`, `email`, etc.
- Relation : candidate id is derived from `profile.id`; docs are persisted in localStorage keyed by candidate ID, not by DB row.
- Bucket Storage : `CANDIDATE_DOCUMENTS_BUCKET` from env (`VITE_SUPABASE_CANDIDATE_BUCKET` → `VITE_SUPABASE_STORAGE_BUCKET` → `public`).

## 8. CANDIDATURES ET RÉUTILISATION
- `CandidateJobApplyPage` loads saved docs from localStorage via `loadCandidateDocuments(profile.id)` and `getCandidateDocumentsList()`.
- User selects existing docs via `selectedDocuments` set and uploads temp PDFs via `temporaryDocuments`.
- For application submission, selected docs are converted to email attachments; saved docs sent as `path`/url, temp files converted to Base64.
- Docs are mandatory at application time (`selectedDocuments.size > 0 || temporaryDocuments.length > 0`), but not specifically tied to a document table.
- Existing documents are reusable in a candidature; temporary uploaded PDFs are valid only for the current application.

## 9. SÉCURITÉ
- Route protection via `/candidate` + `ProtectedRoute` + permission `dashboard.candidate`.
- Identity from `useAuthContext` + `getCandidateProfileByUserId(user.id)`.
- File validation : MIME PDF + size <= 2 Mo.
- RLS not shown in the UI code; app protects by user route and user-scoped localStorage key.
- Storage access depends on Supabase bucket credentials and env config; no app-side ownership verification beyond profile ID.

## SPÉCIFICATION À REPRODUIRE DANS L'APPLICATION MOBILE
- Types : `cv`, `motivation`, `diploma`, `certificate`, `attestation`, `portfolio`, `recepisse`, `other`.
- Champs : `id`, `type`, `name`, `displayName`, `date`, `size`, `url`, `customType`.
- Règles : PDF only, 2 Mo max, bucket path `candidates/{candidateId}/...`.
- Stockage : localStorage key `emploiplus-candidate-documents-{candidateId}` + Supabase Storage bucket.
- Actions : upload, preview, download, delete; no dedicated replace flow in web code.
- États UI : loading, success message, error message, completion checklist by type.
- Reuse for application : select saved docs from candidate document list; temporary files allowed for one application only.
- Important : no formal DB document table; metadata is client-side local state, while file content is in Supabase Storage.
