# AUDIT COMPLET — TABLEAU DE BORD CANDIDAT

## Objet

Ce document décrit le fonctionnement réel du tableau de bord candidat du site Emploiplus, tel qu’il est implémenté dans le code actuel. Il sert de base de référence pour décider ce qu’il faut reproduire dans une future application mobile native.

Important : ce document est strictement un audit documentaire. Il ne modifie ni le code, ni la logique, ni les données existantes.

---

## 1. Identification exacte de la page

### 1.1 Route et accès

La page du tableau de bord candidat est accessible via :

```text
/candidate/dashboard
```

C’est une sous-route du groupe candidat protégé :

```text
/candidate
  └── dashboard
```

### 1.2 Parcours réel dans le code

```text
App.tsx
  ↓
<Route path="/candidate" ...>
  ↓
ProtectedRoute requiredPermissions={['dashboard.candidate']}
  ↓
CandidateLayout
  ↓
CandidateDashboardPage
  ↓
Hooks + services + Supabase
  ↓
UI du dashboard
```

### 1.3 Fichiers exacts

- Route globale : src/App.tsx
- Layout candidat : src/pages/candidate/CandidateLayout.tsx
- Page principale : src/pages/candidate/CandidateDashboardPage.tsx
- Guard d’accès : src/features/authentication/guards/ProtectedRoute.tsx
- Auth context : src/features/authentication/context/AuthContext.tsx
- Hook candidat principal : src/hooks/useCandidate.ts
- Hook de profil candidat : src/features/candidates/hooks/useCandidateProfileData.ts
- Hook de complétude de profil : src/features/profile/hooks/useProfileCompletion.ts
- Service de recommandation : src/services/aiMatchingService.ts
- Hook offres : src/features/jobs/hooks/useJobs.ts
- Service offres : src/features/jobs/api/jobsApi.ts
- Composant JobCard : src/features/jobs/components/JobCard.tsx
- Squelette de chargement du dashboard : src/components/ui/skeletons/CandidateDashboardSkeleton.tsx
- Sidebar candidat : src/components/candidate/CandidateSidebar.tsx

### 1.4 Composant principal

Le composant principal affichant la page est :

- src/pages/candidate/CandidateDashboardPage.tsx

Il exporte :

```tsx
export function CandidateDashboardPage() { ... }
```

### 1.5 Layout utilisé

La page est rendue à l’intérieur du layout candidat :

- src/pages/candidate/CandidateLayout.tsx

Le layout définit :

- sidebar desktop
- sidebar mobile / drawer
- topbar desktop
- header mobile spécifique
- contenu principal scrollable

### 1.6 Hooks utilisés dans la page

La page CandidateDashboardPage utilise directement ou indirectement :

- useNavigate
- useMemo
- useRef
- useEffect
- useState
- usePageSEO
- useJobs
- useCandidateProfileData
- useProfileCompletion
- isMobileApp

### 1.7 Services utilisés

- src/services/aiMatchingService.ts : getRecommendedJobs
- src/features/jobs/hooks/useJobs.ts : useJobs
- src/features/jobs/api/jobsApi.ts : jobService.getPublishedOffers
- src/features/candidates/api/profileApi.ts : getCandidateProfileByUserId
- src/features/candidates/api/experiencesApi.ts : getCandidateExperiences
- src/features/candidates/hooks/useCandidateEducation.ts
- src/features/candidates/hooks/useCandidateSkills.ts
- src/features/candidates/hooks/useCandidateLanguages.ts
- src/features/candidates/hooks/useCandidatePreferences.ts
- src/integrations/supabase/client.ts : client Supabase

### 1.8 Données affichées au niveau de la page

Le dashboard affiche dans l’état actuel :

- un message de bienvenue personnalisé
- un widget de complétude du profil
- une liste d’actions rapides
- des offres recommandées pour le profil (si un CV est présent)
- les dernières offres publiées

Il n’affiche pas de stats card globales, de tableau de bord chiffré, ni de blocs “candidatures”, “notifications”, “documents”, “formations”, etc. dans cette page actuelle.

---

## 2. Structure complète de la page

### 2.1 Ordre réel d’apparition dans le JSX

Dans CandidateDashboardPage, l’ordre d’affichage est exactement :

1. Welcome Card
2. Profile Completion Card
3. Quick Actions
4. Offres recommandées pour votre profil
5. Dernières offres publiées

### 2.2 Éléments réellement présents

#### Bloc 1 — Welcome Card

- Texte :
  - “Bienvenue, {firstName}!”
  - “Bienvenue dans votre espace de candidat. Trouvez le poste idéal et suivez vos candidatures.”
- Icône visible : Briefcase
- Couleur du fond : dégradé sombre, fond noir/slate

#### Bloc 2 — Complétude de votre profil

- Titre : “Complétude de votre profil”
- Sous-titre : “Complétez votre profil pour augmenter vos chances”
- Pourcentage calculé : valeur de completion.completionPercentage
- Barre de progression : <Progress value={profileCompletion} />
- Liste détaillée si le bloc est déplié
- Vérifie les éléments de profil : nom complet, titre, localisation, résumé, photo, expérience, formation, compétence, langue, préférences RH

#### Bloc 3 — Actions rapides

Titre :

```text
Actions rapides
```

Cartes affichées :

- Compléter mon profil
- Consulter les guides
- Voir mes candidatures

Chaque carte contient :

- icône
- titre
- description
- flèche de navigation

#### Bloc 4 — Offres recommandées pour votre profil

Titre :

```text
Offres recommandées pour votre profil
```

Sous-titre :

```text
Suggestions automatiques basées sur votre CV et votre profil
```

Bouton :

```text
Voir toutes les offres
```

Contenu réel :

- états loading : 3 skeletons
- si jobs présents : liste de JobCard
- pagination : bouton Précédent / Suivant
- si aucune recommandation : message selon le contexte

#### Bloc 5 — Dernières offres publiées

Titre :

```text
Dernières offres publiées
```

Sous-titre :

```text
Les 3 dernières offres d'emploi
```

Bouton :

```text
Voir toutes les offres
```

Contenu réel :

