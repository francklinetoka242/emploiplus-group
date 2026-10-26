# Analyse de la page d’accueil visiteur et de son hero

## 1. Structure de la page d’accueil
- Route `/` : `src/App.tsx` → `HomePage` (`src/pages/public/HomePage.tsx`) sous `SharedPublicRouteShell` ; visiteur non candidat : `PublicLayout` (`src/components/site/PublicLayout.tsx`).
- Ordre dans `HomePage` : hero, statistiques, actualités, bloc candidat, bloc entreprise, partenaires, présentation recrutement, bandeau consultation/devis. `SiteFooter` suit dans `PublicLayout`.
- Aucun bloc « offres à la une » rendu : `usePublishedJobOffers(2)` alimente `homeJobs` et `jobsLoading`, inutilisés dans le JSX.

| Section | Composant / fichier | Rôle | Données |
|---|---|---|---|
| Hero | `HeroSection` / `HomePage.tsx` | Promesse et CTA | i18n, image locale |
| Statistiques | JSX `motion.section` / `HomePage.tsx` | 3 chiffres | Valeurs codées en dur, libellés i18n |
| Actualités | JSX / `HomePage.tsx` | Jusqu’à 3 articles | Supabase, `usePublishedBlogPosts(3)` |
| Candidat, entreprise | `services.map` / `HomePage.tsx` | Présentation des offres de service | Contenu codé en dur |
| Partenaires | JSX / `HomePage.tsx` | Logo partenaire | Asset statique Monago |
| Recrutement, consultation | JSX / `HomePage.tsx` | Présentation et CTA contact | Contenu et image statiques |
- Hero : textes lus via `useI18n()` dans `src/i18n/translations.ts` : `home.hero.title`, `.subtitle`, `.cta.jobs`, `.cta.services`. Pas de texte du hero en base.
- « Emploiplus Group » (casse différente) apparaît dans `src/i18n/translations.ts:81,261`. `index.html:10` emploie « Emploi+ » dans la description initiale.

## 2. Hero actuel en détail
- Composant local `HeroSection` dans `src/pages/public/HomePage.tsx`; pas de sous-composant distinct. Branche Eco Mode séparée.
- Image `src/assets/home/home-hero-background.webp` : WebP, 3763 × 2100 px, 788 738 octets (~770 Kio). Même asset en `backgroundImage` CSS inline et en `<img>` absolu.
- `<img>` : `alt=""`, `aria-hidden="true"`, `loading="eager"`, `fetchPriority="high"`, `decoding="async"`. Pas de `srcset`, `sizes`, `width` ou `height`; `object-cover`, centrage via `bg-center`. Version mobile distincte : Non trouvé.
- Overlays successifs, dans le JSX : `bg-[linear-gradient(180deg,rgba(2,6,23,0.65),rgba(2,6,23,0.9))]` puis `bg-black/40`. Opacité noire combinée approximative : 79 % en haut à 94 % en bas. Image assombrie à elle seule : Non trouvé.
- Section : `relative overflow-hidden`, `min-h-[480px] md:min-h-[560px] bg-cover bg-center bg-no-repeat`; variante `/candidate/public` : `lg:min-h-[420px]`. Conteneur `container-page py-20 md:py-28` (variante candidate `lg:py-12`), grille `items-center`, texte secondaire `max-w-2xl`.
- H1 : `mt-20 md:mt-24`, `text-3xl md:text-4xl`; variante candidate `lg:mt-8`. Le hero n’a pas de hauteur fixe ni d’alignement vertical centré du contenu.
- Titre : « Construisons votre avenir professionnel. » (`home.hero.title`). Paragraphe : « Emploiplus Group est une entreprise spécialisée dans les services d'employabilité, Externalisation, et la gestion déléguée des ressources humaines basée en Afrique centrale. » (`home.hero.subtitle`).
- « Voir les offres » → `Link to="/jobs"`; bouton `Button` `size="lg"` et styles brand. « Nos services » est un bouton déclencheur de menu, pas un lien direct; `SERVICE_NAV_LINKS` cible `/services/mise-disposition-rh`, `/services/recrutement`, `/services/externalisation`, `/services/conseil-formation`.
- Aucune logique de connexion dans le hero. En Eco Mode, image, overlays et deux CTA sont absents; titre/paragraphe seuls restent.

