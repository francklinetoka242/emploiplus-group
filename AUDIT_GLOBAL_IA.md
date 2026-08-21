# AUDIT GLOBAL — UTILISATION DE L’IA
## EmploiPlus Group

**Périmètre :** `src/`, `api/`, `frontend/`, `scripts/`, `supabase/`, `package.json`, déclarations d’environnement. Audit statique ; aucun fichier applicatif n’a été modifié.

## Verdict rapide

Une seule utilisation de modèle est confirmée : une analyse candidat/offre appelée depuis le navigateur et envoyée directement à Groq. Le modèle identifié est `llama-3.1-8b-instant`.

Le matching et les “embeddings” de recommandations sont des calculs déterministes locaux (hachage de tokens, 768 dimensions) stockés puis comparés par pgvector/Supabase. Aucun fournisseur d’embeddings n’est appelé.

## Utilisation confirmée

### Analyse CV, compatibilité et lettre

- **Fonctionnalité :** analyse d’un CV par rapport à une offre, score, forces, lacunes, résumé et brouillon de lettre de motivation.
- **Fichier d’entrée :** `src/pages/public/JobOfferDetailPage.tsx`, fonction `handleAnalyzeClick`.
- **Service :** `src/services/groqAnalysisService.ts`, fonction `analyzeCandidateForJob`.
- **Fournisseur / modèle :** Groq / `llama-3.1-8b-instant`.
- **Endpoint :** `https://api.groq.com/openai/v1/chat/completions`.
- **Requête :** `POST`, `Authorization: Bearer <clé>`, température `0.2`, message utilisateur contenant le prompt, `response_format: { type: "json_object" }`.
- **Données envoyées :** texte intégral `candidates.cv_text` (ou texte extrait localement du PDF), identifiant d’offre, titre, entreprise, description, exigences et nombre d’années détecté.
- **Prompt :** `src/services/groqAnalysisPrompt.ts`; impose une évaluation RH et un objet JSON.
- **Réponse :** `choices[0].message.content`, JSON avec score, expérience vérifiée, forces, lacunes, résumé et `cover_letter_draft`.
- **Traitement :** nettoyage des balises Markdown, extraction/parsing JSON, normalisation du score 0–100 et limitation des listes à 5 éléments.
- **Utilisation :** affichage dans la page d’offre ; le brouillon peut être copié ; résultat persisté dans `ai_analysis_cache`.
- **Exécution :** frontend direct, sans endpoint backend/proxy identifié.
- **Authentification API :** variable `VITE_GROQ_API_KEY`, avec replis `GROQ_API_KEY` côté `import.meta.env`/`process.env`.
- **Statut :** **CONFIRMÉ**.

## Flux principal

Utilisateur connecté → `JobOfferDetailPage.tsx:handleAnalyzeClick` → `analyzeCandidateForJob` → lecture Supabase de `candidates.cv_text` et `job_offers` → construction du prompt → `fetch` navigateur vers Groq → réponse JSON → nettoyage/validation → `ai_analysis_cache` → état React et affichage score/lettre.

Si `cv_text` est vide, le service lit une URL de CV conservée dans `localStorage`, télécharge le PDF et extrait son texte avec `pdfjs-dist`, puis le sauvegarde avant l’appel Groq. Cette extraction n’est pas une IA.

## Matching, vecteurs et Supabase

- **Recommandations candidat/offres :** `CandidateDashboardPage.tsx` appelle `getRecommendedJobs`.
- **Calcul serveur :** RPC `match_job_offers_for_candidate` dans les migrations Supabase ; comparaison pgvector par opérateur `<=>`, tri par similarité.
- **Génération vecteur :** `aiMatchingService.ts:createEmbeddingVectorString` normalise les tokens, les hache dans un tableau de 768 nombres et normalise la magnitude. Aucun modèle appris, API distante ou SDK d’embedding.
- **Stockage :** `candidates.cv_text`, `candidates.embedding_vector`, `job_offers.embedding_vector` et colonnes `vector(768)`.
- **Création/modification d’offres :** `src/features/jobs/api/jobsApi.ts` génère le même vecteur localement.
- **Upload CV :** `documentsApi.ts` → extraction PDF → `updateCandidateCvText` → stockage texte et vecteur → invalidation du cache d’analyse.
- **Fallback :** `matchScoreUtils.ts` calcule localement chevauchement de tokens, années, mots-clés, score de titre, diplôme et similarité des vecteurs hachés.
- **Statut :** **UTILISATION INDIRECTE / NON-IA NEURONALE CONFIRMÉE**. Le nom “embedding” décrit une représentation technique, pas un embedding produit par une IA.

## Services déclarés mais non utilisés

