# Audit des implémentations et flux du Dashboard Candidat

## 1. Conclusion générale

PARTIELLEMENT

L’hypothèse n’est pas vraie dans le sens d’un second dashboard candidat routé et actif. Le projet contient bien un flux principal de dashboard candidat, mais il coexiste avec plusieurs couches de données, hooks et composants alternatifs qui ne sont pas tous branchés sur la même route ni le même arbre de rendu.

En clair :
- Il existe un dashboard candidat principal actif.
- Il existe plusieurs variantes de logique de profil / données candidates dans le code.
- Il n’existe pas de seconde route active de dashboard candidat concurrente dans le router principal.
- Il existe cependant plusieurs implémentations ou versions de hooks/services autour du même domaine, ce qui crée un risque architectural potentiel de coexistence de logiques.

## 2. Implémentations du Dashboard trouvées

| Implémentation | Fichier | Route | Statut | Utilisée ? |
|---|---|---|---|---|
| Dashboard candidat principal | src/pages/candidate/CandidateDashboardPage.tsx | /candidate/dashboard | Flux actif du routeur principal | Oui |
| Layout candidat principal | src/pages/candidate/CandidateLayout.tsx | /candidate/* | Layout actif pour les pages protégées du candidat | Oui |
| Shell candidat / layout UI | src/pages/candidate/CandidateLayout.tsx (CandidateAppShell) | /candidate/* | Composant d’interface du layout | Oui |
| Sidebar candidat principal | src/components/candidate/CandidateSidebar.tsx | /candidate/* | Sidebar actif dans le layout | Oui |
| Provider de sidebar | src/contexts/CandidateSidebarContext.tsx | /candidate/* | Provider de UI pour l’état du sidebar | Oui |
| Route parent candidate | src/App.tsx | /candidate | Route de protection + wrapper layout | Oui |
| Dashboard de profil moderne non routé | src/pages/candidate/CandidateProfilePageModern.tsx | aucune route déclarée | Implémentation alternative, non branchée | Non |
| Composant résumé dashboard | src/features/candidates/components/dashboard/CandidateDashboardSummary.tsx | aucune route déclarée visible | Utilitaire de rendu, non branché au dashboard principal | Non |
| Sidebar candidat du feature profile | src/features/candidates/components/profile/CandidateSidebar.tsx | aucune route déclarée visible | Variante UI, probablement legacy / non utilisée | Non |
| Topbar candidat du feature profile | src/features/candidates/components/profile/CandidateTopbar.tsx | aucune route déclarée visible | Variante UI, probablement legacy / non utilisée | Non |
| Page de profil via feature center | src/pages/candidate/CandidateProfilePage.tsx | /candidate/profile | Page active du profil via feature center | Oui |
| Hook global de profil candidat | src/features/candidates/hooks/useCandidate.ts | utilisé partout sur le flow candidat | Hook principal du profil candidat | Oui |
| Hook de profil candidat (réexport) | src/hooks/useCandidate.ts | hérité par imports du projet | réexport de la logique principale | Oui |

## 3. Routes candidates

| Route | Composant | Layout | Providers |
|---|---|---|---|
| /candidate/login | CandidateLoginPage | aucun layout candidat | AuthProvider + ProtectedRoute non utilisé sur login |  |
| /candidate/signup | CandidateSignupPage | aucun layout candidat | AuthProvider |  |
| /candidate/forgot-password | CandidateForgotPasswordPage | aucun layout candidat | AuthProvider |  |
| /candidate/reset-password | CandidateResetPasswordPage | aucun layout candidat | AuthProvider |  |
| /candidate/confirm | CandidateConfirmPage | aucun layout candidat | AuthProvider |  |
| /candidate | CandidateLayout | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/dashboard | CandidateDashboardPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider + useCandidate() |  |
| /candidate/profile | CandidateProfilePage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/profile/edit | CandidateProfileEditPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/documents | CandidateDocumentsPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/guides | CandidateLocalGuidesPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/experience | redirection vers /candidate/profile?tab=experience | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/education | redirection vers /candidate/profile?tab=education | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/skills | redirection vers /candidate/profile?tab=skills | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/languages | redirection vers /candidate/profile?tab=languages | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/preferences | redirection vers /candidate/profile?tab=preferences | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/applications | CandidateApplicationsPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/applications/:id | CandidateApplicationDetailPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/saved-offers | CandidateSavedOffersPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/notifications | CandidateNotificationsPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/settings | CandidateSettingsPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |
| /candidate/jobs/:slug/apply | CandidateJobApplyPage | CandidateLayout | ProtectedRoute + CandidateSidebarProvider + AuthProvider |  |

### Chemin routé principal

URL
→ /candidate/dashboard
→ Route /candidate dans src/App.tsx
→ CandidateLayout
→ CandidateSidebarProvider (global autour des routes)
→ CandidateDashboardPage
→ hooks principaux : useCandidate, useJobs, useProfileCompletion, useCandidateEducation, useCandidateLanguages, useCandidatePreferences, useCandidateSkills
→ services / sources : getCandidateProfileByUserId, getCandidateExperiences, profileService, getRecommendedJobs, storage localStorage, Supabase

## 4. Flux d'exécution

### Flux 1 — dashboard candidat principal

/candidate/dashboard
→ Layout : src/pages/candidate/CandidateLayout.tsx
→ Provider : CandidateSidebarProvider dans src/App.tsx, AuthProvider racine, ProtectedRoute
→ Page : src/pages/candidate/CandidateDashboardPage.tsx
→ Hooks :
- src/hooks/useCandidate.ts → src/features/candidates/hooks/useCandidate.ts
- src/features/profile/hooks/useCandidateEducation.ts
- src/features/profile/hooks/useCandidateSkills.ts
- src/features/profile/hooks/useCandidateLanguages.ts
- src/features/profile/hooks/useCandidatePreferences.ts
- src/features/profile/hooks/useProfileCompletion.ts (si utilisé par le dashboard)
- src/hooks/useNotifications.ts (sidebar/topbar)
- src/features/jobs/hooks/index ou useJobs
→ Services / sources :
- getCandidateProfileByUserId
- getCandidateExperiences
- profileService.getEducations / getSkills / getLanguages / getPreferences
- getRecommendedJobs
- localStorage `emploiplus-candidate-documents-*`
- Supabase storage / notifications

### Flux 2 — profil candidat actif

/candidate/profile
→ Layout : src/pages/candidate/CandidateLayout.tsx
→ Provider : CandidateSidebarProvider + AuthProvider
→ Page : src/pages/candidate/CandidateProfilePage.tsx
→ Hook : src/features/profile/hooks/useCandidateProfile.ts
→ Dérivés : useCandidateEducation / useCandidateSkills / useCandidateLanguages / useCandidatePreferences / useCandidateDocuments
→ Services : profileService + API `/features/candidates/api/*`

### Flux 3 — implémentation alternative non routée

CandidateProfilePageModern
→ Fichier : src/pages/candidate/CandidateProfilePageModern.tsx
→ Route : aucune route déclarée dans src/App.tsx
→ Layout : aucun
→ Provider : useCandidate() uniquement
→ Hook : useCandidate
→ Services : updateCandidateProfile via useCandidate
→ Statut : non utilisé / probablement version alternative non branchée

## 5. Hooks impliqués

| Hook | Fichier | Fonction | Dashboard concerné |
|---|---|---|---|
| useCandidate | src/features/candidates/hooks/useCandidate.ts | charge le profil candidat lié à l’utilisateur connecté | Dashboard principal + pages candidat |
| useCandidate (réexport) | src/hooks/useCandidate.ts | façade vers le hook principal | Dashboard principal + pages candidat |
| useCandidateProfile | src/features/profile/hooks/useCandidateProfile.ts | charge et met à jour le profil via profileService | Profil candidat |
| useCandidateEducation | src/features/profile/hooks/useCandidateEducation.ts | charge les formations | Profil + dashboard |
| useCandidateEducation | src/features/candidates/hooks/useCandidateEducation.ts | version alternative de même domaine | Profil + dashboard (version alternative) |
| useCandidateSkills | src/features/profile/hooks/useCandidateSkills.ts | charge compétences | Profil + dashboard |
| useCandidateSkills | src/features/candidates/hooks/useCandidateSkills.ts | version alternative de même domaine | Profil + dashboard (version alternative) |
| useCandidateLanguages | src/features/profile/hooks/useCandidateLanguages.ts | charge langues | Profil + dashboard |
| useCandidateLanguages | src/features/candidates/hooks/useCandidateLanguages.ts | version alternative de même domaine | Profil + dashboard (version alternative) |
| useCandidatePreferences | src/features/profile/hooks/useCandidatePreferences.ts | charge préférences | Profil + dashboard |
| useCandidatePreferences | src/features/candidates/hooks/useCandidatePreferences.ts | version alternative de même domaine | Profil + dashboard (version alternative) |
| useCandidateDocuments | src/features/profile/hooks/useCandidateDocuments.ts | charge documents et CV depuis localStorage | Dashboard + documents |
| useCandidateDocuments | src/features/candidates/hooks/useCandidateDocuments.ts | autre implémentation de documents candidat | Dashboard + documents (version alternative) |
| useNotifications | src/hooks/useNotifications.ts | notifications globales du candidat | Sidebar/topbar/dashboard |
| useJobs | src/features/jobs/hooks | jobs publiés / recommandations d’offres | Dashboard principal |
| useProfileCompletion | src/features/profile/hooks/useProfileCompletion.ts | completion du profil | Dashboard principal |

## 6. Providers / Contextes

| Provider | Fichier | Données gérées | Où utilisé |
|---|---|---|---|
| AuthProvider | src/features/authentication/context/AuthContext.tsx | session, auth, rôle, permissions | racine de l’app |
| CandidateSidebarProvider | src/contexts/CandidateSidebarContext.tsx | état `open` du sidebar candidat | enveloppe des routes candidates dans src/App.tsx |
| CandidateContext | aucun | non trouvé | aucun |
| CandidateProvider | aucun | non trouvé | aucun |
| ProtectedRoute / guards | src/features/authentication/guards/* | vérification de permissions / redirection | routes /candidate |

Conclusion explicite : il n’existe pas de `CandidateProvider` or `CandidateContext` identifiable dans le code source du projet. La logique candidat est plutôt portée par un hook `useCandidate()` et par des providers globaux d’authentification / sidebar, sans contexte candidat dédié.

## 7. Services de données

| Service | Fichier | Données | Utilisé par |
|---|---|---|---|
| getCandidateProfileByUserId | src/features/candidates/api/profileApi.ts | profil candidat principal | useCandidate |
| updateCandidateProfile | src/features/candidates/api/profileApi.ts | mise à jour profil | useCandidate / useCandidateProfile |
| profileService | src/features/profile/services/profileService.ts | agrégation des services profil + educations + skills + langues + préférences | hooks `features/profile` |
| getCandidateExperiences | src/features/candidates/api/experiencesApi.ts | expériences du candidat | CandidateDashboardPage |
| getCandidateEducations | src/features/candidates/api/educationApi.ts | formations | hooks de candidature / profile |
| getCandidateSkills | src/features/candidates/api/skillsApi.ts | compétences | hooks de candidature / profile |
| getCandidateLanguages | src/features/candidates/api/languagesApi.ts | langues | hooks de candidature / profile |
| getCandidatePreferences | src/features/candidates/api/preferencesApi.ts | préférences | hooks de candidature / profile |
| getRecommendedJobs | src/services/aiMatchingService.ts | recommandations / matching IA | CandidateDashboardPage |
| fetchNotifications | src/integrations/supabase/notifications.ts | notifications utilisateur | useNotifications |
| localStorage `emploiplus-candidate-documents-*` | logique de dashboard et hooks documents | documents CV et pièces jointes | CandidateDashboardPage + useCandidateDocuments |

## 8. Duplications / anciennes implémentations

### 1) Duplications de hooks sur le même domaine

- src/features/candidates/hooks/useCandidateEducation.ts
- src/features/profile/hooks/useCandidateEducation.ts

Même rôle global : charger des formations d’un candidat. Les fonctions sont quasi identiques, mais elles ne partagent pas le même point d’entrée. La version `profile` passe par `profileService`, la version `candidates` passe directement par `educationApi`.

Status : doublon réel, coexistence de deux logiques sur le même domaine.

- src/features/candidates/hooks/useCandidateSkills.ts
- src/features/profile/hooks/useCandidateSkills.ts
- src/features/candidates/hooks/useCandidateLanguages.ts
- src/features/profile/hooks/useCandidateLanguages.ts
- src/features/candidates/hooks/useCandidatePreferences.ts
- src/features/profile/hooks/useCandidatePreferences.ts

Même constat : double couche de fonctionnalités sur les mêmes entités. L’une semble davantage orientée « feature profile », l’autre « candidats business API ». Elles sont similaires, mais ne sont pas forcément utilisées en même temps sur le même écran.

### 2) Duplications de composants commencés en parallèle

- src/components/candidate/CandidateSidebar.tsx
- src/features/candidates/components/profile/CandidateSidebar.tsx

Le sidebar principal du layout est celui de src/components/candidate. Le second est un composant de feature probablement non utilisé.

Status : variante / probable legacy non utilisée.

- src/components/candidate/CandidateTopbar.tsx
- src/features/candidates/components/profile/CandidateTopbar.tsx

Même logique de topbar candidat avec rôles voisins. Le composant `src/components/candidate` est celui qui est utilisé dans `CandidateLayout`.

Status : variante non utilisée ou legacy.

### 3) Page profil alternative non routée

- src/pages/candidate/CandidateProfilePageModern.tsx

Aucune import dans `src/App.tsx`. Aucun route déclarée pour celle-ci. Elle est donc non utilisée dans le routeur principal.

Status : non utilisée / version alternative / probable legacy.

### 4) DashboardSummary non branche

- src/features/candidates/components/dashboard/CandidateDashboardSummary.tsx

Le composant existe mais aucun usage visible dans le code du routeur. Il ne semble pas monté dans le dashboard actif.

Status : non utilisé.

### 5) Fichiers de type “réexport” / wrappers

- src/hooks/useCandidate.ts
- src/features/candidates/hooks/useCandidate.ts

Ce n’est pas deux implémentations distinctes du dashboard ; c’est plutôt un wrapper de façade. Le code principal est dans `features/candidates/hooks/useCandidate.ts`, et `src/hooks/useCandidate.ts` réexporte simplement celui-ci.

Status : façade, pas une vraie variante fonctionnelle.

## 9. Flux pouvant fonctionner simultanément

### Réponse : OUI, mais à des niveaux différents

Il existe plusieurs flux qui peuvent être actifs en même temps dans l’application entière :

1. AuthContext + useCandidate + CandidateDashboardPage
   - Ce trio est le flux principal actif sur /candidate/dashboard.
   - C’est une coexistence autorisée et attendue : authentification + chargement du profil + rendu du dashboard.

2. CandidateSidebarProvider + CandidateLayout + CandidateDashboardPage
   - Le provider du sidebar et le layout du candidat coexistent de manière normale.
   - Ce n’est pas une duplication du dashboard ; c’est une structure UI partagée.

3. Multiple hook families sur le même domaine
   - `useCandidate` + `useCandidateProfile`
   - `useCandidateEducation` (feature profile) + `useCandidateEducation` (feature candidates)
   - `useCandidateSkills` / `useCandidateLanguages` / `useCandidatePreferences` en versions doublées

Ces dernières peuvent coexister dans l’arborescence logique si des pages différentes les importent, mais cela ne signifie pas qu’il existe deux dashboards routés au même moment.

### Réponse plus précise

- Deux dashboards actifs sur des routes distinctes : NON.
- Deux logiques de données parallèles sur les mêmes données candidates : OUI, mais sous forme de redondance de code / couche de compatibilité.
- Deux layouts routés distincts : NON, un seul layout principal est actif.
- Deux providers de données candidat : NON, aucun `CandidateProvider` / `CandidateContext` n’a été trouvé.

## 10. Impact architectural potentiel

Le risque architectural potentiel existe principalement à cause de la coexistence de plusieurs couches d’accès aux mêmes données, sans qu’il y ait de route distincte qui les sépare clairement.

Impact potentiel réel :
- plusieurs hooks chargent des ensembles de données proches (profil, compétences, langues, préférences, formations);
- plusieurs versions d’API / service de même domaine sont présentes dans le code;
- plusieurs composants alternatifs existent sans être branchés au routeur principal;
- il existe un double système de données candidat (`features/candidates` et `features/profile`), ce qui peut provoquer des divergences de source de vérité si les développeurs mélangent les imports.

Ce potentiel n’est pas la preuve d’un second dashboard actif, mais il est bien un risque de duplication fonctionnelle et de maintenance.

## 11. Conclusion finale

Existe-t-il plusieurs implémentations / flux du dashboard candidat ?

PARTIELLEMENT.

Réponse définitive :
- Oui, il existe plusieurs couches logiques et plusieurs variantes autour du domaine candidat.
- Non, il n’existe pas de second dashboard candidat routé et actif dans le routeur principal.
- Le flux principal est unique : /candidate/dashboard → CandidateLayout → CandidateSidebarProvider → CandidateDashboardPage → useCandidate + hooks profils + services de données.
- Les autres éléments présents (hooks duplicatifs, variantes de profil, sidebar et topbar alternatifs, page `CandidateProfilePageModern`) sont des implémentations de secours, de feature, ou des versions non utilisées, et non des dashboards concurrents réellement montés.

## 12. Modifications effectuées

Aucune modification du code source.
