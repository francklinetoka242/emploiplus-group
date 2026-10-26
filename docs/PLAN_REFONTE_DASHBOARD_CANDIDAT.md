# Plan de refonte — tableau de bord candidat

## 1. Composants à créer
| Composant | Fichier cible | Rôle | Données / source exacte | États |
|---|---|---|---|---|
| `DashboardWelcome` | `src/components/candidate/dashboard/DashboardWelcome.tsx` | Salutation, contexte, anneau de complétude | `useCandidateProfileData`; `useProfileCompletion` → `calculateProfileCompletion` | skeleton; profil indisponible; 100 % sans CTA |
| `NextBestAction` | `.../NextBestAction.tsx` | Une action calculée et son lien | résultat `getNextBestAction`; données agrégées | chargement; aucune action prioritaire |
| `DashboardIndicators` | `.../DashboardIndicators.tsx` | Candidatures, favoris, non-lues, plan | `useCandidateApplications`; `useCandidateSavedOffers`; `useNotifications`; source abonnement non trouvée | loading indépendant; zéro; erreurs visibles |
| `ApplicationProgress` | `.../ApplicationProgress.tsx` | Répartition par statut et activité sur 8 semaines | `getCandidateApplications` (`job_applications.applied_at`, `status`) | skeleton; vide; erreur; annonce limite de données |
| `UpcomingDeadlines` | `.../UpcomingDeadlines.tsx` | Favoris avec échéance, date relative | `getCandidateSavedOffers`; `deadline` puis `expires_at` | loading; vide; erreur; dates absentes/expirées exclues |
| `RecommendedJobsSection` | `.../RecommendedJobsSection.tsx` | Recommandations existantes, score, CTA | `getRecommendedJobsWithStatus` dans `src/services/aiMatchingService.ts`; `JobCard` | conserve `no_cv`, `cv_processing`, `cv_analysis_failed`, `error`, vide, succès |
| `DashboardAdvice` | `.../DashboardAdvice.tsx` | Suggestions Maelise + conseil tiré d’une fiche | `MaeliseWidget`/traductions `maelise.suggestion.*`; `fetchLocalGuides({ visibleOnly: true })` | loading; aucune fiche; erreur; suggestions constantes |

Tous les fichiers ci-dessus sont à créer sous `src/components/candidate/dashboard/`; `...` désigne ce même dossier.

## 2. Hooks, types et logique métier
- `useCandidateDashboardData` (nouveau, `src/features/candidates/hooks/`) regroupe `useCandidateProfileData`, `useCandidateApplications`, `useCandidateSavedOffers`, `useNotifications`, recommandations et fiches visibles; retourne données typées + états/erreurs par source.
- Anti-doublon : un seul appel par source au montage; réutiliser cache/listeners de `useCandidate` et le store partagé de `useNotifications`; ne pas remonter le dashboard avec d’autres hooks qui refont les mêmes chargements. Les hooks favoris/candidatures utilisent eux-mêmes `useCandidate`.
- Le dashboard charge actuellement les recommandations dans `CandidateDashboardPage`; déplacer cette responsabilité sans appeler le service deux fois. `getRecommendedJobsWithStatus` relit des données candidat dans le service : vérifier/éviter ce doublon avec `profile` sans modifier son contrat sans test.
- `getNextBestAction` (fonction pure; nouveau `src/features/candidates/dashboard/getNextBestAction.ts`) : entrées profil + complétude + CV/date + échéances favorites + état recommandations + accès Maelise; sortie `{ id, title, description, href, icon } | null`.
- Priorité stricte : profil incomplet → CV absent/ancien (`cv_last_updated_at`, 180 jours déjà contrôlés dans le dashboard) → échéance favorite dans 7 jours → recommandations disponibles → assistant Maelise. Les échéances/résultats doivent être connus; aucun contenu fictif.
- « Recommandations non consultées » : aucun état de consultation trouvé. Phase 1 : proposer « Découvrir vos recommandations » si elles sont disponibles, sans prétendre qu’elles n’ont pas été vues; tracking de consultation = phase 2.
- `applicationStatus.ts` (nouveau, `src/features/candidates/types/applicationStatus.ts`) centralise le schéma réel `Database.public.Enums.application_status` (`src/integrations/supabase/types.ts`) et les libellés/icônes/couleurs proposés :

