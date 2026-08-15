# Audit Sidebar compte candidat — Web EmploiPlus

## 1. Localisation et rendu
- Fichiers du Sidebar candidat :
  - src/components/candidate/CandidateSidebar.tsx
  - src/pages/candidate/CandidateLayout.tsx
  - src/contexts/CandidateSidebarContext.tsx
  - src/App.tsx
- Composant principal : CandidateSidebar
- Parent layout : CandidateLayout > CandidateAppShell
- Affichage/masquage : `open` boolean du contexte CandidateSidebarContext, persistant dans localStorage sous `candidateSidebarOpen` ; desktop : largeur 288px ou 80px ; mobile : panneau latéral slide-in `translate-x-0` / `-translate-x-full`.
- Responsive :
  - mobile : drawer fixed + overlay ; bouton hamburger dans CandidateMobileHeader ; `isDrawer={true}`.
  - desktop/tablette : sidebar fixe, large et accolée au contenu ; `isDrawer={false}` ; contenu principal décalé via `md:ml-72` ou `md:ml-20`.
- État actif/inactif : `isActive(href)` compare `location.pathname === href || pathname.startsWith(href + "/")` ; style highlight via `bg-secondary text-white`.
- Sous-menus : section publique collapsible dans le drawer mobile (`publicMenuItems` + `publicNavExpanded`). Pas de sous-menu dans le sidebar candidat principal.
- Badges/compteurs : aucun badge dans le Sidebar lui-même ; les notifications sont dans le header via NotificationsDropdown, avec `unreadCount` et petit rond rouge.

## 2. Éléments visibles dans le Sidebar (ordre d’affichage)
### Desktop / tableau
1. Tableau de bord — Home — /candidate/dashboard — page CandidateDashboardPage — navigation — affiché si connecté — aucun badge — clic : navigate.
2. Mon profil — User — /candidate/profile — CandidateProfilePage — navigation — affiché si connecté — aucun badge — clic : open profile center with tabs.
3. Documents — PlusCircle — /candidate/documents — CandidateDocumentsPage — navigation — affiché si connecté — aucun badge — clic : page documents.
4. Fiches — BookOpen — /candidate/guides — CandidateLocalGuidesPage — navigation — affiché si connecté — aucun badge — clic : page guides.
5. Mes candidatures — Send — /candidate/applications — CandidateApplicationsPage — navigation — affiché si connecté — aucun badge — clic : liste candidatures.
6. Offres enregistrées — Heart — /candidate/saved-jobs — CandidateSavedOffersPage — navigation — affiché si connecté — aucun badge — clic : page offres sauvegardées.
7. Notifications — Bell — /candidate/notifications — CandidateNotificationsPage — navigation — affiché si connecté — badge via header dropdown, pas dans sidebar — clic : page notifications.
8. Compte — User — /candidate/account — CandidateSettingsPage — navigation — affiché si connecté — aucun badge — clic : paramètres compte.
9. Économie de données (Mo) — switch UI — non route — action toggle — toujours visible en bas du desktop / mobile drawer — `EcoModeToggle` — clic : toggle `isEcoMode`.
10. Déconnexion — LogOut — aucune route — action — toujours visible en bas — appelle `onLogout` -> logout hook — déclenche redirection vers /candidate/login.

### Mobile drawer
- Bloc “Navigation publique” (visible seulement si !mobileApp) : Accueil, Services, Emplois, Blog, FAQ, À propos, Contact.
- Bloc “Mon espace” : mêmes 8 éléments candidat, dans le même ordre.
- Puis toggle “Mode sombre” + EcoModeToggle + Déconnexion.

## 3. Pages et routes
- /candidate — protected root ; App.tsx protège route avec `ProtectedRoute fallbackPath="/candidate/login" requiredPermissions={["dashboard.candidate"]}`.
- /candidate/dashboard -> CandidateDashboardPage ; tableau de bord ; sections : KPI/quick actions, recommandations, offres publiées, profil completion, documents CV.
- /candidate/profile -> CandidateProfilePage ; page wrapper sur CandidateProfileCenter ; onglets : profile, presentation, experience, education, skills, languages, preferences, documents, completion.
- /candidate/documents -> CandidateDocumentsPage ; gestion CV + documents candidats.
- /candidate/guides -> CandidateLocalGuidesPage ; fiches de conseils / guides.
- /candidate/applications -> CandidateApplicationsPage ; liste candidatures + retrait.
- /candidate/saved-jobs ; alias /candidate/saved-offers -> CandidateSavedOffersPage ; actuellement page “fonctionnalité bientôt disponible”.
- /candidate/notifications -> CandidateNotificationsPage ; liste notifications + marquer comme lu / supprimer.
- /candidate/account ; alias /candidate/settings -> CandidateSettingsPage ; page settings ; cartes security + account.
- /candidate/jobs/:slug/apply -> CandidateJobApplyPage ; route présente mais pas dans sidebar ; candidat peut y accéder via offre.
- Redirects : /candidate/creation -> /candidate/documents ; /candidate/experience -> /candidate/profile?tab=experience ; /candidate/education -> /candidate/profile?tab=education ; /candidate/skills -> /candidate/profile?tab=skills ; /candidate/languages -> /candidate/profile?tab=languages ; /candidate/preferences -> /candidate/profile?tab=preferences.

