# Audit

## 1. Complétion

**Source actuelle :** `src/features/profile/hooks/useProfileCompletion.ts`, appelé par `CandidateProfileCenter` et `CandidateDashboardPage`.

Le calcul crée 9 items : nom complet, titre professionnel, localisation, résumé professionnel, expérience, formation, compétence, langue et préférences RH. Le pourcentage est `completedCount / totalItems * 100`, arrondi et borné entre 0 et 100.

Le CV n'est pas un item de complétion. La fonction ne lit ni `cv_url`, ni `cv_text`, ni `embedding_vector`, ni `candidateDocuments`, ni `localStorage`.

**Cause exacte du 100 % après suppression du CV :** la suppression du CV ne retire aucun item de la liste de complétion. Si les 9 items restent remplis, le calcul reste à 100 %.

Le pourcentage n'est pas persisté en base, localStorage ou sessionStorage. Il est recalculé par React à partir du résumé reçu. `animatedProfileCompletion` ne contient qu'une valeur d'animation temporaire.

## 2. Données du profil

### Profile

`useCandidate()` charge le candidat via `auth.user.id -> candidates.user_id`. Les champs utilisés par la complétion sont `first_name`, `last_name`, `headline`, `location_city`, `location_country` et `bio`.

### Experience

`useCandidateProfileData()` charge `candidate_experience` via `getCandidateExperiences()`. Les champs persistés sont poste, entreprise, description, dates et `is_current`. La complétion vérifie seulement que le tableau n'est pas vide.

### Documents

Le CV est dans Supabase Storage et sa référence dans `candidates.cv_url`; le texte et le vecteur sont dans `candidates.cv_text` et `candidates.embedding_vector`. Les documents complémentaires sont lus par `getCandidateDocuments()` depuis `candidate_documents`, avec URL Storage signée à la lecture.

La complétion ne vérifie actuellement aucune de ces données. La présence métier du CV est utilisée ailleurs par `hasCandidateCv()`/`hasAnalyzableCandidateCv()` dans `src/features/candidates/api/cvApi.ts`.

### Preferences

`useCandidatePreferences()` charge `candidate_preferences`. Sont disponibles : types de contrat, types de travail, mobilité, salaires, séniorité, disponibilité, date de disponibilité, alertes emploi et fréquence. La complétion considère les préférences remplies si séniorité, contrat, travail ou salaire contient une valeur.

## 3. Prochaine action

La section est générée dans `CandidateDashboardPage.tsx` par `nextAction`.

Ordre actuel : chargement, CV ancien, premier item manquant, alertes désactivées, disponibilité “not_available”, puis “Consulter les offres recommandées” vers `/jobs#recommended-for-you`.

La réussite est calculée séparément : `profileCompletion >= 80 || completion.missingItems.length === 0`. Elle ne vérifie ni `cv_url`, ni CV analysable, ni `recommendedJobs.length`.

Donc un profil à 100 % sans CV peut afficher “Consulter les offres recommandées” en mode “Réussite”. Un profil complet avec CV non analysé peut également arriver à cette action, même si le matching exige texte et vecteur. Le Dashboard charge les recommandations via `getRecommendedJobs()`, mais cette disponibilité n'est pas reliée à `nextAction`.

## 4. Scénarios testés par lecture du code

| Scénario | Complétion | Recommandations/matching | Prochaine action | Analyse offre |
|---|---|---|---|---|
| Profil incomplet, aucun CV | <100 % selon items manquants | bloquées sans CV analysable | premier item manquant | refusée sans `cv_text` |
| Profil complet, aucun CV | 100 % possible | bloquées | recommandations en réussite | refusée |
| Profil complet, CV non analysé | 100 % possible | bloquées par `hasAnalyzableCandidateCv` | recommandations en réussite | refusée |
| Profil complet, CV analysé | 100 % | disponibles si offres/vecteurs | recommandations en réussite | disponible sous réserve de Groq |
| CV supprimé après analyse | reste 100 % si autres items remplis | profil rafraîchi, matching arrêté | recommandations en réussite | refusée |
| CV remplacé | complétion inchangée | refetch après upload, nouveau texte/vecteur utilisé | calcul identique | nouveau texte utilisé |

