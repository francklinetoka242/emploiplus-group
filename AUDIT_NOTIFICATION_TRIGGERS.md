# Audit exhaustif des déclencheurs de notifications

## Périmètre et méthode

Audit en lecture seule de `src/`, `api/`, `supabase/migrations/` et `tests/`. Les statuts ci-dessous sont limités à `ACTIF`, `INACTIF`, `SUPPRIMÉ`, `CONDITIONNEL`, `NON TROUVÉ`. L'état réel de Supabase distant est **NON VÉRIFIABLE DEPUIS LE DÉPÔT**.

## API officielle

`src/integrations/supabase/notifications.ts` centralise la création, lecture, compteur, marquage, masquage et suppression. `useNotifications()` consomme cette API pour la lecture et les mutations candidat. Les pages admin utilisent `createNotification`, `updateNotification`, `toggleNotificationVisibility` et `deleteNotification`.

## Tableau des déclencheurs identifiés

| Déclencheur | Fichier/SQL | Condition | Type | Destinataire | Fréquence | Actif ? | Risque |
|---|---|---|---|---|---|---|---|
| Connexion candidat | `CandidateLoginPage.tsx` | login réussi | evenement | utilisateur connecté | par connexion, dédoublonné | ACTIF | FAIBLE |
| Profil incomplet | `CandidateDashboardPage.tsx` | profil chargé, complétion <100 % | offre | candidat | par montage, dédoublonné actif | ACTIF | MOYEN |
| CV ancien | `CandidateDashboardPage.tsx` | `cv_last_updated_at` >180 jours | offre | candidat | par montage, dédoublonné actif | CONDITIONNEL | MOYEN |
| Alertes activées | `CandidateDashboardPage.tsx` | `job_alerts_enabled` vrai | offre | candidat | par montage, dédoublonné actif | CONDITIONNEL | FAIBLE |
| Offre sauvegardée bientôt expirée | `CandidateSavedOffersPage.tsx` | échéance dans 7 jours | offre | candidat | une par offre à chaque chargement, dédoublonné actif | ACTIF | ÉLEVÉ |
| Retrait candidature | `applicationsApi.ts` | retrait réussi avec candidat/offre | candidature | candidat propriétaire | une fois par retrait | ACTIF | FAIBLE |
| Notification admin | `AdminNotificationsPage.tsx` | soumission admin | type choisi | candidat ciblé ou broadcast | par action admin | ACTIF | MOYEN |
| Nouveau contact | trigger `trg_notify_new_contact` | INSERT contact | contact | staff, selon RLS | une par contact | ACTIF | FAIBLE |
| Article publié | trigger `trg_notify_post_published` | article publié ou transition vers publié | blog | broadcast SQL | une par transition | ACTIF |
| Publication offre | trigger `trg_notify_job_published` | INSERT/UPDATE statut | aucune | personne | aucune ligne créée | INACTIF | FAIBLE |

## Frontend candidat

`CandidateDashboardPage` ne crée plus de notification lors du chargement de `getRecommendedJobs()`. `/jobs`, `getRecommendedJobs()` et `JobCard` ne créent aucune notification persistante.

Le Dashboard crée toutefois :

- un rappel de profil incomplet si `profileCompletion < 100 %` ;
- un rappel de CV ancien si la date serveur dépasse 180 jours ;
- une notification lorsque les alertes emploi sont actives ;
- aucune notification pour upload, remplacement ou suppression de CV.

Les trois rappels utilisent `createUniqueNotification()`. La déduplication applicative est complétée par une contrainte PostgreSQL, sous réserve d'application de la migration.

`CandidateSavedOffersPage` évalue les offres sauvegardées à chaque chargement et appelle `createUniqueNotification()` pour chaque échéance dans les sept jours. Avec N offres concernées, le chargement peut tenter N insertions. Le SELECT/INSERT et la contrainte limitent les doublons strictement identiques, mais ce mécanisme reste le risque frontend de saturation le plus élevé.

`withdrawApplication()` met à jour `job_applications.status = withdrawn`, puis crée une notification ciblée de retrait. L'envoi est lancé sans être attendu par le retour de la fonction.

`CandidateLoginPage` appelle `createCandidateWelcomeNotification()` après une connexion réussie. L'index unique historique limite le même message à une ligne par utilisateur, sous réserve des migrations appliquées.

## API / Vercel

Aucun endpoint dans `api/` ne crée directement de ligne dans `notifications`. `api/send-email.ts` envoie les candidatures par SMTP mais ne crée pas de notification. Les endpoints de confirmation, inscription et mot de passe ne créent pas de notification candidat identifiée.

## SQL et chronologie

