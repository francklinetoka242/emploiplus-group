# Audit – Embeddings pour `job_offers`

Date: 2026-07-27

Objectif: analyser où et comment les embeddings des offres (`job_offers.embedding_vector`) sont créés/stockés, détecter les points manquants et proposer une architecture robuste pour garantir que `embedding_vector` ne soit jamais NULL.

---

## 1) Points d'entrée / création & modification des offres

- Fichiers principaux identifiés qui créent / modifient des offres:
  - `src/features/jobs/api/jobsApi.ts` — fonctions `createOffer(data: JobOfferInsert)` et `updateOffer(id, data)` qui invoquent directement Supabase (`.insert()` / `.update()` sur `job_offers`).
  - `src/pages/admin/AdminJobsPage.tsx` — UI d'administration qui prépare le payload et utilise `jobService` / `jobService.createOffer` et `updateOffer` (flux d'édition côté admin).
  - Plusieurs autres composants/pages lisent `job_offers` (pages publiques, recherche, etc.), mais les inserts/updates passent par `jobService` côté client.

- Endpoints côté serveur: il n'y a pas de couche backend Node/Express dédiée dans ce repo — les écritures vers `job_offers` sont faites depuis le client (Supabase JS client) via les fonctions ci-dessus. Il n'existe pas d'API REST intermédiaire qui centralise les writes côté serveur.

- Conclusion: la création / mise à jour des offres se fait depuis le frontend (admin UI) via `jobsApi` qui appelle Supabase directement.

## 2) Est-ce qu'un service génère déjà `embedding_vector` au CREATE / UPDATE ?

- Réponse courte: non systématiquement.

- Détails:
  - `src/features/jobs/api/jobsApi.ts` n'ajoute ni ne calcule `embedding_vector` dans `createOffer` ou `updateOffer` : il insère/mettre à jour les champs fournis par le UI.
  - Il existe une fonction utilitaire de génération d'embeddings déterministe dans le code client : `createEmbeddingVectorString` est définie dans `src/services/aiMatchingService.ts` (et une variante identique apparaît dans `src/services/matchScoreUtils.ts` et `scripts/generateJobEmbeddings.ts`).
  - Il y a un script de backfill: `scripts/generateJobEmbeddings.ts` (commande NPM `generate:job-embeddings`) qui parcourt les offres où `embedding_vector IS NULL` et met à jour ces lignes en calculant l'embedding localement (même algorithme déterministe que `aiMatchingService`).
  - `src/services/aiMatchingService.ts` contient aussi `ensureJobOfferEmbeddings()` (cherche les offres sans embedding et met à jour une page de 25), mais cette fonction n'est pas appelée automatiquement dans le flux de création d'offres (elle existe mais n'est pas déclenchée côté création d'offre ni dans `processCandidateCvUpload`).

## 3) Service d'embedding existant

- Module utilisé: implémentation locale et déterministe (pas OpenAI/HF) — la génération est effectuée par le code `createEmbeddingVectorString(text)` présent dans :
  - `src/services/aiMatchingService.ts` (exportée)
  - `src/services/matchScoreUtils.ts` (même implémentation locale)
  - `scripts/generateJobEmbeddings.ts` (même logique côté script)

- Construction du texte vectorisé:
  - Dans `scripts/generateJobEmbeddings.ts` et `ensureJobOfferEmbeddings()` le texte est bâti par la concaténation suivante :
    - title, company, location_city, description, requirements (filtrés pour retirer `null`/`undefined`), joint par des espaces ou retours.
  - Dans `aiMatchingService.createEmbeddingVectorString` la même logique est appliquée quand on doit générer l'embedding d'une offre (on rassemble les champs pertinents en une seule chaîne puis on hash/tokenise).

## 4) Schéma de base de données & Supabase (colonnes, RPC, index)

- Colonne et extension:
  - Migration `supabase/migrations/2026_add_pgvector_matching.sql` ajoute `embedding_vector vector(768)` aux tables `public.job_offers` et `public.candidates` et crée l'extension `vector`.
  - Une indexation `ivfflat` est créée (`idx_job_offers_embedding_vector_ivfflat`) pour accélérer la recherche nearest-neighbor.

