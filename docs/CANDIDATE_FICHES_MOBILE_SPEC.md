# CANDIDATE — FICHES

## 1. Vue d'ensemble

La fonctionnalité « Fiches » du compte candidat correspond à la page de lecture de fiches conseils locales exposées à l’utilisateur connecté.

Le bouton est visible dans le menu latéral du candidat et pointe vers une route interne du site.

Le site n’a pas de logique spécifique de “documents de profil” dans cette route : la page charge des fiches depuis Supabase et les affiche sous forme de cartes.

## 2. Localisation du bouton

Slider candidat
→ src/components/candidate/CandidateSidebar.tsx
→ bouton Fiches
→ route /candidate/guides
→ page affichée : src/pages/candidate/CandidateLocalGuidesPage.tsx

Fichiers exacts analysés :

- src/components/candidate/CandidateSidebar.tsx
- src/App.tsx
- src/pages/candidate/CandidateLocalGuidesPage.tsx
- src/features/local-guides/localGuideService.ts
- src/features/local-guides/types.ts
- supabase/migrations/20260719120000_create_local_guides.sql
- supabase/migrations/20260719140000_add_visible_to_local_guides.sql
- supabase/migrations/20260719130000_add_local_guides_storage_policies.sql

Le bouton est défini dans le tableau de menu du candidate :

```ts
const menuItems = [
  { id: "dashboard", label: "Tableau de bord", href: "/candidate/dashboard" },
  { id: "profile", label: "Mon profil", href: "/candidate/profile" },
  { id: "documents", label: "Documents", href: "/candidate/documents" },
  { id: "guides", label: "Fiches", icon: BookOpen, href: "/candidate/guides" },
  ...
];
```

## 3. Route et navigation

### Route utilisée

```
/candidate/guides
```

### Système de navigation

Le site utilise React Router DOM (`BrowserRouter` dans src/main.tsx) avec des routes définies dans src/App.tsx.

La route concerne l’espace candidat protégé :

```tsx
<Route
  path="/candidate"
  element={
    <ProtectedRoute
      fallbackPath="/candidate/login"
      requiredPermissions={["dashboard.candidate"]}
      loadingSkeleton={<CandidateDashboardSkeleton />}
    >
      {withSuspense(<CandidateLayout />, <CandidateDashboardSkeleton />)}
    </ProtectedRoute>
  }
>
  ...
  <Route
    path="guides"
    element={withSuspense(<CandidateLocalGuidesPage />, <CandidateDashboardSkeleton />)}
  />
</Route>
```

### Paramètres de route

Aucun paramètre de route n’est utilisé pour cette page.

### Protections et redirections

- La vue est sous `/candidate` donc protégée par `ProtectedRoute`.
- `requiredPermissions={['dashboard.candidate']}` est exigé.
- Si l’utilisateur n’est pas authentifié ou n’a pas la permission, la redirection va vers `/candidate/login`.
- La route `/candidate/guides` n’a pas de redirection interne supplémentaire dans le code analysé.

### Parcours réel

```text
Compte candidat
      ↓
Slider candidat
      ↓
Fiches
      ↓
Route /candidate/guides
      ↓
Page CandidateLocalGuidesPage
```

## 4. Page affichée

La page réellement affichée est :

- src/pages/candidate/CandidateLocalGuidesPage.tsx

Elle affiche une section de type “carte de contexte” puis une grille de cartes de fiches.

### Titre de la page

```text
Fiches conseils locales
```

### Sous-titre / description

```text
Retrouvez des ressources pratiques pour mieux préparer vos démarches.
```

### Structure de la page

1. Bloc d’introduction avec icône BookOpen
2. Titre principal
3. Description
4. Si chargement : skeleton visuel
5. Si erreur : message de texte rouge
6. Si aucune donnée : message centré “Aucune fiche n’est disponible pour le moment.”
7. Sinon : grille de cartes

