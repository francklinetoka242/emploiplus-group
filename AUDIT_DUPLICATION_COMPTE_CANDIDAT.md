# Audit des duplications du compte candidat

## 1. Résumé exécutif

Le compte candidat est traversé par plusieurs sources de données qui ne partagent pas toujours le même identifiant, le même cycle de chargement, ni le même point de vérité.

Le constat principal est le suivant :

- Il existe bien un flux candidat principal actif, centré sur le hook [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts).
- Il existe aussi une seconde logique de profil, plus orientée “feature profile”, dans [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) et [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts).
- La complétude est calculée localement dans [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts), et ce calcul est utilisé dans [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) et dans [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx).
- Les documents et le CV utilisent à la fois un stockage local via localStorage et des champs Supabase comme cv_text et cv_url dans la table candidates.
- Le profil candidat est recherché par user_id dans le hook principal, alors que certaines fonctions de service utilisent candidateId / profile.id.
- Le code contient un fallback explicite dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) qui, après timeout, renvoie un profil synthétique avec un id artificiel de type fallback-{user.id}. Cela peut produire des données partielles et des pourcentages différents selon le timing de chargement.

Conformément au besoin, ce document ne modifie ni le code, ni la logique, ni React #185. Il se limite à l’audit architectural et au diagnostic des causes plausibles d’incohérences sur le même compte.

---

## 2. Architecture actuelle du compte candidat

### 2.1 Route principale du compte candidat

La route principale est déclarée dans [src/App.tsx](src/App.tsx).

Les routes du compte candidat sont :

- /candidate/login
- /candidate/signup
- /candidate/forgot-password
- /candidate/reset-password
- /candidate/confirm
- /candidate
- /candidate/dashboard
- /candidate/profile
- /candidate/profile/edit
- /candidate/documents
- /candidate/experience
- /candidate/education
- /candidate/skills
- /candidate/languages
- /candidate/preferences
- /candidate/applications
- /candidate/saved-offers
- /candidate/notifications
- /candidate/settings
- /candidate/jobs/:slug/apply

Le shell principal est [src/pages/candidate/CandidateLayout.tsx](src/pages/candidate/CandidateLayout.tsx). Il embarque :

- [src/components/candidate/CandidateSidebar.tsx](src/components/candidate/CandidateSidebar.tsx)
- [src/components/candidate/CandidateTopbar.tsx](src/components/candidate/CandidateTopbar.tsx)
- [src/components/candidate/CandidateMobileHeader.tsx](src/components/candidate/CandidateMobileHeader.tsx)

### 2.2 Auth et session

L’état d’authentification est porté par :

- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)

Ce provider gère :

- session Supabase
- user
- isAuthenticated
- roles
- permissions

Il ne charge pas le profil candidat lui-même, mais il vérifie l’existence d’un candidat via :

- table candidates
- colonne user_id
- filtre sur session.user.id

### 2.3 Hook du profil candidat principal

Le hook principal du profil candidat est :

- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)

Ce hook :

- lit la session via AuthContext
- appelle getCandidateProfileByUserId(user.id)
- stocke le résultat dans un state local profile
- expose updateProfile et refetch

### 2.4 Hook de profil secondaire / page profile

Le hook alternatif est :

- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)

Il fait :

- baseProfile = useCandidate()
- puis profileService.getProfile(baseProfile.id)
- puis setProfile(data ?? baseProfile)
- updateProfile appelle profileService.updateProfile puis updateBaseProfile

Autrement dit, il reconstruit un second état local de profil à partir du même profil principal.

---

## 3. Toutes les sources de données du compte candidat

### 3.1 Profil candidat

| Élément | Composant / page | Hook | Service | API | Table Supabase | Identifiant | localStorage / cache | Calcul local |
|---|---|---|---|---|---|---|---|---|
| Profil candidat principal | [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) | useCandidate | getCandidateProfileByUserId | [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) | candidates | user_id + fallback id possible | aucune | non |
| Profil candidat secondaire | [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx) | useCandidateProfile | profileService.getProfile | [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts) | candidates | profile.id | aucune | non |
| Auth metadata / rôle candidat | [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) | - | supabase query | Query de candidates | candidates | user_id | aucune | oui, hasCandidateProfile |
| Mise à jour du profil | [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) | useCandidate | updateCandidateProfile | [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) | candidates | id (candidate id) | aucune | buildCandidateProfileUpdatePayload |

