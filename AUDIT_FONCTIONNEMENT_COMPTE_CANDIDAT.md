# Audit du fonctionnement actuel du compte candidat

Document de référence produit à partir de l’analyse du code du site EmploiPlus Group. Ce document vise à décrire le comportement réel du compte candidat tel qu’il est implémenté aujourd’hui, sans modifier le code existant.

> Contrainte de l’audit : aucune modification applicative n’a été effectuée. Les informations ci-dessous sont issues de fichiers source vérifiés et de routes/services réellement présents dans le projet.

## 1. Périmètre du document

Ce document couvre :
- l’authentification candidat,
- la protection des routes du compte candidat,
- le tableau de bord candidat,
- le profil candidat et ses sous-sections,
- les documents / CV,
- les candidatures et offres enregistrées,
- les notifications,
- les paramètres du compte,
- les données Supabase et les flux métiers associés.

## 2. Architecture générale

Le compte candidat est structuré autour de :
- des routes publiques d’authentification : `/candidate/login`, `/candidate/signup`, `/candidate/forgot-password`, `/candidate/reset-password`, `/candidate/confirm` ;
- un sous-espace protégé : `/candidate` avec `ProtectedRoute`; 
- un layout candidat : `CandidateLayout` / `CandidateAppShell` ;
- un hook de profil candidat : `useCandidate()` ;
- des hooks et APIs dédiés à `candidates`, `candidate_experience`, `candidate_education`, `candidate_skills`, `candidate_languages`, `candidate_preferences`, `candidate_saved_offers`, `job_applications`, `notifications` ;
- des appels Supabase via `@/integrations/supabase/client` ;
- une logique métier pour les recommandations d’offres via `aiMatchingService` et l’RPC `match_job_offers_for_candidate`.

Les pages candidat sont chargées de manière asynchrone via `React.lazy` dans `src/App.tsx`.

## 3. Authentification et compte candidat

### 3.1 Inscription

Fichiers vérifiés :
- `src/pages/candidate/CandidateSignupPage.tsx`
- `api/register.ts`
- `src/features/forms/schemas/auth.schemas.ts`
- `src/features/authentication/api/authApi.ts`

Comportement réel :
- le formulaire de création de compte valide : prénom, nom, email, mot de passe, confirmation, acceptation des CGU.
- la validation est faite côté client via `signupSchema` (Zod).
- l’envoi de l’inscription passe par `fetch("/api/register")`.
- le endpoint `/api/register` réalise :
  - création d’un utilisateur Supabase via `/auth/v1/admin/users` avec `SUPABASE_SERVICE_ROLE_KEY` ;
  - insertion dans la table `candidates` avec `user_id`, `first_name`, `last_name`, `email`, `status: "active"` ;
  - génération d’un token de confirmation ;
  - envoi d’un e-mail de confirmation si SMTP est configuré ;
  - réponse HTTP 201 en cas de succès.

Règles observées :
- le mot de passe doit faire au moins 8 caractères côté validation.
- le nom et prénom sont requis.
- l’email doit être valide.
- l’API de création signale une erreur si l’utilisateur existe déjà.

### 3.2 Confirmation d’email

Fichiers vérifiés :
- `src/pages/candidate/CandidateConfirmPage.tsx`
- `api/confirm.ts` (présent dans l’arborescence, mais non lu en profondeur ici car le périmètre principal est le compte candidat ; on note qu’il existe et est utilisé depuis la confirmation email).

Comportement réel :
- après inscription, l’utilisateur est redirigé vers la page de connexion avec un message de confirmation et un e-mail envoyé.
- la page `/candidate/confirm` lit le paramètre `token` et redirige vers `/api/confirm?token=...`.
- si le token est absent ou invalide, l’écran affiche un message d’erreur.

### 3.3 Connexion