- chargement textuel “Chargement des offres…”
- si offres présentes : liste de JobCard
- si vide : “Aucune offre publiée pour le moment.”

---

## 3. Cartographie visuelle

```text
Dashboard candidat
│
├── Welcome Card
│   ├── Bonjour / prénom
│   ├── texte d’introduction
│   └── icône Briefcase
│
├── Profile Completion Card
│   ├── titre
│   ├── sous-titre
│   ├── pourcentage
│   ├── barre de progression
│   └── liste des éléments à compléter (dépliable)
│
├── Actions rapides
│   ├── Compléter mon profil
│   ├── Consulter les guides
│   └── Voir mes candidatures
│
├── Offres recommandées pour votre profil
│   ├── bouton Voir toutes les offres
│   ├── loading skeleton
│   ├── liste de JobCard
│   ├── pagination
│   └── état vide / message explicite
│
└── Dernières offres publiées
    ├── bouton Voir toutes les offres
    ├── loading textuel
    ├── liste de JobCard
    └── état vide
```

### Ce qui n’existe pas dans le code réel du dashboard

Les éléments suivants ne sont pas présents dans cette page telle qu’implémentée :

- statistiques KPI globales
- candidatures dans le dashboard
- nombre de candidatures en cours / acceptées / refusées
- offres favorites
- notifications dans le dashboard
- documents de candidat dans le dashboard
- photo de profil affichée dans la page
- historique professionnel affiché directement
- expériences / formations / compétences / langues sous forme de sections visibles dans le dashboard
- alertes ou messages système dans la page

---

## 4. Fiches descriptives des blocs

## 4.1 Welcome Card

### Rôle
Assurer l’accueil personnalisé du candidat et donner un sentiment de connexion à l’espace dédié.

### Données affichées
- prénom du candidat
- texte d’introduction générique
- icône Briefcase

### Source
- profile via useCandidateProfileData / useCandidate

### Composant
- Card / CardContent

### Fichier
- src/pages/candidate/CandidateDashboardPage.tsx

### Hook
- useCandidateProfileData
- useCandidate

### Service
- src/features/candidates/api/profileApi.ts via getCandidateProfileByUserId

### Interaction
Aucune interaction directe, uniquement affichage.

### Navigation
Aucune route spécifique.

### Conditions
Affiché tant que la page est rendue et que le profil est chargé ou au moins fallback “Candidat”.

---

## 4.2 Complétude de votre profil

### Rôle
Donner un indicateur visuel de progression du profil et guider le candidat vers les champs incomplets.

### Données affichées
- pourcentage complet : profileCompletion
- barre de progression
- liste d’éléments de complétion
- état terminé / non terminé

### Source
- profile + expériences + formations + compétences + langues + préférences du candidat

### Composant
- Card, CardHeader, CardTitle, CardDescription, CardContent, Progress

### Fichier
- src/pages/candidate/CandidateDashboardPage.tsx

### Hook
- useCandidateProfileData
- useProfileCompletion

### Service
- src/features/candidates/api/profileApi.ts
- src/features/candidates/api/experiencesApi.ts
- src/features/candidates/api/educationApi.ts
- src/features/candidates/api/skillsApi.ts
- src/features/candidates/api/languagesApi.ts
- src/features/candidates/api/preferencesApi.ts

### Interaction
Le candidat peut cliquer pour ouvrir/fermer la liste détaillée.

### Navigation
Aucune route directe dans ce bloc ; le bloc n’a pas de bouton de navigation interne.

### Conditions
- le bloc est affiché en permanence
- le contenu détaillé est caché par défaut via isCompletionCollapsed = true
- si profileDataLoading est true, skeletons remplacent le contenu

---

## 4.3 Quick Actions

### Rôle
Proposer un accès rapide aux actions importantes du candidat.

### Données affichées
- titre d’action
- description
- icône
- arrière-plan coloré selon l’action

### Source
Constante locale dans CandidateDashboardPage : quickActions

### Composant
- Link + Card + CardContent

### Fichier
- src/pages/candidate/CandidateDashboardPage.tsx

### Hook
Aucun

### Service
Aucun

### Interaction
Clic sur la carte = navigation via Link to={action.href}

### Navigation
- /candidate/profile
- /candidate/guides
- /candidate/applications

### Conditions
Toujours affichées dès que la page est rendue.

---

## 4.4 Offres recommandées pour votre profil

### Rôle
Montrer des offres sélectionnées automatiquement à partir du profil et du CV du candidat.

### Données affichées
- titre de l’offre
- entreprise
- emplacement
- description / exigences
- contrat
- tags
- date limite / expiration
- pourcentage de match (si présent)
- bouton d’action Postuler
- bouton Voir plus
- bouton de partage

### Source
- RPC Supabase : match_job_offers_for_candidate
- Table job_offers
- contenu du profil candidat : cv_text, embedding_vector, cv_url

### Composant
- JobCard
- Button
- Link
- Skeleton

### Fichier
- src/pages/candidate/CandidateDashboardPage.tsx
- src/features/jobs/components/JobCard.tsx
- src/services/aiMatchingService.ts

### Hook
- useJobs (pour les offres publiées générales, pas directement pour les recommandations)
- useCandidateProfileData

### Service
- getRecommendedJobs dans src/services/aiMatchingService.ts

### Interaction
- pagination : Précédent / Suivant
- navigation vers /candidate/jobs/:slug/apply via navigate
- bouton Voir plus dans JobCard vers /jobs/:slug
- partage de l’offre
- bouton Postuler

### Navigation
- /candidate/jobs/:slug/apply
- /jobs/:slug
- /jobs dans le bouton “Voir toutes les offres”

### Conditions
Affiché seulement si le candidat a un profil identifié et un CV ou un texte de CV ou un embedding présent.

Sinon :

- si aucun CV uploadé : message spécifique
- si aucune recommandation trouvée : “Aucune recommandation disponible pour le moment.”

---

## 4.5 Dernières offres publiées

### Rôle
Afficher les dernières offres publiées, indépendamment de la recommandation.

### Données affichées
- titre
- entreprise
- emplacement
- description
- contrat
- tags
- date limite
- bouton Voir plus
- bouton Postuler
- bouton Partager

