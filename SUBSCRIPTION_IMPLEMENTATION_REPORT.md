# Rapport — Abonnement candidat

## Fichiers créés

- `src/pages/candidate/CandidateSubscriptionPage.tsx`
- `src/pages/candidate/CandidateFreeSubscriptionPage.tsx`

## Fichiers modifiés

- `src/components/candidate/CandidateSidebar.tsx`
- `src/pages/candidate/CandidateLayout.tsx`
- `src/App.tsx`

## Routes ajoutées

- `/candidate/subscription`
- `/candidate/subscription/free`

Les deux routes sont enfants de `/candidate`, sous la protection existante `ProtectedRoute` avec `fallbackPath="/candidate/login"` et `requiredPermissions={["dashboard.candidate"]}`.

## Navigation

- L’entrée **Abonnement** utilise l’icône `Crown` de `lucide-react`.
- Elle est ajoutée au tableau `menuItems` partagé par le sidebar desktop et le drawer mobile.
- Le bouton **Gratuit** utilise un lien vers `/candidate/subscription/free`.
- Le bouton de retour de la page Gratuit revient vers `/candidate/subscription`.
- Les boutons Premium et Premium+ affichent uniquement un message local “Bientôt disponible”. Aucun paiement n’est déclenché.
- Le titre du header mobile est défini pour les deux routes dans `CandidateLayout`.

## Interface créée

La page abonnement présente les trois forfaits demandés :

- Gratuit : `0 FCFA / mois`
- Premium : `500 FCFA / mois`
- Premium+ : `1 000 FCFA / mois`

Chaque carte contient un nom, un prix, une description, des avantages et une action. Premium est visuellement mis en avant sans modifier son prix.

La page Gratuit distingue clairement :

- **IA générative :** analyse CV/offre, score de compatibilité, forces/lacunes, résumé et génération de lettre.
- **Matching algorithmique :** matching candidat/offres et recommandation d’offres.

Le texte fonctionnel demandé est repris sans présenter le matching comme une IA générative.

## Composants réutilisés

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Button` et `Badge`
- Icônes `lucide-react`
- `CandidateLayout`, `CandidateSidebar` et la protection de route existants

Aucune API, requête Supabase, table, authentification, logique Groq ou matching existant n’a été modifié.

## Responsive et dark mode

- Les cartes utilisent une colonne sur mobile et trois colonnes à partir de `lg`.
- Les contenus IA sont présentés en cartes empilées sur mobile, sans tableau horizontal.
- Les libellés et chemins longs utilisent `break-words`/`min-w-0` pour éviter les débordements.
- Les couleurs reposent sur les tokens existants (`background`, `card`, `foreground`, `primary`, `muted`, `border`) et suivent le dark mode.
- Les boutons restent en largeur complète dans les cartes pour être accessibles sur petits écrans.

## Validation

- `npx tsc --noEmit` : le dépôt contient des erreurs TypeScript préexistantes hors fichiers ajoutés ; aucune erreur signalée dans les deux nouvelles pages, le sidebar, le layout ou les imports de routes.
- `npm run build:vite` : réussi.
- `npx eslint` ciblé : les nouvelles pages et le sidebar sont conformes après formatage ; deux erreurs préexistantes subsistent dans `src/App.tsx` sur des `useEffect` conditionnels.
- Test navigateur sans session : la route reste dans le groupe candidat protégé ; aucun accès non authentifié à l’interface n’a été observé.
- La vérification visuelle authentifiée aux largeurs 320, 360, 375, 390, 430, 768 et desktop nécessite une session candidat locale ; elle n’a pas pu être exécutée sans identifiants.

## Problèmes rencontrés

- Le lint global de `src/App.tsx` signale deux erreurs déjà présentes, sans lien avec l’ajout.
- Le contrôle visuel complet est limité par l’absence de session authentifiée dans le navigateur local.