Fichiers vérifiés :
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/hooks/useAuth.ts` et `src/features/authentication/context/AuthContext.tsx` (partiellement consultés via le contexte et les effets de route)

Comportement réel :
- le formulaire valide email + mot de passe + rememberMe optionnel.
- `loginCandidate()` appelle `supabase.auth.signInWithPassword({ email, password })`.
- la fonction `assertEmailConfirmed()` vérifie `user.email_confirmed_at !== null`.
- si l’email n’est pas confirmé : l’utilisateur est déconnecté et une erreur spécifique `EMAIL_NOT_CONFIRMED` est levée.
- la page de connexion affiche un bouton de renvoi de confirmation si nécessaire.
- après connexion réussie, le composant redirige automatiquement vers `/candidate/dashboard` lorsque `isAuthenticated` et `rolesResolved` sont vrais.

### 3.4 Mot de passe oublié / réinitialisation

Fichiers vérifiés :
- `src/pages/candidate/CandidateForgotPasswordPage.tsx`
- `src/pages/candidate/CandidateResetPasswordPage.tsx`
- `api/password-reset-request.ts`
- `api/password-reset-validate.ts`
- `api/password-reset-confirm.ts`
- `api/lib/password-reset-utils.ts`

Comportement réel :
- `requestPasswordReset(email)` envoie un POST vers `/api/password-reset-request`.
- l’API cherche le candidat via `/rest/v1/candidates?select=user_id,email&email=eq...` puis construit un token signé HMAC.
- le lien est ensuite envoyé via `/api/send-email` avec un CTA vers `/candidate/reset-password?token=...`.
- la page `CandidateResetPasswordPage` valide le token via `/api/password-reset-validate?token=...` ; si invalide, affiche un écran d’erreur.
- le nouveau mot de passe est soumis à `/api/password-reset-confirm` ; l’API vérifie le token, met à jour le mot de passe dans Supabase `auth/v1/admin/users/{payload.sub}` et envoie éventuellement un mail de confirmation.

Règles observées :
- le mot de passe de reset doit faire au moins 8 caractères.
- la validation du token est faite côté serveur via `verifyPasswordResetToken(...)`.

### 3.5 Déconnexion

Fichiers vérifiés :
- `src/features/authentication/api/authApi.ts`
- `src/features/candidates/hooks/useCandidate.ts`

Comportement réel :
- `logoutCandidate()` appelle `supabase.auth.signOut()` puis `clearAuthStorage()`.
- `useCandidate().logout()` appelle `logoutCandidate()`, puis `logoutContext()`, puis redirige vers `/candidate/login`.

## 4. Protection des routes et gestion de session

Fichiers vérifiés :
- `src/App.tsx`
- `src/features/authentication/context/AuthContext.tsx` (partiellement vérifié)
- `src/components/candidate/ProtectedCandidateRoute.tsx` (localisé, non lu intégralement ici mais référencé comme mécanisme d’accès)

Comportement réel :
- le groupe `/candidate` est enveloppé dans `ProtectedRoute` avec `requiredPermissions={['dashboard.candidate']}`.
- la redirection de fallback est `/candidate/login`.
- les routes internes protégées incluent :
  - `/candidate/dashboard`
  - `/candidate/profile`
  - `/candidate/profile/edit`
  - `/candidate/documents`
  - `/candidate/guides`
  - `/candidate/experience` (redirect vers `/candidate/profile?tab=experience`)
  - `/candidate/education` (redirect vers `/candidate/profile?tab=education`)
  - `/candidate/skills` (redirect vers `/candidate/profile?tab=skills`)
  - `/candidate/languages` (redirect vers `/candidate/profile?tab=languages`)
  - `/candidate/preferences` (redirect vers `/candidate/profile?tab=preferences`)
  - `/candidate/applications`
  - `/candidate/applications/:id`
  - `/candidate/saved-jobs`
  - `/candidate/saved-offers`
  - `/candidate/notifications`
  - `/candidate/account`
  - `/candidate/settings`
  - `/candidate/jobs/:slug/apply`

Route d’entrée :
- `/candidate` redirige vers `/candidate/dashboard`.

## 5. Tableau de bord candidat

Fichiers vérifiés :
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/features/candidates/hooks/useCandidateProfileData.ts`
- `src/features/profile/hooks/useProfileCompletion.ts`
- `src/services/aiMatchingService.ts`

