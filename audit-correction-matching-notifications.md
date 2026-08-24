# Correction matching et notifications

## 1. Problèmes corrigés

- Le Dashboard créait une notification persistante à chaque chargement réussi des recommandations.
- `createNotification()` pouvait transformer un broadcast en fan-out de lignes personnelles.
- `computeMatchScoreFromText()` constituait une seconde formule de score métier.
- `createUniqueNotification()` dépendait seulement d'un SELECT puis INSERT pour l'unicité.

## 2. Architecture finale du matching

```text
auth.user.id
  -> getCurrentCandidate()
  -> profil candidat serveur
  -> CV serveur analysable
  -> getRecommendedJobs()
  -> computeStructuredMatchScore()
  -> résultats Dashboard et /jobs
```

Dashboard et `/jobs` appellent déjà `getRecommendedJobs()`. Aucun calcul de recommandation spécifique au Dashboard n'a été conservé.

## 3. Source unique du score

`computeStructuredMatchScore()` dans `src/services/matchScoreUtils.ts` est la seule fonction de score final.

L'ancienne fonction `computeMatchScoreFromText()` et ses helpers dédiés ont été supprimés après vérification de ses usages. Son test obsolète a également été supprimé.

## 4. Gestion du CV

Le matching utilise les champs serveur du candidat. `hasAnalyzableCandidateCv()` exige `cv_text` et `embedding_vector`. Le cache navigateur, `candidateDocuments.cv` et l'état visuel Documents ne participent pas au matching.

`getRecommendedJobs()` vérifie également le CV analysable côté service, afin qu'un appel direct futur conserve la même règle.

## 5. Correction des 100 %

`JobCard` affiche les scores sur l'échelle 0-100 sans traiter un pourcentage comme une fraction 0-1.

Aucun fallback de matching ne retourne 100 par défaut. Les dimensions absentes sont ignorées explicitement par `computeStructuredMatchScore()` et un score non justifié ne devient pas parfait.

Le test `matchingCanonical.test.ts` confirme qu'une offre sans rapport avec le profil ne produit pas 100 %.

## 6. Gestion des recommandations

Les résultats dépendent du CV analysable, des données candidat, des offres éligibles, du retour de `getRecommendedJobs()` et de l'absence d'erreur.

Le chargement d'une page ne crée plus de notification de recommandation. L'absence d'offre ne crée aucune notification.

## 7. Règle finale des notifications

Une nouvelle offre publiée ne crée pas de notification individuelle par candidat. Le trigger SQL d'offre présent historiquement est no-op. Aucun fan-out applicatif actif n'a été trouvé.

Les broadcasts restent limités aux types autorisés et sont stockés avec `user_id IS NULL`. Les notifications personnelles restent liées à l'utilisateur destinataire.

## 8. Producteurs conservés

- notification de bienvenue ;
- notification administrative ;
- rappel de CV ancien ;
- événement réel de retrait de candidature ;
- notifications de contact/article selon les triggers SQL existants ;
- broadcasts explicitement créés par l'administration.

## 9. Producteurs supprimés

- notification “nouvelle offre correspond à votre profil” créée au chargement du Dashboard ;
- fan-out des broadcasts en notifications individuelles ;
- trigger SQL de statuts RH non vérifiables, déjà supprimé par la migration précédente ;
- fonction textuelle de score concurrente.

## 10. Déduplication

La migration `20260824150000_dedupe_notifications_atomically.sql` supprime les doublons personnels strictement identiques en conservant la ligne la plus ancienne, puis ajoute une contrainte unique sur utilisateur, type, titre, contenu, lien et statut.

`createUniqueNotification()` traite désormais une violation d'unicité comme un résultat idempotent sans erreur.

## 11. Fichiers modifiés

- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/services/matchScoreUtils.ts`
- `src/integrations/supabase/notifications.ts`
- `tests/services/matchingCanonical.test.ts`
- `tests/services/matchScoreUtils.test.ts` supprimé
- `supabase/migrations/20260824150000_dedupe_notifications_atomically.sql`

## 12. Tests exécutés et résultats

Commande ciblée : `node --experimental-strip-types --test tests/services/matchingCanonical.test.ts tests/services/cvApi.test.ts tests/services/profileCompletion.test.ts`

Résultat : 9 tests réussis, 0 échec.

Diagnostics ciblés : aucun diagnostic dans les fichiers modifiés de matching et notifications.

`npm run build` : Vite et prerender réussis. Avertissements non bloquants : `eval` provenant de `pdfjs-dist` et chunks volumineux.

Les scénarios Supabase personnels, broadcasts, concurrence et publication réelle n'ont pas été exécutés contre une base distante.

## 13. Limites restantes

La contrainte d'unicité et les politiques RLS ne sont effectives qu'après application des migrations. Les tests de concurrence et d'isolation nécessitent une base Supabase de test.

Le typecheck global conserve des erreurs historiques dans d'autres parties du dépôt ; aucun diagnostic n'est présent dans les fichiers centraux touchés ici.

## 14. Vérifications Supabase nécessaires

- appliquer `20260824150000_dedupe_notifications_atomically.sql` ;
- vérifier les doublons existants avant migration ;
- confirmer que les anciens triggers de publication d'offre sont bien no-op ou supprimés ;
- tester une publication d'offre et confirmer zéro notification candidat ;
- tester deux appels concurrents à `createUniqueNotification()` ;
- vérifier les RLS des notifications personnelles et broadcasts ;
- confirmer les embeddings candidat/offres et le RPC de matching.
