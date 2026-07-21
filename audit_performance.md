# Audit de performance et d'optimisation du site

Date : 2026-07-21

Ce document est un audit technique factuel basé sur l’état observé dans le dépôt actuel, notamment dans les routes, hooks, services Supabase et la configuration Vite.

## 1. Bundle Size & Tree-Shaking (Chargement Initial)

### 1.1 État actuel du code splitting

Le chargement des routes principales est déjà partiellement optimisé dans [src/App.tsx](src/App.tsx) grâce à `React.lazy()` et `Suspense` pour les pages secondaires et certaines zones métier (admin, candidat, blog, offres, etc.).

Points positifs :
- Les pages publiques lourdes ne sont pas chargées immédiatement au démarrage.
- Les routes candidat et admin sont découplées en chunks via des imports dynamiques dans [src/App.tsx](src/App.tsx).

Risques et limites observées :
- La page d’accueil et certaines pages publiques restent importées via des modules plus larges, ce qui peut augmenter le coût initial de la route principale.
- Les imports de pages sont centralisés via [src/pages/public/index.ts](src/pages/public/index.ts) et [src/pages/index.ts](src/pages/index.ts), ce qui peut complexifier la séparation de chunks et rendre la granularité moins explicite.
- La configuration Vite actuelle dans [vite.config.ts](vite.config.ts) ne définit pas encore de stratégie de chunking manuelle et n’optimise pas explicitement la séparation entre vendor / application / features lourdes.

### 1.2 Bibliothèques lourdes et imports potentiellement coûteux

Le projet utilise des bibliothèques de UI et d’icônes relativement lourdes :
- [src/pages/public/HomePage.tsx](src/pages/public/HomePage.tsx)
- [src/pages/public/JobsPage.tsx](src/pages/public/JobsPage.tsx)
- [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)
- [src/pages/public/PrivacyPolicyPage.tsx](src/pages/public/PrivacyPolicyPage.tsx)

Ces fichiers importent massivement `lucide-react` et des composants UI de la librairie locale. Cela n’est pas forcément problématique en soi, mais il faut vérifier que les imports sont bien ciblés. Dans ce dépôt, l’usage est majoritairement de forme standard comme :
- `import { ArrowLeft } from "lucide-react";`
- `import { Megaphone, Users, Database, Search } from "lucide-react";`

Ce style est acceptable pour un usage standard, mais il reste moins optimal que l’import ciblé si la taille du bundle devient critique. En pratique, `lucide-react` reste généralement tree-shakable, mais la prudence est de mise si des composants UI très gros sont importés en masse via un barrel central.

### 1.3 Recommandations prioritaires

1. Élargir le lazy loading aux pages réellement “secondaires” à forte empreinte, notamment les routes de candidate profile / documents / CV, si elles ne sont pas encore isolées au niveau du chunk.
2. Éviter les imports de pages via des barrels très généraux lorsque l’objectif est une décomposition fine du bundle.
3. Garder les composants UI et les icônes au plus proche des pages qui les utilisent afin de limiter l’inclusion de code inutile dans le chunk principal.

---

## 2. Requêtes Réseau & Data Fetching (Hors Auth)

### 2.1 Réseau métier et cascades de requêtes

Le code métier contient plusieurs zones où les données sont récupérées de manière indépendante, parfois de façon répétée par page.

Exemples observés :
- [src/hooks/pages.ts](src/hooks/pages.ts) charge plusieurs données de page publique : offres publiées, posts blog, éléments de page.
- [src/pages/public/HomePage.tsx](src/pages/public/HomePage.tsx) récupère plusieurs jeux de données via des hooks dédiés, ce qui peut entraîner des requêtes distinctes pour le rendu initial.
- [src/shared/services/candidateProfileService.ts](src/shared/services/candidateProfileService.ts) regroupe des appels pour profil, expériences, éducation, compétences, langues, préférences. Cela est cohérent sur le plan logique, mais il peut devenir coûteux si une vue de profil charge toutes les sections en série.

Observation factuelle :
- La logique de profil candidat n’est plus synchronisée avec l’authentification par un hook local, mais les services de données restent encore assez granulaire.
- Plusieurs modules effectuent des requêtes Supabase séparées pour des ressources liées (profil + expériences + compétences etc.), ce qui augmente le nombre d’allers-retours réseau au premier chargement.

### 2.2 Caching et revalidation