## 3. En-tête visiteur (header public)
- `SiteHeader`, `src/components/site/Header.tsx`; hauteur `h-16` (64 px), `sticky top-0 z-50`, pas `fixed`. À `scrollY > 8`, `bg-background/85 backdrop-blur-md border-b border-border shadow-soft`; sinon `bg-transparent`.
- Le header reste dans le flux et précède le hero : il ne le recouvre pas. Le hero commence sous ses 64 px.
- Navigation i18n (`nav.home`, `.services`, `.jobs`, `.blog`, `.about`, `.faq`); menu mobile `lg:hidden`, menu Services déroulant. Connexion « connexion » (minuscule) → `/candidate/login`, variante `outline`; « S'inscrire » → `/candidate/signup`, bouton principal. Libellés codés en dur.
- Ces boutons sont affichés si `!loading && !profile`, donc la condition observe le profil candidat, pas directement l’état authentifié.
- Route publique partagée : `SharedPublicRouteShell` (`src/App.tsx`) rend `CandidateLayout` et son `CandidateTopbar` à la place de `PublicLayout` pour un candidat connecté. `HomePage` est également réutilisée sous `/candidate/public`.

## 4. SEO et titre de page
- `HomePage` passe `DEFAULT_SEO` à `SEO` (`src/components/SEO.tsx`) → `usePageSEO` (`src/features/seo/hooks/usePageSEO.ts`) → `Helmet` (`react-helmet-async`).
- `DEFAULT_SEO.title` vaut déjà « EmploiPlus Group » (`seoSettingsService.ts`); le hook ajoute toujours ` | EmploiPlus Group` : titre final accueil « EmploiPlus Group | EmploiPlus Group ». `index.html` fournit le titre initial simple.
- Même suffixe ajouté partout via `usePageSEO`; les titres déjà brandés le dupliquent aussi, dont `/services` (`ServicesPage.tsx`) et les pages candidat dont les titres contiennent déjà la marque.
- Description SEO effective : « Diffusion d'offres d'emploi, Solutions numériques les entreprises. »; description statique initiale différente dans `index.html` (« Trouvez votre prochain emploi… Emploi+ »).
- Balises générées : canonical, robots, keywords, OG (type `website`), Twitter, JSON-LD `Organization` et `WebSite`. OG image par défaut `/og-default.svg`, mais `og:image:type` est codé `image/jpeg`. Données structurées spécifiques à l’accueil : Non trouvé.
- Un H1 dans chaque rendu du hero (branches Eco/standard exclusives); autres sections utilisent des H2/H3.

## 5. Recherche et offres
- Liste : `/jobs`, `JobsPage` (`src/pages/public/JobsPage.tsx`), `useJobs` et `jobService` (`src/features/jobs/hooks/useJobs.ts`, `src/features/jobs/api/jobsApi.ts`).
- Paramètres URL de recherche/filtre : Non trouvé. `location.search` est seulement conservé dans une navigation. Filtres en état local : `query`, `company`, `location`, `contractType`; salaire minimum, domaine/tags et proximité sont appliqués côté client. Recherche serveur : titre/entreprise/description/exigences, entreprise, ville/pays et contrat.
- Choix villes/pays : liste statique `centralAfricaCityGroups`, `src/data/locations.ts` (11 pays, 73 villes), pas déduite des offres. Chargement des offres par `jobService`; aucun composant autonome de recherche réutilisable trouvé, formulaire inclus à `JobsPage`.
- Services entreprise : `/services/recrutement` → `RecrutementChasseurDeTetePage`; `/services/externalisation` → `SolutionsEntreprisePage`; `/services/mise-disposition-rh` → `MiseADispositionPage`. Demandes/devis via `/contact` et liens avec `subject`; `ContactPage` porte le formulaire.

