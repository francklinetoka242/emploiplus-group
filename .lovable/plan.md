
# EmploiPlus Group — V2 Plan

V2 étend la V1 sans la refondre. Travail livré par phases indépendantes, chacune déployable seule.

## Phase 1 — Foundations DB & Statuts (migration unique)

Nouvelles tables + colonnes (Supabase, RLS + GRANT par table) :

- `job_offers` : ajouter `published_at`, `expires_at`, `featured_until`, `meta_title`, `meta_description`, `og_image`, `views_count`. Enrichir l'enum `status` avec `scheduled`.
- `cms_sections` : `key` (unique), `title`, `content_json` (jsonb), `updated_at`. Lecture publique, écriture staff.
- `blog_posts` : ajouter `scheduled_at`, `meta_title`, `meta_description`, `og_image`, `reading_time`, `views_count`, `category`.
- `notifications` : `id`, `type`, `title`, `body`, `link`, `read_at`, `created_at`. Lecture/écriture staff.
- `page_views` : `id`, `path`, `country`, `city`, `created_at` (pour analytics simples internes ; fallback si pas de PostHog).

Triggers / fonctions :
- `set_updated_at` déjà existant → réutilisé.
- Fonction `expire_jobs()` : passe à `expired` les offres `published` dont `expires_at < now()`.
- Fonction `publish_scheduled_jobs()` : passe à `published` les offres `scheduled` dont `published_at <= now()`.
- Trigger `notify_on_new_message` / `notify_on_publish` : insertion dans `notifications`.

## Phase 2 — CRON & publication automatique

Route serveur publique `src/routes/api/public/hooks/jobs-tick.ts` (POST) qui appelle `expire_jobs()` + `publish_scheduled_jobs()` via `supabaseAdmin` (chargé dans le handler).
`pg_cron` planifié toutes les 10 min vers cette URL avec header `apikey`.

Admin Jobs : champs `published_at`, `expires_at`, `featured_until` ; statut `scheduled` automatique si `published_at > now()`.

## Phase 3 — Boost / Featured

- Bouton « Booster » dans l'admin (modal : nombre de jours → set `featured_until`).
- Tri public : `featured_until > now()` d'abord, puis géo, puis date.
- Badge `Featured` côté liste + détail.

## Phase 4 — Géolocalisation (ipapi.co)

- Hook `useGeo()` : appel `https://ipapi.co/json/` une seule fois, cache localStorage 24h, fallback silencieux.
- Tri client jobs : ville → pays → featured → date.
- Badges `Near you` (même ville) / `In your country` (même pays).

## Phase 5 — CMS modulaire

- Table `cms_sections` éditée via `/admin/cms` (liste de sections : `home.hero`, `home.stats`, `home.cta`, `services.intro`, `about.body`, `footer.about`).
- Éditeur JSON guidé (champs typés par clé via un registry côté front).
- Pages publiques (`index`, `services`, `about`) lisent ces sections via `createServerFn` public (publishable key, policy `TO anon`).

## Phase 6 — Blog V2

- Éditeur riche minimal (Tiptap : bold/italic/lien/titres/listes/image URL/embed YouTube).
- `scheduled_at` + tick blog inclus dans le CRON Phase 2.
- Reading time calculé à la sauvegarde (mots / 200).
- Sidebar intelligente : composant `BlogSidebar` (jobs locaux via géo, top articles par `views_count`, catégories distinctes).
- SEO : `meta_title`, `meta_description`, `og_image` injectés dans `head()`, schema Article enrichi (author, datePublished, image).

## Phase 7 — Analytics admin

- Tracker léger : `createServerFn` `trackView` appelé depuis `__root.tsx` sur changement de route, insert `page_views` (+ pays/ville via géo client).
- Dashboard `/admin/analytics` : visiteurs 7/30j, top pages, top jobs (par `views_count`), top articles, répartition pays.
- PostHog optionnel via secret `VITE_POSTHOG_KEY` (si défini, init côté client ; sinon analytics interne uniquement). Pas demandé au user sauf demande explicite.

## Phase 8 — Notifications admin

- Bell dans `admin.tsx` (header) : badge nombre `read_at IS NULL`, dropdown récent, action « marquer lu ».
- Realtime via `supabase.channel('notifications')` sur insert.

## Phase 9 — Performance & UX

- Pagination serveur jobs/blog (`range()` + `count: 'exact'`).
- Skeleton loaders jobs/blog.
- `loading="lazy"` + `decoding="async"` sur toutes images.
- Filtres jobs : pays, ville, contrat persistés dans l'URL (search params).
- Infinite scroll blog (option, `useInfiniteQuery`).
- Sidebar blog sticky (`position: sticky; top: 96px`).

## Phase 10 — i18n V2

- Détection langue navigateur au premier visit (`navigator.language`), persistée en localStorage.
- Fallback FR si clé manquante.
- Dictionnaires séparés par namespace (`common`, `jobs`, `blog`, `admin`), lazy-loaded via `import()`.

## Détails techniques

- Toutes les nouvelles tables ont : `GRANT` ciblé (anon SELECT uniquement pour `cms_sections`, `job_offers`, `blog_posts` ; sinon authenticated/service_role), RLS activée, policies `is_staff()` pour écriture.
- Server fns publics (CMS, jobs liste, blog liste) : client publishable serveur, pas `supabaseAdmin`.
- CRON tick : route `/api/public/hooks/jobs-tick`, `supabaseAdmin` importé dynamiquement dans le handler.
- Aucun fichier V1 supprimé. Ajouts colonnes via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- Code modulaire : `src/lib/geo.ts`, `src/lib/cms.functions.ts`, `src/lib/jobs.functions.ts`, `src/lib/analytics.functions.ts`, `src/components/site/BlogSidebar.tsx`, `src/components/admin/NotificationsBell.tsx`.

## Ordre d'exécution suggéré

1. Phase 1 (migration) → 2 (CRON) → 3 (Boost) — backbone jobs.
2. Phase 4 (géo) + 5 (CMS) — intelligence + contenu.
3. Phase 6 (Blog V2) + 9 (perf/UX).
4. Phase 7 (analytics) + 8 (notifs) + 10 (i18n).

Chaque phase est commit-able indépendamment. Confirmez l'ordre ou indiquez par où démarrer (par défaut : Phase 1 → 3 d'un bloc).
