# AUDIT COMPLET — SYSTÈME DE MATCHING CV ↔ OFFRE D'EMPLOI

**Document d'analyse technique** — Code source du projet EmploiPlus Group  
**Date d'analyse:** 2026-08-15  
**Objectif:** Reproduction exacte de la logique côté React Native mobile native  
**Attention:** NO MODIFICATIONS, ANALYSIS ONLY

---

## TABLE DES MATIÈRES

1. Vue générale du flux de matching
2. Point d'entrée principal
3. Les données du candidat utilisées
4. Les données de l'offre utilisées
5. Analyse du CV (extraction et traitement)
6. La RPC Supabase de matching
7. Le calcul du score (fallback local)
8. Intégration Grok / IA
9. Prompt Grok exact
10. Cache des analyses
11. Affichage et composants
12. Cas particuliers et fallbacks

---

## 1. VUE GÉNÉRALE DU FLUX DE MATCHING

### Architecture globale

```
Candidat authentifié
    ↓
Dashboard (CandidateDashboardPage.tsx)
    ↓
Hook: useCandidateProfileData()
    ↓
Service: getRecommendedJobs(candidateId, threshold, count, offset)
    ↓
RPC Supabase: match_job_offers_for_candidate(...)
    ↓
Résultat: Offres avec scores de similitude
    ↓
Fallback local (si scores invalides): computeMatchScore()
    ↓
Affichage: RecommendedJob[] avec score
```

### Deux systèmes de scoring parallèles

Le projet utilise **DEUX systèmes de matching complètement différents**:

1. **Système 1: Matching par similarité vectorielle (RPC Supabase + pgvector)**
   - Utilise: CV embedding vs Job embedding
   - Calcul: Cosine similarity (1 - distance cosinus)
   - Type: Score flottant [0.0, 1.0] normalisé en pourcentage
   - Localisation: Supabase RPC `match_job_offers_for_candidate`

2. **Système 2: Matching textuel fallback (Local JavaScript)**
   - Utilise: cv_text brut vs title/description/requirements
   - Calcul: Combinaison de plusieurs scores partiels
   - Type: Entier [0, 100]
   - Localisation: `matchScoreUtils.ts` - `computeMatchScoreFromText()`

3. **Système 3: Analyse IA Grok (Optionnel, pour détails)**
   - Utilise: cv_text + job details + prompt spécialisé
   - Retourne: score, forces, améliorations, lettre de motivation
   - Localisation: `groqAnalysisService.ts` - `analyzeCandidateForJob()`
   - Cache: Table `ai_analysis_cache`

---

## 2. POINT D'ENTRÉE PRINCIPAL

### Fichier: `src/pages/candidate/CandidateDashboardPage.tsx`

**Ligne: 28-29** (imports)
```typescript
import { getRecommendedJobs, RecommendedJob } from "@/services/aiMatchingService";
```

**Ligne: 130** (création du contexte de recommandation)
```typescript
const recommendationContextSignature = useMemo(() => {
  return `${profile?.id}-${profile?.cv_text || ""}-${profile?.embedding_vector || ""}`;
}, [profile?.id, profile?.cv_text, profile?.embedding_vector]);
```

**Ligne: 323-328** (appel de getRecommendedJobs)
```typescript
console.debug(
  `[Dashboard] Calling getRecommendedJobs for candidate ${profile.id}, page ${recommendedPage}`,
  {
    hasCV: !!profile?.cv_text,
    hasEmbedding: !!profile?.embedding_vector,
  }
);
```

**Ligne: 340-360** (chargement des offres recommandées)
```typescript
const { data: recommendedData, error: recommendedError, isLoading: recommendedLoading } = useQuery({
  queryKey: ["recommendedJobs", profile?.id, recommendedPage],
  queryFn: () => getRecommendedJobs(
    profile.id,
    0,  // matchThreshold
    RECOMMENDED_OFFERS_PER_PAGE,  // 10
    (recommendedPage - 1) * RECOMMENDED_OFFERS_PER_PAGE
  ),
  enabled: !!profile?.id && !!profile?.cv_text,  // ✅ Exige CV
});
```

### Flux d'exécution complet

```
CandidateDashboardPage
  ↓
useCandidateProfileData()  [Hook dans src/features/candidates/hooks/useCandidateProfileData.ts]
  ↓
Charge en parallèle:
  - profile (candidates)
  - experiences (candidate_experience)
  - educations (candidate_education)
  - skills (candidate_skills)
  - languages (candidate_languages)
  - preferences (candidate_preferences)
  ↓
useQuery({ queryKey: ["recommendedJobs", ...] })
  ↓
getRecommendedJobs(candidateId, 0, 10, offset)  [Service]
  ↓
supabase.rpc("match_job_offers_for_candidate", params)
  ↓
Supabase RPC SQL
  ↓
Retour: RecommendedJob[] avec score
  ↓
Fallback local si scores invalides
  ↓
Affichage dans <SaasGrid>
```

---

## 3. DONNÉES DU CANDIDAT UTILISÉES

### Résumé

| Donnée | Utilisée ? | Où | Rôle |
|--------|-----------|-----|------|
| cv_text | ✅ OUI | RPC (embedding), Fallback local, Grok | Texte complet du CV pour analyse |
| embedding_vector | ✅ OUI | RPC (cosine similarity) | Vecteur 768D du CV normalisé |
| first_name | ❌ NON | - | Non utilisée dans matching |
| last_name | ❌ NON | - | Non utilisée dans matching |
| headline | ❌ NON | - | Non utilisée dans matching |
| bio | ❌ NON | - | Non utilisée dans matching |
| location_city | ❌ NON | - | Non utilisée dans matching |
| location_country | ❌ NON | - | Non utilisée dans matching |
| experiences[] | ❌ NON | - | Non utilisée dans matching |
| educations[] | ❌ NON | - | Non utilisée dans matching |
| skills[] | ❌ NON | - | Non utilisée dans matching |
| languages[] | ❌ NON | - | Non utilisée dans matching |
| preferences | ❌ NON | - | Non utilisée dans matching |
| avatar_url | ❌ NON | - | Non utilisée dans matching |
| cv_url | ❌ NON | - | Non utilisée dans matching |

### Détails

#### cv_text

**Source:** Table `candidates` colonne `cv_text` (TEXT)

**Format:** Texte brut extrait d'un PDF via `extractTextFromPdf()`

**Utilisation:**
- **Générée lors:** Upload CV (voir `processCandidateCvUpload()`)
- **Utilisée pour RPC:** Création du `embedding_vector`
- **Utilisée pour fallback local:** Comparaison textuelle directe
- **Utilisée pour Grok:** Envoi au prompt pour analyse IA

**Vérification:** Ligne 283 de `getRecommendedJobs()`
```typescript
const { data: candidateData, error: candError } = await supabase
  .from("candidates")
  .select("id, cv_text")
  .eq("id", candidateId)
  .single();

const cvText = (candidateData && (candidateData as CandidateRow).cv_text) ?? "";
```

#### embedding_vector

