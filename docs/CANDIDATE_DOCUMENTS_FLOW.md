# Flux de chargement des documents candidat

- La route `/candidate/documents` rend `CandidateDocumentsPage`, qui appelle `useCandidate()` pour charger le profil Supabase via `getCandidateProfileByUserId(user.id)`; cette requête lit la table `profiles` et expose notamment `cv_url`.
- Le hook `useCandidateDocuments(profileId)` lit `localStorage` avec la clé `emploiplus-candidate-documents-${profileId}` et parse le JSON `{ cv, documents }`; s’il existe, il restaure le CV et la liste des documents.
- Les types supportés sont définis dans `CandidateDocument.type` (`motivation`, `diploma`, `certificate`, `attestation`, `portfolio`, `other`, `recepisse`) et regroupés dans `DOCUMENT_TYPES` pour l’UI.
- Le composant `DocumentsSection` reçoit `cv`, `documents`, `candidateId`, `serverCvUrl`, `onAddDocument`, `onDeleteDocument`, puis construit `allDocuments = [cv, ...documents]` et les regroupe par type via `documentsByType`.
- Pour le CV distant, `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(serverCvUrl, 3600)` génère une URL signée, utile si `cv_url` est un chemin Storage et non une URL publique.
- Les fichiers PDF sont uploadés via `uploadFileToStorage(file, folder, bucket, forceSignedUrl)`: il appelle `supabase.storage.from(bucket).upload(filename, file, { upsert: false })` puis `getPublicUrl` ou `createSignedUrl` pour récupérer l’URL de lecture.
- `uploadCandidateDocument(candidateId, file, type, customType)` crée un objet `{ id, type, name, displayName, date, size, url, customType }` et retourne ce document prêt à être affiché.
- `onAddDocument` met à jour le state React (`setDocuments(prev => [doc, ...prev])` ou `setCv(newCv)`), puis `saveCandidateDocuments(profileId, { cv, documents })` réécrit le JSON local avec la nouvelle liste.
- L’affichage se fait via `allDocuments.map(...)`: nom, date, taille, aperçu/téléchargement (`window.open(doc.url, ...)`) et suppression.
- Important : dans ce code, il n’y a pas de table SQL `candidate_documents` interrogée ; les fichiers sont stockés dans Supabase Storage, et leurs métadonnées sont restaurées depuis `localStorage`/JSON, pas depuis une table relationnelle.