### 3.2 CV et documents

| Élément | Composant / page | Hook | Service | API | Table Supabase | Identifiant | localStorage / cache | Calcul local |
|---|---|---|---|---|---|---|---|---|
| Documents candidat | [src/pages/candidate/CandidateDocumentsPage.tsx](src/pages/candidate/CandidateDocumentsPage.tsx) | useCandidateDocuments | getCandidateDocuments | [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts) | localStorage uniquement | profile.id | localStorage key emploiplus-candidate-documents-{profileId} | parsing JSON |
| CV principal | [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx) | useCandidate | useCandidate + local state | documentsApi + profile.cv_url | candidates + localStorage | candidate.id / localStorage key | localStorage + profile.cv_url | upload + extraction PDF |
| Extraction text CV | [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts) | - | updateCandidateCvText | Supabase update | candidates | id | aucune | createEmbeddingVectorString |
| CV fallback | [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) | useCandidate | localStorage + profile.cv_url | Supabase storage | candidates + storage bucket | profile.id | localStorage + signed URL | hydrate local state |

### 3.3 Expériences, formations, compétences, langues, préférences

| Domaine | Implémentation locale | Hook | Service/API | Table | Clé d’identification | localStorage | cache |
|---|---|---|---|---|---|---|---|
| Expériences | [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx) | useCandidate + local state | getCandidateExperiences | candidate_experience | candidate_id | aucun | aucun |
| Formations | [src/features/candidates/hooks/useCandidateEducation.ts](src/features/candidates/hooks/useCandidateEducation.ts) | useCandidateEducation | educationApi | candidate_education | candidate_id | aucun | local state React |
| Compétences | [src/features/candidates/hooks/useCandidateSkills.ts](src/features/candidates/hooks/useCandidateSkills.ts) | useCandidateSkills | skillsApi | candidate_skills | candidate_id | aucun | local state React |
| Langues | [src/features/candidates/hooks/useCandidateLanguages.ts](src/features/candidates/hooks/useCandidateLanguages.ts) | useCandidateLanguages | languagesApi | candidate_languages | candidate_id | aucun | local state React |
| Préférences | [src/features/candidates/hooks/useCandidatePreferences.ts](src/features/candidates/hooks/useCandidatePreferences.ts) | useCandidatePreferences | preferencesApi | candidate_preferences | candidate_id | aucun | local state React |

### 3.4 Candidatures, offres sauvegardées, notifications

| Élément | Hook / fichier | Service/API | Table | Identifiant |
|---|---|---|---|---|
| Candidatures | [src/features/candidates/hooks/useCandidateApplications.ts](src/features/candidates/hooks/useCandidateApplications.ts) | [src/features/candidates/api/applicationsApi.ts](src/features/candidates/api/applicationsApi.ts) | job_applications / candidature | candidate_id |
| Offres sauvegardées | [src/features/candidates/hooks/useCandidateSavedOffers.ts](src/features/candidates/hooks/useCandidateSavedOffers.ts) | [src/features/candidates/api/savedOffersApi.ts](src/features/candidates/api/savedOffersApi.ts) | saved_job_offers | candidate_id |
| Notifications | [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts) | [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) | notifications | user_id + status |

---

## 4. Recherche des doublons de données

### 4.1 Doublons de chargement du profil

Oui, il existe au moins deux chargements de profil distincts sur le même flux candidat.

1. Profil principal via useCandidate :
   - [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
   - appelle getCandidateProfileByUserId(user.id)

2. Profil secondaire via useCandidateProfile :
   - [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)
   - appelle profileService.getProfile(baseProfile.id)

Même profil, mais deux états React distincts :

- baseProfile dans useCandidate
- profile dans useCandidateProfile

Ce n’est pas le même state, donc les mises à jour peuvent diverger au moment où l’un ou l’autre est rafraîchi.

### 4.2 Doublons de services

Oui, il existe une duplication fonctionnelle entre :

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts)

La différence est claire :

- profileApi agit directement sur candidates via id ou user_id
- profileService encapsule le même accès en “service profile” pour les pages profile

