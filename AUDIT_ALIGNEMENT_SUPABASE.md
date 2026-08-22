# Audit alignement Supabase

## 1. Résumé

Les migrations locales prévoient les fonctionnalités utilisées par le code. Les logs runtime montrent cependant un schéma distant non aligné : HTTP 400 sur la sélection étendue de `candidate_preferences`, HTTP 404 sur `candidate_saved_searches` et `candidate_search_history`.

Aucun code, type ou migration n'a été modifié pendant cet audit.

## 2. Migrations locales

- `20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql` : dépendances de base (`auth.users`, rôles, `is_staff`, `set_updated_at`), crée `job_offers` et ses enums, RLS publique pour offres publiées et RLS staff.
- `20260702_create_candidates_table.sql` : crée `candidates` (`user_id` unique, identité, localisation, avatar, bio, statut), index, RLS propriétaire/staff ; crée aussi expériences, formations et compétences avec FK `candidate_id` et RLS propriétaire.
- `20260702_create_candidate_preferences.sql` : crée `candidate_preferences` avec FK unique vers `candidates`, `contract_types`, `work_types`, `salary_min`, `salary_max`, `seniority_level`, timestamps, index, RLS propriétaire et trigger `set_updated_at`.
- `20260715_add_candidate_availability_and_alerts.sql` : ajoute disponibilité, date, alertes et fréquence à `candidate_preferences`; indexe la disponibilité.
- `20260822100000_required_candidate_mobility_and_cv_tracking.sql` : ajoute mobilité (`mobility_radius_km`, `mobility_modes`) à `candidate_preferences` et `cv_last_updated_at` à `candidates`; ajoute deux index.
- `20260727_add_cv_url_to_candidates.sql` : ajoute `candidates.cv_url`, index fonctionnel et demande de rechargement PostgREST.
- `2026_add_pgvector_matching.sql` : ajoute `candidates.cv_text`, `candidates.embedding_vector`, vecteur des offres, index IVFFlat et RPC de matching ; dépend de pgvector et du schéma offres/candidats.
- `20260702_create_candidate_saved_offers.sql` : crée `candidate_saved_offers`, FK vers candidats/offres, unicité candidat-offre, index et RLS propriétaire/staff.
- `20260702_create_job_applications.sql` : crée `job_applications`, FK vers candidats/offres, statut enum, unicité candidat-offre, index, RLS candidat/staff et trigger timestamp.
- `20260713120000_add_application_subject.sql` : ajoute `job_applications.subject`.
- `20260822120000_enforce_application_cooldown.sql` : supprime l'unicité candidat-offre, ajoute une fonction/trigger empêchant une nouvelle candidature pendant 30 jours.
- `20260702_create_candidate_notifications_system.sql` : ajoute le trigger de notification lors des changements de statut d'application et indexe `notifications`; dépend de `notifications`, `job_applications`, `candidates`, `job_offers` et enums de notification.
- `20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql` et `20260702_add_admin_notifications.sql` : créent/complètent `notifications`, ses champs, enums, FK utilisateur, RLS staff/utilisateur et index.
- `20260822090000_create_candidate_searches.sql` : crée `candidate_saved_searches` et `candidate_search_history`, JSONB `criteria`, FK candidat, index, RLS et grants. Dépend de `candidates` et `set_updated_at`.

## 3. Candidate preferences

La requête réelle de `preferencesApi.ts` sélectionne : `id`, `candidate_id`, contrats, travail, mobilité, salaires, seniorité, disponibilité, alertes et timestamps. Les migrations locales contiennent tous ces champs et la FK vers `candidates` est correcte.

La cause démontrable du HTTP 400 est l'incompatibilité avec le schéma/API distant : la requête demande au moins une colonne non exposée par PostgREST distant. Les logs ne permettent pas d'identifier quelle colonne manque individuellement. Ce n'est pas une preuve de problème RLS : une erreur RLS serait distincte et la migration locale prévoit les policies.

Le code dispose désormais d'un repli vers les colonnes historiques, mais les champs mobilité/disponibilité/alertes ne peuvent pas être persistés tant que leurs colonnes distantes manquent.

## 4. Saved searches

La migration `20260822090000_create_candidate_searches.sql` nomme correctement les tables et crée les colonnes attendues par `searchesApi.ts` : identifiant, candidat, nom, critères JSONB, activation, timestamps pour les sauvegardes ; identifiant, candidat, critères JSONB et `searched_at` pour l'historique.

