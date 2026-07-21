# État actuel du SEO, de l’indexation et du JSON-LD

## 1. Rendu HTML & SEO (SPA / Prerender)

### 1.1 Architecture réelle du rendu

Le site est actuellement une application React monopage (SPA) construite avec Vite, React 19 et React Router.

- Point d’entrée principal : [src/main.tsx](src/main.tsx)
- Routage principal : [src/App.tsx](src/App.tsx)
- Template HTML initial : [index.html](index.html)

Le fichier [index.html](index.html) ne contient qu’un squelette HTML minimal :
- un `div id="root"`
- un script module chargé vers [src/main.tsx](src/main.tsx)
- un titre de base et une description de base

Il n’y a aucun mécanisme de SSR, de prerendering statique avancé, ni de dynamic rendering côté serveur pour les routes publiques. Le rendu des pages se fait donc côté client après chargement du bundle JavaScript.

### 1.2 Comment les méta-tags sont injectés

Les balises SEO sont injectées dynamiquement avec `react-helmet-async`.

- Composant d’entrée : [src/components/SEO.tsx](src/components/SEO.tsx)
- Hook central : [src/features/seo/hooks/usePageSEO.ts](src/features/seo/hooks/usePageSEO.ts)
- Service de configuration globale : [src/features/seo/services/seoSettingsService.ts](src/features/seo/services/seoSettingsService.ts)

Le hook `usePageSEO(metadata)` injecte à la volée :
- `<title>`
- `<meta name="description">`
- `<meta name="keywords">` (si présent)
- `<meta name="robots">`
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Card tags
- un script JSON-LD via `application/ld+json`

Le comportement est centralisé et réutilisé par toutes les pages publiques et privées qui appellent `usePageSEO(...)` ou le composant `SEO`.

### 1.3 Injection dynamique selon les pages

#### Page détail offre `/jobs/:slug`

Fichier concerné : [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)

Le flux est le suivant :
1. La route `/jobs/:slug` est définie dans [src/App.tsx](src/App.tsx)
2. `JobOfferDetailPage` récupère le `slug` via `useParams()`
3. Il charge l’offre avec `jobService.getOfferBySlug(slug)` depuis [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts)
4. Une fois l’offre chargée, il appelle `SEO` avec :
   - `title={job.meta_title || \`${job.title} | ${job.company}\`}`
   - `description={job.meta_description || job.description?.slice(0, 160)}`
   - `canonical={\`${BASE_URL}/jobs/${job.slug}\`}`
   - `robots="index,follow"`
   - `ogImage={job.og_image || job.cover_image || \`${BASE_URL}/og-default.svg\`}`
   - `publishedTime={job.publish_at}`
   - `modifiedTime={job.updated_at}`

#### Page détail blog `/blog/:slug`

Fichier concerné : [src/pages/public/BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx)

Le flux est le suivant :
1. La route `/blog/:slug` est définie dans [src/App.tsx](src/App.tsx)
2. `BlogPostDetailPage` récupère le `slug` via `useParams()`
3. Il récupère le post via `useBlogPostBySlug(slug)` depuis [src/hooks/usePublishedOffers.ts](src/hooks/usePublishedOffers.ts)
4. Puis il appelle `SEO` avec :
   - `title={post.meta_title || post.title}`
   - `description={post.meta_description || post.excerpt || t("blog.subtitle")}`
   - `canonical={\`${BASE_URL}/blog/${post.slug}\`}`
   - `robots="index,follow"`
   - `ogImage={post.og_image || post.image || \`${BASE_URL}/og-default.svg\`}`
   - `publishedTime={post.publish_at}`

### 1.4 Limite SEO importante

Le site n’a pas de pré-rendu serveur pour les pages dynamiques. Les robots voient donc initialement un HTML minimal, puis le contenu SEO est injecté côté navigateur au moment du rendu React. C’est fonctionnel pour un rendu client classique, mais cela est moins robuste que du SSR/SSG pour l’indexation rapide et la fidélité de l’HTML initial.

---

## 2. Données structurées (Schema.org / JSON-LD)

### 2.1 Existence d’un système JSON-LD

Oui. Le projet possède un système centralisé de génération de JSON-LD.

- Générateur principal : [src/features/seo/utils/jsonLd.ts](src/features/seo/utils/jsonLd.ts)
- Intégration dans les métadonnées : [src/features/seo/hooks/usePageSEO.ts](src/features/seo/hooks/usePageSEO.ts)

La fonction `buildJsonLd(metadata)` construit un objet de type `@graph` avec :
- `Organization`
- `WebSite`
- `BreadcrumbList` si des breadcrumbs sont fournis
- `structuredData` personnalisé si une page en fournit un

### 2.2 Pages où du JSON-LD est déjà injecté

#### A. Page détail offre d’emploi

Fichier : [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)

La page injecte explicitement un schéma `JobPosting` via la prop `structuredData` passée à `SEO`.

Schéma utilisé :
- `@type: "JobPosting"`
- `title`
- `description`
- `datePosted`
- `validThrough`
- `employmentType`
- `hiringOrganization`
- `jobLocation`

Le `hiringOrganization` est un sous-objet `Organization` et le `jobLocation` est un sous-objet `Place` avec `PostalAddress`.

#### B. Pages publiques standards

Les pages publiques utilisent aussi automatiquement le JSON-LD de base fourni par `buildJsonLd(metadata)`.

