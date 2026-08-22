# Notifications — Finalisation

## Verdict
SECURISE AVEC LIMITES

## Corrections réalisées
- Protection explicite des opérations personnelles par `user_id` dans les requêtes de lecture, lecture non lue, marquage lu et suppression.
- Homogénéisation des filtres propriétaires dans les fonctions de service et du hook UI.
- Vérification du build final avec `npm run build:vite` après correction.
- Conformité du flux candidat : les notifications créées sont attribuées au `user_id` du candidat concerné.

## Isolation candidat A / candidat B
- lecture: PASS — les listes sont filtrées par `user_id` du compte connecté.
- modification: PASS — les mises à jour de statut/lu sont limitées à `id + user_id`.
- suppression: PASS — la suppression de notification est restreinte au propriétaire.
- compteur: PASS — le compteur ne prend en compte que les notifications du user courant.

## Notifications globales
- Les notifications avec `user_id = null` restent un cas distinct, réservé aux messages globaux ou d’administration.
- Elles ne doivent pas être utilisées comme notifications personnelles.
- Le code applicatif ne les affiche plus comme des notifications dites “personnelles” de candidat.

## Supabase / RLS
- La migration de sécurité est déjà présente : `supabase/migrations/20260822000000_secure_candidate_notifications_rls.sql`.
- Le projet distant a bien été interrogé : la table `public.notifications` existe et la colonne `user_id` est présente.
- Les policies actives exactes n’ont pas été confirmées par une inspection SQL directe de la base distante dans ce contexte, donc la sécurité absolue ne peut pas être déclarée comme entièrement démontrée hors du code local.

## Tests
- A: PASS
- B: PASS
- C: PASS
- D: NON TESTABLE
- E: NON TESTABLE
- F: NON TESTABLE
- G: PASS
- H: PASS
- I: PASS
- J: PASS

## Build
- Résultat : `npm run build:vite` — OK
- La build de production s’exécute sans erreur de compilation.

## Conclusion
Le système est finalisé côté code et conforme à l’isolation par compte pour les notifications personnelles. La sécurisation est robuste au niveau applicatif et migrationnelle, mais la validation RLS distante complète reste limitée à l’inspection réelle disponibles dans ce contexte.