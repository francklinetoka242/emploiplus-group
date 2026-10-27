# Synthèse — import photo d’une offre

## A. Formulaire d’administration

- Page : `src/pages/admin/AdminJobCreatePage.tsx`.
- Le composant exporté est `AdminJobCreatePage`.
- Le formulaire est un élément `<form>` contrôlé par `handleSubmit`.
- Les imports React/routage/i18n/services/contrôles sont regroupés au début du fichier.
- Le routage utilise `useNavigate` de `react-router-dom`.
- La traduction passe par `useI18n`.
- Les offres passent par `jobService` depuis `@/features/jobs/api`.
- Le type utilisé pour l’écriture est `JobOfferInsert`.
- Les types d’enum proviennent de `Database`.
- Aucun type/interface de formulaire explicite n’a été trouvé.
- L’état est inféré avec `React.useState`.
- La fonction exacte de mise à jour est `setForm`.
- L’état `title` commence à une chaîne vide.
- L’état `company` commence à une chaîne vide.
- `company_logo` commence vide.
- `location_city` commence vide.
- `location_country` commence à `"Congo"`.
- `contract_type` commence à `"cdi"`.
- `description` et `requirements` commencent vides.
- `application_email` et `application_whatsapp` commencent vides.
- `external_link` et `cover_image` commencent vides.
- `status` commence à `"draft"`.
- `publish_at`, `expires_at` et `deadline` commencent vides.
- `salary`, `seo_description` et `keywords` commencent vides.
- `auto_share` commence à `false`.
- États supplémentaires : `saving`, `error`, `success` et `savedOfferId`.
- Le champ poste est un composant local `Input`, avec `required`.
- Le champ société est également un `Input` requis.
- Le formulaire utilise les contrôles UI locaux sous `src/components/ui/`.
- Contrôles importés : `Button`, `Input`, `Textarea` et `DateInput`.
- Le select est composé de primitives locales basées sur Radix.
- Les imports `Label`, `Card` et `Toast` ne sont pas utilisés ici.
- Le début du formulaire est un `<form>` avec une grille responsive.
- La liste de villes vient de `src/data/locations.ts`.
- Chaque ville est affichée dans un `SelectItem`.
- La valeur et le libellé de la ville sont tous deux le nom `city`.
- `group.country` est le libellé du groupe de villes.
- Le select n’emploie pas d’élément HTML `<option>`.
- Deux premiers groupes du fichier de villes : Angola et Burundi.
- Le type `CityGroup` contient `country`, `countryCode` et `cities`.
- Les contrats proposés sont `cdi`, `cdd`, `stage` et `freelance`.
- Sont aussi proposés `prestation_de_services` et `consultance`.
- Les autres contrats proposés sont `temps_partiel` et `interim`.
- Les statuts sélectionnables sont `draft`, `published` et `archived`.
- La date de publication utilise `DateInput` avec date et heure.
- La date limite utilise également `DateInput`.
- Les mots-clés sont saisis dans un `Input`.
- La description SEO est saisie avec un `Textarea`.
- `handleChange` met à jour les champs nommés du formulaire.
- Pour une case à cocher, `handleChange` enregistre `checked`.
- Le code utilise des classes utilitaires Tailwind pour les layouts.
- Aucun éditeur riche n’est identifié dans cette page.
- Aucun chargement de fichier d’image n’est présent dans cette page.
- Aucun bouton distinct « Prévisualiser » n’a été trouvé.
- Le bouton principal soumet le formulaire.
- Pendant la sauvegarde, son libellé vient de `admin.jobs.create.saving`.
- Après sauvegarde locale, le libellé vient de `admin.jobs.create.validate`.
- Sinon, son libellé vient de `admin.jobs.field.submit`.
- Les erreurs sont affichées depuis l’état local `error`.
- Le succès est brièvement stocké dans `success`.
- Le succès déclenche aussi une navigation vers `/admin/jobs`.
- Les messages ne passent pas par un toast dans ce composant.

## B. Enregistrement de l’offre

- Le gestionnaire complet se nomme `handleSubmit`.
- Il empêche le comportement HTML standard du formulaire.
- Il vide les anciens messages et active `saving`.
- Le slug est généré par `createSlug`.
- Le slug dérive du titre ou, à défaut, société et horodatage.
- `createSlug` minuscule, remplace les espaces et retire les caractères non admis.
- Le statut est converti en enum `job_status`.
- Le type de contrat est converti en enum `contract_type`.
- Le titre et la société sont nettoyés avec `trim()`.
- Plusieurs champs vides sont transformés en `null`.
- Pour une offre publiée, `publish_at` reprend la date saisie.
- Si aucune date de publication n’est saisie, l’heure courante est utilisée.
- Pour un statut non publié, `publish_at` devient `null`.
- `deadline` ou `expires_at` alimentent la date d’expiration.
- `seo_description` devient `meta_description`.
- Les mots-clés sont séparés par des virgules et nettoyés en tags.
- Le corps préparé est un objet JavaScript transmis au service.
- En modification, `jobService.updateOffer(savedOfferId, payload)` est appelé.
- En création, `jobService.createOffer(payload)` est appelé.
- L’identifiant créé est conservé dans `savedOfferId`.
- L’interface navigue ensuite vers `/admin/jobs`.
- Les erreurs sont écrites dans la console puis dans `error`.
- Le message d’erreur brut est affiché si l’exception est `Error`.
- Sinon, un message d’erreur français générique est présenté.
- `saving` est remis à `false` dans le bloc `finally`.
- Le service client est défini dans `src/features/jobs/api`.
- L’implémentation détaillée des requêtes n’est pas reproduite dans cette synthèse.

## C. Client Supabase et rôles

