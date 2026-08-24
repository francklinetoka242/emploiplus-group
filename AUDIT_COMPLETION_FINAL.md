# Audit de correction final

## 1. Problème initial

La complétion pouvait afficher 100 % après suppression du CV. La cause était l'absence totale d'un item CV dans `useProfileCompletion()`.

## 2. Cause trouvée

Le calcul existait dans `src/features/profile/hooks/useProfileCompletion.ts`, mais ne comptait que neuf dimensions de profil. Le CV n'était ni lu via `cv_url`, ni via `cv_text`, ni via `embedding_vector`. Le pourcentage n'était pas persisté en cache ; il était recalculé depuis les données React.

## 3. Architecture avant

```text
auth.user.id
  -> useCandidate()
  -> données profil et sous-sections
  -> useProfileCompletion() sans CV
  -> Dashboard / ProfileCenter
```

Le Dashboard ajoutait en plus une interprétation séparée de réussite basée sur `profileCompletion >= 80`.

## 4. Architecture après

```text
auth.user.id
  -> getCurrentCandidate()
  -> candidat serveur partagé
  -> profil, expériences, formations, compétences, langues, préférences
  -> état CV serveur
  -> useProfileCompletion()
  -> Dashboard et CandidateProfileCenter
```

Le matching conserve sa propre règle `hasAnalyzableCandidateCv()` et n'est pas remplacé par la complétion.

## 5. Définition finale de la complétion

Le calcul pur officiel est `calculateProfileCompletion()` dans `src/features/profile/profileCompletion.ts`. `useProfileCompletion()` est son unique wrapper React.

Dix items explicites sont calculés : nom complet, titre, localisation, résumé, expérience, formation, compétence, langue, préférences RH et CV. Chaque item possède un identifiant stable, une route, un poids égal à 1 et un état `isCompleted`.

Le pourcentage est la somme des poids complétés divisée par la somme totale des poids. Le Dashboard et le profil utilisent le même hook et donc le même résultat.

## 6. Rôle du CV

`hasCandidateCv()` dépend exclusivement de `candidates.cv_url`. Un texte ou vecteur ancien sans URL serveur ne suffit pas.

Le CV présent complète l'item de profil même si son extraction n'est pas terminée. Le matching utilise séparément `hasAnalyzableCandidateCv()`, qui exige `cv_url`, `cv_text` et `embedding_vector`.

Aucune donnée `localStorage`, `candidateDocuments.cv`, URL temporaire ou état visuel n'est utilisée par la complétion.

## 7. Correction de “Ma prochaine action”

Le Dashboard choisit l'action selon le même profil et les mêmes états serveur. Les informations de profil manquantes sont prioritaires, puis viennent le CV absent, le CV présent mais non analysable, les préférences et enfin les recommandations.

Le statut “Réussite” exige un CV analysable et au moins une recommandation effectivement retournée. Le seuil de complétion seul ne déclenche plus la réussite.

## 8. Suppression et upload

`deleteCandidateCV()` efface le contenu CV serveur puis `cv_url`; le profil central refetch ensuite. L'événement `cv-uploaded` est émis après extraction et mise à jour serveur. Le Dashboard et le profil central refetchent alors l'état candidat.

## 9. Fichiers modifiés

- `src/features/candidates/api/cvApi.ts`
- `src/features/profile/profileCompletion.ts`
- `src/features/profile/hooks/useProfileCompletion.ts`
- `src/features/profile/types/index.ts`
- `src/features/profile/components/CandidateProfileCenter.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `tests/services/cvApi.test.ts`
- `tests/services/profileCompletion.test.ts`

## 10. Doublons supprimés ou conservés

Supprimée : la logique de réussite fondée sur `profileCompletion >= 80`.

Conservés : `hasCandidateCv()` et `hasAnalyzableCandidateCv()` comme deux états métier distincts ; le wrapper `useProfileCompletion()` pour l'API React existante.

Aucun calcul concurrent `dashboardCompletion`, `documentsCompletion` ou `candidateCompletion` n'a été trouvé dans les sources ciblées.

## 11. Tests exécutés et résultats

Commande : `node --experimental-strip-types --test tests/services/profileCompletion.test.ts tests/services/cvApi.test.ts tests/services/matchingCanonical.test.ts`

Résultat : 10 tests réussis, 0 échec. Couverture : profil vide/partiel/complet, CV absent, CV URL seul, CV analysé, données CV sans URL serveur et score non artificiel.

Diagnostics ciblés : aucun diagnostic dans les fichiers modifiés.

`npm run build` : Vite et prerender réussis. Avertissements non bloquants : dépendance PDF utilisant `eval` et chunks volumineux.

## 12. Scénarios CV vérifiés

- CV supprimé : `cv_url` absent, donc complétion diminuée après refetch.
- CV remplacé : nouvelle URL serveur, complétion rétablie.
- localStorage vide ou obsolète : aucune influence sur le calcul pur.
- `cv_url` sans texte : CV présent pour la complétion, non analysable pour le matching.
- texte/vecteur sans `cv_url` : CV non présent.

## 13. Limites restantes

Aucun test navigateur end-to-end n'a été exécuté. La propagation réelle après upload/suppression n'a pas été testée contre une session Supabase distante.

Le typecheck global peut encore contenir des erreurs historiques dans d'autres fichiers du dépôt ; aucun diagnostic n'est présent dans les fichiers centraux modifiés ici.

## 14. Vérifications Supabase nécessaires

- confirmer que les quatre champs CV sont effectivement vidés lors de la suppression ;
- tester le refetch sans reconnexion avec un candidat réel ;
- vérifier les migrations, RLS, `cv_url` et les embeddings en environnement déployé ;
- confirmer que les recommandations retournent bien une liste vide sans CV analysable.
