# Audit E2E de la complétion CV

## 1. Parcours testés

Le parcours navigateur authentifié complet n'a pas été exécuté : aucun compte candidat de test, session Supabase de test ou outil navigateur E2E configuré n'était disponible dans l'environnement. Les conclusions ci-dessous distinguent le code vérifié des scénarios non exécutés.

Lecture effectuée du flux :

```text
CandidateLoginPage
  -> useCandidate()
  -> getCurrentCandidate()
  -> candidates
  -> sections profil
  -> calculateProfileCompletion()
  -> CandidateProfileCenter / CandidateDashboardPage
```

## 2. Résultat de chaque scénario

| Scénario | Résultat vérifiable |
|---|---|
| Profil vide | Vérifié par test unitaire : complétion 0 % |
| Profil complet sans CV | Vérifié par test unitaire : CV manquant et complétion <100 % |
| CV serveur avec URL seule | Vérifié par test unitaire : CV présent, non analysable |
| CV analysé | Vérifié par test unitaire : item CV complet et matching admissible |
| CV supprimé | Code vérifié ; E2E Supabase non exécuté |
| CV remplacé | Code vérifié ; E2E navigateur non exécuté |
| localStorage vide | Vérifié par la fonction pure : aucune lecture localStorage |
| ancien localStorage | Vérifié par la fonction pure : aucune influence |

## 3. État réel des champs CV

La source code utilise `candidates.cv_url`, `candidates.cv_text` et `candidates.embedding_vector`.

- `hasCandidateCv()` retourne vrai uniquement si `cv_url` serveur est renseigné.
- `hasAnalyzableCandidateCv()` exige `cv_url`, `cv_text` et `embedding_vector`.
- `calculateProfileCompletion()` utilise `hasCandidateCv()` pour l'item CV.
- Le contenu réel d'une ligne Supabase n'a pas été consulté : état distant NON VÉRIFIABLE DEPUIS LE DÉPÔT.

## 4. Après suppression

`deleteCandidateCV()` appelle `clearCandidateCvText()`, puis met à `NULL` `cv_url` et `cv_last_updated_at`. `clearCandidateCvText()` vide `cv_text` et `embedding_vector` via `updateCandidateCvText()`.

`CandidateCVPage` et `CandidateProfileCenter` appellent ensuite `refetch()`. Le cache mémoire partagé de `useCandidate()` est remplacé par la réponse serveur forcée et les abonnés sont notifiés.

Le résultat exact en base après suppression n'a pas été exécuté ni observé dans Supabase.

## 5. Après upload

Le pipeline est :

```text
Storage
  -> extraction PDF
  -> cv_text et embedding_vector
  -> cv_url serveur
  -> événement cv-uploaded
  -> refetch du candidat
  -> recalcul React
```

L'événement est envoyé après le traitement dans `uploadAndProcessCandidateCV()`. `useCandidate()` et les consommateurs concernés déclenchent un refetch.

La réussite réelle de l'extraction et la valeur persistée n'ont pas été testées avec un fichier PDF réel dans une session navigateur.

## 6. Dashboard

Le Dashboard utilise `useCandidateProfileData()`, qui repose sur `useCandidate()`, puis `useProfileCompletion()`.

La complétion est la même que dans `CandidateProfileCenter`. Les recommandations exigent un CV analysable. Le Dashboard ne considère pas une valeur localStorage comme preuve métier.

## 7. “Ma prochaine action”

Le Dashboard vérifie les items manquants, `hasCandidateCv()`, `hasAnalyzableCandidateCv()` et `recommendedJobs.length`.

- sans CV : action d'ajout, jamais réussite recommandations ;
- CV URL seul : action d'analyse ;
- CV analysable sans résultat : pas de réussite ;
- CV analysable avec résultats : réussite recommandations.

Ces branches ont été vérifiées par lecture du code, pas par clics E2E.

## 8. `/jobs`

`JobsPage` appelle `getRecommendedJobs()` et exige `hasCandidateCv()` ainsi que `hasAnalyzableCandidateCv()`. Il n'utilise ni `candidateDocuments`, ni localStorage pour le matching.

Le matching sans CV analysable est bloqué par la garde frontend et par le service de recommandations.

## 9. Vérification localStorage

La complétion pure ne lit pas localStorage. Les anciennes métadonnées locales ne peuvent donc pas maintenir l'item CV comme complet. Le profil et le CV métier sont chargés depuis Supabase.

## 10. Vérification du refetch

- Upload : événement `cv-uploaded` après traitement, puis refetch partagé.
- Suppression depuis `CandidateCVPage` : refetch explicite.
- Suppression depuis `CandidateProfileCenter` : refetch explicite.
- Cache mémoire : `loadSharedProfile(userId, true)` force la requête et notifie les abonnés.

Ces mécanismes sont vérifiés dans le code. Leur exécution réseau réelle reste non testée.

## 11. Tests exécutés

Commande : `node --experimental-strip-types --test tests/services/profileCompletion.test.ts tests/services/cvApi.test.ts tests/services/matchingCanonical.test.ts`

Résultat : 10 tests réussis, 0 échec. Les tests couvrent profil vide/partiel/complet, CV absent, URL seule, CV analysé, données extraites sans URL et score non artificiel.

`npm run build` a réussi précédemment avec Vite et prerender. Aucun test navigateur authentifié n'a été exécuté.

## 12. Problèmes encore présents

- L'état réel des colonnes Supabase après upload/suppression n'est pas confirmé.
- Aucun test E2E ne vérifie les quatre onglets sans reconnexion.
- Les erreurs réseau, RLS, Storage et extraction PDF réelle ne sont pas couvertes par ces tests unitaires.
- Le typecheck global peut conserver des erreurs historiques hors du périmètre ciblé.

## 13. Corrections nécessaires restantes

Aucune correction supplémentaire ne peut être validée sans environnement Supabase et navigateur authentifié. Il faut exécuter le parcours avec un candidat de test, observer les quatre champs serveur avant/après suppression/upload, puis vérifier les routes Dashboard et `/jobs`.