- `VITE_GEMINI_API_KEY` est déclaré dans `src/env.d.ts`, mais aucune implémentation exécutable Gemini, URL ou import associé n’a été trouvé.
- Aucun SDK/package ou appel exécutable trouvé pour OpenAI, Anthropic/Claude, Azure OpenAI, Google AI/Vertex, Mistral, Cohere, Hugging Face, Groq SDK, Perplexity, OpenRouter, Together, Replicate ou Ollama. Groq utilise `fetch` natif.
- `scripts/generateJobEmbeddings.ts` est un script batch manuel utilisant Supabase Service Role et le hachage local ; il n’appelle pas une IA.
- Les occurrences de “Claude” dans les traductions/assets correspondent à un nom de personne, pas au fournisseur Anthropic.
- **Classement :** `PRÉSENT MAIS NON UTILISÉ` pour Gemini ; `À VÉRIFIER` pour toute configuration de déploiement non visible localement.

## Sécurité des clés et appels

| Fournisseur | Utilisé | Frontend direct | Backend/proxy | Clé exposée | Risque |
|---|---|---|---|---|---|
| Groq | Oui | Oui | Non identifié | **OUI si `VITE_GROQ_API_KEY` est configurée** | ÉLEVÉ |
| Gemini | Non prouvé | Non prouvé | Non prouvé | À vérifier | Faible |

- La présence d’un préfixe `VITE_` rend la valeur accessible au bundle navigateur ; aucune valeur secrète n’est reproduite ici.
- Le CV et les données d’offre quittent le navigateur vers Groq : frontière de confidentialité démontrée par le code.
- En développement, le résultat Groq et son contenu sont envoyés à `console.debug`.
- La migration du cache définit `SELECT` et `INSERT`, tandis que le frontend exécute `upsert` et `delete` ; l’`UPDATE`/`DELETE` peut donc être bloqué par RLS selon les politiques déployées.
- La configuration réelle des variables et les appels réellement effectués en production restent **À VÉRIFIER**.

## Tableau final

| Fonctionnalité | Fournisseur | Modèle | Fichier principal | Appel | Données | Résultat | Statut |
|---|---|---|---|---|---|---|---|
| Analyse CV/offre + lettre | Groq | `llama-3.1-8b-instant` | `groqAnalysisService.ts` | `fetch` direct navigateur | CV + offre | Score, analyse, lettre, cache Supabase | CONFIRMÉ |
| Recommandations/matching | Aucun modèle | N/A | `aiMatchingService.ts` + RPC | Supabase RPC/pgvector | Vecteurs hachés CV/offre | Offres triées par similarité | INDIRECT, NON-IA |
| Extraction PDF | `pdfjs-dist` | N/A | `aiMatchingService.ts` | Bibliothèque locale | Fichier PDF | Texte du CV | NON-IA |

## IA et parcours utilisateur

- **Candidat :** l’analyse IA est disponible depuis une page d’offre après connexion ; le CV sert d’entrée et la lettre est générée par Groq.
- **CV/documents :** extraction et représentation vectorielle locales uniquement.
- **Offres/recommandations :** matching déterministe et RPC Supabase ; aucune génération IA confirmée.
- **Admin, blog, SEO, notifications, analytics :** aucun appel modèle prouvé dans les chemins inspectés.

### IA ACTUELLEMENT UTILISÉE

- Analyse candidat/offre, score, synthèse, forces/lacunes et lettre de motivation via Groq.

### SERVICES IA UTILISÉS

- Groq uniquement.

### MODÈLES IDENTIFIÉS

- `llama-3.1-8b-instant`.

### DONNÉES ENVOYÉES À L’IA

- Texte intégral du CV, identifiant d’offre, titre, entreprise, description, exigences et années d’expérience détectées.

### DONNÉES RETOURNÉES PAR L’IA

- Score normalisé, expérience vérifiée, forces, améliorations/lacunes, résumé et brouillon de lettre.

### RISQUES

- Clé Groq exposable côté client si `VITE_GROQ_API_KEY` est définie.
- CV et informations d’offre transmis directement à un tiers.
- Résultat Groq journalisé en développement.
- Incohérence de politiques RLS avec les opérations de mise à jour/suppression du cache.

### CODE IA NON UTILISÉ

- `VITE_GEMINI_API_KEY` déclaré mais aucune utilisation exécutable trouvée.
- Aucun autre fournisseur ou SDK IA trouvé.
- Le script d’embeddings et les vecteurs 768 dimensions sont algorithmiques, pas des appels IA.

### À VÉRIFIER

- Variables effectivement configurées dans les environnements déployés.
- Application des migrations pgvector/cache et permissions RPC en production.
- Existence de données vectorielles en production et fréquence réelle des appels Groq.

### SCORE

**78/100** — Fonction IA principale clairement localisée et résultat structuré, mais clé côté frontend, absence de proxy et distinction confuse entre “embedding” déterministe et IA réduisent la clarté et la sécurité.
