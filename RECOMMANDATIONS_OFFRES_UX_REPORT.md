# Rapport — Accès flottant permanent aux recommandations

## Solution UX

La page Emplois candidat conserve une seule liste principale : **Toutes les offres**. La carte « Recommandé pour vous » a été supprimée du flux normal.

Les recommandations sont accessibles en permanence depuis un bouton flottant compact : **✨ Recommandations — Voir**.

Le bouton ouvre un `Sheet` latéral réutilisant le composant existant. Le panneau possède un overlay, une fermeture native, un scroll indépendant et une largeur adaptée au desktop comme au mobile.

Le bouton flottant ouvre exactement le même panneau et ne duplique ni les recommandations ni leur chargement.

## Fichier modifié

- `src/pages/public/JobsPage.tsx`

Aucun changement dans `aiMatchingService`, la RPC Supabase, le calcul du score ou la page publique `/jobs` n’a été effectué.

## Composants réutilisés

- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`
- `JobCard` avec `variant="list"`
- `Button`, `Skeleton`
- Icônes existantes `Sparkles` et `ArrowRight`

## Accès permanent

La carte originale et son `IntersectionObserver` ont été supprimés. Le bouton flottant est rendu directement lorsque `isCandidateShell` est vrai ; il reste donc disponible pendant tout le parcours de la page Emplois candidat.

## Source des recommandations

La page réutilise le flux déjà présent :

- `getRecommendedJobs` depuis `src/services/aiMatchingService.ts`
- candidat identifié par `profile.id`
- même contexte CV/profil pour éviter les appels inutiles
- même pagination que le Dashboard candidat : 3 offres par appel
- offset calculé avec la page courante

Aucun nouvel algorithme, score ou appel de matching n’a été créé.

## Source du score

Le score vient directement de `job.score`, retourné par le système existant, puis transmis à `JobCard` via `matchScore`. Il n’est ni recalculé ni modifié dans l’interface.

## Contenu du panneau

Chaque recommandation conserve :

- titre et entreprise ;
- localisation ;
- informations de contrat, salaire et échéance disponibles ;
- aperçu de l’offre ;
- score de compatibilité ;
- actions existantes de consultation et de candidature.

La navigation vers une offre utilise toujours `/jobs/:slug` via `JobCard`.

## États gérés

- **Chargement :** trois skeletons dans le panneau.
- **Résultats :** toutes les recommandations de la page courante, avec pagination existante.
- **Aucune recommandation :** message explicatif ; si le CV manque, lien vers le profil candidat.
- **Erreur :** message discret dans le panneau ; la liste générale reste utilisable.

## Responsive

Le panneau prend toute la largeur disponible sur mobile et une largeur maximale sur desktop. Son contenu est scrollable indépendamment.

- **Desktop :** bouton compact fixe en bas à droite, placé au-dessus de l’action WhatsApp existante.
- **Mobile :** bouton réduit, avec hauteur tactile minimale et `safe-area-inset-bottom`, sans grand bandeau couvrant les offres.
- Le bouton possède un libellé texte, un `aria-label`, un focus visible et le même handler `setRecommendationsOpen(true)` que l’action principale.
- Le panneau utilise un overlay léger et reste fermable via le bouton natif ou `Escape`.

Les offsets utilisés sont cohérents avec le bouton WhatsApp (`bottom-24` desktop et `bottom: 5.5rem` mobile) afin de maintenir un espace vertical entre les deux éléments fixes.

Contrôle navigateur effectué sur 320, 360, 375, 390, 430, 768 et 1024 px : aucun overflow horizontal détecté sur la page publique non authentifiée.

Le contrôle candidat complet dépend d’une session connectée pour afficher les recommandations réelles et ouvrir le panneau avec les données Supabase.

## Vérifications

- La page principale ne contient plus de carte de recommandations ni de deuxième liste permanente.
- La page publique `/jobs` ne rend pas le bouton flottant candidat.
- Une seule invocation de `getRecommendedJobs` est conservée dans `JobsPage`.
- `npx eslint src/pages/public/JobsPage.tsx` réussi.
- Le language server ne signale aucune erreur dans le fichier.
- `npm run build:vite` réussi après l’intégration ; les avertissements existants concernent `pdfjs-dist` et la taille de certains chunks.

## Éléments fixes

Le bouton de recommandations est rendu uniquement dans `isCandidateShell`. Il n’apparaît donc pas sur `/jobs` public. Il reste sous le niveau de l’action WhatsApp (`z-30` contre `z-40`) et est décalé verticalement pour éviter le chevauchement.

## Problèmes rencontrés

Le navigateur partagé n’avait pas de session candidat active pendant la vérification finale. L’ouverture du panneau avec des données Supabase n’a donc pas pu être simulée dans cette session.