Comportement réel :
- le tableau de bord affiche :
  - message de bienvenue avec prénom,
  - carte de complétude du profil,
  - actions rapides,
  - offres recommandées pour le profil,
  - dernières offres publiées.
- le calcul de complétude des profils est basé sur 10 éléments :
  1. nom complet,
  2. titre professionnel,
  3. localisation,
  4. résumé professionnel,
  5. photo de profil,
  6. expérience professionnelle,
  7. formation,
  8. compétence,
  9. langue,
  10. préférences RH.
- le score de complétude est calculé par `useProfileCompletion()` à partir des données du profil, expériences, formations, compétences, langues et préférences.

### 5.1 Recommandations d’offres

Le dashboard charge des offres recommandées via `getRecommendedJobs()`. La logique vérifiée montre :
- l’utilisation de l’RPC Supabase `match_job_offers_for_candidate` ;
- les paramètres envoyés : `candidate_id`, `match_threshold`, `match_count`, `match_offset` ;
- récupération du `cv_text` du candidat pour debug et validation ;
- fallback local si les scores retournés sont identiques ou absents ;
- calcul via `computeMatchScoreFromText` dans `src/services/matchScoreUtils`.

Il y a également :
- détection automatique de l’absence de CV : si aucun CV ou `cv_text` n’est présent, le dashboard affiche un message invitant à téléverser un CV pour obtenir des recommandations.

### 5.2 Documents du tableau de bord

Le dashboard recharge les documents depuis `localStorage` via la clé :
- `emploiplus-candidate-documents-${profileId}`
- et, en fallback, essaie de récupérer `profile.cv_url` depuis le serveur puis génère un signed URL via `supabase.storage.from(...).createSignedUrl` si nécessaire.

Il écoute aussi un événement `cv-uploaded` pour rafraîchir le dashboard après mise à jour du CV.

## 6. Profil candidat

Fichiers vérifiés :
- `src/features/profile/components/CandidateProfileCenter.tsx`
- `src/features/profile/components/sections/ProfileSection.tsx` (non lu en détail mais potentiellement présent)
- `src/features/candidates/hooks/useCandidate.ts`
- `src/features/candidates/api/profileApi.ts`

Comportement réel :
- le profil candidat est chargé par le hook `useCandidate()` en fonction de `useAuthContext().user.id` ;
- le chargement se fait via `getCandidateProfileByUserId(user.id)` sur la table `candidates` ;
- le profil contient les champs suivants selon les selects du code :
  - `id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `avatar_url`, `bio`, `headline`, `location_city`, `location_country`, `date_of_birth`, `status`, `cv_text`, `embedding_vector`, `cv_url`, `created_at`, `updated_at`.
- `updateCandidateProfile()` n’autorise que des champs strictement filtrés dans `ALLOWED_PROFILE_FIELDS`.
- le composant `CandidateProfileCenter` gère plusieurs sous-onglets :
  - `profile`
  - `experience`
  - `education`
  - `skills`
  - `languages`
  - `preferences`
  - `completion`
  - `documents`
  - `presentation`

### 6.1 Sous-sections du profil

Le profil est réparti entre plusieurs sections, avec des hooks spécifiques :
- `useCandidateExperiences(profile?.id)`
- `useCandidateEducation(profile?.id)`
- `useCandidateSkills(profile?.id)`
- `useCandidateLanguages(profile?.id)`
- `useCandidatePreferences(profile?.id)`
- `useCandidateDocuments(profile?.id)`

Le contexte de navigation de l’onglet est stocké dans l’URL via `useSearchParams()` et `?tab=`.

## 7. Expériences professionnelles

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidateExperiences.ts`
- `src/features/candidates/api/experienceApi.ts` (présent dans l’arborescence ; non entièrement exploité ici)

