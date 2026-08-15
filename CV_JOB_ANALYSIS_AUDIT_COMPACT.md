# CV ↔ JOB ANALYSIS — COMPACT AUDIT

**Web Feature:** Analyze CV vs job offer | **Status:** Analysis only | **Date:** 2026-08-15

---

## FILES & ENTRY POINTS
**UI:** `src/pages/public/JobOfferDetailPage.tsx` (handler line 264-278, button 570, display 593-639)
**Service:** `src/services/groqAnalysisService.ts` (analyzeCandidateForJob, fetchCache, sanitizePayload, extractJson)
**Prompt:** `src/services/groqAnalysisPrompt.ts` (buildGroqAnalysisPrompt)
**Cache:** `ai_analysis_cache` table (unique: candidate_id+job_id, prompt_version tracking)
**Dependencies:** Groq API, Supabase, pdfjs-dist

---

## DATA FLOW
Click button → Check cache → Fetch cv_text + 4 job fields → Call Groq (llama-3.1-8b-instant) → Parse JSON → Sanitize (score 0-100, arrays ≤5) → Persist → Display results

---

## DATA SOURCES (EXACT)
**Candidate:** Only `candidates.cv_text` (must exist, fallback to localStorage, throw error if empty)
**Job:** Only 4 fields from `job_offers`: title, company, description, requirements (no other fields used)
**Years detected:** Via parseYears(cvText) utility

---

## GROQ CONFIGURATION
**Endpoint:** https://api.groq.com/openai/v1/chat/completions
**Model:** llama-3.1-8b-instant
**Temperature:** 0.2 (consistent)
**Response Format:** { type: "json_object" }
**Timeout:** 30 seconds
**HTTP Errors:** 429→"Veuillez réessayer" | 5xx→"Problèmes du service"

---

## EXACT PROMPT (groqAnalysisPrompt.ts)
```
Tu es un Directeur des Ressources Humaines et Expert Senior en Recrutement fort de 15 ans d'expérience.

RÈGLES STRICTES:
1. FIDÉLITÉ AU CV: Analyse le texte fourni STRICTEMENT. Pas d'hypothèses. Pas de formules génériques ("Avec plus de X ans...").
2. RUPTURE MÉTIER: Score MAX 25% si no technical link. MÉTIERS CONNEXES: 60-85% score si proximité.
3. CERTIFICATIONS OBLIGATOIRES: Score MAX 45% si missing.
4. DIPLÔMES: BAC < Licence < Master < Doctorat. NO "insufficient level" si diplôme ≥ requis.
5. LETTRE MOTIVATION: ZÉRO auto-disqualification. Posture POSITIVE 5-points (Accroche/Vous/Moi/Nous/Appel).
6. FORMAT: JSON ONLY { score, experienceVerified, strengths[], gaps[], summary, cover_letter_draft }

Job ID: {jobId}
Expérience détectée: {detectedExperienceYears} ans

--- CV ---
{candidateCvText}

--- OFFRE ---
Titre: {job.title}
Entreprise: {job.company}
Description: {job.description}
Profil: {job.requirements}
```

---

## REQUEST/RESPONSE STRUCTURE
**POST Request:** { model: "llama-3.1-8b-instant", temperature: 0.2, messages: [{role: "user", content: prompt}], response_format: {type: "json_object"} }
**Response Expected:** { score: 0-100, strengths: ["..."], gaps: ["..."], cover_letter_draft: "...", [experienceVerified], [summary] }

---

## SANITIZATION LOGIC
**Score:** Clamp to [0,100], round, default 0 if invalid
**Strengths/Gaps/Improvements:** Filter non-strings, trim, max 5 items. If improvements empty use gaps, or vice-versa.
**Cover Letter:** Try "cover_letter_draft" then "cover_letter" field. Default empty string.
**Experience Verified:** Optional, trim if exists.

---

