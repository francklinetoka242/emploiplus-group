# Rapport d’implémentation notifications

## 1. Problèmes corrigés
- Sécurité renforcée : les lectures, suppressions et mises à jour personnelles exigent maintenant le `user_id` du compte connecté.
- Contrôle côté requête ajouté dans [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts) pour marquer comme lu, tout marquer comme lu et supprimer uniquement les notifications du candidat courant.
- Contrôle côté service ajouté dans [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) via `getNotificationsForUser()` et `getUnreadNotificationCount()`.
- La logique de compteur n’est plus calculée sur une liste globale non filtrée.
- La déduplication reste attachée au propriétaire (`user_id`) pour éviter les collisions entre candidats.

## 2. Fichiers modifiés
- [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts)
- [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts)
- [supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql](supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql)

## 3. Modifications Supabase/RLS
- Migration ajoutée pour sécuriser la table `public.notifications`.
- Les politiques personnelles autorisent uniquement : SELECT/INSERT/UPDATE/DELETE où `user_id = auth.uid()`.
- Une politique admin/staff reste réservée aux comptes autorisés via `public.is_staff(auth.uid())`.
- L’accès inter-utilisateur est bloqué par la base, même si un ID de notification est manipulé.

## 4. Migration SQL créée
- [supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql](supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql)
- À exécuter sur Supabase si la base distante n’a pas encore la politique renforcée.

## 5. Gestion des notifications personnelles
- Une notification personnelle appartient à un seul `user_id`.
- La liste candidate est filtrée sur `user_id = auth.uid()`.
- Les suppressions sont exécutées avec `id + user_id`.
- Les lectures sont exécutées avec `id + user_id`.
- Le compteur est calculé uniquement sur les lignes du candidat connecté.

## 6. Gestion des notifications globales
- L’architecture personnelle reste séparée des notifications globales/broadcast.
- Les lignes `user_id IS NULL` ne sont plus traitées comme un flux personnel dans le hook candidat.
- Une notification globale n’est pas considérée comme un objet partagé par tous les candidats au niveau de l’UI à traitement personnel.
- La personnalisation d’état individuel reste préférable si un vrai broadcast est réintroduit.

## 7. Suppression et lecture individuelles
- La suppression de notification du candidat ne supprime que la ligne qui correspond à son `user_id`.
- Les notifications d’un autre candidat restent intactes.
- `markAsRead()` et `markAllAsRead()` ne touchent que les IDs appartenant au compte connecté.
- L’état visible dans l’UI est recalculé immédiatement.

## 8. Compteur non lu
- `getUnreadNotificationCount()` applique le filtre `user_id = auth.uid()` et `is_read = false` directement côté Supabase.
- Le compteur de la page candidat est désormais calculé sur les lignes du compte connecté uniquement.
- Il reste cohérent après connexion, rafraîchissement et actions de lecture/suppression.

## 9. createUniqueNotification
- La déduplication conserve le `user_id` dans la clé de comparaison.
- Deux candidats peuvent recevoir des notifications distinctes pour la même offre sans interférence.
- Un même candidat ne reçoit pas des doublons identiques pour le même événement.

## 10. Améliorations supplémentaires ajoutées
- Séparation plus claire entre flux personnel et global.
- Requêtes plus sûres et plus efficaces.
- Contrôle explicite sur l’identité du propriétaire dans le code applicatif.
- Mécanisme de compteur plus robuste et moins dépendant du front.

## 11. Tests réalisés
- Build vérifié : `npm run build:vite`
- Résultat : succès, build validé.
- Les scénarios de sécurité ont été audités au niveau du code et des requêtes applicatives.

## 12. Éléments nécessitant une action manuelle sur Supabase
- Exécuter la migration [supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql](supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql) dans le projet Supabase distant.
- Vérifier que la base distante applique bien la nouvelle politique et que les anciens doublons de policy ne restent pas actifs.

## 13. Verdict final
- CODE CORRIGÉ — MIGRATION SUPABASE À EXÉCUTER

La couche applicative est désormais isolée par `user_id`, mais la sécurité complète reste conditionnée à l’exécution de la migration SQL sur la base distante.