Comportement réel observé :
- le profil candidat peut stocker plusieurs expériences via la table `candidate_experience`.
- chaque expérience contient au minimum :
  - `candidate_id`
  - `job_title`
  - `company`
  - `start_date`
  - `is_current`
  - `description`
  - `end_date` (nullable)
- le hook permet : création, modification, suppression.
- la section est affichée dans `ExperienceSection` dans le centre de profil.

## 8. Formation / éducation

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidateEducation.ts`
- `src/features/profile/components/sections/EducationSection.tsx`

Comportement réel observé :
- la table `candidate_education` est utilisée.
- chaque enregistrement contient :
  - `candidate_id`, `school`, `degree`, `field_of_study`, `start_date`, `end_date`, `is_current`.
- le hook permet : création, mise à jour, suppression.
- cette section compte dans la complétude du profil.

## 9. Compétences

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidateSkills.ts`
- `src/features/profile/components/sections/SkillsSection.tsx`

Comportement réel observé :
- les compétences du candidat sont stockées dans `candidate_skills`.
- chaque ligne inclut :
  - `candidate_id`, `skill_name`, `proficiency_level`, `created_at`.
- le hook permet d’ajouter et de supprimer une compétence.
- le dashboard et la complétude du profil prennent cette section en compte.

## 10. Langues

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidateLanguages.ts`
- `src/features/profile/components/sections/LanguagesSection.tsx`

Comportement réel observé :
- les langues sont stockées dans `candidate_languages`.
- chaque ligne contient :
  - `candidate_id`, `language_name`, `proficiency_level`.
- le hook permet : création, mise à jour, suppression.
- la section est prise en compte dans la complétude du profil.

## 11. Préférences candidat

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidatePreferences.ts`
- `src/features/profile/components/sections/PreferencesSection.tsx`

Comportement réel observé :
- les préférences sont stockées dans `candidate_preferences`.
- champs attestés :
  - `candidate_id`
  - `contract_types[]`
  - `work_types[]`
  - `salary_min`
  - `salary_max`
  - `seniority_level`
- elles servent à la complétude du profil et sont probablement exploitées pour le matching offre / candidat.

## 12. Documents candidat et CV

Fichiers vérifiés :
- `src/features/candidates/hooks/useCandidateDocuments.ts`
- `src/features/profile/components/sections/DocumentsSection.tsx`
- `src/pages/candidate/CandidateDocumentsPage.tsx`
- `src/services/aiMatchingService.ts`
- `src/features/candidates/api/documentsApi.ts`

Comportement réel observé :
- la gestion des documents côté client repose sur le `localStorage` avec la clé `emploiplus-candidate-documents-${profileId}`.
- le hook retourne :
  - `cv`
  - `documents[]`
  - `setCv`, `setDocuments`
- les types connus pour les documents :
  - `motivation`, `diploma`, `certificate`, `attestation`, `portfolio`, `other`, `recepisse`.
- le CV peut être téléversé via `DocumentsSection` ; l’interface affiche un bouton d’ajout de document et de CV.
- l’upload CV déclenche une extraction textuelle à partir d’un PDF via `extractTextFromPdfData` / `processCandidateCvUpload`.
- le texte du CV est ensuite stocké dans `candidates.cv_text` et un embedding léger est calculé dans `embedding_vector`.
- le `cv_url` peut aussi être enregistré dans le profil pour restaurer le document après rechargement / login.
- le dashboard observe l’événement `cv-uploaded` pour recharger les données immédiatement.

### 12.1 Extraction PDF

Le code vérifie :
- `extractTextFromPdf(file)` vérifie le type PDF ;
- `extractTextFromPdfData(arrayBuffer)` utilise `pdfjs-dist` ;
- si la librairie manque, une erreur explicite est levée : "pdfjs-dist is required ...".

### 12.2 Restauration côté client

Le hook `useCandidateDocuments` restaure des données depuis le `localStorage` uniquement si `profileId` est présent.

## 13. Candidatures

