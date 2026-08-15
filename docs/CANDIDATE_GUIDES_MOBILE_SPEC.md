# CANDIDATE GUIDES — SPÉCIFICATION MOBILE

## 1. Identification de la page

### Parcours réel dans le code

```text
/candidate/guides
        ↓
CandidateLayout
        ↓
CandidateSidebar
        ↓
Route /candidate/guides
        ↓
src/pages/candidate/CandidateLocalGuidesPage.tsx
        ↓
fetchLocalGuides({ visibleOnly: true })
        ↓
src/features/local-guides/localGuideService.ts
        ↓
Supabase public.local_guides
```

### Fichiers exacts

- Route de la page : src/App.tsx
- Menu candidat : src/components/candidate/CandidateSidebar.tsx
- Layout candidat : src/pages/candidate/CandidateLayout.tsx
- Composant principal : src/pages/candidate/CandidateLocalGuidesPage.tsx
- Service de données : src/features/local-guides/localGuideService.ts
- Type de données : src/features/local-guides/types.ts
- Client Supabase : src/integrations/supabase/client.ts
- Migrations RLS / table :
  - supabase/migrations/20260719120000_create_local_guides.sql
  - supabase/migrations/20260719130000_add_local_guides_storage_policies.sql
  - supabase/migrations/20260719140000_add_visible_to_local_guides.sql

### Composant principal

Le composant principal qui affiche la page est :

- src/pages/candidate/CandidateLocalGuidesPage.tsx

### Composants enfants / éléments de rendu

- `CandidateSidebar` dans src/components/candidate/CandidateSidebar.tsx
- `Button` dans src/components/ui/button.tsx
- `Badge` dans src/components/ui/badge.tsx
- `ShareButtons` dans src/components/site/ShareButtons.tsx
- `lucide-react` : `FileText`, `Download`, `BookOpen`, `Eye`

### Hooks utilisés

- `useEffect` dans CandidateLocalGuidesPage
- `useMemo` dans CandidateLocalGuidesPage
- `useCandidate` dans CandidateSidebar
- `useLocation` dans CandidateSidebar

### Services utilisés

- src/features/local-guides/localGuideService.ts
  - `fetchLocalGuides(options?: { visibleOnly?: boolean })`

### Données / source de données

- `public.local_guides` dans Supabase
- `guide-documents` et `guides-images` dans Supabase Storage

---

## 2. Identifier exactement les fiches

La page `/candidate/guides` affiche une liste de cartes de fiches conseils locales. Une fiche est un objet `LocalGuideRecord` récupéré depuis Supabase.

### Texte visible réel sur la page

Titre :

```text
Fiches conseils locales
```

Sous-titre :

```text
Retrouvez des ressources pratiques pour mieux préparer vos démarches.
```

### Éléments visuellement présents

- section d’introduction avec icône `BookOpen`
- titre principal
- description
- si données trouvées : grille de cartes
- si aucune donnée : message
- si erreur : message d’erreur
- si chargement : skeleton

### Structure réelle d’une fiche

Chaque fiche est rendue comme une “carte” avec :

```text
┌───────────────────────────────────────┐
│ Image ou placeholder                  │
│ Badge catégorie                       │
│ Titre                                │
│ Description                          │
│ Bouton Voir                           │
│ Bouton Télécharger                    │
│ Bouton Partager                       │
└───────────────────────────────────────┘
```

### Composant principal de la carte

```tsx
<article key={guide.id} className="group overflow-visible rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
```

### Éléments d’une fiche

1. Image ou placeholder
2. Badge de catégorie
3. Titre
4. Description
5. Bouton “Voir”
6. Bouton “Télécharger”
7. Bouton partage

### Données affichées pour chaque fiche

- `guide.image_url` ou placeholder
- `guide.category`
- `guide.title`
- `guide.description`
- `guide.document_url`

---

## 3. Structure d’une fiche

### Source de données par élément

