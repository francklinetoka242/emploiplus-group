# Correction complétion, CV et prochaine action

## 1. Problèmes corrigés

- Le CV n'était pas compté dans la complétion.
- Un profil complet sans CV pouvait afficher 100 %.
- “Ma prochaine action” considérait un seuil de complétion comme preuve de disponibilité des recommandations.
- Le profil central ne rafraîchissait pas systématiquement l'état candidat après suppression ou upload du CV.

## 2. Source unique du candidat

Le candidat reste chargé par `useCandidate()`, selon le flux `auth.user.id -> candidates.user_id -> candidate.id`. `getCurrentCandidate()` reste le point d'entrée officiel de récupération du candidat connecté.

Aucune nouvelle récupération du candidat n'a été créée dans le Dashboard ou les sections de profil.

## 3. Source unique du CV

La source métier reste la ligne Supabase `candidates` :

- `cv_url` pour la référence Storage ;
- `cv_text` pour le texte extrait ;
- `embedding_vector` pour le matching ;
- `cv_last_updated_at` pour la date de traitement.

`hasCandidateCv()` distingue un CV serveur présent. `hasAnalyzableCandidateCv()` exige texte et vecteur. Les caches navigateur et les états visuels ne participent pas au calcul.

## 4. Nouvelle règle de complétion

`calculateProfileCompletion()` est le calcul pur officiel, utilisé par `useProfileCompletion()`.

Les dix dimensions sont : nom complet, titre, localisation, résumé, expérience, formation, compétence, langue, préférences RH et CV.

L'item CV est complet uniquement si `cv_text` et `embedding_vector` sont présents côté serveur. Un fichier seulement présent via `cv_url` reste non analysable et ne complète pas cet item.

Le Dashboard et `CandidateProfileCenter` utilisent le même hook et donc exactement la même valeur.

## 5. Nouvelle logique “Ma prochaine action”

L'ordre est désormais :

1. chargement ;
2. CV ancien ;
3. information profil manquante hors CV ;
4. CV absent ;
5. CV présent mais non analysé ;
6. préférences d'alertes ou disponibilité ;
7. recommandations.

Le mode “Réussite” exige simultanément un CV analysable et `recommendedJobs.length > 0`. Le seuil `profileCompletion >= 80` n'est plus utilisé comme preuve de réussite.

## 6. Suppression et upload CV

Après suppression, `deleteCandidateCV()` efface `cv_text`, `embedding_vector`, `cv_url` et `cv_last_updated_at` via le service existant. Le profil central refetch immédiatement et recalcule la complétion.

Après upload, l'extraction et la mise à jour Supabase terminent avant l'événement `cv-uploaded`. Le Dashboard et le profil central refetchent alors le candidat et utilisent le nouveau texte/vecteur.

## 7. Fichiers modifiés

- `src/features/profile/profileCompletion.ts`
- `src/features/profile/hooks/useProfileCompletion.ts`
- `src/features/profile/components/CandidateProfileCenter.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `tests/services/profileCompletion.test.ts`

## 8. Anciennes logiques supprimées

- Calcul de complétion sans item CV.
- Détermination de réussite par seuil de pourcentage seul.
- Absence de refetch du profil central après suppression/upload.

Aucun nouveau système parallèle de CV, candidat ou matching n'a été créé.

## 9. Tests exécutés et résultats

Commande : `node --experimental-strip-types --test tests/services/profileCompletion.test.ts tests/services/cvApi.test.ts`

Résultat : 8 tests réussis, 0 échec. Les états testés couvrent profil vide, profil partiel, profil complet, CV absent, CV présent non analysé et CV analysé.

Diagnostics ciblés : aucun diagnostic dans les fichiers modifiés de complétion, Dashboard, profil et tests.

Commande : `npm run build`

Résultat : build Vite et prerender réussis. Des avertissements non bloquants concernent `eval` dans `pdfjs-dist` et la taille de certains chunks.

## 10. Limites restantes

Les rafraîchissements upload/suppression sont testés par la logique de service et les événements, mais aucun test navigateur end-to-end n'a été exécuté dans cette session.

Les diagnostics TypeScript globaux peuvent encore contenir des erreurs historiques dans d'autres pages et types du dépôt ; elles ne sont pas introduites par cette correction ciblée.

## 11. Vérifications Supabase nécessaires

- Vérifier en base que la suppression vide bien les quatre champs CV.
- Tester avec un candidat réel la propagation du refetch après suppression et remplacement.
- Vérifier que l'extraction PDF produit bien `cv_text` et `embedding_vector`.
- Vérifier les offres disponibles et leurs embeddings pour confirmer `recommendedJobs.length`.
- Confirmer les politiques RLS et les données candidat dans l'environnement déployé.