Le dépôt ne semble pas encore utiliser de couche de cache client dédiée pour les données métier. Les hooks actuels dans [src/hooks/pages.ts](src/hooks/pages.ts) et [src/features/jobs/hooks/useJobs.ts](src/features/jobs/hooks/useJobs.ts) font des calls Supabase à chaque montage ou à chaque changement de filtre.

Conséquence :
- Les pages de liste (offres, blog, candidats, notifications) peuvent relancer des requêtes identiques lors de la navigation ou du re-rendu.
- Le code n’exploite pas de stratégie de revalidation ou de stale-while-revalidate.

L’intégration d’une librairie comme React Query (@tanstack/react-query) serait pertinente pour :
- mettre en cache les listes d’offres et de posts;
- éviter les doublons de requêtes entre plusieurs composants;
- stabiliser la stratégie de revalidation après mutations;
- simplifier la gestion de l’erreur et du loading par vue.

### 2.3 Requêtes Supabase et sélection de colonnes

Les requêtes sont dans l’ensemble assez bien ciblées, mais plusieurs points méritent une attention :
- [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts) utilise `.select("*")` pour les recherches d’offres et les créations / mises à jour. Cela peut être plus lourd qu’une projection fine, surtout sur les tables volumineuses.
- [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) utilise encore des sélections `select("*")` dans des branches de fallback. Cela augmente la taille de données transférées inutilement.
- Certaines requêtes de page publique comme [src/hooks/pages.ts](src/hooks/pages.ts) récupèrent des champs de description et de contenu qui peuvent être plus gros que nécessaire pour les listes de prévisualisation.

Recommandation technique :
- Limiter les colonnes aux champs réellement utilisés pour chaque vue.
- Préférer des projections strictes (`select("id, slug, title, ...")`) aux selects larges.
- Ajouter des filtres et ordres adaptés côté DB pour éviter le transfert de beaucoup de données inutiles.

### 2.4 Recommandations prioritaires

1. Introduire un cache client de données métier (React Query ou SWR) pour les listes d’offres, posts, notifications et données de profil candidat.
2. Remplacer les `select("*")` inutiles par des projections explicites.
3. Exploiter la déduplication de requêtes de React Query pour éviter les appels simultanés identiques sur les pages publiques et la zone candidate.

---

## 3. Rendu React & Performance UI

### 3.1 Re-rendus inutiles

Le code utilise plusieurs contextes et hooks, mais la structure actuelle n’est pas encore optimisée pour éviter les re-rendus en chaîne.

Points à surveiller :
- [src/App.tsx](src/App.tsx) contient un arbre de routes relativement large, et le provider d’authentification global ajoute désormais un état partagé à toute l’application. Cela est bénéfique pour l’auth, mais il faut veiller à ce que la valeur du contexte ne soit pas reconstruite trop souvent avec des objets volumineux.
- [src/contexts/CandidateSidebarContext.tsx](src/contexts/CandidateSidebarContext.tsx) et [src/contexts/EcoModeContext.tsx](src/contexts/EcoModeContext.tsx) sont des contextes globaux qui peuvent générer des re-rendus sur les sous-arbres si leurs valeurs ne sont pas mémorisées proprement.
- Les hooks de page comme [src/hooks/pages.ts](src/hooks/pages.ts) et [src/features/jobs/hooks/useJobs.ts](src/features/jobs/hooks/useJobs.ts) reconstruisent volontairement des états à chaque chargement, ce qui est acceptable, mais il faut éviter les mises à jour inutiles si l’input n’a pas changé.

### 3.2 Listes et tableaux volumineux

Aucune virtualisation visible n’est mise en place pour les listes lourdes. Or, si les pages de candidats ou d’offres deviennent volumineuses, l’interface risque de ralentir.

Zones concernées :
- les pages de liste d’offres et de candidats si elles contiennent beaucoup d’éléments ;
- les écrans de notifications / applications si la quantité de données augmente.

Pour ces cas, une virtualisation avec `@tanstack/react-virtual` ou `react-window` serait intéressante.

### 3.3 Images et assets

Le dépôt contient déjà un composant dédié [src/components/EcoImage.tsx](src/components/EcoImage.tsx), ce qui est une bonne base. Il faut néanmoins vérifier systématiquement :
- présence de dimensions explicites pour les images;
- utilisation de `loading="lazy"` pour les images hors écran ;
- usage de formats modernes comme WebP/AVIF si disponible ;
- compression et dimensions des images lourdes dans les pages publiques.

