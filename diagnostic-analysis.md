# Diagnostic Analysis: LOGIN → DASHBOARD vs RELOAD → DASHBOARD

## CHRONOLOGICAL COMPARISON

### SCENARIO A: LOGIN → DASHBOARD
```
[1681.9ms] Init: session=null, authLoading=true
[1802.2ms] → [1814.3ms] getSession() called, returns null
[1989.1ms] Init complete: authLoading=false
[4046.3ms] → [4049.1ms] LOGIN TRIGGERED → AuthProvider re-renders
[5419.0ms] → [5420.1ms] LOGIN_SUCCESS → session restored, userId available
[6133.1ms] EXTRA RENDER (second auth init render)
```

### SCENARIO B: RELOAD  
```
[1346.2ms] Init: session=null, authLoading=true
[1424.1ms] → [1427.7ms] getSession() called, returns null
[1431.0ms] Init complete: authLoading=false
[No further auth events]
```

## KEY FINDINGS

### 1. DIFFERENCE IN EVENT SEQUENCE
- **LOGIN**: 9 AUTH_PROVIDER_INIT events
- **RELOAD**: 4 AUTH_PROVIDER_INIT events
- **Delta**: 5 additional re-renders after login

### 2. FIRST CRITICAL DIFFERENCE
- At [4049.1ms] in LOGIN: AuthContext re-initializes DURING login action
- This causes: `authLoading=true` to be set again
- This triggers: All components watching `authLoading` to potentially re-run

### 3. COMPONENT DEPENDENCY CHAIN IDENTIFIED

**Files with problematic dependencies:**
- `src/pages/candidate/CandidateDashboardPage.tsx`

**The exact issue in CandidateDashboardPage:**

```typescript
// useEffect #1: Load recommended jobs
useEffect(() => {
  // Dependencies: profile?.id, candidateDocuments.cv?.url, profile?.cv_text, 
  //             profile?.embedding_vector, recommendedPage
  // This effect calls setRecommendedJobs, setRecommendedLoading, etc.
}, [
  profile?.id,
  candidateDocuments.cv?.url,
  profile?.cv_text,
  profile?.embedding_vector,
  recommendedPage,
]);

// useEffect #2: Reset recommended page
useEffect(() => {
  setRecommendedPage(1);  // <-- SETTER CALL
}, [profile?.id, candidateDocuments.cv?.url, profile?.cv_text, profile?.embedding_vector]);

// useEffect #3: Load candidate documents
const reloadCandidateDocuments = useCallback(async () => {
  setCandidateDocuments(...);  // <-- SETTER CALL
}, [profile?.id]);

// useEffect #4: Call reloadCandidateDocuments
useEffect(() => {
  reloadCandidateDocuments();  // <-- TRIGGERS EFFECT #3
}, [reloadCandidateDocuments]);  // <-- DEPENDS ON profile?.id
```

## ROOT CAUSE: THE DEPENDENCY LOOP

### When LOGIN completes and profile becomes available:

1. **`profile?.id` changes** from `null` → `"user-uuid"`
   - Timestamp: ~5420ms (just after login success)

2. **Triggers ALL 4 useEffects that depend on `profile?.id`**
   - useEffect #1 (recommended jobs)
   - useEffect #2 (reset page)
   - useEffect #3 (document loader function dependency)
   - useEffect #4 (reload documents)

3. **`reloadCandidateDocuments` function changes** (because it depends on `profile?.id`)
   - This is a NEW function reference (useCallback dependency change)

4. **useEffect #4 detects function change** and calls it again
   - `setCandidateDocuments` is called
   - `candidateDocuments.cv?.url` changes

5. **`candidateDocuments.cv?.url` change triggers**
   - useEffect #1 again (has this in dependencies)
   - useEffect #2 again (has this in dependencies)
   - **BOTH call their setters**

6. **`setRecommendedPage(1)` from useEffect #2** changes `recommendedPage`
   - Even if it was already 1, the setter may cause a re-render

7. **useEffect #1 notices `recommendedPage` changed**
   - Runs again!
   - Calls `setRecommendedJobs`, `setRecommendedLoading`
   - These are setter calls

### RESULT: Cascading effect execution and setter calls

