# Audit du système d'analyse IA avec Groq

Date: 2026-07-27

## Vue d'ensemble

Le flux d'analyse Groq est actuellement implémenté dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts), appelé depuis [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx). Le point important est que l'appel Groq est effectué depuis la couche service front-end, et non via une route backend dédiée.

## 1. Sécurité du parsing JSON (JSON.parse)

### Ce qui existe aujourd'hui
- L'appel Groq est envoyé avec un format structuré via `response_format: { type: "json_object" }` dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L194-L216).
- La réponse brute est extraite puis parsée directement avec `JSON.parse(content)` dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L234-L240).
- Avant ce parsing, il n'y a pas de nettoyage du contenu brut : pas de suppression des blocs Markdown ` ```json ... ``` `, pas de retrait de texte parasite, pas de normalisation des caractères invisibles ni des espaces Unicode.

### Risques concrets
- Si l'API retourne un bloc comme ` ```json ... ``` `, la ligne `JSON.parse(content)` échoue.
- Si le modèle ajoute un préambule ou un suffixe texte autour du JSON, le parsing échoue aussi.
- Le code ne met pas en place de fallback de re-parse ni de nettoyage robuste.

### État de sécurité
- Protection partielle : le système prompt demande explicitement un JSON valide, et l'API est appelée avec `response_format: { type: "json_object" }`.
- Protection insuffisante au niveau client : aucune étape de nettoyage, de normalisation ou d'extraction de payload JSON n'est appliquée avant le parse.

## 2. Gestion des champs facultatifs et fallbacks

### Ce qui existe aujourd'hui
- Les entrées d'offre sont normalisées avec des fallback explicites dans [src/services/groqAnalysisPrompt.ts](src/services/groqAnalysisPrompt.ts#L65-L69) :
  - `Titre: ${job.title ?? "Non précisé"}`
  - `Entreprise: ${job.company ?? "Non précisée"}`
  - `Description` et `Profil recherché` utilisent aussi des valeurs par défaut.
- Le service de comparaison gère aussi les cas de CV vide ou absent en tentant une récupération locale dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L97-L136) puis en bloquant l'analyse si aucun texte n'est disponible dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L163-L171).
- La normalisation de la réponse IA est assurée dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L31-L52) :
  - champs manquants → valeurs par défaut,
  - tableaux non valides → tableaux vides,
  - `cover_letter_draft` absent → fallback sur `cover_letter` si présent,
  - scores non numériques → `0`.

### Risques présents
- Les risques de `TypeError` sur les champs facultatifs semblent faibles côté prompt, car les valeurs sont déjà protégées par `??` et les vérifications de type.
- Le risque principal n'est pas un `TypeError` sur les champs d'entrée, mais une logique de fallback partielle : si le CV est vide ou si les données métier sont incomplètes, l'analyse est simplement rejetée ou la réponse est fortement simplifiée.
- La transformation de la réponse IA est plus robuste que l'entrée raw Groq, mais la couche de parsing reste fragile.

## 3. Gestion et invalidation du cache (ai_analysis_cache)

### Cycle de vie du cache
- Le cache est lu via `fetchCachedAnalysis()` dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L54-L77).
- Il est écrit via `persistAnalysis()` dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L79-L95).
- La clé de cache est le couple `candidate_id + job_id`, avec upsert sur la contrainte `candidate_id,job_id`.

### Invalidation actuelle
- L'invalidation du cache est déclenchée uniquement lors du traitement d'upload de CV dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts#L165-L193).
- Ce mécanisme supprime les lignes du cache pour le candidat concerné après mise à jour du CV.
- Il n'existe pas d'invalidation automatique sur :
  - modification du prompt Groq,
  - changement de version du modèle,
  - évolution majeure de la logique métier.

### Limite majeure
- Le système ne possède pas de versioning du prompt ni de signature de prompt/cache. Un changement de prompt peut donc continuer à servir un ancien résultat tant que le cache n'est pas invalidé manuellement ou via un upload CV.

## 4. Gestion des erreurs et rate limits (Groq / 429)

### Ce qui existe aujourd'hui
- L'appel à l'API Groq est fait avec `fetch()` directement dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L194-L216).
- En cas de réponse HTTP non OK, le code lève un message générique : `Le service Groq n’a pas pu produire une analyse pour le moment.` dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L218-L220).
- Les erreurs de parsing ou de contenu vide sont également transformées en messages génériques dans [src/services/groqAnalysisService.ts](src/services/groqAnalysisService.ts#L230-L240).
- Le frontend intercepte cette exception et l'affiche via `analysisError` dans [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx#L259-L272).

### Limites importantes
- Aucun traitement spécifique pour les erreurs 429 (rate limit), timeout ou 500.
- Aucun retry avec backoff exponentiel.
- Aucun `AbortController` ni timeout explicite autour du `fetch`.
- Le statut HTTP n'est pas propagé au frontend ; l'utilisateur reçoit seulement un message texte générique.

## Conclusion

Le système est fonctionnel, mais il reste fragile sur trois points clés :
1. le parsing JSON brut n'est pas suffisamment défendu contre les réponses non strictes de Groq ;
2. le cache est efficace mais peu robuste face aux changements de prompt ou de logique métier ;
3. la gestion des erreurs API est trop générique et ne couvre pas proprement les cas 429/timeout/surcharge.

## Recommandations prioritaires
- Ajouter une fonction de nettoyage/extraire JSON robuste avant `JSON.parse`.
- Introduire un mécanisme d'invalidation du cache basé sur une version de prompt ou un hash de prompt.
- Gérer explicitement les erreurs `429`, `500`, timeout et réseau avec retry/backoff.
