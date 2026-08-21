# Analyse du site officiel — Préparation du site Support

## 1. Vue d'ensemble

Ce document synthétise les éléments fonctionnels et techniques réellement présents dans le site officiel EmploiPlus Group. Il sert de base documentaire pour un futur site Support distinct, sans copier ni réutiliser le design du site officiel.

Le point d’entrée principal est la configuration de routes dans [src/App.tsx](src/App.tsx). Le site combine :
- une zone publique (accueil, jobs, blog, FAQ, mentions légales, CGU, contact)
- une zone candidat protégée (/candidate/*)
- une zone d’authentification (/auth, /candidate/login, /candidate/signup, etc.)
- une zone admin (/admin/*) visible dans le code

Les éléments de données et de logique sont majoritairement basés sur Supabase, avec des services dans [src/services](src/services), des API dans [src/features](src/features), et des hooks React pour l’UI.

### Sources clés consultées
- [src/App.tsx](src/App.tsx)
- [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)
- [src/services/storageService.ts](src/services/storageService.ts)
- [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)
- [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts)
- [src/features/candidates/api](src/features/candidates/api)
- [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)
- [src/pages/candidate](src/pages/candidate)
- [src/pages/admin](src/pages/admin)

## 2. Architecture fonctionnelle

### 2.1. Zones du site

- Public : pages marketing, annonces d’emploi, contenu éditorial, FAQ, mentions légales.
- Candidat : espace connecté avec profil, documents, candidatures, offres sauvegardées, recommandations, abonnement.
- Authentification : inscription, confirmation email, connexion, mots de passe, reset.
- Administration : gestion des offres, blog, FAQ, SEO, candidats, notifications, guides, analytics.

### 2.2. Modèles de gestion

Le projet s’appuie sur :
- React + Vite + TypeScript
- React Router
- Supabase Auth + Supabase Database + Supabase Storage
- services métier et hooks pour isoler logique UI / données

### 2.3. Règles de conception observées

CONFIRMÉ : le site officiel n’est pas une simple landing page; il dispose d’un vrai système d’authentification, de stockage de documents, de gestion de profils et de recommandations.

À VÉRIFIER : la portée exacte du back-office et des flux “marketing / recrutement / BPO” ne peut pas être totalement couverte sans explorer tous les sous-modules et toute la logique admin. Les routes présentes suffisent à identifier le cœur fonctionnel.

## 3. Routes principales

### 3.1. Routes publiques

CONFIRMÉ dans [src/App.tsx](src/App.tsx) :
- / : page d’accueil
- /about : présentation / entreprise
- /services : services
- /services/:slug : détail de service
- /services/hub-candidat-intelligent
- /services/solutions-entreprises-bpo
- /services/hub-emploi-recrutement/landing
- /jobs : liste des offres
- /jobs/:slug : détail d’une offre
- /blog et /blog/:slug
- /faq
- /contact
- /politique-de-confidentialite
- /mentions-legales
- /cgu

Rôle : marketing, contenus éditoriaux, offres visibles publiquement, FAQ, conformité légale.

### 3.2. Routes d’authentification

CONFIRMÉ :
- /auth
- /candidate/login
- /candidate/signup
- /candidate/forgot-password
- /candidate/reset-password
- /candidate/confirm

Rôle : création du compte candidat, validation email, réinitialisation du mot de passe, parcours d’accès au compte.

### 3.3. Routes candidat

CONFIRMÉ :
- /candidate
- /candidate/dashboard
- /candidate/profile
- /candidate/profile/edit
- /candidate/documents
- /candidate/guides
- /candidate/subscription
- /candidate/subscription/free
- /candidate/subscription/premium
- /candidate/subscription/premium-plus
- /candidate/applications
- /candidate/applications/:id
- /candidate/saved-jobs
- /candidate/saved-offers
- /candidate/notifications
- /candidate/account
- /candidate/settings
- /candidate/jobs/:slug/apply

Rôle : espace personnel candidat, documents, recommandations, offres sauvegardées, candidatures, notifications, paramètres, abonnement.

### 3.4. Routes liées aux comptes et paramètres

CONFIRMÉ :
- /candidate/account
- /candidate/settings
- /candidate/profile
- /candidate/profile/edit

Rôle : gestion du profil, email, mot de passe, préférences, données du compte.

### 3.5. Routes administratives

CONFIRMÉ dans [src/App.tsx](src/App.tsx) et [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx) :
- /admin
- /admin/jobs
- /admin/blog
- /admin/notifications
- /admin/team
- /admin/seo
- /admin/privacy
- /admin/legal
- /admin/cgu
- /admin/candidates
- /admin/guides
- /admin/faq
- /admin/analytics-offres

Rôle : gestion du back-office, contenus, SEO, FAQ, guides, notifications, analytics ET gestion des candidats/offres.

### 3.6. Routes liées aux offres

CONFIRMÉ :
- /jobs
- /jobs/:slug
- /candidate/jobs/:slug/apply
- /candidate/saved-jobs /saved-offers

Rôle : affichage des offres, détail, recommandation, sauvegarde, candidature.

### 3.7. Routes liées aux candidatures

CONFIRMÉ :
- /candidate/applications
- /candidate/applications/:id
- /candidate/jobs/:slug/apply

Rôle : soumission, visualisation, statuts, retrait d’une candidature.

### 3.8. Routes liées aux documents / CV

CONFIRMÉ :
- /candidate/documents
- /candidate/profile
- /candidate/profile?tab=presentation (redirigé depuis creation CV)
- pages de création/édition de CV

Rôle : stockage, affichage, remplacement, suppression, téléchargement, extraction du texte PDF, utilisation dans les recommandations.

### 3.9. Routes liées aux guides / fiches

CONFIRMÉ :
- /candidate/guides

Rôle : fiches ressources locales, PDF téléchargeables, partage, aperçu.

### 3.10. Routes d’abonnement

CONFIRMÉ :
- /candidate/subscription
- /candidate/subscription/free
- /candidate/subscription/premium
- /candidate/subscription/premium-plus

Rôle : différenciation des forfaits, affichage des avantages et de la valeur.

## 4. Parcours candidat

### 4.1. Inscription

CONFIRMÉ dans [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts) et [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx) :
- appel Supabase Auth signUp
- envoi d’email de confirmation si nécessaire
- stockage de métadonnées éventuelles via options.data
- redirection configurée via redirectTo

Données utilisées :
- email
- password
- données utilisateur supplémentaires (metadata)

Règles importantes :
- l’email doit être confirmé pour que la session soit considérée comme active
- loginCandidate vérifie user.email_confirmed_at

Problèmes Support possibles :
- email non reçu
- compte non confirmé
- erreur lors de l’inscription

### 4.2. Confirmation de compte

CONFIRMÉ :
- le code vérifie le champ email_confirmed_at
- l’API de renvoi d’email passe par /api/resend-confirmation
- le flux de confirmation est visible dans [src/pages/candidate/CandidateConfirmPage.tsx](src/pages/candidate/CandidateConfirmPage.tsx)

Cas Support :
- compte bloqué sur “vérifiez votre email”
- session restaurée mais email non confirmé

### 4.3. Connexion

CONFIRMÉ :
- use de supabase.auth.signInWithPassword
- validation des emails confirmés
- déconnexion automatique si l’email n’est pas confirmé

Données :
- email, password
- session Supabase

### 4.4. Mot de passe oublié

CONFIRMÉ dans [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts) :
- appel vers /api/password-reset-request
- flux de reset via /candidate/reset-password

Risque Support :
- email non reçu
- lien expiré
- mauvaise configuration email

### 4.5. Réinitialisation du mot de passe

CONFIRMÉ :
- fonction updatePassword via supabase.auth.updateUser({ password: newPassword })
- page dédiée dans [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx)

### 4.6. Accès au compte

CONFIRMÉ :
- AuthProvider récupère la session Supabase
- détection du profil candidat via table candidates et user_id
- ProtectedRoute protège les pages /candidate

Important :
- la détermination d’accès candidat repose sur l’existence d’un profil dans la table candidates
- si le profil n’existe pas, le candidat n’a pas les permissions attendues

### 4.7. Profil

CONFIRMÉ dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) et [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts) :
- champs : first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url
- complétude évaluée sur : nom, titre, localisation, résumé, photo, expériences, formation, compétences, langue, préférences

### 4.8. Tableau de bord

CONFIRMÉ dans [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) :
- actions rapides : compléter mon profil, consulter les guides, voir mes candidatures
- chargement de documents depuis localStorage et fallback sur cv_url
- recommandations via RPC match_job_offers_for_candidate
- affichage de l’état du profil et des offres recommandées

### 4.9. Offres d’emploi

CONFIRMÉ :
- recherche/listing via [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts)
- filtres appliqués sur status, query, company, location, contractType
- offre détaillée via /jobs/:slug
- sauvegarde possible via candidate_saved_offers

### 4.10. Recommandations

CONFIRMÉ dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts) :
- stockage de cv_text et embedding_vector dans candidates
- offre embedding_vector créé à partir du titre, company, description, requirements, location, contract_type
- RPC match_job_offers_for_candidate pour récupérer les offres compatibles

### 4.11. Candidatures

CONFIRMÉ dans [src/features/candidates/api/applicationsApi.ts](src/features/candidates/api/applicationsApi.ts) :
- création ou upsert de job_applications
- status : submitted, reviewed, shortlisted, rejected, accepted, withdrawn
- “applied_at” conservée
- suppression / retrait de candidature
- les candidatures sont nettoyées si > 30 jours

### 4.12. Offres sauvegardées

CONFIRMÉ dans [src/features/candidates/api/savedOffersApi.ts](src/features/candidates/api/savedOffersApi.ts) :
- table candidate_saved_offers
- sauvegarde par candidate_id + job_offer_id
- possibilité de suppression

### 4.13. Documents

CONFIRMÉ :
- document candidat et CV stockés dans Supabase Storage bucket configurable
- règles : PDF uniquement pour documents et CV, taille 2 Mo
- documents de type motivation / diploma / certificate / attestation / portfolio / other / recepisse

### 4.14. CV

CONFIRMÉ :
- l’upload est traité par [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- extraction PDF via pdfjs-dist dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)
- contenu stocké dans candidates.cv_text et candidate.embedding_vector
- cv_url aussi sauvegardé sur la table candidates

### 4.15. Lettre de motivation

CONFIRMÉ dans [src/features/candidates/api/applicationsApi.ts](src/features/candidates/api/applicationsApi.ts) :
- job_applications contient cover_letter et subject
- peut être fournie lors de la candidature

### 4.16. Expériences, formations, compétences, langues, préférences

CONFIRMÉ dans [src/features/candidates/api](src/features/candidates/api) :
- candidate_experience
- candidate_education
- candidate_skills
- candidate_languages
- candidate_preferences

Chacun a ses endpoints CRUD dédiés, utilisés pour alimenter le profil candidat.

### 4.17. Notifications

CONFIRMÉ dans [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts) et [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) :
- tableau notifications
- lecture / marquage lu / suppression
- filtres par user_id, type, status
- types : admin, offre, candidature, etc.

### 4.18. Paramètres / compte

CONFIRMÉ :
- gestion du compte dans [src/pages/candidate/CandidateSettingsPage.tsx](src/pages/candidate/CandidateSettingsPage.tsx)
- paramètres liés au compte et à la sécurité
- logique de changement de mot de passe via authApi

### 4.19. Abonnement

CONFIRMÉ dans [src/pages/candidate/CandidateSubscriptionPage.tsx](src/pages/candidate/CandidateSubscriptionPage.tsx) :
- forfaits Gratuit / Premium / Premium+
- prix affichés côté UI
- détail des pages par offre

### 4.20. Déconnexion

CONFIRMÉ dans [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts) :
- supabase.auth.signOut()
- clearAuthStorage() pour nettoyer stockage local

## 5. Profil candidat

### 5.1. Données du profil

CONFIRMÉ dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) et [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) :
- identité : first_name, last_name, email, phone
- titre / headline : headline
- localisation : location_city, location_country
- résumé : bio
- photo : avatar_url
- expériences : candidate_experience
- formations : candidate_education
- compétences : candidate_skills
- langues : candidate_languages
- préférences : candidate_preferences
- CV : cv_text, cv_url, embedding_vector

### 5.2. Complétude du profil

CONFIRMÉ dans [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts) :
- 10 éléments sont évalués :
  - Nom complet
  - Titre professionnel
  - Localisation
  - Résumé professionnel
  - Photo de profil
  - Expérience professionnelle
  - Formation
  - Compétence
  - Langue
  - Préférences RH

Logique :
- chaque item est considéré complet si la donnée attendue est présente
- pourcentage calculé sur base du nombre d’éléments remplis
- liste missingItems calculée pour UI

## 6. Tableau de bord

CONFIRMÉ dans [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) :
- sections visibles : profil, recommandations, document CV, actions rapides
- profil complet / incomplet
- offres recommandées basées sur le CV et les embeddings
- données provenant de Supabase + localStorage pour les documents
- notifications et recommandations adaptatives

### 6.1. Données affichées

- profile
- educations, skills, languages, preferences, experiences
- candidateDocuments (CV + autres docs depuis localStorage)
- recommendedJobs via getRecommendedJobs

### 6.2. Règles d’affichage

- si profile.id absent => aucune recommandation / documents
- si cv_text ou embedding_vector absent => recommandations limitées ou absentes
- le dashboard est rafraîchi après upload de CV via événement custom cv-uploaded

## 7. Offres d'emploi

### 7.1. Affichage

CONFIRMÉ dans [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts) :
- job_offers principal
- sélection de colonnes : id, slug, title, company, contract_type, location_city, location_country, salary, description, publish_at, deadline, expires_at, status, cover_image

### 7.2. Recherche et filtres

CONFIRMÉ :
- filtre par status
- filtre par query (titre, company, description, requirements)
- filtre par company
- filtre par location (city/country)
- filtre par contractType
- tri par publish_at par défaut

### 7.3. Détail d’une offre

CONFIRMÉ :
- /jobs/:slug charge la fiche détaillée
- données sur title, company, description, requirements, contract_type, salary, deadline, external_link, application_email, application_whatsapp, cover_image

### 7.4. Recommandations

CONFIRMÉ :
- les offres sont recommandées via match_job_offers_for_candidate
- le score se base sur les embeddings de CV et d’offres

### 7.5. Sauvegarde et candidature

CONFIRMÉ :
- saveJobOffer / unsaveJobOffer dans [src/features/candidates/api/savedOffersApi.ts](src/features/candidates/api/savedOffersApi.ts)
- applyToJob / withdrawApplication dans [src/features/candidates/api/applicationsApi.ts](src/features/candidates/api/applicationsApi.ts)

### 7.6. Statut, expiration, publication

CONFIRMÉ :
- offers filtrées avec status = published dans les listes
- publish_at et expires_at existent dans le schéma
- le site de liste applique publication si publish_at <= now

À VÉRIFIER : conditions exactes d’expiration côté UI et sécurité de visibilité selon statut/temps réel.

### 7.7. Partage

CONFIRMÉ dans [src/components/site/ShareButtons.tsx](src/components/site/ShareButtons.tsx) et pages de guides/offres :
- partage possible par lien, réseau social ou copy link selon composant

## 8. Candidatures

### 8.1. Création d’une candidature

CONFIRMÉ dans [src/features/candidates/api/applicationsApi.ts](src/features/candidates/api/applicationsApi.ts) :
- payload : candidate_id, job_offer_id, cover_letter, subject, status = submitted
- upsert sur (candidate_id, job_offer_id)

### 8.2. Données utilisées

- candidate_id
- job_offer_id
- cover_letter
- subject
- status
- applied_at
- updated_at

### 8.3. Documents associés

CONFIRMÉ :
- la candidature peut venir avec un document/lettre de motivation, mais les docs téléchargés sont gérés séparément dans Storage
- le candidat a un espace de documents distincts

### 8.4. Stockage

CONFIRMÉ :
- table job_applications
- relations avec job_offers par job_offer_id
- nettoyage automatique des candidatures > 30 jours

### 8.5. Retrouvabilité côté candidat

CONFIRMÉ :
- la page /candidate/applications liste les candidatures récentes
- détail via /candidate/applications/:id
- statuts visibles en UI

### 8.6. Statuts existants

CONFIRMÉ :
- submitted
- reviewed
- shortlisted
- rejected
- accepted
- withdrawn

### 8.7. Limites / cas particuliers

CONFIRMÉ :
- les candidatures sont nettoyées après 30 jours
- le candidat peut retirer une candidature en la marquant withdrawn
- l’upsert évite les doublons sur le même couple candidat/offre

## 9. Documents et CV

### 9.1. Types de documents

CONFIRMÉ dans [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts) :
- motivation
- diploma
- certificate
- attestation
- portfolio
- other
- recepisse

### 9.2. Stockage et buckets

CONFIRMÉ dans [src/services/storageService.ts](src/services/storageService.ts) :
- STORAGE_BUCKET = variable VITE_SUPABASE_STORAGE_BUCKET ou "public"
- CANDIDATE_DOCUMENTS_BUCKET = VITE_SUPABASE_CANDIDATE_BUCKET ou bucket principal ou "public"
- MAX_DOCUMENT_SIZE_BYTES = 2 Mo
- ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"]
- MAX_IMAGE_SIZE_BYTES = 8 Mo pour images

### 9.3. Récupération des URLs

CONFIRMÉ :
- getPublicUrl() pour URL publique si possible
- sinon createSignedUrl(filename, 3600)
- l’URL est reconstruite pour le client après upload

### 9.4. CV vs autres documents

CONFIRMÉ :
- le CV est traité spécifiquement dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)
- le CV est extrait en texte PDF puis stocké dans candidates.cv_text et candidates.embedding_vector
- la table candidates conserve aussi cv_url
- les autres documents restent dans le localStorage du client pour l’affichage de la page documents

### 9.5. Règles de format et taille

CONFIRMÉ :
- CV/documents PDF uniquement
- taille max 2 Mo
- images acceptées pour certains documents visuels (PNG/JPG/WEBP/GIF), max 8 Mo

### 9.6. Upload / suppression / remplacement

CONFIRMÉ :
- uploadCandidateCV, uploadCandidateDocument, deleteCandidateCV, deleteCandidateDocument dans [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- remplacement sans vraie logique de versionning côté code : le client modifie le stockage local et remplace l’état local

### 9.7. Extraction du texte et IA

CONFIRMÉ :
- extraction via pdfjs-dist
- extraction du texte pour alimenter cv_text
- génération d’un embedding vector léger pour les recommandations
- invalidation de ai_analysis_cache après upload

### 9.8. Incohérences UI / comportement réel

IMPORTANT :
- l’interface semble laisser penser qu’un document est stocké “dans la base” de manière classique, mais le code montre un usage important de localStorage (emploiplus-candidate-documents-*), ainsi qu’un stockage Supabase côté fichier + caches clients.
- le CV est bien traité comme donnée fonctionnelle pour le matching AI, pas seulement un fichier téléchargeable.

## 10. Abonnements

### 10.1. Forfaits affichés

CONFIRMÉ dans [src/pages/candidate/CandidateSubscriptionPage.tsx](src/pages/candidate/CandidateSubscriptionPage.tsx) :
- Gratuit : 0 FCFA
- Premium : 550 FCFA
- Premium+ : 1 050 FCFA

### 10.2. Avantages annoncés

CONFIRMÉ :
- Gratuit : analyse CV ↔ offre, score de compatibilité, forces et lacunes du profil
- Premium : jusqu’à 7 recommandations, accès à davantage de correspondances
- Premium+ : toutes les recommandations disponibles, aucune limite artificielle, accès complet aux correspondances, alertes e-mail, filtres par niveau de compatibilité

### 10.3. Différence fonctionnelle / UI

CONFIRMÉ :
- certaines fonctionnalités sont bien documentées dans les plans et pages détaillées
- le code montre aussi des éléments de marketing / “UI” qui peuvent ne pas correspondre exactement à un état fonctionnel complet

À VÉRIFIER : les fonctionnalités “bientôt disponibles” ou purement visuelles doivent être distinguées de celles réellement activées au runtime.

### 10.4. Éléments tirés de l’UI uniquement

À VÉRIFIER / à distinguer :
- textes de promotion, labels, blocs “Le plus complet”, “Le plus choisi”, contenus de pages de planification
- caractéristiques indiquées comme disponibles sans preuve de flux fonctionnel réel complet

## 11. Administration

CONFIRMÉ dans [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx) et [src/App.tsx](src/App.tsx) :
- dashboard admin
- jobs : gestion des offres
- blog : contenu éditorial
- notifications : envoi / gestion
- candidates : listing et gestion de candidats
- guides : fiches locales
- FAQ : contenu administrable
- SEO : meta tags / canonical
- privacy / legal / cgu : pages légales
- analytics-offres : analytics sur les offres

Rôle : gestion de contenu et du fonctionnement du site officiel, pas uniquement du support client.

## 12. Données et services

### 12.1. Tables importantes

CONFIRMÉ dans [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) :
- candidates
- candidate_skills
- candidate_experience
- candidate_education
- candidate_languages
- candidate_preferences
- candidate_saved_offers
- job_offers
- job_applications
- notifications
- page_views
- services
- blog_posts
- faq_entries
- local_guides
- legal_documents
- privacy_policy
- cgu

### 12.2. Services / API internes

CONFIRMÉ :
- [src/services/storageService.ts](src/services/storageService.ts) : upload / URL des fichiers
- [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts) : extraction CV + embeddings + recommandations
- [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts) : gestion offres
- [src/features/candidates/api](src/features/candidates/api) : profil, documents, candidatures, offres sauvegardées
- [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts) : session/auth
- [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) : notifications

### 12.3. RPC et traitements automatiques

CONFIRMÉ :
- RPC match_job_offers_for_candidate dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)
- invalidation de ai_analysis_cache après upload de CV
- nettoyage des candidatures > 30 jours
- génération d’embeddings de CV / offres

À VÉRIFIER : présence de CRON / webhooks / jobs externes plus avancés non visibles immédiatement dans les fichiers front + supabase.

## 13. Authentification et sécurité

### 13.1. Inscription et connexion

CONFIRMÉ :
- Supabase Auth
- signUp, signInWithPassword, signOut
- vérification de email_confirmed_at

### 13.2. Protection des routes

CONFIRMÉ dans [src/App.tsx](src/App.tsx) et [src/features/authentication/guards](src/features/authentication/guards) :
- ProtectedRoute
- rôle candidat requis pour /candidate
- AuthProvider contrôle session et permissions

### 13.3. Rôles / permissions

CONFIRMÉ :
- AuthContext dérive les roles et permissions à partir de la session et de la présence d’un profil candidat
- présence d’un candidat dans la table candidates active le rôle candidate

### 13.4. Sécurité des données

CONFIRMÉ :
- la logique est centrée sur Supabase, avec RLS supposée côté base
- les fichiers sensibles ne doivent pas être exposés dans le document final

## 14. IA et recommandations

### 14.1. Analyse du CV

CONFIRMÉ :
- le CV PDF est extrait en texte
- ce texte est stocké dans candidates.cv_text
- un embedding léger est calculé

### 14.2. Matching offres / profil

CONFIRMÉ :
- embeddigs produits pour offres et candidat
- RPC match_job_offers_for_candidate utilisé pour trouver des offres pertinentes

### 14.3. Autres traitements IA / analyses

CONFIRMÉ dans le code :
- ai_analysis_cache invalidé après upload
- historique de score / compatibilité sur les recommandations

À VÉRIFIER : l’exactitude des algorithmes de scoring, seuils de compatibilité et périmètre complet de l’IA ne peut pas être garantie sans documenter les RPC Supabase et la logique back-end associée.

## 15. Problèmes fréquents à documenter

Les cas qui méritent probablement des articles Support :
- compte non confirmé
- email de confirmation non reçu
- mot de passe oublié / lien invalide
- compte candidat non créé / pas de profil détecté
- profil incomplet
- CV refusé / non reconnu / PDF invalide
- fichier trop volumineux
- offre non visible / expirée / hors publication
- candidature non enregistrée ou doublon
- sauvegarde d’offre impossible
- recommandations absentes ou faibles
- notifications non lues / non reçues
- abonnement premium/premium+ non clair
- accès à la zone candidate impossible ou session expirée
- problème de chargement de documents ou de fichiers non affichés

## 16. Structure recommandée du futur Support

Le site Support devrait probablement contenir :
1. Commencer avec EmploiPlus
2. Compte et connexion
3. Profil candidat
4. CV et documents
5. Recherche d’emploi
6. Candidatures et offres sauvegardées
7. Recommandations et matching IA
8. Abonnements et forfaits
9. Paramètres et sécurité
10. Guides et fiches pratiques
11. Problèmes fréquents / erreurs
12. FAQ – site officiel + parcours candidat

## 17. Points à vérifier

À VÉRIFIER :
- détails complets des RPC Supabase côté base de données
- schéma exact des tables et vues de production
- rôle exact des données dans ai_analysis_cache et des flux de scoring
- éventualité d’outils de cron, webhook, alerts ou tasks automatiques non visibles dans ce repo
- présence de route admin non répertoriée dans les pages chargées au runtime
- exactitude des “fonctionnalités bientôt disponibles” et de leur statut côté production

## Conclusion

CONFIRMÉ : ce repository permet de comprendre le cœur du produit officiel : parcours candidat, espace de recherche d’emploi, recommandations IA, documents/CV, abonnement, administration, auth, et données Supabase.

À VÉRIFIER : certains éléments de profondeur “back-office” ou “IA/score” nécessitent un accès direct aux scripts SQL, aux RPC Supabase et aux règles de sécurité pour être documentés avec une précision de support de niveau production.

Si je donne uniquement ce fichier au Copilot du nouveau repository emploiplus-group-support, il dispose d’une base fonctionnelle solide pour construire une documentation Support cohérente et orientée utilisateur.
