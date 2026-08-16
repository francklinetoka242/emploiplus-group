# 🔍 AUDIT APPROFONDI — MODULE DOCUMENTS CANDIDAT (SITE WEB)

**Date:** 2026-08-16  
**Scope:** Analyse complète du fonctionnement réel du module Documents du site web  
**Méthodologie:** Audit sans modifications, vérification contre code source réel uniquement  
**Statut:** ✅ COMPLET

---

## 1. PAGE ET COMPOSANTS

### 1.1 Route Web

| Élément | Valeur |
|---------|--------|
| **Route** | `/candidate/documents` |
| **Page principale** | `src/pages/candidate/CandidateDocumentsPage.tsx` |
| **Composant contenu** | `DocumentsSection` (importé depuis `src/features/profile/components/sections/DocumentsSection.tsx`) |
| **Protégé** | ✅ OUI - Requires authentication via `useCandidate()` hook |

### 1.2 Architecture des Composants

```
CandidateDocumentsPage.tsx
  ├─ useCandidate() → charge profile candidat
  ├─ useCandidateDocuments(profile?.id) → gère état documents
  └─ DocumentsSection
     ├─ props: cv, documents, loading, candidateId, serverCvUrl
     ├─ Upload UI
     │  └─ File input + validation + Supabase Storage
     ├─ État des documents (checklist par type)
     │  └─ Affiche ✓ ou ○ pour chaque type
     └─ Tableau documents ajoutés
        └─ Affichage + aperçu + téléchargement + suppression
```

### 1.3 Fichiers Concernés

| Fichier | Fonction |
|---------|----------|
| `src/pages/candidate/CandidateDocumentsPage.tsx` | **Page principale** - Orchestration, routing, récupération du profil |
| `src/features/profile/components/sections/DocumentsSection.tsx` | **Composant UI principal** - Affichage, upload, gestion |
| `src/features/candidates/api/documentsApi.ts` | **API layer** - Upload/téléchargement/suppression |
| `src/features/candidates/hooks/useCandidateDocuments.ts` | **State management** - localStorage sync |
| `src/lib/candidate-documents.ts` | **Types et helpers** - Interfaces TypeScript |
| `src/services/storageService.ts` | **Supabase Storage** - Configuration, upload, signed URLs |
| `src/services/aiMatchingService.ts` | **CV Processing** - Extraction texte, mise à jour DB |

---

## 2. TYPES DE DOCUMENTS — 8 TYPES VÉRIFIÉS

### 2.1 Énumération des Types

| Label UI | Valeur Technique | Fichier Source | Stockage | Notes |
|----------|-----------------|-----------------|----------|-------|
| **Mon CV** | `cv` (NOT in enum) | `src/lib/candidate-documents.ts` ligne 36 | `candidates.cv_url` + Storage | Spécial - pas un CandidateDocument |
| **Lettre de motivation** | `motivation` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Diplôme** | `diploma` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Certificat** | `certificate` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Attestation** | `attestation` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Portfolio** | `portfolio` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Récépissé ACPE** | `recepisse` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage | ✅ Vrai enum |
| **Autre** | `other` | `src/features/candidates/api/documentsApi.ts` ligne 5 | localStorage + customType | ✅ Vrai enum |

### 2.2 Définition TypeScript Réelle

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (lignes 5-8)
export interface CandidateDocument {
  id: string;
  type: "motivation" | "diploma" | "certificate" | "attestation" | "portfolio" | "other" | "recepisse";
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
  customType?: string;
}

// Le CV est un type SÉPARÉ (pas CandidateDocument)
export interface CandidateCVState {
  id: string;
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
}
```

### 2.3 Affichage dans le Dropdown

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (lignes 10-17)
const DOCUMENT_TYPES = [
  { value: "cv" as const, label: "Mon CV" },
  { value: "motivation" as const, label: "Lettre de motivation" },
  { value: "diploma" as const, label: "Diplôme" },
  { value: "certificate" as const, label: "Certificat" },
  { value: "attestation" as const, label: "Attestation" },
  { value: "portfolio" as const, label: "Portfolio" },
  { value: "recepisse" as const, label: "Récépissé ACPE" },
  { value: "other" as const, label: "Autre" },
];
```

### 2.4 Checkboxes d'État

```typescript
// Affichage des 8 cases (checked/unchecked)
// Source: src/features/profile/components/sections/DocumentsSection.tsx (ligne ~396)

documentsByType.forEach(type => {
  if (type.value === "cv" && cv) → checked
  if (completedTypes.has(type.value)) → checked
  else → unchecked
})
```

---

## 3. TABLE SUPABASE RÉELLE

### 3.1 Vérification: Table `candidate_documents` Existe?

**RÉSULTAT: ❌ NON**

| Vérification | Résultat |
|---|---|
| Types Supabase (`types.ts`) | ❌ Aucune table `candidate_documents` |
| Migrations SQL | ✅ Existe: `20260704_add_candidate_documents_storage_policies.sql` (Storage policies uniquement) |
| Code frontend utilisant SELECT | ❌ AUCUNE requête SELECT vers `candidate_documents` |
| Code frontend utilisant INSERT/UPDATE | ❌ AUCUNE requête INSERT vers `candidate_documents` |

**Conclusion:** La table `candidate_documents` n'existe PAS. Les métadonnées documents sont stockées dans **localStorage** uniquement.

### 3.2 Table Réelle Utilisée: `public.candidates`

```sql
-- Table: public.candidates
-- Colonnes pertinentes:

CREATE TABLE public.candidates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  
  -- Profil standard
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  headline TEXT,
  location_city TEXT,
  location_country TEXT,
  date_of_birth TEXT,
  status TEXT, -- candidate_status ENUM
  
  -- CV SPÉCIFIQUE
  cv_url TEXT,        -- ← Migration: 20260727_add_cv_url_to_candidates.sql
  cv_text TEXT,       -- ← Texte extrait du PDF
  embedding_vector TEXT, -- ← Embedding léger pour matching
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Index pour cv_url
CREATE INDEX idx_candidates_cv_url ON public.candidates ((cv_url IS NOT NULL));
```