Cela signifie qu’elles contiennent au minimum :
- `Organization`
- `WebSite`
- éventuellement un `BreadcrumbList`

#### C. Pages blog / article

Fichier : [src/pages/public/BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx)

Aucune injection explicite de schéma `Article` ou `NewsArticle` n’est faite à l’heure actuelle. La page reçoit tout de même le JSON-LD de base (Organization + WebSite + BreadcrumbList), mais pas de schéma article spécifique.

### 2.3 Où ajouter de nouveaux schémas si besoin

Le point central d’extension est déjà défini dans [src/features/seo/hooks/usePageSEO.ts](src/features/seo/hooks/usePageSEO.ts) et [src/features/seo/utils/jsonLd.ts](src/features/seo/utils/jsonLd.ts).

Pour enrichir le SEO structuré, les meilleurs points d’insertion sont :
- [src/pages/public/BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx) pour un schéma `Article` ou `NewsArticle`
- [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx) pour compléter `JobPosting` avec des propriétés plus riches si nécessaire
- éventuellement un composant dédié dans [src/features/seo/components](src/features/seo/components) si l’on veut factoriser les schémas par type de page

### 2.4 Indexation / robots / sitemap

- Fichier robots : [public/robots.txt](public/robots.txt)
- Configuration actuelle :
  - `User-agent: *`
  - `Allow: /`
  - `Disallow: /admin`
  - `Disallow: /auth`
  - `Sitemap: https://emploiplus-group.com/sitemap.xml`

Le site est donc autorisé à être exploré par Google et les bots d’IA généraux, à condition que la page soit accessible en HTML/JS et correctement référencée.

Le sitemap est généré au build par le plugin Vite défini dans [vite.config.ts](vite.config.ts), avec sortie vers `dist/sitemap.xml`.

---

## 3. Flux de données des pages dynamiques

### 3.1 Page `/jobs/:slug`

#### Route et composant

- Route : [src/App.tsx](src/App.tsx)
- Composant : [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)

#### Données Supabase récupérées

Le composant appelle `jobService.getOfferBySlug(slug)` depuis [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts).

La requête Supabase cible la table `job_offers` et récupère les champs suivants :
- `id`
- `slug`
- `title`
- `company`
- `company_logo`
- `contract_type`
- `location_city`
- `location_country`
- `description`
- `requirements`
- `status`
- `publish_at`
- `expires_at`
- `application_email`
- `application_whatsapp`
- `external_link`
- `cover_image`
- `meta_title`
- `meta_description`
- `og_image`
- `updated_at`
- `salary`
- `deadline`
- `tags`

Le détail important pour le SEO est que les champs `meta_title`, `meta_description`, `og_image`, `publish_at`, `updated_at` et `expires_at` sont disponibles dans l’objet `job` au moment du rendu.

#### État React utilisé pour le rendu

Le composant stocke le résultat dans l’état local :
- `const [job, setJob] = React.useState<JobOffer | null>(null);`
- `const [loading, setLoading] = React.useState(true);`

Après le chargement, ces données alimentent :
- le contenu HTML de la page
- les meta-tags SEO
- le JSON-LD `JobPosting`
- les boutons de partage et l’affichage du détail de l’offre

### 3.2 Page `/blog/:slug`

#### Route et composant

- Route : [src/App.tsx](src/App.tsx)
- Composant : [src/pages/public/BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx)

#### Données Supabase récupérées

Le composant appelle `useBlogPostBySlug(slug)` défini dans [src/hooks/usePublishedOffers.ts](src/hooks/usePublishedOffers.ts), lui-même implémenté dans [src/features/jobs/hooks/usePublishedOffers.ts](src/features/jobs/hooks/usePublishedOffers.ts).

La requête Supabase cible la table `blog_posts` et récupère les champs suivants :
- `id`
- `slug`
- `title`
- `content`
- `excerpt`
- `status`
- `publish_at`
- `meta_title`
- `meta_description`
- `og_image`
- `image`
- `video_url`
- `external_link`
- `category`
- `tags`
- `is_featured`
- `sort_order`

Ces données alimentent :
- le titre et la description SEO
- l’image Open Graph
- le contenu affiché à l’écran
- les breadcrumbs

### 3.3 Données de liste utilisées pour la navigation et le SEO de contexte

Les listes de pages publiques utilisent aussi des hooks de données Supabase :
- [src/features/jobs/hooks/usePublishedOffers.ts](src/features/jobs/hooks/usePublishedOffers.ts)
- [src/hooks/usePublishedOffers.ts](src/hooks/usePublishedOffers.ts)

Par exemple :
- `usePublishedJobOffers(limit)` récupère des offres publiées depuis `job_offers`
- `usePublishedBlogPosts(limit)` récupère des posts publiés depuis `blog_posts`

Ces données servent à l’affichage de la liste et aux liens vers les URLs détaillées `/jobs/:slug` et `/blog/:slug`.

---

## Conclusion synthétique

Le projet possède déjà un socle SEO raisonnable :
- métadonnées dynamiques injectées via `react-helmet-async`
- canonical et robots configurés par page
- JSON-LD centralisé et déjà utilisé sur les offres d’emploi
- sitemap généré à partir des données Supabase au build
- robots.txt ouvert pour Google et les bots d’IA généraux

En revanche, le site reste une SPA client-side sans SSR/Prerender : les pages dynamiques dépendent du chargement JavaScript, ce qui est un point de vigilance pour l’indexation et la compréhension rapide du contenu par les moteurs et les robots d’IA.