- RPC / matching:
  - RPC `public.match_job_offers_for_candidate(...)` existe (définie dans la migration ci-dessus et mise à jour par `20260727_update_match_job_offers_for_candidate_pagination.sql`) et s'appuie explicitement sur `job_offers.embedding_vector IS NOT NULL`.
  - La RPC ne retournera donc rien pour les offres dont `embedding_vector` est NULL.

- Triggers / Edge Functions:
  - Aucun trigger SQL n'est présent dans les migrations pour calculer automatiquement `embedding_vector` à l'INSERT/UPDATE.
  - Aucune Edge Function/Background job dans le repo n'est déclarée pour calculer automatiquement l'embedding lors de l'écriture (on a uniquement le script de backfill `scripts/generateJobEmbeddings.ts`).

## 5) Problèmes actuels observés

- Raison principale pour laquelle des candidats voient "Aucune recommandation":
  1. Soit le candidat n'a pas de `cv_text`/`embedding_vector` côté serveur (par ex. l'extraction PDF n'a pas été persistée),
  2. Soit les offres pertinentes n'ont pas d'`embedding_vector` (NULL), et la RPC filtre ces offres.

- Sources d'embeddings manquants:
  - Les offres créées via l'admin UI ne reçoivent pas d'embedding automatique par `createOffer` / `updateOffer`.
  - Le backfill est manuel (script) ou via la fonction non-diffusée `ensureJobOfferEmbeddings()` (non déclenchée automatiquement).

## 6) Recommandations d'architecture (pour éviter que `embedding_vector = NULL`)

Objectif: garantir à l'avenir que toute offre insérée ou mise à jour ait un `embedding_vector` valide (même si celui-ci est la version locale/fallback), et avoir des mécanismes de réparation automatique.

- Recommandation principale (robuste et simple à déployer):
  1. Ajouter la génération d'embedding dans la chaîne serveur/centralisée qui gère les écritures vers `job_offers`.
     - Implémentation pratique: extraire `createEmbeddingVectorString` dans un module réutilisable côté serveur (ou réexporter `aiMatchingService.createEmbeddingVectorString`) et l'appeler depuis `jobsApi.createOffer` et `jobsApi.updateOffer` **avant** d'appeler Supabase, en ajoutant `embedding_vector` au payload.
     - Avantage: pas besoin de changer la base, pas d'Edge Function; toute écriture via l'API front (admin) produit un embedding immédiatement.
     - Attention: dans ce repo, `jobsApi` est exécuté côté client (navigateur) avec la clef anonyme — c'est acceptable pour un calcul déterministe non sensible, mais idéalement il faudrait centraliser cette logique sur un backend / Edge Function avec la clé service-role si l'on veut empêcher des clients malicieux de manipuler directement les vecteurs.

- Recommandation serveur-centralisé (plus sécurisé):
  2. Créer une Edge Function ou un petit service (Serverless/Cloud Function) qui expose un endpoint `POST /admin/job-offers` et `PATCH /admin/job-offers/:id` que l'admin UI appellera.
     - L'Edge Function calculera `embedding_vector` via la même fonction déterministe (ou via un provider externe si on veut embeddings sémantiques réels) et écrira en base en utilisant la clé service-role.
     - Avantage: centralise la logique, évite d'exposer la clé service-role, et garantit l'unicité du process.

- Recommandation DB/fallback (sécurité supplémentaire):
  3. Ajouter un Trigger/Postgres function en tant que filet de sécurité qui, après INSERT/UPDATE, vérifie `embedding_vector` et si NULL envoie la row à une queue (table `jobs_to_embed`) ou appelle une HTTP webhook (Edge Function) pour calculer/patcher l'embedding.
     - Raison: Postgres seul ne sait pas calculer le vecteur si l'algorithme est en TypeScript; la stratégie trigger -> queue/process worker garantit réparation automatique.

- Recommandation opérationnelle immédiate (courte durée):
  4. Ajouter dans le déploiement une étape post-migration qui exécute `scripts/generateJobEmbeddings.ts` pour backfiller toutes les offres existantes. Automatiser ce script pour tourner une fois après la migration ou périodiquement (cron) jusqu'à ce que le % de NULL tombe à 0.

