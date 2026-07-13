# Phase 3.1 - Migration Candidates/Profile

## Fichiers créés
- src/features/candidates/api/profileApi.ts
- src/features/candidates/api/experiencesApi.ts
- src/features/candidates/api/educationApi.ts
- src/features/candidates/api/skillsApi.ts
- src/features/candidates/api/languagesApi.ts
- src/features/candidates/api/preferencesApi.ts
- src/features/candidates/api/documentsApi.ts
- src/features/candidates/api/types.ts
- src/features/candidates/api/index.ts

## Fichiers modifiés
- src/features/profile/services/profileService.ts
- src/features/profile/hooks/useCandidateProfile.ts
- src/features/profile/hooks/useCandidateExperiences.ts
- src/features/profile/hooks/useCandidateEducation.ts
- src/features/profile/hooks/useCandidateSkills.ts
- src/features/profile/hooks/useCandidateLanguages.ts
- src/features/profile/hooks/useCandidatePreferences.ts
- src/features/profile/types/index.ts
- src/integrations/supabase/candidate-auth.ts

## Responsabilités déplacées
- CRUD profil candidat vers features/candidates/api/profileApi.ts
- CRUD expériences vers features/candidates/api/experiencesApi.ts
- CRUD formations vers features/candidates/api/educationApi.ts
- CRUD compétences vers features/candidates/api/skillsApi.ts
- CRUD langues vers features/candidates/api/languagesApi.ts
- CRUD préférences vers features/candidates/api/preferencesApi.ts
- Point d’entrée profileService réorienté vers ces APIs

## Points encore à migrer
- authentification candidate (login/signup/logout/session/reset) vers une future feature authentication
- documents candidats et stockage vers une API candidates dédiée plus complète
- pages candidat pour les rendre de simples containers d’orchestration

## Phase 3.3 - Composants déplacés

- Déplacé UI candidat métier vers `src/features/candidates/components/`
	- `profile/` : `CandidateTopbar`, `CandidateSidebar`, `CandidateMobileHeader`
	- `dashboard/` : `CandidateDashboardSummary`
	- `documents/` : `CandidateDocumentsPanel`
	- `settings/` : `SecuritySettingsCard`, `AccountSettingsCard`

## Phase 3.4 - Pages simplifiées

- Simplification des pages candidat principales pour n'être que des containers :
	- `src/pages/candidate/CandidateCVPage.tsx` : orchestration via `features/candidates` components + `documentsApi`
	- `src/pages/candidate/CandidateSettingsPage.tsx` : orchestration via `SecuritySettingsCard` et `AccountSettingsCard`

## Phase 3.5 - Etat séparation auth / candidates

- `src/integrations/supabase/candidate-auth.ts` : conservé comme couche de compatibilité + services d'auth (signup/login/logout/session). CRUD candidats réorientés vers `features/candidates/api`.
### Phase 3.5 - Terminé

- `features/authentication/api/authApi.ts` créé : `loginCandidate`, `signupCandidate`, `logoutCandidate`, `getCandidateSession` (`getSession`), `requestPasswordReset`, `updatePassword`.
- `features/authentication/hooks/useAuth.ts` créé : hook pour `login`, `signup`, `logout`.
- `features/authentication/hooks/useSession.ts` créé : récupération de session + écoute des changements d'auth.
- `src/hooks/useCandidate.ts` transformé en proxy vers `features/candidates/hooks/useCandidate` pour compatibilité.
- `src/integrations/supabase/candidate-auth.ts` réduit : n'expose plus la logique métier candidate (CRUD) — ces fonctions sont désormais dans `features/candidates/api/`.

Build de production exécuté avec succès après les modifications.
## Remarques
- Build de production exécutée et validée après les modifications (vite build OK).
