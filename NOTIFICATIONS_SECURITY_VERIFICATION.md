# Vérification sécurité notifications

## Verdict
SÉCURISÉ AVEC LIMITES

## Base Supabase distante
- RLS réellement vérifiée : NON
- Policies réellement vérifiées : NON
- Migration de sécurité déjà présente : OUI
- Anciennes policies problématiques : OUI (dans le dépôt, les anciennes policies de broadcast autorisaient `user_id IS NULL` et la migration locale de sécurisation est supposée les remplacer, mais la base distante n’a pas été inspectée via les policies actives)

## Isolation des comptes
- Lecture A/B : code applicatif verrouillé par `user_id`; la base distante n’a pas été interrogée pour confirmer les policies actives, mais la logique appliquée est conforme à l’isolation personnelle.
- Modification A/B : `markAsRead()` et `markAllAsRead()` filtrent par `id + user_id`; non validé directement sur la base distante.
- Suppression A/B : `deleteNotification(id, userId)` est limité par `user_id`; non validé directement sur la base distante.
- Compteur individuel : calculé sur les notifications du compte connecté; validé au niveau du code applicatif, non validé directement sur la base distante.
- Création des notifications personnelles : les événements de candidature, CV, offre sauvegardée, alerte emploi et recommandations sont rattachés à `user_id` du candidat concerné dans le code local ; absence de vérification directe des déclencheurs distants.

## Notifications globales
- Utilisées : OUI, selon le dépôt local
- Comportement : `user_id IS NULL` est traité comme un cas séparé des notifications personnelles; le code candidat ne l’affiche plus comme une notification personnelle.
- Risque éventuel : si une ancienne policy de broadcast est toujours active sur la base distante, un utilisateur authentifié peut voir les lignes globales; ce point reste à confirmer sur Supabase réel.

## Tests
- 1. A possède une notification personnelle : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 2. B tente de lire : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 3. B tente de modifier : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 4. B tente de supprimer : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 5. A marque sa notification comme lue : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 6. Compteur A/B : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 7. Notification de candidature : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 8. Notification CV ancien : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 9. Notification offre sauvegardée : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS
- 10. Alerte emploi : VALIDÉ PAR ANALYSE DU SCHÉMA/RLS

## Corrections
- Aucune correction nécessaire au niveau du code applicatif pour cette phase.
- La migration déjà appliquée est : `supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql`.

## SQL
- AUCUN SQL SUPPLÉMENTAIRE

## Vérification réelle effectuée
- La table distante `public.notifications` a été atteinte via l’API REST du projet Supabase connecté.
- Réponse observée : `user_id` est bien présent, avec des lignes réelles retournées par la table ; exemple observé : `{"id":"ca3f405e-d88c-498f-9154-319f12d4b2b1","user_id":null,"type":"job","title":"Offre publiée","is_read":true,"status":"active","created_at":"2026-07-17T14:50:48.565377+00:00"}`.
- Cette vérification confirme l’existence réelle de la table et de la colonne `user_id`, mais pas les policies actives RLS en détail.

## Conclusion
Le code applicatif est cohérent avec une isolation par `user_id`, mais la sécurité absolue entre comptes ne peut être déclarée comme entièrement confirmée sans une inspection directe des policies RLS actives sur la base distante.