Fichiers vérifiés :
- `src/features/candidates/api/applicationsApi.ts`
- `src/features/candidates/hooks/useCandidateApplications.ts`
- `src/pages/candidate/CandidateApplicationsPage.tsx`
- `src/pages/candidate/CandidateApplicationDetailPage.tsx` (présent dans l’arborescence, non lu intégralement ici)

Comportement réel observé :
- les candidatures sont stockées dans la table `job_applications`.
- le select récupère :
  - `id`, `status`, `cover_letter`, `applied_at`, `updated_at`,
  - `job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)`.
- le hook `useCandidateApplications()` charge les candidatures du candidat connecté.
- `applyToJob(candidateId, jobOfferId, coverLetter?, subject?)` fait un `upsert` avec conflit sur `candidate_id` + `job_offer_id` et met `status: "submitted"`.
- `withdrawApplication(applicationId)` met à jour `status: "withdrawn"`.

Important :
- la page `CandidateApplicationsPage` affiche un message explicite : "Fonctionnalité bientôt disponible" lorsque `applications.length === 0`.
- La logique de table est présente, mais le message de fallback montre que la section n’est pas pleinement active selon l’état de données ou l’état du produit.

Les statuts connus visibles dans le code :
- `submitted`
- `reviewed`
- `shortlisted`
- `rejected`
- `accepted`
- `withdrawn`

Traductions d’interface :
- `submitted` => "Envoyée"
- `reviewed` => "Examinée"
- `shortlisted` => "Pré-sélectionnée"
- `rejected` => "Rejetée"
- `accepted` => "Acceptée"
- `withdrawn` => "Retirée"

## 14. Offres enregistrées / favoris

Fichiers vérifiés :
- `src/pages/candidate/CandidateSavedOffersPage.tsx`
- `src/features/candidates/hooks/useCandidateSavedOffers.ts` (présent mais non lu en détail)
- `src/integrations/supabase/types.ts` contient `candidate_saved_offers`

Comportement réel observé :
- la route `/candidate/saved-jobs` et `/candidate/saved-offers` existe.
- la page de sauvegarde affiche actuellement un écran "Fonctionnalite bientot disponible".
- la table `candidate_saved_offers` est bien identifiée, mais la page n’implémente pas encore de liste réelle à partir de cette table.

## 15. Notifications

Fichiers vérifiés :
- `src/pages/candidate/CandidateNotificationsPage.tsx`
- `src/hooks/useNotifications.ts`
- `src/integrations/supabase/notifications.ts`
- `src/integrations/supabase/types.ts`

Comportement réel observé :
- `useNotifications()` charge les notifications de l’utilisateur connecté via `supabase.auth.getUser()` puis `fetchNotifications()`.
- les notifications visibles dans le code peuvent être filtrées avec :
  - `notif.status === "active"`
  - `notif.user_id === null || notif.user_id === user.id`
- la liste expose :
  - `markAsRead(notificationId)`
  - `markAllAsRead()`
  - `deleteNotification(notificationId)`
- les notifications sont souscrites en temps réel via Supabase Realtime et le channel `notifications-updates`.
- le type de notification est mappé graphiquement :
  - `candidature`, `offre`, `evenement`, `job`, `contact`, `blog`, `admin`.

Les colonnes de table observées dans les types :
- `id`, `title`, `body`, `type`, `status`, `link`, `is_read`, `read_at`, `created_at`, `user_id`.

## 16. Paramètres du compte

Fichiers vérifiés :
- `src/pages/candidate/CandidateSettingsPage.tsx`
- `src/features/candidates/components/settings/SecuritySettingsCard.tsx`
- `src/features/candidates/components/settings/AccountSettingsCard.tsx`
- `src/features/authentication/api/authApi.ts`

Comportement réel observé :
- la page `CandidateSettingsPage` affiche deux cartes :
  - `SecuritySettingsCard` : modification du mot de passe,
  - `AccountSettingsCard` : suppression du compte.
- `changeCandidatePassword` est un alias de `updatePassword`.
- la modification de mot de passe exige :
  - longueur minimale confirmée côté UI,
  - confirmation identique.
