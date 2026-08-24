## Profil candidat — informations personnelles

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il remplit nom, prénom, email, téléphone, bio, titre, localisation, date de naissance via `candidates` et les formulaires de profil.

**Ce qui se passe techniquement :** `updateCandidateProfile()` filtre les champs autorisés puis envoie un `update()` sur la table `candidates` via Supabase.

**Données réellement utilisées :** `first_name`, `last_name`, `email`, `phone`, `avatar_url`, `bio`, `headline`, `location_city`, `location_country`, `date_of_birth`, `status`.

**Résultat réellement obtenu :** Le profil est persisté et réaffiché dans `CandidateProfileCenter` / `CandidateDashboardPage`.

**Limites actuelles :** Les champs acceptés sont strictement limités; beaucoup d’éléments ne sont pas mis à jour si le code ne les autorise pas.

**Verdict :** Le profil de base est bien connecté au flux de données réel.

---

## Profil candidat — expérience, formation, compétences, langues, préférences

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il ajoute/supprime/modifie des expériences (`candidate_experience`), formations (`candidate_education`), compétences (`candidate_skills`), langues (`candidate_languages`) et préférences (`candidate_preferences`).

**Ce qui se passe techniquement :** Chaque domaine a son API dédiée (`experiencesApi.ts`, `educationApi.ts`, `skillsApi.ts`, `languagesApi.ts`, `preferencesApi.ts`) qui lit/écrit directement Supabase.

**Données réellement utilisées :** Expériences : poste, entreprise, description, dates, `is_current`; formations : école, diplôme, domaine, dates; compétences : nom + niveau; langues : nom + niveau; préférences : types de contrat, types de travail, salaire, mobilité, disponibilité, alertes emploi.

**Résultat réellement obtenu :** Les données servent à l’affichage du profil, au calcul de complétude et à la personnalisation des recommandations.

**Limites actuelles :** Les préférences utilisent un fallback large si la table n’a pas les colonnes complètes; elles ne sont pas un moteur de matching complet, seulement un signal utilisé ailleurs.

**Verdict :** C’est un vrai CRUD candidat sur des données persistées, pas seulement de l’UI.

---

## Profil candidat — score ou pourcentage de complétude

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il voit un pourcentage de complétude du profil sur le dashboard.

**Ce qui se passe techniquement :** `useProfileCompletion()` compte un ensemble de blocs : nom, titre, localisation, bio, expérience, formation, compétences, langue, préférences. Le total est calculé en pourcentage.

**Données réellement utilisées :** Les données de `profile`, `experiences`, `educations`, `skills`, `languages`, `preferences` récupérées dans Supabase.

**Résultat réellement obtenu :** `completionPercentage` est affiché dans `CandidateDashboardPage`.

**Limites actuelles :** Il ne mesure pas une vraie “qualité du profil” métier; c’est un score de complétude structurelle, pas de score RH.

**Verdict :** Fonctionnel, mais uniquement comme indicateur de complétude, pas de qualité ou de performance.

---

## Profil candidat — recommandations pour compléter le profil

**Statut :** Partielle

**Ce que fait réellement le candidat :** Il reçoit un message “Compléter votre profil” et des liens directs vers les sections manquantes.

**Ce qui se passe techniquement :** `CandidateDashboardPage` construit `nextAction` à partir des champs manquants; des notifications sont créées via `createUniqueNotification()`.

**Données réellement utilisées :** Résultat de `useProfileCompletion()` + `profile?.cv_last_updated_at` + `preferences.*`.

**Résultat réellement obtenu :** Le candidat voit une action guidée, pas un moteur d’aide intelligent.

**Limites actuelles :** C’est une logique locale de recommandation d’actions, pas un système d’aide personnalisé au sens IA.

**Verdict :** Fonctionnel, mais très simple et directement piloté par l’état local + Supabase.

---

## CV et documents

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il télécharge un CV PDF; le système le stocke et tente d’extraire le texte du PDF. Il peut aussi ajouter des documents annexes (lettre de motivation, diplômes, certificat, attestation, portfolio, autre).

