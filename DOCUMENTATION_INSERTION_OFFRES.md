# Création et publication d’offres d’emploi — EmploiPlus Group
> Synthèse de l’audit statique du dépôt. La configuration distante de Supabase/Vercel n’a pas été vérifiée. Aucune valeur secrète n’est reproduite.
## 1. Vue d'ensemble technique
### Stack
- Frontend : React `^19.2.0`, TypeScript `^5.8.3`, Vite `^8.0.16` (`package.json`). Routeur : React Router DOM `^6.18.0`, routes dans `App` (`src/App.tsx`).
- État formulaire : hooks React `useState`; pas de react-hook-form dans le flux offre. Formulaires : contrôles HTML et composants UI locaux; `react-hook-form`/Zod sont installés mais non utilisés ici.
- UI/CSS : Tailwind CSS 4 et Radix; icônes `@phosphor-icons/react` (`package.json`, `vite.config.ts`).
- Backend offres : aucun contrôleur dédié trouvé. Le navigateur appelle Supabase directement. Backend général : fonctions Vercel serverless sous `api/`; utilitaires sous `server/`.
- Données : Supabase managé, PostgreSQL, Auth, Storage, RLS et pgvector.
- Sources : `src/integrations/supabase/client.ts`, `supabase/migrations/`, `src/features/jobs/api/jobsApi.ts`.
### Structure, commandes et variables
```text
api/                 fonctions serverless
docs/                documentation
scripts/             scripts
server/              utilitaires serveur
src/components/      composants
src/data/            données statiques
src/features/        domaines fonctionnels
src/integrations/    clients et types Supabase
src/pages/           pages admin et publiques
src/services/        services frontend
supabase/migrations/ schéma et politiques SQL
tests/               tests
```
- `npm run dev` lance Vite; port par défaut `5173`. `npm run build` compile le frontend puis lance `scripts/prerender.js`.
- Lancement local spécifique de l’API : **NON TROUVÉ** dans les scripts `package.json`.
- `.env` et `.env.local` existent; `.env.example`/`.env.sample` : **NON TROUVÉ**. Noms d’environnement observés seulement : `SUPABASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_OFFRES_BUCKET`, `VITE_SUPABASE_BLOG_BUCKET`, `VITE_SUPABASE_STORAGE_BUCKET`, `VITE_SUPABASE_CANDIDATE_BUCKET`, `EMAIL_SIGNING_SECRET`, `SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SEND_EMAIL_HOOK_SECRET`, `FROM_EMAIL`, `FROM_NAME`, `PORT`, `VITE_GEMINI_API_KEY`, `GROQ_API_KEY`, `GROQ_MODEL`, `MAELISE_GROQ_API_KEY`, `MAELISE_GROQ_MODEL`, `PAWAPAY_CALLBACK_URL`, `PAWAPAY_CHECKOUT_CALLBACK_URL`, `PAWAPAY_PAYOUT_CALLBACK_URL`, `PAWAPAY_REFUND_CALLBACK_URL`, `PAWAPAY_BASE_URL`, `PAWAPAY_COUNTRY_CODE`, `PAWAPAY_API_TOKEN`.
- `VITE_*` est exposé au frontend; ne pas y stocker de secret.
## 2. Authentification et rôles
- Connexion email/mot de passe : `loginCandidate` appelle `supabase.auth.signInWithPassword` (`src/features/authentication/api/authApi.ts`). `AuthProvider` maintient la session (`src/features/authentication/context/AuthContext.tsx`).
- `src/integrations/supabase/client.ts` stocke la session dans `localStorage`, clé `emploiplus-auth-token`, avec persistance et renouvellement automatique.
- La durée exacte du jeton dépend du projet Supabase : **NON TROUVÉ** dans le dépôt.
- `ProtectedRoute` compose les guards d’authentification, rôles et permissions (`src/features/authentication/guards/ProtectedRoute.tsx`).
- `/admin/jobs` exige `super_admin`/`admin` et `jobs.read`; `/admin/jobs/new` exige ces rôles et `jobs.create` (`src/App.tsx`).
- `admin` a `jobs.read/create/edit/delete`; `super_admin` a toutes les permissions (`src/features/authentication/permissions/rolePermissions.ts`).
- `editor` ne gère pas les offres via les écrans admin; `candidate` peut consulter et postuler. Le type applicatif cite aussi `rh`, `company`, `manager`, `accountant`, `recruiter`; l’enum SQL initial ne contient que `super_admin`, `admin`, `editor`. Leur attribution effective : **NON TROUVÉ**.
- Point important : une migration remplace la politique RLS initiale par une politique qui autorise tout utilisateur authentifié à gérer `job_offers`. Le guard frontend seul ne sécurise donc pas les écritures directes (`supabase/migrations/20260628140000_allow_authenticated_admin_content.sql`).
## 3. Page et formulaire admin
- Formulaire dédié : `/admin/jobs/new`, composant `AdminJobCreatePage` (`src/pages/admin/AdminJobCreatePage.tsx`).
- Formulaire alternatif de création/modification inline : `/admin/jobs`, composant `AdminJobsPage` (`src/pages/admin/AdminJobsPage.tsx`).
- Le formulaire dédié utilise `React.useState` et initialise titre, société, descriptions, URLs et mots-clés à vide; pays `Congo`, contrat `cdi`, statut `draft`, `auto_share=false`.
### Champs du formulaire dédié
| Champ | Libellé | Saisie | Obligatoire | Validation / valeurs |
|---|---|---|---|---|
| `title` | Intitulé du poste | Texte | Oui | `required`, trim |
| `company` | Entreprise | Texte | Oui | `required`, trim |
| `location_city` | Ville | Select | Non | `centralAfricaCityGroups`, `src/data/locations.ts` |
| `location_country` | Pays | Texte | Non | Initialisé à `Congo` |
| `contract_type` | Type de contrat | Select | Non | `cdi`, `cdd`, `stage`, `freelance`, `prestation_de_services`, `consultance`, `temps_partiel`, `interim` |
| `status` | Statut | Select | Non | `draft`, `published`, `archived` |
| `salary` | Salaire | Texte | Non | Aucune validation/formattage |
| `application_email` | Email de réception | Texte | Non | Pas de validation email |
| `external_link` | Lien externe | Texte | Non | Pas de validation URL |
| `keywords` | Mots-clés | Texte CSV | Non | Découpé par virgules en `tags` |
| `publish_at` | Date de publication | Date/heure | Non | ISO; publication immédiate par défaut |
| `deadline` | Date limite | Date | Non | Convertie en ISO |
| `seo_description` | Description SEO | Texte multiligne | Non | Stockée dans `meta_description` |
| `auto_share` | Partage automatique | Checkbox | Non | Booléen, initialement `false` |
| `description` | Description du poste | Texte multiligne | Oui | `required`, texte brut |
| `requirements` | Profil recherché | Texte multiligne | Non | Texte brut |
| `company_logo` | Logo de l’entreprise | URL texte | Non | Pas d’upload sur cette page |
| `cover_image` | Image de couverture | URL texte | Non | Pas d’upload sur cette page |
- Villes : liste statique de onze groupes de pays d’Afrique centrale, définie dans `src/data/locations.ts`.
- `application_whatsapp` et `expires_at` sont dans l’état/payload, mais n’ont pas de contrôle visible dans le formulaire dédié.
- Aucun champ de catégorie ou de secteur, pas de listes à puces ajoutables ni de champs conditionnels.
- Aucun éditeur riche : description et exigences restent du texte brut, affiché avec les retours à la ligne.
- Boutons : « Retour » navigue vers `/admin/jobs`; bouton de soumission « Publier l’offre »/« Valider l’offre ». Pas de bouton de prévisualisation séparé.
- Le formulaire inline ajoute une sélection d’image, un statut, une échéance, et des commandes d’édition/suppression/publication.
### Images
- Formulaire dédié : URL manuelle, sans fichier.
- Formulaire inline : input `accept="image/*"`, upload vers Storage Supabase sous le dossier `job-offers`; bucket réglable par `VITE_SUPABASE_OFFRES_BUCKET`.
- `uploadImageToStorage` prévoit JPEG, PNG, WEBP, GIF jusqu’à 8 Mio (`src/services/storageService.ts`).
- **Écart constaté** : `AdminJobsPage.handleImageUpload` appelle `uploadFileToStorage`, qui n’autorise que les PDF jusqu’à 2 Mio. Le contrôle image et le helper sont incompatibles.
## 4. Flux d’enregistrement
1. `AdminJobCreatePage.handleSubmit` intercepte le submit; le formulaire inline a son propre `AdminJobsPage.handleSubmit`.
2. Le composant normalise les valeurs, génère un slug, convertit les dates et crée les tags.
3. Il appelle `jobService.createOffer` dans `src/features/jobs/api/jobsApi.ts`.
4. Le service génère un embedding par `generateJobEmbeddingVector` (`src/services/aiMatchingService.ts`).
5. L’appel Supabase insère dans `job_offers`, sélectionne une réponse et retourne l’offre.
6. La requête correspond à `POST {SUPABASE_URL}/rest/v1/job_offers`; le client ajoute les en-têtes `apikey` et bearer de session.
7. PostgreSQL applique les contraintes et la RLS; aucun contrôleur serveur d’offre ou validation métier serveur n’a été trouvé.
8. En succès, l’interface affiche le message puis navigue vers `/admin/jobs`; en erreur, elle affiche le message et journalise l’erreur.
Extrait du flux réel, `AdminJobCreatePage.handleSubmit` :
```tsx
const slug = createSlug(form.title || `${form.company}-${Date.now()}`);
const nextStatus = form.status as Database["public"]["Enums"]["job_status"];
const payload = {
  slug,
  title: form.title.trim(),
  company: form.company.trim(),
  company_logo: form.company_logo || null,
  location_city: form.location_city || null,
  location_country: form.location_country || null,
  contract_type: form.contract_type as Database["public"]["Enums"]["contract_type"],
  description: form.description,
  status: nextStatus,
};
```
- `publish_at` vaut la date sélectionnée ou `now()` pour `published`; sinon `null`.
- La date limite alimente `deadline` et `expires_at`. Aucun `created_by`/auteur n’est envoyé.
- Le slug est minuscules, espaces en tirets, caractères hors `[a-z0-9-]` supprimés; repli `item-<timestamp>`.
- `jobService.createOffer` retente jusqu’à trois fois les conflits de slug avec un suffixe temporel.
- Validation frontend visible : seulement `required` pour titre, entreprise et description. Pas de Zod/validation URL/email spécifique.
- Les contraintes SQL garantissent les champs non nuls, enums et unicité du slug.
- Le succès affiche parfois « Offre publiée » même si le statut choisi est `draft` ou `archived`.
- Modification : `PATCH`; suppression : `DELETE`; changement de statut via `jobService.updateOffer`.
## 5. Modèle de données
Table `public.job_offers`, migration initiale `supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql`, extensions ci-dessous et types `src/integrations/supabase/types.ts`.
| Colonne | Type / contrainte |
|---|---|
| `id` | UUID, PK, généré par défaut |
| `slug` | TEXT, NOT NULL, UNIQUE |
| `title`, `company`, `description` | TEXT, NOT NULL |
| `company_logo`, `location_city`, `location_country` | TEXT nullable |
| `contract_type` | enum nullable |
| `requirements`, `application_email`, `application_whatsapp` | TEXT nullable |
| `external_link`, `cover_image` | TEXT nullable |
| `status` | enum NOT NULL, défaut `draft` |
| `publish_at`, `published_at`, `expires_at`, `deadline` | TIMESTAMPTZ nullable |
| `salary`, `meta_title`, `meta_description`, `og_image` | TEXT nullable |
| `auto_share` | BOOLEAN NOT NULL, défaut `false` |
| `tags` | TEXT[] NOT NULL, défaut `{}` |
| `featured_until` | TIMESTAMPTZ nullable |
| `views_count` | INTEGER NOT NULL, défaut `0` |
| `created_at`, `updated_at` | TIMESTAMPTZ NOT NULL, défaut `now()` |
| `embedding_vector` | `vector(768)` nullable |
- Contrats : `cdi`, `cdd`, `stage`, `freelance`, `consultance`, `temps_partiel`, `interim`, `prestation_de_services`.
- Statuts : `draft`, `scheduled`, `published`, `archived`, `expired`.
- Index : statut/date, slug unique, publication/date, mise en avant, embedding pgvector et index analytiques société/contrat/localisation/dates.
- Pas de colonne auteur, FK entreprise, catégorie ou secteur repérée dans cette table.
- `job_applications.job_offer_id` et `candidate_saved_offers.job_offer_id` référencent l’offre avec suppression en cascade (`supabase/migrations/20260702_create_job_applications.sql`, `20260702_create_candidate_saved_offers.sql`).
- SQL `publish_scheduled_jobs()` publie les offres programmées; `expire_jobs()` expire selon `expires_at`. Leur exécution périodique n’est pas trouvée.
- Les colonnes `publish_at` et `published_at` coexistent; le formulaire renseigne principalement `publish_at`. Relations avec entreprises/catégories : **NON TROUVÉ** dans le schéma `job_offers`.
## 6. API des offres
Aucune route d’offre dédiée dans `api/` ou `server/`. Les opérations passent par la Supabase REST API utilisée par `jobService` (`src/features/jobs/api/jobsApi.ts`).
| Méthode | URL indicative | Fonction | Accès interface |
|---|---|---|---|
| POST | `/rest/v1/job_offers` | `createOffer` | Admin/super-admin, `jobs.create` |
| PATCH | `/rest/v1/job_offers?id=eq.<id>` | `updateOffer` | Admin/super-admin |
| DELETE | `/rest/v1/job_offers?id=eq.<id>` | `deleteOffer` | Admin/super-admin |
| GET | `/rest/v1/job_offers?select=...` | `searchOffers`, `getPublishedOffers` | Public pour les offres visibles; admin protégé |
| GET | `/rest/v1/job_offers?slug=eq.<slug>` | `getOfferBySlug` | Public pour offre publiée visible |
| POST Storage | `/storage/v1/object/<bucket>/job-offers/<nom>` | `handleImageUpload` | Session Supabase; RLS Storage à confirmer |
- Ces URL sont relatives au projet Supabase; aucune URL/token réel n’est inclus.
- L’authentification HTTP est fournie par le client SDK Supabase.
- Politique RLS de la migration ultérieure : tout utilisateur authentifié peut écrire; vérifier la base déployée.
## 7. Affichage public
- Liste `/jobs` : `JobsPage` (`src/pages/public/JobsPage.tsx`) → `useJobs` (`src/features/jobs/hooks/useJobs.ts`) → `jobService`.
- Détail `/jobs/:slug` : `JobOfferDetailPage` (`src/pages/public/JobOfferDetailPage.tsx`) → `getOfferBySlug`.
- Champs liste : titre, société, contrat, lieu, salaire, description, exigences, dates, statut, couverture et tags.
- Le détail ajoute logo, contact candidature, lien externe et métadonnées SEO.
- Recherche : texte libre, entreprise, ville/pays, type de contrat; l’interface propose aussi tri et recherche naturelle.
- Les requêtes filtrent `status=published` et la date `publish_at`, mais la liste ne filtre pas systématiquement `deadline`/`expires_at`.
- Le détail signale expirée selon `status=expired` ou `deadline` passée; il ne teste pas `expires_at`.
- `isPublishedAndEligibleOffer` vérifie les dates limites, mais n’est pas la règle de toutes les méthodes de liste.
## 8. Diffusion et automatisations
- Le trigger SQL `notify_job_published` retourne immédiatement; notification de publication désactivée (`20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql`).
- `auto_share` est stocké, mais aucun code de publication réseaux sociaux/consommateur n’a été trouvé : **NON TROUVÉ**.
- Les RPC SQL de planification et expiration existent; aucun cron d’offres n’a été trouvé.
- `vercel.json` ne déclare qu’un cron journalier pour la réconciliation PawaPay.
- Pas de génération IA de contenu d’offre. L’embedding est utilisé pour le matching; les services Groq/Maëlise repérés ne rédigent pas de nouvelles offres.
- `nodemailer`, `googleapis`, `@vercel/node`, `standardwebhooks` sont installés; aucun n’est appelé par la création d’offre.
- Dépendances d’IA associées à des fonctions générales présentes dans `package.json`; aucun SDK OpenAI/Groq dédié à la création d’offres.
## 9. Extension « importer depuis une photo »
1. Ajouter bouton, input image et états de progression/erreur à `src/pages/admin/AdminJobCreatePage.tsx`.
2. Créer une fonction serverless dédiée sous `api/`; vérifier la session et le rôle/permission côté serveur.
3. Ajouter un service frontend jobs typé pour appeler la route.
4. Mapper le résultat reconnu vers le formulaire via `setForm(prev => ({ ...prev, ...values }))`.
5. Garder `handleSubmit` et `jobService.createOffer` comme flux d’enregistrement après validation humaine.
6. Ajouter les libellés nécessaires dans `src/i18n/translations.ts` et des tests ciblés.
7. Pour stockage, employer `uploadImageToStorage` de `src/services/storageService.ts`, pas l’helper PDF actuellement branché inline.
Risques à adresser :
- Champs requis `title`, `company`, `description`; enums strictes pour contrat et statut.
- `tags` est un tableau issu d’une chaîne CSV; ville et pays sont indépendants.
- Description stockée en texte brut : ne pas injecter du HTML/Markdown sans adapter le rendu public.
- Limite image prévue : 8 Mio; l’upload inline actuel appelle le helper PDF 2 Mio.
- RLS actuelle de migration ne valide pas le rôle admin; ne pas faire confiance au guard frontend.
- Pas de route d’import ni de limite d’upload configurée pour ce cas : **NON TROUVÉ**.
- Aucune politique CORS d’offre particulière; Supabase est appelé directement depuis le navigateur.
- Slug unique, mais pas de détection de doublons de contenu; accents retirés par la génération.
- Clarifier l’usage de `deadline`, `expires_at`, `publish_at`, `published_at`.
- Le modèle ne trace ni auteur, ni photo source, ni confiance OCR.
## 10. Résumé final
- React/Vite en frontend; Supabase PostgreSQL/Auth/Storage fournit le backend de données.
- Deux écrans admin permettent de créer une offre; seule la page inline a un upload d’image.
- Le formulaire dédié est contrôlé par `useState`, en texte brut, avec trois champs requis.
- Création via insert PostgREST direct; pas de route métier ni de validation serveur d’offre repérée.
- Les rôles UI sont admin/super-admin, mais une migration RLS autorise tout authentifié.
- `auto_share` et les notifications d’offre ne diffusent rien d’observé.
- Expiration et publication programmée sont des fonctions SQL sans cron d’offre trouvé.
- Une future importation photo devrait remplir un brouillon, puis demander confirmation.
Questions restantes :
- Quelle est la RLS réellement déployée et quels rôles sont effectivement attribués ?
- Quelle durée JWT est configurée dans Supabase ?
- Faut-il afficher des champs WhatsApp et `expires_at` sur la page dédiée ?
- `published_at` doit-il être renseigné en plus de `publish_at` ?
- Quelle date doit piloter l’expiration publique ?
- `auto_share` est-il prévu ou décoratif actuellement ?
- Le décalage entre l’input image et le validateur PDF doit-il être corrigé ?