## 5. Notifications

La source officielle est `src/integrations/supabase/notifications.ts`, utilisée par `useNotifications()` et les appels de création métier.

Le trigger `notify_job_published()` existe dans une migration historique mais son corps ne fait rien. La migration finale `20260824140000...` supprime le trigger de statut candidature, pas le trigger no-op d'offre. Aucun code applicatif ou Vercel Function ne crée une notification à chaque publication d'offre.

La publication d'un article possède encore un trigger SQL `notify_post_published()`, et un nouveau contact possède `notify_new_contact()`. Aucun cron ou Edge Function de notification d'offre n'a été trouvé.

Les recommandations du Dashboard peuvent créer une notification ciblée “nouvelle offre correspond au profil” via `createUniqueNotification()`. Ce n'est pas une notification par offre : elle est déclenchée après chargement de recommandations et dédupliquée par utilisateur, type, titre, contenu et lien. Une course entre appels concurrents peut toutefois contourner cette déduplication applicative si aucune contrainte unique correspondante n'existe.

Les broadcasts `user_id IS NULL` sont lus uniquement pour les types explicitement autorisés. Ils ne sont pas générés pour chaque candidat par fan-out dans la version actuelle.

Conclusion notification offres : la règle “pas de notification individuelle à chaque nouvelle offre” est respectée par le code actuel, sous réserve que les migrations réellement appliquées correspondent au dépôt.

## 6. Doublons

### Complétion

Une seule fonction calcule le pourcentage : `useProfileCompletion()`. `ProfileHeader`, `CompletionSection` et Dashboard l'affichent, sans second calcul. `nextActionSuccess` est une interprétation séparée et concurrente.

### CV

`cvApi.ts` centralise la présence du CV. Les pages Documents utilisent encore leur propre état d'affichage, mais celui-ci ne pilote pas la complétion. `documentsApi.ts`, `CandidateCVPage` et `useCandidateDocuments` sont plusieurs consommateurs du même service.

### Matching

Dashboard et `/jobs` appellent `getRecommendedJobs()`. Le calcul officiel est `computeStructuredMatchScore()`. `computeMatchScoreFromText()` reste une ancienne fonction alternative utilisée par des tests ou services secondaires potentiels et doit être vérifiée avant suppression.

### Notifications

Les mutations sont centralisées dans `notifications.ts`. Les appels métier directs à `createUniqueNotification()` sont des producteurs, pas un second stockage. Les triggers SQL contact/article sont des producteurs concurrents légitimes, mais doivent rester documentés.

## 7. Architecture cible recommandée

```text
AUTH USER
  -> getCurrentCandidate()
  -> profil candidat unique
  -> état CV serveur unique
  -> source unique de complétion
  -> getRecommendedJobs()
  -> recommandations

ÉVÉNEMENT RÉEL
  -> API notifications unique
  -> ciblée ou broadcast explicitement autorisé
  -> notifications Supabase
```

La complétion devrait recevoir l'état CV serveur dans le même résumé que les sections profil, expérience et préférences. “Ma prochaine action” devrait consommer le même état de complétion et le résultat réel des recommandations.

## 8. Corrections à effectuer

1. Ajouter explicitement le CV analysable à la source de complétion, selon une règle métier validée.
2. Rafraîchir le profil partagé après suppression du CV avant de recalculer l'écran.
3. Faire dépendre “Réussite” et l'action recommandations de l'état CV et de la disponibilité réelle des recommandations.
4. Ajouter des tests de complétion après suppression/remplacement du CV.
5. Ajouter une contrainte ou une opération atomique pour garantir l'unicité des notifications recommandation.
6. Vérifier en base que le trigger d'offre est bien no-op et qu'aucun ancien trigger de fan-out n'est encore actif.
7. Vérifier avant suppression l'usage réel de `computeMatchScoreFromText()`.

