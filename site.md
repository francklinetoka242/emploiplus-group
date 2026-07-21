# Architecture SEO / GEO / AIO — EmploiPlus Group

## 1. Vue d'Ensemble de la Stratégie

- Objectifs SEO classiques
  - Assurer indexation et classement élevé pour pages publiques clés (homepage `/`, pages services `/services`, liste d'offres `/jobs`, pages d'offre `/jobs/:slug`, blog `/blog` et articles `/blog/:slug`).
  - Garantir métadonnées complètes (title, meta description, canonical, open graph, twitter card) et JSON-LD pour améliorer CTR et eligibility aux rich results (JobPosting, Article, Breadcrumb, FAQ si présents).

- Objectifs GEO / AIO (optimisation pour moteurs génératifs & IA — Gemini, GPTBot, GoogleOther)
  - Fournir HTML pré-rendu (contenu visible et meta tags) afin que les agents d'IA consomment le contenu directement sans exécution JS côté client.
  - Inclure JSON-LD complet (JobPosting, BlogPosting, Organization) pour permettre aux modèles d'IA de comprendre les entités, relations et structures.
  - Produire un sitemap exhaustif et à jour listant routes statiques + dynamiques issues de Supabase pour faciliter le crawling et la génération de réponses par les moteurs d'IA.

- Technologies et librairies clés
  - Framework & bundler: React + Vite (fichiers : [vite.config.ts](vite.config.ts)).
  - Head management: `react-helmet-async` (utilisé via `src/features/seo/hooks/usePageSEO.ts`).
  - Pre-rendering: `scripts/prerender.js` (Puppeteer fallback + static HTML fallback) et plugin sitemap dans [vite.config.ts](vite.config.ts).
  - Data store: Supabase (`src/integrations/supabase/client.ts`, hooks `src/hooks/pages.ts`).
  - Sitemap: génération via `sitemapGeneratorPlugin` (dans [vite.config.ts](vite.config.ts)) et écriture de `dist/sitemap.xml`.

## 2. Infrastructure d'Indexation & Exploration

### robots.txt
- Fichier : `public/robots.txt`.
- Rôle : donner des instructions de crawling aux agents (Googlebot, Bingbot, etc.).
- Vérifications à faire :
  - S'assurer que les règles n'interdisent pas `/jobs/` ou `/blog/`.
  - Ajouter explicitement des Allow directives pour crawlers importants si nécessaire.
- Remarques AIO : certains crawlers d'IA (ex: `GoogleOther`, `GPTBot`) respectent robots; vérifier User-Agent et adapter si besoin.

### Sitemap XML
- Emplacement final : `dist/sitemap.xml` (généré au build par `sitemapGeneratorPlugin` dans [vite.config.ts](vite.config.ts)).
- Sources utilisées :
  - Routes statiques déclarées dans le plugin (ex: `/`, `/about`, `/services`, `/jobs`, `/blog`, `/contact`).
  - Routes dynamiques extraites de Supabase :
    - Table `job_offers` → `slug` → `/jobs/:slug`
    - Table `blog_posts` → `slug` → `/blog/:slug`
    - Code responsable : `sitemapGeneratorPlugin` inside [vite.config.ts](vite.config.ts) (lignes : import `@supabase/supabase-js` puis `supabase.from(...).select('slug,...')`).
- Règles de fréquence/priority : le plugin applique `changefreq`, `priority`, et `lastmod` en se basant sur `publish_at` / `updated_at`.
- Bonnes pratiques :
  - Valider `sitemap.xml` dans Google Search Console.
  - S'assurer que les routes protégées (dashboards admin, candidate) ne sont pas exposées; ces pages ne devraient pas être listées.

### Pré-rendu HTML (Prerender)
- Problème adressé : SPA React renvoie par défaut un shell HTML vide (`<div id="root"></div>`), empêchant certains crawlers d'IA d'accéder au contenu rendu côté client.
- Script principal : `scripts/prerender.js`.
  - Fonctionnalités :
    - Récupère la liste des routes à pré-rendre (statics + dynamiques via Supabase).
    - Démarre un serveur statique local pointant vers `dist/` (après `vite build`).
    - Tente de lancer Puppeteer (avec fallback sur exécutable local ou, si pas disponible, génère un HTML statique simplifié). 
    - Pour chaque route : capture le DOM rendu (`page.content()`), écrit `dist/<route>/index.html` avec le HTML final (titres, meta tags, JSON-LD présents dans le DOM). 
  - Emplacements et fonctions clés :
    - `fetchDynamicRoutes()` (dans `scripts/prerender.js`) → interroge Supabase (`job_offers`, `blog_posts`).
    - `renderRoute(...)` → réalise la capture via Puppeteer ou fallback statique.
  - Résultat : robots et agents d'IA reçoivent un HTML complet (pratique pour Gemini, GPTBot, GoogleRichResults test).