**Ce qui se passe techniquement :** `uploadAndProcessCandidateCV()` envoie le fichier à `uploadFileToStorage()`, puis appelle `processCandidateCvUpload()`. `extractTextFromPdfData()` utilise `pdfjs-dist` pour lire le PDF, puis `updateCandidateCvText()` enregistre `cv_text` et `embedding_vector` dans `candidates`.

**Données réellement utilisées :** `candidates.cv_url`, `candidates.cv_text`, `candidates.embedding_vector`, `candidates.cv_last_updated_at`, et `emploiplus-candidate-documents-*` dans `localStorage`.

**Résultat réellement obtenu :** Le CV est stocké, son texte est extrait et utilisé pour les recommandations et l’analyse. Le document reste lié au candidat.

**Limites actuelles :** Seuls les PDF sont acceptés (`ALLOWED_DOCUMENT_MIME_TYPES` = `application/pdf`); la logique de documents annexes est surtout du stockage local/BDD, pas un workflow complet d’édition ou de validation.

**Verdict :** Le flux CV est concret et fonctionnel; ce n’est pas seulement visuel.

---

## Recherche d’offres

**Statut :** Partielle

**Ce que fait réellement le candidat :** Il peut saisir des mots-clés, choisir des filtres, trier, enregistrer une recherche et consulter l’historique.

**Ce qui se passe techniquement :** `jobService.searchOffers()` applique `ilike`/`or` sur `job_offers`; `getSavedJobSearches()`, `saveJobSearch()`, `getSearchHistory()`, `recordSearchHistory()` lisent/écrivent les tables `candidate_saved_searches` et `candidate_search_history`.

**Données réellement utilisées :** `job_offers` + `candidate_saved_searches` + `candidate_search_history`.

**Résultat réellement obtenu :** Les résultats sont filtrés côté base selon `query`, `company`, `location`, `contractType`, `order` et `limit`.

**Limites actuelles :** Les suggestions sont basées sur un helper local dans `getSearchSuggestion()`; le “historique” est simplement conservé en table, pas un moteur de recherche avancé complet. Les recommandations affichées dans la recherche coexistent avec le flux de recherche principal.

**Verdict :** La recherche de base est réelle, mais des éléments visuels ou “avancés” ne sont pas un vrai moteur métier complet.

---

## Offres sauvegardées

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il clique sur “Enregistrer l’offre”. Le système enregistre le lien entre candidat et offre.

**Ce qui se passe techniquement :** `saveJobOffer(candidateId, jobOfferId)` vérifie l’absence de doublon puis insère dans `candidate_saved_offers`. `getCandidateSavedOffers()` relie `job_offer_id` vers `job_offers`. `unsaveJobOffer()` supprime la ligne.

**Données réellement utilisées :** Table `candidate_saved_offers`, with `candidate_id`, `job_offer_id`, `saved_at`.

**Résultat réellement obtenu :** L’offre est visible dans la page “Offres enregistrées”; elle est liée à l’utilisateur et conditionnée par `MAX_SAVED_OFFERS = 5`.

**Limites actuelles :** Le code appelle cette page `saved-jobs` dans le sidebar et `saved-offers` dans les routes, mais la table est `candidate_saved_offers`; il s’agit du même flux, pas deux systèmes distincts.

**Verdict :** C’est un vrai flux de favoris avec limite, persistance et suppression.

---

## Matching IA / recommandations

**Statut :** Partielle, avec vraie couche RPC et fallback local

**Ce que fait réellement le candidat :** Il voit des offres recommandées sur le dashboard et sur la page `jobs` quand un CV est présent.

**Ce qui se passe techniquement :** `getRecommendedJobs()` appelle `supabase.rpc("match_job_offers_for_candidate", ...)`. Si le score RPC est abscent ou identique, il fait un fallback local avec `computeMatchScore()` basé sur `computeMatchScoreFromText()`.

**Données réellement utilisées :** `candidates.cv_text`, `candidates.embedding_vector`, `job_offers.title/company/description/requirements/location_city/contract_type`, et la table `ai_analysis_cache` pour le cache.

