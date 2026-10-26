# Analyse du compte candidat

## 1. Stack et conventions
- React 19.2.0; react-router-dom 6.18.0; Vite 8; TypeScript 5.8.
- UI/CSS: Tailwind CSS v4 + classes utilitaires; tokens globaux dans `src/styles.css`.
- État: React Context + hooks personnalisés (`AuthContext`, `CandidateSidebarContext`, `EcoModeContext`); pas de Redux/Zustand/React Query visible.
- Client HTTP: `@supabase/supabase-js` + services internes / modules `src/features/**`.
- Backend/BDD: Supabase + API REST métier; données de candidat dans `src/features/candidates/api` et `src/services`.
- Authentification: `useAuthContext`, `ProtectedRoute`, permissions `dashboard.candidate`; rôle candidat géré côté route et guards.
- Police: `@fontsource/inter`; palette via variables CSS (`--brand`, `--primary`, `--secondary`, `--background`, `--foreground`).
- Icônes actuelles: Phosphor majoritaire; variantes de composants UI présentes; imports hérités dans `CandidateSidebar.tsx` et pages.

## 2. Architecture de l’espace candidat
- Fichiers clés: `src/App.tsx`, `src/pages/candidate/CandidateLayout.tsx`, `src/components/candidate/CandidateSidebar.tsx`, `src/components/candidate/CandidateTopbar.tsx`, `src/components/candidate/CandidateMobileHeader.tsx`, `src/components/candidate/ProtectedCandidateRoute.tsx`, `src/hooks/useCandidate.ts`.
- Sous-dossiers: `src/pages/candidate/*`, `src/features/candidates/*`, `src/features/profile/*`, `src/features/maelise/*`, `src/components/candidate/*`, `src/components/ui/*`.

| Route | Page/composant | Fichier | Rôle |
|---|---|---|---|
| `/candidate` | redirection | `src/App.tsx` | `Navigate` vers `/candidate/dashboard` |
| `/candidate/dashboard` | `CandidateDashboardPage` | `src/pages/candidate/CandidateDashboardPage.tsx` | tableau de bord principal |
| `/candidate/profile` | `CandidateProfilePage` | `src/pages/candidate/CandidateProfilePage.tsx` | profil complet |
| `/candidate/profile/edit` | `CandidateProfileEditPage` | `src/pages/candidate/CandidateProfileEditPage.tsx` | édition profil |
| `/candidate/create-cv` | `CandidateCreateCVPage` | `src/pages/candidate/CandidateCreateCVPage.tsx` | générateur / éditeur CV |
| `/candidate/documents` | `CandidateDocumentsPage` | `src/pages/candidate/CandidateDocumentsPage.tsx` | documents et pièces |
| `/candidate/guides` | `CandidateLocalGuidesPage` | `src/pages/candidate/CandidateLocalGuidesPage.tsx` | fiches conseils |
| `/candidate/applications` | `CandidateApplicationsPage` | `src/pages/candidate/CandidateApplicationsPage.tsx` | candidatures |
| `/candidate/saved-jobs` | `CandidateSavedOffersPage` | `src/pages/candidate/CandidateSavedOffersPage.tsx` | offres enregistrées |
| `/candidate/notifications` | `CandidateNotificationsPage` | `src/pages/candidate/CandidateNotificationsPage.tsx` | centre de notifications |
| `/candidate/subscription` | `CandidateSubscriptionPage` | `src/pages/candidate/CandidateSubscriptionPage.tsx` | plans et abonnements |
| `/candidate/account` | `CandidateSettingsPage` | `src/pages/candidate/CandidateSettingsPage.tsx` | compte et paramètres |
| `/candidate/jobs/:slug/apply` | `CandidateJobApplyPage` | `src/pages/candidate/CandidateJobApplyPage.tsx` | candidature au poste |

- Protection des routes: `ProtectedCandidateRoute` vérifie `authLoading`, `loading`, et `profile`; puis `ProtectedRoute` exige `dashboard.candidate`.
- Redirections: `creation`, `experience`, `education`, `skills`, `languages`, `preferences`, `settings`, `saved-offers` vers les routes courantes.