### Source
- job_offers
- filtre status = 'published'
- ordre publish_at DESC
- limite 3

### Composant
- JobCard
- Link
- Button

### Fichier
- src/pages/candidate/CandidateDashboardPage.tsx
- src/features/jobs/components/JobCard.tsx

### Hook
- useJobs

### Service
- src/features/jobs/api/jobsApi.ts

### Interaction
- navigation vers /candidate/jobs/:slug/apply
- “Voir toutes les offres” → /jobs
- clic sur le JobCard “Voir plus” → /jobs/:slug

### Navigation
- /jobs
- /candidate/jobs/:slug/apply
- /jobs/:slug

### Conditions
- si offersLoading = true : texte “Chargement des offres…”
- si 0 offre : “Aucune offre publiée pour le moment.”

---

## 5. Données Supabase : tables utilisées

Le dashboard n’utilise pas une seule table, mais plusieurs sources cohérentes avec le profil candidat et les offres publiées.

| Élément du dashboard | Table | Colonnes utilisées | Relation | Utilisation |
|---|---|---|---|---|
| Profil candidat | candidates | id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at | lié à auth.users via user_id | nom, prénom, CV, localisation, complétude |
| Expériences | candidate_experience | id, candidate_id, job_title, company, description, start_date, end_date, is_current, created_at, updated_at | candidate_id -> candidates.id | calcul de complétude |
| Formations | candidate_education | id, candidate_id, institution, degree, field_of_study, start_date, end_date, description, created_at, updated_at | candidate_id -> candidates.id | calcul de complétude |
| Compétences | candidate_skills | id, candidate_id, name, level, created_at, updated_at | candidate_id -> candidates.id | calcul de complétude |
| Langues | candidate_languages | id, candidate_id, language, proficiency, created_at, updated_at | candidate_id -> candidates.id | calcul de complétude |
| Préférences | candidate_preferences | id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at | candidate_id -> candidates.id | calcul de complétude |
| Offres | job_offers | id, slug, title, company, contract_type, location_city, location_country, salary, publish_at, deadline, expires_at, status, cover_image, description, requirements, tags, application_email, external_link | aucune relation directe avec le candidat | recommandations + dernières offres |
| Cache de scoring IA | ai_analysis_cache | utilisé dans processCandidateCvUpload | candidate_id -> candidates.id | invalidation de cache après upload de CV |

### Tables non utilisées directement dans cette page

Les éléments suivants ne sont pas directement lus par le dashboard dans ce code :

- applications
- candidate_documents
- notifications
- saved_jobs
- candidate_profiles (table inexistante dans ce code ; le profil est dans candidates)
- questionaires / tests / évaluations

---

## 6. Relation avec le candidat connecté

### 6.1 Parcours réel

Le dashboard détermine le candidat connecté via le flux suivant :

```text
auth.users
  ↓
user.id
  ↓
AuthContext -> session.user.id
  ↓
getCandidateProfileByUserId(user.id)
  ↓
candidates.user_id = user.id
  ↓
profile.id
  ↓
CandidateDashboardPage / useCandidateProfileData / getRecommendedJobs
```

### 6.2 Implémentation réelle

Le hook principal est :

- src/hooks/useCandidate.ts

Ce hook utilise :

```ts
const { logout: logoutContext, isAuthenticated, user } = useAuthContext();
```

Puis :

```ts
const nextProfile = await getCandidateProfileByUserId(user.id);
```

La fonction dans :

- src/features/candidates/api/profileApi.ts

exécute :

```ts
supabase.from("candidates")
  .select(...)
  .eq("user_id", userId)
  .maybeSingle();
```

### 6.3 Vérification de route

La route /candidate est couverte par :

```tsx
<ProtectedRoute
  fallbackPath="/candidate/login"
  requiredPermissions={["dashboard.candidate"]}
  loadingSkeleton={<CandidateDashboardSkeleton />}
>
```

### 6.4 Détection du rôle candidat

Dans AuthContext, un candidat est associé s’il existe une ligne dans candidates avec le même user_id :

```ts
const { data } = await supabase
  .from("candidates")
  .select("id")
  .eq("user_id", session.user.id)
  .limit(1)
  .maybeSingle();
```

Ensuite :

```ts
const candidateRoles = hasCandidateProfile ? ["candidate"] : [];
```

### 6.5 Conclusion

Le dashboard ne dépend pas d’un url paramétrée par id de candidat. Il dépend de la session Supabase, puis de la ligne candidates associée à auth.users.

---

## 7. Requêtes Supabase exécutées pour le dashboard

## 7.1 Requête de profil candidat

Fichier : src/features/candidates/api/profileApi.ts

```ts
const { data, error } = await supabase
  .from("candidates")
  .select("id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at")
  .eq("user_id", userId)
  .maybeSingle();
```

### Objectif
- déterminer le profil du candidat connecté
- récupérer le CV texte et le vecteur d’embedding
- servir de base pour les recommandations

---

## 7.2 Requête d’expériences

Fichier : src/features/candidates/api/experiencesApi.ts

```ts
const { data, error } = await supabase
  .from("candidate_experience")
  .select("id, candidate_id, job_title, company, description, start_date, end_date, is_current, created_at, updated_at")
  .eq("candidate_id", candidateId)
  .order("start_date", { ascending: false });
```

### Usage
- calcul de la complétude du profil

---

## 7.3 Requête de formations

Fichier : src/features/candidates/api/educationApi.ts

```ts
const { data, error } = await supabase
  .from("candidate_education")
  .select("id, candidate_id, institution, degree, field_of_study, start_date, end_date, description, created_at, updated_at")
  .eq("candidate_id", candidateId)
  .order("start_date", { ascending: false });
```

### Usage
- calcul de la complétude du profil

---

## 7.4 Requête de compétences

Fichier : src/features/candidates/api/skillsApi.ts

```ts
const { data, error } = await supabase
  .from("candidate_skills")
  .select("id, candidate_id, name, level, created_at, updated_at")
  .eq("candidate_id", candidateId)
  .order("created_at", { ascending: false });
```

### Usage
- calcul de la complétude du profil

---

## 7.5 Requête de langues

Fichier : src/features/candidates/api/languagesApi.ts