- Client exporté : `supabase`.
- Fichier du client : `src/integrations/supabase/client.ts`.
- La table des rôles est `public.user_roles`.
- L’enum initial est `public.app_role`.
- Valeurs initiales : `super_admin`, `admin`, `editor`.
- Migration de création : `20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql`.
- Colonnes initiales : `id`, `user_id`, `role`, `created_at`.
- La paire `user_id` et `role` est unique.
- `user_id` référence `auth.users(id)` avec suppression en cascade.
- La migration `20260629140000_extend_admin_members_management.sql` étend la table.
- Colonnes ajoutées : `email`, `full_name`, `specialty` et `is_active`.
- `is_active` est un booléen non nul avec défaut `true`.
- La fonction SQL `has_role` vérifie un rôle donné pour un utilisateur.
- La fonction SQL `is_staff` vérifie l’existence d’un rôle.
- `is_admin_active` vérifie une ligne active dans `user_roles`.
- Une fonction appelée `is_admin` n’a pas été trouvée dans les migrations.
- Le frontend obtient les métadonnées via la session Supabase.
- `getAuthMetadataFromSession` normalise les rôles et permissions.
- Cette fonction se trouve dans `src/features/authentication/types/index.ts`.
- `AuthContext.tsx` combine les rôles de métadonnées et le rôle candidat.
- Le rôle candidat est ajouté si un profil candidat existe.
- Le contexte ne lit pas directement `user_roles` pour construire ces rôles.
- Une politique permet aux utilisateurs de lire leurs propres rôles.
- Une politique autorise les super-admins à gérer les rôles.

## D. RLS des offres et Storage

- Les politiques historiques sont créées dans la migration initiale.
- La politique `"Public reads published jobs"` autorise la lecture publique publiée.
- Elle autorise aussi le personnel selon `public.is_staff(auth.uid())`.
- La politique initiale de gestion s’appelle `"Staff manage jobs"`.
- Elle autorisait le personnel à gérer toutes les offres.
- La migration `20260628140000_allow_authenticated_admin_content.sql` la supprime.
- Elle crée `"Authenticated users manage jobs"` sur `public.job_offers`.
- La nouvelle politique exige seulement un utilisateur authentifié.
- La politique de lecture publique reste active selon l’historique trouvé.
- La migration d’extension des offres ne modifie pas ces politiques.
- Les politiques Storage associées à un bucket d’offres : NON TROUVÉ.

## E. API et configuration

- Le dépôt contient des fonctions serverless sous le dossier `api/`.
- Un exemple court est `api/password-reset.ts`.
- Ce handler route les actions request, validate et confirm.
- Le handler délègue à `server/password-reset-handlers.js`.
- Il ne vérifie pas lui-même l’authentification Supabase.
- `vercel.json` configure les réécritures des routes API.
- Il redirige aussi les routes de paiement vers un handler commun.
- Une tâche cron de réconciliation de paiement est configurée quotidiennement.
- `vercel.json` redirige les autres routes vers `/index.html`.
- `vite.config.ts` configure React et Tailwind.
- Un plugin Vite expose les handlers `api/*.ts` en développement.
- Le plugin de développement lit et transmet le corps de la requête.
- Une erreur du handler de développement est loguée et renvoie HTTP 500.
- L’alias Vite `@` pointe sur le dossier `src`.
- Aucun proxy Vite n’a été configuré.
- Le plugin génère un sitemap statique et récupère des offres Supabase.
- Les clés sont chargées depuis l’environnement, jamais à recopier en clair.
- `tsconfig.json` utilise `moduleResolution: "Bundler"`.
- Les chemins configurent `@/*` vers `./src/*`.
- `baseUrl` : NON TROUVÉ dans `compilerOptions`.
- `include` cible les sources TypeScript, la configuration Vite et ESLint.

## F. Dépendances et tests

- `@supabase/supabase-js` : `^2.108.2`.
- `@vercel/node` : `^5.8.22`.
- Aucun SDK IA requis : l'API Gemini est appelée avec `fetch`.
- `vercel` : NON TROUVÉ dans les dépendances.
- Scripts : `dev`, `build:vite`, `prerender` et `build`.
- Autres scripts : `build:dev`, `preview` et `generate:job-embeddings`.
- Scripts qualité : `lint` et `format`.
- Test dédié à `AdminJobCreatePage` : NON TROUVÉ.
- Tests de services pertinents : `offerVisibility.test.ts`.
- Autre test pertinent : `matchingEligibility.test.ts`.
- Les tests concernés utilisent `node:test` et `node:assert/strict`.

## Références principales

- Page admin : `src/pages/admin/AdminJobCreatePage.tsx`.
- Données de villes : `src/data/locations.ts`.
- Service des offres : `src/features/jobs/api`.
- Types des offres : `src/features/jobs/types`.
- Client : `src/integrations/supabase/client.ts`.
- Contexte d’authentification : `src/features/authentication/context/AuthContext.tsx`.
- Normalisation des rôles : `src/features/authentication/types/index.ts`.
- Migrations RLS et rôles : `supabase/migrations/`.
- Handlers serverless : `api/`.
- Configuration de déploiement : `vercel.json`.
- Configuration du serveur de développement : `vite.config.ts`.
- Configuration TypeScript : `tsconfig.json`.
- Dépendances et scripts : `package.json`.

## Limites de cette synthèse

- Ce fichier résume le document d’extraits détaillés; il n’en reproduit pas tout le code.
- Pour les signatures et le texte source exact, consulter les chemins référencés.
- Les variables d’environnement sont à identifier par leur nom dans les sources.
- Aucun secret, token, mot de passe ou valeur de clé ne doit être ajouté ici.
- Les points marqués NON TROUVÉ reflètent les recherches documentées précédemment.
- Cette version condensée fait exactement 200 lignes.