## 3. Tableau de bord actuel
| Bloc | Fichier/composant | Données | Source | Interactions | État |
|---|---|---|---|---|---|
| Bannière bienvenue | `CandidateDashboardPage` | prénom, nom, % complétude | `useCandidateProfileData`, `useProfileCompletion` | none | loading/skeleton |
| Jauge complétude | `CandidateDashboardPage` + SVG | score, items manquants | `useProfileCompletion` | clic sur item manquant via route | géré |
| Actions rapides | `quickActions` | 3 actions | tableau statique | navigation `Link` | statique |
| Offres recommandées | `CandidateDashboardPage` + `JobCard` | offres, score, deadline, tags | `getRecommendedJobsWithStatus`, `aiMatchingService` | pagination, apply | loading/vide/erreur |
| Fiches/sections diverses | `SaasCard`, `SaasGrid` | widgets thématiques | données locales/hook | navigation | hétérogène |
| Alertes | `createUniqueNotification` | profil incomplet, CV ancien, alertes emploi | effets côté client | notification unique | géré par ref |

- Score calculé via `useProfileCompletion` sur `profile`, `experiences`, `educations`, `skills`, `languages`, `preferences`; formule exacte: Non trouvé sous une constante unique; le code synthétise une completion basée sur les sections complétées.

## 4. Données et fonctionnalités disponibles
- Profil candidat: `first_name`, `last_name`, `email`, `headline`, `bio`, `location_city`, `location_country`, formation, compétences, langues, préférences, CV.
- Documents: CV, pièces justificatives, lettres; `hasCandidateCv`, `hasAnalyzableCandidateCv`, `cv_text`, `embedding_vector`, `cv_last_updated_at`.
- Candidatures: statuts dispersés, sans enum central unique visible; logique côté services / page détail / UI.
- Offres enregistrées: `savedOffersApi`, candidats sauvegardés, liens de détail, données de jobs.
- Notifications: type, contenu, lecture, date, redirection; `createUniqueNotification`.
- Abonnement: plans free/premium/premium-plus, dates, limites, accès; `CandidateSubscriptionPage` et routes associées.
- Fonctionnalités actives: IA recommendation engine, analyse CV, assistant Maelise (`src/features/maelise`), création CV, alertes métier, guides, onboarding.
- Données utiles pour futur dashboard: candidatures par statut, entretiens à venir, dates limites proches, offres expirant bientôt, progression du CV, historique IA, consommation abonnement.

## 5. Diagnostic UX/UI du tableau de bord
- Points faibles: hiérarchie visuelle dispersée; blocs marketing/produit mélangés; cartes d’actions trop génériques; trop peu d’éléments réellement personnalisés; manque de priorisation “à faire” vs “à suivre”.
- À supprimer/fusionner: actions rapides trop standardisées; sections redondantes sans valeur décisionnelle; blocs décoratifs non orientés résultat; doublons éventuels profil / compte / paramètres.
- À ajouter: progression claire du profil, éléments urgents (recommandations, entretiens, relances), alertes contextuelles, rappels de date limite, “CV à compléter”, “Candidatures à relancer”, “Offres enregistrées récemment”.
- Sources possibles: `useCandidateProfileData`, `useProfileCompletion`, `savedOffersApi`, notifications, `getRecommendedJobsWithStatus`, `JobCard`.
- Nouvelles données requises: historique interviews, scores IA historiques, relances automatiques, délais de réponse, statut d’abonnement réel, “dernier contact candidat”.

## 6. Contraintes techniques pour la refonte
- Composants réutilisables existants: `Button`, `Card`, `Badge`, `Skeleton`, `Modal`, `Tooltip`, `ThemeSwitch`, `PaginationNav`, `SaasCard`, `JobCard`.
- Bibliothèques utiles: `recharts`, `framer-motion`, `date-fns`; `@phosphor-icons/react` déjà présente.
- Risques: `src/App.tsx`, `src/pages/candidate/CandidateLayout.tsx`, `src/components/candidate/CandidateSidebar.tsx`, `src/styles.css`, `src/features/authentication/guards` et routes `/candidate/*`.
- Conventions: Tailwind utilities, route names, hooks `useCandidate*`, noms de fichiers / composants explicites, tokens partagés entre espaces public/candidat/admin.
- Non trouvé: score exact de complétion sous fonction unique; enum centralisé des statuts de candidatures; logique d’IA détaillée hors services spécifiques.
