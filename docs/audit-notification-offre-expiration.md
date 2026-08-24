# Audit ciblé : notification d'expiration des offres sauvegardées

## 1. Déclencheur et chemin réel

- `src/features/candidates/api/savedOffersApi.ts` / `getCandidateSavedOffers(candidateId)` lit `candidate_saved_offers`, joint `job_offers` et récupère `deadline`, `expires_at`, `status`, `slug` et le titre.
- `src/pages/candidate/CandidateSavedOffersPage.tsx` / `loadSavedOffers` est lancé par un `useEffect` lorsque `profile.id` est disponible. Il charge les offres sauvegardées puis filtre celles à notifier.
- La date utilisée est `job_offers.deadline ?? job_offers.expires_at`. La condition exacte est : date valide, `diffMs > 0` et `diffMs <= 7 * 24 * 60 * 60 * 1000`, où `diffMs = expiration - Date.now()`.
- Pour chaque offre retenue, le composant appelle `createUniqueNotification` avec `type: "offre"`, `user_id: profile.user_id`, un titre d'expiration, un contenu et `link: /jobs/${slug}`.
- Le mécanisme est donc déclenché au montage/rechargement de la page `/candidate/saved-jobs` ou de son alias `/candidate/saved-offers` (`src/App.tsx`). Il n'est pas déclenché par `/candidate/dashboard`, cron, Edge Function ou trigger d'expiration serveur.
- `expire_jobs()` dans `supabase/migrations/20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql` change éventuellement le statut après expiration, mais ne crée aucune notification.

## 2. Scénarios métier

| Cas | Comportement observé |
|---|---|
| Expiration dans exactement 7 jours | Notification tentée (`<=` 7 jours), sous réserve d'accès aux données et de l'insertion. |
| Dans 6 à 1 jour | Même notification retentée à chaque chargement ; l'active identique est normalement conservée une seule fois. |
| Plus de 7 jours | Aucune tentative. |
| Déjà expirée | Aucune tentative (`diffMs > 0`). |
| Non sauvegardée | Aucune récupération dans `candidate_saved_offers`, donc aucune tentative. |
| Sauvegardée puis supprimée | La relation disparaît ; aucun nouvel appel pour cette offre lors des chargements suivants. Une notification déjà créée reste toutefois indépendante et visible tant qu'elle est active. |
| Sauvegardée puis prolongée | Aucun champ de date n'est stocké dans la notification. Si titre/contenu/lien restent identiques, l'ancienne notification bloque une nouvelle création et peut devenir obsolète. Si le slug/titre change, une nouvelle notification est possible. |
| Page ouverte plusieurs fois | Le filtre et `createUniqueNotification` sont réexécutés à chaque montage, mais l'index unique bloque le doublon actif identique. |

## 3. Dédoublonnage

`createUniqueNotification` (`src/integrations/supabase/notifications.ts`) effectue d'abord un SELECT des 50 dernières notifications personnelles ayant le même `user_id`, `status` et `type`. Il compare ensuite : `title`, `body` avec `content`, et `link`.

Ne sont pas comparés : `job_id` (absent du payload), l'identifiant de l'offre et la date d'expiration. Le candidat est bien pris en compte via `user_id`, le type via `type`, le lien via `link`, le contenu via `body`, et le statut via `status`.

La migration `supabase/migrations/20260824150000_dedupe_notifications_atomically.sql` crée l'index unique partiel `idx_notifications_unique_personal_event` sur :
`(user_id, type, title, COALESCE(body, ''), COALESCE(link, ''), status)` avec `WHERE user_id IS NOT NULL`.

Conclusion : l'unicité est applicative + base, si cette migration est effectivement déployée dans la base Supabase. Elle est basée sur le contenu, pas sur l'offre. Deux notifications concernant la même offre peuvent donc être considérées différentes si le titre, le contenu, le lien ou le statut diffère. Deux offres distinctes peuvent aussi entrer en collision si ces champs sont identiques.

Les notifications masquées ont un autre `status` et ne bloquent pas une active. Une notification supprimée ne bloque plus rien. L'index welcome sur `user_id` (`20260823000000_unique_candidate_welcome_notification.sql`) ne concerne pas le type `offre`.

## 4. Concurrence

Deux chargements simultanés peuvent tous deux faire le SELECT avant qu'un INSERT soit visible. Ils peuvent donc tous deux tenter l'INSERT. Avec l'index unique PostgreSQL ci-dessus, un seul INSERT réussit ; l'autre reçoit `23505`, code explicitement transformé en succès silencieux par `createUniqueNotification`.

**DOUBLON IMPOSSIBLE**, pour une même clé `(user_id, type, title, body, link, status)` lorsque l'index est présent et actif. Sans cette migration déployée, le dédoublonnage applicatif seul n'est pas sûr face à la concurrence.

## 5. Fréquence réelle