## 5. Contenu de l'interface

### 5.1 État loading

Pendant le chargement, la page affiche un bloc avec 3 éléments en pseudo-skeleton :

- grand rectangle en haut pour le titre
- ligne de texte
- ligne de texte plus courte

Code visible dans CandidateLocalGuidesPage :

```tsx
if (loading) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
```

### 5.2 État error

Si `fetchLocalGuides` échoue, la page affiche :

```tsx
<div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
  {error}
</div>
```

### 5.3 État empty

Si `cards.length === 0` :

```text
Aucune fiche n’est disponible pour le moment.
```

Le message est dans une carte avec bordure pointillée et texte centré.

### 5.4 État success

Le site affiche une grille :

```tsx
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
```

Chaque carte contient :

- image du guide ou placeholder visuel
- badge de catégorie
- titre
- description
- bouton “voir” (icône Eye)
- bouton “Télécharger”
- bouton de partage compact via `ShareButtons`

### 5.5 Détail de chaque carte de fiche

Chaque carte est un `article` avec :

- clé `guide.id`
- image en-tête : `guide.image_url` si présent
- sinon placeholder avec icône FileText
- badge avec couleur selon catégorie
- `guide.title`
- `guide.description`
- bouton de visualisation : lien vers `guide.document_url` dans un nouvel onglet
- bouton de téléchargement : lien vers `guide.document_url` avec `download`
- bouton de partage utilisant `ShareButtons`

### 5.6 Badges / catégories

Le code applique des couleurs selon la catégorie :

```ts
const categoryColors: Record<string, string> = {
  Salaires: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Droit du travail": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Entretien: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  default: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
```

Le badge affiche la valeur de `guide.category`.

### 5.7 Icônes utilisées

- BookOpen
- FileText
- Eye
- Download
- ShareButtons (composant partagé)

## 6. Données utilisées

La table principale est :

- `public.local_guides`

Structure de données :

```ts
export interface LocalGuideRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image_url: string | null;
  document_url: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}
```

### Détail des champs utilisés

| Donnée affichée | Table | Colonne | Relation | Requête / Hook |
|---|---|---|---|---|
| Liste des fiches | public.local_guides | * | aucune | fetchLocalGuides({ visibleOnly: true }) |
| Titre | public.local_guides | title | aucune | select(*) |
| Catégorie | public.local_guides | category | aucune | select(*) |
| Description | public.local_guides | description | aucune | select(*) |
| Image | public.local_guides | image_url | aucune | select(*) |
| Document | public.local_guides | document_url | aucune | select(*) |
| Visibilité | public.local_guides | visible | aucune | `query.eq("visible", true)` |
| Création | public.local_guides | created_at | aucune | order("created_at", { ascending: false }) |
| Mise à jour | public.local_guides | updated_at | aucune | trigger SQL |

### Requête réelle

```ts
export async function fetchLocalGuides(options?: { visibleOnly?: boolean }): Promise<LocalGuideRecord[]> {
  let query = supabase.from(TABLE_NAME).select("*").order("created_at", { ascending: false });
  if (options?.visibleOnly) {
    query = query.eq("visible", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LocalGuideRecord[];
}
```

### Stockage de fichiers

Les fichiers documentaires et visuels sont stockés dans des buckets Supabase Storage :

- bucket `guide-documents`
- bucket `guides-images`

Les URLs publiques sont récupérées via :

```ts
const { data: imagePublicData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath);
const { data: documentPublicData } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(documentPath);
```

### Pagination / tri

- Tri : `created_at` descendant
- Pagination : Non identifié dans le code analysé.

## 7. Logique métier

### 7.1 Filtrage actuel

La page ne filtre pas selon le candidat connecté. Il n’y a pas de clause `eq("user_id", ...)` ni de relation avec le profil candidat.

La logique observée est :

```ts
if (options?.visibleOnly) {
  query = query.eq("visible", true);
}
```

