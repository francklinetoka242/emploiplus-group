# Audit notifications

## Verdict global
RISQUE IDENTIFIÉ

## Architecture actuelle
- Table propriétaire : public.notifications
- Propriétaire réel : user_id (uuid, FK auth.users.id)
- Pas de candidate_id dans la table notifications ; aucun rattachement direct à public.candidates
- Fichiers principaux : src/integrations/supabase/notifications.ts ; src/hooks/useNotifications.ts ; src/features/candidates/api/applicationsApi.ts ; src/pages/candidate/CandidateDashboardPage.tsx ; src/pages/candidate/CandidateSavedOffersPage.tsx ; supabase/migrations/20260702_add_admin_notifications.sql ; supabase/migrations/20260818000000_allow_users_to_see_broadcast_notifications.sql ; supabase/migrations/20260702_create_candidate_notifications_system.sql

## Isolation des candidats
- Lecture : fetchNotifications() charge toutes les lignes sans filtre user_id ; le filtrage se fait côté client dans useNotifications() avec user_id === user.id ou user_id === null. Ce n’est pas un garde-fou serveur.
- Création : presque toutes les notifications sont créées avec user_id = profile.user_id, ou user_id = candidate.user_id. Cela isole bien les candidatures et alertes candidat.
- Suppression : deleteNotification(id) supprime par id seulement ; aucune condition user_id = auth.uid() dans la requête. La sécurité dépend uniquement des RLS.
- Modification : markAsRead() et markAllAsRead() mettent à jour par id ou liste d’ids sans filtrage propriétaire côté requête. La protection dépend des policies.
- Compteur : unreadCount est calculé localement sur la liste chargée, pas via une requête SQL spécifique par utilisateur.

## Résultat de createUniqueNotification
- Isolation correcte au niveau du propriétaire : la recherche de doublon applique .eq("user_id", payload.user_id) et compare le type/titre/body/link.
- Le mécanisme évite les doublons entre notifications du même candidat.
- Il ne mélange pas A et B car la clé de déduplication inclut explicitement user_id.
- Risque : si le payload est null (notification globale), le système crée des lignes pour plusieurs utilisateurs ; ce comportement est intentionnel pour les broadcasts mais pas pour les notifications candidat.

## RLS
- Migrations locales : policy "notif user read" autorise status = 'active' AND (user_id = auth.uid() OR user_id IS NULL)
- Migrations locales : update/delete utilisent user_id = auth.uid()
- Policy admin/staff : public.is_staff(auth.uid())
- Conclusion locale : les lignes personnelles sont bien destinées à leur propriétaire ; la politique est correcte pour les notifications par utilisateur, mais pas pour les notifications globales (user_id NULL) qui sont visibles par tous les utilisateurs authentifiés.
- Limite : la base distante n’a pas été vérifiée directement.

## Problèmes détectés
- P1 — src/integrations/supabase/notifications.ts ; src/hooks/useNotifications.ts ; cause exacte : fetchNotifications(), markAsRead(), markAllAsRead(), deleteNotification() utilisent l’ID sans filtrage par user_id ; le client applique un filtre local, qui n’est pas une protection de sécurité serveur.
- P1 — supabase/migrations/20260818000000_allow_users_to_see_broadcast_notifications.sql ; cause exacte : la lecture publique des notifications globales autorise chaque utilisateur authentifié à voir les lignes avec user_id IS NULL ; cela est fonctionnel pour les broadcasts, mais modifie le périmètre d’accès.
- P2 — src/integrations/supabase/notifications.ts ; cause exacte : l’identité du propriétaire repose sur user_id seulement ; il n’existe pas de contrainte ou de relation explicite vers public.candidates, ce qui rend l’architecture dépendante d’une bonne correspondance user_id/candidat.
- P2 — aucune preuve de validation distante ; cause exacte : le schéma réel et les policies de la base Supabase distante n’ont pas été interrogés.

## Base Supabase distante
NON VÉRIFIABLE
- Code local confirmé : table, colonnes, migrations, policy SQL, appels TypeScript.
- Base distante : non vérifiée ; il faut confirmer en production si RLS est bien active, quelles policies sont en vigueur et si les colonnes/trigger réels correspondent aux migrations.

## Verdict final
Le système localise bien les notifications par user_id et le mécanisme de déduplication par propriétaire est cohérent, mais l’isolation n’est garantie que si la base distante applique les RLS corrects et si les requêtes ne dépendent pas d’un filtrage côté client.
