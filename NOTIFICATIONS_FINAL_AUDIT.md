# Audit final des notifications

## VERDICT
sécurisé avec limites

## Isolation des utilisateurs
- Lecture : [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts) charge uniquement les lignes du compte connecté via `getNotificationsForUser(user.id)` ; la logique de filtrage client ne dépend plus d’une table entière chargée puis triée localement.
- Création : les notifications personnelles sont créées avec `user_id` explicite dans [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) et les points d’entrée candidat utilisent ce propriétaire.
- Modification : `markAsRead()` et `markAllAsRead()` filtrent par `id + user_id` côté Supabase.
- Suppression : `deleteNotification(id, userId)` est limité à `user_id = auth.uid()` dans les requêtes applicatives.
- Compteur : `getUnreadNotificationCount(userId)` compte uniquement les notifications non lues de l’utilisateur courant.

## Notifications globales
- Les notifications globales/broadcast restent distinctes des notifications personnelles.
- Le code candidat ne traite désormais plus les lignes `user_id IS NULL` comme des notifications personnelles.
- Le comportement exact d’un broadcast dépend du schéma distant et des policies réellement en vigueur ; il n’a pas été vérifié sur Supabase distante.
- Pour un vrai broadcast, l’état lu/suppression doit être individuel par utilisateur ; une table d’état par utilisateur n’est pas nécessaire tant que le système n’utilise pas de lignes globales dans le flux candidat.

## Améliorations réellement apportées
- Sécurisation des opérations personnelles par `user_id` dans [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts).
- Lecture et compteur limités au compte connecté dans [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts).
- Vérification explicite de propriété avant mark-as-read / delete.
- Migration RLS sécurisée ajoutée : [supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql](supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql).
- Déduplication conservée au niveau du propriétaire via `user_id` dans `createUniqueNotification`.

## Base Supabase
- RLS vérifiée réellement : NON.
- Base distante interrogée : NON.
- Migration locale créée : oui, [supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql](supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql).
- À exécuter sur Supabase avant de conclure à une sécurité totale.
- Les migrations antérieures [supabase/migrations/20260818000000_allow_users_to_see_broadcast_notifications.sql](supabase/migrations/20260818000000_allow_users_to_see_broadcast_notifications.sql) et [supabase/migrations/20260702_add_admin_notifications.sql](supabase/migrations/20260702_add_admin_notifications.sql) doivent être confirmées dans la base réelle.

## Tests des scénarios
- A. A lit B : non validé sur la base distante ; le code appliqué est correct mais la base réelle doit confirmer la RLS.
- B. A supprime la notification de B : non validé sur la base distante ; code limité par `user_id`, mais la RLS réelle reste à valider.
- C. A modifie l’état de la notification de B : non validé sur la base distante ; code bloque côté application.
- D. Notification personnelle avec `user_id` : validé par le code applicatif ; protection finale dépend de la RLS distante.
- E. Notification globale `user_id = NULL` : code candidat ne l’affiche plus comme personnelle ; comportement exact non vérifié sur Supabase.
- F. Compteur : validé dans le code applicatif pour le compte connecté.
- G. Candidature / offre / CV / alerte : validé par le rattachement explicite à `user_id` dans les appels de création et les triggers locaux.

## Build
- Commande exécutée : `npm run build:vite`
- Résultat exact : succès, build terminé sans erreur bloquante.

## Conclusion
Le code applicatif est désormais cohérent et protégé par propriétaire, mais la sécurité complète reste conditionnée à l’exécution effective de la migration RLS sur la base Supabase distante.