Cela ne signifie pas forcément qu’il s’agit de deux tables ; cela signifie que le même modèle est servi par deux couches d’accès.

### 4.3 Doublons de calculs de complétude

Il existe un calcul unique actif de complétude dans :

- [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)

Le dashboard le consomme dans :

- [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)

La page profile le consomme aussi dans :

- [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx)

Il n’y a pas de second calcul “database-backed” de complétude dans le code source ayant la même signature. En revanche, il y a plusieurs points de départ de données qui remplissent le summary :

- profile
- experiences
- educations
- skills
- languages
- preferences

Donc le même pourcentage peut varier si les listes chargées par les hooks sont incomplètes ou si le profile a été initialisé en fallback.

### 4.4 Deux sources pour les documents

Oui. Les documents sont lus dans deux mondes différents :

- localStorage, clé emploiplus-candidate-documents-{profileId}
- candidates.cv_url + candidates.cv_text

Exemples de fichiers :

- [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- [src/features/candidates/hooks/useCandidateDocuments.ts](src/features/candidates/hooks/useCandidateDocuments.ts)
- [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx)
- [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
- [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)

### 4.5 Deux sources pour le profil

Oui, avec nuance.

- La source “session/user” est la source de vérité d’authentification.
- La source “table candidates” par user_id est la source de vérité du profil candidat.
- Le code rend ensuite le profil répliqué localement dans plusieurs states React.

### 4.6 Deux caches différents

Oui, au moins deux caches :

- localStorage documents et CV
- state React local dans les hooks
- éventuellement un cache d’AI match / embedding dans aiAnalysisCache, bien que ce soit plus orienté recommandations IA que compte candidat, mais c’est un cache secondaire.

---

## 5. Audit spécifique de la complétude

### 5.1 Implémentations trouvées

La complétude du profil est calculée dans :

- [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)

Autres lieux qui utilisent ce calcul :

- [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
- [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx)
- [src/features/profile/components/ProfileHeader.tsx](src/features/profile/components/ProfileHeader.tsx)
- [src/features/profile/components/sections/CompletionSection.tsx](src/features/profile/components/sections/CompletionSection.tsx)

### 5.2 Formule utilisée

La formule est exactement :

- totalItems = nombre d’éléments de completion = 10
- completedCount = nombre d’éléments complétés
- completionPercentage = Math.round((completedCount / totalItems) * 100)

Ensuite :

- clamp entre 0 et 100

### 5.3 Champs pris en compte

Chaque élément a un booléen isCompleted :

1. Nom complet : first_name + last_name
2. Titre professionnel : headline
3. Localisation : location_city + location_country
4. Résumé professionnel : bio
5. Photo de profil : avatar_url
6. Expérience professionnelle : experiences.length > 0
7. Formation : educations.length > 0
8. Compétence : skills.length > 0
9. Langue : languages.length > 0
10. Préférences RH : présence de seniority_level, contract_types, work_types, salary_min, salary_max

### 5.4 Poids / logique

Chaque élément compte pour 1 / 10, soit 10 % chacun.

Il n’y a pas de pondération différente par champ.

### 5.5 Données utilisées

Le hook reçoit un summary :

- profile
- experiences
- educations
- skills
- languages
- preferences

### 5.6 Source des données

- profile : from useCandidate() et useCandidateProfile()
- experiences : getCandidateExperiences(profile.id)
- educations : useCandidateEducation(profile.id)
- skills : useCandidateSkills(profile.id)
- languages : useCandidateLanguages(profile.id)
- preferences : useCandidatePreferences(profile.id)

### 5.7 Valeur par défaut

Si un champ est vide / null / undefined :

- hasText(value) retourne faux
- hasItems(items) retourne faux
- hasPreferences retourne faux

### 5.8 Comportement pendant le chargement

Le hook est memoized sur summary. Si les listes sont vides parce que le chargement n’est pas terminé, la complétude reste basse, même si le profil réel est complet.

### 5.9 Comportement si le profil est incomplet

La valeur est calculée sur les champs présents seulement. Rien n’est stocké, répliqué ou synchronisé dans la base ; ça n’est qu’un calcul dérivé.

### 5.10 Peut-il produire 10 % et 30 % pour le même profil ?

Oui, si le même utilisateur arrive avec :

- un profil principal complet à partir du vrai id de candidat,
- mais des listes secondaires encore vides ou chargées avec un fallback id,
- ou un état React plus ancien que le profil réellement chargé.

La cause la plus probable n’est pas “deux formules de complétude”, mais “deux états de données et deux chemins de chargement” alimentant la même formule.

---

## 6. Audit du profil candidat

### 6.1 Implémentations du profil candidat

| Fichier | Rôle | Source de données | Identifiant | Remarque |
|---|---|---|---|---|
| [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) | Hook principal candidat | candidates table | user_id | source active la plus importante |
| [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) | API d’accès profil | candidates table | user_id / id | logique de fallback, timeout |
| [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) | overlay de profil | useCandidate + profileService | baseProfile.id | second état local |
| [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts) | façade service | candidates table | candidateId | double couche d’accès |
| [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx) | auth provider | candidates table | user_id | détermine hasCandidateProfile |

### 6.2 Existe-t-il une seule source de vérité ?

Non.

Il existe plutôt :

- Source A : AuthContext / session / user
- Source B : candidates table query by user_id dans useCandidate
- Source C : candidates table query by id dans profileService.getProfile
- Source D : state local React dans useCandidate
- Source E : state local React dans useCandidateProfile
- Source F : localStorage documents / CV

### 6.3 Différences entre sources

- Source A : user unique de Supabase (auth)
- Source B : row candidate liée à ce user_id
- Source C : row candidate par id
- Source D : état React du hook principal
- Source E : état React du hook de profile page
- Source F : stockage local pour documents

En pratique, si l’un de ces états est résolu via un fallback artificial, il peut afficher un profil incomplet ou partiel alors qu’une autre partie du compte a le vrai profil.

---

## 7. Audit des domaines de données candidat

| Domaine | Implémentation A | Implémentation B | Source A | Source B | Même donnée ? | Risque |
|---|---|---|---|---|---|---|
| Profil | useCandidate | useCandidateProfile | candidates via user_id | candidates via id | Oui | Oui, car deux states |
| CV | localStorage | candidates.cv_url / cv_text | localStorage key | table candidates | Oui | Oui |
| Documents | useCandidateDocuments | docsApi + localStorage | localStorage | données persistées localement | Oui | Oui |
| Expériences | getCandidateExperiences | state local dashboard | candidate_experience | local state du dashboard | Oui | Moyen |
| Formations | useCandidateEducation | profileService.getEducations | candidate_education | profile service wrapper | Oui | Moyen |
| Compétences | useCandidateSkills | profileService wrapper | candidate_skills | same logical service different layer | Oui | Moyen |
| Langues | useCandidateLanguages | profileService wrapper | candidate_languages | same logical service different layer | Oui | Moyen |
| Préférences | useCandidatePreferences | profileService wrapper | candidate_preferences | same logical service different layer | Oui | Moyen |

---

## 8. Audit des identifiants

### 8.1 Identifiants utilisés dans le code

Les identifiants récurrents sont :

- auth.user.id
- session.user.id
- user_id
- candidate.id
- profile.id
- candidate_id

### 8.2 Problème réel

Le code ne se comporte pas toujours de la même manière selon l’identifiant utilisé.

Exemple :

- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) charge le profil avec user.id
- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) internaly queries candidates where user_id = userId
- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) refetches by baseProfile.id
- [src/features/candidates/api/educationApi.ts](src/features/candidates/api/educationApi.ts) charges les formations via candidate_id = candidateId