| Élément | Source | Colonne / donnée |
|---|---|---|
| image | public.local_guides | `image_url` |
| badge catégorie | public.local_guides | `category` |
| titre | public.local_guides | `title` |
| description | public.local_guides | `description` |
| lien de visualisation | public.local_guides | `document_url` |
| lien de téléchargement | public.local_guides | `document_url` |
| partage | `window.location.origin + /candidate/guides#slug` + `guide.title` | calculé dans le front |

### Construction de la carte

```tsx
<div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20">
  {guide.image_url ? (
    <img src={guide.image_url} alt={guide.title} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
      <FileText className="h-12 w-12 text-slate-600 dark:text-slate-200" />
    </div>
  )}
  <div className="absolute left-4 top-4">
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[guide.category] ?? categoryColors.default}`}>
      {guide.category}
    </span>
  </div>
</div>
```

### Boutons réels

```tsx
<Button asChild className="w-full rounded-2xl">
  <a href={guide.document_url} target="_blank" rel="noreferrer" aria-label="Voir le document">
    <Eye className="h-4 w-4" />
  </a>
</Button>

<Button asChild variant="outline" className="w-full rounded-2xl">
  <a href={guide.document_url} target="_blank" rel="noreferrer" download>
    <Download className="mr-2 h-4 w-4" />
    Télécharger
  </a>
</Button>
```

---

## 4. Données Supabase

### Table utilisée

```text
public.local_guides
```

### Type TypeScript correspondant

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

### Tableau détaillé

| Élément affiché | Table | Colonne | Relation | Transformation |
|---|---|---|---|---|
| Titre de la fiche | public.local_guides | `title` | aucune | affiché tel quel |
| Description | public.local_guides | `description` | aucune | affiché tel quel |
| Catégorie | public.local_guides | `category` | aucune | badge avec couleur selon `categoryColors` |
| Image | public.local_guides | `image_url` | aucune | `<img src="...">` ou placeholder |
| Document | public.local_guides | `document_url` | aucune | ouverture ou téléchargement |
| Visibilité | public.local_guides | `visible` | aucune | filtre `visible = true` pour non-admin |
| Tri | public.local_guides | `created_at` | aucune | ordre décroissant |
| Identifiant | public.local_guides | `id` | aucune | clé React |
| Slug | public.local_guides | `slug` | aucune | utilisé pour construire le lien de partage |
| Date de création | public.local_guides | `created_at` | aucune | tri, non affichée dans la page |
| Date de mise à jour | public.local_guides | `updated_at` | aucune | non affichée dans la page |

### Relations / jointures

Aucune relation de jointure n’est utilisée pour cette page dans le code analysé.

### Filtres réellement présents

```ts
if (options?.visibleOnly) {
  query = query.eq("visible", true);
}
```

Donc le filtre est uniquement :

- `visible = true`

### Tri réellement présent

```ts
.order("created_at", { ascending: false })
```

### Pagination / limites

Non identifié dans le code analysé.

### Table de stockage utilisée

Bucket `guide-documents` :

- utilisé pour le document PDF ou fichier de la fiche

Bucket `guides-images` :

- utilisé pour l’image associée à la fiche

Les URLs publiques sont générées via `supabase.storage.from(bucket).getPublicUrl(path)`.

---

## 5. Requêtes

### Requête exacte

Fichier : src/features/local-guides/localGuideService.ts

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

### Chaîne de données

```text
Page CandidateLocalGuidesPage
        ↓
useEffect
        ↓
fetchLocalGuides({ visibleOnly: true })
        ↓
Supabase query
        ↓
public.local_guides
        ↓
LocalGuideRecord[]
        ↓
map(guide => <article ... />)
        ↓