```ts
const { data, error } = await supabase
  .from("candidate_languages")
  .select("id, candidate_id, language, proficiency, created_at, updated_at")
  .eq("candidate_id", candidateId)
  .order("created_at", { ascending: false });
```

### Usage
- calcul de la complétude du profil

---

## 7.6 Requête de préférences

Fichier : src/features/candidates/api/preferencesApi.ts

```ts
const { data, error } = await supabase
  .from("candidate_preferences")
  .select("id, candidate_id, contract_types, work_types, salary_min, salary_max, seniority_level, created_at, updated_at")
  .eq("candidate_id", candidateId)
  .maybeSingle();
```

### Usage
- calcul de la complétude du profil

---

## 7.7 Requête des offres publiées

Fichier : src/features/jobs/api/jobsApi.ts

```ts
const { data, error } = await supabase
  .from("job_offers")
  .select("id, slug, title, company, contract_type, location_city, location_country, salary, publish_at, deadline, expires_at, status, cover_image")
  .eq("status", "published")
  .order("publish_at", { ascending: false })
  .range(start, end)
  .limit(safeLimit);
```

### Usage
- “Dernières offres publiées” dans le dashboard
- filtre status = 'published'
- tri par publish_at desc
- limite dépend de useJobs et de l’UA mobile

---

## 7.8 Requête RPC de recommandations

Fichier : src/services/aiMatchingService.ts

```ts
const { data, error } = await supabase.rpc("match_job_offers_for_candidate", params);
```

Paramètres envoyés :

```ts
const params = {
  candidate_id: candidateId,
  match_threshold: matchThreshold,
  match_count: matchCount,
  match_offset: matchOffset,
};
```

### Usage
- recommandations personnalisées selon le profil + CV du candidat

### Données de validation

Le service vérifie ensuite le CV du candidat :

```ts
const { data: candidateData, error: candError } = await supabase
  .from("candidates")
  .select("id, cv_text")
  .eq("id", candidateId)
  .single();
```

### Fallback local

Si les scores de la RPC sont absents ou égaux, il calcule localement une note avec :

```ts
computeMatchScore(cvText, jobOffer)
```

---

## 8. Calculs et statistiques

## 8.1 Calcul de complétude du profil

Le calcul est centralisé dans :

- src/features/profile/hooks/useProfileCompletion.ts

### Formule exacte

Le hook construit un tableau de 10 éléments :

1. Nom complet
2. Titre professionnel
3. Localisation
4. Résumé professionnel
5. Photo de profil
6. Expérience professionnelle
7. Formation
8. Compétence
9. Langue
10. Préférences RH

Puis :

```ts
const totalItems = completionItems.length;
const completedCount = completionItems.filter(item => item.isCompleted).length;
const completionPercentage = Math.round((completedCount / totalItems) * 100);
```

### Conditions de complétion exacte

- nom complet : first_name + last_name non vides
- titre professionnel : headline non vide
- localisation : location_city + location_country non vides
- résumé : bio non vide
- photo : avatar_url non vide
- expérience : tableau experiences non vide
- formation : tableau educations non vide
- compétence : tableau skills non vide
- langue : tableau languages non vide
- préférences RH : au moins un élément parmi seniority_level, contract_types, work_types, salary_min, salary_max

### Résultat final

```ts
Math.max(0, Math.min(100, completionPercentage))
```

### Composant qui affiche le résultat

- CandidateDashboardPage

### Critique de cette logique

Le dashboard ne calcule pas de statistiques métier chiffrées comme :

- nombre de candidatures
- nombre de demandes envoyées
- taux de réponse
- offres sauvegardées
- documents téléchargés

Il ne s’agit donc pas d’un “dashboard analytics” mais d’un espace de résumé de profil + recommandations + offres.

---

## 8.2 Calcul des offres recommandées

### Source du calcul

- src/services/aiMatchingService.ts
- RPC “match_job_offers_for_candidate”

### Logique

- le candidat a un CV textuellement exploitable (cv_text, cv_url ou embedding_vector)
- la page déclenche getRecommendedJobs(profile.id,...)
- la base calcule des offres selon la similarité profil/candidat vs job_offers

### Fallback local

En contrepartie, si les scores sont absents ou identiques, le code calcule un score local en utilisant le texte du CV et le texte de l’offre :

```ts
computeMatchScore(cvText, jobOffer)
```

### Composant affichant le score

Dans JobCard :

```tsx
{typeof matchScore === "number" ? (
  <span>...
```

Et le score est affiché sous forme :

```text
XX% de match
```

---

## 8.3 Calcul d’affichage des dates

Les offres utilisent :

```ts
new Date(deadlineValue).toLocaleDateString("fr-FR")
```

et la date de publication devient :

```ts
new Date(offer.publish_at).toLocaleDateString("fr-FR")
```

### Expiration

La page détermine l’expiration via :

```ts
const isExpired = Boolean(
  deadlineValue && new Date(deadlineValue).getTime() < Date.now(),
);
```

---

## 9. Progression du profil

### 9.1 Éléments pris en compte

Les éléments sont définis dans useProfileCompletion :

- Nom complet
- Titre professionnel
- Localisation
- Résumé professionnel
- Photo de profil
- Expérience professionnelle
- Formation
- Compétence
- Langue
- Préférences RH

### 9.2 Nombre total d’éléments

```text
10 éléments
```

### 9.3 Formule exacte

```ts
completedCount / totalItems * 100
```

### 9.4 Pondération

Aucune pondération spécifique n’est utilisée. Tout élément compte pour 1 point à part égale.

### 9.5 Conditions détaillées

```ts
const hasText = (value?: string | null) => typeof value === "string" && value.trim().length > 0;
const hasItems = <T,>(items?: T[] | null) => Array.isArray(items) && items.length > 0;
```

Pour les préférences RH :

```ts
hasText(preferences.seniority_level) ||
hasItems(preferences.contract_types) ||
hasItems(preferences.work_types) ||
typeof preferences.salary_min === "number" ||
typeof preferences.salary_max === "number"
```

### 9.6 Composant affichant le résultat

- CandidateDashboardPage

### 9.7 UI de la progression