**Résultat réellement obtenu :** Les offres sont triées/annotées avec un `score` affiché dans l’UI si le score est présent.

**Limites actuelles :** Le mécanisme n’est pas un embedding vectoriel “sémantique” avancé; il s’agit d’un vecteur léger calculé par hashage de texte (`createEmbeddingVectorString()`), puis comparé côté RPC. Il y a un fallback local simple basé sur mots clés et score textuel, pas un vrai modèle d’embedding externe.

**Verdict :** Il existe bien un mécanisme de matching réel, mais il est hybride, léger et pas entièrement “IA générative”.

---

## Analyse CV ↔ offre

**Statut :** Réellement fonctionnelle, mais dépend de Groq et d’un cache

**Ce que fait réellement le candidat :** Il clique sur “Lancer l’analyse de ma compatibilité” sur la page détail d’une offre.

**Ce qui se passe techniquement :** `analyzeCandidateForJob(candidateId, jobId)` charge le CV du candidat, récupère l’offre, appelle Groq via `https://api.groq.com/openai/v1/chat/completions`, parse le JSON, puis le cache dans `ai_analysis_cache`.

**Données réellement utilisées :** `candidates.cv_text`, `job_offers.title/company/description/requirements`, et le prompt généré par `buildGroqAnalysisPrompt()`.

**Résultat réellement obtenu :** Le UI affiche `match_score`, `strengths`, `gaps`, `cover_letter_draft` et un résumé éventuel.

**Limites actuelles :** Le score et le texte sont générés dynamiquement par Groq; il n’y a pas de logique de scoring métier plus robuste que le prompt + extraction PDF + parsing JSON. Si la clé Groq manque, le flux échoue.

**Verdict :** C’est un vrai flux d’analyse dynamique, pas un écran statique.

---

## Génération automatique de lettre de motivation

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il lance une analyse sur une offre; le système génère un brouillon de lettre de motivation.

**Ce qui se passe techniquement :** `analyzeCandidateForJob()` renvoie `cover_letter_draft` ; `handleCopyLetter()` copie le texte vers le presse-papiers.

**Données réellement utilisées :** CV de candidat + description et exigences de l’offre + prompt Groq.

**Résultat réellement obtenu :** Le texte est affiché dans la page détail, avec bouton “Copier la lettre”. Il n’est pas automatiquement enregistré dans une candidature sans action supplémentaire.

**Limites actuelles :** Le texte n’est pas intégré automatiquement dans le formulaire de candidature; il sert de brouillon à copier/coller.

**Verdict :** La génération existe et fonctionne, mais elle est d’usage manuel, pas de flux d’édition automatique.

---

## Candidature

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il accède à la page `CandidateJobApplyPage`, remplit le formulaire, optionnellement ajoute une lettre de motivation et envoie la candidature.

**Ce qui se passe techniquement :** `applyToJob()` vérifie le cooldown de 30 jours (`APPLICATION_COOLDOWN_DAYS = 30`) puis insère dans `job_applications` avec `status: "submitted"`.

**Données réellement utilisées :** `job_applications` + `cover_letter` + `subject` + `applied_at` + `status` + `candidate_id` + `job_offer_id`.

**Résultat réellement obtenu :** La candidature est créée, puis visible dans l’espace candidat. Un notification est créée au retrait de candidature.

**Limites actuelles :** La logique de doublon est basée sur `candidate_id + job_offer_id`, avec un cooldown de 30 jours, mais il n’y a pas de preuve d’un workflow complet de pièces jointes “à envoyer” depuis le formulaire; le document annexé est surtout géré au niveau CV/document, pas dans la table candidature.

**Verdict :** Le parcours de candidature est bien réel et persistant.

---

## Suivi des candidatures

**Statut :** Partielle

**Ce que fait réellement le candidat :** Il voit la liste de ses candidatures et leurs statuts.

**Ce qui se passe techniquement :** `getCandidateApplications()` lit `job_applications`, et `withdrawApplication()` met à jour le statut vers `withdrawn`.

**Données réellement utilisées :** `status`, `applied_at`, `updated_at`, `cover_letter`, `job_offer_id`, `candidate_id`.