Il n'y a pas de limite par session ou par jour. Chaque montage de `CandidateSavedOffersPage` retente une fois par offre correspondante. Un refresh et une navigation qui remonte le composant provoquent une nouvelle tentative. Un changement d'onglet ne provoque rien en soi, sauf s'il démonte/remonte la page. Un changement de profil peut aussi relancer l'effet.

Pour une offre restant dans la fenêtre, le système peut donc tenter X fois, où X est le nombre de montages/refreshs. Avec la clé unique active et inchangée, la base conserve Y = 1 notification active. Si elle est supprimée ou masquée, un chargement ultérieur peut en recréer une.

## 6. Saturation

Dans le scénario demandé de 100 offres sauvegardées, dont 30 éligibles, et 20 ouvertures :

- 600 tentatives de création au total (30 x 20) ;
- normalement 30 notifications stockées, puis 570 tentatives refusées ou ignorées ;
- aucun doublon identique si l'index est déployé ;
- 600 SELECT de dédoublonnage et des conflits `23505` côté base.

La limite applicative actuelle est `MAX_SAVED_OFFERS = 5`, mais elle n'est pas une contrainte SQL ; le scénario à 100 reste techniquement pertinent pour des données existantes ou d'autres écritures.

Risque de saturation dans l'état actuel : **FAIBLE**. Le risque devient **MOYEN à ÉLEVÉ** si l'index n'est pas déployé, ou si les notifications sont régulièrement supprimées/masquées puis recréées.

## 7. Données, dates et cas limites

- La date provient de `job_offers` via Supabase, pas de `localStorage`, `sessionStorage` ni d'une donnée fictive.
- `deadline` est prioritaire sur `expires_at`. Si `deadline` est renseignée mais incorrecte/ancienne, `expires_at` n'est pas utilisé en repli.
- Les deux colonnes sont `TIMESTAMPTZ` dans le schéma. `new Date(...)` et `Date.now()` comparent des instants absolus ; aucune date locale n'est fabriquée.
- Date NULL ou invalide : aucune notification. Moins de 24 heures : notification tant que la date est encore future. Exactement maintenant ou passée : aucune notification.
- Une offre `archived` ou `expired` peut ne plus être renvoyée par la jointure, car la policy de lecture publique de `job_offers` autorise les candidats seulement pour `status = 'published'`. Dans ce cas, la donnée jointe peut être absente et le chargement peut échouer avant la création.
- Une offre désactivée/archivée n'est donc pas garantie d'être traitée comme une offre sauvegardée accessible. Une suppression de l'offre supprime la sauvegarde par `ON DELETE CASCADE`, mais ne supprime pas la notification déjà créée.
- Une sauvegarde multiple est empêchée par `UNIQUE(candidate_id, job_offer_id)` dans `candidate_saved_offers`.

## 8. Contenu et affichage

Le titre identifie l'offre (`L’offre « ... » expire bientôt.`), le contenu indique de postuler avant la clôture, et le lien `/jobs/${slug}` vise l'offre correspondante. `CandidateNotificationsPage` affiche le titre, le contenu et le bouton `Voir`. `useNotifications` ne récupère que les notifications `active` et autorise le type `offre`.

Une notification masquée n'est pas affichée. Une notification supprimée n'est plus affichée et peut être recréée lors d'une visite éligible. Le dropdown d'en-tête affiche les notifications, mais le lien détaillé est fourni par la page complète des notifications.

## Verdict

### FONCTIONNE AVEC LIMITES

1. **Une notification est-elle réellement créée lorsqu'une offre sauvegardée expire dans les 7 jours ?** Oui, si l'offre est accessible et si l'insertion réussit, mais seulement à la visite de la page des offres sauvegardées.
2. **Peut-elle être créée plusieurs fois ?** Une nouvelle tentative peut avoir lieu plusieurs fois ; une nouvelle ligne peut réapparaître après suppression/masquage ou si le contenu change.
3. **Le dédoublonnage est-il réellement garanti par PostgreSQL ?** Oui pour les notifications personnelles identiques si l'index `idx_notifications_unique_personal_event` est déployé ; non pour une identité métier fondée sur l'offre, car `job_id` et la date ne sont pas inclus.
4. **Une nouvelle notification peut-elle apparaître chaque jour ?** Non pour une notification active identique ; oui après masquage/suppression ou changement d'un champ de la clé.
5. **Le mécanisme peut-il saturer inutilement la table `notifications` ?** Dans l'état actuel, le scénario produit surtout des tentatives et conflits, pas des doublons : le risque de saturation est faible. Il existe toutefois une charge inutile proportionnelle aux ouvertures.
6. **Faut-il corriger quelque chose ?** Oui, il faudrait corriger les limites métier si une notification fiable et durable est attendue : notamment le déclenchement serveur, l'identité par offre et la gestion d'une date prolongée. Ce rapport ne modifie aucun code ni migration.