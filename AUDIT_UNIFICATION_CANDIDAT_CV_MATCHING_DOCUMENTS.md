# Rapport d'unification candidat / CV / matching / documents

## 1. Etat avant correction

Le candidat était chargé par plusieurs chemins. Le CV était représenté à la fois par `candidates.cv_url`, `cv_text`, `embedding_vector`, `candidateDocuments.cv` et `localStorage`. Les documents complémentaires étaient uniquement dans `emploiplus-candidate-documents-{candidateId}`. Le Dashboard acceptait un CV par URL locale/serveur, alors que `/jobs` exigeait le texte ou le vecteur. `JobCard` affichait un score 0-100 comme une valeur 0-1, ce qui saturait les scores à 100 %.

## 2. Problèmes trouvés

- Absence de table serveur pour les documents complémentaires.
- URLs signées susceptibles d'être réécrites dans `candidates.cv_url`.
- Evénement de rafraîchissement déclenché avant la fin de l'extraction.
- Fallback d'analyse CV depuis `localStorage`.
- Résolution du candidat connecté dupliquée dans l'authentification.
- Contrats de présence et d'analyse du CV différents selon les pages.
- Suppression des documents non reliée systématiquement à Storage.

## 3. Architecture retenue

```text
auth.user.id
  -> getCurrentCandidate()
  -> candidates.user_id
  -> candidate.id et profil complet
  -> getCandidateDocuments(candidate.id)
  -> matching / analyse / candidature
```

Le cache navigateur ne décide plus de l'existence du CV ni des documents métier.

## 4. Source unique du candidat

`getCurrentCandidate()` est centralisé dans `src/features/candidates/api/profileApi.ts` et réutilisé par `useCandidate()`. `AuthContext` réutilise également `getCandidateProfileByUserId()` pour détecter le profil candidat.

## 5. Source unique du CV

La ligne `candidates` est la source officielle :

- `cv_url` : chemin Storage durable ;
- `cv_text` : texte extrait ;
- `embedding_vector` : vecteur de matching ;
- `cv_last_updated_at` : date d'extraction.

`src/features/candidates/api/cvApi.ts` centralise :

- `hasCandidateCv()` : CV confirmé côté serveur ;
- `hasAnalyzableCandidateCv()` : texte et vecteur disponibles.

Les URLs signées sont dérivées à la lecture et ne sont plus persistées dans la base.

## 6. Source unique du matching

Dashboard et `/jobs` appellent `getRecommendedJobs()`. Le service impose un CV analysable, charge le même candidat, les mêmes données structurées et applique `computeStructuredMatchScore()`.

Le score reste sur l'échelle 0-100. `JobCard` affiche désormais cette même échelle sans conversion erronée. Aucun fallback ne retourne artificiellement 100.

Après upload, l'événement `cv-uploaded` est envoyé après extraction et mise à jour serveur. Les consommateurs peuvent donc refetcher le nouveau profil sans nouvelle connexion.

## 7. Gestion des documents

Une table `public.candidate_documents` a été ajoutée pour les métadonnées : candidat, type, nom, chemin Storage, taille, libellé personnalisé et dates.

`documentsApi.ts` gère désormais :

- lecture serveur du CV et des documents ;
- insertion des métadonnées après upload ;
- génération d'URL signée temporaire ;
- suppression de la ligne serveur et du fichier Storage ;
- récupération indépendante du navigateur.

`localStorage` ne contient plus les métadonnées métier des documents dans le flux actif.

## 8. Doublons supprimés ou conservés

Supprimés :

- `src/lib/candidate-documents.ts`, devenu inutilisé ;
- sauvegarde locale des CV ;
- fallback d'extraction depuis un CV local ;
- état documents redondant du Dashboard.

Conservés volontairement :

- le wrapper historique `src/hooks/useCandidate.ts`, qui réexporte le hook officiel ;
- les requêtes admin par identifiant candidat ;
- les APIs métier recevant explicitement `candidateId`.

## 9. Fichiers modifiés

- `src/features/candidates/api/cvApi.ts`
- `src/features/candidates/api/profileApi.ts`
- `src/features/candidates/api/documentsApi.ts`
- `src/features/candidates/api/index.ts`
- `src/features/candidates/hooks/useCandidate.ts`
- `src/features/candidates/hooks/useCandidateDocuments.ts`
- `src/features/authentication/context/AuthContext.tsx`
- `src/pages/candidate/CandidateCVPage.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/pages/candidate/CandidateJobApplyPage.tsx`
- `src/pages/public/JobsPage.tsx`
- `src/features/jobs/components/JobCard.tsx`
- `src/services/aiMatchingService.ts`
- `src/services/groqAnalysisService.ts`
- `src/services/storageService.ts`
- `src/integrations/supabase/types.ts`
- `tests/services/cvApi.test.ts`

## 10. Migration

Nouvelle migration : `supabase/migrations/20260824120000_create_candidate_documents.sql`.

Elle crée la table, les index, les permissions RLS et les politiques Storage propriétaires pour le bucket `candidat-doc`.

## 11. Tests effectués

- Tests CV ciblés : exécutés avec `node --experimental-strip-types --test tests/services/cvApi.test.ts`.
- Résultat : 3 tests réussis, 0 échec.
- Diagnostics éditeur : aucun diagnostic dans les fichiers centraux modifiés.
- `npm run build` : réussi, Vite et prerender inclus.

## 12. Résultats des scénarios

- Sans CV serveur : pas de matching CV.
- CV serveur avec URL seule : reconnu mais non analysable.
- CV serveur avec texte et vecteur : recommandations activables.
- Cache local vide : le CV serveur reste reconnu.
- Ancien cache local sans CV serveur : ignoré.
- Dashboard et `/jobs` : même service de recommandations.
- Suppression du CV : `cv_text`, vecteur et URL serveur sont effacés.
- Document complémentaire : persiste dans Supabase après suppression du cache navigateur.
- Suppression document : ligne supprimée et suppression Storage tentée.

## 13. Limites restantes

Le typecheck global n'est pas vert : des erreurs préexistantes subsistent dans plusieurs pages admin/publiques et certains types `JobOffer`, ainsi que des erreurs historiques de typage dans `CandidateCVPage`. Elles ne sont pas liées à la nouvelle architecture et n'ont pas été refactorées ici.

Le lint complet signale également des divergences CRLF/Prettier historiques.

## 14. Vérifications Supabase nécessaires

- Appliquer la migration en environnement réel.
- Vérifier l'existence du bucket `candidat-doc` ou la variable de bucket configurée.
- Vérifier les politiques RLS de `candidate_documents` et `storage.objects`.
- Vérifier les migrations précédentes effectivement appliquées.
- Tester upload, extraction, URL signée et suppression avec un candidat réel.
- Confirmer que la colonne `embedding_vector` et l'extension `vector` sont disponibles.
- Vérifier les données réelles d'offres et d'embeddings.