Donc une même donnée peut être lue :

- par user_id,
- puis par candidate_id,
- puis par profile.id,
- puis par un fallback synthétique.

C’est précisément le type de situation qui peut provoquer des incohérences visuelles sur un même compte.

### 8.3 Fallback critique

Dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts), la fonction getCandidateProfileByUserId contient un timeout de 2 secondes et un fallback qui construit un objet avec l’ID suivant :

- fallback-{user.id}

Cela signifie que si la requête Supabase ne répond pas dans le délai, le hook principal va considérer l’utilisateur comme ayant un profil dont l’id n’est pas le vrai id candidat.

C’est une cause de divergence majeure.

---

## 9. Audit des sources de vérité

### 9.1 Source de vérité actuelle probable

Pour le profil candidat, la source de vérité “active” la plus crédible est la table candidates filtrée par user_id.

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)

### 9.2 Sources concurrentes ou redondantes

| Donnée | Source de vérité actuelle | Sources concurrentes / redondantes |
|---|---|---|
| Profil | candidates.user_id | profile.id local state, profileService, useCandidateProfile |
| CV | candidates.cv_url + candidates.cv_text | localStorage emploiplus-candidate-documents-{profileId}, signed URL storage |
| Documents | localStorage | candidates.cv_url, storage bucket |
| Expériences | candidate_experience | local state dashboard |
| Formations | candidate_education | wrapper profileService |
| Compétences | candidate_skills | wrapper profileService |
| Langues | candidate_languages | wrapper profileService |
| Préférences | candidate_preferences | wrapper profileService |
| Complétude | calcul local useProfileCompletion | loaded summary arrays dans plusieurs states |

