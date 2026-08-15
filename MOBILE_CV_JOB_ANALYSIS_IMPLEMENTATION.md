# CV ↔ JOB ANALYSIS — TECHNICAL AUDIT (CONDENSED)

**Web Feature:** Analyze candidate CV vs. job offer 
## CORE FILES
**UI:** `src/pages/public/JobOfferDetailPage.tsx` (lines 264-278 handler, 570 button, 593-639 display)  
**Service:** `src/services/groqAnalysisService.ts` (analyzeCandidateForJob, fetchCache, sanitize, parseJson)  
**Prompt:** `src/services/groqAnalysisPrompt.ts` (buildGroqAnalysisPrompt with 6 HR rules)  
**Cache:** `ai_analysis_cache` table + `prompt_version` tracking  
**Dependencies:** Groq API, Supabase, pdfjs-dist
## QUICK FLOW
User authenticated → Click "Lancer l'analyse" → Check cache (ai_analysis_cache) → Fetch cv_text + 4 job fields → Call Groq llama-3.1-8b-instant → Parse JSON → Sanitize (score [0-100], arrays ≤5) → Persist cache with prompt_version → Display score + strengths + gaps + cover_letter → Allow copy

## DATA SOURCES
**Candidate:** `candidates.cv_text` only (UUID identifier, must exist, fallback to localStorage)  
**Job:** 4 fields from `job_offers`: title, company, description, requirements  
**All other fields:** NOT used
--
## GROQ CONFIG
**Endpoint:** https://api.groq.com/openai/v1/chat/completions | **Model:** llama-3.1-8b-instant  
**Temperature:** 0.2 (consistent) | **Response:** json_object | **Timeout:** 30 seconds  
**Errors:** 429 (rate limit) → "Veuillez réessayer" | 500+ → "Problèmes du service" | Other → show status
## PROMPT (EXACT)
### Location
`src/services/groqAnalysisPrompt.ts`
### Function
```typescript
export function buildGroqAnalysisPrompt(
  candidateCvText: string,
  job: GroqJobContext,
  jobId: string,
  detectedExperienceYears: number,
): string
```
### Complete Prompt Text
Tu es un Directeur des Ressources Humaines et Expert Senior en Recrutement fort de 15 ans d'expérience. Ta mission est d'évaluer avec une précision chirurgicale, impartialité et pragmatisme la compatibilité entre un CV et une offre d'emploi.