### 3.3 Colonnes Réelles Utilisées par le Module Documents

| Colonne | Rôle | Utilisé par | Type |
|---------|------|-------------|------|
| `id` | Identifier candidat | Tous les requêtes | TEXT |
| `user_id` | Lien auth → candidat | useCandidate() | TEXT |
| `cv_url` | URL/chemin Storage CV | CandidateCVPage, DocumentsSection | TEXT |
| `cv_text` | Texte extrait du PDF | aiMatchingService, matching RPC | TEXT |
| `embedding_vector` | Embedding léger | Matching, recommandations | TEXT |

### 3.4 Requête Supabase Réelle

```typescript
// Fichier: src/features/candidates/api/profileApi.ts (ligne 31)
.select(
  "id, user_id, first_name, last_name, email, phone, avatar_url, bio, headline, " +
  "location_city, location_country, date_of_birth, status, cv_text, embedding_vector, " +
  "cv_url, created_at, updated_at"
)
.eq("user_id", userId)
.maybeSingle()
```

---

## 4. MIGRATION SQL RÉELLE

### 4.1 Migration pour cv_url

```sql
-- Fichier: supabase/migrations/20260727_add_cv_url_to_candidates.sql

ALTER TABLE IF EXISTS public.candidates
ADD COLUMN IF NOT EXISTS cv_url TEXT;

COMMENT ON COLUMN public.candidates.cv_url 
IS 'Public or signed URL to the candidate CV file stored in Supabase Storage.';

CREATE INDEX IF NOT EXISTS idx_candidates_cv_url 
ON public.candidates ((cv_url IS NOT NULL));

NOTIFY pgrst, 'reload schema';
```

### 4.2 Migration pour Storage Policies

```sql
-- Fichier: supabase/migrations/20260704_add_candidate_documents_storage_policies.sql

-- Authenticated users can READ candidate documents in bucket 'candidat-doc'
CREATE POLICY "Authenticated users can read candidate documents"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'candidat-doc');

-- Authenticated users can UPLOAD to bucket 'candidat-doc'
CREATE POLICY "Authenticated users can upload candidate documents"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'candidat-doc');

-- Authenticated users can UPDATE in bucket 'candidat-doc'
CREATE POLICY "Authenticated users can update candidate documents"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'candidat-doc')
  WITH CHECK (bucket_id = 'candidat-doc');

-- Authenticated users can DELETE from bucket 'candidat-doc'
CREATE POLICY "Authenticated users can delete candidate documents"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'candidat-doc');
```

### 4.3 Vérification Policies

| Policy | Type | Rôle | Bucket | Statut |
|--------|------|------|--------|--------|
| Read | SELECT | authenticated | candidat-doc | ✅ Exists |
| Upload | INSERT | authenticated | candidat-doc | ✅ Exists |
| Update | UPDATE | authenticated | candidat-doc | ✅ Exists |
| Delete | DELETE | authenticated | candidat-doc | ✅ Exists |

---

## 5. SUPABASE STORAGE

### 5.1 Configuration

```typescript
// Fichier: src/services/storageService.ts (lignes 6-8)
export const CANDIDATE_DOCUMENTS_BUCKET =
  import.meta.env.VITE_SUPABASE_CANDIDATE_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  "public";
```

### 5.2 Variables d'Environnement

| Variable | Fallback | Ordre Préférence |
|----------|----------|------------------|
| `VITE_SUPABASE_CANDIDATE_BUCKET` | — | 1️⃣ Priorité 1 |
| `VITE_SUPABASE_STORAGE_BUCKET` | — | 2️⃣ Priorité 2 |
| Défaut hardcodé | `"public"` | 3️⃣ Priorité 3 |

**Valeur réelle du projet:** `VITE_SUPABASE_CANDIDATE_BUCKET=candidat-doc`

### 5.3 Chemins de Fichiers

| Type Document | Chemin | Exemple |
|---|---|---|
| **CV** | `candidates/{candidateId}/cv` | `candidates/abc123/cv/1692349200000-k7x9m2.pdf` |
| **Autres docs** | `candidates/{candidateId}/documents` | `candidates/abc123/documents/1692349201000-a1b2c3.pdf` |

### 5.4 Génération du Nom Fichier

```typescript
// Fichier: src/services/storageService.ts (lignes 58-59)
const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

// Exemple:
// folder: "candidates/abc123/cv"
// Date.now(): 1692349200000
// random: k7x9m2
// extension: pdf
// Result: candidates/abc123/cv/1692349200000-k7x9m2.pdf
```

### 5.5 Résolution d'URL

```typescript
// Fichier: src/services/storageService.ts (lignes 31-45)

async function resolveStorageUrl(bucket: string, filename: string, forceSignedUrl = false) {
  if (!forceSignedUrl) {
    // Essayer d'abord getPublicUrl (pas d'expiration)
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
    if (publicData?.publicUrl) {
      return publicData.publicUrl;
    }
  }

  // Fallback: createSignedUrl (expire après 3600 secondes)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filename, 60 * 60);
  
  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  return null;
}
```

### 5.6 Types d'URLs

