# Récapitulatif des routes pour l’application mobile

## 1. Actions de la barre mobile

1. **Bouton 1 — Sidebar / Menu**
   - Mécanisme : il n’existe pas d’URL dédiée.
   - Le menu candidat s’ouvre via le contexte `CandidateSidebarContext` utilisé dans `src/pages/candidate/CandidateLayout.tsx`.
   - Composants concernés :
     - `CandidateMobileHeader` appelant `onMenuOpen()`
     - `CandidateSidebar` affiché en mode drawer lorsque `open` est `true`
   - Conclusion : pour la WebView React Native, il faut déclencher l’action d’ouverture du drawer plutôt que naviguer sur une URL.

2. **Bouton 2 — Tableau de bord**
   - URL exacte : `/candidate/dashboard`
   - Note : la route `/candidate` redirige vers `/candidate/dashboard`.

3. **Bouton 3 — Emplois (par défaut)**
   - URL exacte : `/jobs`
   - Note : pour une page détail, les routes sont de type `/jobs/:slug`.

4. **Bouton 4 — Profil**
   - URL exacte : `/candidate/profile`

5. **Bouton 5 — Déconnexion**
   - Il n’y a pas d’URL de déconnexion dédiée.
   - Fonction déclenchée : `logoutCandidate()` dans `src/features/authentication/api/authApi.ts`
   - Flux de sortie : `useCandidate().logout()` dans `src/hooks/useCandidate.ts`, puis `AuthContext.logout()` et navigation vers `/candidate/login`.
   - Conclusion : la WebView doit appeler l’action de logout, puis le client web redirige vers `/candidate/login`.

## 2. URLs autorisées pour l’application mobile

L’application mobile doit accepter les URLs suivantes :

- `/jobs`
- `/jobs/:slug`

- `/candidate`
- `/candidate/login`
- `/candidate/signup`
- `/candidate/forgot-password`
- `/candidate/reset-password`
- `/candidate/confirm`
- `/candidate/dashboard`
- `/candidate/public`
- `/candidate/public/services`
- `/candidate/public/jobs`
- `/candidate/public/blog`
- `/candidate/public/about`
- `/candidate/public/contact`
- `/candidate/profile`
- `/candidate/profile/edit`
- `/candidate/documents`
- `/candidate/guides`
- `/candidate/creation` (redirect vers `/candidate/documents`)
- `/candidate/creation-motivation`
- `/candidate/experience` (redirect vers `/candidate/profile?tab=experience`)
- `/candidate/education` (redirect vers `/candidate/profile?tab=education`)
- `/candidate/skills` (redirect vers `/candidate/profile?tab=skills`)
- `/candidate/languages` (redirect vers `/candidate/profile?tab=languages`)
- `/candidate/preferences` (redirect vers `/candidate/profile?tab=preferences`)
- `/candidate/applications`
- `/candidate/applications/:id`
- `/candidate/saved-offers`
- `/candidate/notifications`
- `/candidate/settings`
- `/candidate/jobs/:slug/apply`

## 3. Résumé du filtrage mobile dans le code

Dans `src/App.tsx`, le client mobile vérifie que le `pathname` est :

- exactement `/jobs`, ou
- commence par `/jobs/`, ou
- exactement `/candidate`, ou
- commence par `/candidate/`

Tout autre chemin mobile est redirigé vers `/jobs`.

---

### Points importants pour l’intégration React Native

- Le bouton menu ne passe pas par une route. Il active le drawer candidat (`CandidateSidebar`).
- Le bouton déconnexion appelle une fonction de logout ; la redirection finale est `/candidate/login`.
- Les routes `/jobs` et `/candidate/*` sont les seules autorisées en mode mobile.