RÈGLES D'ANALYSE RH STRICTES (À APPLIQUER SANS DÉVIATION):
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
Expérience détectée dans le CV : {detectedExperienceYears} ans.
DONNÉES À ANALYSER :
--- CV DU CANDIDAT ---
{candidateCvText}
--- OFFRE D'EMPLOI ---
Titre: {job.title ?? "Non précisé"}
Entreprise: {job.company ?? "Non précisée"}
Description: {job.description ?? "Non précisée"}
Profil recherché: {job.requirements ?? "Non précisé"}
```
### Variable Injection
| Placeholder | Value | Source |
|-------------|-------|--------|
| `{jobId}` | UUID of job offer | Function parameter |
| `{detectedExperienceYears}` | Integer (years) | Parsed from CV using parseYears() |
| `{candidateCvText}` | Full CV text | Supabase: candidates.cv_text |
| `{job.title}` | Job title | Supabase: job_offers.title |
| `{job.company}` | Company name | Supabase: job_offers.company |
| `{job.description}` | Description | Supabase: job_offers.description |
| `{job.requirements}` | Profile requirements | Supabase: job_offers.requirements |

### Critical Rules Implemented in Prompt
1. **Exact CV analysis** — No assumptions beyond what's written
2. **Career break detection** — 25% max score if no technical connection
3. **Related careers** — 60-85% score if career proximity exists
4. **Mandatory certifications** — Max 45% if required cert missing
5. **Degree evaluation** — Strict equivalence scale (BAC < Licence < Master < Doctorat)
6. **Cover letter rules** — ZERO self-disqualification, positive posture only
7. **Response format** — MUST be JSON, no markdown, no explanations outside JSON
## 11. GROQ API CONFIGURATION
### API Provider
Groq (groq.com)
### Endpoint
```
https://api.groq.com/openai/v1/chat/completions
```
### Model
```
llama-3.1-8b-instant
```
### HTTP Method
```
POST
```
### Headers
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {apiKey}"
}
```
### Request Body
**Location:** `src/services/groqAnalysisService.ts` lines 346-358
```typescript
{
  "model": "llama-3.1-8b-instant",
  "temperature": 0.2,
  "messages": [
    {
      "role": "user",
      "content": prompt  // The full prompt from buildGroqAnalysisPrompt()
    }
  ],
  "response_format": { "type": "json_object" }
}
```
### Parameters
| Parameter | Value | Purpose |
|-----------|-------|---------|
| model | llama-3.1-8b-instant | Groq's fast model |
| temperature | 0.2 | Low randomness (consistent outputs) |
| response_format | { type: "json_object" } | Forces JSON response |
| messages | Array with user role | Chat format |
### Timeout
30 seconds (hardcoded, line 341)
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
```
### Error Handling

| HTTP Status | Action | Message |
|-------------|--------|---------|
| 200-299 | Success | Continue |
| 429 | Rate limited | "L'analyseur est actuellement très sollicité. Veuillez réessayer dans quelques secondes." |
| 500-599 | Server error | "Le service Groq rencontre des problèmes. Veuillez réessayer ultérieurement." |
| Other | Generic error | "Le service Groq a retourné une erreur {statusCode}. Veuillez réessayer." |
**Lines 360-382 of groqAnalysisService.ts**
## 12. API KEY SECURITY
### Storage Location
**CURRENTLY: CLIENT-SIDE EXPOSURE (Security Risk)**
**Function:** `getGroqApiKey()` at line 34
```typescript
function getGroqApiKey(): string | undefined {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.GROQ_API_KEY) ||
    (typeof process !== "undefined" ? process.env.GROQ_API_KEY : undefined)
  );
}
```
### Environment Variables Checked (In Order)
1. `VITE_GROQ_API_KEY` — Vite public env var (exposed to client)
2. `GROQ_API_KEY` — Fallback
3. `process.env.GROQ_API_KEY` — Node.js env var
### Risk Assessment
**CONFIRMED:** The API key is exposed on the client-side in the current implementation.
This is a security risk because:
- Key is visible in browser memory
- Key is visible in network requests
- Malicious users can extract the key
- Quota theft is possible
**MOBILE RECOMMENDATION:**
Move API calls to a backend/Edge Function to hide the key.

**Current Status in Web App:**
NOT CHANGED. This analysis only documents the existing implementation.
---
## 13. RESPONSE FORMAT
### Interface: `AiAnalysisResult`
**Location:** `src/services/groqAnalysisService.ts` lines 13-2
```typescript
export interface AiAnalysisResult {
  match_score: number;          // 0-100 (Integer)
  score?: number;               // Alias for match_score (optional)
  experienceVerified?: string;  // e.g., "3 years verified"
  strengths: string[];          // Array of strings (up to 5)
  improvements: string[];       // Array of strings (up to 5)
  gaps: string[];               // Array of strings (up to 5)
  summary?: string;             // Optional summary text
  cover_letter_draft: string;   // Full text (can be multiline)
}
```

### Field Descriptions

| Field | Type | Required | Range | Notes |
|-------|------|----------|-------|-------|
| match_score | number | ✅ YES | [0, 100] | Integer percentage |
| score | number | ❌ OPT | [0, 100] | Alias, both may appear |
| experienceVerified | string | ❌ OPT | Any | e.g., "5 years verified" |
| strengths | string[] | ✅ YES | 0-5 items | Filtered to 5 max |
| improvements | string[] | ✅ YES | 0-5 items | Filtered to 5 max |
| gaps | string[] | ✅ YES | 0-5 items | Filtered to 5 max |
| summary | string | ❌ OPT | Any | Factual explanation |
| cover_letter_draft | string | ✅ YES | Any | Full letter text |

### Example Response from Groq

```json
{
  "score": 72,
  "match_score": 72,
  "experienceVerified": "8 years of experience verified in marketing and project management",
  "strengths": [
    "Strong project management background with 8+ years of proven experience",
    "Excellent communication and team leadership demonstrated in multiple roles",
    "Relevant marketing expertise aligned with campaign management responsibilities",
    "Ability to quickly learn new systems and adapt to organizational culture",
    "Self-motivated professional with a track record of delivering results"
  ],
  "gaps": [
    "Limited direct experience with market research methodologies",
    "No explicit mention of B2B marketing strategy background",
    "Could benefit from enhanced data analytics skills",
    "Limited experience with specific CRM platforms mentioned in job description",
    "Opportunity to develop deeper knowledge of enterprise software solutions"
  ],
  "improvements": [],
  "summary": "Your profile demonstrates solid marketing fundamentals and project management experience. While not a perfect match for all technical requirements, your adaptability and leadership background position you well for this campaign management role.",
  "cover_letter_draft": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Campaign Manager position at your organization..."
}
```

---

## 14. RESPONSE PARSING & SANITIZATION

### Step 1: Extract JSON from Raw Response

**Function:** `extractAndCleanJson(rawContent)` at line 45

```typescript
function extractAndCleanJson(rawContent: string): Record<string, unknown> {
  // 1. Normalize invisible characters
  let cleaned = rawContent
    .replace(/\u200b/g, "")        // zero-width space
    .replace(/\u200c/g, "")        // zero-width non-joiner
    .replace(/\u200d/g, "")        // zero-width joiner
    .replace(/\u202c/g, "")        // pop directional formatting
    .trim();

  // 2. Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // 3. Extract first valid JSON object { ... }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/m);
  if (!jsonMatch) {
    throw new Error("Aucun bloc JSON valide trouvé dans la réponse.");
  }

  // 4. Parse and return
  const jsonString = jsonMatch[0].trim();
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch (parseError) {
    throw new Error("La réponse IA n'était pas au format JSON valide après nettoyage.");
  }
}
```

### Step 2: Sanitize Payload

**Function:** `sanitizeAnalysisPayload(payload)` at line 96

```typescript
function sanitizeAnalysisPayload(payload: unknown): AiAnalysisResult {
  const candidate = payload as Partial<AiAnalysisResult> & Record<string, unknown>;
  
  // Normalize score (try multiple field names)
  const rawScore =
    (candidate as any).score ??
    (candidate as any).match_score ??
    (candidate as any).matchScore ??
    (candidate as any).score ??
    0;
  const score = Number(rawScore);
  const normalizedScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  // Validate strengths (filter non-strings, trim, remove empty)
  const strengths = Array.isArray(candidate.strengths)
    ? candidate.strengths
        .filter((item) => item != null && typeof item === "string")
        .map((s) => String(s).trim())
        .filter(Boolean)
    : [];

  // Validate improvements / gaps
  const rawImprovements = Array.isArray(candidate.improvements)
    ? candidate.improvements
        .filter((item) => item != null && typeof item === "string")
        .map((i) => String(i).trim())
        .filter(Boolean)
    : [];
  const rawGaps = Array.isArray(candidate.gaps)
    ? candidate.gaps
        .filter((item) => item != null && typeof item === "string")
        .map((g) => String(g).trim())
        .filter(Boolean)
    : [];

  // Use improvements if gaps is empty, or vice versa
  const improvements = rawImprovements.length > 0 ? rawImprovements : rawGaps;
  const gaps = rawGaps.length > 0 ? rawGaps : rawImprovements;

  // Normalize text fields
  const experienceVerified = typeof candidate.experienceVerified === "string"
    ? candidate.experienceVerified.trim()
    : "";
  const summary = typeof candidate.summary === "string"
    ? candidate.summary.trim()
    : "";

  // Normalize cover letter (try multiple field names)
  let coverLetterDraft = "";
  if (typeof candidate.cover_letter_draft === "string") {
    coverLetterDraft = candidate.cover_letter_draft.trim();
  } else if (typeof candidate.cover_letter === "string") {
    coverLetterDraft = candidate.cover_letter.trim();
  }

  return {
    match_score: normalizedScore,
    score: normalizedScore,
    experienceVerified,
    strengths: strengths.slice(0, 5),        // Max 5
    improvements: improvements.slice(0, 5),  // Max 5
    gaps: gaps.slice(0, 5),                  // Max 5
    summary,
    cover_letter_draft: coverLetterDraft,
  };
}
```

### Validation Rules

| Field | Validation | Action |
|-------|-----------|--------|
| score | Not finite | Default to 0 |
| score | < 0 | Clamp to 0 |
| score | > 100 | Clamp to 100 |
| score | Not integer | Round |
| strengths[] | Non-string items | Filter out |
| strengths[] | Empty strings | Filter out |
| strengths[] | > 5 items | Keep first 5 |
| gaps[] | Non-string items | Filter out |
| gaps[] | Empty strings | Filter out |
| gaps[] | > 5 items | Keep first 5 |
| cover_letter_draft | Not string | Default to "" |
| experienceVerified | Not string | Default to "" |

### Error Handling

If response is invalid:
- `extractAndCleanJson()` throws error
- Error propagates up
- User sees: "Une erreur est survenue pendant l'analyse."

---

## 15. SCORE CALCULATION

### Score Source

The score shown to the user comes **DIRECTLY from Groq AI**, NOT from local calculation.

### Score Range

Integer from 0 to 100 (percentage)

### Score Clamping

After sanitization, score is guaranteed to be in [0, 100]:

```typescript
const normalizedScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
```

### UI Rendering

**File:** `src/pages/public/JobOfferDetailPage.tsx` line 593

```tsx
<span className="text-2xl font-bold text-secondary">{analysis.match_score}%</span>
```

Progress bar width (line 598):

```tsx
style={{ width: `${Math.max(4, Math.min(100, analysis.match_score))}%` }}
```

Uses `Math.max(4, ...)` to ensure minimum visible width of 4%.

### Score Interpretation (Groq Rules)

From the prompt:

- **0-25%:** Total career break (no technical connection)
- **25-45%:** Missing mandatory certifications
- **45-60%:** Some skills but significant gaps
- **60-85%:** Related career with good transposable skills
- **85-100%:** Excellent match

---

## 16. CACHE SYSTEM

### Cache Check

**Function:** `fetchCachedAnalysis(candidateId, jobId)` at line 157

```typescript
async function fetchCachedAnalysis(candidateId: string, jobId: string): Promise<AiAnalysisResult | null> {
  try {
    const { data, error } = await supabase
      .from("ai_analysis_cache")
      .select("match_score, strengths, improvements, cover_letter_draft, prompt_version")
      .eq("candidate_id", candidateId)
      .eq("job_id", jobId)
      .maybeSingle<AiAnalysisCacheRow>();

    if (error) {
      console.warn("Unable to read AI analysis cache", error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    // Validate prompt version matches
    const cachedVersion = data.prompt_version ?? "v1.0";
    if (cachedVersion !== PROMPT_VERSION) {
      console.debug(`[Cache Invalidation] Prompt version mismatch: cached=${cachedVersion}, current=${PROMPT_VERSION}.`);
      return null;
    }

    return {
      match_score: data.match_score,
      strengths: data.strengths ?? [],
      improvements: data.improvements ?? [],
      gaps: [],
      cover_letter_draft: data.cover_letter_draft ?? "",
    };
  } catch (error) {
    console.warn("[Cache] Unexpected error fetching cached analysis:", error);
    return null;
  }
}
```

### Cache Persistence

**Function:** `persistAnalysis(candidateId, jobId, payload)` at line 209

```typescript
async function persistAnalysis(candidateId: string, jobId: string, payload: AiAnalysisResult): Promise<void> {
  try {
    const { error } = await supabase.from("ai_analysis_cache").upsert(
      {
        candidate_id: candidateId,
        job_id: jobId,
        match_score: payload.match_score,
        strengths: payload.strengths,
        improvements: payload.improvements,
        cover_letter_draft: payload.cover_letter_draft,
        prompt_version: PROMPT_VERSION,
      },
      { onConflict: "candidate_id,job_id" },
    );

    if (error) {
      throw new Error(`[Cache] Failed to persist analysis: ${error.message}`);
    }
  } catch (error) {
    console.warn("[Cache] Failed to persist analysis (non-critical):", error);
    // Continue without interruption - user has their analysis
  }
}
```

### Prompt Version

**Constant:** `PROMPT_VERSION = "v2.2_2026-07-27"` at line 10

### Cache Invalidation

Cache is automatically invalidated when:

1. **Prompt version changes** — If `PROMPT_VERSION` incremented
   - Cached entries with different version are rejected
   - New analysis is triggered
   - New version is stored

2. **CV is re-uploaded** — When `processCandidateCvUpload()` is called
   - Deletes all cache entries for that candidate
   - Forces re-analysis on next request

   **File:** `src/services/aiMatchingService.ts` lines 205-215

   ```typescript
   try {
     const { data: deleted, error: delError } = await supabase
       .from("ai_analysis_cache")
       .delete()
       .eq("candidate_id", candidateId);
   ```

### Cache Expiration

NO automatic time-based expiration implemented in the code.

Cache entries persist indefinitely unless:
- User re-uploads CV
- Prompt version changes
- Manual deletion from database

---

## 17. SUPABASE INTEGRATION

### Queries Used

#### Query 1: Fetch Candidate CV

```typescript
supabase
  .from("candidates")
  .select("cv_text")
  .eq("id", candidateId)
  .maybeSingle<{ cv_text?: string | null }>()
```

**Returns:** `{ cv_text: string | null }`

#### Query 2: Fetch Job Details

```typescript
supabase
  .from("job_offers")
  .select("title, company, description, requirements")
  .eq("id", jobId)
  .maybeSingle<{
    title?: string | null;
    company?: string | null;
    description?: string | null;
    requirements?: string | null;
  }>()
```

**Returns:** Job object with 4 fields

#### Query 3: Fetch Cached Analysis

```typescript
supabase
  .from("ai_analysis_cache")
  .select("match_score, strengths, improvements, cover_letter_draft, prompt_version")
  .eq("candidate_id", candidateId)
  .eq("job_id", jobId)
  .maybeSingle<AiAnalysisCacheRow>()
```

**Returns:** Cached analysis or null

#### Query 4: Upsert Analysis Cache

```typescript
supabase
  .from("ai_analysis_cache")
  .upsert(
    {
      candidate_id: candidateId,
      job_id: jobId,
      match_score: payload.match_score,
      strengths: payload.strengths,
      improvements: payload.improvements,
      cover_letter_draft: payload.cover_letter_draft,
      prompt_version: PROMPT_VERSION,
    },
    { onConflict: "candidate_id,job_id" }
  )
```

**Behavior:** Insert if new, update if exists (on unique conflict)

### RLS (Row-Level Security)

**Applied to:** `ai_analysis_cache` table

**Policies:**

1. **SELECT Policy** (lines 28-36 of migration)
   ```sql
   CREATE POLICY ai_analysis_cache_select_own
     ON public.ai_analysis_cache
     FOR SELECT
     USING (
       candidate_id IN (
         SELECT id FROM public.candidates WHERE user_id = auth.uid()
       )
     );
   ```
   Users can only read their own cached analyses.

2. **INSERT Policy** (lines 38-47 of migration)
   ```sql
   CREATE POLICY ai_analysis_cache_insert_own
     ON public.ai_analysis_cache
     FOR INSERT
     WITH CHECK (
       candidate_id IN (
         SELECT id FROM public.candidates WHERE user_id = auth.uid()
       )
     );
   ```
   Users can only insert cache entries for their own candidates.

---

## 18. UI DISPLAY ELEMENTS

### Page Layout

**File:** `src/pages/public/JobOfferDetailPage.tsx` lines 567-700

### Components

#### Button: Launch Analysis

**Lines 570-571:**

```tsx
<Button
  type="button"
  onClick={handleAnalyzeClick}
  disabled={analysisLoading || !profile?.id}
  className="mt-5 w-full rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
>
  {analysisLoading ? "Analyse en cours…" : "Lancer l'analyse de ma compatibilité"}
</Button>
```

#### Loading State

**Lines 573-578:**

```tsx
{analysisLoading ? (
  <div className="mt-5 space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-24 w-full rounded-2xl" />
    <Skeleton className="h-24 w-full rounded-2xl" />
  </div>
) : null}
```

#### Error Display

**Lines 580-584:**

```tsx
{analysisError ? (
  <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
    {analysisError}
  </div>
) : null}
```

#### Score Card

**Lines 589-603:**

```tsx
<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold text-foreground">Score de compatibilité</span>
    <span className="text-2xl font-bold text-secondary">{analysis.match_score}%</span>
  </div>
  <div className="mt-3 h-2 rounded-full bg-border">
    <div
      className="h-2 rounded-full bg-gradient-to-r from-secondary/70 to-secondary"
      style={{ width: `${Math.max(4, Math.min(100, analysis.match_score))}%` }}
    />
  </div>
  {analysis.experienceVerified ? (
    <p className="mt-3 text-sm text-muted-foreground">{analysis.experienceVerified}</p>
  ) : null}
</div>
```

#### Strengths Card

**Lines 605-617:**

```tsx
<div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
  <h4 className="text-sm font-semibold text-emerald-700">Points forts</h4>
  <ul className="mt-3 space-y-2 text-sm text-emerald-800">
    {analysis.strengths.map((item) => (
      <li key={item} className="flex gap-2">
        <span className="mt-2 size-2 rounded-full bg-emerald-500" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
</div>
```

#### Gaps Card

**Lines 618-630:**

```tsx
<div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
  <h4 className="text-sm font-semibold text-orange-700">Axes d'amélioration</h4>
  <ul className="mt-3 space-y-2 text-sm text-orange-800">
    {analysis.gaps.map((item) => (
      <li key={item} className="flex gap-2">
        <span className="mt-2 size-2 rounded-full bg-orange-500" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
</div>
```

#### Cover Letter Card

**Lines 632-643:**

```tsx
<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
  <div className="flex items-center justify-between gap-3">
    <h4 className="text-sm font-semibold text-foreground">Brouillon de lettre de motivation</h4>
    <Button type="button" variant="outline" size="sm" onClick={handleCopyLetter}>
      {copiedLetter ? "Copié !" : "Copier la lettre"}
    </Button>
  </div>
  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
    {analysis.cover_letter_draft}
  </p>
</div>
```

### Color Scheme

- **Score bar:** Gradient from secondary/70 to secondary
- **Strengths:** Green (emerald-50/70 background, emerald-700 text)
- **Gaps:** Orange (orange-50/70 background, orange-700 text)
- **Button:** Brand color

---

## 19. APPLICATION STATES

### State 1: Not Authenticated

**Condition:** `!profile?.id`

**Display:**
```tsx
<div className="rounded-[28px] border border-border/70 bg-background/60 p-7 shadow-soft text-center text-muted-foreground">
  <h3>Évaluation IA de votre candidature</h3>
  <p>Connectez-vous pour utiliser cette fonctionnalité gratuitement</p>
  <Link to="/candidate/login">Se connecter</Link>
  <Link to="/candidate/signup">Créer un compte</Link>
</div>
```

### State 2: Authenticated, No Analysis Yet

**Condition:** `profile?.id && !analysis && !analysisLoading`

**Display:**
- Analysis button (enabled)
- No error message
- No loading skeleton
- No analysis results

### State 3: Loading

**Condition:** `analysisLoading === true`

**Display:**
- Button shows: "Analyse en cours…"
- Button is disabled
- Loading skeleton (3 lines with varying widths)
- No error message
- No results visible

### State 4: Error

**Condition:** `analysisError !== null`

**Display:**
- Orange error box with error message
- Button still visible (to retry)
- No results visible

**Possible Error Messages:**
- "Vous devez être connecté pour lancer l'analyse IA." (no auth)
- "Le candidat n'a pas encore de CV analysable pour cette offre." (no CV)
- "L'offre sélectionnée est introuvable." (no job)
- "La clé Groq n'est pas configurée." (config issue)
- "L'analyseur est actuellement très sollicité. Veuillez réessayer dans quelques secondes." (HTTP 429)
- "Le service Groq rencontre des problèmes. Veuillez réessayer ultérieurement." (HTTP 5xx)
- "Une erreur est survenue pendant l'analyse." (generic catch)

### State 5: Success (Analysis Displayed)

**Condition:** `analysis !== null && !analysisLoading && !analysisError`

**Display:**
- Score card with progress bar
- Experience verified text (if present)
- Strengths list (up to 5 items)
- Gaps list (up to 5 items)
- Cover letter (with copy button)
- All elements visible and interactive

### State 6: Copy Success

**Condition:** `copiedLetter === true` (after user clicks "Copier")

**Display:**
- Button text changes to: "Copié !"
- Auto-reverts to "Copier la lettre" after 1.8 seconds (line 282)

---

## 20. DEPENDENCIES & PACKAGES

### Runtime Dependencies

| Package | Usage | Where |
|---------|-------|-------|
| @supabase/supabase-js | Supabase queries | groqAnalysisService.ts |
| react | UI framework | JobOfferDetailPage.tsx |
| react-router-dom | Navigation | JobOfferDetailPage.tsx (Link, useParams, useNavigate) |
| lucide-react | Icons (Sparkles, etc.) | JobOfferDetailPage.tsx |

### Built-in APIs

| API | Usage | Browser Support |
|-----|-------|-----------------|
| fetch | HTTP requests | All modern browsers |
| AbortController | Request timeout | All modern browsers |
| navigator.clipboard | Copy to clipboard | All modern browsers |
| localStorage | CV fallback lookup | Web only (not mobile-friendly) |

### Groq API

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Key:** Retrieved from environment (VITE_GROQ_API_KEY or GROQ_API_KEY)
- **No SDK:** Uses native fetch

---

## 21. MOBILE IMPLEMENTATION CONTRACT

### A. TO REPRODUCE EXACTLY (IDENTICAL)

#### Business Logic

- [x] `analyzeCandidateForJob(candidateId, jobId)` function signature and behavior
- [x] Cache check before calling Groq
- [x] Parallel data fetch: candidates + job_offers
- [x] Error handling for missing CV or job
- [x] Groq API call with exact parameters
- [x] Response parsing and JSON extraction
- [x] Sanitization rules (score clamping, array length limits)
- [x] Cache persistence with prompt_version
- [x] Version mismatch invalidation

#### Data & Queries

- [x] Supabase SELECT on candidates (cv_text only)
- [x] Supabase SELECT on job_offers (title, company, description, requirements only)
- [x] Supabase query ai_analysis_cache
- [x] Supabase UPSERT ai_analysis_cache with prompt_version

#### Groq API

- [x] Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- [x] Model: `llama-3.1-8b-instant`
- [x] Temperature: 0.2
- [x] Response format: json_object
- [x] Timeout: 30 seconds
- [x] Error handling for 429, 5xx

#### Prompt

- [x] Exact prompt text (see section 10)
- [x] All 6 rules
- [x] Variable injection (CV, job details, years)
- [x] JSON response format requirement

#### Response Handling

- [x] Extract JSON from markdown code blocks
- [x] Remove invisible Unicode characters
- [x] Sanitize score to [0, 100]
- [x] Limit arrays to 5 items
- [x] Default empty strings if missing fields
- [x] Try "gaps" if "improvements" empty, or vice versa

#### Cache

- [x] Table: ai_analysis_cache
- [x] Unique key: (candidate_id, job_id)
- [x] Columns: match_score, strengths, improvements, cover_letter_draft, prompt_version
- [x] PROMPT_VERSION = "v2.2_2026-07-27"
- [x] Version mismatch → reject cache
- [x] Cache created_at is auto-generated

---

### B. TO ADAPT FOR MOBILE

#### Navigation & Storage

- [ ] Replace React Router navigation with React Navigation
- [ ] Replace localStorage fallback with Async Storage or MMKV
- [ ] Handle PDF loading differently (use react-native-documents or similar)

#### UI Components

- [ ] Replace HTML/React DOM with React Native components:
  - [ ] `<div>` → `<View>`
  - [ ] `<Button>` → `<TouchableOpacity>` or custom Button
  - [ ] `<ul>/<li>` → `<FlatList>`
  - [ ] CSS styles → StyleSheet
  - [ ] Skeleton loaders → Different implementation
  - [ ] Tailwind classes → React Native styles

#### Error Display

- [ ] Toast or Alert instead of inline error box
- [ ] Different copy-to-clipboard implementation (react-native-clipboard)

#### Network

- [ ] Handle network unavailability gracefully
- [ ] Implement retry logic
- [ ] Cache strategy for offline

#### Fonts & Typography

- [ ] Adjust font sizes for mobile screens
- [ ] Responsive layout for phone screens

#### Copy Button

- [ ] Use `react-native-share` or `react-native-clipboard-tool` instead of clipboard API

---

### C. DO NOT REPRODUCE

#### Web-Specific

- [x] React Router routes (`/jobs/{slug}`)
- [x] CSS Tailwind classes
- [x] HTML semantic elements
- [x] `localStorage` (use async storage instead)
- [x] Browser localStorage key structure (`emploiplus-candidate-documents-{id}`)
- [x] React DOM components (Link, etc.)
- [x] Lucide React icons (use different icon library)
- [x] Next.js/Vite specific features
- [x] `import.meta.env` (use different env approach)

#### Job Recommendation Feature

- [x] Do NOT try to reproduce the job matching/recommendation system
- [x] That's a different feature already in the app
- [x] This is ONLY for CV vs job analysis

---

## 22. RECOMMENDED ARCHITECTURE

### Suggested File Structure for Mobile

```
src/
  services/
    cv-job-analysis/
      cvJobAnalysisService.ts          (Main orchestration)
      cvJobAnalysisPrompt.ts           (Prompt building)
      cvJobAnalysisTypes.ts            (TypeScript interfaces)
      cvJobAnalysisSanitizer.ts        (Response parsing)
      cvJobAnalysisCache.ts            (Cache logic)
  
  hooks/
    useCvJobAnalysis.ts                (React hook for analysis)
    useCvJobAnalysisCache.ts           (Cache management)
  
  components/
    CvJobAnalysisCard.tsx              (Main analysis display)
    CvJobAnalysisScore.tsx             (Score card)
    CvJobAnalysisStrengths.tsx         (Strengths list)
    CvJobAnalysisGaps.tsx              (Gaps list)
    CvJobAnalysisCoverLetter.tsx       (Cover letter display)
    CvJobAnalysisLoading.tsx           (Loading skeleton)
    CvJobAnalysisError.tsx             (Error display)
  
  screens/
    JobOfferDetailScreen.tsx           (Main screen - equivalent to web page)
  
  types/
    groq.ts                            (Groq-related types)
    candidate.ts                       (Candidate types)
    jobOffer.ts                        (Job offer types)
    analysis.ts                        (Analysis result types)
  
  constants/
    promptSettings.ts                  (PROMPT_VERSION, API settings)
    groqConfig.ts                      (Groq endpoint, model, etc.)
  
  utils/
    parseYears.ts                      (Extract years from text)
    normalizeText.ts                   (Text normalization)
```

### Key Design Patterns

1. **Separation of Concerns**
   - Service layer: Business logic
   - Hook layer: State management & data fetching
   - Component layer: UI rendering

2. **Type Safety**
   - Define all interfaces matching web version
   - Use strict TypeScript

3. **Error Handling**
   - Custom error classes for different error types
   - Graceful fallbacks
   - User-friendly messages

4. **Cache Management**
   - Abstract cache layer
   - Support invalidation by prompt version
   - Support invalidation by CV update

5. **Testing**
   - Mock Supabase for unit tests
   - Mock Groq API for integration tests
   - Test sanitization logic thoroughly

---

## 23. DATA INPUT/OUTPUT SPECIFICATION

### Input Contract

```typescript
interface AnalysisInput {
  candidateId: string;  // UUID of authenticated candidate
  jobId: string;        // UUID of job offer
}
```

### Data Fetching

```
1. candidates WHERE id = {candidateId}
   COLUMNS: cv_text
   
2. job_offers WHERE id = {jobId}
   COLUMNS: title, company, description, requirements

3. ai_analysis_cache 
   WHERE candidate_id = {candidateId} AND job_id = {jobId}
   COLUMNS: match_score, strengths, improvements, cover_letter_draft, prompt_version
```

### Output Contract

```typescript
interface AnalysisOutput {
  match_score: number;          // 0-100
  strengths: string[];          // 0-5 items
  gaps: string[];               // 0-5 items
  improvements: string[];       // 0-5 items (alias for gaps)
  cover_letter_draft: string;   // Full text
  experienceVerified?: string;  // Optional
  summary?: string;             // Optional
  score?: number;               // Optional (alias for match_score)
}
```

### Workflow

```
Input: { candidateId, jobId }
  ↓
Check Cache:
  query ai_analysis_cache
  if found && version matches → return cached result
  ↓
Fetch Candidate & Job (parallel):
  query candidates.cv_text
  query job_offers columns
  ↓
Validate:
  if no cv_text → error
  if no job → error
  ↓
Call Groq:
  POST https://api.groq.com/openai/v1/chat/completions
  with prompt including cv_text + job details
  ↓
Parse Response:
  extract JSON
  clean text
  parse JSON object
  ↓
Sanitize:
  normalize score to [0, 100]
  limit arrays to 5 items
  trim strings
  ↓
Cache:
  upsert ai_analysis_cache
  ↓
Return: AnalysisOutput
```

---

## 24. WEB ↔ MOBILE PARITY CHECKLIST

Use this checklist to verify that the mobile implementation produces identical results to the web app:

### Setup Phase

- [ ] Same Supabase project (database)
- [ ] Same Groq API key
- [ ] Same PROMPT_VERSION constant ("v2.2_2026-07-27")

### Pre-Analysis

- [ ] Same authenticated candidate (same user ID)
- [ ] Same CV content (same cv_text in database)
- [ ] Same job offer (same job ID)
- [ ] Cache is empty (or cleared for testing)

### API Call

- [ ] Correct Groq endpoint: https://api.groq.com/openai/v1/chat/completions
- [ ] Correct model: llama-3.1-8b-instant
- [ ] Correct temperature: 0.2
- [ ] Correct prompt (exact text match)
- [ ] Correct message format (user role)
- [ ] Correct response_format: { type: "json_object" }
- [ ] Same timeout: 30 seconds

### Response Handling

- [ ] JSON extraction works with any markdown formatting
- [ ] Invisible characters removed (zero-width spaces, etc.)
- [ ] JSON parsing handles all field name variations
- [ ] Score normalized to [0, 100]
- [ ] Arrays limited to 5 items
- [ ] All required fields present

### Result Comparison

- [ ] match_score identical
- [ ] strengths[] identical (same items, same order)
- [ ] gaps[] identical
- [ ] improvements[] identical
- [ ] cover_letter_draft identical (exact text)
- [ ] experienceVerified identical
- [ ] summary identical (if present)

### Caching

- [ ] Cache created with same columns
- [ ] prompt_version stored correctly
- [ ] Subsequent calls return cached result
- [ ] prompt_version mismatch triggers re-analysis
- [ ] Cache invalidated when CV updated

### Error Handling

- [ ] Same error messages
- [ ] Same error conditions (no CV, no job, etc.)
- [ ] Same HTTP error handling (429, 5xx)
- [ ] Same timeout behavior

---

## 25. CRITICAL RISKS & CONSIDERATIONS

### Security Risks (Documented, Not Changed)

#### Risk 1: Client-Side API Key Exposure

**Severity:** MEDIUM-HIGH

**Issue:** Groq API key is stored in environment variables and accessed client-side

**Current Implementation:** Insecure for production

**Impact on Mobile:**
- Mobile app will have same issue
- API key visible in app memory
- Users can extract key from device
- Quota theft possible

**Recommendation:** Move API calls to backend/Edge Function
- Create proxy endpoint
- Keep API key server-side
- Mobile calls proxy, not Groq directly
- **Status:** NOT FIXED (analysis only)

---

#### Risk 2: CV Text Exposure

**Severity:** MEDIUM

**Issue:** Full CV text sent to third-party AI (Groq)

**Impact:**
- Groq stores/processes CV content
- Privacy concern depending on jurisdiction
- GDPR implications possible

**Mitigation:**
- Add data processing agreement with Groq
- Document privacy policy
- Allow users to opt-out

**Status:** Current implementation doesn't change this

---

### Technical Risks

#### Risk 3: Prompt Version Mismatch

**Severity:** LOW

**Issue:** If PROMPT_VERSION not incremented when prompt changes, stale cache used

**Mitigation:**
- Always increment PROMPT_VERSION when modifying prompt
- Test cache invalidation
- Monitor for unexpected results

**Status:** Risk exists in web app, will exist in mobile
#### Risk 4: Groq Rate Limiting (HTTP 429)

**Severity:** MEDIUM

**Issue:** No retry logic implemented

**Current Behavior:**
- Throws error to user
- User must click again

**Recommendation:**
- Implement exponential backoff
- Add retry counter (max 3 retries)
- Show "Please wait" message during retry

**Status:** Not implemented in web app, mobile can improve
#### Risk 5: PDF Extraction Unavailable in Mobile

**Severity:** MEDIUM

**Issue:** Mobile can't extract PDF using pdfjs-dist

**Current Assumption:** `cv_text` already exists in database

**Action for Mobile:**
- Assume CV already uploaded (don't re-extract)
- If cv_text missing, show error
- Don't attempt PDF extraction in mobile app

**Status:** Important for mobile architecture
#### Risk 6: localStorage Not Available in Mobile

**Severity:** LOW

**Issue:** Fallback CV loading from localStorage won't work in React Native

**Current Code (Line 281-282):**
```typescript
if (typeof window === "undefined" || !window.localStorage) {
  return "";
}
```
**Mobile Action:**
- Remove this fallback
- Rely on cv_text being in database
- If missing, error

**Status:** Necessary change for mobile
### Data Risks

#### Risk 7: Empty cv_text Still Accepted

**Severity:** LOW

**Issue:** If cv_text exists but is empty string, Groq receives empty CV

**Current Check:** `if (!candidateCvText.trim())`

**Behavior:** Throws error (good)

**Mobile:** Keep this check
#### Risk 8: Missing Job Fields

**Severity:** LOW

**Issue:** If any of 4 required job fields are NULL/undefined

**Current Behavior:** Prompt receives "Non précisé" placeholder

**Impact:** Analysis quality degraded but doesn't crash

**Mobile:** Keep same behavior
### Performance Risks

#### Risk 9: Large CV Text

**Severity:** LOW

**Issue:** Very long CV (100KB+) sent to Groq

**Impact:**
- Larger request payload
- Slower API response
- Higher API costs

**Mitigation:**
- Consider truncating CV to first N words
- Monitor API response times
- Warn users if CV too large

**Status:** Not implemented in web app
#### Risk 10: Timeout (30 seconds)

**Severity:** LOW

**Issue:** Groq may timeout for complex analyses

**Current Behavior:** AbortController fires after 30 seconds

**User Experience:** Generic error message

**Recommendation:**
- Increase timeout to 45 seconds
- Show progress indicator
- Allow manual retry

**Status:** Can be improved in mobile
### Deployment Risks

#### Risk 11: Environment Variables

**Severity:** MEDIUM
**Issue:** Groq key must be configured in mobile app
**Mobile Setup:**
- Add GROQ_API_KEY to .env file
- Build time environment variable
- Different per environment (dev, staging, prod)

**Recommendation:**
- Use separate keys per environment
- Rotate keys regularly
- Monitor usage per key

#### Risk 12: Supabase Authentication

**Severity:** MEDIUM
**Issue:** Mobile must have valid Supabase session
**Requirement:**
- User authenticated before analysis
- Session token provided
- RLS policies enforced
**Risk:** If session expired, queries fail
**Mitigation:**
- Refresh token before analysis
- Handle 401 errors
- Re-prompt login

## APPENDIX: MISCELLANEOUS

### groqAnalysisService.ts Interface for AiAnalysisCacheRow

```typescript
interface AiAnalysisCacheRow {
  id: string;
  candidate_id: string;
  job_id: string;
  match_score: number;
  strengths: string[];
  improvements: string[];
  cover_letter_draft: string;
  prompt_version: string;
  created_at: string;
}
```
### groqAnalysisPrompt.ts Interface for GroqJobContext

```typescript
export interface GroqJobContext {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  requirements?: string | null;
}
```
### Utility Functions Required
From `matchScoreUtils.ts`:
```typescript
export function parseYears(text: string): number
```
From `aiMatchingService.ts`:
```typescript
export async function extractTextFromPdfData(arrayBuffer: ArrayBuffer): Promise<string>
export async function updateCandidateCvText(candidateId: string, cvText: string, cvUrl?: string): Promise<CandidateRow | null>
## SUMMARY

**This document provides a complete technical specification for reproducing the "Analyze Candidate for Job Offer" feature in a React Native mobile application.**

**Key Takeaways:**
1. Feature exists in web app (JobOfferDetailPage + groqAnalysisService)
2. Uses Groq API (llama-3.1-8b-instant model)
3. Caches results with version tracking
4. Requires CV text to exist in database (pre-extracted)
5. Queries 4 fields from job_offers table
6. Sanitizes and validates all responses
7. Displays score + strengths + gaps + cover letter
8. Security: API key currently client-side (should move to backend for mobile)
9. Same Supabase database can be used for mobile
10. Exact prompt and rules documented for faithful reproduction
**File to Create:** `MOBILE_CV_JOB_ANALYSIS_IMPLEMENTATION.md` ✅  
**Analysis Status:** COMPLETE — NO MODIFICATIONS TO WEB PROJECT