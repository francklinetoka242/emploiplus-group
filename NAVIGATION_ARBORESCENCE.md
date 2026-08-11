# Navigation et Arborescence du site

## 1. Routes / pages du site

### Public
- `/`
- `/about`
- `/services`
- `/services/hub-candidat-intelligent`
- `/services/solutions-entreprises-bpo`
- `/services/:slug`
- `/services/hub-emploi-recrutement/landing`
- `/jobs`
- `/jobs/:slug`
- `/blog`
- `/blog/:slug`
- `/faq`
- `/contact`
- `/politique-de-confidentialite`
- `/mentions-legales`
- `/cgu`
- `/auth`

### Candidate
- `/candidate/login`
- `/candidate/signup`
- `/candidate/forgot-password`
- `/candidate/reset-password`
- `/candidate/confirm`
- `/candidate`
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

### Admin
- `/admin`
- `/admin/jobs`
- `/admin/jobs/new`
- `/admin/blog`
- `/admin/blog/new`
- `/admin/candidates`
- `/admin/guides`
- `/admin/notifications`
- `/admin/seo`
- `/admin/privacy`
- `/admin/legal`
- `/admin/cgu`
- `/admin/team`
- `/admin/faq`

### Autres
- `*` (catch-all `NotFoundPage`)

## 2. Structure exacte du Header actuel

Fichier : `src/components/site/Header.tsx`

### Composition du Header
- Logo / home link
  - `Link` vers `/`
  - image `src="/Logo.png"` et texte du site "EmploiPlus Group"
- Navigation principale (desktop)
  - `NavLink` vers `/` avec label `t("nav.home")`
  - `NavLink` vers `/services` avec label `t("nav.services")`
  - `NavLink` vers `/jobs` avec label `t("nav.jobs")`
  - `NavLink` vers `/blog` avec label `t("nav.blog")`
  - `NavLink` vers `/about` avec label `t("nav.about")`
  - `NavLink` vers `/contact` avec label `t("nav.contact")`
  - `NavLink` vers `/faq` avec label `t("nav.faq")`
- Actions utilisateur / CTA
  - `Button` vers `/candidate/login` intitulé "Se connecter" (affiché si utilisateur non connecté)
  - `Button` vers `/candidate/signup` intitulé "Créer un compte" (affiché si utilisateur non connecté)
- Sélecteur de langue
  - `Select` avec icône `Globe`
  - valeurs disponibles : `fr`, `en`, `ln`
  - contenu du menu : `t("lang.fr")`, `t("lang.en")`, `t("lang.ln")`
- Mobile menu toggle
  - bouton hamburger `Menu` / `X`
  - affiche un menu mobile contenant les mêmes liens que la navigation principale
  - inclut aussi les boutons `Se connecter` et `Créer un compte` quand l’utilisateur n’est pas connecté

### Comportement
- Le Header est fixe en haut (`sticky top-0`) et change de style au scroll
- Le mobile menu est visible uniquement en dessous de la taille `lg`
- Aucun menu déroulant multi-niveaux n’est présent dans ce Header

## 3. Structure exacte du Footer actuel

Fichier : `src/components/site/Footer.tsx`

### Composition du Footer
- Bloc logo et présentation
  - logo `src="/Logo.png"`
  - titre `EmploiPlus-Group`
  - description : `t("footer.tagline")`
- Bloc Services
  - lien vers `/services`
  - lien vers `/jobs`
  - lien vers `/blog`
- Bloc Company / Informations
  - lien vers `/about`
  - lien vers `/contact`
  - lien vers `/politique-de-confidentialite`
  - lien vers `/mentions-legales`
  - lien vers `/cgu`
  - bouton `Gestion des cookies` appelant `openCookieBanner()`
- Bloc Contact / réseaux sociaux
  - lien téléphonique `tel:+242067311033`
  - deux liens WhatsApp externes
  - icônes / liens vers Facebook et LinkedIn
- Bas de page
  - texte de copyright `© {year} EmploiPlus Group. {t("footer.rights")}`
  - slogan `t("footer.tagline")`

### Comportement
- Footer affiché sur tous les chemins publics via `PublicLayout`
- Footer masqué sur `/auth`

## 4. Fichiers composants responsables

- Routes et arborescence principale : `src/App.tsx`
- Layout public général : `src/components/site/PublicLayout.tsx`
- Header principal du site : `src/components/site/Header.tsx`
- Footer principal du site : `src/components/site/Footer.tsx`
- Page d’authentification spécialisée : `src/pages/public/AuthPage.tsx`
- Candidate layout (protection de routes candidates) : `src/pages/candidate/CandidateLayout.tsx`
- Candidate pages : `src/pages/candidate/*.tsx`
- Admin pages : `src/pages/admin/*.tsx`
- Pages publiques principales : `src/pages/public/*.tsx`

## 5. Remarques complémentaires

- La navigation principale du Header ne contient pas de sous-menus déroulants complexes ; elle est composée d’un lien par page.
- Le Header affiche un menu mobile séparé contenant les mêmes liens et boutons d’action.
- Les routes candidates et admin sont protégées par `ProtectedRoute` dans `src/App.tsx`.