### 9.3 Qui est réellement utilisée ?

- Le dashboard active utilise surtout useCandidate et la combinaison de plusieurs hooks de feature candidates.
- La page profile utilise un second niveau de state via useCandidateProfile.
- Les documents utilisent localStorage comme source visuelle immédiate.
- La complétude est un calcul dérivé, pas une donnée persistée.

---

## 10. Audit des chargements simultanés

Le chemin typique au chargement du dashboard est :

- [src/App.tsx](src/App.tsx)
- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
- [src/features/candidates/hooks/useCandidateEducation.ts](src/features/candidates/hooks/useCandidateEducation.ts)
- [src/features/candidates/hooks/useCandidateSkills.ts](src/features/candidates/hooks/useCandidateSkills.ts)
- [src/features/candidates/hooks/useCandidateLanguages.ts](src/features/candidates/hooks/useCandidateLanguages.ts)
- [src/features/candidates/hooks/useCandidatePreferences.ts](src/features/candidates/hooks/useCandidatePreferences.ts)
- [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)

Le chemin typique pour la page profile est :

- [src/pages/candidate/CandidateProfilePage.tsx](src/pages/candidate/CandidateProfilePage.tsx)
- [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx)
- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)
- [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts)
- [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)

Le point clé : le même profil est chargé à plusieurs niveaux, souvent en parallèle, sans partage d’état central.

Cela donne des états du même profil en morceaux :

- une version issue du hook principal,
- une version issue du hook profile,
- une version issue du localStorage,
- une version issue des listes de sous-données.

Ce système peut parfaitement expliquer des variations de pourcentage observées pour le même utilisateur.

---

## 11. Différencier les vraies duplications des faux doublons

### 11.1 Sources de vérité active

- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- [src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)

### 11.2 Wrapper / réexport

- [src/hooks/useCandidate.ts](src/hooks/useCandidate.ts)
- [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts) est un wrapper de service, pas une vraie source de données indépendante.

### 11.3 Legacy non utilisé

Il existe plusieurs composants et fichiers qui semblent legacy mais qui ne sont pas à l’origine du problème constaté sur le compte. Le problème principal est ailleurs : dans le chargement et le mapping des états candidats.

### 11.4 Duplication active

Le point de duplication active et réellement dangereux est le double chargement d’un même profil par deux états React différents.

- useCandidate profile state
- useCandidateProfile profile state

### 11.5 Implémentation alternative active

La plus claire est l’alternative “feature profile” :

- [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)

Cette couche ne remplace pas le profil principal, elle le recalcule / le réhydrate.

### 11.6 Simple composant UI

- [src/components/candidate/CandidateSidebar.tsx](src/components/candidate/CandidateSidebar.tsx)
- [src/components/candidate/CandidateTopbar.tsx](src/components/candidate/CandidateTopbar.tsx)
- [src/features/profile/components/ProfileHeader.tsx](src/features/profile/components/ProfileHeader.tsx)

### 11.7 Simple cache

- localStorage pour documents
- localStorage pour CV
- éventuellement ai_analysis_cache dans [src/services/aiMatchingService.ts](src/services/aiMatchingService.ts)

### 11.8 Calcul dérivé

- [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)

---

