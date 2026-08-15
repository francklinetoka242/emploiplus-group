# Audit technique — récupération du CV candidat sur le site web

## 1) Point de départ : identification du candidat connecté
- Le candidat connecté est identifié dans `src/features/candidates/hooks/useCandidate.ts` via `useAuthContext()`, qui donne `user` et `isAuthenticated`.
- `useCandidate()` appelle `getCandidateProfileByUserId(user.id)` lorsque `isAuthenticated && user?.id` est présent.
- La fonction réelle est `src/features/candidates/api/profileApi.ts` -> `getCandidateProfileByUserId(userId)`.
- La requête Supabase est : `.from("candidates").select("id, user_id, ..., cv_text, embedding_vector, cv_url, ...").eq("user_id", userId).maybeSingle()`.
- Donc `candidate.id` est retrouvé par la table `candidates` en filtrant sur `user_id = auth.user.id`.
- Hooks/services/API réellement utilisés : `useAuthContext`, `useCandidate`, `getCandidateProfileByUserId`, `supabase.from("candidates")`.

## 2) Source du CV
- La référence au CV est dans la table Supabase `candidates`.
- Colonnes utilisées : `id`, `user_id`, `cv_url`, `cv_text`, `embedding_vector`, plus `status`, `email`, etc.
- Le CV n’est pas récupéré depuis une table dédiée de documents ; il est lu dans `candidates`.
- Le fichier réel est stocké dans Supabase Storage, avec `cv_url` pointant soit vers une URL publique, soit vers un chemin Storage tel que `candidates/{candidateId}/cv/...`.
- Bucket réel : `CANDIDATE_DOCUMENTS_BUCKET` dans `src/services/storageService.ts`.
- Valeur exacte : `import.meta.env.VITE_SUPABASE_CANDIDATE_BUCKET || import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public"`.
- Chemin d’upload réel : `uploadFileToStorage(file, \'candidates/${candidateId}/cv\', CANDIDATE_DOCUMENTS_BUCKET, true)` dans `src/features/candidates/api/documentsApi.ts`.
- L’URL finale est construite dans `resolveStorageUrl()` de `src/services/storageService.ts` : `supabase.storage.from(bucket).getPublicUrl(filename)` si possible, sinon `createSignedUrl(filename, 60 * 60)`.
- Donc le site combine : DB (`cv_url`/`cv_text`) + Storage (`file` real) + localStorage (cache UI).

## 3) Parcours complet réel
- Candidat connecté
→ `useAuthContext()` donne l’utilisateur authentifié
→ `useCandidate()` charge `getCandidateProfileByUserId(user.id)`
→ `src/features/candidates/api/profileApi.ts` retourne le profil `candidates` avec `cv_text` et `cv_url`
→ `src/pages/candidate/CandidateCVPage.tsx` récupère les documents du candidat via `getCandidateDocuments(profile.id)`
→ si `localStorage` est vide mais que `profile.cv_url` existe, il convertit `profile.cv_url` en URL signée via `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(serverCvUrl, 60 * 60)`
→ l’interface affiche le CV ou le document
→ si le CV est uploadé, `uploadAndProcessCandidateCV()` appelle `processCandidateCvUpload()`
→ `processCandidateCvUpload()` extrait le texte PDF via `extractTextFromPdf()` puis appelle `updateCandidateCvText(candidateId, cvText, cvUrl)`
→ `updateCandidateCvText()` met à jour `candidates.cv_text` et `candidates.embedding_vector` et éventuellement `candidates.cv_url`
→ le CV est ensuite utilisé par l’interface et par l’IA/matching.

## 4) Différence CV_TEXT / CV_URL / fichier réel / métadonnées
- `candidates.cv_text` : texte OCR/extrait du CV, stocké en base, utilisé pour l’analyse IA / matching / résumé du profil. C’est la donnée textuelle.
- `candidates.cv_url` : URL ou chemin Storage de la version PDF, stocké en base, utilisé pour retrouver le fichier téléchargeable/affichable.
- Le PDF réel : fichier dans Supabase Storage, pas dans la table `candidates`.
- Métadonnées document : `localStorage` key `emploiplus-candidate-documents-${candidateId}` contient `{ cv, documents }` avec `id`, `type`, `name`, `displayName`, `date`, `size`, `url`, `customType`.
- Pour afficher/télécharger : la page utilise `cv.url` ou `profile.cv_url` converti en URL signée.
- Pour l’analyse IA : `cv_text` est prioritaire via `processCandidateCvUpload()` et `updateCandidateCvText()`.
- Pour le matching : `cv_text` et `embedding_vector` sont calculés et utilisés par les RPC de matching et les analyses de jobs.
- Pour les candidatures : le CV peut être réutilisé depuis les documents sauvegardés ou depuis la profile URL; le site réutilise la liste locale et les docs liés à la candidature.
- Pour vérifier si le candidat possède un CV : le code vérifie `profile?.cv_text`, `profile?.cv_url`, ou `candidateDocuments.cv?.url` selon le contexte.

