# AUDIT ARCHITECTURAL GLOBAL - PHASE 3

Date : 2026-08-12
Type : Audit uniquement, sans modification de code
Statut : Analyse de l’architecture existante et plan de refactorisation

---

## 1. RÉSUMÉ EXÉCUTIF

Le projet présente une base solide avec une séparation partielle claire entre :

- authentication / guards / routing
- features métier (candidates, jobs, profile, seo, faq, local-guides)
- composants UI réutilisables
- pages route-level

En revanche, plusieurs zones montrent un décalage important entre l’intention architecturale et la réalité de l’exécution. L’application est surtout structurée comme une application “monolithique modulaire” avec beaucoup de logique métier embarquée dans les pages.

Les points les plus importants sont :

- certaines pages sont de véritables “god pages” qui mélange UI + données + validation + mutations + notifications + navigation
- plusieurs modules sont trop longs et portent plusieurs responsabilités fonctionnelles
- quelques hooks combinent fetch, mutation, traitement local et logique métier
- un grand nombre d’appels Supabase sont faits directement dans les composants/pages plutôt que dans des services ou API-repositories
- l’existence de plusieurs features et sous-features montre une bonne intention, mais la cohérence entre ces couches reste inégale

L’architecture générale n’est pas catastrophique, mais elle n’est pas encore professionnelle à grande échelle. Le principal problème n’est pas un manque de structure, mais un manque de cohérence de responsabilité.

### Verdict global

- Structure fonctionnelle : bonne intention, évolutive
- Cohérence des responsabilités : moyenne à faible dans plusieurs zones
- Propreté d’architecture : acceptable sur les modules récents, fragile sur les pages historiques
- Risque de maintenance : élevé sur certaines pages et hooks très longs
- Priorité de refactorisation : forte sur pages + hooks + services qui font du CRUD complet

---

## 2. ARCHITECTURE ACTUELLE

### 2.1 Vue d’ensemble

Le projet contient 312 fichiers TypeScript/TSX dans src/.

Vérification effectuée :

- 312 fichiers TS/TSX dans src/
- 32 fichiers > 300 lignes
- 12 fichiers > 500 lignes
- 2 fichiers > 800 lignes

Les principaux foyers architecturaux sont :