**Résultat réellement obtenu :** Le statut est affiché côté front dans `CandidateApplicationsPage`.

**Limites actuelles :** Le code ne montre pas un vrai workflow d’étapes multiphases; il semble surtout s’appuyer sur un statut simple et sur une date de mise à jour, pas sur un historique exhaustif d’étapes métier.

**Verdict :** Suivi réel mais simple, sans vraie gestion d’étapes RH avancée.

---

## Notifications

**Statut :** Réellement fonctionnelle

**Ce que fait réellement le candidat :** Il reçoit des messages stockés dans `notifications`, visibles dans la zone notifications.

**Ce qui se passe techniquement :** `createUniqueNotification()`, `createNotification()`, `updateNotification()`, `toggleNotificationVisibility()`, `deleteNotification()` manipulent la table `notifications`.

**Données réellement utilisées :** `user_id`, `type`, `title`, `body`, `is_read`, `status`, `link`, `created_at`.

**Résultat réellement obtenu :** Les notifications sont lues / non lues, filtrées par statut actif, et affichées dans l’UI.

**Limites actuelles :** Il n’y a pas de preuve d’alertes emploi WhatsApp/SMS ou email ; le code ne montre qu’un système de notification interne Supabase. Les types disponibles sont `candidature`, `admin`, `evenement`, `offre`, `contact`, `job`, `blog`.

**Verdict :** Le site a bien un système de notification interne fonctionnel, mais pas de canal externe certifié.

---

## Onboarding

**Statut :** Partielle

**Ce que fait réellement le candidat :** Il peut voir un carrousel d’onboarding et cliquer sur “Commencer”.

**Ce qui se passe techniquement :** `CandidateOnboardingPage` vérifie `localStorage` via `emploiplus_candidate_onboarding_pending` et `emploiplus_candidate_onboarding_completed`. Il ne lit/écrit pas de table Supabase pour l’état de l’onboarding lui-même.

**Données réellement utilisées :** `localStorage` du navigateur, puis redirect vers `/candidate/dashboard`.

**Résultat réellement obtenu :** L’onboarding s’affiche une fois et redirige ensuite vers le dashboard.

**Limites actuelles :** Il ne dépend pas de l’authentification ni de la BDD pour l’état “à faire / terminé”; il est piloté côté navigateur. Le “rôle exact du localStorage” est donc central, pas la base de données.

**Verdict :** L’onboarding est réel dans l’UI, mais son état est géré localement et non en base.

---

### 1. Les fonctionnalités réellement les plus avancées

- CV upload + extraction PDF + stockage + recommandations
- Candidature avec cooldown + enregistrement + suivi simple
- Matching/recommandations hybrides via RPC + fallback local

### 2. Les fonctionnalités réellement partielles

- Recherche d’offres avancée visuellement mais sans moteur ultra-complet
- Analyse CV ↔ offre, qui dépend fortement de Groq et d’un prompt
- Onboarding, piloté par `localStorage` non base

### 3. Les fonctionnalités que l’interface laisse croire plus avancées qu’elles ne le sont

- “Matching IA” complet et “score de compatibilité” très détaillé : existe, mais c’est un système hybride et pas un embedding vrai orienté ML avancé
- “Lettre de motivation personnalisée” : elle est générée, mais dans un brouillon à copier, pas intégrée automatiquement
- “Suivi des candidatures” étape par étape : la base montre surtout un statut simple

### 4. Les 5 éléments que je dois particulièrement comprendre avant de décider des prochaines améliorations

1. Le vrai cœur fonctionnel est le flux CV → `cv_text` + `embedding_vector` → recommandations / analyse.
2. Le matching est hybride: RPC Supabase + fallback local textuel, pas uniquement “IA générative”.
3. La candidature est vraiment enregistrée dans `job_applications`, avec protection anti-double et cooldown.
4. Les notifications sont internes Supabase; pas de preuve d’email/SMS/WhatsApp.
5. Les éléments “visuels” ou “promis” (lettre auto, onboarding complet, suivi complet) sont plus partiels que le site le suggère.