Le build actuel produit des images volumineuses dans le bundle (ex. hero image de plusieurs Mo), ce qui suggère que l’optimisation du packaging des assets mérite une attention particulière.

### 3.4 Recommandations prioritaires

1. Introduire une mémorisation plus fine des valeurs de contexte (`useMemo`) pour éviter les re-rendus de sous-arbres non nécessaires.
2. Prévoir la virtualisation pour les listes potentielles longues.
3. Auditer systématiquement les composants d’image et les assets statiques pour réduire leur poids et éviter le chargement prématuré.

---

## 4. Build Tooling & Configuration Vite

### 4.1 Configuration Vite actuelle

La configuration dans [vite.config.ts](vite.config.ts) est fonctionnelle, mais relativement minimaliste.

Points observés :
- Pas de `build.rollupOptions.output.manualChunks` pour séparer clairement les chunks de vendor, UI, pages publiques, pages candidates, etc.
- Pas de configuration de compression supplémentaire (gzip/brotli) au-delà de la compression par défaut fournie par l’outil de build et/ou de l’infrastructure de déploiement.
- Les dépendances de build sont bien intégrées, mais la séparation de chunks n’est pas exploitée au maximum.

### 4.2 Recommandations de build

1. Définir des chunks manuels cohérents afin d’isoler :
   - React / runtime
   - UI libraries
   - pages publiques
   - feature candidate
   - feature admin
2. Activer une compression plus forte côté build ou côté plateforme si l’infrastructure l’autorise.
3. Examiner les assets générés après build pour identifier les images et CSS trop volumineux.

---

## 5. Plan d’Action Priorisé

| Priorité | Optimisation | Impact | Effort | Zones concernées |
|---|---|---|---|---|
| 1 | Introduire React Query / SWR pour les listes et données métier | Élevé | Moyen | [src/features/jobs/hooks/useJobs.ts](src/features/jobs/hooks/useJobs.ts), [src/hooks/pages.ts](src/hooks/pages.ts), [src/shared/services/candidateProfileService.ts](src/shared/services/candidateProfileService.ts) |
| 2 | Remplacer les `select("*")` et projections trop larges par des colonnes explicites | Élevé | Facile | [src/features/jobs/api/jobsApi.ts](src/features/jobs/api/jobsApi.ts), [src/integrations/supabase/notifications.ts](src/integrations/supabase/notifications.ts) |
| 3 | Ajouter un chunking manuel Vite plus fin (vendor / UI / pages publiques / candidate / admin) | Élevé | Moyen | [vite.config.ts](vite.config.ts), [src/App.tsx](src/App.tsx) |
| 4 | Optimiser l’empreinte des images et assets statiques (formats, dimensions, lazy loading) | Moyen | Moyen | [src/components/EcoImage.tsx](src/components/EcoImage.tsx), [src/pages/public/HomePage.tsx](src/pages/public/HomePage.tsx), [src/pages/public/BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx) |
| 5 | Introduire la virtualisation pour les listes longues | Moyen | Moyen | Pages de listes offres/candidats/notifications si elles grossissent |
| 6 | Mémoriser finement les valeurs de contexte et éviter les re-rendus inutiles | Moyen | Facile / Moyen | [src/contexts/CandidateSidebarContext.tsx](src/contexts/CandidateSidebarContext.tsx), [src/contexts/EcoModeContext.tsx](src/contexts/EcoModeContext.tsx), [src/App.tsx](src/App.tsx) |
| 7 | Réduire l’utilisation de barrels très larges pour les pages afin de faciliter le tree-shaking | Moyen | Facile | [src/pages/public/index.ts](src/pages/public/index.ts), [src/pages/index.ts](src/pages/index.ts) |

## Conclusion

L’optimisation de l’authentification a déjà été correctement traitée et a supprimé la grande cause de latence liée à la cascade de requêtes d’auth. Les prochaines opportunités de gain de performance sont maintenant surtout concentrées sur :
- la réduction des requêtes réseau métier répétitives ;
- l’amélioration du découpage du bundle ;
- l’optimisation des données transférées depuis Supabase ;
- la préparation de la virtualisation et de la compression des assets.

Ces actions devraient apporter un gain significatif sur le temps de chargement initial, la fluidité de navigation et la stabilité du rendu sur des données plus volumineuses.