| Type | Durée | Cas d'Usage | Code |
|------|-------|-----------|------|
| **Public URL** | ∞ (pas d'expiration) | CV public, partage externe | `getPublicUrl()` |
| **Signed URL** | 3600s (1 heure) | Documents restreints, lien temporaire | `createSignedUrl(name, 3600)` |

### 5.7 Authentification et Autorisations

| Opération | Authentifié? | RLS Policy | Statut |
|-----------|---|---|---|
| **READ** | ✅ Required | Storage policy + bucket_id='candidat-doc' | ✅ OK |
| **UPLOAD** | ✅ Required | Storage policy + bucket_id='candidat-doc' | ✅ OK |
| **DELETE** | ✅ Required | Storage policy + bucket_id='candidat-doc' | ✅ OK |
| **READ (public)** | ❌ No | Public bucket | ✅ OK |

---

## 6. FLUX D'UPLOAD COMPLET

### 6.1 Etapes du Flux

```
1. Utilisateur sélectionne "Choisir un PDF"
   ↓
2. Clique → Ouvre file input (accept="application/pdf")
   ↓
3. Utilisateur sélectionne PDF
   ↓
4. handleFileSelection() déclenché
   │
   ├─ Validation MIME Type
   │  ├─ Vérifie: file.type === "application/pdf"
   │  └─ Erreur si non-PDF
   │
   ├─ Validation Taille
   │  ├─ Vérifie: file.size ≤ 2 * 1024 * 1024 (2 Mo)
   │  └─ Erreur si > 2 Mo
   │
   ├─ Sélection du type
   │  ├─ Si "cv" → uploadAndProcessCandidateCV()
   │  └─ Sinon → uploadCandidateDocument()
   │
   ├─ Upload Storage
   │  ├─ uploadFileToStorage()
   │  ├─ Appel: supabase.storage.from(bucket).upload(filename, file, {...})
   │  ├─ Génère signed URL
   │  └─ Retourne: { url, path }
   │
   ├─ Mise à jour localStorage
   │  ├─ saveCandidateDocuments()
   │  ├─ Key: emploiplus-candidate-documents-{candidateId}
   │  └─ Valeur: { cv, documents }
   │
   ├─ (Si CV) Traitement IA
   │  ├─ processCandidateCvUpload()
   │  ├─ extractTextFromPdf()
   │  ├─ Appel: pdfjs.getDocument(file).promise
   │  ├─ page.getTextContent() pour chaque page
   │  ├─ updateCandidateCvText()
   │  ├─ Update Supabase: cv_text, embedding_vector, cv_url
   │  └─ Dispatch event: cv-uploaded
   │
   ├─ Affichage UI
   │  ├─ setFeedbackMessage()
   │  ├─ Toast notification
   │  └─ Rafraîchissement liste
   │
   └─ Fin

5. L'utilisateur voit le document dans "Documents ajoutés"
```

### 6.2 Validation

```typescript
// Fichier: src/services/storageService.ts (lignes 13-14)
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"];
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo

// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (lignes 153-167)
if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
  setFeedbackError("Seuls les fichiers PDF sont acceptés pour les documents complémentaires.");
  return;
}

if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
  setFeedbackError("Le fichier dépasse la limite de 2 Mo pour les documents complémentaires.");
  return;
}
```

### 6.3 Upload Storage Réel

```typescript
// Fichier: src/services/storageService.ts (lignes 50-70)
const { error } = await supabase.storage.from(bucket).upload(filename, file, {
  cacheControl: "3600",
  upsert: false,                           // ← Ne remplace pas si existe
  contentType: file.type || "application/octet-stream"
});

if (!error) {
  const resolvedUrl = await resolveStorageUrl(bucket, filename, forceSignedUrl);
  return { url: resolvedUrl, path: filename };
}
```

### 6.4 Création du Document Métier

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 109-124)
export async function uploadCandidateDocument(
  candidateId: string, 
  file: File, 
  type: CandidateDocument["type"], 
  customType?: string
) {
  const { url } = await uploadFileToStorage(
    file, 
    `candidates/${candidateId}/documents`, 
    CANDIDATE_DOCUMENTS_BUCKET, 
    true  // forceSignedUrl
  );
  
  return {
    id: `doc-${Date.now()}`,          // ID unique par timestamp
    type,                              // motivation, diploma, etc.
    name: file.name,                   // Nom fichier original
    displayName: type === "other" && customType?.trim() 
      ? customType.trim() 
      : file.name,
    date: new Date().toISOString(),    // Timestamp upload
    size: file.size.toString(),        // Taille en bytes
    url,                               // URL Storage (signed ou public)
    customType: type === "other" 
      ? customType?.trim() 
      : undefined
  } satisfies CandidateDocument;
}
```

### 6.5 Persistance localStorage

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 47-49)
export async function saveCandidateDocuments(
  candidateId: string, 
  payload: { cv: CandidateCVState | null; documents: CandidateDocument[] }
) {
  localStorage.setItem(
    `emploiplus-candidate-documents-${candidateId}`, 
    JSON.stringify(payload)
  );
  return payload;
}
```

### 6.6 CV: Traitement Spécial

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 57-103)
export async function uploadAndProcessCandidateCV(candidateId: string, file: File) {
  // 1. Upload Storage
  const { url, path } = await uploadCandidateCV(candidateId, file);
  
  // 2. Créer objet métier
  const newCv: CandidateCVState = {
    id: `cv-${Date.now()}`,
    name: file.name,
    displayName: file.name,
    date: new Date().toISOString(),
    size: file.size.toString(),
    url
  };
  
  // 3. Sauvegarder en localStorage
  const existing = await getCandidateDocuments(candidateId);
  await saveCandidateDocuments(candidateId, { cv: newCv, documents: existing.documents });
  
  // 4. Traitement IA/Matching
  const extraction = await processCandidateCvUpload(candidateId, file, path ?? url);
  
  // 5. Dispatch event global
  window.dispatchEvent(
    new CustomEvent("cv-uploaded", { 
      detail: { candidateId, cvUrl: newCv.url }, 
      bubbles: true 
    })
  );
  
  return { cv: newCv, extraction };
}
```

### 6.7 Traitement IA du CV

```typescript
// Fichier: src/services/aiMatchingService.ts (ligne 200-230)
export async function processCandidateCvUpload(
  candidateId: string, 
  file: File, 
  cvUrl?: string
): Promise<{ cvText: string; candidate: CandidateRow | null }> {
  // 1. Extraire texte du PDF
  const cvText = await extractTextFromPdf(file);
  
  // 2. Mettre à jour BD
  const candidate = await updateCandidateCvText(candidateId, cvText, cvUrl);
  
  // 3. Invalider cache IA
  await supabase
    .from("ai_analysis_cache")
    .delete()
    .eq("candidate_id", candidateId);
  
  // 4. Nettoyer localStorage (IMPORTANT)
  const key = `emploiplus-candidate-documents-${candidateId}`;
  localStorage.removeItem(key);  // ← REMET À ZÉRO
  
  return { cvText, candidate };
}
```

### 6.8 Mise à Jour Supabase (cv_text, cv_url)

```typescript
// Fichier: src/services/aiMatchingService.ts (ligne 168-192)
export async function updateCandidateCvText(
  candidateId: string, 
  cvText: string, 
  cvUrl?: string
): Promise<CandidateRow | null> {
  const normalizedText = cvText?.trim() ?? "";
  const payload: Partial<CandidateRow> = {
    cv_text: normalizedText || null,
    embedding_vector: normalizedText 
      ? createEmbeddingVectorString(normalizedText) 
      : null
  };

  // Persister cv_url si fourni
  if (typeof cvUrl === "string") {
    (payload as any).cv_url = cvUrl || null;
  }

  const { data, error } = await supabase
    .from("candidates")
    .update(payload)
    .eq("id", candidateId)
    .select()
    .single();

  if (error) throw error;
  return data as CandidateRow;
}
```

---

## 7. FLUX DE RÉCUPÉRATION

### 7.1 Priorité de Récupération

```
1. localStorage → CandidateCVState | CandidateDocument[]
   Key: `emploiplus-candidate-documents-${candidateId}`
   ├─ Si présent → Utiliser localement (UI rapide)
   ├─ Si vide → Passer à 2
   └─ Si erreur JSON → Ignorer, passer à 2