- la suppression du compte appelle `deleteCandidateProfile(profile.id)` puis déconnecte l’utilisateur ; la redirection va vers `/` après succès.

Important :
- la suppression du compte est bien présente dans l’interface, mais elle dépend d’une opération de suppression de `candidates` côté Supabase ; les garanties exactes de cascade / contraintes de base ne sont pas décrites dans le code auditée ici.

## 17. Données Supabase et tables identifiées

Les tables et relations suivant les fichiers et types vérifiés :

### 17.1 `candidates`
Champs vérifiés :
- `id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `avatar_url`, `bio`, `headline`, `location_city`, `location_country`, `date_of_birth`, `status`, `cv_text`, `embedding_vector`, `cv_url`, `created_at`, `updated_at`.

Usage principal :
- profil candidat ;
- support du matching par CV ;
- lien avec le compte auth Supabase par `user_id`.

### 17.2 `candidate_experience`
- utilisé pour stocker l’historique professionnel.

### 17.3 `candidate_education`
- utilisé pour stocker les formations.

### 17.4 `candidate_skills`
- utilisé pour stocker les compétences.

### 17.5 `candidate_languages`
- utilisé pour stocker les langues.

### 17.6 `candidate_preferences`
- utilisé pour stocker les préférences RH.

### 17.7 `candidate_saved_offers`
- table identifiée, mais non pleinement utilisée par l’interface active observée.

### 17.8 `job_applications`
- table identifiée pour l’enregistrement des candidatures.
- colonnes vérifiées : `candidate_id`, `job_offer_id`, `status`, `cover_letter`, `subject`, `applied_at`, `updated_at`.

### 17.9 `notifications`
- table identifiée avec `status`, `type`, `title`, `body`, `link`, `is_read`, `read_at`, `user_id`.

### 17.10 `job_offers`
- table utilisée pour les offres recommandées et les dernières offres publiées.
- le dashboard et `aiMatchingService` lisent les offres publiées et les données de matching.

## 18. Rôle de Supabase dans le compte candidat

Le code montre un modèle où Supabase joue trois rôles :
1. Authentification : `auth` de Supabase ;
2. Base de données relationnelle : tables candidates, job_applications, notifications, etc. ;
3. Stockage de fichiers : CV / documents dans un bucket de stockage et signed URLs.

Le code fait aussi usage de `SERVICE_ROLE_KEY` pour :
- créer les utilisateurs dans `/api/register` ;
- mettre à jour les mots de passe en reset ;
- lire / écrire des données côté serveur sans dépendre d’un utilisateur front.

Le code contient également des mécanismes de sécurité et de filtrage côté client, mais les politiques RLS exactes ne sont pas décrites dans les fichiers lus pour cet audit. Pour cette raison :
- "Non déterminé dans le code" pour les règles RLS détaillées et les politiques exactes de table.

## 19. Responsive / UX observée

Le compte candidat suit un design fondé sur :
- sidebar desktop / drawer mobile ;
- `CandidateMobileHeader`, `CandidateSidebar`, `CandidateTopbar` ;
- `CandidateAppShell` et `CandidateLayout` ;
- `CandidateDashboardPage` adapts `isMobileApp()` conditionnellement.

Comportement observé :
- sur desktop, le layout est en colonnes avec sidebar + contenu.
- sur mobile, une version plus compacte est rendue avec header mobile.
- certaines pages bénéficient d’une version tableau et d’une version cartes mobile (`CandidateApplicationsPage`).

La logique de navbar/sidebar est présente, mais la précision exacte du comportement mobile native n’est pas définie dans ce dépôt comme une app native distincte ; il s’agit ici d’une adaptation web responsive/embedded.

## 20. Règles métier et comportements observés

Règles réellement présentes dans le code :
- un candidat ne peut accéder au compte que s’il est authentifié et porte la permission `dashboard.candidate` ;
- l’email doit être confirmé pour se connecter ;
- le CV est un facteur central pour les recommandations d’offres ;
- la complétude du profil est calculée automatiquement à partir de sections du profil ;
- les offres recommandées s’appuient sur une logique de matching textuel + embedding ;
- les candidatures peuvent être déposées sous forme d’upsert sur `candidate_id + job_offer_id` ;
- le statut est suivable et modifiable (`submitted`, `withdrawn`, etc.) ;
- les notifications peuvent être marquées comme lues et supprimées.

## 21. Points d’attention / “Non déterminé dans le code”

Les éléments suivants ne sont pas identifiables avec certitude dans le code auditée :
- les politiques RLS exactes de chaque table Supabase ;
- la logique de validation métier complète côté base de données en dehors des validations du front et des endpoints API ;
- le périmètre exact du “mobile native” futur au niveau des API internes et de la synchronisation offline ;
- les règles de suppression en cascade du profil / compte lors de la suppression d’un compte candidat ;
- le comportement exact de toutes les notifications automatiques backend outside the code path currently in use.

Dans ces cas, l’étiquette utilisée est :
- “Non déterminé dans le code”.

## 22. Synthèse fonctionnelle

Le compte candidat actuel du site EmploiPlus Group repose sur :
- une authentification Supabase avec validation d’email ;
- des routes protégées par permission ;
- une gestion de profil structurée par table `candidates` et sous-sections ;
- des documents et un CV qui alimentent le matching de jobs ;
- un tableau de bord orienté “profil + recommandations + offres” ;
- une gestion partielle des candidatures et notifications ;
- une gestion des paramètres de sécurité et du compte.

Le code montre une architecture fonctionnelle réaliste et cohérente, mais aussi des sections incomplètes ou encore “bientôt disponible” sur l’interface (notamment certaines pages d’offres enregistrées et certaines sections de candidatures si aucun historique n’existe). L’implémentation actuelle est donc un compte candidat partiellement complet, centré sur les profils, le CV et les recommandations d’emploi, avec certaines fonctions de gestion encore inachevées ou conditionnées au contenu des données.

## 23. Fichiers source majeurs consultés

- `src/App.tsx`
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/pages/candidate/CandidateSignupPage.tsx`
- `src/pages/candidate/CandidateForgotPasswordPage.tsx`
- `src/pages/candidate/CandidateResetPasswordPage.tsx`
- `src/pages/candidate/CandidateConfirmPage.tsx`
- `src/pages/candidate/CandidateDashboardPage.tsx`
- `src/pages/candidate/CandidateProfilePage.tsx`
- `src/pages/candidate/CandidateDocumentsPage.tsx`
- `src/pages/candidate/CandidateApplicationsPage.tsx`
- `src/pages/candidate/CandidateSavedOffersPage.tsx`
- `src/pages/candidate/CandidateNotificationsPage.tsx`
- `src/pages/candidate/CandidateSettingsPage.tsx`
- `src/pages/candidate/CandidateLayout.tsx`
- `src/features/candidates/hooks/useCandidate.ts`
- `src/features/candidates/api/profileApi.ts`
- `src/features/candidates/api/applicationsApi.ts`
- `src/features/candidates/hooks/useCandidateDocuments.ts`
- `src/features/candidates/hooks/useCandidateApplications.ts`
- `src/features/authentication/api/authApi.ts`
- `src/features/forms/schemas/auth.schemas.ts`
- `src/services/aiMatchingService.ts`
- `src/integrations/supabase/types.ts`
- `api/register.ts`
- `api/password-reset-request.ts`
- `api/password-reset-confirm.ts`
- `api/password-reset-validate.ts`

## 24. Conclusion

L’architecture du compte candidat est bien identifiable et cohérente avec le site web actuel. Le cœur du produit est le profil candidat connecté, le CV, le matching emplois, les candidatures, les notifications et les paramètres d’accès. Les points encore non réellement achevés ou non activés dans l’interface doivent être considérés comme “fonctionnalités partielles / non finalisées”, pas comme des absences de données ou de code.

Ce document doit servir comme base de référence avant toute adaptation mobile native ou refonte du compte candidat.
