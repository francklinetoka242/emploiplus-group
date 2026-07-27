**Offres recommandées pour votre profil**

Description
- Section présente sur le tableau de bord candidat.
- Objectif : proposer automatiquement des offres pertinentes en se basant sur le CV du candidat (texte extrait ou embedding) et sur les embeddings des offres (pgvector).
- Texte affiché dans l'UI : titre, description courte, score (si disponible), et lien vers l'offre.

Flux de fonctionnement (en résumé)
1. Le composant UI (`CandidateDashboardPage`) détecte l'ID du candidat et la présence d'un CV :
   - recherche d'un CV côté client dans `localStorage` (`emploiplus-candidate-documents-<candidateId>`)
   - lecture du `profile.cv_text` ou `profile.embedding_vector` (champ serveur)
2. Si un CV/embedding est disponible, le composant appelle le service `getRecommendedJobs(candidateId, threshold, count)`.
3. `getRecommendedJobs` :
   - appelle la RPC Postgres `match_job_offers_for_candidate(candidate_id, match_threshold, match_count)` via Supabase RPC
   - récupère ensuite `candidates.cv_text` pour vérifier la présence du texte extrait
   - si la RPC renvoie des scores manquants ou identiques, `getRecommendedJobs` calcule un fallback local via `computeMatchScore()`
   - renvoie une liste d'offres enrichies d'un `score` (0..100)
4. Le composant met à jour l'état `recommendedJobs` et affiche les `JobCard` correspondantes.

Pourquoi la section peut afficher "Aucune recommandation disponible" malgré un CV présent

Cas fréquents et diagnostics
- CV seulement stocké côté client (localStorage) et localStorage a été perdu ou vidé (ex : après déconnexion, purge de navigateur). Le service de matching s'appuie sur `cv_text` dans la base pour produire des scores. Si le client n'a pas persisté la mise à jour sur le serveur, la RPC ne peut pas utiliser le CV.
- `cv_text` vide côté serveur : l'extraction PDF n'a pas été enregistrée en base (`processCandidateCvUpload` / `updateCandidateCvText` a échoué). Le code côté serveur vérifie `cv_text` avant d'appeler la logique de matching et peut renvoyer `[]`.
- Embeddings manquants : la RPC `match_job_offers_for_candidate` utilise `candidates.embedding_vector` et `job_offers.embedding_vector`. Si les embeddings des offres sont null (pas pré-calculés), la RPC ne retourne rien.
- Seuil (`match_threshold`) trop strict : si la similarité calculée est inférieure au seuil, la RPC filtre les résultats.
- RPC Postgres échoue silencieusement (erreur réseau, permissions RLS, colonne manquante) : la fonction peut renvoyer `[]` ou une erreur interceptée côté client. Il faut vérifier les logs Supabase / console.
- Cache IA ou logique de filtrage : si l'application s'appuie sur `ai_analysis_cache` ou d'autres filtres (status `published`, dates, etc.), ces filtres peuvent éliminer les résultats.

Que vérifier (liste d'actions rapides)
- Vérifier dans `Supabase Studio` la colonne `candidates.cv_text` et `candidates.embedding_vector` pour le `candidate_id` concerné.
- Vérifier la présence de `cv_url` ou des données dans le `localStorage` du navigateur (`emploiplus-candidate-documents-<id>`).
- Exécuter manuellement la RPC dans SQL editor :

```sql
SELECT * FROM public.match_job_offers_for_candidate('<CANDIDATE_UUID>', 0.15, 6);
```

- Vérifier que `job_offers.embedding_vector` n'est pas `NULL` pour les offres attendues.
- Vérifier la console navigateur pour les logs ajoutés :
  - `[Dashboard] Preparing recommended jobs` (indique l'état initial)
  - `[Dashboard] Calling getRecommendedJobs` et `[Dashboard] getRecommendedJobs returned N jobs`
  - Logs du service `getRecommendedJobs` (ex : `Texte extrait du CV`, `[Matching] Offre: ..., Score Final: ...`).

Solutions et correctifs possibles
- Persister le CV côté serveur après upload : s'assurer que `processCandidateCvUpload` appelle `updateCandidateCvText(candidateId, cvText, cvUrl)` et que `cv_url` est stocké en base. (Déjà implémenté dans le code actuel.)
- Seed/mettre à jour les embeddings des `job_offers` (script `ensureJobOfferEmbeddings` ou migration côté serveur) pour activer la recherche vectorielle.
- Abaisser temporairement le `match_threshold` pour valider que des résultats existent.
- Vérifier les règles RLS et permissions sur la RPC `match_job_offers_for_candidate` et sur `job_offers`.
- Ajouter un fallback UX : afficher un message "Recalcul en cours…" et permettre à l'utilisateur de relancer la recherche manuellement (bouton "Rafraîchir les recommandations").

Résumé / Recommandation
- Cause la plus fréquente : le texte extrait du CV (`cv_text`) n'existe pas en base — le CV était seulement côté client ou l'extraction n'a pas été persistée. Solution : re-uploader ou exécuter `processCandidateCvUpload` pour persister `cv_text` et `embedding_vector`.
- Si `cv_text` est bien présent en base : vérifier les embeddings des offres et la RPC Postgres (`match_job_offers_for_candidate`).

Si vous voulez, je peux :
- Fournir la requête SQL exacte à exécuter dans Supabase pour diagnostiquer un `candidate_id` précis.
- Ajouter un bouton "Rafraîchir recommandations" dans l'UI et une notification toast indiquant que le recalcul est en cours.
- Proposer un petit script pour calculer/mettre à jour les embeddings des offres.