## 12. Trace du compte complet

### 12.1 Séquence de chargement du compte candidat

LOGIN
↓
Supabase session
↓
[src/features/authentication/context/AuthContext.tsx](src/features/authentication/context/AuthContext.tsx)
↓
user.id
↓
[src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
↓
getCandidateProfileByUserId(user.id)
↓
[src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
↓
table candidates where user_id = user.id
↓
state profile dans useCandidate
↓
[src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
↓
useCandidateEducation(profile.id)
↓
useCandidateSkills(profile.id)
↓
useCandidateLanguages(profile.id)
↓
useCandidatePreferences(profile.id)
↓
getCandidateExperiences(profile.id)
↓
[src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)
↓
completionPercentage
↓
[src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)
↓
Sidebar / Topbar / Profile UI
↓
[src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx)
↓
useCandidateProfile()
↓
profileService.getProfile(baseProfile.id)
↓
second état de profil
↓
useProfileCompletion(summary)
↓
autres pages candidat

### 12.2 Point de rupture critique

La rupture critique est le saut suivant :

- hook principal charge avec user_id
- le calcul de complétude commence sur profile + arrays
- en même temps, la page profile reconstruit une version alternative du profil via profile.id

Ce mécanisme fait que le même compte candidat peut être représenté par plusieurs états partiellement différents à un instant donné.

---

## 13. Cas concret : même compte, même utilisateur, 10 % vs 30 %

### Cause possible #1 : fallback synthétique dans getCandidateProfileByUserId

- Fichier : [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
- Fonction : getCandidateProfileByUserId
- Données utilisées : session.user.id, user_metadata, table candidates
- Pourquoi cela peut produire 10 % :
  - si la requête Supabase prend trop de temps, le code déclenche un timeout de 2 s
  - il retourne un profil synthétique de type fallback-{user.id}
  - ce fallback a souvent : first_name / last_name / email, mais pas les autres champs (bio, headline, expérience, compétences, langues, préférences)
  - les listes de formations, skills, languages, preferences restent vides
  - la complétude passe alors très bas, typiquement autour de 10 %

### Cause possible #2 : double état du profil 

- Fichier : [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)
- Fonction : useCandidateProfile
- Données utilisées : baseProfile + profileService.getProfile(baseProfile.id)
- Pourquoi cela peut produire 30 % :
  - la page profile refetch un profil à partir de l’id réel, mais l’état du dashboard est resté sur un profil plus incomplet ou plus ancien
  - les counts experiences / educations / skills / languages / preferences peuvent ne pas être synchronisés au même moment
  - la formule de completion a été calculée à partir d’un ensemble de données partiellement rempli
  - cela produit des valeurs intermédiaires comme 30 %

### Cause possible #3 : localStorage documents / CV vs données Supabase

- Fichier : [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- Fonction : getCandidateDocuments / saveCandidateDocuments
- Données utilisées : localStorage + profileId
- Pourquoi cela peut produire une différence visuelle importante :
  - une partie du compte montre les documents chargés localement
  - une autre partie charge le profil directement depuis la table candidates
  - la partie “complétude” se base sur données structurelles (expériences, compétences, langues, préférences), pas sur documents
  - mais le même mécanisme de state incohérent peut faire apparaître des valeurs différentes selon le moment où localStorage a été restauré

### Cause possible #4 : chargements asynchrones non synchronisés

- Fichiers : [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx), [src/features/candidates/hooks/useCandidateEducation.ts](src/features/candidates/hooks/useCandidateEducation.ts), [src/features/candidates/hooks/useCandidateSkills.ts](src/features/candidates/hooks/useCandidateSkills.ts), [src/features/candidates/hooks/useCandidateLanguages.ts](src/features/candidates/hooks/useCandidateLanguages.ts), [src/features/candidates/hooks/useCandidatePreferences.ts](src/features/candidates/hooks/useCandidatePreferences.ts)
- Fonction : fetchEducations, fetchSkills, fetchLanguages, fetchPreferences, useProfileCompletion
- Données utilisées : arrays renvoyés par plusieurs hooks
- Pourquoi cela peut produire 10 % ou 30 % :
  - ces hooks chargent toutes les informations du candidat de manière indépendante
  - si l’une d’elles échoue, est ignorée, ou est encore en loading, le summary est incomplet
  - la valeur de complétude dépend donc d’un moment T arbitraire du chargement

### Cause la plus probable

La cause la plus probable est la combinaison des deux éléments suivants :

1. le timeout + fallback synthétique de getCandidateProfileByUserId dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
2. le double state React du profil entre useCandidate et useCandidateProfile

Cela permet au même compte connecté d’avoir :

- un profil “réel” sur un endroit,
- un profil “partiel / fallback” sur un autre endroit,
- et un pourcentage calculé sur des lists non synchronisées,

ce qui peut produire 10 % ou 30 % selon le chargement, la navigation et le timing.

---

## 14. Duplications réellement dangereuses

Les duplications réellement dangereuses pour l’incohérence du compte candidat sont celles-ci :

1. Double chargement du profil :
   - [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
   - [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)

2. Double niveau d’accès à la même table candidates :
   - [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
   - [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts)

3. Fallback synthétique avec id artificiel :
   - [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)

4. Parallélisme des sous-données du profil :
   - useCandidateEducation
   - useCandidateSkills
   - useCandidateLanguages
   - useCandidatePreferences
   - getCandidateExperiences

5. Double source pour CV / documents :
   - localStorage
   - candidates.cv_url / cv_text

### Duplications sans impact runtime fort

Les éléments UI seuls ou les composants legacy non branchés ne sont pas les vrais moteurs de l’incohérence observée. Le vrai problème est dans les états et les identifiants, pas dans les composants de présentation.

---

## 15. Source de vérité recommandée pour chaque donnée

| Donnée | Source de vérité recommandée |
|---|---|
| Profil candidat | table candidates filtrée par user_id via useCandidate + getCandidateProfileByUserId |
| Identité auth | Supabase auth session / user |
| CV | table candidates.cv_text + candidates.cv_url |
| Documents | table candidates.cv_url + storage bucket + localStorage seulement comme cache client |
| Expériences | table candidate_experience par candidate_id |
| Formations | table candidate_education par candidate_id |
| Compétences | table candidate_skills par candidate_id |
| Langues | table candidate_languages par candidate_id |
| Préférences | table candidate_preferences par candidate_id |
| Complétude | calcul dérivé dans useProfileCompletion basé sur un summary unique, non stocké |

---

## 16. Plan de déduplication recommandé

1. Unifier le profil candidat dans un seul hook source de vérité unique.
2. Retirer le second state local issue de useCandidateProfile ou le faire reposer sur la même source unique.
3. Supprimer le fallback artificiel qui produit patch-id non réel.
4. Faire en sorte que la complétude soit calculée uniquement à partir d’un seul summary cohérent.
5. Séparer les deux mécanismes documents :
   - source BDD pour CV persistant,
   - localStorage uniquement comme cache client
6. Harmoniser tous les identifiants sur un seul modèle :
   - user.id pour l’auth,
   - candidate.id pour les tables métier,
   - jamais un id “fallback” synthétique.

---

====================================================
CONCLUSION
====================================================

- Existe-t-il plusieurs sources de vérité pour le compte candidat ? OUI
- Existe-t-il plusieurs calculs de complétude ? NON en termes de formules distinctes, OUI en termes de sources de données qui alimentent un même calcul.
- Existe-t-il plusieurs chargements du profil ? OUI
- Existe-t-il plusieurs sources pour les documents ? OUI
- Existe-t-il plusieurs sources pour les données de profil ? OUI
- Existe-t-il des duplications réellement actives ? OUI
- Ces duplications peuvent-elles expliquer 10 % vs 30 % ? OUI
- Quelle est la source de vérité recommandée ? La table candidates filtrée par user_id au niveau du hook principal useCandidate, avec un unique state React partagé.
- Quels fichiers devront être fusionnés, remplacés ou supprimés lors de la prochaine étape ?
  - [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)
  - [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts)
  - [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)
  - [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts)
  - [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts)
  - [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
  - [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)

Ce dossier ne modifie aucun fichier source et ne touche pas React #185. Son seul objectif est de déterminer si plusieurs logiques du compte candidat peuvent expliquer les valeurs incohérentes observées pour le même utilisateur.