- Autres recommandations techniques:
  - Standardiser et exporter une seule implémentation de `createEmbeddingVectorString` (ex: `src/services/embeddings/jobEmbedding.ts`) et importer cette fonction partout (script, services, Edge Function). Eviter code dupliqué (actuellement présent en 3 endroits).
  - Après remplissage initial, exécuter `ANALYZE` et `REINDEX` sur la colonne `job_offers.embedding_vector` pour que l'index `ivfflat` soit correctement construit.
  - Ajouter des tests automatisés (unit + integration) qui vérifient que `createOffer`/`updateOffer` produisent bien `embedding_vector` non-NULL.
  - Ajouter un monitoring/alerting simple: comptage périodique de `job_offers` WHERE `embedding_vector IS NULL` et alerte Slack/email si > 0.

## 7) Plan d'action concret (priorisé)

1. Court terme (1-2 jours):
   - Extraire/centraliser `createEmbeddingVectorString` dans un module unique et importer dans `scripts/generateJobEmbeddings.ts` et `src/services/aiMatchingService.ts`.
   - Modifier `src/features/jobs/api/jobsApi.ts` pour calculer `embedding_vector` lors de `createOffer` et `updateOffer` (ajouter champ au payload si absent).
   - Lancer `npm run generate:job-embeddings` une fois pour backfiller les offres existantes.

2. Moyen terme (1-2 semaines):
   - Si vous voulez durcir la sécurité, créer une Edge Function (ou petit backend) qui centralise les writes et calcule l'embedding avant d'écrire (utilise la clé service-role).
   - Ajouter un trigger SQL minimal qui envoie les rows sans embedding vers une table de queue pour traitement asynchrone (worker qui calcule et met à jour).

3. Long terme / production-ready:
   - Mettre en place monitoring + alerting sur les offres avec `embedding_vector IS NULL`.
   - Ajouter tests E2E qui couvrent upload CV -> création embedding candidat -> matching RPC -> résultat non-vide.

## 8) Fichiers clés / références (emplacement dans le repo)

- Calcul embedding (client/server):
  - `src/services/aiMatchingService.ts` — `createEmbeddingVectorString(text)` & `ensureJobOfferEmbeddings()`
  - `src/services/matchScoreUtils.ts` — même algorithme local
  - `scripts/generateJobEmbeddings.ts` — backfill script

- Création / mise à jour d'offres:
  - `src/features/jobs/api/jobsApi.ts` — `createOffer`, `updateOffer`
  - `src/pages/admin/AdminJobsPage.tsx` — UI admin qui appelle `jobService`

- DB / matching RPC / migrations:
  - `supabase/migrations/2026_add_pgvector_matching.sql` — migration ajoutant `embedding_vector` et RPC `match_job_offers_for_candidate`
  - `supabase/migrations/20260727_update_match_job_offers_for_candidate_pagination.sql` — RPC paginée et filtrage offes expirées

## 9) Conclusion (résumé)

Actuellement l'infrastructure fournit:
- une fonction locale de génération d'embeddings déterministe,
- un script de backfill manuel,
- une RPC Postgres qui nécessite `job_offers.embedding_vector` non-NULL pour retourner des recommandations.

Problème: la création/mise à jour d'offres ne calcule pas systématiquement l'embedding, d'où des résultats vides côté matching.

Solution recommandée et prioritaire: calculer et inclure `embedding_vector` au moment de l'INSERT/UPDATE (soit directement dans `jobsApi`, soit via une Edge Function côté serveur). En complément, automatiser le backfill et ajouter un filet de sécurité (trigger/queue) + monitoring.

---

Si tu veux, j'applique la première étape (extraire la fonction `createEmbeddingVectorString` dans un module partagé et modifier `jobsApi.createOffer` / `updateOffer` pour inclure `embedding_vector` automatiquement) — je peux créer le patch et exécuter un backfill local avec `npm run generate:job-embeddings`.
# Audit embeddings job_offers

## 1. Points d’entrée / création d’offres

### Fichiers et services concernés
- `src/features/jobs/api/jobsApi.ts`
  - `jobService.createOffer(data: JobOfferInsert)` réalise l’insertion d’une offre dans `job_offers`.
  - `jobService.updateOffer(id: string, data: JobOfferUpdate)` réalise la mise à jour d’une offre.
- `src/pages/admin/AdminJobsPage.tsx`
  - UI de gestion des jobs, appelle `jobService.createOffer` / `jobService.updateOffer`.
- `src/pages/admin/AdminJobCreatePage.tsx`
  - UI de création d’annonces, appelle `jobService.createOffer`.

