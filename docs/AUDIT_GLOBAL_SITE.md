# Audit global du site

## Objet

Cet audit cartographie les fonctionnalités présentes dans le dépôt, leurs chaînes techniques, leur niveau de fonctionnement et leurs dépendances. Aucun fichier de code n'est modifié par cet audit.

## Architecture générale

- Frontend : Vite, React 19 et React Router.
- Backend principal : Supabase Auth, PostgreSQL, RLS, RPC et Storage.
- APIs serveur : fonctions Vercel dans `api/`.
- Routage principal : `src/App.tsx`.
- Aucun dossier Supabase Edge Functions (`supabase/functions`) n'a été trouvé.

Chaîne générale :

```text
Page
  -> composant
  -> hook
  -> service ou API
  -> Supabase ou API externe
  -> résultat utilisateur
```

## Routes publiques

Routes déclarées dans `src/App.tsx` :

- `/`
- `/about`
- `/services`
- `/services/:slug`
- `/services/hub-candidat-intelligent`
- `/services/solutions-entreprises-bpo`
- `/services/hub-emploi-recrutement/landing`
- `/jobs`
- `/jobs/:slug`
- `/blog`
- `/blog/:slug`
- `/faq`
- `/contact`
- `/politique-de-confidentialite`
- `/mentions-legales`
- `/cgu`
- `/auth`

Fonctionnalités reliées : offres publiées, recherche, détail d'offre, blog, FAQ, contact, pages légales, SEO, JSON-LD, partage social et analytics.

État : **fonctionnel sous réserve de la disponibilité de Supabase et des APIs externes**.

## Zone candidat

Fonctionnalités et routes présentes :

- inscription, connexion, confirmation et déconnexion ;
- mot de passe oublié et réinitialisation ;
- onboarding ;
- Dashboard ;
- profil et édition du profil ;
- expériences, formations, compétences, langues et préférences ;
- CV et documents ;
- guides locaux ;
- candidatures et détail d'une candidature ;
- offres sauvegardées ;
- notifications ;
- compte et paramètres ;
- candidature à une offre ;
- abonnements Free, Premium et Premium+.

Chaîne de profil :

```text
useCandidate()
  -> getCandidateProfileByUserId()
  -> candidates
  -> cache mémoire partagé
  -> composants candidat
```

État :

- authentification : **fonctionnelle** ;
- profil : **fonctionnel** ;
- onboarding : **fonctionnel** ;
- candidatures : **fonctionnelles sous réserve du SMTP** ;
- CV et extraction PDF : **fonctionnels pour les PDF textuels** ;
- guides locaux : **fonctionnels si tables et buckets disponibles** ;
- abonnements : **partiels/visuels**.

Aucune intégration de paiement Stripe, PayPal ou équivalente n'a été identifiée.

## Entreprise et recruteur

Aucune route dédiée `/company`, `/recruiter` ou `/employer` n'a été trouvée.

Des rôles existent dans `src/features/authentication/permissions/rolePermissions.ts`, notamment `company`, `recruiter`, `rh` et `manager`, mais aucune interface métier dédiée n'est branchée.

État : **interface entreprise manquante**.

Les entreprises sont actuellement représentées indirectement par les offres, les candidatures, les analytics et les pages publiques BPO/solutions entreprise.

## Administration

Routes présentes :

- Dashboard ;
- offres et création d'offres ;
- blog et création d'articles ;
- candidats ;
- guides locaux ;
- notifications ;
- analytics offres ;
- SEO ;
- politique de confidentialité ;
- documents légaux ;
- CGU ;
- équipe ;
- FAQ.

Chaîne type :

```text
Page admin
  -> API ou hook métier
  -> Supabase REST ou RPC
  -> table, vue ou fonction SQL
  -> interface administrateur
```

État : **fonctionnel**, dépendant des rôles, permissions, RLS et migrations appliquées.

## Offres d'emploi

Chaîne principale :

```text
JobsPage
  -> useJobs
  -> jobsApi / jobService
  -> job_offers
  -> recherche, filtres et pagination
```

Fonctionnalités identifiées :

- recherche textuelle ;
- filtres par entreprise, localisation et contrat ;
- pagination ;
- publication différée ;
- deadline et expiration ;
- création, modification et suppression admin ;
- offres similaires ;
- sauvegarde candidat ;
- email, WhatsApp et liens externes ;
- génération d'embeddings.

État : **fonctionnel**.

Point de vigilance : plusieurs migrations ont fait évoluer les champs de publication, d'image et de statut. Le comportement réel dépend de l'ordre d'application des migrations Supabase.

## CV et documents

Chaîne CV :

```text
DocumentsSection
  -> uploadAndProcessCandidateCV()
  -> Supabase Storage
  -> extractTextFromPdf()
  -> candidates.cv_text
  -> candidates.embedding_vector
  -> matching et analyse IA
```

La source serveur du CV est constituée de :

- `candidates.cv_url` ;
- `candidates.cv_text` ;
- `candidates.embedding_vector` ;
- `candidates.cv_last_updated_at`.

Les prédicats communs sont centralisés dans `src/features/candidates/api/cvApi.ts`.

Les documents complémentaires utilisent encore principalement la clé navigateur :

```text
emploiplus-candidate-documents-{candidateId}
```

État :

- CV serveur : **fonctionnel** ;
- extraction PDF : **fonctionnelle pour les PDF textuels** ;
- PDF scanné : **non garanti**, aucun OCR n'a été identifié ;
- documents complémentaires : **partiels**, leurs métadonnées restent locales ;
- suppression : le fichier Storage n'est pas systématiquement supprimé avec la métadonnée.