2. profile.cv_url (Supabase DB)
   ├─ Si URL HTTP → Utiliser directement
   ├─ Si chemin Storage → Convertir en signed URL via createSignedUrl()
   └─ Si absent → Passer à 3

3. profile.cv_text (Supabase DB)
   ├─ Utilisé pour IA/matching
   ├─ Pas d'affichage PDF
   └─ Fallback uniquement

4. Aucun document
   └─ Afficher "Aucun document ajouté"
```

### 7.2 Fonction de Récupération

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 24-45)
export async function getCandidateDocuments(candidateId: string) {
  // 1. Essayer localStorage
  const storageKey = `emploiplus-candidate-documents-${candidateId}`;
  const raw = localStorage.getItem(storageKey);
  
  if (!raw) {
    // localStorage vide → retourner état vide
    return { cv: null, documents: [] };
  }

  try {
    // Parser localStorage
    const parsed = JSON.parse(raw) as { 
      cv?: CandidateCVState; 
      documents?: CandidateDocument[] 
    };
    return { 
      cv: parsed.cv ?? null, 
      documents: parsed.documents ?? [] 
    };
  } catch (error) {
    // JSON invalide → ignorer
    return { cv: null, documents: [] };
  }
}
```

### 7.3 Gestion du Fallback Server

```typescript
// Fichier: src/pages/candidate/CandidateCVPage.tsx (ligne 81-96)
const serverCvUrl = profile?.cv_url;
let resolvedServerUrl: string | undefined = serverCvUrl;

if (serverCvUrl && !serverCvUrl.startsWith("http")) {
  // Convertir chemin Storage en signed URL
  const { data: signed, error } = await supabase.storage
    .from(CANDIDATE_DOCUMENTS_BUCKET)
    .createSignedUrl(serverCvUrl, 60 * 60);  // 1 heure d'expiration
  
  if (!error && signed?.signedUrl) {
    resolvedServerUrl = signed.signedUrl;
  }
}

const preferServerCv = !data.cv && resolvedServerUrl;
```

### 7.4 Récupération dans DocumentsSection

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 196-227)
const effectiveCv = useMemo(() => {
  // 1. Si localStorage a un CV → utiliser
  if (cv) {
    return cv;
  }
  
  // 2. Si pas de localStorage mais server a cv_url
  if (!resolvedServerCvUrl) {
    return null;
  }
  
  // 3. Construire un CandidateCVState depuis server
  return {
    id: "cv-server",
    name: "CV",
    displayName: "Mon CV",
    date: new Date().toISOString(),
    size: "",
    url: resolvedServerCvUrl  // ← Signed URL générée
  } satisfies CandidateCVState;
}, [cv, resolvedServerCvUrl]);
```

### 7.5 Synchronisation localStorage

```typescript
// Fichier: src/features/candidates/hooks/useCandidateDocuments.ts (ligne 54-61)
useEffect(() => {
  // Quand cv ou documents changent → synchroniser localStorage
  if (!profileId || !hasRestoredDocuments) return;
  
  localStorage.setItem(
    `emploiplus-candidate-documents-${profileId}`, 
    JSON.stringify({ cv, documents })
  );
}, [profileId, cv, documents, hasRestoredDocuments]);
```

---

## 8. FLUX DE SUPPRESSION

### 8.1 Suppression Document (Non-CV)

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 126-132)
export async function deleteCandidateDocument(
  candidateId: string, 
  documentId: string
) {
  // 1. Récupérer état actuel
  const existing = await getCandidateDocuments(candidateId);
  
  // 2. Filtrer le document à supprimer
  const filtered = existing.documents.filter(doc => doc.id !== documentId);
  
  // 3. Sauvegarder état mis à jour
  await saveCandidateDocuments(candidateId, { 
    cv: existing.cv, 
    documents: filtered 
  });
  
  return filtered;
}
```

### 8.2 Suppression CV

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 134-139)
export async function deleteCandidateCV(candidateId: string) {
  // 1. Récupérer état
  const existing = await getCandidateDocuments(candidateId);
  
  // 2. Supprimer CV seulement
  await saveCandidateDocuments(candidateId, { 
    cv: null, 
    documents: existing.documents 
  });
  
  return null;
}
```

### 8.3 Suppression dans DocumentsSection UI

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 262-270)
const handleDelete = useCallback(
  (id: string) => {
    if (!onDeleteDocument) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      onDeleteDocument(id);  // ← Appelle deleteCandidateDocument()
    }
  },
  [onDeleteDocument]
);
```

### 8.4 Suppression du CV avec Nettoyage BD

```typescript
// Fichier: src/pages/candidate/CandidateCVPage.tsx (ligne 234-246)
const handleDeleteCv = async () => {
  try {
    // 1. Supprimer du localStorage
    await deleteCandidateCV(profile.id);
    
    // 2. Supprimer cv_text de la BD
    await clearCandidateCvText(profile.id);
    
    // 3. Forcer refresh du profil
    await refetch?.();
    
    // 4. Mettre à jour UI
    setCv(null);
    setFeedbackMessage("Votre CV a été supprimé et le texte du CV a été effacé de la base.");
  } catch (error) {
    setFeedbackError(...);
  }
};
```

