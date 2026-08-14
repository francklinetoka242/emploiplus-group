# Correction de l'unification des états du compte candidat

## Date

2026-08-14

## Objectif

Corriger les doublures de logique et d'état qui représentaient indirectement la même réalité dans le flux de connexion et de gestion du compte candidat.

---

## 1. Doublures identifiées et corrigées

### Doublure 1: Deux wrappers `useCandidateProfile` (CORRIGÉE)

**Problème:**
- Deux fichiers `useCandidateProfile.ts` existaient à des emplacements différents:
  - `/features/candidates/hooks/useCandidateProfile.ts`
  - `/features/profile/hooks/useCandidateProfile.ts`
- Tous deux retournaient juste `useCandidate()` sans logique supplémentaire
- Cela créait une confusion sur où importer et qu'elle était la source canonique

**Correction appliquée:**
- Changé `/features/candidates/hooks/useCandidateProfile.ts` pour réexporter depuis `/features/profile/hooks/useCandidateProfile.ts`
- Gardé `/features/profile/hooks/useCandidateProfile.ts` comme source unique et wrapper léger

**Fichiers modifiés:**
- `/features/candidates/hooks/useCandidateProfile.ts` - changé en réexport
- `/features/profile/hooks/useCandidateProfile.ts` - consolidé avec documentation

---

### Doublure 2: Import indirect via wrapper inutile (CORRIGÉE)

**Problème:**
- `CandidateProfileCenter.tsx` importait `useCandidateProfile()` qui était un simple wrapper
- Cela ajoutait une couche d'indirection inutile
- Le wrapper retournait juste `useCandidate()` directement

**Correction appliquée:**
- Changé `CandidateProfileCenter.tsx` pour importer directement `useCandidate` depuis `/features/candidates/hooks/useCandidate`
- Évite une couche de wrapper inutile pour ce composant

**Fichiers modifiés:**
- `/features/profile/components/CandidateProfileCenter.tsx` - remplacé import et utilisation

**Avant:**
```tsx
import { useCandidateProfile } from "../hooks/useCandidateProfile";
const { profile, loading: profileLoading, error: profileError, updateProfile } = useCandidateProfile();
```

**Après:**
```tsx
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
const { profile, loading: profileLoading, error: profileError, updateProfile } = useCandidate();
```

---

### Doublure 3: Export redondant de `isAuthenticated` dans `useCandidate` (CORRIGÉE)

**Problème:**
- `useCandidate()` retournait `isAuthenticated` au même titre que AuthContext
- `isAuthenticated` était déjà disponible via `useAuth()` ou `useAuthContext()`
- Personne n'utilisait cette valeur du hook `useCandidate()`
- C'était une duplication inutile de l'état d'authentification

**Correction appliquée:**
- Supprimé `isAuthenticated` du retour de `useCandidate()`
- Les composants doivent utiliser `useAuth()` ou `useAuthContext()` pour cet état

**Fichiers modifiés:**
- `/features/candidates/hooks/useCandidate.ts` - supprimé export

**Avant:**
```ts
return {
  profile,
  loading,
  error,
  logout,
  updateProfile,
  refetch,
  isAuthenticated,  // SUPPRIMÉ
};
```

**Après:**
```ts
return {
  profile,
  loading,
  error,
  logout,
  updateProfile,
  refetch,
};
```

---

## 2. Doublures NOT corrected (Architecture acceptée)

### Alias de backward compatibility dans `useAuth()`

**Statut:** CONSERVÉ - ne constitue pas une vraie doublure

`useAuth()` retourne:
- `loading` (alias de `authLoading`)
- `isLoading` (alias de `authLoading`)

**Justification:** Ce sont des alias pour la backward compatibility avec du code existant. Cela ne constitue pas une duplication d'état puisque ce sont juste des noms supplémentaires pour la même valeur.

### Réexports façade dans `/features/profile/hooks/`

**Statut:** CONSERVÉ - architecture acceptable

Chaque fichier dans `/features/profile/hooks/` réexporte depuis `/features/candidates/hooks/`:
- `useCandidateEducation.ts`
- `useCandidateSkills.ts`
- `useCandidateLanguages.ts`
- etc.