carte Fiche
```

### Paramètres de la requête

- `select("*")`
- `order("created_at", { ascending: false })`
- condition optionnelle : `eq("visible", true)`

### Limites / lot / lazy loading

Non identifié dans le code analysé.

---

## 6. Filtrage des fiches

### Filtres réellement présents

Le site ne filtre pas par :

- recherche
- catégories affichées côté front
- statut candidat
- localisation
- rôle
- profil candidat
- date de publication de manière explicite en UI

La seule condition active dans la requête est :

```ts
visible = true
```

### Politique RLS correspondante

From migration :

```sql
create policy local_guides_select_authenticated
on public.local_guides
for select
to authenticated
using (visible = true or public.is_admin());
```

### Donc

- les utilisateurs authentifiés voient les fiches visibles
- les admins peuvent aussi voir les fiches non visibles

### Autres conditions présentes

- l’accès à la route est protégé par `ProtectedRoute` avec `requiredPermissions={['dashboard.candidate']}`
- il n’y a aucun filtre spécifique “fiches du candidat” ou “fiches liées au profil” dans le code analysé

---

## 7. Pagination / chargement

### Pagination

Non identifié dans le code analysé.

### Infinite scroll

Non identifié dans le code analysé.

### Limite de chargement

Non identifié dans le code analysé.

### Lazy loading

Non identifié dans le code analysé.

### Chargement initial

Les fiches sont chargées au montage via `useEffect` :

```tsx
useEffect(() => {
  let mounted = true;

  async function loadGuides() {
    try {
      const data = await fetchLocalGuides({ visibleOnly: true });
      if (mounted) {
        setGuides(data);
      }
    } catch (err) {
      if (mounted) {
        setError(err instanceof Error ? err.message : "Impossible de charger les fiches.");
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadGuides();
  return () => {
    mounted = false;
  };
}, []);
```

---

## 8. États de la page

### Loading

Le code affiche :

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

### Success

```tsx
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
  {cards.map((guide) => (
    <article ...>
```

### Empty

```tsx
{cards.length === 0 ? (
  <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
    Aucune fiche n’est disponible pour le moment.
  </div>
) : (
  ...grille...
)}
```

### Error

```tsx
if (error) {
  return (
    <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
      {error}
    </div>
  );
}
```

### Refresh

Non identifié dans le code analysé.

---

## 9. Interactions

### 1. Navigation depuis le menu

**Élément** : item “Fiches” dans le sidebar candidat

```ts
{ id: "guides", label: "Fiches", icon: BookOpen, href: "/candidate/guides" }
```

Action :

- navigation vers `/candidate/guides`

Destination :

- route `/candidate/guides`

Données utilisées :

- aucune donnée de fiche au moment du clic

### 2. Clic sur la carte ou le bouton “Voir”

Action réelle :

- ouverture du document dans un nouvel onglet

Code :

```tsx
<a href={guide.document_url} target="_blank" rel="noreferrer" aria-label="Voir le document">
```

Données utilisées :

- `guide.document_url`

### 3. Clic sur “Télécharger”

Action réelle :

- téléchargement du document

Code :

```tsx
<a href={guide.document_url} target="_blank" rel="noreferrer" download>
```

Données utilisées :

- `guide.document_url`

### 4. Partage

Composant utilisé :

- `ShareButtons`

Le code construit l’URL de partage comme :

```ts
`${window.location.origin}/candidate/guides#${guide.slug}`
```

Données utilisées :

- `guide.slug`
- `guide.title`
- `window.location.origin`

### 5. Autres interactions

Non identifié dans le code analysé :

- clic sur une fiche pour ouvrir un détail
- favoris
- recherche
- filtres par catégorie
- tri interactif
- pagination de fiches

---

## 10. Routes

### Route principale

```text
/candidate/guides
```

### Route globale du candidat

```text
/candidate
```

### Protection de route

Le code dans src/App.tsx protège tout le sous-espace candidat via :

```tsx
<ProtectedRoute
  fallbackPath="/candidate/login"
  requiredPermissions={["dashboard.candidate"]}
  loadingSkeleton={<CandidateDashboardSkeleton />}
>
```

### Aucune autre route de détail de fiche n’est identifiée dans le code analysé.

### Vérification de navigation

Le bouton “Fiches” dans le sidebar est un simple lien interne :

```tsx
<Link to={item.href} ... />
```

### Paramètres de route

Non identifié dans le code analysé.

---

## 11. Composants

| Nom du composant | Chemin | Rôle |
|---|---|---|
| CandidateSidebar | src/components/candidate/CandidateSidebar.tsx | affiche le menu candidat et le bouton Fiches |
| CandidateLocalGuidesPage | src/pages/candidate/CandidateLocalGuidesPage.tsx | page principale de la liste de fiches |
| ShareButtons | src/components/site/ShareButtons.tsx | partage de la fiche |
| Button | src/components/ui/button.tsx | boutons visuels |
| Badge | src/components/ui/badge.tsx | badge de catégorie |
| CandidateLayout | src/pages/candidate/CandidateLayout.tsx | conteneur du compte candidat |
| CandidateAppShell | src/pages/candidate/CandidateLayout.tsx | shell visuel du candidat |

### Composants de rendu de l’interface

- `BookOpen` (`lucide-react`)
- `FileText` (`lucide-react`)
- `Eye` (`lucide-react`)
- `Download` (`lucide-react`)

---

## 12. Design

### Structure globale

- contenu central dans le layout candidat
- bloc d’introduction carré arrondi
- grille de cartes avec espace constant

### Dimensions et taille visibles dans le code

- `h-40` sur l’image / zone visuelle
- `rounded-3xl` sur les cartes
- `text-2xl font-semibold` pour le titre
- `text-lg font-semibold` pour le titre de la carte
- `text-sm text-muted-foreground` pour description

### Couleurs du système

Les couleurs de fond et de thème sont définies dans src/styles.css. Les variables importantes pour cette page sont :

- `--primary`: `#00009e`
- `--secondary`: `#e8a900`
- `--background`
- `--card`
- `--border`
- `--muted`
- `--muted-foreground`
- `--foreground`

### Badges de catégorie

Les classes sont définies dans le code :

```ts
const categoryColors: Record<string, string> = {
  Salaires: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Droit du travail": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Entretien: "bg-amber-500/10 text-amber-300",
  default: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
```

### Éléments visuels

- images de couverture ou placeholder
- bordures
- ombres légères
- hover translation verticale légère
- bouton de téléchargement avec bordure

### États hover / active

Petit hover observé :

```tsx
hover:-translate-y-1 hover:shadow-lg
```

Autres états actifs :

- bouton “Voir” : couleur standard du composant `Button`
- bouton “Télécharger” : variant `outline`

---

## 13. Responsive

### Desktop

```tsx
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
```

Résultat réel :

- `md` => 2 colonnes
- `xl` => 3 colonnes

### Tablette

- format intermédiaire, généralement 2 colonnes selon la grille `md:grid-cols-2`

### Mobile web

- une colonne par défaut puisque la grille est `grid` sans `sm:grid-cols-*` ni `grid-cols-1` explicite

### Layout du compte candidat

Le shell contient :

- sidebar desktop
- drawer mobile
- header mobile spécifique

La page Fiches s’insère dans ce layout sans logique spécifique de page mobile.

---

## 14. Authentification

### Vérification de session

La page est sous `/candidate`, donc elle dépend de `ProtectedRoute`.

```tsx
<ProtectedRoute
  fallbackPath="/candidate/login"
  requiredPermissions={["dashboard.candidate"]}
  loadingSkeleton={<CandidateDashboardSkeleton />}
>
```

### Session / utilisateur / candidat

La route exige :

- session authentifiée
- `dashboard.candidate` permission

### Identité du candidat

Le code de cette page ne fait pas de requête `eq("user_id", ...)` sur `candidates`.

Il ne dépend pas d’un `candidate_id` spécifique pour afficher la liste des fiches.

### La logique observée est donc :

```text
Session Supabase active
        ↓
Permission dashboard.candidate
        ↓
Accès au routeur /candidate
        ↓
Accès à /candidate/guides
        ↓
Chargement public.local_guides (visible = true)
```

### Non identifié dans le code analysé

- relation candidate → guides
- filtrage personnalisé par candidat
- besoin d’un `candidate_id` pour la liste
- rôle spécifique de la fiche

---

## 15. RLS / permissions

### Table `public.local_guides`

Migration : supabase/migrations/20260719120000_create_local_guides.sql

```sql
alter table public.local_guides enable row level security;

create policy local_guides_select_authenticated
on public.local_guides
for select
to authenticated
using (true);

create policy local_guides_insert_admin
on public.local_guides
for insert
to authenticated
with check (public.is_admin());

create policy local_guides_update_admin
on public.local_guides
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy local_guides_delete_admin
on public.local_guides
for delete
to authenticated
using (public.is_admin());
```

### Politique de visibilité finale

Migration : supabase/migrations/20260719140000_add_visible_to_local_guides.sql

```sql
create policy local_guides_select_authenticated
on public.local_guides
for select
to authenticated
using (visible = true or public.is_admin());
```

### Donc

- les utilisateurs authentifiés peuvent voir les fiches visibles
- les admins peuvent voir aussi les fiches non visibles

### Storage policies

Migration : supabase/migrations/20260719130000_add_local_guides_storage_policies.sql

Les fichiers de bucket `guide-documents` et `guides-images` sont accessibles aux utilisateurs authentifiés pour lecture/écriture selon les politiques.

---

## 16. Images / storage

### Contexte

Les fiches peuvent contenir une image de couverture et un document principal.

### Champs d’image dans la table

- `public.local_guides.image_url`

### Bucket de données

- `guides-images` pour les images
- `guide-documents` pour les documents

### Récupération dans le code

Les images et documents sont stockés via Supabase Storage côté admin.

La page de candidat n’ajoute aucune logique de transformation d’image. Elle affiche simplement :

```tsx
<img src={guide.image_url} alt={guide.title} className="h-full w-full object-cover" />
```

### Cas sans image

```tsx
<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
  <FileText className="h-12 w-12 text-slate-600 dark:text-slate-200" />
</div>
```

### Type URL

- public URL générée par Supabase Storage
- non signé / public URL

### Transformation d’image

Non identifié dans le code analysé.

---

## 17. Spécification pour le bouton « Fiches » de l’application mobile

# SPÉCIFICATION POUR LE BOUTON « FICHES » DE L’APPLICATION MOBILE

Le bouton « Fiches » de l’application mobile doit afficher le même contenu que la page actuelle `/candidate/guides` du site web.

### Source des données

- Table Supabase : `public.local_guides`
- Colonnes utilisées :
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
- Storage :
  - `guides-images`
  - `guide-documents`

### Requêtes

```ts
supabase
  .from("local_guides")
  .select("*")
  .order("created_at", { ascending: false })
  .eq("visible", true)
```

### Relations

Aucune relation de jointure n’est identifiée dans le code analysé entre les fiches et le profil candidat.

### Structure d’une fiche

- image ou placeholder
- badge de catégorie
- titre
- description
- bouton Voir
- bouton Télécharger
- bouton Partager

### Liste

- afficher toutes les fiches visibles dans une grille / liste verticale
- ordre du plus récent au plus ancien

### Détail

Quand une fiche est ouverte le document principal doit être ouvert selon le fichier réel `document_url`, dans un navigateur ou un lecteur natif, sans passer par une WebView du site.

### Images

- récupérer `image_url` depuis `public.local_guides`
- si `image_url` est absent, afficher un placeholder visuel

### Filtres

- filtre de visibilité : `visible = true`
- aucun autre filtre de candidat n’est présent dans le code analysé

### États

- Loading : skeleton
- Empty : “Aucune fiche n’est disponible pour le moment.”
- Error : afficher le message d’erreur
- Success : cartes de fiches

### Authentification

- la page est accessible dans le sous-espace `/candidate`
- le clone mobile doit vérifier une session authentifiée et la permission `dashboard.candidate`

### Navigation

- Bouton Fiches dans le menu candidat → route `/candidate/guides`
- ouverture du document principal via `document_url`
- pas de page de détail interne spécifique dans le site actuel

---

## 18. Instruction d’implémentation mobile

## INSTRUCTION D’IMPLÉMENTATION MOBILE

Le module Fiches de l’application mobile ne doit pas inventer son propre contenu.

Il doit reproduire exactement les fiches actuellement affichées sur :

```text
/candidate/guides
```

Les données doivent être récupérées directement depuis Supabase, à partir de `public.local_guides`, avec le même filtrage `visible = true` et le même ordre `created_at DESC`.

Aucune WebView et aucune redirection vers le site ne doivent être utilisées.

Les fichiers et liens de document doivent être ouverts à partir de `document_url` et les images à partir de `image_url`.

---

## 19. Fichiers sources analysés

- src/App.tsx
- src/components/candidate/CandidateSidebar.tsx
- src/features/local-guides/localGuideService.ts
- src/features/local-guides/types.ts
- src/integrations/supabase/client.ts
- src/pages/candidate/CandidateLayout.tsx
- src/pages/candidate/CandidateLocalGuidesPage.tsx
- src/components/ui/button.tsx
- src/components/ui/badge.tsx
- src/components/site/ShareButtons.tsx
- src/styles.css
- supabase/migrations/20260719120000_create_local_guides.sql
- supabase/migrations/20260719130000_add_local_guides_storage_policies.sql
- supabase/migrations/20260719140000_add_visible_to_local_guides.sql

---

## 20. Validation finale

Le document permet de répondre aux questions suivantes sans ouvrir le site :

1. Où se trouve la page `/candidate/guides` ?
   → dans le routeur candidat, sous `/candidate`, affichée par `CandidateLocalGuidesPage`

2. Quel composant l’affiche ?
   → src/pages/candidate/CandidateLocalGuidesPage.tsx

3. Qu’est-ce qu’une « fiche » ?
   → un `LocalGuideRecord` de `public.local_guides`

4. Quelles fiches sont affichées ?
   → celles avec `visible = true`, triées par `created_at DESC`

5. D’où viennent-elles ?
   → de `public.local_guides` via `fetchLocalGuides({ visibleOnly: true })`

6. Quelle table Supabase est utilisée ?
   → `public.local_guides`

7. Quelles colonnes sont utilisées ?
   → id, title, slug, category, description, image_url, document_url, visible, created_at, updated_at

8. Comment les données sont-elles filtrées ?
   → `visible = true` pour les non-admins

9. Comment les images sont-elles récupérées ?
   → `image_url` depuis `public.local_guides`; images stockées dans `guides-images`

10. Comment une fiche est-elle ouverte ?
   → via `document_url` dans un nouvel onglet / lecteur natif

11. Quelle route est utilisée ?
   → `/candidate/guides`

12. Quelles données doivent être reproduites dans l’application mobile ?
   → exactes données de `public.local_guides` et URL storage correspondantes

13. Quels sont les états loading/empty/error ?
   → skeleton, message “Aucune fiche…”, message d’erreur

14. Comment identifier le candidat connecté ?
   → via la session Supabase + permission `dashboard.candidate` au niveau des routes protégées

### Conclusion

La page `/candidate/guides` est une liste de fiches conseils locales, lues depuis `public.local_guides`, filtrées par `visible = true`, affichées en cartes, et ouvertes via `document_url` sans aucune logique particulière de candidat à l’intérieur de la page elle-même.