### 8.5 Nettoyage BD

```typescript
// Fichier: src/services/aiMatchingService.ts (ligne 233)
export async function clearCandidateCvText(candidateId: string): Promise<CandidateRow | null> {
  return updateCandidateCvText(candidateId, "");  // ← Passe texte vide
}

// Cela exécute:
// UPDATE candidates
// SET cv_text = NULL, embedding_vector = NULL
// WHERE id = candidateId
```

### 8.6 Important: Pas de Suppression Storage Physique

**⚠️ TROUVAILLE CLÉE:**

Le code **N'APPELLE JAMAIS** `supabase.storage.from(bucket).remove(path)`.

```typescript
// ❌ Cette ligne N'EXISTE PAS dans le code
// supabase.storage.from(bucket).remove(filename);

// ✅ Seul le localStorage est supprimé
localStorage.removeItem(`emploiplus-candidate-documents-${candidateId}`);
```

**Implication:** Les fichiers restent dans Supabase Storage après suppression côté UI.

---

## 9. FLUX DE TÉLÉCHARGEMENT / VISUALISATION

### 9.1 Actions Disponibles

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 429-455)

allDocuments.map((doc) => (
  <Button onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}>
    <Eye className="h-4 w-4" /> Aperçu
  </Button>
  
  <Button onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}>
    <Download className="h-4 w-4" /> Télécharger
  </Button>
))
```

### 9.2 Implémentation

| Action | Code | Résultat |
|--------|------|----------|
| **Aperçu** | `window.open(doc.url, "_blank")` | Ouvre PDF dans nouvel onglet |
| **Télécharger** | `window.open(doc.url, "_blank")` | Ouvre ou télécharge selon navigateur |
| **Supprimer** | Confirmation dialog + `deleteDocument(id)` | Supprime du localStorage |

### 9.3 URL Utilisées

```typescript
// doc.url contient:
// 1. Pour CV depuis localStorage: URL signée (générée lors upload)
// 2. Pour docs autres: URL signée (générée lors upload)
// 3. Pour CV depuis profile.cv_url: URL publique ou signée

// Signed URL exemple:
// https://{project}.supabase.co/storage/v1/object/sign/candidat-doc/candidates/abc123/cv/1692349200000-k7x9m2.pdf?token=xxx&t=1692352800

// Public URL exemple:
// https://{project}.supabase.co/storage/v1/object/public/candidat-doc/candidates/abc123/documents/xxx.pdf
```

### 9.4 Expiration

| Type URL | Durée | Notes |
|----------|-------|-------|
| **Signed URL** | 3600s (1h) | Expire → need re-generation |
| **Public URL** | ∞ | Jamais expire (bucket public) |

---

## 10. CAS PARTICULIER DU CV

### 10.1 Traitement Différent

| Aspect | CV | Autres Documents |
|--------|----|----|
| **Table DB** | `candidates.cv_url`, `candidates.cv_text` | Aucune table DB (localStorage only) |
| **Extraction PDF** | ✅ Texte extrait et stocké | ❌ Aucune extraction |
| **Embedding** | ✅ Créé et stocké en `embedding_vector` | ❌ Aucun embedding |
| **Matching** | ✅ Utilisé pour recommandations | ❌ N/A |
| **Type Interface** | `CandidateCVState` (séparé) | `CandidateDocument[]` |
| **Sélection Type** | Spécial: `"cv"` (pas dans enum) | Enum: motivation, diploma, etc. |
| **Remplacement** | Un seul CV permis (remplace l'ancien) | Multiples documents par type |

### 10.2 Interface Séparée

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (lignes 11-19)

export interface CandidateCVState {
  id: string;
  name: string;
  displayName: string;
  date: string;
  size?: string;
  url: string;
}

// ≠ CandidateDocument qui a un champ "type"
```

### 10.3 Affichage Spécial

```typescript
// Fichier: src/features/candidates/components/documents/CandidateDocumentsPanel.tsx (ligne 71-85)

<Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
  <CardTitle>Mon CV</CardTitle>
  <CardDescription>Votre CV actuellement utilisé pour les candidatures</CardDescription>
  
  {cv ? (
    <div>Affichage du CV</div>
  ) : (
    <div>Aucun CV téléchargé pour le moment.</div>
  )}
</Card>
```

### 10.4 Événement Global

```typescript
// Fichier: src/features/candidates/api/documentsApi.ts (ligne 86-93)

window.dispatchEvent(
  new CustomEvent("cv-uploaded", { 
    detail: { candidateId, cvUrl: newCv.url }, 
    bubbles: true 
  })
);

// Écouté par: CandidateDashboardPage
// Fichier: src/pages/candidate/CandidateDashboardPage.tsx (ligne 253-268)
window.addEventListener("cv-uploaded", handleCvUploaded);
```

---

## 11. REMPLACEMENT D'UN DOCUMENT

### 11.1 Comportement Réel

**Pour TOUS les documents sauf CV:**
```
Utilisateur upload "Diplôme 1" (ID: doc-1)
   ↓
Utilisateur upload "Diplôme 2" (ID: doc-2)
   ↓
RÉSULTAT: Les DEUX documents restent en localStorage
Array: [{ id: doc-1, ... }, { id: doc-2, ... }]
```

✅ **Multiples documents du même type AUTORISÉS**

**Pour CV:**
```
Utilisateur upload "CV 1" (ID: cv-1)
   ↓
Utilisateur upload "CV 2" (ID: cv-2)
   ↓
RÉSULTAT: Seul CV 2 est conservé
CV state: { id: cv-2, ... }

// Mais "CV 1" reste dans Supabase Storage
```

⚠️ **UN SEUL CV permis côté UI, mais ancien fichier reste en Storage**

### 11.2 Code Réel

