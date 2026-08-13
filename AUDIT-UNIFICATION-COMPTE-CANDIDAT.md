# Audit d’unification du compte candidat

## 1. Objectif

L’objectif de cette unification est simple : faire converger toutes les lectures du compte candidat vers une seule source de vérité, sans modifier le parcours utilisateur ni le calcul de complétude lui-même.

La règle de base est :

- un même utilisateur authentifié doit correspondre à un seul candidat réel ;
- le profil doit être chargé via `user.id` vers la table `candidates` ;
- toutes les vues du profil doivent lire depuis ce même état ;
- les profils synthétiques ou les identifiants de repli ne doivent plus masquer la vraie candidature.

Le but n’est pas de corriger React #185, ni de réécrire le design. Le but est seulement d’unifier les logiques et les sources de données du compte candidat.

---

## 2. Problème architectural constaté

Le compte candidat était traversé par plusieurs représentations concurrentes :

- l’état auth principal ;
- le profil candidat principal dans [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) ;
- le profil candidat secondaire dans [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) ;
- des wrappers de service dans [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts) ;
- des données dérivées de documents, CV, expériences, formations, compétences, langues, préférences ;
- des fallback artificiels créés dans [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts).

Le symptôme principal est qu’un même compte peut afficher des valeurs de complétude ou de profil différentes selon l’ordre de chargement, le chemin de lecture et l’identifiant utilisé. La cause la plus évidente n’était pas la formule de complétude elle-même, mais la présence d’entrées de données hétérogènes et de profils plus ou moins factices.

---

## 3. Source de vérité unique retenue

Le point d’entrée canonique est désormais :

- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts)

Cette source lit la session AuthContext, récupère `user.id`, puis charge le candidat via :

- [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts)

La fonction principale est :

- `getCandidateProfileByUserId(userId)`

Elle interroge la table `candidates` avec le filtre `user_id = userId` et retourne le profil réel du candidat.

Cette logique devient la seule voie de chargement du profil candidat. Elle remplace les chemins de repli qui créaient un faux profil avec un `id` du type `fallback-{user.id}`.

---

## 4. Unification réalisée

### 4.1 Le hook de profil page est devenu un alias du hook principal

Le hook [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) a été unifié pour retourner directement le résultat de `useCandidate()`.

Avant :

- double state React ;
- re-fetch séparé ;
- écrasement possible de l’état par un profil différent.

Maintenant :

- un seul état `profile` ;
- un seul chemin de chargement ;
- un seul identifiant réel de candidat ;
- pas de profil secondaire indépendant.

### 4.2 Les fallback synthétiques ont été supprimés du flux principal

La fonction `getCandidateProfileByUserId` a été nettoyée pour ne plus générer de profil artificiel après timeout.

Avant :

- timeout de 2s ;
- fallback construit manuellement ;
- `id` non réel ;
- `user_id` parfois validé mais l’objet n’était pas la vraie ligne candidate.

Maintenant :

- si aucune ligne candidate n’existe, on retourne `null` ;
- aucune “pseudo-candidate” ne remplace la vraie donnée ;
- le rendu reste cohérent avec le vrai état du candidat.

### 4.3 Les identifiants de candidat sont désormais cohérents

Le système utilise désormais une logique claire :

- `auth.user.id` identifie l’utilisateur connecté ;
- `candidates.user_id` relie cet utilisateur à son profil candidate ;
- `candidates.id` est l’identifiant réel du candidat ;
- tout appel métier doit partir de cette même ligne candidate.

L’unification évite d’utiliser simultanément :

- `user.id`
- `baseProfile.id`
- `profile.id`
- `fallback-{id}`

comme s’il s’agissait des mêmes objets.

---

## 5. Pourquoi cela corrige les écarts de complétude

La complétude est un calcul dérivé et non une base de données. Le calcul est bien centralisé dans [src/features/profile/hooks/useProfileCompletion.ts](src/features/profile/hooks/useProfileCompletion.ts), mais il dépend des choses suivantes :

- `profile`
- `experiences`
- `educations`
- `skills`
- `languages`
- `preferences`

Si ces entrées proviennent de données incomplètes, d’états différents, ou d’un profil artificiel, le pourcentage varie même quand l’utilisateur est le même.

Avec l’unification :

- le profil est unique ;
- il est chargé depuis la même table ;
- il n’y a plus de doublon React entre le profil principal et le profil profil-page ;
- la complétude ne dépend plus d’un profil “secondaire” déconnecté du vrai candidat.