```tsx
<Progress value={profileCompletion} className="h-1.5 w-full" />
```

### 9.8 Bloc dépliable

Le détail est affiché seulement si :

```ts
!isCompletionCollapsed
```

avec un bouton toggle via :

```tsx
onClick={() => setIsCompletionCollapsed((prev) => !prev)}
```

---

## 10. Candidatures

### 10.1 Présence sur le dashboard

Il n’existe pas de section “Mes candidatures” dans le dashboard actuel.

### 10.2 Ce qui n’est pas présent

Le code ne contient pas :

- bloc “Candidatures”
- compteur total de candidatures
- statuts acceptées/refusées/en cours
- dernières candidatures
- lien vers une liste de candidatures dans le dashboard

### 10.3 Conclusion

Le dashboard candidat n’affiche pas de donnée de candidature dans sa version actuelle, même si les routes de candidatures existent ailleurs :

- /candidate/applications
- src/pages/candidate/CandidateApplicationsPage.tsx

Mais ce n’est pas intégré dans le dashboard principal.

---

## 11. Offres d’emploi affichées

### 11.1 Origine des offres

Les offres viennent de la table :

- job_offers

### 11.2 Filtres appliqués

La section “Dernières offres publiées” utilise :

```ts
jobFilters = { status: "published", limit: 3, orderBy: "published_at", order: "desc" }
```

Puis :

```ts
const { offers: publishedOffers, loading: publishedOffersLoading } = useJobs(jobFilters);
```

### 11.3 Service réel

Dans src/features/jobs/api/jobsApi.ts :

```ts
.getPublishedOffers(limit)
```

### 11.4 Tri

```ts
.order("publish_at", { ascending: false })
```

### 11.5 Limite

```ts
limit: 3
```

### 11.6 Recommandation par profil

La logique n’est pas un simple tri par catégorie ou par ville. Elle passe par :

- CV textuel du candidat
- vecteur d’embedding
- RPC match_job_offers_for_candidate

### 11.7 Critères de sélection

Le code montre que l’algorithme dépend :

- cv_text
- embedding_vector
- titres, descriptions, exigences et autres informations de job_offers

### 11.8 Informations affichées pour chaque offre

- titre
- entreprise
- lieu
- contrat
- description / requis
- tags
- date limite
- score de matching (si disponible)
- bouton Voir plus
- bouton Postuler
- bouton Partager

---

## 12. Actions rapides

## 12.1 Liste des actions

| Nom | Icône | Rôle | Action | Route |
|---|---|---|---|---|
| Compléter mon profil | CheckCircle2 | guider la complétion | navigation | /candidate/profile |
| Consulter les guides | BookOpen | ouvrir les fiches | navigation | /candidate/guides |
| Voir mes candidatures | Send | accéder à la liste des candidatures | navigation | /candidate/applications |

### Données nécessaires

- aucun paramètre supplémentaire
- seulement la route cible

---

## 13. Navigation

### 13.1 Routes accessibles depuis le dashboard

| Élément cliquable | Destination exacte | Paramètre | Comportement |
|---|---|---|---|
| “Compléter mon profil” | /candidate/profile | aucun | Link to |
| “Consulter les guides” | /candidate/guides | aucun | Link to |
| “Voir mes candidatures” | /candidate/applications | aucun | Link to |
| Bouton “Voir toutes les offres” | /jobs | aucun | Link to |
| JobCard “Voir plus” | /jobs/:slug | slug | Link to |
| JobCard “Postuler” | /candidate/jobs/:slug/apply | slug | navigate() |
| Partage de l’offre | URL publique /jobs/:slug | slug | ShareButtons |
| Pagination recommendations | aucun paramètre | page actuelle | setRecommendedPage |

### 13.2 Vérification d’authentification

Tous les liens du sous-espace candidat sont protégés par la route mère :

```text
/candidate
```

et la protection par :

```tsx
RequiredPermissions=["dashboard.candidate"]
```

### 13.3 Retour sur page

Le dashboard ne contient pas de logique de retour personnalisée ; la navigation est standard React Router.

---

## 14. Notifications / alertes

### 14.1 Présence sur le dashboard

Le dashboard du candidat n’affiche pas de section de notifications.

### 14.2 Ce que le code montre

Il existe un composant de notifications ailleurs, notamment :

- src/components/candidate/NotificationsDropdown.tsx
- src/pages/candidate/CandidateNotificationsPage.tsx
- src/hooks/useNotifications.ts

Mais ces éléments ne font pas partie du dashboard principal.

### 14.3 Conclusion

Aucune notification, alerte, message système ou rappel n’est affiché directement dans le dashboard actuel dans la page CandidateDashboardPage.

---

## 15. Documents / CV / profil

### 15.1 CV dans le dashboard

Le dashboard ne montre pas explicitement le CV, mais il le lit et l’exploite pour les recommandations.

#### Sources du CV

- fields candidates.cv_text
- candidates.embedding_vector
- candidates.cv_url
- localStorage key : emploiplus-candidate-documents-{profile.id}

#### LocalStorage

Dans reloadCandidateDocuments() :

```ts
const raw = localStorage.getItem(`emploiplus-candidate-documents-${profile.id}`);
```

Le dashboard essaye ensuite de restaurer :

```ts
{ cv?: { url?: string | null } | null; documents?: Array<{ url?: string | null }> }
```

### 15.2 Usage du CV

Le dashboard recalcule et déclenche :

```ts
if (!hasCvUploaded) {
  // no recommendations
}
```

où :

```ts
const hasCvUploaded = Boolean(candidateDocuments.cv?.url || candidateCvText || candidateEmbedding);
```

### 15.3 D’autres données de profil

Le profil candidat est utilisé pour calculer la complétude, mais n’est pas affiché sous forme de “carte profil” dans cette page.

Les données de profil utilisées sont :

- first_name
- last_name
- email
- bio
- headline
- location_city
- location_country
- avatar_url
- cv_text
- embedding_vector
- cv_url

### 15.4 Expériences / formations / compétences / langues

Ces données ne sont pas affirmées directement dans le dashboard visible ; elles sont seulement utilisées dans le calcul de complétude.

---

## 16. Loading