## UI STATES & DISPLAY
**Not Authenticated:** Hide analysis, show login link
**Authenticated, Loading:** Button disabled "Analyse en cours…", show 3 skeleton loaders
**Error:** Orange box with error message, button still clickable
**Success:** Score card (progress bar width=max(4%, min(100%, score%))), Strengths (green), Gaps (orange), Cover Letter (copyable)
**Copy:** Button text "Copié !" for 1.8 seconds

---

## SUPABASE QUERIES
```typescript
// 1. Cache Check
SELECT match_score, strengths, improvements, cover_letter_draft, prompt_version 
FROM ai_analysis_cache 
WHERE candidate_id=? AND job_id=?

// 2. Candidate CV
SELECT cv_text FROM candidates WHERE id=?

// 3. Job Details
SELECT title, company, description, requirements FROM job_offers WHERE id=?

// 4. Persist Cache
UPSERT ai_analysis_cache 
SET (candidate_id, job_id, match_score, strengths, improvements, cover_letter_draft, prompt_version)
ON CONFLICT (candidate_id, job_id) DO UPDATE
```

---

## CACHE & VERSION TRACKING
**Constant:** PROMPT_VERSION = "v2.2_2026-07-27" (groqAnalysisService.ts line 10)
**Cache Table:** ai_analysis_cache with columns: id (UUID PK), candidate_id (FK), job_id (FK), match_score (INT), strengths (TEXT[]), improvements (TEXT[]), cover_letter_draft (TEXT), prompt_version (VARCHAR), created_at (TIMESTAMPTZ)
**Unique Constraint:** (candidate_id, job_id)
**Version Mismatch:** Cached entry rejected if prompt_version ≠ PROMPT_VERSION. Forces re-analysis.
**Invalidation:** Automatic when CV re-uploaded via processCandidateCvUpload() in aiMatchingService.ts
**Expiration:** No time-based expiration (persists indefinitely unless version changes or CV updated)

---

## API KEY SECURITY (Current Risk)
**Currently client-side exposed** in `groqAnalysisService.ts` getGroqApiKey():
- Checks VITE_GROQ_API_KEY (Vite public env)
- Fallback: GROQ_API_KEY
- Fallback: process.env.GROQ_API_KEY
**Risk:** Key visible in browser, extractable, quota theft possible
**Recommendation for Mobile:** Move to backend/Edge Function to hide key

---

## RESPONSE PARSING (extractAndCleanJson)
1. Remove zero-width chars (\u200b, \u200c, \u200d, \u202c)
2. Strip markdown: ` ```json ... ``` `
3. Extract first { ... } JSON object
4. JSON.parse() and validate
5. Throw error if invalid or no JSON found

---

## ERROR MESSAGES
- "Vous devez être connecté pour lancer l'analyse IA." (no auth)
- "Le candidat n'a pas encore de CV analysable pour cette offre." (no CV)
- "L'offre sélectionnée est introuvable." (no job)
- "La clé Groq n'est pas configurée." (missing API key)
- "L'analyseur est actuellement très sollicité. Veuillez réessayer." (HTTP 429)
- "Le service Groq rencontre des problèmes. Veuillez réessayer." (HTTP 5xx)
- "Une erreur est survenue pendant l'analyse." (catch-all)

---

## MOBILE IMPLEMENTATION CHECKLIST
**MUST REPRODUCE IDENTICALLY:**
- [x] analyzeCandidateForJob(candidateId, jobId) signature & behavior
- [x] Cache check with prompt_version validation
- [x] Parallel fetch candidates + job_offers
- [x] Groq endpoint, model, temperature, response format, timeout
- [x] Exact prompt text (6 rules, variable injection)
- [x] JSON extraction (markdown removal, invisible chars)
- [x] Sanitization (score clamp, array limits)
- [x] Cache persistence with prompt_version
- [x] Version mismatch invalidation
- [x] Error handling (all error cases)

