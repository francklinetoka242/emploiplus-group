# Flux de récupération et d'affichage des documents — Site Web

## 1. Point d'entrée

**Route** : `http://localhost:5173/candidate/documents`  
**Page** : `src/pages/candidate/CandidateDocumentsPage.tsx`

## 2. Identification du candidat

1. Hook `useCandidate()` récupère l'identité via `auth.uid()` (Supabase Auth)
2. Appelle `getCandidateProfileByUserId(user.id)` 
3. Requête Supabase : `SELECT [..., cv_url, cv_text] FROM candidates WHERE user_id = auth.uid()`
4. Retourne `profile.id`, `profile.cv_url` (chemin Storage ou URL), `profile.cv_text` (pour IA)

## 3. Récupération des documents — Hiérarchie

Hook `useCandidateDocuments(profile?.id)` exécute cette hiérarchie :

### Étape 1 : LocalStorage
- Clé : `emploiplus-candidate-documents-${profileId}`
- Contenu JSON : `{ cv: CandidateCVState | null, documents: CandidateDocument[] }`
- Si présent → charge et utilise

### Étape 2 : Fallback serveur (CV uniquement)
Si localStorage vide et `profile.cv_url` existe :
- Si `cv_url` est une URL HTTP complète → utilise directement
- Si c'est un chemin Storage (ex: `candidates/{id}/cv/...pdf`) :
  - Appelle `supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(cv_url, 3600)`
  - Génère une URL signée valide 1 heure

### Étape 3 : État vide
Si aucun des deux → `{ cv: null, documents: [] }`

## 4. Types de documents et colonnes

### Document CV (`CandidateCVState`)
```
id, name, displayName, date, size, url
```
Stocké séparément en localStorage : clé `cv`

### Autres documents (`CandidateDocument[]`)
```
id, type, name, displayName, date, size, url, customType
```

**Types supportés** : `motivation`, `diploma`, `certificate`, `attestation`, `portfolio`, `recepisse`, `other`

**Distinction CV vs autres** :
- CV : type implicite, pas dans la liste `documents`
- Autres : type explicite, array `documents`

## 5. Stockage Supabase

### Bucket
- Variable : `CANDIDATE_DOCUMENTS_BUCKET` (depuis `src/services/storageService.ts`)
- Fallback : env var → `"public"`

### Chemins
- CV : `candidates/${candidateId}/cv/{timestamp}-{random}.pdf`
- Autres : `candidates/${candidateId}/documents/{timestamp}-{random}.pdf`

## 6. Upload de fichiers

Fonction : `uploadFileToStorage(file, folder, bucket, forceSignedUrl)`

1. Génère nom : `${folder}/${Date.now()}-${Math.random()}.${ext}`
2. Valide : type MIME = `application/pdf` uniquement, taille ≤ 2 Mo
3. Upload vers Supabase Storage avec cache 1 heure
4. Génère URL :
   - Par défaut : URL publique non expirante (si bucket public)
   - Sinon : URL signée valide 1 heure

## 7. Logique CV spécifique

### Upload CV
- Appelle `uploadAndProcessCandidateCV(candidateId, file)`
- Upload fichier → objet `CandidateCVState` avec URL
- Persist en localStorage immédiatement
- Déclenche `processCandidateCvUpload()` :
  - Extrait texte PDF
  - Sauvegarde `cv_text` en base (table `candidates`, colonne `cv_text`)
  - Sauvegarde chemin Storage en base (colonne `cv_url`)
- Émet CustomEvent `"cv-uploaded"` global pour notifier l'app

### Récupération CV
- Depuis localStorage `cv` → prioritaire
- Sinon depuis `profile.cv_url` → génère URL signée si nécessaire
- **Pas de requête Supabase pour récupérer la liste** (contrairement aux autres docs)

## 8. Logique documents complémentaires

### Upload
- Fonction : `uploadCandidateDocument(candidateId, file, type, customType?)`
- Crée objet `CandidateDocument` avec URL
- Ajoute en localStorage (array `documents`) via setter du hook

### Suppression
- Fonction : `deleteCandidateDocument(candidateId, id)`
- Filtre l'array `documents` en localStorage
- Supprime du state React

**Pas de suppression du fichier Storage** — fichier reste en storage, référence supprimée de localStorage

## 9. Affichage dans DocumentsSection

Composant : `src/features/profile/components/sections/DocumentsSection.tsx`

1. Reçoit `cv`, `documents` depuis hook
2. Combine en `allDocuments` (CV en premier)
3. Groupe par type dans `documentsByType` Map
4. Affiche UI avec :
   - CV en section distincte (si existant)
   - Autres docs groupés par type
   - Badges d'état (complet/non complet)
   - Boutons : Télécharger, Supprimer

## 10. Conditions d'affichage des documents

Un document apparaît si :
- ✅ `status` du candidat = `'active'` (dans table `candidates`)
- ✅ Existe dans localStorage `emploiplus-candidate-documents-${id}`
- ✅ Statut RLS Supabase `WHERE status = 'active'` (si lecture en base)

**Un document NE s'affiche PAS si** :
- ❌ localStorage vide et `cv_url` non renseigné
- ❌ JSON localStorage invalide (fallback à état vide)
- ❌ Candidat non authentifié ou `profile` null

## 11. Tables et colonnes consultées

**Table** : `public.candidates`  
**Colonnes** : 
- `user_id` (pour identification)
- `cv_url` (chemin Storage ou URL du CV)
- `cv_text` (texte extrait, pour IA)
- `status` (filtrage RLS)

**Pas d'autre table consultée** — pas de table `candidate_documents` en base

## 12. Différence Web vs Mobile

Web affiche correctement tous les documents car :
- Utilise localStorage directement (pas d'API backend)
- Pas de dépendance réseau pour lister les docs
- Récupération CV serveur fiable (fallback `cv_url`)

Mobile pourrait avoir besoin d'une API dédiée si localStorage n'est pas utilisé.