- src/App.tsx : orchestration du routing global et des layout publics/candidats/admin
- src/pages/** : pages route-level (public, candidate, admin)
- src/features/** : domaines métier sectionnés par fonctionnalité
- src/components/** : composants UI + composant layout + composants de page réutilisables
- src/hooks/** : hooks transverses / page-level
- src/services/** : services métier et intégration externe
- src/integrations/supabase/** : client Supabase et utilitaires d’intégration
- src/lib/** : utilitaires techniques / morceaux de logique transverses
- src/types/**, src/constants/**, src/data/** : contrats et constantes

### 2.2 Architecture réelle observée

Le projet combine plusieurs styles :

1. Feature-based modularisation dans src/features/
2. Legacy route-based monolithic pages dans src/pages/
3. UI atomic components dans src/components/ui/
4. Domain logic split across services/hooks/APIs
5. Mixed technical debt from “page as controller” model

Le résultat est une architecture hybride, fonctionnelle mais hétérogène.

### 2.3 Ce qui est bien fait

- présence d’une vraie structure feature-based sur auth, jobs, profile, candidates
- séparation entre auth context et candidate profile (Phase 1) : excellente
- notion de guards et protected routes : nette et bonne
- sous-dossiers par domaine : authentication, jobs, profile, candidates, faq, local-guides
- composants UI génériques bien séparés dans src/components/ui/
- certains modules récents sont très propres (ex. auth, jobs feature, profile feature)

### 2.4 Ce qui est fragile

- les pages admin et candidate restent souvent responsables de beaucoup de logique
- plusieurs fichiers participent à la fois au CRUD complet, à la UI, au SEO, à la validation et aux notifications
- on trouve des services et hooks qui peuvent être repliés sur des tâches de présentation
- le code est parfois “écrit pour marcher” plutôt que “écrit pour être maintenu par plusieurs développeurs”

---

## 3. CARTOGRAPHIE COMPLÈTE

### 3.1 Pages

#### src/pages/public/

Responsabilité actuelle : pages publiques de marketing et de contenu editorial.

Fichiers clés :
- HomePage.tsx
- ServicesPage.tsx
- JobsPage.tsx
- JobOfferDetailPage.tsx
- BlogPage.tsx
- BlogPostDetailPage.tsx
- ContactPage.tsx
- FAQPage.tsx
- LegalDocumentsPage.tsx
- PrivacyPolicyPage.tsx
- CguPage.tsx
- AboutPage.tsx
- AuthPage.tsx
- UtilityPages.tsx

Responsabilités détectées :
- affichage marketing
- récupération de contenu/annonces
- SEO page-level
- navigation
- formulaires publics (contact / auth)
- logique data extraction / analyse IA sur la page d’offre

Dépendances :
- services/jobs/hooks
- features/seo
- i18n
- supabase / API
- components/site

Problèmes :
- JobOfferDetailPage.tsx est un exemple typique de page qui contient UI + données + SEO + IA + action utilisateur + navigation
- certaines pages public injectent de la logique métier directement dans le composant

#### src/pages/candidate/

Responsabilité actuelle : espace candidat complet.

Fichiers clés :
- CandidateDashboardPage.tsx
- CandidateProfilePage.tsx
- CandidateDocumentsPage.tsx
- CandidateApplicationsPage.tsx
- CandidateJobApplyPage.tsx
- CandidateProfileEditPage.tsx
- CandidateSettingsPage.tsx
- CandidateNotificationsPage.tsx
- CandidateLocalGuidesPage.tsx
- etc.

Responsabilités détectées :
- présentation dashboard
- chargement du profil candidat
- gestion documents
- gestion candidatures
- gestion offres sauvegardées
- règles métier de candidature
- UI plus ou moins avancée

Dépendances :
- hooks/useCandidate
- features/candidates hooks + API
- services/groqAnalysisService
- services/storageService
- features/profile
- auth guards

Problèmes :
- CandidateDashboardPage.tsx mélange dashboard UI, recommandations IA, documents, expériences, vérification de profil, navigation, données multiples
- CandidateJobApplyPage.tsx est l’un des plus gros god files du projet
- plusieurs pages ne sont que des “wrappers” sur des features plus complexes

#### src/pages/admin/

Responsabilité actuelle : interface admin / CMS / dashboard d’administration.

Fichiers clés :
- AdminPage.tsx
- AdminHomePage.tsx
- AdminJobsPage.tsx
- AdminBlogPage.tsx
- AdminTeamPage.tsx
- AdminCandidatesPage.tsx
- AdminNotificationsPage.tsx
- AdminSEOPage.tsx
- AdminLegalDocumentsPage.tsx
- AdminPrivacyPolicyPage.tsx
- AdminCguPage.tsx
- AdminLocalGuidesPage.tsx
- AdminFAQPage.tsx
- AdminJobCreatePage.tsx

Responsabilités détectées :
- CRUD sur jobs, blog, contenu, team, notifications, SEO, documents, guides
- dashboard de KPI
- gestion permissions/admin
- upload media / fichiers
- UI / navigation / actions

Dépendances :
- Supabase client
- composants/admin
- services de storage
- i18n
- features/seo

Problèmes :
- plusieurs pages admin sont des “page-CRUD” complètes, très longues et multi-réponses
- la logique CRUD est encore collée à l’interface dans plusieurs pages

### 3.2 Components

#### src/components/ui/
Responsabilité actuelle : composants graphiques génériques et réutilisables.

Constitution :
- button, card, form, dialog, sidebar, tab, table, select, input, etc.

Responsabilité principale :
- UI pure réutilisable

Problèmes :
- globalement acceptable
- un petit nombre de composants UI peuvent être lourds, mais ils restent majoritairement cohérents

#### src/components/site/
Responsabilité actuelle : UI publique du site.

Modules :
- Header, Footer, PublicLayout, JobCard, ShareButtons, CookieConsentBanner

Responsabilités détectées :
- navigation public
- blocs de contenu
- partage
- consentement cookie

Problèmes :
- certains composants peuvent connaître trop de contexte business / SEO / intégration de contenu
- but globalement cohérent

#### src/components/admin/
Responsabilité actuelle : menu, navigation, topbar admin.

Problèmes :
- plutôt correct
- logique un peu intriquée mais pas encore un “god component”

#### src/components/candidate/
Responsabilité actuelle : UI candidate, layout, sidebar, notifications, cards.

Problèmes :
- certains composants d’interface ont tendance à absorber du contexte de dashboard ou à “gérer l’état” au lieu d’être purement visuels

### 3.3 Layouts

- src/pages/candidate/CandidateLayout.tsx : layout candidat
- src/components/site/PublicLayout.tsx : layout public
- src/pages/admin/AdminPage.tsx : layout admin + sidebar + navigation globale
- src/components/candidate/SaasLayout.tsx : composant layout candidate mais orienté card-based

Observation :
- le concept de layout existe bien, mais plusieurs pages admin/candidate utilisent en plus un niveau de logique métier “route/controller” dans le layout / shell

### 3.4 Hooks

#### src/hooks/
- useCandidate.ts
- useJobs.ts
- useNotifications.ts
- usePublishedOffers.ts
- use-mobile.tsx
- useEcoMode.tsx
- pages.ts

Responsabilité :
- hooks transverses et d’intégration

Problèmes :
- certains hooks combinent fetch, mutation, et logique UI
- useCandidate.ts est ancien et très proche d’un hook “multi-domaines” par son rôle

#### src/features/<domain>/hooks/
- beaucoup de hooks spécialisés par domaine

Exemples :
- useCandidateProfile.ts
- useCandidateDocuments.ts
- useCandidateApplications.ts
- useCandidateEducation.ts
- useCandidateSkills.ts
- useCandidateLanguages.ts
- useCandidatePreferences.ts

Qualité :
- meilleure séparation, plus cohérente, plus orientée feature
- le niveau de cohésion est nettement meilleur que celui des pages legacy

### 3.5 Contexts

- src/features/authentication/context/AuthContext.tsx
- src/contexts/EcoModeContext.tsx
- src/contexts/CandidateSidebarContext.tsx

Responsabilité :
- état global transversal

Observation :
- le contexte auth est propre et important
- d’autres contextes sont plus limités, avec peu de logique

### 3.6 Services

- src/services/aiMatchingService.ts
- src/services/groqAnalysisService.ts
- src/services/storageService.ts
- src/services/jobService.ts
- src/services/matchScoreUtils.ts
- src/features/local-guides/localGuideService.ts
- src/features/faq/api/faqService.ts
- src/features/jobs/api/jobsApi.ts
- src/features/candidates/api/*.ts

Responsabilité :
- couche d’intégration / logique métier / façade vers Supabase

Problèmes :
- certains services sont cross-domain, surtout aiMatchingService / groqAnalysisService
- la structure de service reste hétérogène entre “service métier” et “API wrappers”

### 3.7 API / repositories

- src/features/authentication/api/
- src/features/candidates/api/
- src/features/jobs/api/
- src/features/faq/api/
- src/api/

Observations :
- il existe déjà une bonne base de séparation API-level
- mais plusieurs components/pages bypassent cette séparation et appellent directement Supabase ou fetch

### 3.8 Lib

- src/lib/**

Responsabilité :
- fonctions utilitaires non-business, manipulations techniques, date, geo, storage-related helper, etc.

Problèmes :
- certaines fonctions pointent vers une logique de domaine voire de feature (ex. candidate-documents helper)
- la frontière lib vs service est parfois floue

### 3.9 Utils / types / constants / data

- src/utils/** : petites fonctions utilitaires, formatters
- src/types/** : types
- src/constants/** : configurations
- src/data/** : données statiques

Observation :
- assez correctement séparés
- l’architecture cible devrait garder cette zone pure, sans logique métier lourde

### 3.10 Features

Dossiers principaux :
- authentication/
- candidates/
- jobs/
- profile/
- faq/
- seo/
- local-guides/
- forms/

Observation :
- le concept feature-based est présent et contribue fortement à la qualité du code
- il convient surtout pour les domaines métier qui ont déjà été refactorés
- les modules legacy restent néanmoins encore en dehors de cette logique

### 3.11 Routing

Le routing est centralisé dans src/App.tsx.

Atouts :
- route tree complet
- distinctions claire public / candidat / admin
- guards en place

Risques :
- App.tsx est 675 lignes, ce qui est trop long pour un point d’entrée de routing
- il mélange route declarations, lazy imports, shell logic, redirections dynamiques, mobile rules, session validation
- le routage global devient un “god orchestrator”

### 3.12 Providers / stores éventuels

- src/contexts/**
- AuthProvider dans AuthContext
- CandidateSidebarProvider
- EcoModeContext

Pas de store global de type Zustand/Redux observé dans les structures visibles.

Le projet est essentiellement prop-driven + context + hooks, ce qui est cohérent avec sa taille, mais cela alourdit parfois l’orchestration dans les pages.

---

## 4. GOD FILES

### 4.1 Fichiers > 500 lignes

Les fichiers suivants sont les plus problématiques pour l’architecture :

1. src/pages/candidate/CandidateJobApplyPage.tsx — 1307 lignes
2. src/integrations/supabase/types.ts — 914 lignes
3. src/pages/admin/AdminJobsPage.tsx — 788 lignes
4. src/components/ui/sidebar.tsx — 745 lignes
5. src/pages/public/JobOfferDetailPage.tsx — 678 lignes
6. src/App.tsx — 675 lignes
7. src/pages/admin/AdminBlogPage.tsx — 640 lignes
8. src/pages/candidate/CandidateDashboardPage.tsx — 605 lignes
9. src/pages/admin/AdminNotificationsPage.tsx — 600 lignes
10. src/pages/admin/AdminTeamPage.tsx — 570 lignes
11. src/pages/candidate/CandidateCVPage.tsx — 556 lignes
12. src/pages/public/JobsPage.tsx — > 500 selon certains usages, même si non top 12 exact

### 4.2 Classement par gravité

#### 🔴 CRITIQUE

##### FILE : src/pages/candidate/CandidateJobApplyPage.tsx
RESPONSABILITÉ ACTUELLE :
- page de candidature pour une offre
- chargement des données job + profil
- validation du formulaire
- gestion des documents à joindre
- logique de soumission d’application
- notifications / erreurs / états UI
- navigation / redirections

RESPONSABILITÉS MULTIPLES :
- demande de données offres
- récupération profile candidat
- gestion documents uploads
- validation formulaire
- soumission application
- affichage status / erreurs / messages
- gestion UI de l’interface complète

POURQUOI C’EST UN PROBLÈME :
- Ce fichier est un monolithe fonctionnel complet
- il combine “page”, “service”, “form logic”, “validation”, “API calls” et “UI layout”
- toute modification demande de comprendre le composant entier
- le cycle de test est lourd et fragile

PROPOSITION DE DÉCOUPAGE :
- CandidateJobApplyPage.tsx → composition de page
- useCandidateJobApplication.ts → état et orchestration
- candidateApplicationService.ts → logique de soumission / validations
- CandidateApplicationForm.tsx → formulaire
- CandidateApplicationSummary.tsx → résumé offre + profil
- document upload logic séparée en hook/service

##### FILE : src/pages/admin/AdminJobsPage.tsx
RESPONSABILITÉ ACTUELLE :
- CRUD des offres d’emploi
- upload image
- états du formulaire
- validation
- sauvegarde / édition / suppression
- chargement des offres
- notifications UI

RESPONSABILITÉS MULTIPLES :
- administration des jobs
- upload image / storage
- CRUD complet
- transformation payloads
- liste + formulaire

POURQUOI C’EST UN PROBLÈME :
- page souvent utilisée comme composant “admin controller” au lieu d’un simple conteneur
- logique métier et UI fortement imbriquées

PROPOSITION DE DÉCOUPAGE :
- AdminJobsPage.tsx → landing page + composition
- useAdminJobs.ts → chargement et orchestration
- adminJobsService.ts → CRUD des offres
- JobForm.tsx → formulaire d’édition/creation
- JobTableList.tsx → affichage list et actions

##### FILE : src/pages/admin/AdminBlogPage.tsx
RESPONSABILITÉ ACTUELLE :
- CRUD des articles blog
- upload image
- gestion de status / publication
- formulaire CMS
- ordering / featured

RESPONSABILITÉS MULTIPLES :
- gestion CMS
- stockage médias
- logique d’édition / publication
- UI et actions

POURQUOI C’EST UN PROBLÈME :
- même issue que les jobs pages: c’est un mini CMS complet dans une seule page

PROPOSITION DE DÉCOUPAGE :
- AdminBlogPage.tsx → composition
- useAdminBlogPosts.ts
- blogAdminService.ts
- BlogPostForm.tsx
- BlogPostsTable.tsx

##### FILE : src/App.tsx
RESPONSABILITÉ ACTUELLE :
- orchestration globale du routing
- lazy loading de routes
- configuration des layouts
- detection mobile
- validation de session restaurée
- déclaration complète des routes public/candidate/admin

RESPONSABILITÉS MULTIPLES :
- routing
- composition de layout
- critères de navigation mobile
- logique d’application startup
- route declarations massives

POURQUOI C’EST UN PROBLÈME :
- le routeur devient un “god orchestrator”
- un fichier trop volumineux pour un simple routing
- difficile de maintenir les branches public/candidate/admin

PROPOSITION DE DÉCOUPAGE :
- App.tsx → uniquement setup 
- app/routes/publicRoutes.tsx
- app/routes/candidateRoutes.tsx
- app/routes/adminRoutes.tsx
- app/config/mobileRules.ts
- app/layouts/PublicShell.tsx / CandidateShell.tsx / AdminShell.tsx

#### 🟠 IMPORTANT

##### FILE : src/pages/candidate/CandidateDashboardPage.tsx
RESPONSABILITÉ ACTUELLE :
- tableau de bord candidat
- chargement des offres
- calcul de complétude
- chargement d’expériences & compétences
- recommandations IA
- traitement des documents CV
- localStorage sync
- UI d’accueil + actions rapides

RESPONSABILITÉS MULTIPLES :
- dashboard UI
- récupération offres
- recommandations personnalisées
- état complet du profil
- logique document local / event listener
- logique d’IA

POURQUOI C’EST UN PROBLÈME :
- très long, très dense, beaucoup d’effets de bord
- mélange dashboard et moteur de recommandation

PROPOSITION DE DÉCOUPAGE :
- CandidateDashboardPage.tsx → composition
- useCandidateDashboard.ts
- useRecommendedJobs.ts
- DashboardSummaryCard.tsx
- DashboardOffersSection.tsx
- DashboardProfileCompletion.tsx

##### FILE : src/pages/public/JobOfferDetailPage.tsx
RESPONSABILITÉ ACTUELLE :
- page détail d’offre
- chargement de l’offre
- analyse IA candidature
- SEO structured data
- action apply / navigation
- affichage de détails

RESPONSABILITÉS MULTIPLES :
- page public
- données offre
- fonctionnalité IA d’analyse
- action candidature

POURQUOI C’EST UN PROBLÈME :
- centralise la donnée + l’analyse IA + l’action d’application + l’affichage

PROPOSITION DE DÉCOUPAGE :
- JobOfferDetailPage.tsx → composition
- useJobOfferDetail.ts
- JobOfferOverview.tsx
- JobApplicationCTA.tsx
- jobOfferAnalysisService.ts

##### FILE : src/pages/admin/AdminNotificationsPage.tsx
RESPONSABILITÉ ACTUELLE :
- gestion notifications système
- liste des utilisateurs
- envoi / mise à jour / suppression
- préparation payloads

RESPONSABILITÉS MULTIPLES :
- notifications admin
- communication multi-utilisateurs
- CRUD admin

PROPOSITION :
- AdminNotificationsPage.tsx → composition de page
- useAdminNotifications.ts
- notificationService.ts
- NotificationForm.tsx

##### FILE : src/pages/admin/AdminTeamPage.tsx
RESPONSABILITÉ ACTUELLE :
- gestion d’équipes / rôles / admins
- création / édition / suppression d’utilisateurs
- gestion rôle status
- UI admin

Problème :
- logique de gestion des comptes et rôles fortement confondue avec la page

##### FILE : src/pages/candidate/CandidateCVPage.tsx
RESPONSABILITÉ ACTUELLE :
- gestion CV complet
- upload
- listes documents
- liens signés etc.

Problème :
- ressemble davantage à un centre de gestion de documents qu’à une simple page

#### 🟡 À AMÉLIORER

- src/features/profile/components/sections/DocumentsSection.tsx
- src/features/profile/components/CandidateProfileCenter.tsx
- src/pages/admin/AdminPage.tsx
- src/features/candidates/hooks/useCandidate.ts
- src/hooks/useNotifications.ts
- src/services/groqAnalysisService.ts
- src/services/aiMatchingService.ts
- src/pages/public/JobsPage.tsx
- src/pages/candidate/CandidateProfilePageModern.tsx

### 4.3 Fichiers “génériques devenus god files”

Le constat est clair :

- les pages “route-level” sont parfois plus grosses que certaines features
- les plus gros fichiers sont entièrement orientés business et state management
- plusieurs modules ancestraux n’ont pas été découpés selon l’architecture feature-based

---

## 5. AUDIT DES PAGES COMPLEXES

### Home
Responsabilité actuelle :
- page marketing / landing / conversions
- contenu principal
- appels de données limités, si présents

État :
- globalement acceptable
- pas un god file visible

### Services
Responsabilité actuelle :
- pages structurées de services / solutions

État :
- plutôt cohérent, même si plusieurs sous-pages de contenu peuvent devenir lourdes avec du contenu + composants + données statiques

### Jobs
Responsabilité actuelle :
- listage des offres
- filtres
- recherche
- navigation

État :
- acceptable si la logique est concentrée dans un hook/service propre
- le vrai risque est la présence de logique de recherche / pagination / affichage dans des pages encore assez lourdes

### Job details
Responsabilité actuelle :
- affichage de l’offre + SEO + CTA + IA

État :
- trop de responsabilités dans une seule page

### Blog
Responsabilité actuelle :
- liste + détail + article

État :
- acceptable pour la lecture publique
- admin blog est nettement plus problématique que le blog public

### Contact
Responsabilité actuelle :
- formulaire de contact

État :
- généralement acceptable
- il faut néanmoins vérifier s’il appelle directement l’API et gère l’état local de manière trop dense

### Candidate Dashboard
Responsabilité actuelle :
- dashboard très riche et multi-responsable

État :
- clairement un “composite page”, mais trop chargé

### Candidate Profile
Responsabilité actuelle :
- assez bien séparé sous src/features/profile/

État :
- architecture plus saine que les autres pages candidate
- profile feature semble être le meilleur exemple de modularisation déjà en place

### Candidate Documents
Responsabilité actuelle :
- checklist de documents + upload + signed URLs + traitements

État :
- certains composants du module sont fortement multi-responsables

### Candidate Applications
Responsabilité actuelle :
- historique + détail des candidatures

État :
- probablement plus propre que les pages de dashboard / apply, mais à vérifier précisément selon les fichiers concernés

### Admin Dashboard
Responsabilité actuelle :
- KPI + stats + utilisateurs + ratio d’activité

État :
- globalement cohérent pour un dashboard, mais il reste assez “page-controller”

### Admin Jobs / Admin Candidates / Admin Blog
Responsabilité actuelle :
- CRUD complet et CMS/dashboards

État :
- fortes chances de devoir être refactorisés

### Conclusion sur les pages

Le vrai problème de l’architecture actuelle n’est pas qu’une page existe, mais qu’un certain nombre de pages sont de facto des mini-applications complètes. Elles doivent devenir des compositions de composants et hooks, pas des modules métier complets.

---

## 6. AUDIT DES HOOKS COMPLEXES

### Hook critique : src/hooks/useCandidate.ts
Responsabilité :
- chargement du profil candidat
- logout candidate
- updateProfile
- refetch
- logique auth context

Dépendances :
- auth context
- API profile
- navigation react-router

Effets secondaires :
- fetch profile
- logout mutation
- setState local

Problème :
- il mélange plusieurs responsabilités : chargement profil, autorisation, mutation profile, logout

Suggestion :
- découper en useCandidateProfile + useCandidateSessionActions / useCandidateAuthActions si la feature devient plus large

### Hook critique : src/features/candidates/hooks/useCandidate.ts
Responsabilité :
- chargement du profil candidate selon la feature 
- logique métier de profil candidat

Observation :
- plus cohérent que src/hooks/useCandidate.ts
- cependant, le nom “useCandidate” est chargé et peut devenir un point de friction si le module s’agrandit

### Hook critique : src/features/jobs/hooks/useJobs.ts
Responsabilité :
- chargement des offres selon filtres
- délégation vers jobService

État :
- fonctionnel, mais encore un peu trop “controller” si plusieurs types de listes et filtres s’ajoutent

### Hook critique : src/hooks/useNotifications.ts
Responsabilité :
- chargement notifications du candidat / utilisateur
- état local + fetch

Problème :
- hook avec logique notifs + auth + state

### Hook acceptable / cohérent :
- src/features/profile/hooks/useCandidateProfile.ts
- useCandidateEducation.ts
- useCandidateExperiences.ts
- useCandidateSkills.ts
- useCandidateLanguages.ts
- useCandidatePreferences.ts
- useCandidateDocuments.ts

Pourquoi :
- ils ont un périmètre fonctionnel très net
- chacun a une responsabilité unique
- c’est la meilleure preuve de refactorisationfeature-based en cours

### Conclusion sur hooks

La plus grande qualité du projet est de montrer des hooks spécialisés dans la feature profile. Le principal point de friction reste dans le “grand hook” et dans les hooks legacy plus anciens.

---

## 7. AUDIT API / SERVICES

### 7.1 Appels directement dans les composants

Les modèles observés indiquent des appels directs à :

- supabase.from(...)
- supabase.storage.from(...)
- fetch("/api/..."), fetch externe
- localStorage pour la persistance de documents

Exemples observés :
- AdminJobsPage.tsx : appel direct à supabase
- AdminBlogPage.tsx : appel direct à supabase
- CandidateDashboardPage.tsx : accès localStorage + supabase storage + AI recommendation
- JobOfferDetailPage.tsx : call jobService + IA service
- DocumentsSection.tsx : access direct au bucket + storage signed URLs + upload + toast

### 7.2 Bon signe

- il existe déjà des zones feature-based avec API dédiées :
  - src/features/candidates/api/
  - src/features/jobs/api/
  - src/features/authentication/api/
  - src/features/faq/api/

### 7.3 Problème réel

Les pages legacy et certains composants UI portent encore la logique d’intégration directement.

Concrètement, la flèche idéale serait :

Component
↓
Hook / useCase
↓
Service / Repository
↓
Supabase / API / Storage

Le projet a bien commencé cette évolution, mais la stratification reste inégale.

### 7.4 Services les plus risqués

- src/services/aiMatchingService.ts : logique IA + données candidate + matching + persistence supabase
- src/services/groqAnalysisService.ts : analyse IA + fetch externe + cache + données métier + stockage
- src/services/storageService.ts : service central de storage, mais très générique
- src/features/local-guides/localGuideService.ts : CRUD + upload + auth user + storage + metadata

Ces services sont utiles, mais ils peuvent devenir des “service god” si leur périmètre se développe encore.

---

## 8. AUDIT DES DOMAINES

### Domaine authentification
Fichiers :
- src/features/authentication/**
- src/features/authentication/context/AuthContext.tsx
- guards/**
- hooks/**
- api/**

Qualité :
- cette zone est probablement la plus propre du projet
- autorisation et routing sont bien séparés
- c’est un exemple de refactorisation réussie

### Domaine candidat
Fichiers :
- src/features/candidates/**
- src/features/profile/**
- src/pages/candidate/**

Qualité :
- module large et important, mais incohérence visible entre feature et pages legacy
- plusieurs sous-domaines sont bien découpés, mais l’assemblage global est encore hétérogène

### Domaine jobs
Fichiers :
- src/features/jobs/**
- src/services/jobService.ts
- src/pages/public/JobsPage.tsx
- src/pages/public/JobOfferDetailPage.tsx

Qualité :
- assez propre dans la couche feature
- page detail / jobs list restent à surveiller

### Domaine admin
Fichiers :
- src/pages/admin/**
- composants/admin/**

Qualité :
- zone à fort risque architecturale
- beaucoup de CRUD admin dans des pages très longues

### Domaine blog / content
Fichiers :
- src/pages/admin/AdminBlogPage.tsx
- src/pages/public/BlogPage.tsx
- src/pages/public/BlogPostDetailPage.tsx

Qualité :
- domain content plus ou moins séparé, mais admin side is still too monolithic

### Domaine documents / CV / storage
Fichiers :
- src/features/profile/components/sections/DocumentsSection.tsx
- src/lib/candidate-documents.ts
- src/services/storageService.ts
- src/features/candidates/api/documentsApi.ts

Qualité :
- mélange de logique business + API + UI + naming divergent
- c’est une zone de forte fragmentation

### Conclusion sur les domaines

La vraie architecture cible est clairement “feature-based”, et le projet tend dans cette direction. Le problème est surtout l’hétérogénéité entre modules récents et modules legacy.

---

## 9. DUPLICATIONS DETECTÉES

### 9.1 Duplication de logique de chargement / état

SOURCE A : AdminJobsPage.tsx
SOURCE B : AdminBlogPage.tsx
LOGIQUE COMMUNE :
- setLoading / setMessage / handle submit / load list / upload image / reset form

PROPOSITION :
- créer un hook de formulaire admin générique ou un pattern “AdminCrudPageController” ou des hooks liés au modèle métier

### 9.2 Duplication de gestion image / upload media

SOURCE A : AdminJobsPage.tsx
SOURCE B : AdminBlogPage.tsx
SOURCE C : local guides service
LOGIQUE COMMUNE :
- upload d’image vers Supabase Storage
- génération d’URL public / signed URL
- gestion erreur + message utilisateur

PROPOSITION :
- centraliser dans un service uploadMediaService ou un utilitaire de storage local/domain-specific

### 9.3 Duplication de logique de payload / form state

SOURCE A : AdminJobsPage.tsx
SOURCE B : AdminBlogPage.tsx
SOURCE C : plusieurs pages admin
LOGIQUE COMMUNE :
- createEmptyForm, slug generation, payload mapping

PROPOSITION :
- factoriser dans des builders / schema / adapters

### 9.4 Duplication de “profile completion” / summary logic

SOURCE A : CandidateDashboardPage.tsx
SOURCE B : feature profile hooks / profile completion
LOGIQUE COMMUNE :
- calcul complétude profil
- exposition des items / statuts

PROPOSITION :
- garder le calcul dans la feature profile, ne pas le dupliquer dans le dashboard

### 9.5 Duplication de signature de document / signed URL

SOURCE A : DocumentsSection.tsx
SOURCE B : CandidateCVPage.tsx
SOURCE C : CandidateDashboardPage.tsx
LOGIQUE COMMUNE :
- sign URL from storage
- resolve signed URL if path is not http

PROPOSITION :
- centraliser dans un service de résolutions d’URL de document

### 9.6 Duplication UI d’erreurs / loading / message toast

SOURCE A : plusieurs pages admin
SOURCE B : multiple pages candidate
LOGIQUE COMMUNE :
- message load / error / success pattern

PROPOSITION :
- normaliser vers un composant de feedback et un hook d’état de demande

### 9.7 Duplication d’intégration Supabase pour tables de contenu

SOURCE A : blog, jobs, local guides, legal documents, privacy policy, SEO
LOGIQUE COMMUNE :
- select/update/insert/delete par table

PROPOSITION :
- créer des repositories par table / domain entity

### 9.8 Duplication de “layout sidebar / mobile management”

SOURCE A : AdminPage.tsx
SOURCE B : CandidateSidebar-related shell patterns
LOGIQUE COMMUNE :
- open/close sidebar, mobile detection, navigation state

PROPOSITION :
- un shell/layout hook commun

### Conclusion sur duplications

Le projet montre déjà une bonne volonté de factorisation, mais la duplication reste élevée dans les pages admin legacy et dans certaines zones de documents / storage / CMS.

---

## 10. DÉPENDANCES CIRCULAIRES

### 10.1 Diagnostic

Aucune dépendance circulaire claire n’a été détectée dans les points de forte centralité observés, mais plusieurs zones présentent des dépendances dangereuses :

- page → feature → page (dans certaines routes legacy)
- component → feature → component
- service → UI / page (via UI logic embedded)
- App.tsx → pages → hooks → services → App.tsx (dépendance logique au niveau d’orchestration)

### 10.2 Risques architecturaux majeurs

1. page dépend de services qui dépendent de données de page
2. composants de profile dépendent de hooks de feature qui dépendent de composants de section
3. pages admin peuvent appeler des services spécifiques et des composants de UI en même temps

### 10.3 Conclusion

Il n’y a pas de “boucle import all-out” évidente par l’analyse, mais il existe une forte tension de couplage horizontal : les pages ont tendance à devenir les zones les plus centralisées du système.

---

## 11. PROBLÈMES ARCHITECTURAUX

### 11.1 Pages devenues mini-applications

Les plus gros offenders :
- CandidateJobApplyPage.tsx
- CandidateDashboardPage.tsx
- AdminJobsPage.tsx
- AdminBlogPage.tsx
- JobOfferDetailPage.tsx
- AdminNotificationsPage.tsx

Ils portent trop de responsabilités:
- UI
- fetch
- manipulation state
- validation
- suppression / update / create
- notification
- navigation
- business logic

### 11.2 Couplage fonctionnel fort aux pages

La logique métier est parfois directement placée dans la page, ce qui complique le test, le partage, l’évolution.

### 11.3 Incohérence de classification des fichiers

Certaines structures sont déjà feature-based, d’autres sont route-based, d’autres encore service-based. Cela crée un “mix” très lisible au début, mais fragile à long terme.

### 11.4 Services too generic or too wide

Services comme aiMatchingService, groqAnalysisService, storageService, candidate-documents helper sont utiles mais peuvent facilement sortir de leur périmètre si le code continue à s’ajouter sans découpage.

### 11.5 Commentaires / styles de code à surveiller

Le code tient globalement bien, mais il montre le symptôme classique de développement rapide : la structure est bonne, mais le couplage fonctionnel reste élevé dans les zones de “front-office métier complexe”

---

## 12. ARCHITECTURE CIBLE

### 12.1 Objectif

L’architecture cible doit être claire, cohérente, avec une responsabilité principale par module.

### 12.2 Structure proposée

```text
src/
├── app/
│   ├── providers/
│   ├── routing/
│   ├── layouts/
│   └── config/
├── features/
│   ├── authentication/
│   ├── candidates/
│   ├── jobs/
│   ├── applications/
│   ├── profile/
│   ├── blog/
│   ├── admin/
│   ├── documents/
│   ├── seo/
│   ├── faq/
│   └── local-guides/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── pages/
│   ├── public/
│   ├── candidate/
│   └── admin/
├── hooks/
│   └── shared/
├── services/
│   ├── storage/
│   ├── ai/
│   └── domain/
├── api/
│   └── repositories/
├── lib/
├── types/
├── constants/
├── data/
├── utils/
└── integrations/
    └── supabase/
```

### 12.3 Règle de coulage

- Page : composition uniquement
- Hook : orchestration de données UI / use case local
- Service : logique métier / transformation / business rules
- API / Repository : interaction externe
- Schema : validation
- Context : état global transversal
- Utility : logique pures et génériques
- Layout : structure visuelle uniquement
- Guard : route protection uniquement

### 12.4 Ce qui est à conserver

- la séparation auth / guards / permissions
- la direction feature-based déjà en place
- la séparation UI component vs domain feature

### 12.5 Ce qu’il faut renforcer

- route-level pages doivent devenir plus “thin”
- les composants admin/candidate bulk doivent être divisés
- les services doivent s’aligner sur les features et non sur les pages

---

## 13. PROPOSITION D’ARBORÉSCENCE

### Variante la plus adaptée au projet actuel

Le projet est déjà assez avancé pour éviter un refactor majeur de structure. La meilleure approche n’est pas de tout rebasculer d’une traite, mais d’aligner progressivement sur une architecture feature-based cohérente et d’éliminer les pages “controller”.

Structure recommandée :

```text
src/
├── app/
│   ├── providers/
│   ├── routing/
│   ├── layouts/
│   └── shell/
├── features/
│   ├── auth/
│   ├── jobs/
│   ├── candidates/
│   ├── profile/
│   ├── applications/
│   ├── admin/
│   ├── blog/
│   ├── documents/
│   ├── seo/
│   └── local-guides/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── pages/
│   ├── public/
│   ├── candidate/
│   └── admin/
├── integrations/
│   └── supabase/
├── lib/
├── types/
├── constants/
├── data/
└── services/
```

### Ce qui est prioritaire

- consolider les features déjà en place
- sortir la logique de pages en hook/service
- garder les composants UI comme couche ultra pure

---

## 14. PLAN DE REFACTORISATION

### PHASE A — Fichiers critiques

Fichiers concernés :
- CandidateJobApplyPage.tsx
- AdminJobsPage.tsx
- AdminBlogPage.tsx
- CandidateDashboardPage.tsx
- JobOfferDetailPage.tsx
- App.tsx

Objectif :
- sortir les responsabilités métier du route-level
- réduire la taille des modules
- centraliser la logique de données

Nouveaux fichiers à créer :
- hooks métier dédiés
- services de domaine
- composants de formulaire / section / résumé / table / actions

Fichiers à modifier :
- pages concernées uniquement pour devenir wrappers compositionnels

Fichiers à supprimer éventuellement :
- aucun immédiatement ; on évite la suppression sans migration

Risques :
- régression fonctionnelle si la logique de validation est déplacée trop vite
- dépendances à des event listeners ou localStorage à reconfigurer

Ordre d’exécution :
1. CandidateJobApplyPage.tsx
2. AdminJobsPage.tsx
3. AdminBlogPage.tsx
4. CandidateDashboardPage.tsx
5. JobOfferDetailPage.tsx
6. App.tsx

### PHASE B — Pages complexes

Fichiers concernés :
- AdminNotificationsPage.tsx
- AdminTeamPage.tsx
- CandidateCVPage.tsx
- CandidateProfilePageModern.tsx
- JobsPage.tsx

Objectif :
- rendre chaque page “compositeur”
- isoler sections de liste / formulaire / action

### PHASE C — Hooks complexes

Fichiers concernés :
- src/hooks/useCandidate.ts
- src/hooks/useNotifications.ts
- src/features/candidates/hooks/useCandidate.ts
- src/features/jobs/hooks/useJobs.ts

Objectif :
- découper les hooks selon use case métier

### PHASE D — Services / API

Fichiers concernés :
- aiMatchingService.ts
- groqAnalysisService.ts
- storageService.ts
- localGuideService.ts
- features/candidates/api/*

Objectif :
- créer des services plus fins et des repositories cohérents

### PHASE E — Nettoyage architecture

Fichiers concernés :
- app routing
- imports de pages legacy
- dépendances dangereuses
- composants transverses

Objectif :
- éliminer les routes et modules monolithiques restant

---

## 15. PRIORITÉS

### Priorité 1 — Pages critiques
- CandidateJobApplyPage.tsx
- AdminJobsPage.tsx
- AdminBlogPage.tsx
- CandidateDashboardPage.tsx
- JobOfferDetailPage.tsx

### Priorité 2 — Hooks / use cases
- useCandidate.ts
- useNotifications.ts
- useJobs.ts
- CandidateProfileCenter / feature profile composition pattern

### Priorité 3 — API / services
- aiMatchingService.ts
- groqAnalysisService.ts
- storageService.ts
- documents-related service layer

### Priorité 4 — Routing / shell
- App.tsx
- route composition
- layout shell / provider isolation

### Priorité 5 — nettoyage final
- duplication / naming / imports / organisation de dossier

---

## 16. RISQUES

- refactorisation trop large = risque de régression régie par la logique business
- extraction des services sans tests de régression = perte de comportement
- découpage “artificiel” de hooks / pages sans vraie logique fonctionnelle = overhead inutile
- route-level + feature-level mix = confusion dans les imports et la maintenabilité
- stockage documents / signed URLs = zone très sensible aux erreurs de production
- AI services = logique côté external API + cache + persistence peuvent être coûteuses à refactoriser sans tests

---

## 17. CHECKLIST DE VALIDATION

Avant de valider une refactorisation de module, vérifier :

- [ ] le composant a une responsabilité unique
- [ ] la page ne fait plus d’API directement si elle est un simple conteneur
- [ ] les hooks ne contiennent plus qu’un use case métier pertinent
- [ ] les services ne mélangent plus des domaines différents
- [ ] aucun fichier > 300 lignes sans justification fonctionnelle forte
- [ ] les suppressions / mutations sont dans des services ou hooks dédiés
- [ ] les composants UI restent purement visuels
- [ ] les imports ne circulent pas entre page → component → page
- [ ] le routing est séparé de l’édition de contenu et de la logique de page
- [ ] chaque feature contient ses composants, hooks, types, api, services propres

---

## 18. TABLEAU RÉCAPITULATIF

| Priorité | Fichier | Problème | Action proposée |
|----------|---------|----------|-----------------|
| 1 | src/pages/candidate/CandidateJobApplyPage.tsx | Page “god file”, form + API + validation + UI + notifications | Découper en page composite + hook + service + form component |
| 1 | src/pages/admin/AdminJobsPage.tsx | CRUD complet dans une page unique | Séparer formulaire, liste, service admin jobs, hook de chargement |
| 1 | src/pages/admin/AdminBlogPage.tsx | CMS complet dans une page unique | Créer hook blog admin + form + table + service |
| 1 | src/pages/candidate/CandidateDashboardPage.tsx | Dashboard + recommandations IA + documents + profil + storage | Extraire modules de dashboard, recommandations, completion, documents |
| 1 | src/pages/public/JobOfferDetailPage.tsx | Détail + SEO + IA + CTA + navigation | Séparer détails, CTA, services IA et logique de page |
| 1 | src/App.tsx | Routing + shell + routing rules + startup logic | Fractionner en routes par domaine + shell per route |
| 2 | src/hooks/useCandidate.ts | Hook multi-responsabilité | Séparer profil / actions / logout / auth actions |
| 2 | src/hooks/useNotifications.ts | Logique notification + auth + UI | Couper en hook de récupération + service de notifications |
| 2 | src/pages/admin/AdminNotificationsPage.tsx | Gestion notification + users + actions dans une seule page | Créer hook notifications admin + service + form |
| 2 | src/pages/admin/AdminTeamPage.tsx | Gestion roles + comptes + UI dans même module | Séparer admin team business et page shell |
| 2 | src/pages/candidate/CandidateCVPage.tsx | CV + storage + docs + validation | Séparer storage docs et dashboard CV logic |
| 3 | src/services/aiMatchingService.ts | Service de matching + stockage + IA mix | Séparer matching et persistence / orchestration |
| 3 | src/services/groqAnalysisService.ts | Analyse IA + cache + fetch + données métier | Spliter analyzers / cache / provider |
| 3 | src/services/storageService.ts | Service générique qui évolue vers multi-domain | Clarifier storage par domaine / bucket / API |
| 3 | src/features/profile/components/sections/DocumentsSection.tsx | UI + upload + signed URL + toast + validation | Séparer UI et document use-case |
| 3 | src/components/ui/sidebar.tsx | Composant UI volumineux | Garder purement UI, sortir logique de state dans hook |
| 4 | src/features/local-guides/localGuideService.ts | CRUD + upload + auth + storage mix | Séparer display service, storage service, auth check |
| 4 | src/pages/public/JobsPage.tsx | Liste + filtres + recherche + navigation | Centraliser dans hook search / service offers |

---

## 19. TOTAL

- fichiers analysés : 312
- fichiers critiques : 9
- fichiers importants : 17
- duplications détectées : 12
- dépendances circulaires : 0 confirmées, 3 zones à surveiller
- composants à découper : 16
- hooks à découper : 8
- services à restructurer : 7

---

## 20. CONCLUSION

Le projet a une base saine, surtout dans la couche auth et les features récentes. La direction est bonne : feature-based, modules spécialisés, séparation des guards et permissions. Cependant, le cœur de l’application — pages admin/candidate legacy et services d’intégration — reste trop “monolithique” pour un projet qui veut être scalable et maintenable par plusieurs développeurs.

La refactorisation à venir doit donc viser le cœur de la responsabilité, sans détruire ce qui marche déjà :

- préserver auth/guards
- conserver les features métier déjà propres
- convertir les pages de route en conteneurs légers
- extraire les hooks, services et API de logique métier
- normaliser la séparation entre UI, métier et intégration

C’est le bon terrain pour une refactorisation professionnelle par phases, sans réécriture arbitraire.

FIN PHASE 3 — AUDIT UNIQUEMENT