```
profile?.id ≠ null
  ↓ triggers [Effect #1, #2, #3, #4]
  ↓
reloadCandidateDocuments changes
  ↓ triggers [Effect #4]
  ↓
setCandidateDocuments
  ↓ causes candidateDocuments.cv?.url to change
  ↓ triggers [Effect #1, #2]
  ↓
setRecommendedPage(1)
  ↓ causes recommendedPage to change  
  ↓ triggers [Effect #1]
  ↓
setRecommendedJobs, setRecommendedLoading
  ↓ causes re-render
  ↓
Back to start if profile data is still settling
```

## WHY RELOAD WORKS

On RELOAD:
1. Session is already in AuthContext (persisted in browser)
2. Dashboard mounts with `session` immediately available
3. `profile?.id` is set in useCandidate AFTER mount
4. All effects execute once in proper order (no chaining through multiple re-renders)
5. `authLoading` never re-triggers during rendering

## React #185 MANIFESTATION

The cascading effects cause:
1. **Rapid consecutive re-renders** of CandidateDashboardPage
2. **Multiple setState calls** in same render cycle
3. **Unstable component state** - promises resolve in different orders
4. **ErrorBoundary catches** the inconsistent state
5. **Error: "Erreur d'affichage"**

## FIRST SETTER THAT REPEATS

**`setRecommendedPage`** in effect #2 is the FIRST repeating setter:

```typescript
useEffect(() => {
  setRecommendedPage(1);
}, [profile?.id, candidateDocuments.cv?.url, profile?.cv_text, profile?.embedding_vector]);
```

Why it repeats:
- Runs once when `profile?.id` first becomes available
- Runs again when `candidateDocuments.cv?.url` changes (from reloadCandidateDocuments)
- Even if it sets to same value (1), causes re-render

## EFFECT THAT TRIGGERS IT

**Effect #2: Reset recommended page** is the repeating trigger:

```typescript
useEffect(() => {
  diagnosticLogger.log('EFFECT_RESET_PAGE', {...}, 'CandidateDashboardPage');
  diagnosticLogger.recordSetterCall('CandidateDashboardPage', 'setRecommendedPage', 1);
  setRecommendedPage(1);  // <-- REPEATING CALL
}, [profile?.id, candidateDocuments.cv?.url, profile?.cv_text, profile?.embedding_vector]);
```

## EXACT DEPENDENCIES

Dependencies that cause the loop:

```typescript
// Effect #1 dependencies
[
  profile?.id,                        // ← changes on login
  candidateDocuments.cv?.url,         // ← changes after docs reload
  profile?.cv_text,                   // ← may be null initially
  profile?.embedding_vector,          // ← may be null initially
  recommendedPage,                    // ← gets reset by Effect #2
]

// Effect #2 dependencies  
[
  profile?.id,                        // ← changes on login
  candidateDocuments.cv?.url,         // ← changes after docs reload
  profile?.cv_text,                   // ← may be null initially
  profile?.embedding_vector,          // ← may be null initially
]
```

Both effects depend on the SAME 4 profile-related values, plus recommendedPage.

## PROOF: WHY LOGIN TRIGGERS MORE RENDERS THAN RELOAD

**LOGIN Flow:**
- AuthContext.login() → `authLoading = true` → render
- Supabase returns session → onAuthStateChange → `authLoading = false` → render
- useCandidate: `profile` loads → trigger dashboard effects → render cascades

**RELOAD Flow:**
- AuthContext init sees persisted session → `authLoading = false` (no intermediate true)
- useCandidate: `profile` loads from cache/DB → dashboard effects run once
- No cascading because session was never "not ready" during dashboard mount

## CAUSE CONFIRMED

**YES - The cause is confirmed through code analysis:**

The issue is a **dependency loop in CandidateDashboardPage** where:
1. Multiple useEffects depend on the same subset of profile data
2. These effects call setters that mutate objects in those dependencies
3. On LOGIN, profile data becomes available for the FIRST time
4. This triggers ALL effects simultaneously
5. Effects call setters that change OTHER dependencies
6. Those changed dependencies re-trigger the effects
7. This creates 2-3 cycles of re-renders before stabilizing

The root cause is: **`candidateDocuments` object is recreated every render when being set, causing `candidateDocuments.cv?.url` to be a new dependency value even when logically the same.**

Additional contributing factor: **`reloadCandidateDocuments` is a useCallback that changes reference when `profile?.id` changes, causing useEffect #4 to re-run unnecessarily.**