## 5) Cas où le CV est déjà enregistré
- Si `cv_url` existe, `CandidateCVPage` le préfère comme source serveur lorsque `localStorage` n’a pas de CV client.
- Si `cv_url` n’est pas une URL HTTP, il est traité comme un chemin Storage et transformé avec `createSignedUrl`.
- Si `cv_text` existe, il est utilisé dans les calculs IA/matching et en dashboard (`profile?.cv_text`, `candidateCvText`).
- Si le fichier est dans Storage, le code le retrouve via le bucket + chemin + `createSignedUrl`.
- Priorité réelle observée dans le code :
  1. `localStorage` cache document (`emploiplus-candidate-documents-${candidateId}`) pour l’UI
  2. `profile.cv_url` comme fallback serveur
  3. `profile.cv_text` pour la donnée textuelle IA/matching
  4. le PDF réel dans Storage pour téléchargement/affichage
- Le site ne “recherche pas un fichier depuis la base” sans passer par `cv_url` ou une URL signée à partir du bucket.

## 6) LocalStorage
- La clé exacte utilisée : `emploiplus-candidate-documents-${candidateId}`.
- Elle est introduite dans `src/features/candidates/api/documentsApi.ts` et `src/features/candidates/hooks/useCandidateDocuments.ts`.
- Valeur stockée : `{ cv, documents }` avec fichiers/docs du candidat.
- C’est un cache UI, pas la source primaire du CV textuel.
- Le code considère `localStorage` comme secondaire par rapport à `profile.cv_url`/`profile.cv_text`.
- Si `localStorage` est vide mais que `candidates.cv_url` existe, `CandidateCVPage` reconstruit l’URL via Supabase Storage et l’affiche quand même.

## 7) Fonctions réellement impliquées
- Hooks : `useCandidate()` dans `src/features/candidates/hooks/useCandidate.ts`.
- API profil : `getCandidateProfileByUserId()` dans `src/features/candidates/api/profileApi.ts`.
- API document/CV : `getCandidateDocuments()`, `saveCandidateDocuments()`, `uploadAndProcessCandidateCV()`, `uploadCandidateDocument()`, `deleteCandidateCV()`, `deleteCandidateDocument()` dans `src/features/candidates/api/documentsApi.ts`.
- Storage : `CANDIDATE_DOCUMENTS_BUCKET`, `uploadFileToStorage()`, `resolveStorageUrl()` dans `src/services/storageService.ts`.
- Extraction/lecture PDF : `extractTextFromPdf()`, `updateCandidateCvText()`, `processCandidateCvUpload()` dans `src/services/aiMatchingService.ts`.
- Supabase calls : `.from("candidates")`, `.storage.from(bucket).getPublicUrl()`, `.storage.from(bucket).createSignedUrl()`, `.storage.from(bucket).upload()`.

## 8) Authentification et sécurité
- L’authentification du candidat connecté repose sur `useAuthContext` + `user.id`.
- Le rattachement à la bonne fiche candidat se fait par `candidates.user_id = auth.user.id`.
- La page `CandidateCVPage` ne montre un CV que s’il y a un `profile.id`, provenant du profil trouvé pour `user.id`.
- Les règles RLS ne sont pas visibles dans le code UI, mais le flux code réel crée bien un lien direct : `auth.user.id` → `candidates.user_id` → `candidate.id` → storage path `candidates/{candidateId}/...`.
- Le Storage est protégé par le bucket et l’URL signée; le code ne présente pas de mécanisme complémentaire explicite de vérification “propriétaire” au-delà de ce couplage `user_id` / `candidate.id` / path candidat.

## 9) Résultat final
### FLUX EXACT DU CV SUR LE WEB
Connexion
→ `useAuthContext()` identifie l’utilisateur
→ `useCandidate()` appelle `getCandidateProfileByUserId(user.id)`
→ `candidates` renvoie `cv_text` + `cv_url` + `id`
→ `CandidateCVPage` restaure le documents cache et/ou reconstruit l’URL Storage
→ `Supabase Storage` délivre le fichier PDF ou l’URL signée
→ le CV est affiché/chargé, puis utilisé pour l’IA/matching via `cv_text` et `embedding_vector`

### INFORMATIONS À TRANSMETTRE À L’APPLICATION MOBILE
- L’utilisateur authentifié est lié à la ligne `candidates` par `user_id`.
- Le CV est stocké dans `candidates.cv_url` et/ou `candidates.cv_text` dans la table `candidates`.
- Le PDF réel est dans le bucket `CANDIDATE_DOCUMENTS_BUCKET`, path type `candidates/{candidateId}/cv/...`.
- L’URL finale est obtenue par `getPublicUrl()` ou `createSignedUrl()`.
- Le texte extrait du PDF est stocké dans `cv_text` pour l’IA/matching.
- Le cache UI est `emploiplus-candidate-documents-${candidateId}`; il n’est pas la source principale du CV.
- La récupération du CV doit donc reconstituer la même logique : auth.user.id → candidate row → cv_url/cv_text → Storage URL → affichage/IA.