# Audit notifications et nettoyage architecture

## Problèmes trouvés

- `useNotifications()` lisait uniquement les notifications avec `user_id = auth.uid()`.
- Les broadcasts `user_id IS NULL` étaient autorisés par une ancienne migration puis bloqués par la migration de sécurisation.
- Le hook effectuait directement les mises à jour et suppressions Supabase.
- `createNotification()` transformait un broadcast en plusieurs notifications personnelles.
- Un trigger SQL créait des notifications pour des statuts RH non vérifiables depuis l'application.
- Le compteur non lu était recalculé dans le hook au lieu d'utiliser l'API officielle.

## Architecture avant

```text
Composants / pages
  -> useNotifications ou appels directs
  -> Supabase notifications
```

Le domaine possédait déjà `src/integrations/supabase/notifications.ts`, mais le hook conservait une logique concurrente pour lire, marquer et supprimer.

## Architecture après

```text
Page ou composant
  -> useNotifications
  -> notifications.ts
  -> notifications + RLS Supabase
```

`src/integrations/supabase/notifications.ts` est l'API officielle pour créer, lire, compter, modifier, masquer et supprimer les notifications.

## Source unique

API officielle :

- `createNotification()` ;
- `createUniqueNotification()` ;
- `getNotificationsForUser()` ;
- `getUnreadNotificationCount()` ;
- `markNotificationsAsRead()` ;
- `updateNotification()` ;
- `toggleNotificationVisibility()` ;
- `maskNotificationsForUser()` ;
- `deleteNotification()`.

`useNotifications()` ne manipule plus directement les lignes Supabase pour les mutations.

## Notifications ciblées

Une notification personnelle utilise `notifications.user_id = auth.uid()` du destinataire.

La lecture, le marquage et la suppression sont limités à cet utilisateur. Les notifications ciblées ne sont jamais exposées à un autre candidat par l'API ou le RLS.

## Broadcasts

Les broadcasts restent des lignes avec `user_id IS NULL`, mais seuls les types explicitement autorisés sont diffusés :

- `admin` ;
- `offre` ;
- `job` ;
- `blog` ;
- `evenement`.

Les types `candidature` et `contact` ne peuvent pas être broadcastés.

`getNotificationsForUser()` et `getUnreadNotificationCount()` utilisent le même filtre personnel/broadcast. Les broadcasts sont lisibles mais ne sont pas modifiés ou supprimés comme s'ils appartenaient à un candidat.

## Evénements réellement supportés

- notification de bienvenue candidat ;
- notification administrative ;
- recommandation disponible ;
- rappel de CV ancien ;
- retrait réel d'une candidature ;
- broadcasts admin/offre/blog/événement explicitement créés ;
- événements SQL de contact ou publication existants, sous réserve de leur configuration réelle.

Le trigger SQL de changement de statut de candidature a été supprimé. L'application ne simule plus les événements “présélectionnée”, “acceptée” ou “rejetée” sans workflow RH vérifiable.

Le statut `submitted` représente l'enregistrement de la candidature. Le statut `withdrawn` représente son retrait par le candidat.

## Candidatures

```text
Candidat
  -> applyToJob()
  -> job_applications
  -> /api/send-email
  -> entreprise cible
```

Le retrait déclenche uniquement une notification interne réelle au candidat. Aucun événement de consultation, entretien ou décision RH n'est généré.

## Doublons identifiés

- mutations directes dans `useNotifications()` ;
- calcul local du compteur non lu ;
- logique de broadcast par fanout dans `createNotification()` ;
- anciens triggers SQL de statut candidature ;
- anciennes migrations RLS contradictoires.

Les wrappers publics du service notifications ont été conservés pour ne pas casser les imports existants. Les hooks candidat historiques restent des réexports et ne constituent pas un second système actif.

## Fichiers modifiés

- `src/integrations/supabase/notifications.ts`
- `src/hooks/useNotifications.ts`
- `src/services/aiMatchingService.ts`
- `supabase/migrations/20260824130000_allow_candidate_broadcast_notifications.sql`
- `supabase/migrations/20260824140000_disable_unsupported_application_notifications.sql`

## Migrations

`20260824130000_allow_candidate_broadcast_notifications.sql` ajoute une politique RLS de lecture pour les broadcasts valides.

`20260824140000_disable_unsupported_application_notifications.sql` supprime le trigger et la fonction SQL de notifications RH non vérifiables.

## Tests réalisés

- Diagnostics éditeur sur les fichiers notifications, candidature, matching et authentification : aucune erreur trouvée.
- `npm run build` : réussi, Vite et prerender inclus.
- Tests CV/matching lancés : les 3 tests CV passent ; 2 anciens tests matching ne se chargent pas avec Node seul à cause d'importations TypeScript sans extension.

## Tests non exécutés

Les scénarios personnels, broadcasts, marquage, suppression, compteur et unicité n'ont pas été exécutés contre Supabase réel, faute d'environnement distant/mocks configurés. Ils nécessitent une base de test avec les migrations appliquées.

## Vérifications Supabase nécessaires

- appliquer les deux migrations nouvelles ;
- vérifier l'ordre des migrations RLS notifications ;
- vérifier que les broadcasts valides sont effectivement créés avec `user_id NULL` ;
- tester l'isolation entre deux utilisateurs ;
- tester la lecture et le compteur des broadcasts ;
- vérifier les droits staff pour créer, masquer et supprimer ;
- confirmer que l'ancien trigger de statut candidature est absent ;
- vérifier les notifications générées par les triggers contact/blog ;
- vérifier l'absence de doublons après appels concurrents à `createUniqueNotification()`.

## Limites restantes

Le contrôle global TypeScript conserve des erreurs historiques dans plusieurs pages et types `JobOffer`, indépendantes de cette correction. Le build de production reste réussi. Les tests d'intégration Supabase restent à ajouter dans un environnement de test isolé.