- Points d'attention :
  - Nécessité des variables d'environnement Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ou clé publishable) lors du build.
  - Sur plateformes de build managées (Vercel), éviter l'échec du build si Chromium n'est pas disponible — le script inclut désormais un fallback statique.

## 3. Gestion des Métadonnées & Balises Head

### Hook & Composant SEO Centralisé
- Fichiers :
  - `src/features/seo/hooks/usePageSEO.ts` — hook qui transforme les métadonnées reçues en éléments Helmet.
  - `src/features/seo/utils/jsonLd.ts` — fonctions utilitaires pour construire les objets JSON-LD.
  - `src/components/SEO.tsx` ou usage direct du hook (recherche dans `src/**/SEO.tsx` / `usePageSEO.ts`).
- Comportement :
  - `usePageSEO` assemble : `resolvedTitle`, `resolvedCanonical`, `description`, `ogImage`, `schema`.
  - Retourne un élément Helmet (via `react-helmet-async`) qui injecte dynamiquement `<title>`, `<meta>`, `<link rel="canonical">`, balises OpenGraph et `<script type="application/ld+json">`.
  - Exemple d'appel : pages `HomePage`, `JobsPage`, `JobOfferDetailPage`, `BlogPostDetailPage` utilisent ce hook / composant.

### Balises dynamiques
- Génération :
  - Static pages (ex: `HomePage`, `ServicesPage`) : metadata statiques/translatées (i18n) passées au hook `usePageSEO`.
  - Dynamic job offers (`src/pages/public/JobOfferDetailPage.tsx`) :
    - Charge les données via `useJobOfferBySlug(slug)` (consommation Supabase).
    - `title` = `job.meta_title || \\`${job.title} | ${job.company}\\``.
    - `description` = `job.meta_description || excerpt of description`.
    - Canonical = `${BASE_URL}/jobs/${slug}`.
    - JSON-LD JobPosting généré via `jsonLd.ts` et injecté via Helmet (`dangerouslySetInnerHTML`).
  - Dynamic blog posts (`src/pages/public/BlogPostDetailPage.tsx`) :
    - `title`, `description`, `og:image`, `datePublished`, `author` extraits et injectés.
    - JSON-LD `BlogPosting` généré et injecté.
- Balises couvertes :
  - `<title>`
  - `<meta name="description">`
  - `<meta name="robots">` (index,follow par défaut pour pages publiques)
  - `<link rel="canonical">`
  - Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
  - Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
  - JSON-LD (`script[type="application/ld+json"]`)

## 4. Données Structurées (Schema.org / JSON-LD)
- Fichier central : `src/features/seo/utils/jsonLd.ts`.
- Rôle : construire objets JSON-LD pour injection via Helmet sur les pages.

### Organization
- Emplacement : injecté au niveau du site (via `seoSettingsService` ou dans `usePageSEO` par défaut).
- Champs clés : `@context`, `@type: Organization`, `name`, `url`, `logo`, `sameAs` (liens sociaux).

### JobPosting
- Utilisation : `JobOfferDetailPage.tsx` construit un objet `JobPosting` pour chaque offre.
- Champs essentiels à inclure :
  - `@type`: "JobPosting"
  - `title`: `job.title`
  - `description`: HTML ou texte (excerpt) – faire attention aux balises interdites
  - `datePosted`: `job.publish_at`
  - `validThrough`: `job.expires_at` (si disponible)
  - `employmentType`: `job.contract_type` (mappé vers schema.org values)
  - `hiringOrganization`: `{ "@type": "Organization", "name": job.company, "sameAs": site URL }`
  - `jobLocation`: `locationCity`, `locationCountry` → `{ "@type": "Place", "address": { ... } }`
  - `baseSalary`: inclure `value` (XAF) si disponible et bien formatté :
    - `"baseSalary": { "@type": "MonetaryAmount", "currency": "XAF", "value": { "@type": "QuantitativeValue", "value": 350000, "unitText": "MONTH" } }`
- Remarque : le schéma JobPosting augmente fortement les chances d'apparaître comme résultat enrichi (Google Jobs, rich answers pour IA).

### BlogPosting / Article
- Champs clés :
  - `headline`, `image`, `datePublished`, `dateModified`, `author` (nom), `publisher` (Organization + logo), `mainEntityOfPage` (URL canonical).
- Injection : `BlogPostDetailPage.tsx` crée le JSON-LD via `jsonLd.ts` et l'injecte dans Helmet.

