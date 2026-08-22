# Audit d'implémentation

## 1. Résumé global
- Complètes : 11
- Partielles : 5
- Non implémentées : 3
- Bloquées : 0

## 2. Tableau de vérification
| Fonctionnalité | Statut | Zone/fichier | Problème éventuel |
|---|---|---|---|
| Ma prochaine action | ✅ COMPLÈTE | src/pages/candidate/CandidateDashboardPage.tsx | Aucune. Piste dynamique selon profil, préférences et complétion. |
| Statut “Je suis disponible” | ✅ COMPLÈTE | src/features/profile/components/sections/PreferencesSection.tsx | Données persistées dans candidate_preferences. |
| Préférences de disponibilité, mobilité et recherche | ⚠️ PARTIELLE | src/features/profile/components/sections/PreferencesSection.tsx; src/features/candidates/api/preferencesApi.ts | Disponibilité et recherche oui ; mobilité absente (pas de rayon / modes de mobilité). |
| Alertes emploi | ✅ COMPLÈTE | src/features/candidates/api/preferencesApi.ts; src/pages/candidate/CandidateDashboardPage.tsx | Activation/désactivation persistée et notifications déclenchées. |
| Notifications liées aux alertes | ✅ COMPLÈTE | src/integrations/supabase/notifications.ts; src/pages/candidate/CandidateDashboardPage.tsx | createUniqueNotification utilisé pour alerter candidat + profil. |
| Notifications liées au profil/CV | ✅ COMPLÈTE | src/pages/candidate/CandidateDashboardPage.tsx | Déclenchement sur profil incomplet, CV absent, alertes actives. |
| Recherche d'emploi intelligente | ✅ COMPLÈTE | src/pages/public/JobsPage.tsx; src/services/aiMatchingService.ts | Complète côté UI + logique de recommandation + filtres. |
| Recherche en langage naturel | ✅ COMPLÈTE | src/features/jobs/search/naturalLanguageSearch.ts; src/pages/public/JobsPage.tsx | Parsing, aliases, localisation, contrat, salaire. |
| Recherche sauvegardée | ✅ COMPLÈTE | src/features/jobs/api/searchesApi.ts; src/pages/public/JobsPage.tsx | Table + API + UI + modification + activation/désactivation. |
| Historique des recherches | ✅ COMPLÈTE | src/features/jobs/api/searchesApi.ts; src/pages/public/JobsPage.tsx | Limite 10, persistance, suppression. |
| Suggestions / synonymes métiers | ✅ COMPLÈTE | src/features/jobs/search/naturalLanguageSearch.ts | Suggestions pertinentes pour développeur/comptable. |
| Offres proches de moi | ⚠️ PARTIELLE | src/pages/public/JobsPage.tsx | Utilise la ville du profil, pas un vrai calcul géographique / distance réelle. |
| Notifications intelligentes | ⚠️ PARTIELLE | src/integrations/supabase/notifications.ts | Présence de notification centralisée, mais pas de logique intelligente de déclenchement multi-événements. |
| Détection d'un CV ancien | ❌ NON IMPLÉMENTÉE | n/a | Aucun champ date de mise à jour CV, aucun test de fraîcheur, aucune alerte. |
| Offres similaires | ❌ NON IMPLÉMENTÉE | n/a | Aucun service, table, composant ou logique de similarité. |
| Alternatives aux offres expirées | ❌ NON IMPLÉMENTÉE | n/a | Aucune recherche de remplacement, aucun fallback, aucune suggestion. |
| Recommandations contextuelles | ⚠️ PARTIELLE | src/pages/candidate/CandidateDashboardPage.tsx; src/pages/public/JobsPage.tsx | Recommandations basées sur le profil, mais pas de contexte métier / offre / expiration / action. |
| Intégration avec “Ma prochaine action” | ✅ COMPLÈTE | src/pages/candidate/CandidateDashboardPage.tsx | UI et logique alignées. |
| Cohérence globale du parcours candidat | ⚠️ PARTIELLE | plusieurs pages | Les flux principaux existent, mais la cohérence “CV / profil / recherche / recommandation / notification” reste incomplète sur les fonctionnalités avancées. |

## 3. Base de données
### A. Migrations existantes
- src/supabase/migrations/20260702_create_candidate_preferences.sql : table candidate_preferences.
- src/supabase/migrations/20260715_add_candidate_availability_and_alerts.sql : disponibilité + alertes.
- src/supabase/migrations/20260702_create_candidate_notifications_system.sql : notifications + trigger.
- src/supabase/migrations/20260702_create_candidate_saved_offers.sql : offres enregistrées.
- src/supabase/migrations/20260822090000_create_candidate_searches.sql : saved searches + history.
- src/supabase/migrations/20260702_create_job_applications.sql : candidatures.

### B. Migrations manquantes / données absentes
- 🔴 MIGRATION MANQUANTE : mobilité réelle (rayon / modes) pour candidate_preferences.
- 🔴 MIGRATION MANQUANTE : date de mise à jour du CV pour détection d'ancienneté.
- 🔴 MIGRATION MANQUANTE : tables/services spécifiques à “offres similaires” et “alternatives expirées”.

### C. Problèmes de schéma
- candidate_preferences ne contient ni mobility_radius_km ni mobility_modes.
- candidates n’a pas de colonne cv_last_updated_at ni équivalent.
- Aucune table dédiée à similar_offers / expired_alternatives / offer_context_recommendations.

## 4. Problèmes critiques
- Le “proche de moi” n’est pas un vrai calcul de distance ; il se limite à la ville du profil.
- Aucune logique de détection de CV ancien ni de relance associée.
- Aucune similitude d’offres ou alternative aux offres expirées dans le code réel.
- Les notifications sont majoritairement manuelles / ad hoc ; l’intelligence métier n’est pas réellement persistée.
- Le stockage de documents CV dans localStorage ajoute des ruptures de cohérence cross-device.

## 5. Corrections recommandées
### P0
- Ajouter les colonnes mobilité et date de mise à jour CV.
- Implémenter une vraie logique de proximité géographique, si des coordonnées sont disponibles.
- Supprimer / corriger les fonctionnalités annoncées mais non supportées par la base et les services.

### P1
- Créer les tables de recommandation contextuelle et offres similaires.
- Ajouter un mécanisme de détection de CV ancien avec notification associée.
- Faire passer les recommandations par un service métier unifié, pas seulement un hook UI.

### P2
- Harmoniser les notifications autour d’un moteur de règles métier.
- Réduire le stockage local-only des fichiers CV pour garder une base de vérité serveur.

## 6. Fichiers SQL à exécuter
- supabase/migrations/20260822100000_required_candidate_mobility_and_cv_tracking.sql (fichier préparé)

## 7. Verdict
PRÊT APRÈS MIGRATIONS

Le noyau Phase 1 et Phase 2 est bien présent et cohérent, mais plusieurs fonctionnalités de Phase 3 ne sont ni réellement persistées ni réellement implémentées dans le code et la base. La migration préparée est nécessaire pour corriger le manque de mobilité et de traçabilité du CV ancien.