### Endpoint / flux API
- Il n’existe pas d’endpoint API REST ou fonction serverless explicite dans le dépôt qui gère la création/mise à jour de `job_offers` autrement que via le client Supabase dans `jobsApi.ts`.
- Les opérations `insert` et `update` passent toutes par le même service Supabase client `supabase.from("job_offers")`.

### Embedding généré au moment de CREATE/UPDATE ?
- Non, la création et la mise à jour d’offres dans `jobService` ne génèrent pas d’`embedding_vector`.
- Les payloads d’insertion et de mise à jour construits dans l’UI (`AdminJobsPage.tsx`, `AdminJobCreatePage.tsx`) n’incluent pas `embedding_vector`.
- Il n’y a aucun appel direct à `createEmbeddingVectorString` ou à un calcul d’embeddings dans `jobsApi.ts`.

## 2. Service d’embedding existant

### Module/service utilisé
- Le seul service d’embedding existant pour `job_offers` est un utilitaire maison dans `src/services/aiMatchingService.ts` et le script `scripts/generateJobEmbeddings.ts`.
- Ce n’est pas HuggingFace, OpenAI ou Groq. Il s’agit d’un algorithme local de type "bag-of-words/token hashing" qui produit un vecteur 768 dimensions.

### Détails de l’implémentation
- `src/services/aiMatchingService.ts`
  - `createEmbeddingVectorString(text: string): string`
  - Normalise le texte (`toLowerCase`, collapse espaces), extrait les tokens `[a-z0-9]+`, puis fait un hashing simple par token dans un vecteur 768 dimensions.
  - Le vecteur est ensuite normalisé en longueur 1 et converti en chaîne JSON-like `[...]`.
- `scripts/generateJobEmbeddings.ts`
  - Reprend la même logique `createEmbeddingVectorString(text)` avec un vecteur 768 dimensions.
  - Construit le texte à vectoriser via `buildJobText(job)`.

### Chaîne de texte à vectoriser
- Dans `scripts/generateJobEmbeddings.ts` :
  - `title`, `company`, `location_city`, `description`, `requirements`
  - Tous les champs sont joints par un espace (`.join(" ")`).
- Dans `src/services/aiMatchingService.ts::ensureJobOfferEmbeddings()` :
  - `title`, `company`, `description`, `requirements`, `location_city`, `contract_type`
  - Les champs sont joints par `\n`.

### Remarque
- La logique d’embeddings est purement locale et heuristique, sans service externe.
- Elle est utilisée pour deux objectifs différents :
  - remplir `job_offers.embedding_vector`
  - calcul de score sémantique de fallback dans `src/services/matchScoreUtils.ts`

## 3. Schéma de base de données & Supabase

### Configuration de la colonne `embedding_vector`
- Migration `supabase/migrations/2026_add_pgvector_matching.sql` :
  - `ALTER TABLE IF EXISTS public.job_offers ADD COLUMN IF NOT EXISTS embedding_vector vector(768);`
- Type SQL : `vector(768)`.
- Le typage TypeScript de `job_offers` est dans `src/integrations/supabase/types.ts` :
  - `embedding_vector: string | null` dans `Row`
  - `embedding_vector?: string | null` dans `Insert` et `Update`

### Indexation vectorielle
- La migration crée un index `ivfflat` sur `job_offers.embedding_vector` :
  - `CREATE INDEX idx_job_offers_embedding_vector_ivfflat ON public.job_offers USING ivfflat (embedding_vector vector_l2_ops) WITH (lists = 100);`
- Il existe également un index pour les candidats `idx_candidates_embedding_vector_ivfflat`.

### Triggers / RPC / Edge Functions liés à `job_offers`
- Triggers SQL présents :
  - `set_job_offers_updated_at` (trigger BEFORE UPDATE) : met à jour automatiquement `updated_at`.
  - `trg_notify_job_published` (trigger AFTER INSERT OR UPDATE OF status) dans `20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql`.
  - Le dépôt contient une migration commentée pour un trigger de notifications sur `job_offers`, mais ce n’est pas lié aux embeddings.
- RPC existant :
  - `public.match_job_offers_for_candidate(candidate_id, match_threshold, match_count[, match_offset])`
  - Cette fonction filtre `job_offers.embedding_vector IS NOT NULL` et utilise `1 - (cand.embedding_vector <=> job_offers.embedding_vector)` pour calculer la similarité.
- Edge Functions / fonctions serverless :
  - Aucun Edge Function ou fonction serverless spécifique à `job_offers` n’a été trouvé dans le dépôt.