**Source:** Table `candidates` colonne `embedding_vector` (TEXT, contient JSON d'un vecteur)

**Format:** Chaîne JSON représentant un vecteur 768D normalisé
```
"[0.001234, 0.002345, ..., 0.000001]"
```

**Génération:** Fonction `createEmbeddingVectorString()` lignes 47-68 de `aiMatchingService.ts`
```typescript
export function createEmbeddingVectorString(text: string): string {
  const rawTokens = normalizeText(text).match(/[a-z0-9]+/g) ?? [];
  const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);  // 768D

  if (rawTokens.length > 0) {
    rawTokens.forEach((token, index) => {
      const slot = Math.abs(hashToken(token)) % VECTOR_DIMENSIONS;
      vector[slot] += 1 + (index % 7) / 10;
    });

    const magnitude = Math.hypot(...vector);
    if (magnitude > 0) {
      for (let index = 0; index < vector.length; index += 1) {
        vector[index] = vector[index] / magnitude;
      }
    }
  }

  return `[${vector.map((value) => value.toFixed(6)).join(",")}]`;
}
```

**Utilisation:** RPC `match_job_offers_for_candidate` calcule la cosine similarity
```sql
1 - (cand.embedding_vector <=> job_offers.embedding_vector) AS similarity
```

#### Autres données

**Explication:** Aucune autre donnée du candidat n'est utilisée dans le matching CV ↔ Offre.

Les informations comme experiences, educations, skills, languages, preferences sont utilisées UNIQUEMENT pour:
- Le calcul de complétude du profil
- Champs informatifs dans le profil du candidat
- Mais PAS pour le matching avec les offres

---

## 4. DONNÉES DE L'OFFRE UTILISÉES

### Résumé

| Champ job_offers | Utilisé ? | Où | Rôle |
|------------------|-----------|-----|------|
| id | ✅ OUI | Partout | Identifiant unique |
| title | ✅ OUI | RPC (embedding), Fallback, Grok | Titre du poste |
| description | ✅ OUI | RPC (embedding), Fallback, Grok | Description complète |
| requirements | ✅ OUI | RPC (embedding), Fallback, Grok | Exigences du poste |
| company | ✅ OUI | RPC (embedding), Fallback, Grok | Nom de l'entreprise |
| location_city | ✅ OUI | RPC (embedding) | Ville du poste |
| contract_type | ✅ OUI | RPC (embedding) | Type de contrat (CDI, CDD, etc.) |
| status | ✅ OUI | RPC (filtre) | Doit être 'published' |
| expires_at | ✅ OUI | RPC (filtre) | Exclure si expiré |
| embedding_vector | ✅ OUI | RPC (cosine similarity) | Vecteur 768D de l'offre |
| salary | ❌ NON | - | Non utilisé dans le matching |
| salary_min | ❌ NON | - | Non utilisé dans le matching |
| salary_max | ❌ NON | - | Non utilisé dans le matching |
| deadline | ❌ NON | - | Non utilisé dans le matching |
| tags | ❌ NON | - | Non utilisé dans le matching |
| slug | ❌ NON | - | Utilisé pour lien, pas matching |
| created_at | ❌ NON | - | Non utilisé dans le matching |

### Détails

#### Utilisation dans RPC

Lignes 1-70 de `20260727_update_match_job_offers_for_candidate_pagination.sql`:

```sql
WITH cand AS (
  SELECT embedding_vector FROM public.candidates WHERE id = candidate_id
),
offers AS (
  SELECT *,
    1 - (cand.embedding_vector <=> job_offers.embedding_vector) AS similarity
  FROM public.job_offers, cand
  WHERE job_offers.embedding_vector IS NOT NULL
    AND job_offers.status = 'published'
    AND (
      job_offers.expires_at IS NULL
      OR job_offers.expires_at > NOW()
      OR (job_offers.expires_at IS NULL AND job_offers.deadline IS NULL)
    )
)
SELECT
  -- Tous les champs job_offers retournés
  o.id,
  o.title,
  o.company,
  o.description,
  o.requirements,
  o.location_city,
  o.contract_type,
  o.slug,
  -- ... autres champs ...
  o.similarity as score
FROM offers o
WHERE o.similarity >= match_threshold
ORDER BY o.similarity DESC
LIMIT match_count
OFFSET match_offset;
```

#### Utilisation dans fallback local

Lignes 305-312 de `aiMatchingService.ts`:

```typescript
const jobOffer: JobOfferRow = {
  id: offer.id,
  title: (offer.title as string) ?? "",
  company: (offer.company as string) ?? "",
  description: (offer.description as string) ?? "",
  requirements: (offer.requirements as string) ?? "",
  location_city: (offer.location_city as string) ?? "",
  contract_type: (offer.contract_type as string) ?? "",
  // ...
} as unknown as JobOfferRow;
```

Utilisé dans `computeMatchScore()` ligne 318:

```typescript
export function computeMatchScore(cvText: string, jobOffer: JobOfferRow): { score: number; details: Record<string, any> } {
  const result = computeMatchScoreFromText(cvText, {
    title: jobOffer.title,
    description: jobOffer.description,
    requirements: jobOffer.requirements,
  });
}
```

#### Génération du embedding_vector de l'offre

Fonction `generateJobEmbeddingVector()` lignes 16-28 de `aiMatchingService.ts`:

```typescript
export function generateJobEmbeddingVector(job: JobOfferEmbeddingSource): string {
  const text = [
    job.title,
    job.company,
    job.location_city,
    job.contract_type,
    job.description,
    job.requirements,
  ]
    .filter((part): part is string => Boolean(part))
    .join("\n");

  return createEmbeddingVectorString(text);
}
```

---

## 5. ANALYSE DU CV (EXTRACTION ET TRAITEMENT)

### Workflow complet d'upload CV

```
Utilisateur sélectionne PDF
  ↓
DocumentsSection.tsx (pages/candidate/CandidateDocumentsPage.tsx)
  ↓
processCandidateCvUpload(candidateId, file, cvUrl)
  ↓
extractTextFromPdf(file)
  ↓
extractTextFromPdfData(arrayBuffer)
  ↓
pdfjs-dist getDocument().promise
  ↓
Boucle sur chaque page
  ↓
page.getTextContent()
  ↓
Retour: cvText (texte brut complet)
  ↓
updateCandidateCvText(candidateId, cvText, cvUrl)
  ↓
Mise à jour Supabase:
  - candidates.cv_text = cvText
  - candidates.embedding_vector = createEmbeddingVectorString(cvText)
  - candidates.cv_url = cvUrl (optionnel)
  ↓
Invalidation du cache:
  - DELETE ai_analysis_cache WHERE candidate_id = ?
  - localStorage.removeItem(key)
  ↓
Événement broadcast: "cv-uploaded"
  ↓
Dashboard re-fetch recommendedJobs
```

### Extraction de texte PDF

**Fonction:** `extractTextFromPdfData(arrayBuffer)` lignes 107-147 de `aiMatchingService.ts`

```typescript
export async function extractTextFromPdfData(arrayBuffer: ArrayBuffer): Promise<string> {
  type PdfJsLibrary = {
    getDocument: (options: { data: ArrayBuffer }) => {
      promise: Promise<{
        numPages: number;
        getPage: (pageNumber: number) => Promise<{
          getTextContent: () => Promise<{ items: Array<{ str?: string | null }> }>;
        }>;
      }>;
    };
    GlobalWorkerOptions: { workerSrc: string };
  };

  let pdfjsLib: PdfJsLibrary;

  try {
    const [{ default: workerSrc }, pdfModule] = await Promise.all([
      import("pdfjs-dist/build/pdf.worker.min.js?url"),
      import("pdfjs-dist/legacy/build/pdf") as Promise<PdfJsLibrary>,
    ]);

    pdfjsLib = pdfModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  } catch (error) {
    throw new Error("pdfjs-dist is required to extract text from PDFs...");
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textChunks: string[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str ?? "");
    textChunks.push(strings.join(" "));
  }

  return textChunks.join("\n\n").trim();
}
```

### Création du vecteur d'embedding

**Fonction:** `createEmbeddingVectorString(text)` lignes 47-68 de `aiMatchingService.ts`

**Algorithme:**
1. Normalisation du texte (minuscules, espaces)
2. Extraction des tokens (alphanumériques uniquement)
3. Création d'un vecteur 768D rempli de 0
4. Pour chaque token:
   - Hachage du token (`hashToken()`)
   - Placement dans un slot du vecteur (modulo 768)
   - Incrément: `1 + (index % 7) / 10` (bonus par position)
5. Normalisation: division par la magnitude (norme L2)
6. Retour: JSON string du vecteur

**Remarque:** C'est un **embedding personnalisé léger**, PAS un vrai embedding neural (pas de modèle pré-entraîné).

---

## 6. LA RPC SUPABASE DE MATCHING

### Nom et signature

**RPC:** `public.match_job_offers_for_candidate`

**Fichier définition:** `supabase/migrations/20260727_update_match_job_offers_for_candidate_pagination.sql`

**Signature SQL:**
```sql
CREATE OR REPLACE FUNCTION public.match_job_offers_for_candidate(
  candidate_id UUID,
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 10,
  match_offset INT DEFAULT 0
) RETURNS TABLE(...)
```

### Paramètres d'entrée

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| candidate_id | UUID | - | ID du candidat (obligatoire) |
| match_threshold | FLOAT | 0.0 | Seuil minimum de similarité [0.0, 1.0] |
| match_count | INT | 10 | Nombre d'offres à retourner |
| match_offset | INT | 0 | Offset pour pagination |

### Appel depuis le code

Lignes 247-257 de `aiMatchingService.ts`:

```typescript
export async function getRecommendedJobs(
  candidateId: string,
  matchThreshold = 0.0,
  matchCount = 10,
  matchOffset = 0,
): Promise<RecommendedJob[]> {
  const params = {
    candidate_id: candidateId,
    match_threshold: matchThreshold,
    match_count: matchCount,
    match_offset: matchOffset,
  } as const;

  const { data, error } = await supabase.rpc("match_job_offers_for_candidate", params);
```

### Algorithme SQL complet

```sql
WITH cand AS (
  -- Récupère l'embedding du candidat
  SELECT embedding_vector FROM public.candidates WHERE id = candidate_id
),
offers AS (
  -- Calcule la similarité avec chaque offre
  SELECT *,
    1 - (cand.embedding_vector <=> job_offers.embedding_vector) AS similarity
  FROM public.job_offers, cand
  WHERE 
    -- Filtres essentiels
    job_offers.embedding_vector IS NOT NULL
    AND job_offers.status = 'published'
    AND (
      -- L'offre ne doit pas être expirée
      job_offers.expires_at IS NULL
      OR job_offers.expires_at > NOW()
      OR (job_offers.expires_at IS NULL AND job_offers.deadline IS NULL)
    )
)
SELECT
  -- Retour de tous les champs job_offers
  o.id,
  o.application_email,
  o.application_whatsapp,
  o.auto_share,
  o.company,
  o.company_logo,
  o.contract_type,
  o.cover_image,
  o.created_at,
  o.deadline,
  o.description,
  o.expires_at,
  o.external_link,
  o.featured_until,
  o.slug,
  o.status,
  o.tags,
  o.title,
  o.updated_at,
  o.views_count,
  o.salary,
  o.publish_at,
  o.og_image,
  o.meta_title,
  o.meta_description,
  o.cover_image as cover_image_url,
  o.similarity as score  -- ✅ Le score est la similarité cosinus
FROM offers o
WHERE o.similarity >= match_threshold
ORDER BY o.similarity DESC
LIMIT match_count
OFFSET match_offset;
```

### Calcul de similarité

**Formule:** `1 - (vector1 <=> vector2)`

**Où:**
- `<=>` est l'opérateur pgvector de distance cosinus
- La distance cosinus vaut entre 0 et 2
- Pour vecteurs normalisés: distance entre 0 et 1
- `1 - distance` = similarité (1.0 = identique, 0.0 = très différent)

**Type de retour:** FLOAT [0.0, 1.0]

**Conversion en pourcentage:** NOT dans la RPC, le fallback local le fait

### Filtres appliqués

1. **embedding_vector NOT NULL** — Offres sans vecteur exclues
2. **status = 'published'** — Seulement offres publiées
3. **expires_at IS NULL OR expires_at > NOW()** — Offres valides uniquement
4. **similarity >= match_threshold** — Filtrage par seuil

### Tri et limite

```sql
ORDER BY o.similarity DESC
LIMIT match_count
OFFSET match_offset
```

---

## 7. LE CALCUL DU SCORE (FALLBACK LOCAL)

### Quand le fallback est déclenché

Lignes 286-302 de `aiMatchingService.ts`:

```typescript
// If RPC returned identical or missing scores, compute a dynamic fallback per-offer
const scores = offers.map((o) => (o as any).score ?? (o as any).match_score ?? null);
const allSame = scores.length > 0 && scores.every((s) => s === scores[0] && s !== null);

if (allSame || scores.some((s) => s === null)) {
  // compute fallback scores locally and attach to offers
  if (!cvText || cvText.trim().length === 0) {
    console.warn("[getRecommendedJobs] Fallback local non exécuté car le CV est manquant...");
  } else {
    for (const offer of offers) {
      // Calcul du score
    }
  }
}
```

**Conditions de déclenchement:**
1. Tous les scores sont identiques ET non-null, OU
2. Au moins un score est null/undefined

### Fonction de calcul: `computeMatchScoreFromText()`

**Fichier:** `src/services/matchScoreUtils.ts`

**Signature:**
```typescript
export function computeMatchScoreFromText(
  cvText: string,
  jobOffer: { title?: string | null; description?: string | null; requirements?: string | null }
): MatchScoreResult
```

**Retour:**
```typescript
export interface MatchScoreResult {
  score: number;  // [0, 100]
  details: MatchScoreDetails;
}

export interface MatchScoreDetails {
  skillsScore: number;        // [0, 40]
  experienceScore: number;    // [0, 25]
  titleScore: number;         // [0, 10]
  educationScore: number;     // [0, 10]
  semanticScore: number;      // [0, 15]
  overlap: number;
  cvYears: number;
  reqYears: number;
  hardSkillsOverlap: number;
  dealBreakerApplied: boolean;
}
```

### Algorithme complet

#### Étape 1: Normalisation du texte

```typescript
const cv = normalizeText(cvText || "");                    // MinMaj, espaces
const title = normalizeText(safe(jobOffer.title));
const description = normalizeText(safe(jobOffer.description));
const requirements = normalizeText(safe(jobOffer.requirements));

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}
```

#### Étape 2: Extraction des tokens

```typescript
const cvTokens = extractTokens(cv);               // Mots uniques du CV
const reqTokens = extractTokens([
  title, 
  description, 
  requirements
].join(" "));                                      // Mots uniques de l'offre

function extractTokens(text: string): Set<string> {
  return new Set((text.match(/[a-z0-9]+/g) ?? []).filter(Boolean));
}
```

#### Étape 3: Calcul du Skills Score (40 points max)

```typescript
let overlap = 0;
for (const token of reqTokens) {
  if (cvTokens.has(token)) overlap += 1;
}
const skillsScore = reqTokens.size > 0
  ? Math.min(40, Math.round((overlap / reqTokens.size) * 40))
  : 0;

// Formule: (tokens communs / tokens requis) * 40, plafonné à 40
```

#### Étape 4: Calcul du Experience Score (25 points max)

```typescript
const cvYears = parseYears(cvText);
const reqYears = parseYears([title, description, requirements].join(" "));

let experienceScore = 0;
if (reqYears > 0) {
  // Cas où l'offre exige une expérience
  experienceScore = Math.max(
    0,
    Math.min(
      25,
      Math.round((Math.min(cvYears, reqYears) / reqYears) * 25)
    )
  );
} else {
  // Cas où l'offre n'exige pas d'expérience
  experienceScore = cvYears > 0
    ? Math.min(15, Math.round((cvYears / 10) * 15))
    : 0;
}

// Détection des années: regex cherchant "X ans" ou années de 1900-2099
function parseYears(text: string): number {
  const m = text.match(/(\d{1,2})\s*(?:ans|years)/i);
  if (m) return Number(m[1]);
  const y = text.match(/(19|20)\d{2}/g);
  if (y && y.length >= 2) {
    const nums = y.map(Number);
    return Math.max(0, Math.abs(nums[nums.length - 1] - nums[0]));
  }
  return 0;
}
```

#### Étape 5: Calcul du Title Score (10 points max)

```typescript
const titleTokens = extractTokens(title);
let titleOverlap = 0;
for (const token of titleTokens) {
  if (cvTokens.has(token)) titleOverlap += 1;
}
const titleScore = titleTokens.size > 0
  ? Math.min(10, Math.round((titleOverlap / titleTokens.size) * 10))
  : 0;

// Même logique que skills, appliquée au titre seul
```

#### Étape 6: Calcul du Education Score (10 points max)

```typescript
const educationKeywords = ["diplome", "master", "licence", "bachelor", "pmp", "aws", "certif"];
let educationMatch = 0;
for (const keyword of educationKeywords) {
  if (cv.includes(keyword)) educationMatch += 1;
}
const educationScore = Math.min(10, Math.round((educationMatch / educationKeywords.length) * 10));

// Compte les mots-clés d'éducation trouvés dans le CV
```

#### Étape 7: Calcul du Semantic Score (15 points max)

```typescript
const vecCvStr = createEmbeddingVectorString(cvText);
const vecJobStr = createEmbeddingVectorString([title, description, requirements].join(" "));

const toNumbers = (s: string) => JSON.parse(s) as number[];
let semanticScore = 0;
try {
  const v1 = toNumbers(vecCvStr);
  const v2 = toNumbers(vecJobStr);
  let dot = 0;
  for (let index = 0; index < Math.min(v1.length, v2.length); index += 1) {
    dot += v1[index] * v2[index];
  }
  // Cosine similarity: (dot + 1) / 2 normalise le résultat
  semanticScore = Math.round(((dot + 1) / 2) * 15);
} catch {
  semanticScore = 0;
}

// Comparaison des vecteurs d'embedding via cosine similarity
```

#### Étape 8: Détection des Hard Skills (Deal Breaker)

```typescript
function extractTechnicalKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const keywords = [
    "comptabil", "comptable", "finance", "fiscal", "audit",
    "gestion de paie", "paie", "facturation", "reporting",
    "clôture", "budget", "droit", "santé", "médical",
    "juridique", "marketing", "design",
    "chef de projet", "projet", "gestion de projet",
  ];
  return keywords.filter((keyword) => normalized.includes(keyword));
}

const technicalKeywords = extractTechnicalKeywords(
  [title, description, requirements].join(" ")
);
const hardSkillsOverlap = technicalKeywords.length > 0
  ? technicalKeywords.filter((keyword) => cv.includes(keyword)).length
  : 0;
const dealBreakerApplied = technicalKeywords.length > 0 && hardSkillsOverlap === 0;

// Si l'offre mentionne un domaine technique spécialisé ET que le CV ne le mentionne pas → 25% max
```

#### Étape 9: Calcul final

```typescript
const raw = skillsScore + experienceScore + titleScore + educationScore + semanticScore;
// raw peut dépasser 100 (40+25+10+10+15 = 100, mais les limites peuvent varier)

const score = dealBreakerApplied
  ? 25
  : Math.max(0, Math.min(100, Math.round(raw)));

// Si deal breaker appliqué: forcer à 25%
// Sinon: limiter entre 0 et 100
```

### Résumé des composants du score

| Composant | Points max | Condition | Formule |
|-----------|-----------|-----------|---------|
| Skills | 40 | Toujours | (tokens communs / tokens offre) × 40 |
| Experience | 25 | Toujours | (min(années CV, années offre) / années offre) × 25 |
| Title | 10 | Toujours | (tokens titre communs / tokens titre) × 10 |
| Education | 10 | Si keywords trouvés | (keywords trouvés / 7) × 10 |
| Semantic | 15 | Toujours | (cosine similarity + 1) / 2 × 15 |
| Total | 100 | Sans deal breaker | Somme limitée [0, 100] |
| **Deal Breaker** | **25** | Si domaine spécialisé absent | Force le score à 25% |

### Pourcentages possibles

Avec ces calculs entiers arrondis, les scores possibles sont multiples:
- 0, 1, 2, 3, ..., 100 (presque tous les entiers)
- Minimum: 0 (aucune correspondance)
- Maximum: 100 (ou 25 si deal breaker)

---

## 8. INTÉGRATION GROK / IA

### Présentation générale

**Service:** `src/services/groqAnalysisService.ts`

**Utilité:** Analyse détaillée d'une offre pour un candidat spécifique
- Calcul d'un score de compatibilité
- Extraction des forces
- Extraction des améliorations
- Génération d'une lettre de motivation brouillon

**Cache:** Table Supabase `ai_analysis_cache`

**API:** Groq (llama-3.1-8b-instant)

### Quand est-ce utilisé?

**Actuellement:** Pas utilisé automatiquement dans le dashboard pour les offres recommandées.

**Utilisé quand:** L'utilisateur affiche le détail d'une offre spécifique et clique sur "Analyser" ou un bouton similaire.

**Fichier appelant:** Non trouvé dans le dashboard principal — probablement dans `JobOfferDetailPage.tsx` ou un composant d'analyse détaillée.

### Fonction principale

```typescript
export async function analyzeCandidateForJob(
  candidateId: string,
  jobId: string
): Promise<AiAnalysisResult>
```

### Workflow complet

```
analyzeCandidateForJob(candidateId, jobId)
  ↓
1. fetchCachedAnalysis(candidateId, jobId)
   ↓ Si cached et version valide: retour immédiat
   ↓
2. Récupérer en parallèle:
   - candidates.cv_text
   - job_offers.title, company, description, requirements
  ↓
3. Si cv_text est vide:
   - Fallback: resolveCandidateCvTextFromLocalCandidate()
   - Chercher dans localStorage
  ↓
4. Vérifier clé API Groq
  ↓
5. Générer prompt: buildGroqAnalysisPrompt(cv_text, job, jobId, yearsExperience)
  ↓
6. POST https://api.groq.com/openai/v1/chat/completions
   - Model: llama-3.1-8b-instant
   - Temperature: 0.2
   - response_format: json_object
  ↓
7. Extraire et parser JSON
  ↓
8. Sanitiser la réponse: sanitizeAnalysisPayload()
  ↓
9. Persister en cache: persistAnalysis()
  ↓
10. Retour: AiAnalysisResult
```

### Clés API

**Variables d'environnement:**
```
VITE_GROQ_API_KEY  (côté client)
GROQ_API_KEY       (fallback côté server)
```

**Récupération:** Lignes 35-42 de `groqAnalysisService.ts`
```typescript
function getGroqApiKey(): string | undefined {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.GROQ_API_KEY) ||
    (typeof process !== "undefined" ? process.env.GROQ_API_KEY : undefined)
  );
}
```

### Gestion du cache

**Version du prompt:** `PROMPT_VERSION = "v2.2_2026-07-27"` ligne 10

**Table cache:** `ai_analysis_cache`
- Colonnes: candidate_id, job_id, match_score, strengths, improvements, cover_letter_draft, prompt_version
- Clé unique: (candidate_id, job_id)

**Invalidation:** Automatique quand:
- Version du prompt change
- CV du candidat est modifié (DELETE * FROM ai_analysis_cache WHERE candidate_id = ?)

---

## 9. PROMPT GROK EXACT

### Générateur de prompt

**Fichier:** `src/services/groqAnalysisPrompt.ts`

**Fonction:** `buildGroqAnalysisPrompt(cvText, job, jobId, yearsExperience)`

### PROMPT COMPLET ET EXACT

```
Tu es un Directeur des Ressources Humaines et Expert Senior en Recrutement fort de 15 ans d'expérience. Ta mission est d'évaluer avec une précision chirurgicale, impartialité et pragmatisme la compatibilité entre un CV et une offre d'emploi.

RÈGLES D'ANALYSE RH STRICTES (À APPLIQUER SANS DÉVIATION) :

1. FIDÉLITÉ AU CV :
   - Analyse STRICTEMENT le texte du CV fourni. Ne suppose PAS d'expérience non mentionnée.
   - Si le CV n'indique pas d'expérience ou moins de 5 ans dans le domaine ciblé, mentionne la durée RÉELLE extraite ou indique l'absence d'expérience spécifique.
   - Ne reformule pas le CV pour justifier un niveau d'expérience supérieur.
   - NE commence JAMAIS la réponse par des formules génériques comme "Avec plus de X ans d'expérience...", "Fort de..." ou toute autre phrase toutes faites.

2. ÉVALUATION ET PROXIMITÉ MÉTIER :
   - RUPTURE MÉTIER TOTALE : Si le domaine principal du candidat (ex: Design, IT, Chef de Projet) n'a AUCUN lien technique avec le métier exigé (ex: Comptabilité, Finance, Médecine, Droit), le score doit être STRICTEMENT PLAFONNÉ À 25% MAXIMUM. Les compétences transversales (bureautique, langues, gestion d'équipe) ne doivent en aucun cas surévaluer un profil techniquement inadapté.
   - MÉTIERS CONNEXES / PROCHES : Si le profil présente une forte proximité métier (ex: Commercial / Agent Commercial / Business Developer, ou Assistant RH / Gestionnaire Paie), applique une tolérance stratégique et attribue un score plus élevé (60% à 85%), en valorisant les compétences cœurs transposables.

3. ÉVALUATION RIGOUSEUSE DES CERTIFICATIONS ET HABILITATIONS :
   - CERTIFICATIONS EXIGÉES ET OBLIGATOIRES (Deal-Breakers) : Si l'offre mentionne explicitement une ou plusieurs certifications obligatoires (ex: PMP, COBIT, AWS Certified, ACCA, ISO 9001, CISM, Permis spécifique) :
     * Si le candidat POSSÈDE la certification requise : accorde une forte valeur ajoutée.
     * Si le candidat NE POSSÈDE PAS la certification obligatoire exigée : applique une pénalité sévère. Le score ne peut pas dépasser 45%, même si le reste du CV est cohérent.
   - CERTIFICATIONS APPARENTÉES / ÉQUIVALENTES : Si le candidat possède une certification du même domaine mais d'un organisme différent (ex: Scrum Master au lieu de PMP, ou Google Project Management au lieu d'AgilePM), valorise la démarche d'apprentissage et indique-le clairement dans les points forts.

4. ÉVALUATION RIGOUREUSE DES DIPLÔMES :
   - Échelle d'équivalence officielle à appliquer : 
     * Baccalauréat / BAC
     * Licence / BAC+3
     * Master 1 / BAC+4
     * Master 2 / BAC+5 (ex: Master II)
     * Doctorat / BAC+8
   - Un niveau Master II (BAC+5) est STRICTEMENT SUPÉRIEUR à un niveau Licence (BAC+3).
   - INTERDICTION ABSOLUE de déclarer "Niveau d'études insuffisant" si le diplôme du candidat est égal ou supérieur à celui requis par l'offre.

5. RÉDACTION DE LA LETTRE DE MOTIVATION (POSTURE ET VALEUR AJOUTÉE) :
   - Rédige une lettre hautement professionnelle, fluide et persuasive.
   - ZÉRO AUTO-DISQUALIFICATION : Interdiction stricte de formuler des aveux de faiblesse ou des phrases négatives (ex: "Bien que mon profil ne corresponde pas...", "Je manque d'expérience en...", "Même si je n'ai pas...").
   - POSTURE POSITIVE : Oriente le discours sur la valeur ajoutée, les réalisations tangibles, la rigueur organisationnelle et la capacité d'assimilation rapide.
   - STRUCTURE EN 5 POINTS (Méthode Vous / Moi / Nous) :
     1) Accroche : Accroche percutante exprimant un intérêt ciblé pour le poste et l'entreprise.
     2) Vous / L'Entreprise : Compréhension claire des enjeux et défis du poste.
     3) Moi / Le Candidat : Valorisation des compétences clés, certifications et succès transférables.
     4) Nous : Synergie concrète et impact immédiat proposé à l'organisation.
     5) Appel à l'action : Demande proactive d'entretien suivie d'une formule de politesse soignée.

6. FORMAT DE RÉPONSE EXIGÉ :
   Réponds EXCLUSIVEMENT sous la forme d'un objet JSON valide, sans texte additionnel, respectant scrupuleusement cette structure :
   {
     "score": number,
     "experienceVerified": string,
     "strengths": ["point fort 1", "point fort 2"],
     "gaps": ["axe manquant 1", "axe manquant 2"],
     "summary": "Explication factuelle et personnalisée sans phrases pré-mâchées",
     "cover_letter_draft": "Texte intégral de la lettre..."
   }
   Tu peux également renvoyer "match_score" avec la même valeur que "score" pour compatibilité.

Job ID: {jobId}

Expérience détectée dans le CV : {yearsExperience} ans.

DONNÉES À ANALYSER :

--- CV DU CANDIDAT ---
{cvText}

--- OFFRE D'EMPLOI ---
Titre: {job.title ?? "Non précisé"}
Entreprise: {job.company ?? "Non précisée"}
Description: {job.description ?? "Non précisée"}
Profil recherché: {job.requirements ?? "Non précisé"}
```

### Paramètres dynamiques injectés

| Variable | Valeur | Où trouvée |
|----------|--------|-----------|
| {cvText} | Texte extrait du CV du candidat | candidates.cv_text |
| {job.title} | Titre du poste | job_offers.title |
| {job.company} | Nom de l'entreprise | job_offers.company |
| {job.description} | Description complète | job_offers.description |
| {job.requirements} | Exigences du poste | job_offers.requirements |
| {jobId} | ID de l'offre | parameter |
| {yearsExperience} | Années détectées via parseYears() | Analyse du CV |

### Règles clés du prompt

**1. Rupture métier totale → Score max 25%**
- Design/IT vers Comptabilité/Finance: score plafonné
- Pas de surévaluation par compétences transversales

**2. Métiers proches → Score 60-85%**
- Commercial / Business Developer / Sales
- Assistant RH / Gestionnaire Paie

**3. Certifications obligatoires = Deal Breaker**
- Si certification requise ET manquante: score max 45%
- Si certification requise ET présente: forte valeur ajoutée

**4. Diplômes strictement évalués**
- BAC < Licence (BAC+3) < Master (BAC+5) < Doctorat (BAC+8)
- Interdiction d'invalider un profil si diplôme ≥ requis

**5. Lettre de motivation**
- ZÉRO auto-disqualification
- POSTURE POSITIVE uniquement
- Structure Vous/Moi/Nous
- 5 paragraphes de développement

### Format de réponse Grok

```json
{
  "score": number (0-100),
  "match_score": number (alias du score),
  "experienceVerified": string ("X years verified" ou détails),
  "strengths": [
    "Force 1",
    "Force 2",
    "Force 3",
    "Force 4",
    "Force 5"
  ],
  "gaps": [
    "Écart 1",
    "Écart 2",
    "Écart 3",
    "Écart 4",
    "Écart 5"
  ],
  "improvements": [],
  "summary": "Résumé factuel sans phrases génériques",
  "cover_letter_draft": "Lettre de motivation complète (professionnelle, 5 points, posture positive)"
}
```

### Réponse attendue

La réponse Groq est un objet JSON structuré:

```typescript
export interface AiAnalysisResult {
  match_score: number;            // [0, 100]
  score?: number;                 // Alias pour match_score
  experienceVerified?: string;    // "X years verified" ou similaire
  strengths: string[];            // 5 max
  improvements: string[];         // 5 max
  gaps: string[];                 // 5 max (alternatif)
  summary?: string;               // Résumé optionnel
  cover_letter_draft: string;     // Brouillon lettre de motivation
}
```

### Gestion des erreurs Groq

**Code de réponse:**

| Code | Action |
|------|--------|
| 200 | Succès |
| 429 | Rate limit → "L'analyseur est actuellement très sollicité..." |
| 5xx | Erreur serveur → "Le service Groq rencontre des problèmes..." |

**Timeout:** 30 secondes (AbortController)

**Fallback:** Aucun fallback si Groq échoue — l'utilisateur voit l'erreur

---

## 10. CACHE DES ANALYSES

### Table Supabase: `ai_analysis_cache`

**Structure (supposée):**
```sql
CREATE TABLE ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_id UUID NOT NULL REFERENCES job_offers(id),
  match_score INT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  cover_letter_draft TEXT NOT NULL DEFAULT '',
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);
```

### Stratégie de cache

1. **À chaque requête d'analyse:**
   - Chercher cache pour (candidate_id, job_id)
   - Si trouvé et version valide → retour
   - Sinon → appel Groq + mise à jour cache

2. **Invalidation:**
   - À chaque changement de CV:
     ```typescript
     await supabase
       .from("ai_analysis_cache")
       .delete()
       .eq("candidate_id", candidateId);
     ```
   - À chaque changement majeur du prompt (PROMPT_VERSION)

3. **Pas de cache pour matching RPC:**
   - Le matching vectoriel est recalculé à chaque fois
   - Pas de mise en cache RPC dans le code

---

## 11. AFFICHAGE ET COMPOSANTS

### Composant principal: CandidateDashboardPage

**Fichier:** [src/pages/candidate/CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx)

**Points clés:**

**Ligne 28:** Import du service
```typescript
import { getRecommendedJobs, RecommendedJob } from "@/services/aiMatchingService";
```

**Ligne 125:** Déclaration du state
```typescript
const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
```

**Lignes 323-325:** Appel du service
```typescript
const jobs = await getRecommendedJobs(
  profile.id,  // candidateId
  0,           // matchThreshold
  RECOMMENDED_JOBS_PAGE_SIZE,  // 10
  (recommendedPage - 1) * RECOMMENDED_JOBS_PAGE_SIZE  // offset
);
```

**Ligne 590:** Passage du score au composant d'affichage
```typescript
matchScore={typeof offer.score === "number" ? offer.score : undefined}
```

**Ligne 556-611:** Rendu de la section
```tsx
{recommendedJobs.length > 0 ? (
  <div className="grid gap-4">
    {recommendedJobs.map((offer, index) => (
      <JobCard
        key={`${offer.id}-${index}`}
        id={offer.id}
        title={offer.title}
        company={offer.company}
        description={offer.description}
        location={offer.location_city}
        contractType={offer.contract_type}
        salary={offer.salary}
        slug={offer.slug}
        matchScore={typeof offer.score === "number" ? offer.score : undefined}  // ← Score du matching
        views={offer.views_count}
      />
    ))}
  </div>
) : (
  <div>Aucune offre disponible</div>
)}
```

### Composant d'affichage JobCard

**Utilise:** `matchScore` prop

**Affichage du score:**
- Probablement via `<ProgressBar />` avec valeur [0, 100]
- Icône couleur basée sur le score
- Texte "XX% de compatibilité"

### Page détail: JobOfferDetailPage

**Fichier:** [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)

**Utilisation du score d'analyse Grok:**

**Ligne 593:** Affichage du score
```tsx
<span className="text-2xl font-bold text-secondary">{analysis.match_score}%</span>
```

**Ligne 598:** Barre de progression
```tsx
style={{ width: `${Math.max(4, Math.min(100, analysis.match_score))}%` }}
```

**Flux d'appel:**
```
JobOfferDetailPage
  ↓ User clique "Analyser"
  ↓
analyzeCandidateForJob(candidateId, jobId)
  ↓ (via groqAnalysisService.ts)
  ↓
Affichage du score dans une barre
```

---

## 12. CAS PARTICULIERS ET FALLBACKS

### Cas 1: CV absent

**Résultat:** Dashboard n'affiche pas la section d'offres recommandées

**Code:** Ligne 360 de `CandidateDashboardPage.tsx`
```typescript
enabled: !!profile?.id && !!profile?.cv_text,
```

**Message:** "Téléversez un CV pour obtenir des recommandations."

### Cas 2: Embedding vector absent pour offre

**RPC:** Offres exclues (WHERE embedding_vector IS NOT NULL)

**Fallback:** Pas vraiment un fallback — simplement ignorées

### Cas 3: Offre expirée

**RPC:** Exclue par le filtre expires_at

### Cas 4: Scores identiques de RPC

**Déclenchement du fallback local**

```typescript
const allSame = scores.length > 0 && scores.every((s) => s === scores[0] && s !== null);

if (allSame || scores.some((s) => s === null)) {
  // Fallback
}
```

### Cas 5: Grok API indisponible

**Comportement:** Erreur levée à l'utilisateur

**Pas de fallback automatique**

### Cas 6: Pagination

**Support:** OUI, via match_offset

```typescript
const offset = (recommendedPage - 1) * RECOMMENDED_OFFERS_PER_PAGE;
await getRecommendedJobs(candidateId, 0, 10, offset);
```

### Cas 7: Match threshold

**Valeur utilisée:** 0.0 (pas de filtrage)

```typescript
matchThreshold = 0.0
```

Tous les résultats RPC sont retournés.

---

## RÉSUMÉ COMPLET

### Flux de recommandation d'offres (matching automatique)

```
1. CV UPLOAD
   → extractTextFromPdf() → updateCandidateCvText()
   → embedding_vector généré et persisté

2. DASHBOARD AFFICHAGE
   → getRecommendedJobs() appelé

3. RPC SUPABASE
   → Similarité vectorielle (cosine distance)
   → Retour offres triées par score

4. FALLBACK (SI SCORES INVALIDES)
   → computeMatchScoreFromText()
   → Calcul local textuel (100 points)

5. AFFICHAGE
   → RecommendedJob[] avec scores
   → Tri par score décroissant
```

### Flux d'analyse détaillée (IA Groq)

```
1. UTILISATEUR CLIQUE "Analyser"
   → analyzeCandidateForJob(candidateId, jobId)

2. VÉRIFICATION CACHE
   → Si valide: retour immédiat

3. PRÉPARATION DONNÉES
   → Récupérer cv_text + job details

4. APPEL GROQ
   → POST avec prompt
   → Réponse JSON

5. CACHE + RETOUR
   → Persistance cache
   → Retour au composant
```

### Deux types de scores

| Type | Calcul | Plage | Usage |
|------|--------|-------|-------|
| RPC Similarity | Cosine distance sur embeddings | [0.0, 1.0] | Tri offres recommandées |
| Fallback Local | Combinaison 5 composants | [0, 100] | Fallback si RPC scores invalides |
| Grok Analysis | IA Groq + directives | [0, 100] | Analyse détaillée optionnelle |

### Données utilisées RÉELLEMENT

**Du candidat:** `cv_text`, `embedding_vector` uniquement

**De l'offre:** `title`, `description`, `requirements`, `company`, `location_city`, `contract_type`, `embedding_vector`, `status`, `expires_at`

**Autres données:** Aucune autre donnée du candidat ou de l'offre n'affecte le matching

---

## FICHIERS CLÉS À REPRODUIRE EN REACT NATIVE

Pour une reproduction exacte en React Native:

1. **Services:**
   - `src/services/aiMatchingService.ts` → Extraction PDF, gestion offres
   - `src/services/matchScoreUtils.ts` → Calcul du score fallback
   - `src/services/groqAnalysisService.ts` → Analyse Grok (optionnel)
   - `src/services/groqAnalysisPrompt.ts` → Construction du prompt

2. **Hooks:**
   - `src/features/candidates/hooks/useCandidateProfileData.ts` → Chargement données

3. **RPC:**
   - `supabase/migrations/20260727_update_match_job_offers_for_candidate_pagination.sql` → À reproduire côté mobile via appel RPC

4. **API/Client:**
   - Appels Supabase RPC
   - Appels Groq API (si utilisé)

---

## 13. CAS PARTICULIERS ET FALLBACKS

### Cas 1: CV absent

**Résultat:** Dashboard n'affiche pas la section d'offres recommandées

**Code:** Ligne 360 de `CandidateDashboardPage.tsx`
```typescript
enabled: !!profile?.id && !!profile?.cv_text,
```

**Message:** "Téléversez un CV pour obtenir des recommandations."

### Cas 2: Embedding vector absent pour offre

**RPC:** Offres exclues (WHERE embedding_vector IS NOT NULL)

**Fallback:** Pas vraiment un fallback — simplement ignorées

### Cas 3: Offre expirée

**RPC:** Exclue par le filtre expires_at

### Cas 4: Scores identiques de RPC

**Déclenchement du fallback local**

```typescript
const allSame = scores.length > 0 && scores.every((s) => s === scores[0] && s !== null);

if (allSame || scores.some((s) => s === null)) {
  // Fallback
}
```

### Cas 5: Grok API indisponible

**Comportement:** Erreur levée à l'utilisateur

**Pas de fallback automatique**

### Cas 6: Pagination

**Support:** OUI, via match_offset

```typescript
const offset = (recommendedPage - 1) * RECOMMENDED_OFFERS_PER_PAGE;
await getRecommendedJobs(candidateId, 0, 10, offset);
```

### Cas 7: Match threshold

**Valeur utilisée:** 0.0 (pas de filtrage)

```typescript
matchThreshold = 0.0
```

Tous les résultats RPC sont retournés.

---

## 14. CODE EXEMPLE POUR REPRODUCTION REACT NATIVE

### Service TypeScript: EmbeddingService.ts

```typescript
// Reproduction exacte du système de vecteurs 768D
export const VECTOR_DIMENSIONS = 768;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function createEmbeddingVectorString(text: string): string {
  const tokens = normalizeText(text).match(/[a-z0-9]+/g) ?? [];
  const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);

  tokens.forEach((token, index) => {
    const slot = Math.abs(hashToken(token)) % VECTOR_DIMENSIONS;
    vector[slot] += 1 + (index % 7) / 10;  // Bonus positional
  });

  // Normalisation L2
  const magnitude = Math.hypot(...vector);
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = vector[i] / magnitude;
    }
  }

  return `[${vector.map(v => v.toFixed(6)).join(",")}]`;
}

export function cosineSimilarity(vec1Str: string, vec2Str: string): number {
  try {
    const v1 = JSON.parse(vec1Str) as number[];
    const v2 = JSON.parse(vec2Str) as number[];
    
    let dot = 0;
    for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
      dot += v1[i] * v2[i];
    }
    
    // pgvector distance: 1 - dot product (pour vecteurs normalisés)
    return 1 - dot;
  } catch {
    return 1;
  }
}
```

### Service: MatchScoreService.ts

```typescript
export interface MatchScoreResult {
  score: number;  // [0, 100]
  details: {
    skillsScore: number;
    experienceScore: number;
    titleScore: number;
    educationScore: number;
    semanticScore: number;
    overlap: number;
    cvYears: number;
    reqYears: number;
    hardSkillsOverlap: number;
    dealBreakerApplied: boolean;
  };
}

function extractTokens(text: string): Set<string> {
  return new Set((text.match(/[a-z0-9]+/g) ?? []).filter(Boolean));
}

function parseYears(text: string): number {
  const m = text.match(/(\d{1,2})\s*(?:ans|years)/i);
  if (m) return Number(m[1]);
  const y = text.match(/(19|20)\d{2}/g);
  if (y?.length >= 2) {
    return Math.max(0, Math.abs(Number(y[y.length-1]) - Number(y[0])));
  }
  return 0;
}

export function computeMatchScoreFromText(
  cvText: string,
  job: { title?: string; description?: string; requirements?: string }
): MatchScoreResult {
  const normalizeText = (v: string) => v.replace(/\s+/g, " ").trim().toLowerCase();
  
  const cv = normalizeText(cvText || "");
  const title = normalizeText(job.title || "");
  const description = normalizeText(job.description || "");
  const requirements = normalizeText(job.requirements || "");
  
  const cvTokens = extractTokens(cv);
  const reqTokens = extractTokens(`${title} ${description} ${requirements}`);
  
  // Skills Score [0, 40]
  let overlap = 0;
  for (const token of reqTokens) {
    if (cvTokens.has(token)) overlap++;
  }
  const skillsScore = reqTokens.size > 0
    ? Math.min(40, Math.round((overlap / reqTokens.size) * 40))
    : 0;
  
  // Experience Score [0, 25]
  const cvYears = parseYears(cvText);
  const reqYears = parseYears(`${title} ${description} ${requirements}`);
  let experienceScore = 0;
  if (reqYears > 0) {
    experienceScore = Math.max(
      0,
      Math.min(25, Math.round((Math.min(cvYears, reqYears) / reqYears) * 25))
    );
  } else {
    experienceScore = cvYears > 0
      ? Math.min(15, Math.round((cvYears / 10) * 15))
      : 0;
  }
  
  // Title Score [0, 10]
  const titleTokens = extractTokens(title);
  let titleOverlap = 0;
  for (const token of titleTokens) {
    if (cvTokens.has(token)) titleOverlap++;
  }
  const titleScore = titleTokens.size > 0
    ? Math.min(10, Math.round((titleOverlap / titleTokens.size) * 10))
    : 0;
  
  // Education Score [0, 10]
  const educKeywords = ["diplome", "master", "licence", "bachelor", "pmp", "aws", "certif"];
  const educMatch = educKeywords.filter(kw => cv.includes(kw)).length;
  const educationScore = Math.min(10, Math.round((educMatch / 7) * 10));
  
  // Semantic Score [0, 15]
  let semanticScore = 0;
  try {
    const v1 = JSON.parse(createEmbeddingVectorString(cvText)) as number[];
    const v2 = JSON.parse(createEmbeddingVectorString(`${title} ${description} ${requirements}`)) as number[];
    let dot = 0;
    for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
      dot += v1[i] * v2[i];
    }
    semanticScore = Math.round(((dot + 1) / 2) * 15);
  } catch {}
  
  // Hard Skills & Deal Breaker
  const techKeywords = [
    "comptabil", "comptable", "finance", "fiscal", "audit",
    "gestion de paie", "paie", "facturation", "reporting",
    "clôture", "budget", "droit", "santé", "médical",
    "juridique", "marketing", "design", "chef de projet", "projet"
  ];
  const hardSkillsOverlap = techKeywords.filter(kw => cv.includes(kw)).length;
  const dealBreakerApplied = techKeywords.some(kw => 
    `${title} ${description} ${requirements}`.includes(kw)
  ) && hardSkillsOverlap === 0;
  
  // Final Score
  const raw = skillsScore + experienceScore + titleScore + educationScore + semanticScore;
  const score = dealBreakerApplied ? 25 : Math.max(0, Math.min(100, Math.round(raw)));
  
  return {
    score,
    details: {
      skillsScore,
      experienceScore,
      titleScore,
      educationScore,
      semanticScore,
      overlap,
      cvYears,
      reqYears,
      hardSkillsOverlap,
      dealBreakerApplied,
    },
  };
}
```

### Hook React: useRecommendedJobs.ts

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location_city: string;
  contract_type: string;
  score: number;  // RPC similarity [0.0, 1.0]
  // ... autres champs
}