Autrement dit, le calcul reste inchangé, mais l’entrée de ce calcul est maintenant stable et cohérente.

---

## 6. Ce qui reste hors périmètre

Cette unification ne change pas :

- la formule de complétude ;
- les routes candidat ;
- les composants de UI ;
- les écrans de dashboard et login ;
- React #185.

React #185 est un souci séparé de la logique du compte candidat et ne doit pas être confondu avec ce diagnostic d’unification.

---

## 7. Conclusion

L’unification du compte candidat aboutit à une logique simple et robuste :

- un utilisateur authentifié ;
- un profil candidat réel ;
- un seul état de profil ;
- une seule source de vérité ;
- un seul chemin d’accès aux données du compte candidat.

La duplication architecturale qui faisait varier les valeurs de même compte est ainsi éliminée au niveau logique, sans toucher aux composants ni au calcul métier de la complétude.

---

## 8. Vérification

### 8.1 Audit des appels de chargement du profil

Recherche effectuée sur `getCandidateProfileByUserId`, `profileService.getProfile`, `useCandidateProfile`, `getCandidateProfile` :

**getCandidateProfileByUserId** (source canonique)
- Utilisée dans `useCandidate()` [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) ✓
- Utilisée dans `CandidateAuthService.login()` [src/integrations/supabase/candidate-auth.ts](src/integrations/supabase/candidate-auth.ts) ✓

**useCandidateProfile** (wrapper)
- Importée dans `CandidateProfileCenter` [src/features/profile/components/CandidateProfileCenter.tsx](src/features/profile/components/CandidateProfileCenter.tsx) ✓
- Retourne maintenant directement `useCandidate()` ✓

**getCandidateProfile** (API par ID)
- Utilisée dans `updateCandidateProfile()` pour vérifier l'état après update ✓
- Encapsulée dans `profileService.getProfile()` (wrapper non utilisé) ✓
- Encapsulée dans `candidateProfileService.getProfile()` (legacy, non utilisé) ✓

**profileService** (service wrapper)
- Contient uniquement des wrappers de sous-domaines (expériences, formations, compétences, etc.) ✓
- La fonction `getProfile()` n'est plus appelée depuis `useCandidateProfile` ✓
- Utilisée dans `useCandidateExperiences.ts` pour les expériences uniquement ✓

### 8.2 Audit des identifiants

Vérification de la chaîne d'identité :

```
Supabase auth user.id
        ↓
candidates.user_id
        ↓
candidate.id
        ↓
candidate_id (tables métier)
```

**Utilisation confirmée :**

| Identifiant | Utilisé pour | Fichier | Statut |
|---|---|---|---|
| `user.id` | Authentification | AuthContext | ✓ Correct |
| `user_id` | Lien candidates | profileApi | ✓ Correct |
| `candidate.id` | Identité métier candidat | useCandidate | ✓ Correct |
| `candidate_id` | Tables métier | educationApi, skillsApi, etc. | ✓ Correct |
| `fallback-*` | Synthétiques | ~~profileApi~~ | ✓ Supprimé |

**Aucune trace de synthétique `fallback-{user.id}` trouvée dans le code actif.**

### 8.3 Audit des sous-données du profil

Vérification que tous les hooks reçoivent correctement `candidate.id` :

| Hook | Paramètre | Utilisation |
|---|---|---|
| `useCandidateEducation` | `candidateId` | `getCandidateEducations(candidateId)` ✓ |
| `useCandidateSkills` | `candidateId` | `getCandidateSkills(candidateId)` ✓ |
| `useCandidateLanguages` | `candidateId` | `getCandidateLanguages(candidateId)` ✓ |
| `useCandidatePreferences` | `candidateId` | `getCandidatePreferences(candidateId)` ✓ |
| `useCandidateExperiences` | (via profileService) | `profileService.getExperiences(candidateId)` ✓ |
| `useCandidateDocuments` | `profileId` | `getCandidateDocuments(profileId)` → `candidate.id` ✓ |

Tous reçoivent le même `candidate.id` depuis `useCandidate().profile.id` ✓

### 8.4 Audit de la complétude

Vérification que la complétude reçoit un summary cohérent :

```
useCandidate()
      +
useCandidateEducation(candidate.id)
      +
useCandidateSkills(candidate.id)
      +
useCandidateLanguages(candidate.id)
      +
useCandidatePreferences(candidate.id)
      +
experiences(candidate.id)
      ↓
UN SUMMARY COHÉRENT
      ↓
useProfileCompletion()
      ↓
completionPercentage
```