Donc le filtre est basé sur le champ `visible` de la table `local_guides` et non sur le candidat.

### 7.2 Visibilité

La table `local_guides` a un champ :

```sql
visible boolean not null default true
```

La migration crée la politique RLS suivante :

```sql
using (visible = true or public.is_admin());
```

Cela signifie que :

- les utilisateurs authentifiés voient les fiches visibles
- les admins voient aussi les fiches non visibles

### 7.3 Accessibilité

La page est accessible uniquement si le candidat est authentifié et a la permission `dashboard.candidate`.

Aucune logique supplémentaire de profil candidat n’est appliquée pour afficher les fiches.

### 7.4 Conditions présentes dans le code

Les conditions réellement vérifiées sont :

- utilisateur authentifié
- permission `dashboard.candidate`
- présence de `visible = true` pour les non-admins
- chargement des fiches
- succès / erreur / empty state

### 7.5 Conditions non identifiées

- filtre par statut candidat
- filtre par date de publication
- filtre par profil candidat
- progression ou niveau
- permission spécifique “fiches” distincte

Non identifié dans le code analysé.

## 8. Interactions

### Bouton Fiches dans le sidebar

- Nom : Fiches
- Action : navigation interne
- Destination : `/candidate/guides`
- Implémentation : `<Link to={item.href}>`
- Aucun changement de données côté Supabase

### Bouton “Voir” sur chaque carte

- Action : ouvre le document dans un nouvel onglet
- Destination : `guide.document_url`
- Implémentation :

```tsx
<a href={guide.document_url} target="_blank" rel="noreferrer" aria-label="Voir le document">
```

- Aucune mise à jour de BDD
- Aucune requête Supabase supplémentaire

### Bouton “Télécharger”

- Action : télécharge le document
- Destination : `guide.document_url`
- Implémentation :

```tsx
<a href={guide.document_url} target="_blank" rel="noreferrer" download>
```

- Aucune modification de données

### Bouton de partage

- Composant : `ShareButtons`
- Fonctionnement : partage via URL de la fiche (`window.location.origin + /candidate/guides#slug`)
- Il utilise le titre de la fiche comme texte de partage.
- Aucune requête Supabase n’est déclenchée par ce composant dans la page analysée.

### Actions non détectées

- édition de fiche côté candidat
- suppression de fiche côté candidat
- filtres sur la page
- tri interactif
- pagination
- recherche

Non identifié dans le code analysé.

## 9. États de l'interface

### Loading

```text
Skeleton visuel avec titre + lignes de contenu
```

### Empty

```text
Aucune fiche n’est disponible pour le moment.
```

### Error

```text
Le message d’erreur retourné par fetchLocalGuides est affiché.
```

### Success

- grilles de cartes affichées
- image, catégorie, titre, description
- actions Visu / Télécharger / Partager

### Offline

Non identifié dans le code analysé.

## 10. Design et responsive

### Structure générale

- layout en contenu central dans le layout candidat
- section d’introduction avec carte arrondie et dégradé léger
- grille de cartes sur desktop

### Ordre visuel

1. bloc de header
2. titre
3. sous-titre
4. grille de cartes

### Cartes

- fond `bg-card`
- bordure `border-border`
- coins arrondis `rounded-3xl`
- ombre douce `shadow-soft`
- hover léger `hover:-translate-y-1` et `hover:shadow-lg`

### Couleurs / thème

Le design dépend principalement des tokens CSS du projet, notamment :

- `--primary` = `#00009e`
- `--secondary` = `#e8a900`
- `--background`, `--card`, `--muted`, `--border`, etc. dans src/styles.css

### Typographie

- `h1` = `text-2xl font-semibold`
- `h2` = `text-lg font-semibold`
- texte descriptif = `text-sm text-muted-foreground`

### Responsive

Le composant utilise :

```tsx
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
```

Donc :