export function useRecommendedJobs(
  candidateId: string | null,
  threshold: number = 0.0,
  count: number = 10,
  offset: number = 0
) {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setJobs([]);
      return;
    }

    async function fetchJobs() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc(
          'match_job_offers_for_candidate',
          {
            candidate_id: candidateId,
            match_threshold: threshold,
            match_count: count,
            match_offset: offset,
          }
        );

        if (rpcError) throw rpcError;

        setJobs((data || []) as RecommendedJob[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [candidateId, threshold, count, offset]);

  return { jobs, loading, error };
}
```

### Composant React Native: RecommendedJobsList.tsx

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button } from 'react-native';
import { useRecommendedJobs } from './hooks/useRecommendedJobs';
import { JobCard } from './JobCard';

interface Props {
  candidateId: string;
}

export function RecommendedJobsList({ candidateId }: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { jobs, loading, error } = useRecommendedJobs(
    candidateId,
    0.0,  // threshold
    PAGE_SIZE,
    (page - 1) * PAGE_SIZE
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={{ color: 'red' }}>Erreur: {error}</Text>;
  }

  if (!jobs || jobs.length === 0) {
    return <Text>Aucune offre recommandée</Text>;
  }

  return (
    <ScrollView>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          matchScore={job.score}  // Score RPC [0.0, 1.0]
        />
      ))}

      {jobs.length === PAGE_SIZE && (
        <Button
          title="Charger plus"
          onPress={() => setPage(page + 1)}
        />
      )}
    </ScrollView>
  );
}
```

---

**Fin de l'audit**

*Analysé le: 2026-08-15*  
*Basis: Code source complet du projet EmploiPlus Group*  
*Prêt pour implémentation React Native*
*Prêt pour implémentation React Native*
