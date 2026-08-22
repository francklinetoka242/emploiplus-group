# Plan de synchronisation Supabase

## 1. Problème actuel

Les migrations locales prévoient les fonctions candidat, mais les logs runtime montrent un décalage avec le projet Supabase utilisé : HTTP 400 sur la sélection étendue de `candidate_preferences`, HTTP 404 sur `candidate_saved_searches` et `candidate_search_history`.

Impossible de confirmer l'état distant de Supabase depuis cet environnement. Les fichiers locaux et les types TypeScript ne prouvent pas qu'une migration a été exécutée à distance.

## 2. Migrations concernées

- `20260702_create_candidates_table.sql` : prérequis `candidates`, `candidates.user_id`, expériences, formations, compétences et RLS.
- `20260702_create_candidate_preferences.sql` : table `candidate_preferences`, FK unique vers `candidates`, contrats, travail, salaires, seniorité, timestamps, policies et trigger.
- `20260715_add_candidate_availability_and_alerts.sql` : disponibilité et alertes dans `candidate_preferences`.
- `20260727_add_cv_url_to_candidates.sql` : `candidates.cv_url`, index et notification de rechargement PostgREST.
- `20260822090000_create_candidate_searches.sql` : `candidate_saved_searches` et `candidate_search_history`, FK, JSONB, index, grants, RLS et trigger.
- `20260822100000_required_candidate_mobility_and_cv_tracking.sql` : `mobility_radius_km`, `mobility_modes` et `candidates.cv_last_updated_at`.

Les fonctionnalités CV avancées dépendent aussi de `2026_add_pgvector_matching.sql`; les offres enregistrées de `20260702_create_candidate_saved_offers.sql`; les candidatures de `20260702_create_job_applications.sql` et `20260713120000_add_application_subject.sql`.

## 3. Ordre d'exécution

Exécuter uniquement les migrations manquantes après vérification :

1. `20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql` si la base initiale, `set_updated_at` ou `is_staff` n'existent pas.
2. `20260702_create_candidates_table.sql` si `candidates` n'existe pas.
3. `20260702_create_candidate_preferences.sql` si `candidate_preferences` n'existe pas.
4. `20260715_add_candidate_availability_and_alerts.sql`.
5. `20260727_add_cv_url_to_candidates.sql`.
6. `20260822090000_create_candidate_searches.sql`.
7. `20260822100000_required_candidate_mobility_and_cv_tracking.sql`.

Priorité immédiate : étapes 3 et 6. Priorité secondaire : étapes 4 et 7. Vérifier l'étape 5 séparément. Ne pas appliquer les migrations d'offres enregistrées, applications, matching ou cooldown uniquement pour corriger les erreurs de recherche.

## 4. Vérifications SQL READ-ONLY

À exécuter dans Supabase SQL Editor avant toute migration :

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('candidates','candidate_preferences','candidate_saved_searches','candidate_search_history','candidate_saved_offers','job_applications','notifications');

SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('candidates','candidate_preferences','candidate_saved_searches','candidate_search_history')
ORDER BY table_name, ordinal_position;

SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name,
       ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('candidates','candidate_preferences','candidate_saved_searches','candidate_search_history');

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates','candidate_preferences','candidate_saved_searches','candidate_search_history');

SELECT n.nspname AS schema_name, p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('set_updated_at','is_staff','has_role');

SELECT n.nspname AS schema_name, c.relname AS table_name, t.tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname = 'public'
  AND c.relname IN ('candidate_preferences','candidate_saved_searches','candidate_search_history','candidates');
```

## 5. Migrations nécessitant une attention particulière

- `20260702_create_candidates_table.sql` n'est pas totalement rejouable : `CREATE TYPE`, `CREATE TABLE`, policies et triggers peuvent déjà exister.
- `20260702_create_candidate_preferences.sql` utilise des créations directes de table, policies et trigger : ne pas rejouer sans contrôle.
- `20260715_add_candidate_availability_and_alerts.sql`, `20260727_add_cv_url_to_candidates.sql` et `20260822100000_required_candidate_mobility_and_cv_tracking.sql` utilisent `ADD COLUMN IF NOT EXISTS`, mais les index/triggers restent à contrôler.
- `20260822090000_create_candidate_searches.sql` utilise `IF NOT EXISTS` pour les tables/index, mais les policies et le trigger peuvent provoquer un conflit s'ils existent déjà.
- `20260822120000_enforce_application_cooldown.sql` modifie une contrainte et le comportement des candidatures : ne pas l'appliquer dans cette synchronisation sans validation séparée.

## 6. Vérification RLS

Après synchronisation, avec un utilisateur candidat réel : vérifier que `candidates.user_id = auth.uid()`, que sa ligne de préférences est lisible/modifiable, et que les requêtes de recherches sauvegardées/historique ne retournent que ses lignes. Tester également qu'un autre `candidate_id` ne peut pas être lu, inséré ou supprimé.

## 7. Vérification PostgREST

Après chaque ajout de colonnes ou tables, exécuter :

```sql
NOTIFY pgrst, 'reload schema';
```

Cette instruction n'est pas une vérification de données ; elle recharge le cache de schéma. Vérifier ensuite depuis l'application les sélections étendues et les routes REST concernées.

## 8. Tests après synchronisation

1. Ouvrir `/candidate/profile?tab=preferences` et lire les préférences.
2. Modifier puis enregistrer contrats, mobilité, disponibilité et alertes.
3. Ouvrir `/jobs` et vérifier l'absence de 400/404 dans la console.
4. Sauvegarder, restaurer, renommer, activer/désactiver et supprimer une recherche.
5. Effectuer une recherche non vide, vérifier son insertion dans l'historique, puis vérifier la limite de 10 et l'ordre `searched_at DESC`.
6. Tester suppression individuelle et effacement complet.
7. Vérifier l'isolation RLS avec un second candidat.

## 9. Risques

Les migrations d'ajout et de recherches ne suppriment pas les données, mais peuvent échouer sur objets déjà existants ou dépendances absentes. Les policies peuvent révéler des incohérences `user_id`. Le cooldown d'application est hors périmètre et peut changer un comportement existant.

## 10. Verdict

Priorité immédiate : vérifier puis appliquer uniquement `20260702_create_candidate_preferences.sql` et `20260822090000_create_candidate_searches.sql`, avec leurs prérequis. Priorité secondaire : mobilité/alertes, `cv_url` et fraîcheur CV. L'application distante doit être inspectée avant toute exécution ; aucune synchronisation automatique n'a été effectuée ici.