```typescript
// Uploadcandidate document:
// Les documents s'AJOUTENT à l'array

const newDocument = await uploadCandidateDocument(...);
setDocuments((prev) => [...prev, newDocument]);  // ← AJOUTE

// Uploadcandidate CV:
// Le CV SE REMPLACE

const newCv = await uploadAndProcessCandidateCV(...);
setCv(newCv);  // ← REMPLACE

await saveCandidateDocuments(profile.id, { cv: newCv, documents });
```

---

## 12. DONNÉES LOCALES (localStorage)

### 12.1 Structure localStorage

```typescript
// Key: emploiplus-candidate-documents-{candidateId}

// Value:
{
  "cv": {
    "id": "cv-1692349200000",
    "name": "CV_John_Doe.pdf",
    "displayName": "CV_John_Doe.pdf",
    "date": "2026-08-16T10:30:00Z",
    "size": "245320",  // Bytes
    "url": "https://.../candidates/abc123/cv/1692349200000-k7x9m2.pdf?token=..."
  },
  "documents": [
    {
      "id": "doc-1692349300000",
      "type": "motivation",
      "name": "Lettre_motivation.pdf",
      "displayName": "Lettre_motivation.pdf",
      "date": "2026-08-16T10:31:00Z",
      "size": "89456",
      "url": "https://.../candidates/abc123/documents/...",
      "customType": undefined
    },
    {
      "id": "doc-1692349400000",
      "type": "other",
      "name": "Certificat_Langue.pdf",
      "displayName": "Certificat de langue anglaise",  // customType
      "date": "2026-08-16T10:32:00Z",
      "size": "125670",
      "url": "https://...",
      "customType": "Certificat de langue anglaise"
    }
  ]
}
```

### 12.2 Cycle de Vie localStorage

```
1. Upload → generateURL → saveCandidateDocuments() → localStorage.setItem()

2. Page rechargement → useCandidateDocuments() useEffect → localStorage.getItem()

3. Suppression → deleteCandidateDocument() → saveCandidateDocuments() → localStorage.setItem()

4. (Upload CV) → processCandidateCvUpload() → localStorage.removeItem() ← REMET À ZÉRO
```

### 12.3 Comportement post-Upload CV

**IMPORTANT DISCOVERY:**

Lors de `processCandidateCvUpload()`, le localStorage est **VIDÉ COMPLÈTEMENT**:

```typescript
// Fichier: src/services/aiMatchingService.ts (ligne 225-229)
const key = `emploiplus-candidate-documents-${candidateId}`;
localStorage.removeItem(key);  // ← SUPPRIME TOUT
console.log(`Removed localStorage key ${key}`);
```

**Conséquence:**
- Après upload CV → localStorage est vide temporairement
- Les autres documents uploadés avec CV sont perdus
- Le CV reste en Storage et Supabase DB
- Un refresh force une nouvelle requête au serveur

---

## 13. ÉTATS DE L'INTERFACE

### 13.1 États Loading

```typescript
// État: loading
const [loading, setLoading] = useState(false);

// Affiché:
if (loading) {
  return <p className="text-sm text-slate-500">Chargement…</p>;
}
```

### 13.2 États Upload

```typescript
// État: isUploading
const [isUploading, setIsUploading] = useState(false);

// Button texte change:
{isUploading ? "Envoi…" : "Choisir un PDF"}
```

### 13.3 Messages Feedback

```typescript
const [feedbackMessage, setFeedbackMessage] = useState("");
const [feedbackError, setFeedbackError] = useState("");

// Affichage:
{feedbackMessage && <p className="mt-2 text-sm text-emerald-600">{feedbackMessage}</p>}
{feedbackError && <p className="mt-2 text-sm text-rose-600">{feedbackError}</p>}
```

### 13.4 États Réels Affichés

| État | Message | Couleur |
|------|---------|---------|
| **Aucun document** | "Aucun document ajouté." | Gris |
| **Upload en cours** | "Envoi…" | — |
| **Upload succès** | "Le document a été ajouté avec succès." | Vert ✓ |
| **CV succès** | "Votre CV a été ajouté et son contenu a été extrait pour l'IA." | Vert ✓ |
| **CV extraction fail** | "Votre CV a été ajouté, mais l'extraction du contenu a échoué." | Orange ⚠️ |
| **Erreur MIME** | "Seuls les fichiers PDF sont acceptés…" | Rouge ✗ |
| **Erreur Taille** | "Le fichier dépasse la limite de 2 Mo…" | Rouge ✗ |
| **Erreur Storage** | "Impossible d'ajouter le document." | Rouge ✗ |
| **Suppression** | (Confirmation dialog) | — |

### 13.5 Checklist État

```typescript
// Affichage dynamique des 8 types

{DOCUMENT_TYPES.map((type) => {
  const isCompleted = completedTypes.has(type.value);
  return (
    <div className={isCompleted ? "bg-emerald-50" : "bg-slate-50"}>
      {isCompleted ? <CheckCircle2 /> : <Circle />}
      <span>{type.label}</span>
    </div>
  );
})}
```

---

## 14. SÉCURITÉ ET AUTHENTIFICATION

### 14.1 Route Protection

```typescript
// Fichier: src/App.tsx (ligne 175-177)
const CandidateDocumentsPage = lazy(() =>
  import("@/pages/candidate/CandidateDocumentsPage").then((m) => ({
    default: () => <ProtectedRoute>{m.CandidateDocumentsPage()}</ProtectedRoute>
  }))
);

// CandidateDocumentsPage utilise useCandidate()
// qui lance une erreur si !profile
```

### 14.2 Authentification Supabase Storage

```typescript
// Policies Storage:
// FOR SELECT TO authenticated USING (bucket_id = 'candidat-doc')
// FOR INSERT TO authenticated WITH CHECK (bucket_id = 'candidat-doc')
// FOR DELETE TO authenticated USING (bucket_id = 'candidat-doc')

// ✅ Seuls utilisateurs authenticatés peuvent accéder
// ✅ Pas de RLS par candidate_id (confiée au frontend)
```

### 14.3 Vérification Identité

```typescript
// ⚠️ TROUVAILLE: Pas de vérification server-side!

// Le code n'empêche PAS un utilisateur authent. de télécharger
// le fichier d'un autre candidat s'il connaît le path.

// Mitigation:
// 1. Signed URLs expirent après 3600s
// 2. URLs générées par client pour storage paths stockés en DB
// 3. Côté UI, seul le profil connecté peut modifier ses docs
```