**Vérification:** Le composant `CandidateProfileCenter` appelle correctement :

```typescript
const { profile } = useCandidateProfile(); // ← maintenant useCandidate()
const { educations } = useCandidateEducation(profile?.id);
const { skills } = useCandidateSkills(profile?.id);
const { languages } = useCandidateLanguages(profile?.id);
const { preferences } = useCandidatePreferences(profile?.id);
const completion = useProfileCompletion({
  profile,
  experiences,
  educations,
  skills,
  languages,
  preferences,
});
```

Pas de fallback, pas de double state, pas de profil synthétique. ✓

### 8.5 Validation de la compilation

Exécution : `npm run build`

Résultat : **✓ built in 5.69s**

Aucune erreur, aucun warning lié à l'unification. ✓

La compilation est valide après cette unification.

---

## 9. Fichiers modifiés

| Fichier | Modification | Raison |
|---|---|---|
| [src/features/candidates/hooks/useCandidateProfile.ts](src/features/candidates/hooks/useCandidateProfile.ts) | Retourne directement `useCandidate()` | Unification du profil principal |
| [src/features/profile/hooks/useCandidateProfile.ts](src/features/profile/hooks/useCandidateProfile.ts) | Retourne directement `useCandidate()` | Unification du profil principal |
| [src/features/candidates/api/profileApi.ts](src/features/candidates/api/profileApi.ts) | Suppression du fallback synthétique | Élimination des identifiants artificiels |

---

## 10. Fichiers conservés comme wrappers

| Fichier | Statut |
|---|---|
| [src/features/profile/services/profileService.ts](src/features/profile/services/profileService.ts) | Wrapper de sous-domaines (expériences, formations, etc.) |
| [src/shared/services/candidateProfileService.ts](src/shared/services/candidateProfileService.ts) | Legacy non utilisé, conservé pour compatibilité |

---

## 11. Duplications actives éliminées

| Duplication | État |
|---|---|
| Double state du profil (`useCandidate` + `useCandidateProfile`) | ✓ Éliminée |
| Double fetch du profil | ✓ Éliminé |
| Fallback synthétique `fallback-{user.id}` | ✓ Supprimé |
| Profil secondaire indépendant | ✓ Éliminé |

---

## 12. Identifiants dans le système

**Chaîne d'identité unique :**

```
Supabase Auth User
    ↓ (user.id)
candidates.user_id
    ↓ (lookup)
candidates.id = candidate.id
    ↓ (foreign key)
candidate_experience.candidate_id
candidate_education.candidate_id
candidate_skills.candidate_id
candidate_languages.candidate_id
candidate_preferences.candidate_id
candidature.candidate_id
saved_job_offers.candidate_id
```

Aucun mélange, aucun double identifiant, aucune création de pseudo-candidat. ✓

---

## 13. Points volontairement NON traités

Par design de cette tâche de consolidation :

- **React #185** : NON TRAITÉ (hors périmètre)
- **Design UI** : NON MODIFIÉ (routes, composants, animations inchangés)
- **Routes candidat** : NON MODIFIÉES (architecture de navigation stable)
- **Formule de complétude** : NON MODIFIÉE (calcul inchangé, seuls les inputs sont cohérents maintenant)
- **Logique métier** : NON MODIFIÉE sauf consolidation nécessaire
- **Base de données** : NON MODIFIÉE (tables, schéma, migrations inchangés)
- **Authentification** : NON MODIFIÉE (contexte auth, flows, permissions inchangés)
- **Permissions** : NON MODIFIÉES (RLS, policies inchangées)

---

## 14. Conclusion

L'unification du compte candidat a réussi. Le système possède maintenant :

✓ Une seule source de vérité pour le profil candidat  
✓ Une seule chaîne d'identité `user.id → candidate.id → candidate_id`  
✓ Zéro duplication active de chargement  
✓ Zéro identifiant synthétique  
✓ Zéro fallback artificiel  
✓ Pas de second état React du profil principal  
✓ Build sans erreur  

**Le même utilisateur authentifié correspond maintenant à une seule identité de candidat à travers tout le compte.**

---

## 15. Point de risque restant : React #185

React #185 est une problématique UI distincte et volontairement exclue de cette unification. Cette problématique concerne une incohérence affichage/rendu en React 19, pas une duplication de données ou d'identité.

La consolidation du compte candidat devrait réduire les causes potentielles de divergence (en unifiant les sources), mais React #185 doit être traité dans une tâche séparée, le cas échéant.