## 6. Données de crédibilité disponibles
- Accueil : « 2000+ Offres diffusées », « 1 Entreprises partenaires », « 2500+ Lecteurs / mois » sont des valeurs statiques de `HomePage.tsx`; provenance/actualisation réelle : Non trouvé. Pas de requête ni cache pour ces chiffres.
- `homeJobs` déclenche pourtant `getPublishedOffers(2)` : sélection limitée et triée par `publish_at`, sans filtre d’expiration; résultat non affiché. `isPublishedAndEligibleOffer` existe mais n’est pas appelé par cette requête.
- Comptage existant `jobService.getOffersCount()` : `count: "exact", head: true` (coût simple côté réponse, scan/index DB dépendant); non utilisé sur l’accueil et sans filtre explicite de statut/date. Sous RLS, `anon` ne voit que les offres `published`.
- Politiques `supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql:92,126` : lecture publique des offres et articles publiés; articles filtrés aussi dans `usePublishedBlogPosts(3)`. Requêtes sans cache applicatif identifié; hook articles ne traite pas explicitement l’erreur Supabase.
- Partenaire : un logo statique Monago (`src/assets/partners/logo-monago.webp`); RLS/coût/cache sans objet. Témoignages : Non trouvé sur l’accueil. Nombre réel d’entreprises, candidats, lecteurs, offres actives et offres par ville : Non trouvé.

## 7. Contraintes techniques
- Réutilisables : `Button` (`src/components/ui/button.tsx`), `Input`, `Select`, `Popover`, `Badge`, `Skeleton`; liens via `Link` de React Router. Hero utilise `Button` + `Link`; recherche emploie `Select`.
- Tokens `src/styles.css` : `--primary: #1b2ce3`, `--secondary: #e8a900`, `--background` clair `oklch(0.985 0.008 250)`, sombre `oklch(0.18 0.03 264)`, `--radius: 0.625rem`; classes d’ombre `shadow-brand`, `shadow-lg`. Police Inter (`@fontsource/inter`, weights 400–700), échelle Tailwind personnalisée dans `@theme inline`.
- `EcoModeContext` : seule `HeroSection` a une branche dédiée. `HomePage` n’appelle pas `useReducedMotion`; la réduction système est surtout CSS (`styles/eco-mode.css`, `styles.css`), tandis que plusieurs animations Framer Motion sont pilotées en JS.
- Build `vite.config.ts` : React, Tailwind; plugin d’optimisation d’images (`sharp`, imagetools) : Non trouvé. Assets importés sous `src/assets`; Vite les émet sans variante responsive configurée. Formats sources trouvés : WebP/SVG; conversion AVIF : Non trouvée.
- Préchargement hero : aucun `<link rel="preload">` dans `index.html`; l’image utilise `fetchPriority="high"`. Tests dédiés `HomePage`, `SiteHeader`, SEO/titre : Non trouvé.
- Zones partagées : `PublicLayout`, `SiteHeader`, `usePageSEO`/Helmet, tokens globaux et composants UI; `AdminSEOPage` modifie les réglages SEO globaux. Le shell public bascule sur `CandidateLayout` pour les candidats connectés. Modification du header ou de ces réglages : risque transversal.

## 8. Diagnostic rapide
- Hero très sombre : deux overlays noirs superposés, opacité combinée ~79–94 %; la luminosité intrinsèque de la photo n’est pas mesurée.
- Contenu bas : `py-20 md:py-28` du conteneur + `mt-20 md:mt-24` du H1, sans centrage vertical effectif; le header de 64 px est en flux.
- Visibilité/accessibilité : image correctement décorative (`alt=""`, `aria-hidden`). Contraste du texte blanc favorisé par l’overlay, mais aucun audit WCAG mesuré. « Nos services » n’a pas de style `focus-visible` explicite ni gestion visible d’Escape; le menu est ouvert au survol/clic.
- Performance : image 3763 × 2100, ~770 Kio, sans `srcset`/`sizes` ni dimensions HTML; même fichier déclaré en CSS background et `<img>`. Pas de variante mobile ni preload dédié.
- Défauts connexes : branche Eco Mode retire les CTA; offres chargées mais non rendues; statistiques non reliées à des mesures vérifiables; `index.html` et SEO client fournissent des descriptions incompatibles.