Buckets identifiés : bucket candidat configurable, `public`, `candidat-doc`, `guide-documents`, `guides-images`, bucket offres et bucket blog. La configuration effective doit être vérifiée dans Supabase.

## Matching et recommandations

Chaîne :

```text
Dashboard ou JobsPage
  -> getRecommendedJobs()
  -> match_job_offers_for_candidate()
  -> job_offers
  -> computeStructuredMatchScore()
  -> JobCard
```

Le système utilise :

- pgvector ;
- vecteurs de 768 dimensions ;
- CV ;
- compétences ;
- expériences ;
- formations ;
- langues ;
- préférences ;
- localisation ;
- salaire et contrat.

Le CV doit être présent et analysable côté serveur pour lancer le matching. Le score est calculé sur une échelle de 0 à 100.

État : **fonctionnel sous réserve de l'extension `vector`, des embeddings et des données candidat/offre**.

## Analyse CV vers offre

Chaîne :

```text
JobOfferDetailPage
  -> analyzeCandidateForJob()
  -> ai_analysis_cache
  -> Groq
  -> résultat JSON
  -> cache Supabase
```

Dépendances :

- `VITE_GROQ_API_KEY` ou `GROQ_API_KEY` ;
- endpoint Groq ;
- modèle Llama ;
- `candidates.cv_text`.

État : **fonctionnel sous condition**, dépendant de Groq, de la clé API, des quotas et de la réponse JSON.

## Candidatures

Chaîne :

```text
CandidateJobApplyPage
  -> applyToJob()
  -> job_applications
  -> /api/send-email
  -> SMTP/Nodemailer
```

Fonctionnalités : sélection de documents, pièces jointes, message personnalisé, consentement, anti-duplication, insertion Supabase, envoi email, retrait et suivi.

État : **fonctionnel**, avec un risque métier : l'insertion de la candidature précède l'envoi SMTP. Une candidature peut donc être enregistrée sans email reçu par le recruteur.

## Notifications

Fonctionnalités :

- notifications ciblées ;
- notifications admin ;
- notifications de candidature ;
- lecture et marquage ;
- suppression ;
- compteur non lu ;
- filtrage par type.

Le hook `src/hooks/useNotifications.ts` filtre actuellement les notifications avec `notif.user_id === user.id`. Les notifications broadcast avec `user_id IS NULL` risquent donc de ne pas apparaître côté candidat.

Les notifications automatiques lors de la publication d'une offre sont désactivées.

État : **fonctionnel pour les notifications ciblées, partiel pour les broadcasts**.

## Authentification et autorisation

Systèmes présents :

- Supabase Auth ;
- confirmation email ;
- reset password ;
- rôles et permissions ;
- RLS ;
- route guards ;
- session persistée côté navigateur.

Clé de session identifiée : `emploiplus-auth-token`.

État : **fonctionnel**, dépendant des secrets serveur et du SMTP.

Point de vigilance : certaines APIs semblent journaliser des informations d'authentification ou des payloads détaillés. Ces logs doivent être contrôlés en production.

## Cache navigateur

Clés principales identifiées :

- `emploiplus-auth-token` ;
- `emploiplus-candidate-documents-{id}` ;
- préférences onboarding ;
- ouverture de sidebar ;
- thème ;
- mode éco ;
- consentement cookies ;
- langue ;
- géolocalisation ;
- SEO local.

Aucune fonctionnalité métier persistée directement dans `sessionStorage` n'a été identifiée.

État : session et préférences **fonctionnelles** ; documents complémentaires **partiels** ; CV métier **serveur**.

## APIs et services externes

- Supabase : Auth, REST, RPC et Storage ;
- Groq : analyse CV ;
- SMTP/Nodemailer : emails ;
- `ipapi.co` : géolocalisation ;
- Vercel Analytics ;
- Google Analytics après consentement ;
- WhatsApp et réseaux sociaux via liens externes.

Aucun service de paiement ni Edge Function n'a été identifié.

## Doublons architecturaux

Doublons ou wrappers repérés :

- hooks candidat historiques et hooks feature ;
- services profil historiques et services feature ;
- wrappers dans `src/hooks/` ;
- plusieurs modèles de documents candidat ;
- plusieurs chemins de stockage possibles ;
- anciennes migrations de matching.

Risque : divergence future entre anciennes APIs et implémentations feature.

## Tests et limites

Des tests unitaires/API existent notamment pour l'inscription, la confirmation, la réinitialisation, les rôles, le profil, le matching et l'analyse Groq.

Aucun test end-to-end complet couvrant simultanément :

```text
Page
  -> Hook
  -> Supabase
  -> Storage, SMTP ou API externe
  -> résultat utilisateur
```

n'a été identifié.

Non vérifiable uniquement depuis le dépôt :

- migrations réellement appliquées ;
- buckets réellement présents ;
- politiques RLS actives ;
- secrets `.env` ;
- configuration SMTP de production ;
- quotas Groq ;
- réception effective des emails ;
- données réelles des candidats et des offres.

## Synthèse

Le cœur du site est réellement connecté et fonctionnel : authentification, profil candidat, CV, offres, matching, candidatures, administration et notifications ciblées.

Les principales zones partielles ou manquantes sont :

1. absence d'espace entreprise/recruteur ;
2. abonnements sans paiement ni gestion d'abonnement réelle ;
3. documents secondaires encore dépendants du navigateur ;
4. notifications broadcast probablement invisibles ;
5. dépendance forte à Supabase, SMTP, Storage et Groq ;
6. doublons historiques dans les hooks, APIs et modèles ;
7. absence de tests d'intégration couvrant les parcours complets.