### Remarque sur le match vectoriel
- Le RPC ne renvoie aucune offre dont `embedding_vector` est `NULL`.
- Cela signifie que si des offres existent sans embedding, elles sont automatiquement exclues du matching.

## 4. Recommandations sur le choix de l’architecture

### Constats principaux
- À ce stade, la génération d’embeddings n’est pas intégrée dans le flux INSERT/UPDATE de `job_offers`.
- La seule source de génération d’embeddings pour les offres est un script de maintenance (`scripts/generateJobEmbeddings.ts`) et une fonction interne non appelée (`ensureJobOfferEmbeddings()` dans `src/services/aiMatchingService.ts`).
- Il n’existe pas de mécanisme garanti pour remplir `job_offers.embedding_vector` au moment de la création ou de la mise à jour.
- Le matching dépend explicitement de `job_offers.embedding_vector` non nul.

### Meilleure approche pour éviter `embedding_vector = NULL`

#### Option recommandée : calcul côté TypeScript au moment du INSERT/UPDATE
- Avantages :
  - cohérence immédiate : une offre créée ou modifiée gagne son embedding avant la persistance ou juste après,
  - contrôle total dans le même code métier que l’édition des offres,
  - possibilité de logger les erreurs et fallback si le calcul échoue.
- Ce qu’il faut faire :
  - ajouter un calcul d’`embedding_vector` dans `jobService.createOffer` et `jobService.updateOffer`, ou dans une couche métier qui les enveloppe,
  - utiliser un service unique (par exemple `aiEmbeddingService.ts`) pour produire le vecteur,
  - ne jamais insérer une offre publiée sans embedding si l’objectif est le matching.

#### Option secondaire : trigger Supabase / fonction Postgres
- Un trigger SQL `BEFORE INSERT OR UPDATE` pourrait remplir automatiquement la colonne.
- Mais il ne peut pas exécuter le calcul d’embedding local JavaScript.
- Cette architecture serait intéressante uniquement si le calcul est déplacé vers une Edge Function ou si Supabase supporte l’appel à un service externe déclenché par trigger.
- Sans cette intégration externe, le trigger ne ferait que vérifier la présence du champ, pas le générer.

#### Option recommandée pour la stack actuelle
- Meilleure solution : intégrer la génération d’embeddings dans le service TypeScript côté application / backend.
- Pour garantir qu’aucune offre n’ait `NULL` :
  1. générer `embedding_vector` dans `createOffer` et `updateOffer`.
  2. refuser ou journaliser une mise à jour/création si le calcul échoue.
  3. conserver la colonne `embedding_vector` dans les payloads d’`Insert` et `Update` lorsqu’elle est disponible.
  4. exécuter ensuite une migration ou un script de seed unique pour corriger les anciens enregistrements.

### Recommandation de guard supplémentaire
- Ajouter une vérification de cohérence périodique / script de maintenance :
  - rechercher `job_offers` où `embedding_vector IS NULL`
  - régénérer les embeddings manquants
- Ce script existe déjà (`scripts/generateJobEmbeddings.ts`) ; il doit être formalisé comme script d’entretien plus que comme seule solution.

### Recommandation finale
- Pour que plus jamais une offre n’ait `embedding_vector = NULL` :
  - implémenter le calcul dans `jobService.createOffer` et `jobService.updateOffer`,
  - conserver le script de backfill pour les données existantes,
  - ajouter un test d’intégration ou une règle automatisée qui vérifie l’absence de `NULL` pour les offres publiées si le matching vectoriel est attendu.

## 5. Observations annexes

- Le modèle d’embedding actuel est heuristique et ne repose pas sur un vrai modèle de langage. Si l’objectif est un matching vectoriel sémantique robuste, une vraie intégration OpenAI/HuggingFace/Groq devra être envisagée.
- La logique de matching vectoriel existe déjà côté base (`match_job_offers_for_candidate`) mais elle ne peut fonctionner correctement que si les embeddings sont réellement peuplés.
- La table `job_offers` comporte déjà des politiques RLS, ce qui signifie qu’un éventuel rewrite côté serveur doit conserver le même schéma de permissions.
- L’implémentation actuelle du `match_job_offers_for_candidate` a été renforcée par `20260727_update_match_job_offers_for_candidate_pagination.sql` pour n’inclure que les offres publiées et valides.