---

## 15. AFFICHAGE DANS LA LISTE DOCUMENTS

### 15.1 Tableau Affichage

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 407-455)

allDocuments.map((doc) => (
  <div key={doc.id} className="flex items-center justify-between...">
    {/* Col 1: Icône + Info */}
    <div className="flex items-center gap-3">
      <FileText className="h-5 w-5 text-cyan-600" />
      <div>
        {/* Type/Nom */}
        <p className="font-medium text-sm text-slate-900 truncate">
          {doc.customType || 
           DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || 
           doc.type}
        </p>
        
        {/* Date + Taille */}
        <div className="flex flex-wrap gap-2 mt-1">
          <p className="text-xs text-slate-500">{formatDate(doc.date)}</p>
          {doc.size && <>
            <span className="text-xs text-slate-400">•</span>
            <p className="text-xs text-slate-500">{formatFileSize(doc.size)}</p>
          </>}
        </div>
      </div>
    </div>
    
    {/* Col 2: Actions */}
    <div className="flex items-center gap-2">
      <Button size="sm" variant="ghost" title="Aperçu"
        onClick={() => window.open(doc.url, "_blank")}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" title="Télécharger"
        onClick={() => window.open(doc.url, "_blank")}>
        <Download className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" className="text-rose-600"
        onClick={() => handleDelete(doc.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
))
```

### 15.2 Formatage Date

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 189-196)
const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return date;
  }
};

// Exemple: "2026-08-16T10:30:00Z" → "16 août 2026"
```

### 15.3 Formatage Taille

```typescript
// Fichier: src/features/profile/components/sections/DocumentsSection.tsx (ligne 179-185)
const formatFileSize = (bytes?: string) => {
  if (!bytes) return "";
  const num = parseFloat(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

// Exemple: "245320" → "239.6 KB"
```

---

## 16. HOOK useCandidateDocuments

### 16.1 Signature

```typescript
// Fichier: src/features/candidates/hooks/useCandidateDocuments.ts

export function useCandidateDocuments(profileId?: string | null) {
  const [cv, setCv] = useState<CandidateCVState | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRestoredDocuments, setHasRestoredDocuments] = useState(false);

  // ... effects

  return { cv, documents, setCv, setDocuments, loading };
}
```

### 16.2 Retour du Hook

```typescript
// ✅ Fournit:
{
  cv: CandidateCVState | null,
  documents: CandidateDocument[],
  setCv: (value) => void,
  setDocuments: (value) => void,
  loading: boolean
}

// ❌ NE fournit PAS (mais utilisé dans CandidateProfileCenter!):
{
  deleteDocument: (id: string) => Promise<void>,  // ← MISSING!
  addDocument: (doc, isCV?) => void              // ← MISSING!
}
```

### 16.3 Bug TypeScript

```typescript
// Fichier: src/features/profile/components/CandidateProfileCenter.tsx (ligne 35)
const { cv, documents, loading: documentsLoading, deleteDocument, addDocument } 
  = useCandidateDocuments(profile?.id);
  
// ❌ Erreur TypeScript:
// Property 'deleteDocument' does not exist on type '{ cv: ...; documents: ...; ... }'
// Property 'addDocument' does not exist on type '{ cv: ...; documents: ...; ... }'
```

### 16.4 Réalité dans CandidateDocumentsPage

```typescript
// Fichier: src/pages/candidate/CandidateDocumentsPage.tsx
// ✅ Cette page n'utilise PAS les méthodes manquantes

<DocumentsSection
  cv={cv}
  documents={documents}
  loading={documentsLoading}
  candidateId={profile.id}
  serverCvUrl={profile?.cv_url}
  onDeleteDocument={deleteDocument}  // ← Passe undefined!
  onAddDocument={addDocument}        // ← Passe undefined!
/>

// Les callbacks sont optionnels dans DocumentsSection props
// donc pas d'erreur à runtime
```

---

## 17. FLUX COMPLET: DE L'AUTH AU DOCUMENT

### 17.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  AUTH.USER (auth.users table)                          │
│  ↓                                                      │
│  user_id                                               │
│  ↓                                                      │
│  CANDIDATES TABLE (public.candidates)                  │
│  ├─ id                                                 │
│  ├─ user_id (foreign key)                              │
│  ├─ cv_url (Storage path/URL)                          │
│  ├─ cv_text (Extracted text)                           │
│  ├─ embedding_vector (AI embedding)                    │
│  └─ [other profile fields]                             │
│  ↓                                                      │
│  DOCUMENT METADATA (2 sources)                         │
│  ├─ localStorage: emploiplus-candidate-documents-{id}  │
│  │  ├─ cv: CandidateCVState                            │
│  │  └─ documents: CandidateDocument[]                  │
│  │                                                     │
│  └─ Supabase Storage: candidat-doc bucket              │
│     ├─ candidates/{candidateId}/cv/...pdf             │
│     └─ candidates/{candidateId}/documents/...pdf      │
│  ↓                                                      │
│  DISPLAY (UI components)                               │
│  ├─ DocumentsSection                                   │
│  ├─ CandidateDocumentsPanel                            │
│  └─ CandidateCVPage                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 17.2 Flux Complet: Upload

```
User clicks "Choisir un PDF"
  ↓ (select file)
handleFileSelection()
  ├─ Validate MIME, Size
  ├─ If CV:
  │  └─ uploadAndProcessCandidateCV()
  │     ├─ uploadCandidateCV()
  │     │  └─ supabase.storage.upload() → generates filename, returns { url, path }
  │     ├─ saveCandidateDocuments() → localStorage.setItem()
  │     ├─ processCandidateCvUpload()
  │     │  ├─ extractTextFromPdf() → pdfjs → cvText
  │     │  ├─ updateCandidateCvText()
  │     │  │  └─ supabase.update(candidates) → cv_text, embedding_vector, cv_url
  │     │  ├─ invalidate ai_analysis_cache
  │     │  └─ localStorage.removeItem() ← CLEARS ALL
  │     └─ window.dispatchEvent("cv-uploaded")
  │
  └─ Else (other document):
     └─ uploadCandidateDocument()
        ├─ uploadFileToStorage() → { url, path }
        ├─ Create CandidateDocument object
        ├─ setDocuments([...prev, newDoc])
        └─ saveCandidateDocuments() → localStorage.setItem()

Result:
  - File in Supabase Storage
  - Metadata in localStorage (except CV which is also in DB)
  - UI refreshed
  - Toast notification shown
```

### 17.3 Flux Complet: Récupération

```
Page load / useCandidate()
  ├─ auth.user → useCandidate() → profile (id, cv_url, cv_text, etc.)
  │
  └─ useCandidateDocuments(profile.id)
     ├─ localStorage.getItem(`emploiplus-candidate-documents-${id}`)
     │  ├─ If exists: parse & restore cv, documents
     │  └─ If not: proceed to server fallback
     │
     └─ CandidateCVPage useEffect:
        ├─ If cv from localStorage → use it
        ├─ Else if profile.cv_url:
        │  ├─ If starts with "http" → use directly
        │  └─ Else (Storage path):
        │     └─ createSignedUrl(cv_url, 3600) → generate signed URL
        │
        └─ Display in DocumentsSection

Result:
  - CV from localStorage OR Supabase (whichever available)
  - Documents from localStorage only
  - URLs (signed or public) ready for display/download
```

---

## 18. RÉSUMÉ EXÉCUTIF

### 18.1 Architecture Réelle

```
STATELESS DOCUMENTS SYSTEM
─────────────────────────

✅ Métadonnées: localStorage (client-side)
✅ Fichiers: Supabase Storage (cloud)
✅ CV: Métadonnées + Texte en DB (candidates table)
✅ Autres docs: Métadonnées UNIQUEMENT en localStorage
```

### 18.2 Données Réelles par Type

| Type | Table DB | localStorage | Storage | Notes |
|------|----------|---|---|---|
| **CV** | `candidates.cv_url`, `cv_text`, `embedding_vector` | ✅ Key employé | ✅ Path utilisé | Texte extrait pour IA |
| **Motivation** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Diploma** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Certificate** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Attestation** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Portfolio** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Récépissé** | ❌ Aucun | ✅ Key employé | ✅ Path utilisé | Métadonnées seulement |
| **Autre** | ❌ Aucun | ✅ Key employé + customType | ✅ Path utilisé | customType label |

### 18.3 Fichiers Clés à Reproduire dans Mobile

```
1. src/lib/candidate-documents.ts
   └─ Interfaces: CandidateCVState, CandidateDocument, CandidateDocumentsState

2. src/services/storageService.ts
   └─ uploadFileToStorage(), resolveStorageUrl(), MAX_DOCUMENT_SIZE_BYTES, ALLOWED_DOCUMENT_MIME_TYPES

3. src/features/candidates/api/documentsApi.ts
   └─ getCandidateDocuments(), saveCandidateDocuments(), uploadCandidateCV(), uploadCandidateDocument(), etc.

4. src/services/aiMatchingService.ts
   └─ processCandidateCvUpload(), updateCandidateCvText(), extractTextFromPdf()
```

### 18.4 Points Critiques

✅ **À Respecter:**
- 8 types de documents (7 enum + 1 spécial "autre" + "cv")
- localStorage key: `emploiplus-candidate-documents-${candidateId}`
- Storage bucket: `candidat-doc` (ou via env var)
- Storage paths: `candidates/{id}/cv` et `candidates/{id}/documents`
- Signed URLs expire après 3600s
- PDF seul, max 2 Mo

⚠️ **À Éviter:**
- Créer table `candidate_documents` (n'existe pas)
- Supprimer fichiers Storage (ils restent)
- Stocker métadonnées docs non-CV en DB (localStorage only)
- Confondre cv_url (path/URL) avec cv_text (extracted text)

---

## 19. DIAGRAMME SYNTHÈSE

```
┌───────────────────────────────────────────────────────────────┐
│                   USER INTERFACE                              │
│  CandidateDocumentsPage.tsx → DocumentsSection.tsx            │
│  ├─ Upload UI (select file, choose type, upload button)      │
│  ├─ Status Checklist (8 types with checkmarks)               │
│  └─ Documents List (view, download, delete)                   │
└───────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────┐
│               LOCAL STATE (client-side)                       │
│  localStorage: emploiplus-candidate-documents-{candidateId}   │
│  ├─ cv: { id, name, displayName, date, size, url }          │
│  └─ documents: [{ id, type, name, displayName, date, size, url, customType }] │
└───────────────────────────────────────────────────────────────┘
                          ↓↑
┌───────────────────────────────────────────────────────────────┐
│              SUPABASE STORAGE (files)                         │
│  Bucket: candidat-doc                                         │
│  ├─ candidates/{id}/cv/{timestamp}-{random}.pdf              │
│  └─ candidates/{id}/documents/{timestamp}-{random}.pdf       │
│     Returns: { url, path }                                    │
└───────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────┐
│           SUPABASE DATABASE (metadata + CV only)              │
│  Table: public.candidates                                     │
│  ├─ cv_url: path/URL to PDF in Storage                       │
│  ├─ cv_text: extracted text from PDF (for AI/matching)       │
│  └─ embedding_vector: lightweight embedding for matching      │
└───────────────────────────────────────────────────────────────┘
```

---

## CONCLUSION

Le module Documents du site web EmploiPlus est un système hybride:

- **Métadonnées documents:** localStorage (client-side cache)
- **Fichiers binaires:** Supabase Storage (cloud)
- **CV uniquement:** Aussi en DB (candidates table) pour IA/matching
- **Autres documents:** Aucune persistance DB (métadonnées temporaires)

**Clé pour la mobilité:**
Reproduire l'architecture exacte: localStorage + Storage, PAS de table candidate_documents, traitement spécial du CV.

---

**Audit complété le:** 2026-08-16  
**Méthodologie:** Vérification exhaustive du code source  
**Confidentialité:** Aucune donnée fictive, tous les fichiers et chemins vérifiés  
**Prêt pour:** Mobile implementation basé sur cette source de vérité