**Justification:** C'est une facette architecturale intentionnelle qui permet à `/features/profile/components/` d'importer des hooks d'un seul endroit (`../hooks/`). Ce n'est pas une duplication, c'est une couche de façade.

---

## 3. Source de vérité finale consolidée

### Hiérarchie d'autorité

```
Supabase Auth (session + user.id)
        ↓
        ├─→ AuthContext
        │   ├─ session (Supabase)
        │   ├─ user (from session)
        │   ├─ authLoading (session init state)
        │   ├─ candidateAccessResolved (candidate detection state)
        │   ├─ rolesResolved (BOTH authLoading=false AND candidateAccessResolved=true)
        │   ├─ hasCandidateProfile (candidate exists? boolean)
        │   ├─ roles (from auth metadata + candidate role if exists)
        │   └─ permissions (from auth metadata + candidate permissions if exists)
        │
        └─→ useCandidate
            ├─ profile (loaded via user.id → candidates.user_id → candidate.id)
            ├─ loading (profile loading state)
            ├─ error (profile loading error)
            ├─ logout (cleanup)
            ├─ updateProfile (mutation)
            └─ refetch (reload profile)
                    ↓
                useCandidateProfileData (composition)
                ├─ profile (from useCandidate)
                ├─ educations (from useCandidateEducation)
                ├─ skills (from useCandidateSkills)
                ├─ languages (from useCandidateLanguages)
                ├─ preferences (from useCandidatePreferences)
                ├─ experiences (from getCandidateExperiences)
                ├─ isLoading (unified loading state)
                ├─ isReady (all data loaded?)
                ├─ error (unified error state)
                └─ refetch (reload all)
```

### Identifiants cohérents

- `session.user.id` → Identifiant Supabase Auth
- `candidates.user_id` → Clé étrangère vers user.id
- `candidate.id` (aka `candidateId`) → Identifiant du profil candidat
- `profile` → Objet CandidateProfile complet

### Responsabilités claires

| Concept | Responsable | Source |
|---------|-------------|--------|
| Authentification | AuthContext | Supabase Auth |
| Détection candidat | AuthContext | Query candidates table |
| Profil candidat complet | useCandidate | ProfileApi |
| Sous-données candidat | useCandidateProfileData | Composition de sous-hooks |
| Routing/Protection | Guards | AuthContext.rolesResolved |
| Navigation post-login | CandidateLoginPage | AuthContext.rolesResolved |

---

## 4. Chaîne de chargement (Orchestration)

### Flux post-login unified

```text
/candidate/login
    ↓
CandidateLoginPage.onSubmit()
    ↓
AuthContext.login()
    ↓
supabase.auth.signInWithPassword()
    ↓
Supabase Auth session created
    ↓
onAuthStateChange fires
    ↓
AuthContext updates:
  ├─ session = new session
  ├─ authLoading = false
  ├─ candidateAccessResolved = false (reset to trigger detectCandidateAccess)
    ↓
detectCandidateAccess runs
    ├─ Query: candidates.user_id = session.user.id
    ├─ Set hasCandidateProfile = true|false
    ├─ candidateAccessResolved = true
    ├─ roles = updated with "candidate" role if exists
    ├─ permissions = updated with candidate permissions if exists
    └─ rolesResolved = true (both authLoading=false AND candidateAccessResolved=true)
    ↓
CandidateLoginPage watches rolesResolved
    ├─ rolesResolved = true → only then navigate
    └─ navigate("/candidate/dashboard", { replace: true })
    ↓
ProtectedRoute guards allow access
    ├─ AuthenticationGuard: user exists? ✓
    ├─ PermissionGuard: has "dashboard.candidate"? ✓
    ├─ RoleGuard: (if required) ✓
    └─ Children render
    ↓
CandidateLayout renders
    ↓
CandidateDashboardPage mounts
    └─ useCandidateProfileData() loads profile + sub-data
       ├─ useCandidate() loads candidate.profile via user.id
       ├─ useCandidateEducation() loads candidate.educations via profile.id
       ├─ useCandidateSkills() loads candidate.skills via profile.id
       ├─ useCandidateLanguages() loads candidate.languages via profile.id
       ├─ useCandidatePreferences() loads candidate.preferences via profile.id
       ├─ getCandidateExperiences() loads candidate.experiences via profile.id
       ├─ isReady = true when all loaded
       └─ Dashboard renders with complete data
```