1. La migration historique crée la table et les triggers contact, offre et article.
2. `notify_job_published()` est un trigger actif techniquement mais son corps retourne directement `NEW` : aucune notification n'est créée.
3. La migration candidature crée un trigger de notifications pour `shortlisted`, `accepted` et `rejected`.
4. `20260824140000_disable_unsupported_application_notifications.sql` supprime ce trigger et sa fonction.
5. `20260824130000_allow_candidate_broadcast_notifications.sql` autorise la lecture de broadcasts valides.
6. `20260824150000_dedupe_notifications_atomically.sql` supprime les doublons personnels strictement identiques puis ajoute une unicité PostgreSQL.

L'état final réellement appliqué en base reste **NON VÉRIFIABLE DEPUIS LE DÉPÔT**.

## Publication d'offres

Une offre créée ou publiée ne crée actuellement aucune notification candidat : le trigger SQL d'offre est no-op et aucun fan-out frontend/API/cron/Edge Function n'a été trouvé.

La visibilité d'une offre passe par les requêtes offres et recommandations. Une recommandation n'est pas une notification. Le Dashboard ne crée plus de notification au chargement des recommandations.

## Candidatures

- Création : insertion `job_applications` et envoi email entreprise ; aucune notification candidat créée.
- Retrait : notification ciblée de retrait, ACTIF.
- Consultation, acceptation, rejet, présélection, entretien : NON TROUVÉ dans le flux actif.
- Ancien trigger de changement de statut : SUPPRIMÉ par migration ultérieure.

## CV et profil

| Événement | État | Constat |
|---|---|---|
| Upload CV | INACTIF | extraction et refresh, aucune notification dédiée |
| Remplacement CV | INACTIF | même pipeline d'upload |
| Suppression CV | INACTIF | suppression serveur et refresh |
| CV ancien | CONDITIONNEL | rappel Dashboard, dédoublonné |
| CV analysé | INACTIF | aucune notification dédiée |
| Profil complété | INACTIF | pas de notification de complétion réussie |
| Profil incomplet | CONDITIONNEL | rappel Dashboard |
| Préférences modifiées | INACTIF | sauvegarde sans notification directe |

## Broadcasts

Les types autorisés avec `user_id IS NULL` sont `admin`, `offre`, `job`, `blog` et `evenement`. `candidature` et `contact` ne doivent pas être broadcastés par l'API officielle.

Un broadcast est stocké comme une seule ligne `user_id IS NULL`; `createNotification()` ne le transforme plus en une ligne par candidat. Les candidats le lisent via le filtre API personnel ou broadcast autorisé. Les règles RLS correspondantes sont dans `20260824130000...`, mais leur application réelle est NON VÉRIFIABLE DEPUIS LE DÉPÔT.

Les triggers article/contact historiques insèrent des lignes broadcast sans `user_id`. Leur visibilité effective dépend du RLS final.

## Déclencheurs non actifs / supprimés

- Fan-out offre vers tous les candidats : SUPPRIMÉ de l'implémentation active / NON TROUVÉ dans les producteurs actuels.
- Notification Dashboard “nouvelle offre correspondante” : SUPPRIMÉE.
- `notify_job_published()` : INACTIF fonctionnellement, trigger no-op.
- Trigger candidature `shortlisted/accepted/rejected` : SUPPRIMÉ.
- Cron, job périodique, Edge Function et `pg_notify` : NON TROUVÉ.

## Conclusion

1. Mécanismes actifs créant une notification destinée à un candidat : 5 familles frontend identifiées : bienvenue, profil incomplet, CV ancien, alertes activées, expiration d'offre sauvegardée, plus le retrait de candidature ; l'administration peut en créer manuellement. Le décompte exact dépend des occurrences conditionnelles.
2. Événements : connexion, rappels Dashboard, expiration d'offres sauvegardées, retrait et actions admin.
3. Nouvelle offre publiée : aucune notification candidat.
4. Dashboard : oui, uniquement rappels conditionnels ; jamais via le chargement des recommandations.
5. `/jobs` : aucune notification.
6. Création candidature : aucune notification.
7. Retrait candidature : oui, notification ciblée.
8. Changement de statut : aucun dans le flux actif ; ancien trigger supprimé.
9. Upload/suppression CV : aucune notification directe ; CV ancien peut déclencher un rappel.
10. Notifications périodiques : NON TROUVÉ ; expiration est évaluée au chargement.
11. Fan-out candidat : aucun pour les offres ; broadcast stocké une seule fois dans le code actif.
12. Risques de saturation : expiration d'offres sauvegardées (ÉLEVÉ), rappels Dashboard et actions admin (MOYEN). Aucun mécanisme offre-par-candidat actif n'a été identifié.