**ADAPT FOR MOBILE:**
- [ ] React Router → React Navigation
- [ ] localStorage → Async Storage/MMKV
- [ ] HTML/DOM components → React Native (View, TouchableOpacity, FlatList)
- [ ] Tailwind CSS → StyleSheet
- [ ] Copy API → react-native-clipboard
- [ ] Skeleton loaders → custom implementation
- [ ] Toast for errors instead of inline boxes

**DO NOT REPRODUCE:**
- [ ] React Router routes
- [ ] CSS/Tailwind
- [ ] localStorage client-side fallback
- [ ] Job matching/recommendation feature (different system)

---

## TYPESCRIPT INTERFACES
```typescript
export interface AiAnalysisResult {
  match_score: number;          // 0-100 (required)
  score?: number;               // Alias (optional)
  experienceVerified?: string;  // Optional
  strengths: string[];          // Required, max 5
  improvements: string[];       // Required, max 5
  gaps: string[];               // Required, max 5
  summary?: string;             // Optional
  cover_letter_draft: string;   // Required (can be empty)
}

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

interface GroqJobContext {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  requirements?: string | null;
}
```

---

## DEPENDENCIES
- @supabase/supabase-js (Supabase queries)
- fetch native API (HTTP requests)
- AbortController (timeout)
- navigator.clipboard (copy to clipboard, web only)
- localStorage (fallback CV, web only)
- parseYears() from matchScoreUtils.ts (extract years from text)
- extractTextFromPdfData() from aiMatchingService.ts (PDF extraction, used on CV upload, not analysis)

---

## CRITICAL RISKS
**Risk 1 - API Key Exposure (MEDIUM-HIGH):** Key client-side. Mobile app will inherit this. Recommend backend proxy.
**Risk 2 - CV Privacy (MEDIUM):** Full CV sent to Groq. GDPR consideration. Add data processing agreement.
**Risk 3 - Groq Rate Limit 429 (MEDIUM):** No retry logic. User must retry manually. Recommend exponential backoff.
**Risk 4 - localStorage Fallback (MEDIUM):** Won't work in React Native. Mobile should error if cv_text missing from DB.
**Risk 5 - Large CV Timeout (LOW):** Very long CV (100KB+) may timeout. Consider truncation.
**Risk 6 - Prompt Version Not Incremented (LOW):** Stale cache if prompt changes but version not updated.

---

## DATABASE MIGRATIONS
**Migration 1:** `supabase/migrations/2026_add_ai_analysis_cache.sql`
- Create ai_analysis_cache table
- RLS: SELECT/INSERT only for own candidate (user_id → candidates.id)

**Migration 2:** `supabase/migrations/20260727_add_prompt_version_to_ai_cache.sql`
- Add prompt_version VARCHAR(50) column
- Create index on prompt_version
- Truncate old cache

---

## WEB ↔ MOBILE PARITY TEST
Same Supabase project, same Groq key, same PROMPT_VERSION, same authenticated candidate, same CV content, same job offer ID. Run analysis on web and mobile. Compare outputs:
- match_score identical?
- strengths[] identical (items + order)?
- gaps[] identical?
- improvements[] identical?
- cover_letter_draft identical (exact text)?
- Cache created correctly?
- Version mismatch triggers re-analysis?

---

## SUMMARY
The feature exists in web app (JobOfferDetailPage + groqAnalysisService). Uses Groq AI for analysis. Caches with version tracking. Requires CV pre-extracted in database. Queries 4 job fields. Sanitizes responses. Displays score + results. Same Supabase backend for mobile. Key technical decisions: client-side API key (security risk), localStorage fallback (web only), PROMPT_VERSION for cache invalidation. Mobile should adapt UI components but keep business logic identical. Test parity carefully.

---

**End of Document** | Analysis: 2026-08-15 | Web App: ANALYSIS ONLY | Mobile Ready: YES