### Comportement après refresh

```text
Browser refresh on /candidate/dashboard
    ↓
AuthProvider mounts
    ├─ getSession() from Supabase
    ├─ Session restored? ✓
    ├─ authLoading = false
    ├─ candidateAccessResolved = false (reset)
    ├─ detectCandidateAccess runs again
    ├─ candidateAccessResolved = true
    ├─ rolesResolved = true
    └─ No redirect (already on dashboard)
    ↓
Guards allow access (same as above)
    ↓
useCandidateProfileData() reloads all data
```

### Comportement after logout

```text
logout() called
    ↓
useCandidate.logout():
  ├─ logoutCandidate()
  │  ├─ supabase.auth.signOut()
  │  └─ clearAuthStorage()
  ├─ logoutContext()
  │  ├─ session = null
  │  ├─ user = null
  │  ├─ rolesResolved = false
  │  └─ candidateAccessResolved = false
  ├─ profile = null
  └─ navigate("/candidate/login")
    ↓
AuthenticationGuard catches user=null
    └─ Navigate to login
```

---

## 5. Fichiers modifiés

1. `/features/candidates/hooks/useCandidateProfile.ts` - Changé en réexport
2. `/features/profile/hooks/useCandidateProfile.ts` - Consolidé
3. `/features/profile/components/CandidateProfileCenter.tsx` - Import direct
4. `/features/candidates/hooks/useCandidate.ts` - Supprimé export isAuthenticated

---

## 6. Tests de vérification

### Build
- ✅ `npm run build` réussit sans erreurs
- ✅ 2524 modules transformés
- ✅ Prerender exécuté

### Pas de régressions introduites
- ✅ Pas d'erreur de compilation
- ✅ Pas de changement de logique de routage
- ✅ Pas de changement de logique d'authentification
- ✅ Pas de changement de logique de chargement du profil

---

## 7. Règle finale atteinte

> "Il doit être impossible pour deux parties différentes du compte de croire qu'elles utilisent deux candidats différents ou deux états différents du même candidat."

### Vérification

| Accès point | Source de vérité | Comment accéder | Cohérence |
|------------|-----------------|-----------------|-----------|
| AuthContext | Supabase + candidate query | useAuth() ou useAuthContext() | ✓ Une seule source |
| useCandidate() | ProfileApi (user.id → profile.id) | Import direct | ✓ Une seule source |
| useCandidateProfileData() | useCandidate() + sub-hooks | Import direct | ✓ Composition unique |
| Guards | AuthContext.rolesResolved | useAuth() | ✓ Une seule source |
| Navigation | AuthContext.rolesResolved | useAuth() | ✓ Une seule source |

✅ **UN USER → UN CANDIDATE → UN COMPTE → UN ÉTAT COHÉRENT**

---

## 8. Résumé des doublures supprimées

| Doublure | Avant | Après | Économie |
|----------|-------|-------|----------|
| `useCandidateProfile` (deux fichiers) | 2 wrappers | 1 wrapper + 1 réexport | -1 redondance |
| Import wrapper dans CandidateProfileCenter | `useCandidateProfile()` | `useCandidate()` direct | -1 couche d'indirection |
| `isAuthenticated` dans useCandidate | Export inutile | Supprimé | -1 duplication d'état |
| Total | 3 doublures | 0 doublures | Clarité accrue |

---

## Conclusion

L'architecture du compte candidat est maintenant unifiée avec:
- ✅ Une source de vérité unique pour chaque concept
- ✅ Pas de doublures d'état
- ✅ Responsabilités claires et séparées
- ✅ Chaîne d'orchestration déterministe
- ✅ Comportement cohérent après refresh et logout
- ✅ Build sans erreurs