| Valeur réelle | Usage actuel | Libellé proposé | Couleur | Icône Phosphor |
|---|---|---|---|---|
| `submitted` | `applicationsApi.ts`; page candidatures | Envoyée | bleu (`primary`) | `PaperPlaneTilt` |
| `reviewed` | enum; badge page candidatures | Consultée | cyan (`accent-cyan`) | `Eye` |
| `shortlisted` | enum; badge page candidatures | Présélectionnée | violet | `Star` |
| `rejected` | enum; badge page candidatures | Refusée | ardoise | `XCircle` |
| `accepted` | enum; badge page candidatures | Acceptée | vert | `CheckCircle` |
| `withdrawn` | `applicationsApi.ts`; page candidatures | Retirée | gris | `ArrowUUpLeft` |

- À date, la page affiche « Statut mis à jour » pour `reviewed`, `shortlisted`, `rejected`, `accepted`; aucune valeur `interview` dans l’enum. Ce mapping est une proposition UX, non une donnée historique de transitions.
- Complétude : calcul unique dans `src/features/profile/profileCompletion.ts`, hook `src/features/profile/hooks/useProfileCompletion.ts`; 10 critères de poids égal (nom, titre, ville+pays, bio, expériences, formations, compétences, langues, préférences, CV), score `round(completed / 10 × 100)`. Réutiliser tel quel; centralisation déjà faite.

## 3. Ancien vs nouveau
| Bloc actuel de `CandidateDashboardPage.tsx` | Action | Justification | Nouveau placement |
|---|---|---|---|
| Bienvenue fixe + anneau | Modifier | Salutation/texte contextualisés; garder le score exact | `DashboardWelcome` |
| 3 `quickActions` codées en dur | Supprimer | Elles ne priorisent pas les besoins réels | remplacées par `NextBestAction` |
| Carte vide « Recent Offers » (commentaire seul) | Supprimer | Aucun bloc correspondant rendu | — |
| Offres recommandées + `JobCard` + pagination | Conserver / modifier | Service et pagination existent; enrichir sans changer matching | `RecommendedJobsSection` |
| Notifications créées par effets (CV âgé, profil, alertes) | Conserver avec précaution | Fonction métier déjà présente; éviter les doublons lors du déplacement | logique du hook/page, non du rendu |
| `SaasCard`/`SaasGrid` | Supprimer si non rendu | Importés mais inutilisés dans le rendu courant | remplacés par nouvelles sections |
| `MaeliseWidget` intégré au `CandidateLayout` | Conserver | Assistant déjà global; suggestions en complément, pas de second chatbot | `DashboardAdvice` + widget existant |

## 4. Direction visuelle
- Réutiliser tokens existants `--brand`/`--primary` (`#1b2ce3`), `--secondary`/`--accent` (`#e8a900`, accent chaud existant), `--background`, `--card`, `--muted`, `--border`, `--radius` (`0.625rem`), `--shadow-soft`, `--shadow-elev`; classes `rounded-xl/2xl`, `border-border`, `bg-card`, `text-muted-foreground`. Pas de changement global CSS.
- Icônes `@phosphor-icons/react`, duotone par défaut; `fill` pour statut/état actif; taille cohérente 20–24 px. Accent or réservé aux échéances/attention, pas aux erreurs.
- Framer Motion : apparition courte/stagger léger et transitions de jauge/carte; respecter `prefers-reduced-motion` (pas de déplacement ni animation non essentielle) et `EcoModeContext.isEcoMode` (désactiver animations JS, stagger, compteurs animés; afficher valeurs finales). Le CSS global Eco Mode désactive déjà transitions/animations.
- Responsive : mobile = pile verticale, KPI 2 colonnes, courbe simplifiée ou défilable avec libellés lisibles; tablette = grille 2 colonnes; desktop = KPIs alignés, candidatures/frise et activité côte à côte, recommandations pleine largeur. Ne pas faire dépendre l’accès au contenu d’un hover.
- Accessibilité : ordre de focus logique, titres hiérarchisés, liens/boutons nommés, contraste WCAG, icônes décoratives `aria-hidden`, graphiques Recharts avec résumé textuel et données accessibles, statut sans couleur seule, jauge `role=progressbar`, dates affichées en texte compréhensible.