### 16.1 Loading global du dashboard

Lorsque la route est en chargement, le site utilise :

```tsx
<CandidateDashboardSkeleton />
```

voir :

- src/components/ui/skeletons/CandidateDashboardSkeleton.tsx

### 16.2 Skeletons internes

Dans la page CandidateDashboardPage, le chargement est visible dans :

- profile completion : skeletons lignes/cercle
- recommended jobs : 3 skeletons de card
- latest offers : texte de chargement “Chargement des offres…”

### 16.3 Autres états de chargement

Le code utilise aussi :

```ts
const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
```

et :

```ts
const [offersLoading, setOffersLoading] = useState(true);
```

### 16.4 Écran blanc

Aucun écran blanc complet n’est visible pour cette page ; le système passe plutôt par des skeletons ou des messages textuels.

---

## 17. État vide

## 17.1 Recommandations vides

Le code affiche :

```tsx
{profile?.id && !(candidateDocuments.cv?.url || profile?.cv_text) ? (
  <div>
    Vous n'avez pas encore téléversé de CV. Téléversez un CV pour obtenir des recommandations personnalisées.
  </div>
) : (
  <div>Aucune recommandation disponible pour le moment.</div>
)}
```

### Signification

- si le candidat n’a pas de CV, le message est orienté onboarding
- si le CV existe mais aucune recommandation n’est disponible, message générique

---

## 17.2 Offres vides

```tsx
Aucune offre publiée pour le moment.
```

### Conditions

```ts
offers.length === 0
```

---

## 17.3 Profil incomplet

Le widget de complétude montre les éléments manquants, mais il n’affiche pas un écran “profil incomplet” spécial.

---

## 17.4 Aucune notification

Aucune notification présente dans la page.

---

## 18. Erreurs

### 18.1 Erreurs connues dans la page

La page gère des erreurs dans plusieurs sous-systèmes :

- chargement du profil candidat
- chargement des documents depuis localStorage
- chargement des recommandations
- chargement des offres publiées

### 18.2 Erreurs de documents localStorage

```ts
catch (error) {
  console.error("Unable to restore candidate documents for dashboard", error);
  setCandidateDocuments({ cv: null, documents: [] });
}
```

### 18.3 Erreurs recommandation

Le code capture les erreurs et masque les recommandations :

```ts
setRecommendedJobs([]);
setHasMoreRecommendedJobs(false);
```

sans afficher un message utilisateur explicite dans la page.

### 18.4 Erreurs offres

La logique useJobs capture les erreurs mais le dashboard n’affiche pas de message d’erreur dédié. Il ne fait qu’afficher le loading puis un empty state si la liste est vide.

### 18.5 Erreurs d’authentification / permission

Ces erreurs sont gérées au niveau du route guard, pas dans la page elle-même.

---

## 19. Refresh

### 19.1 Comportement réel

Le dashboard ne propose ni :

- pull-to-refresh
- bouton “Actualiser”
- refetch automatique à intervalle
- invalidation React Query

### 19.2 Rechargement réel

Le dashboard se recharge en deux situations :

1. lorsque le profil change, via useCandidateProfileData
2. lorsque l’événement “cv-uploaded” est reçu

```ts
window.addEventListener("cv-uploaded", handleCvUploaded);
```

Puis :

```ts
reloadCandidateDocuments();
if (refetch) {
  void refetch();
}
```

### 19.3 Déclencheur

Le schéma est exactement :

```text
CV uploadé
  ↓
CustomEvent cv-uploaded
  ↓
CandidateDashboardPage écouteur
  ↓
reloadCandidateDocuments()
  ↓
refetch du profil
```

---

## 20. Cache / performance

### 20.1 Mécanismes présents

Les mécanismes réels observés sont :

- useMemo pour les filtres et le contexte de recommandation
- useRef pour la gestion du contexte de recommandations
- localStorage pour mémoriser les documents du candidat
- useEffect pour lancer les données au montage
- useCandidateProfileData pour synchroniser plusieurs chargements de données de profil

### 20.2 Pas de React Query / Zustand / Redux

Le code ne montre pas :

- React Query/TanStack Query
- Zustand
- Redux
- cache global dédié au dashboard

### 20.3 localStorage

L’utilisation de localStorage est un cache client pour les documents du candidat :

```ts
localStorage.getItem(`emploiplus-candidate-documents-${profile.id}`)
```

### 20.4 Requêtes parallèles

Le code charge plusieurs éléments en parallèle fonctionnellement :

- profile
- experiences
- educations
- skills
- languages
- preferences

via le hook unifié useCandidateProfileData.

### 20.5 Optimisations observées

- useMemo sur la signature de contexte pour éviter le reset inutile de pagination
- useEffect de protection pour ne pas écrire si le composant est démonté
- setRecommendedPage reset sur changement de profil / CV

---

## 21. Responsive

### 21.1 Desktop

Le layout est structuré en sidebar + contenu principal.

Le contenu principal utilise :

```tsx
<div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-7xl">
```

### 21.2 Tablette

Le code applique des classes comme :