Les requêtes utilisent exactement ces noms et filtrent par `candidate_id`. Les logs HTTP 404 indiquent que les relations REST ne sont pas trouvées sur la base distante : tables non appliquées, mauvais projet Supabase ou cache PostgREST non actualisé. Une policy RLS ne provoque normalement pas un 404 de relation.

## 5. Search history

`recordSearchHistory` insère après soumission d'une recherche non vide. `getSearchHistory` trie par `searched_at DESC` et limite à 10. La restauration appelle seulement `applyCriteria`; elle ne crée donc pas une nouvelle ligne. Suppression individuelle et suppression complète utilisent les bons filtres locaux.

La table locale possède la policy candidat attendue, mais son application distante n'est pas confirmée. Le trigger `set_updated_at` n'est défini que pour les sauvegardes, ce qui est sans impact sur l'historique.

## 6. Comparaison code / migrations

| Champ | Migration locale | Type TS | Utilisé par le code | Risque |
|---|---|---|---|---|
| `candidates.cv_url` | Oui, migration CV | Oui | documents, profil, dashboard | absent distant possible |
| `candidates.cv_last_updated_at` | Oui, migration mobilité/CV | Oui | dashboard, documents | absent distant possible |
| `candidate_preferences.contract_types` | Oui | Oui | préférences, recherche | faible |
| `candidate_preferences.work_types` | Oui | Oui | formulaire, non appliqué à la recherche | écart fonctionnel |
| `mobility_radius_km`, `mobility_modes` | Oui, migration récente | Oui | formulaire, proximité | HTTP 400 si non déployés |
| disponibilité/alertes | Oui, migration disponibilité | Oui | formulaire, dashboard | HTTP 400 si non déployés |
| recherches sauvegardées | Oui, migration recherches | Oui | `searchesApi`, `JobsPage` | HTTP 404 distant |
| historique recherches | Oui, migration recherches | Oui | `searchesApi`, `JobsPage` | HTTP 404 distant |
| `candidate_saved_offers` | Oui | Oui | `savedOffersApi` | déploiement distant non vérifié |
| `job_applications.subject` | Oui, migration dédiée | Oui | `applicationsApi` | déploiement distant non vérifié |

## 7. État réel de la base distante

« Le schéma Supabase distant ne peut pas être vérifié depuis cet environnement. »

Aucun accès direct au catalogue distant, à Supabase CLI connecté ou à une requête SQL distante n'est disponible ici. Les logs navigateur fournis sont la seule preuve runtime : 400 sur la sélection étendue des préférences et 404 sur les deux tables de recherches. Les types TypeScript et migrations locales ne prouvent pas l'état distant.

## 8. Migrations à exécuter

À appliquer seulement si elles ne figurent pas déjà dans l'historique Supabase :

1. `20260702_create_candidate_preferences.sql` : table de base des préférences.
2. `20260715_add_candidate_availability_and_alerts.sql` : disponibilité et alertes.
3. `20260727_add_cv_url_to_candidates.sql` : URL CV.
4. `20260822090000_create_candidate_searches.sql` : sauvegardes et historique.
5. `20260822100000_required_candidate_mobility_and_cv_tracking.sql` : mobilité et date CV.

Prérequis : `20260702_create_candidates_table.sql` et la fonction `set_updated_at` doivent déjà exister. L'ordre ci-dessus respecte les dépendances. Ne pas exécuter à l'aveugle une migration déjà appliquée, car certaines créations de policies/triggers ne sont pas toutes idempotentes.

## 9. Risques

- Les migrations d'ajout utilisent principalement `ADD COLUMN IF NOT EXISTS` et ne suppriment pas les données.
- La migration des recherches crée des tables et policies, sans modification de données existantes.
- La migration CV ajoute des colonnes et un index, sans suppression.
- L'application des migrations peut échouer si la table ou fonction dépendante manque.
- Les policies RLS peuvent bloquer les utilisateurs si `candidates.user_id` ne correspond pas à `auth.uid()`.
- La migration cooldown supprime volontairement une contrainte d'unicité et change le comportement des candidatures ; elle doit être appliquée séparément avec vérification métier.

## 10. Verdict

- **P0** : aucun blocage prouvé de la recherche publique ou des offres.
- **P1** : schéma distant probablement incomplet pour `candidate_preferences`; cela bloque ou dégrade les préférences avancées.
- **P1** : tables `candidate_saved_searches` et `candidate_search_history` absentes ou non exposées ; sauvegarde et historique ne fonctionnent pas sur le projet distant observé.
- **P2** : état distant de `cv_url`, `cv_last_updated_at`, offres enregistrées et applications non confirmable.
- Cause la plus probable : migrations locales non appliquées au projet Supabase réellement utilisé, ou projet/environnement Supabase différent.