## 5. Ordre d’implémentation
1. **Statuts et sélecteurs** — créer `src/features/candidates/types/applicationStatus.ts` et `src/features/candidates/dashboard/getNextBestAction.ts`; aucun fichier modifié. Validation navigateur : mapping cohérent sur six statuts et action conforme à chaque priorité.
2. **Agrégation des sources** — créer `src/features/candidates/hooks/useCandidateDashboardData.ts`; modifier avec précaution `src/features/candidates/api/applicationsApi.ts` pour couvrir la fenêtre 8 semaines au-delà de la limite actuelle de 20 (sans nouvel endpoint). Validation : mêmes données qu’aux pages métier, loading/erreur distincts, historique exact.
3. **Sections UI** — créer les composants listés en section 1; pas de fichier partagé modifié. Validation : états loading, vide, erreur et données réelles visibles.
4. **Assemblage dashboard** — modifier `src/pages/candidate/CandidateDashboardPage.tsx` seulement; retirer actions statiques et conserver les effets métier/recommandations sans doublon. Validation : ordre des sept sections, liens et interactions fonctionnels.
5. **Responsive / accessibilité / mouvement** — retoucher uniquement les nouveaux composants et la page; ne pas modifier `styles.css`. Validation navigateur mobile/tablette/desktop, clavier, contraste, `prefers-reduced-motion` et Eco Mode.
6. **Régression et vérification** — tests ciblés, `npm run build`, lint ciblé; vérifier recommandation sans CV, données vides/erreur, profil à 100 %, dates. Validation : aucune régression de navigation ni appel répété au même chargement.

- **À ne pas toucher** : `CandidateLayout`, `CandidateSidebar`, `App.tsx`, guards/routes — shell, navigation et permissions partagés.
- **À toucher avec précaution** : `applicationsApi.ts` (page candidatures dépend de sa forme); `styles.css` (tokens globaux multi-espaces), idéalement inchangé. Ne pas modifier les services/admin/public pour ce redesign.

## 6. Risques et données manquantes
- Risques : `useCandidate` a cache partagé; notifications ont un store global et un chargement à l’abonnement; hooks existants avalent certaines erreurs en renvoyant `[]`; éviter chiffres présentés comme complets si le fetch est partiel.
- `getCandidateApplications` renvoie seulement les 20 plus récentes : indicateurs et activité 8 semaines incomplets si davantage de lignes; adapter filtre/pagination à `applied_at` et tester les pages consommatrices. Un historique de transitions est absent : `status` décrit l’état courant, pas une frise d’événements.
- Abonnement : `CandidateSubscriptionPage` montre les plans et `CandidateBillingPanel`, mais source, plan actif fiable et date d’expiration accessibles au dashboard : Non trouvé. Phase 1 : ne pas afficher de « jours restants » inventés; carte en attente de source ou indicateur limité aux données confirmées.
- Échéances : favoris ont `deadline`/`expires_at`; échéance pour toutes les offres recommandées non garantie. `savedOffersApi` ne fournit pas d’état « consulté ».
- Phase 2, si souhaitée : événements d’entretien (`job_application_events`: application, type, date, détails); relances (`follow_up_at`/historique); consultation des recommandations (table candidat/offre/vue); abonnement (plan actif, `starts_at`, `ends_at`, statut via API sécurisée). Ces sources ne sont pas attestées pour le dashboard actuel.
- Conseil du jour : guides visibles via `local_guides` (`title`, `description`, `category`, `document_url`); aucune propriété dédiée. Choisir une fiche visible, sans inventer de résumé.

## 7. Questions ouvertes
1. **Abonnement** : attendre une source de plan actif/date fiable (oui/non), ou afficher temporairement le nom du plan uniquement si vérifiable ?
2. **Historique 8 semaines** : accepter un graphique des seules candidatures récentes si plus de 20 entrées, ou exiger un chargement complet ?
3. **Recommandations** : accepter « Découvrir vos recommandations » en phase 1, sans tracking (oui/non) ?
4. **Conseil du jour** : choisir une fiche visible aléatoirement ou afficher la plus récente ?
5. **Accent chaud** : réutiliser le jaune `--secondary` existant (oui/non), plutôt que proposer une nouvelle teinte ?