```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

Cela donne :

- mobile : 1 colonne
- md : 2 colonnes
- lg : 3 colonnes

### 21.3 Mobile web

Le composant utilise :

```ts
const mobileApp = isMobileApp();
```

et le layout est adapté via :

```tsx
<div className={mobileApp ? "space-y-4 pt-0" : "space-y-8"}>
```

### 21.4 Sidebar responsive

Le layout utilise :

- sidebar desktop invisible sur mobile
- drawer mobile visible sur mobile
- CandidateMobileHeader sur mobile

### 21.5 Ordre des blocs

L’ordre est stable et identique sur desktop/mobile :

1. Welcome
2. Completion
3. Quick actions
4. Recommended jobs
5. Latest offers

---

## 22. Design

### 22.1 Couleurs et variables

Le dashboard utilise les palettes système de l’application. Les classes visuelles observées sont :

- bg-gradient-to-r from-slate-900 to-slate-800
- bg-slate-700
- text-slate-300
- bg-card
- border-border
- text-foreground
- text-muted-foreground
- bg-secondary
- bg-primary
- border-brand / brand

### 22.2 Typographie

Les titres utilisent :

- text-3xl font-bold
- text-2xl font-bold
- text-lg font-semibold
- text-sm text-slate-600

### 22.3 Espacements

Le layout utilise :

- space-y-8
- space-y-4
- gap-4
- p-6
- rounded-3xl
- rounded-2xl
- rounded-xl

### 22.4 Éléments visuels

- Card arrondies
- cartes action avec bordure colorée
- hover shadow-lg
- flèche ArrowRight
- dégradés de couleur sur actions rapides
- badges / tags dans les JobCards
- barre de progression

### 22.5 Icônes

Utilisées :

- Briefcase
- CheckCircle2
- Circle
- ChevronDown / ChevronRight / ChevronLeft
- TrendingUp
- Calendar
- MapPin
- DollarSign
- BookOpen
- Target
- Send
- ArrowRight

### 22.6 Boutons

- Button variant="outline" sur le bouton “Voir toutes les offres”
- Button plus classique sur pagination
- Link styled buttons dans JobCard

### 22.7 États visuels

- hover sur cartes
- opacity et grayscale sur offres expirées
- border dashed pour états vides

---

## 23. Authentification et permissions

### 23.1 Protection de route

La route est protégée par :

```tsx
<ProtectedRoute fallbackPath="/candidate/login" requiredPermissions={['dashboard.candidate']}>
```

### 23.2 Condition réelle

Le candidat doit être :

- authentifié
- avoir une ligne candidates correspondant à son user_id
- avoir la permission dashboard.candidate

### 23.3 Rôle candidat dérivé

Le rôle candidat est ajouté dans AuthContext si le candidat existe :

```ts
const candidateRoles = hasCandidateProfile ? ['candidate'] : [];
```

### 23.4 Permissions associées

Dans src/features/authentication/permissions/rolePermissions.ts, le rôle candidate a :

- dashboard.candidate
- candidate.read
- candidate.update
- candidate.apply
- jobs.read
- blog.read
- notifications.read

### 23.5 RLS / Supabase

Le code n’affiche pas dans cette page de règle RLS spécifique au dashboard. Les requêtes SQL sont exécutées avec le contexte utilisateur courant et la logique d’accès est portée par les guards frontend + contrats de données.

---

## 24. Services externes

### 24.1 Supabase

Le dashboard dépend fortement de Supabase :

- auth.session
- storage (pour les CV et documents éventuellement)
- tables candidates, job_offers, candidate_*, etc.

### 24.2 pdfjs-dist

Le code de aiMatchingService extrait le texte du CV PDF via :

```ts
import("pdfjs-dist/build/pdf.worker.min.js?url")
import("pdfjs-dist/legacy/build/pdf")
```

Fonction concernée :

```ts
extractTextFromPdfData(arrayBuffer)
```

### 24.3 LocalStorage

Le dashboard dépend du navigateur local pour restaurer les documents CV après rechargement / logout / login.

### 24.4 Aucun autre service externe

Aucune API externe, géolocalisation, analytics, marketing automation, SMS, WhatsApp, ou edge function n’est utilisée par cette page dans le code vérifié.

---

## 25. Composants importants du dashboard

| Composant | Fichier | Rôle | Données |
|---|---|---|---|
| CandidateDashboardPage | src/pages/candidate/CandidateDashboardPage.tsx | page principale du dashboard | profil, recommandations, offres |
| CandidateLayout | src/pages/candidate/CandidateLayout.tsx | layout du sous-espace candidat | navigation, shell |
| CandidateSidebar | src/components/candidate/CandidateSidebar.tsx | menu candidat | routes et accès |
| CandidateMobileHeader | src/components/candidate/CandidateMobileHeader.tsx | header mobile | titre et menu mobile |
| CandidateTopbar | src/components/candidate/CandidateTopbar.tsx | topbar desktop | navigation, logout |
| JobCard | src/features/jobs/components/JobCard.tsx | carte d’offre | titre, entreprise, contrat, localisation, score |
| CandidateDashboardSkeleton | src/components/ui/skeletons/CandidateDashboardSkeleton.tsx | chargement du dashboard | placeholders |
| Progress | src/components/ui/progress.tsx | barre de complétude | % de complétude |
| Button | src/components/ui/button.tsx | boutons d’action | actions et navigation |
| Card | src/components/ui/card.tsx | conteneurs visuels | contenu des blocs |

---

## 26. Hooks et services

| Hook/Service | Fichier | Rôle | Données |
|---|---|---|---|
| useCandidate | src/hooks/useCandidate.ts | profil candidat principal | profile |
| useCandidateProfileData | src/features/candidates/hooks/useCandidateProfileData.ts | chargement coordonné du profil et sous-données | profile, expériences, écoles, skills, langues, préférences |
| useProfileCompletion | src/features/profile/hooks/useProfileCompletion.ts | calcul de complétude | completionPercentage |
| useJobs | src/features/jobs/hooks/useJobs.ts | offres publiées | offres |
| getRecommendedJobs | src/services/aiMatchingService.ts | recommandations IA | offres recommandées |
| getCandidateProfileByUserId | src/features/candidates/api/profileApi.ts | profil salarié via user_id | candidate profile |
| getCandidateExperiences | src/features/candidates/api/experiencesApi.ts | expériences du candidat | experiences |
| getCandidateEducations | src/features/candidates/api/educationApi.ts | formations | educations |
| getCandidateSkills | src/features/candidates/api/skillsApi.ts | compétences | skills |
| getCandidateLanguages | src/features/candidates/api/languagesApi.ts | langues | languages |
| getCandidatePreferences | src/features/candidates/api/preferencesApi.ts | préférences | preferences |
| jobService.getPublishedOffers | src/features/jobs/api/jobsApi.ts | offres publiées | job_offers |

---

## 27. Spécification pour l’application mobile

# SPÉCIFICATION POUR LE TABLEAU DE BORD MOBILE

Cette section ne décide pas arbitrairement ce que l’application mobile doit afficher. Elle liste simplement les éléments réels disponibles et leur source pour que le produit puisse décider ensuite ce qu’il faut conserver.

## 27.1 Éléments disponibles sur le site

Liste exhaustive des blocs présents dans le dashboard actuel :

- Welcome Card
- Complétude de votre profil
- Actions rapides
- Offres recommandées pour votre profil
- Dernières offres publiées

### Bloc “Welcome Card”
- contenu : prénom + message
- pas de photo affichée dans le dashboard actuel

### Bloc “Complétude de votre profil”
- calcul basé sur 10 indicateurs
- liste détaillée extensible

### Bloc “Actions rapides”
- Compléter mon profil
- Consulter les guides
- Voir mes candidatures

### Bloc “Offres recommandées”
- données dynamiques venant du moteur de recommandation IA
- pagination

### Bloc “Dernières offres publiées”
- 3 dernières offres publiées
- ordre publish_at DESC

---

## 27.2 Données disponibles

### Profil candidat

Table : candidates

Colonnes utilisées :

```text
id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, location_city, location_country, date_of_birth, status, cv_text, embedding_vector, cv_url, created_at, updated_at
```

### Profil secondaire

- candidate_experience
- candidate_education
- candidate_skills
- candidate_languages
- candidate_preferences

### Offres

Table : job_offers

Colonnes utilisées :

```text
id, slug, title, company, contract_type, location_city, location_country, salary, publish_at, deadline, expires_at, status, cover_image, description, requirements, tags, application_email, external_link
```

---

## 27.3 Statistiques disponibles

### Statistique réelle du dashboard

1. Complétude du profil
   - source : profile + données annexes
   - calcul : 10 éléments, pourcentage
   - composant : Progress

### Statistiques non présentes

- nombre de candidatures
- nombre d’offres sauvegardées
- nombre de notifications
- nombre de documents
- positions internes
- scores de performance du candidat

---

## 27.4 Actions disponibles

Routes / actions réelles observées :

- /candidate/profile
- /candidate/guides
- /candidate/applications
- /jobs
- /jobs/:slug
- /candidate/jobs/:slug/apply

### Actions non route-based

- ouvrir / fermer le détail de complétude
- pagination des recommandations

---

## 27.5 Données indispensables

Ce qui est nécessaire pour reconstruire chaque élément si l’on veut reproduire le dashboard web dans le mobile :

### Pour Welcome Card
- first_name
- user/session

### Pour Profile Completion
- profile: first_name, last_name, headline, location_city, location_country, bio, avatar_url
- experiences array
- educations array
- skills array
- languages array
- preferences

### Pour Actions rapides
- libellés statiques
- route cible

### Pour offres recommandées
- candidate id
- cv_text / cv_url / embedding_vector
- données de job_offers
- score de recommandation

### Pour dernières offres publiées
- job_offers publiées
- publish_at
- fields UI affichées

---

## 27.6 Données optionnelles

Les éléments qui peuvent être supprimés sans casser la logique principale du dashboard :

- animation / hover / micro-interactions visuelles
- motif de fond, gradient, ombres
- flèche de navigation de cartes
- le message textuel “Bienvenue dans votre espace de candidat...”
- l’icône Briefcase d’accueil
- les pages “Voir toutes les offres” si le mobile ne les expose pas
- exact style de card des offres si on réutilise un composant plus simple

---

## 28. Proposition de structure mobile

Voici une structure logique basée uniquement sur le dashboard actuel, sans décider à la place du produit.

```text
Dashboard mobile
│
├── Header d’accueil candidat
│   └── prénom + message de bienvenue
│
├── Bloc complétude du profil
│   ├── pourcentage
│   ├── barre de progression
│   └── liste des éléments incomplets
│
├── Actions rapides
│   ├── Compléter mon profil
│   ├── Consulter les guides
│   └── Voir mes candidatures
│
├── Offres recommandées
│   ├── données IA / CV
│   ├── liste de cartes
│   └── pagination locale ou bouton plus
│
└── Dernières offres publiées
    ├── liste des offres publiées
    └── bouton voir plus / postuler