- mobile : 1 colonne
- tablette : 2 colonnes
- desktop large : 3 colonnes

### Mobile web

Le composant ne contient pas de logique mobile spécifique pour la page elle-même. Il s’appuie sur les styles globaux de layout candidat et la grille responsive.

## 11. Composants

### Composants principaux

| Nom | Chemin | Rôle |
|---|---|---|
| CandidateSidebar | src/components/candidate/CandidateSidebar.tsx | affiche le menu candidat et le bouton Fiches |
| CandidateLocalGuidesPage | src/pages/candidate/CandidateLocalGuidesPage.tsx | contient la page de fiches |
| ShareButtons | src/components/site/ShareButtons.tsx | partage la fiche |
| Button | src/components/ui/button.tsx | actions visuelles |
| Badge | src/components/ui/badge.tsx | badge de catégorie |

### Composants réutilisés

- `Button` pour les actions Visuel et Télécharger
- `Badge` pour le libellé de catégorie
- `BookOpen`, `FileText`, `Eye`, `Download` de `lucide-react`
- `ShareButtons` pour l’action de partage

## 12. Hooks et services

| Nom | Chemin | Rôle | Données récupérées |
|---|---|---|---|
| fetchLocalGuides | src/features/local-guides/localGuideService.ts | charge les fiches visibles | liste de LocalGuideRecord |
| useEffect | src/pages/candidate/CandidateLocalGuidesPage.tsx | déclenche le chargement au montage | guides |
| useMemo | src/pages/candidate/CandidateLocalGuidesPage.tsx | mémorise le tableau `cards` | guides |

### Service détaillé

```ts
fetchLocalGuides({ visibleOnly: true })
```

Rôle : récupérer les fiches directement depuis `public.local_guides`, dans un ordre récent en premier.

## 13. Supabase

### Auth

La page est sous la route protégée `/candidate`, donc elle dépend de l’authentification Supabase du contexte global.

Le système d’auth actuellement en place est décrit dans le contexte AuthProvider, notamment :

- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange(...)`
- `session.user.id`

### Candidate

Les fiches ne dépendent pas d’un profil candidat particulier. Le filtre n’est pas sur `candidates`.

### Tables utilisées

1. `public.local_guides`
2. `storage.objects` via buckets `guide-documents` et `guides-images`

### Relations

Aucune relation directe “candidate → local_guides” n’est identifiée dans la page analysée.

Le site ne joint pas `local_guides` à `candidates`, `profiles`, `user_roles` pour l’affichage de cette page.

### Requêtes

```ts
supabase.from("local_guides").select("*").order("created_at", { ascending: false });
```

Puis éventuellement :

```ts
query = query.eq("visible", true);
```

### Storage

Buckets utilisés :

- `guide-documents`
- `guides-images`

Les fichiers sont téléchargés via `supabase.storage.from(...).upload(...)` et lus via `getPublicUrl(...)` dans le service admin, mais la page candidat ne fait que lire les URLs publiques déjà enregistrées dans `local_guides.document_url` et `local_guides.image_url`.

### Edge functions / RPC

Non identifié dans le code analysé.

## 14. Permissions / RLS

### Vérifiable dans le code

La table `local_guides` a la RLS suivante :

```sql
create policy local_guides_select_authenticated
on public.local_guides
for select
to authenticated
using (visible = true or public.is_admin());
```

Cela signifie :

- les utilisateurs authentifiés peuvent lire les fiches visibles
- les admins peuvent également lire les fiches non visibles

Les opérations d’écriture sont réservées aux admins :

- insert admin
- update admin
- delete admin

Les buckets storage associés ont aussi des politiques d’accès :

```sql
bucket_id in ('guide-documents', 'guides-images')
```

### Permissions applicatives côté front

Le routeur exige `dashboard.candidate` pour accéder au bloc candidat.

La page Fiches elle-même ne demande pas de permission supplémentaire dans le code analysé.

## 15. Dépendances

### Bibliothèques / composants utilisés

- `react-router-dom` : navigation
- `lucide-react` : icônes `BookOpen`, `FileText`, `Eye`, `Download`
- composant UI custom : `Button`, `Badge`
- composant partagé : `ShareButtons`
- Supabase JS : `@supabase/supabase-js`

### Aucune dépendance spécifique pour un éditeur, un formatter ou un moteur de document n’est détectée pour cette page.

## 16. Spécification pour l'application mobile native

### Route mobile proposée

```text
/candidate/fiches
```

### Contenu à reproduire

L’application mobile devra afficher :

- un header d’introduction avec icône de livre
- titre : “Fiches conseils locales”
- sous-titre : “Retrouvez des ressources pratiques pour mieux préparer vos démarches.”
- état loading visuel si les données ne sont pas encore chargées
- état vide si aucune fiche n’est disponible : “Aucune fiche n’est disponible pour le moment.”
- une grille de cartes, avec une carte par fiche
- pour chaque carte :
  - image ou placeholder
  - badge de catégorie
  - titre
  - description
  - bouton Voir
  - bouton Télécharger
  - bouton de partage

### Données à récupérer

- `public.local_guides`
- colonnes utilisées :
  - `id`
  - `title`
  - `slug`
  - `category`
  - `description`
  - `image_url`
  - `document_url`
  - `visible`
  - `created_at`
  - `updated_at`
- Storage buckets :
  - `guide-documents`
  - `guides-images`

### Interactions à reproduire

- ouvrir la page depuis le menu candidat
- si une fiche est cliquée sur “Voir”, ouvrir le document externe dans le navigateur ou un lecteur natif
- si “Télécharger” est cliqué, lancer le téléchargement du document
- si “Partager” est cliqué, partarger le lien de la fiche ou du document
- navigation vers la page de fiche uniquement depuis le menu du compte candidat

### États à reproduire

- Loading : skeleton le plus proche possible
- Empty : texte dédié ; pas de carte
- Error : afficher le message d’erreur retourné
- Success : afficher les fiches dans une liste/grille

### Navigation

- menu candidat → `/candidate/fiches`
- pas de sous-navigation ni de paramètres de route dans le code actuel
- les actions d’ouverture de document ne naviguent pas vers une route interne du site ; elles ouvrent directement `document_url`

### Contraintes

- reproduire exactement le comportement actuel du site : pas de logique custom de candidat pour les fiches
- filtrer uniquement `visible = true` pour les utilisateurs non-admins
- ne pas supposer l’existence d’un lien `candidate_id` ou d’un filtre utilisateur
- la page est fonctionnelle pour un utilisateur authentifié avec permission `dashboard.candidate`
- la donnée est un document externe et non un objet de profil candidat

## 17. Fichiers sources analysés

- src/components/candidate/CandidateSidebar.tsx
- src/App.tsx
- src/pages/candidate/CandidateLocalGuidesPage.tsx
- src/features/local-guides/localGuideService.ts
- src/features/local-guides/types.ts
- src/main.tsx
- src/styles.css
- supabase/migrations/20260719120000_create_local_guides.sql
- supabase/migrations/20260719130000_add_local_guides_storage_policies.sql
- supabase/migrations/20260719140000_add_visible_to_local_guides.sql

## 18. Conclusion de l’audit

Le bouton Fiches du compte candidat mène actuellement vers :

```text
/candidate/guides
```

La page affichée est :

```text
src/pages/candidate/CandidateLocalGuidesPage.tsx
```

La page charge les fiches visibles depuis la table :

```text
public.local_guides
```

avec des liens vers les fichiers dans Supabase Storage :

```text
guide-documents
guides-images
```

Cette fonctionnalité est actuellement une lecture de fiches publiques / visibles pour l’utilisateur authentifié, sans filtrage spécifique par profil candidat.