### BreadcrumbList / FAQPage
- Si le site contient breadcrumbs ou FAQ (vérifier `src/pages/**`), générer `BreadcrumbList` et `FAQPage` JSON-LD pour augmenter la probabilité d'affichage enrichi.

## 5. Guide de Maintenance pour l'Équipe

### Test & Validation
- Google Search Console
  - Submit `dist/sitemap.xml` via Search Console → Index Coverage Monitoring.
  - Utiliser "URL Inspection" pour vérifier comment Googlebot récupère la page (raw HTML + rendered).
- Google Rich Results Test / Schema Validator
  - Tester plusieurs URLs : `/`, `/jobs/<slug>`, `/blog/<slug>`.
  - Vérifier que le `JobPosting` et `BlogPosting` sont valides et qu'aucun avertissement critique n'apparait.
- Tests pour moteurs d'IA (GEO / AIO)
  - Vérifier HTML pré-rendu :
    - `curl -sL https://emploiplus-group.com/jobs/comptable-kosala-africa-pme-7fc207 | grep -i "JobPosting" -n` devrait retrouver le JSON-LD.
    - Ouvrir la page renvoyée par le pré-rendu (ex: `dist/jobs/<slug>/index.html`) pour vérifier la présence de `<title>`, `<meta>` et JSON-LD.
  - Valider que `robots.txt` et `sitemap.xml` sont accessibles publiquement.

### Commandes de déploiement & vérification
- Build + prerender (local / CI) :

```bash
# build production + pre-render
npm run build
# ou étapes séparées
npm run build:vite
npm run prerender
```

- Règles utilitaires :
  - Variables d'environnement nécessaires au build/prerender :
    - `VITE_SUPABASE_URL` / `SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
    - Optionnel pour Puppeteer : `PUPPETEER_EXECUTABLE_PATH`

### Ajouter une nouvelle route publique compatible SEO/GEO/AIO
1. Créer la page React dans `src/pages/public/` (ex: `MyNewPage.tsx`).
2. Ajouter la route dans `src/App.tsx` (ex: `<Route path="/my-new-page" element={<MyNewPage />} />`).
3. Utiliser `usePageSEO` (ou `SEO` component) dans la page pour fournir `title`, `description`, `canonical`, `ogImage`, et `schema` si nécessaire.
4. Si la route est dynamique (dépendant de Supabase) :
   - Assurer que `job_offers` / `blog_posts` style table inclut un `slug` et `status = 'published'`.
   - `scripts/prerender.js` récupérera automatiquement les slugs pour créer `dist/<route>` (si le build a accès aux variables Supabase).
5. Mettre à jour tests ou fixtures si besoin et lancer `npm run build` localement.

## Annexes — Fichiers & Fonctions Clés (références)
- Pre-rendering
  - `scripts/prerender.js` — orchestration du prerender (fetchDynamicRoutes, renderRoute, fallback statique)
- Sitemap
  - `vite.config.ts` — `sitemapGeneratorPlugin(env)` (génère `dist/sitemap.xml` en lisant Supabase)
- SEO utils
  - `src/features/seo/hooks/usePageSEO.ts`
  - `src/features/seo/utils/jsonLd.ts`
  - `src/features/seo/services/seoSettingsService.ts`
- Pages importantes
  - `src/pages/public/HomePage.tsx`
  - `src/pages/public/JobsPage.tsx`
  - `src/pages/public/JobOfferDetailPage.tsx`
  - `src/pages/public/BlogPage.tsx`
  - `src/pages/public/BlogPostDetailPage.tsx`
- Supabase client
  - `src/integrations/supabase/client.ts`
  - data hooks: `src/hooks/pages.ts` (`usePublishedJobOffers`, `useJobOfferBySlug`, `usePublishedBlogPosts`, `useBlogPostBySlug`)
- Build & scripts
  - `package.json` — scripts `build:vite`, `prerender`, `build`

---

## Pourquoi cette architecture aide Gemini / GPTBot / Google
- Les agents d'IA consomment plus efficacement le HTML statique et les JSON-LD : pre-rendering garantit que le DOM final et les balises head (title/meta/ld+json) sont immédiatement disponibles, sans exécuter JavaScript.
- JSON-LD explicite (JobPosting, BlogPosting) fournit des entités structurées que les modèles peuvent utiliser pour extraire faits, dates et relations.
- Sitemap + robots.txt donnent aux crawlers une carte exacte des routes à indexer.

---

Si tu veux, je peux :
- Pousser `site.md` sur la branche `main` (je l'ai déjà créé localement) ou committer et pousser automatiquement.
- Exécuter un déploiement Vercel test et vérifier le log de build pour confirmer que la build ne bloque plus.