```

### Par bloc : données, source, importance, dépendances

| Bloc | Données nécessaires | Source | Importance | Dépendances |
|---|---|---|---|---|
| Header | first_name | candidates | élevée | session auth |
| Complétude | fields profile + sous-données | candidates + candidate_* | élevée | profil candidat |
| Actions rapides | libellés + routes | constante locale | moyenne | aucune |
| Recommandations | candidate id + CV + offres | candidates + job_offers + RPC | élevée | CV + matching |
| Dernières offres | job_offers publiées | job_offers | élevée | publication |

---

## 29. Tableau de synthèse final

| Élément | Affiché sur web | Source | Calcul | Interaction | Nécessaire mobile ? |
|---|---|---|---|---|---|
| Bienvenue | Oui | candidates.first_name | concat avec texte fixe | aucune | À décider |
| Complétude du profil | Oui | candidates + sous-tableaux | 10 éléments, pourcentage | ouvrir/fermer | À décider |
| Actions rapides | Oui | constante locale | static | navigation | À décider |
| Recommandations | Oui | candidates + job_offers + RPC | match_job_offers_for_candidate | pagination, navigation | À décider |
| Dernières offres | Oui | job_offers | status published + publish_at desc | navigation | À décider |
| Candidatures | Non | — | — | — | À décider |
| Notifications | Non | — | — | — | À décider |
| Documents/CV | Non affiché directement | candidates.cv_text / cv_url | utilisé pour recommandations | upload / rechargement | À décider |
| Historique profil | Non | — | — | — | À décider |
| Statistiques KPI | Non | — | — | — | À décider |

---

## Conclusion

Le dashboard candidat actuel est un espace de synthèse orienté profil + recommandations + offres, pas un tableau de bord de suivi de candidature complet. La logique de complétude est explicitement calculée côté front à partir d’un ensemble de données liées au candidat, tandis que les recommandations utilisent le CV et un RPC de matching. Les dernières offres publiques sont affichées selon un filtre de publication et un tri chronologique.

Il n’y a pas dans le code actuel de:

- bloc “candidatures” dans le dashboard
- bloc “notifications” dans le dashboard
- statistiques de performance
- sections de documents visibles
- widgets bruts de suivi RH

La reproduction mobile devra donc être guidée par les éléments réellement présents et non par une hypothèse de tableau de bord complet.