## 4. Logique métier et données
- Identité du candidat : `useCandidate()` lit `useAuthContext()`, récupère `user.id` et appelle `getCandidateProfileByUserId(user.id)` dans src/features/candidates/api/profileApi.ts.
- Requête réelle : `supabase.from("candidates").select(...).eq("user_id", userId).maybeSingle()`.
- Données candidates chargées : id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at.
- Authentification : root `/candidate` sous ProtectedRoute + permission `dashboard.candidate`; fallback `/candidate/login`.
- `logout` : useCandidate -> `logoutCandidate()` dans src/features/authentication/api/authApi.ts -> `supabase.auth.signOut()` + `clearAuthStorage()` + `navigate("/candidate/login")`.
- `updateProfile` : useCandidate -> updateCandidateProfile(profile.id, updates) -> Supabase `candidates.update(...)`.
- `CandidateProfileCenter` charge beaucoup de données dépendantes ; par ex. `useCandidateExperiences(profile?.id)`, `useCandidateEducation(profile?.id)`, `useCandidateSkills(profile?.id)`, `useCandidateLanguages(profile?.id)`, `useCandidatePreferences(profile?.id)`, `useCandidateDocuments(profile?.id)`.
- `CandidateApplicationsPage` charge `useCandidateApplications()` ; cette hook appelle `getCandidateApplications(candidateId)` dans src/features/candidates/api/applicationsApi.ts : `supabase.from("job_applications").select("id,status,cover_letter,applied_at,... job_offers:job_offer_id(...) ").eq("candidate_id", candidateId)`.
- `CandidateSavedOffersPage` : page non fonctionnelle ; ne charge pas de table Supabase dans le code actuel.
- `CandidateNotificationsPage` : `useNotifications()` -> `fetchNotifications()` dans src/integrations/supabase/notifications.ts ; charge table `notifications` ; filter : `status === "active"` et `(user_id === null || user_id === user.id)`.
- `CandidateDocumentsPage` : charge `useCandidateDocuments(profile?.id)`, stocke en localStorage `emploiplus-candidate-documents-${profileId}` ; pas de table réelle côté code pour CV/documents du sidebar lui-même.

## 5. Profil et données candidat utilisées
- Nom / prénom / email / téléphone / avatar / headline : candidates table, via useCandidate + getCandidateProfileByUserId.
- CV / documents : localStorage key `emploiplus-candidate-documents-${profileId}` dans useCandidateDocuments ; profile.cv_url vient de table candidates ; fichiers réels peuvent venir du bucket storage (usage dans dashboard et documents page).
- Expériences / formations / compétences / langues / préférences : tables spécifiques via hooks API dédiés, par ex. experiencesApi, educationApi, skillsApi, languagesApi, preferencesApi.
- Candidatures : table job_applications, via applicationsApi.
- Notifications : table notifications, via notifications.ts + useNotifications.
- autres : location_city, location_country, bio, date_of_birth, status.

## 6. Notifications et compteurs
- `NotificationsDropdown` affiche le badge rouge si `unreadCount > 0` ; nombre calculé dans useNotifications à partir de `notificationState.notifications.filter(n => !n.is_read).length`.
- `CandidateNotificationsPage` affiche `Vous avez X notification(s) non lue(s)` et `Marquer tout comme lu`.
- `markAllAsRead` : `supabase.from("notifications").update({ is_read: true, read_at: now }).in("id", unreadIds)`.
- `markAsRead` : `update ... eq("id", notificationId)`.
- `deleteNotification` : `delete from notifications where id = ...`.
- Aucune notification/compteur spécifique dans le Sidebar lui-même ; le compteur est dans le header, pas dans le menu vertical.

## 7. Déconnexion
- Bouton Déconnexion dans Sidebar desktop/mobile + header dropdown.
- Exécution : `onLogout` provient de `useCandidate().logout`.
- `logoutCandidate()` : `supabase.auth.signOut()` + `clearAuthStorage()`.
- `logout` hook : `await logoutCandidate(); await logoutContext(); setProfile(null); navigate("/candidate/login");`.
- Redirection : /candidate/login après logout.

## 8. Responsive
- Desktop/tablette : `CandidateSidebar` fixed left; `CandidateAppShell` ajoute `md:ml-72` ou `md:ml-20` sur le main ; `CandidateTopbar` visible md:flex.
- Mobile web : `CandidateMobileHeader` visible `md:hidden`, avec hamburger ; `CandidateSidebar` en drawer fixed à gauche ; overlay `bg-black/50` ; bouton close X.
- `publicNavExpanded` : sous-section public uniquement dans le drawer mobile ; sous-menu accordéon.

## 9. Spécification mobile
- Menu candidat reproduire dans l’ordre : Tableau de bord, Mon profil, Documents, Fiches, Mes candidatures, Offres enregistrées, Notifications, Compte.
- Libellés exacts : idem FR, icônes cohérentes (Home, User, PlusCircle, BookOpen, Send, Heart, Bell, User).
- Routes correspondantes : /candidate/dashboard, /candidate/profile, /candidate/documents, /candidate/guides, /candidate/applications, /candidate/saved-jobs, /candidate/notifications, /candidate/account.
- Logique : authentification obligatoire via session utilisateur ; route racine protégée ; menu actif selon pathname.
- Données nécessaires : session/user_id, candidat profile, notifications unreadCount, avatar, prénom/nom/email, documents CV, candidatures, préférences/profile completion.
- Requêtes/services nécessaires : getSession/getUser, getCandidateProfileByUserId, getCandidateApplications, fetchNotifications, updateNotification/markAllAsRead, logoutCandidate.
- États : chargement, vide, erreur, actif/inactif, mode sombre/eco mode facultatif.
- Badges : rouge à l’icône notifications avec unreadCount.
- Actions : navigation, ouvrir drawer, toggle eco mode, logout, marquer notification lue, supprimer notification.
- Ne pas embarquer le site web dans une WebView ; créer les écrans natifs avec les mêmes routes, libellés et comportements.
