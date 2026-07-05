# Audit d’architecture - EmploiPlus Group

Date : 2026-07-04
Type : audit statique et de build sans modification de fichiers

## 1. Résumé exécutif

Le projet présente une base fonctionnelle mais un mélange clair d’architectures et de couches qui augmente le risque de bugs, de régressions et de maintenance coûteuse.

Les signes les plus visibles sont :
- coexistence d’un frontend React/Vite moderne avec des vestiges d’une architecture plus ancienne basée sur TanStack Start,
- présence de fichiers alternatifs et de pages de remplacement dans le dossier des pages candidat,
- API Vercel présentes dans le dossier api mais avec des dépendances et conventions qui ne sont pas entièrement alignées avec l’architecture actuelle,
- erreurs TypeScript réelles observées à la compilation, donc la base n’est pas encore saine,
- nombreux fichiers de debug, scripts temporaires, rapports et assets non essentiels au runtime.

Le risque principal n’est pas seulement “du code mal organisé” : il y a déjà des signes de non-conformité technique qui peuvent casser des déploiements futurs ou rendre les corrections difficiles.

---

## 2. Architecture générale

### 2.1 Architecture observée

Le projet suit globalement une architecture React + TypeScript + Vite avec :
- frontend dans src/
- backend/serverless dans api/
- Supabase comme couche de données/auth
- Vercel comme cible de déploiement

Cette séparation est globalement correcte, mais elle n’est pas entièrement propre car plusieurs éléments indiquent un mélange d’anciennes et de nouvelles approches.

### 2.2 Incohérences détectées

1. Architecture hybride
- Le projet contient des traces d’une architecture TanStack Start via des fichiers comme :
  - src/start.ts
  - src/server.ts
  - src/integrations/supabase/auth-middleware.ts
  - src/integrations/supabase/auth-attacher.ts
- Or le frontend actuel semble basé sur React Router standard et Vite, avec App.tsx utilisant react-router-dom.
- Cela indique une migration incomplète ou un code laissé en place après une transition.

2. Pages alternatives et fichiers de compatibilité
- Le dossier src/pages/candidate contient un fichier nommé CandidateDashboardPage-old.tsx.
- Il existe aussi CandidateDashboardPage.tsx et CandidateDashboardPageModern.tsx.
- Cela suggère une ancienne implémentation encore présente et potentiellement non utilisée, mais source de confusion.

3. Dossiers et fichiers qui ne correspondent pas à une architecture unique
- src/pages/public contient une structure mixte public/ + services/ + UtilityPages.tsx et plusieurs pages “service”.
- Les composants sont dispersés entre src/components/site, src/components/page, src/components/admin, src/components/candidate, src/components/ui.
- L’organisation est fonctionnelle mais pas parfaitement homogène.

### 2.3 Dossiers potentiellement obsolètes

- src/start.ts : semble lié à une architecture plus ancienne / différente.
- src/server.ts : très probablement un vestige de l’ancienne stack.
- src/integrations/supabase/auth-middleware.ts : dépend de modules non présents dans la configuration actuelle.
- src/integrations/supabase/auth-attacher.ts : même constat.
- src/pages/candidate/CandidateDashboardPage-old.tsx : fichier de compatibilité/ancien doublon.
- src/pages/candidate/CandidateDashboardPageModern.tsx : probablement une version expérimentale ou alternative.

---

## 3. Doublons et redondances

### 3.1 Doublons de rôle / logique

1. Pages tableau de bord candidat
- Fichiers concernés :
  - src/pages/candidate/CandidateDashboardPage.tsx
  - src/pages/candidate/CandidateDashboardPageModern.tsx
  - src/pages/candidate/CandidateDashboardPage-old.tsx
- Problème : plusieurs implémentations concurrentes pour la même zone fonctionnelle.
- Recommandation : conserver une seule implémentation, de préférence la version la plus stable et la plus utilisée.

2. Auth middleware / attacher Supabase
- Fichiers concernés :
  - src/integrations/supabase/auth-middleware.ts
  - src/integrations/supabase/auth-attacher.ts
- Problème : même domaine fonctionnel, dépendances de l’ancienne stack TanStack Start, non clairement intégrés à l’architecture réelle du projet.
- Recommandation : supprimer ou archiver si non utilisés, sinon les migrer vers un seul mécanisme d’auth centralisé.

3. Fichiers de service / page utilitaire
- Fichiers concernés :
  - src/pages/public/UtilityPages.tsx
  - src/pages/public/ServicesPage.tsx
  - src/pages/public/services/HubEmploiPage.tsx
- Problème : la logique de services et pages utilitaires est dispersée, ce qui pose un risque de duplication et d’incohérence.
- Recommandation : centraliser les pages de services et de contenu détaillé dans une structure claire.

### 3.2 Doublons de fichiers/ressources

1. Fichiers robots
- public/robots.txt
- src/assets/robots.txt
- Problème : duplication de fichiers robots, mauvaise localisation (un dans public, un dans src/assets).
- Conserver : public/robots.txt
- Supprimer/éliminer : src/assets/robots.txt

2. Fichiers favicon / logo
- public/favicon.ico
- src/assets/favicon.ico
- public/Logo.png
- src/assets/logo_monago-zUYR3nnk.jpg
- src/assets/logo-monago.jpg
- Problème : plusieurs assets de marque et d’icône, certains inutilisés ou redondants.
- Recommandation : conserver un seul favicon et un seul logo officiel, supprimer les variantes non référencées.

3. Rapports et documents de debug
- Beaucoup de fichiers .md / .txt / .mjs / .js de debug ou de suivi sont présents à la racine.
- Ils ne sont pas des sources de runtime et ne doivent pas être mélangés au cœur du projet.

### 3.3 Fichiers à conserver / à supprimer (recommandation)

- Conserver : src/pages/candidate/CandidateDashboardPage.tsx
- Supprimer/archiver : src/pages/candidate/CandidateDashboardPage-old.tsx
- Conserver : src/pages/candidate/CandidateDashboardPageModern.tsx seulement si elle remplace réellement l’ancienne implémentation ; sinon la retirer.
- Conserver : src/pages/public/UtilityPages.tsx si elle est réellement utilisée par l’app ; sinon la déplacer vers une structure plus claire.
- Supprimer/archiver : src/start.ts et src/server.ts si le projet n’utilise plus TanStack Start.
- Supprimer/archiver : src/integrations/supabase/auth-middleware.ts et src/integrations/supabase/auth-attacher.ts si non utilisés.

---

## 4. Mauvais emplacement

### 4.1 Fichiers mal placés ou hors de leur logique

1. src/start.ts
- Ce fichier est un indice d’une ancienne architecture de framework.
- Il ne devrait pas vivre au niveau racine de src si le projet n’est plus basé sur cette stack.

2. src/server.ts
- Similaire : fichier de serveur / runtime d’ancienne architecture, probablement hors de la logique actuelle du projet.

3. src/assets/robots.txt
- Un fichier de robots est normalement dans public/ et non dans src/assets.

4. Scripts de test / debug à la racine
- Scripts comme temp-send-email-hook-test.js, temp-send-email-hook-test.mjs, temp-smtp-test.mjs, generate-curl-test.mjs, curl-test.sh, debug-vite.txt, build-output.txt, vercel-build-debug.txt sont des artefacts de debug et ne devraient pas être au niveau racine du projet.

5. Fichiers de documentation de travail à la racine
- Plusieurs fichiers .md de suivi, d’audit et d’implémentation sont à la racine alors qu’ils devraient être classés dans un dossier docs/ ou docs/archive/.

### 4.2 Mélange Frontend / Backend

- src/ contient encore des fichiers de runtime/architecture plus “backend” ou “framework” (src/start.ts, src/server.ts), ce qui est un mélange non souhaité.
- api/ contient bien les fonctions backend/serverless, ce qui est correct.
- En revanche, il existe encore des références à une logique d’ancienne stack dans src/, ce qui rend la frontière moins nette.

---

## 5. Séparation Frontend / Backend

### 5.1 Etat actuel

- src/ : contient principalement du frontend React/Vite.
- api/ : contient bien les fonctions Vercel/Node.

### 5.2 Problèmes

- Le contenu de src/ n’est pas strictement “frontend pur” à cause de fichiers de runtime/stack ancienne.
- Les imports vers des modules liés à TanStack Start dans src/integrations/supabase sont un mélange de logique de domaine et de framework.
- Si une future refonte du backend est envisagée, la séparation devra être plus stricte pour éviter des dépendances invisibles.

---

## 6. Imports et dépendances

### 6.1 Problèmes observés

1. Imports cassés / non compatibles
- La compilation TypeScript a détecté une dépendance non résolue : @tanstack/react-start.
- Cela signifie que le code actuel n’est pas complètement cohérent avec les dépendances installées.

2. Imports vers un modèle d’architecture ancienne
- Les fichiers auth-middleware.ts et auth-attacher.ts importent des modules de TanStack Start qui ne sont pas disponibles dans la configuration actuelle.

3. Imports potentiellement dangereux ou incohérents
- Plusieurs pages appellant des composants ou des hooks semblent avoir été migrées partiellement, ce qui explique les erreurs de typage sur des propriétés attendues mais absentes.

4. Alias et chemins
- L’alias @/ est présent dans tsconfig.json et vite.config.ts, ce qui est bon.
- En revanche, l’existence de fichiers de runtime et d’imports de stack ancienne rend cet alias moins fiable sur le long terme.

### 6.2 Recommandation

- Supprimer ou neutraliser toutes les références à TanStack Start si le projet ne l’utilise plus.
- Vérifier tous les imports de pages et composants après chaque migration de pages.

---

## 7. TypeScript

### 7.1 Points positifs

- tsconfig.json est globalement sensé pour un projet React/Vite.
- moduleResolution: Bundler est adapté à Vite.
- jsx: react-jsx est correct.
- strict: true est une bonne pratique.

### 7.2 Problèmes constatés

1. La compilation TypeScript échoue réellement
- Commande exécutée : npx tsc --noEmit
- Résultat : 51 erreurs dans 18 fichiers.

2. Les erreurs ne sont pas anecdotiques
- Elles touchent :
  - types de Supabase / DB mal alignés,
  - propriétés attendues absentes sur les types,
  - imports incompatibles avec @tanstack/react-start,
  - composants mal typés (Badge variant, props de CandidateTopbar, etc.).

3. tsconfig.json exclut certains fichiers mais pas tous les fichiers “hors scope”
- Les exclusions actuelles ne couvrent pas entièrement les composants d’ancienne architecture.

### 7.3 Incohérences avec Vercel

- Le projet semble vouloir être compatible Vercel, mais la présence de code lié à une stack différente dans src/ peut entraîner des problèmes à l’exécution ou au build si des imports non résolus sont inclus par erreur.
- La configuration de TypeScript ne protège pas encore suffisamment la frontière entre frontend et API.

---

## 8. Build et Vercel

### 8.1 Résultat du build Vite

Commande exécutée : npm run build

Résultat observé :
- le build Vite réussit,
- il produit dist/,
- il génère des warnings de chunks volumineux,
- un warning d’import dynamique redondant / incohérent a été observé :
  - src/pages/public/UtilityPages.tsx est dynamiquement importé dans App.tsx, mais aussi statiquement importé dans src/pages/public/index.ts.

### 8.2 Risques de build Vercel

- Le build Vite passe, donc le frontend est globalement compilable.
- Mais la présence de fichiers de runtime/architecture ancienne dans src/ représente un risque si l’environnement Vercel ou les dépendances changent.
- Les fonctions API dans api/ semblent structurées comme des handlers Vercel, ce qui est cohérent.
- En revanche, la logique métier autour de l’auth et du mailing semble être dispersée et parfois dupliquée.

### 8.3 Backend compilé ?

- Le backend Vercel n’a pas été vérifié comme une compilation indépendante au sens strict, mais les fichiers api/ suivent une forme de handler Node/TypeScript plausible.
- L’incohérence majeure n’est pas la compilation elle-même, mais l’architecture autour de la séparation API et frontend.

---

## 9. Vercel Functions

### 9.1 Structure observée

Les fichiers présents dans api/ sont :
- confirm.ts
- password-reset-confirm.ts
- password-reset-request.ts
- password-reset-validate.ts
- register.ts
- send-email.ts
- lib/transactional-email.ts
- lib/password-reset-utils.ts

C’est globalement cohérent avec une architecture de serverless sur Vercel.

### 9.2 Risques détectés

1. Imports internes non homogènes
- Les handlers importent des utilitaires locaux, ce qui est correct.
- Mais certains fichiers de runtime ou de support semblent être conçus pour une autre stack que l’environnement actuel.

2. Risque d’ignorer des fichiers utiles lors du déploiement
- Si des utilitaires sont déplacés ou ajoutés sans être référencés correctement, ils peuvent être oubliés.
- Le projet n’a pas d’architecture explicite garantissant la “surface” des fonctions API.

3. Fichiers à vérifier côté Vercel
- Les handlers d’email et d’auth sont sensibles à l’environnement et à la présence de variables d’environnement.
- Les logs de debug dans ces fichiers ajoutent de la complexité et du bruit à la production.

---

## 10. Fichiers morts / temporaires / inutilisés

### 10.1 Fichiers de debug et temporaires

- build-output.txt
- debug-vite.txt
- vercel-build-debug.txt
- temp-send-email-hook-test.js
- temp-send-email-hook-test.mjs
- temp-smtp-test.mjs
- curl-test.sh
- generate-curl-test.mjs
- scripts/test-smtp.js
- scripts/test-token-symmetry.cjs
- scripts/test-token-symmetry.js

### 10.2 Rapports et documents de suivi

- AUDIT_POST_REFACTORING.md
- REFACTORING_REPORT.md
- CANDIDATE_APPLY_PAGE_IMPLEMENTATION.md
- CANDIDATE_NOTIFICATIONS_IMPLEMENTATION.md
- SEND_EMAIL_HOOK_DEPLOYMENT.md
- emploi.md
- emploidesc.md
- descrip.md
- env.md
- vite.md
- arbo.md
- tree.md

### 10.3 Fichiers potentiellement inutilisés ou obsolètes

- src/pages/candidate/CandidateDashboardPage-old.tsx
- src/start.ts
- src/server.ts
- src/integrations/supabase/auth-middleware.ts
- src/integrations/supabase/auth-attacher.ts
- src/assets/robots.txt
- nombreux assets de branding et images non référencés dans le code ou dans les routes publiques.

---

## 11. Documentation

### 11.1 Documentation à déplacer vers un dossier docs/

Les fichiers suivants devraient être regroupés dans un dossier docs/ ou docs/archive/ :
- AUDIT_POST_REFACTORING.md
- REFACTORING_REPORT.md
- CANDIDATE_APPLY_PAGE_IMPLEMENTATION.md
- CANDIDATE_NOTIFICATIONS_IMPLEMENTATION.md
- SEND_EMAIL_HOOK_DEPLOYMENT.md
- arbo.md
- tree.md
- emploi.md
- emploidesc.md
- descrip.md
- env.md
- vite.md
- build-output.txt
- debug-vite.txt
- vercel-build-debug.txt

### 11.2 Justification

Ces fichiers ne sont ni des fichiers de runtime ni des fichiers de configuration active. Ils doivent être archivés ou déplacés pour garder la racine propre.

---

## 12. Assets

### 12.1 Problèmes détectés

1. Doublons d’assets de marque
- favicon.ico présent dans public/ et src/assets/
- logo / variantes d’image présentes plusieurs fois

2. Images lourdes non optimisées
- Le build a généré plusieurs images de grande taille dans dist/.
- Cela indique une probabilité d’assets trop lourds dans le frontend.

3. Robots.txt dupliqué
- public/robots.txt et src/assets/robots.txt

### 12.2 Recommandation

- Définir un ensemble minimal d’assets de production.
- Supprimer les variantes non utilisées.
- Déplacer les assets de runtime vers public/ uniquement si le frontend les charge directement.

---

## 13. Sécurité

### 13.1 Risques observés

1. Secrets et variables sensibles
- Les fonctions API utilisent fortement process.env et des secrets d’authentification.
- Le code n’est pas forcément dangereux en soi, mais la logique de configuration et de logging rend la surface de sécurité plus exposée.

2. Logs de debug potentiellement sensibles
- Les handlers de confirm/register log des informations sensibles (token, secrets, body, payload) dans la sortie console.
- Cela est mauvais pour la sécurité et la traçabilité.

3. Imports non sécurisés / non propres
- L’architecture hybride augmente le risque d’imports non contrôlés et de dépendances non auditées.

### 13.2 Recommandation

- Éliminer les logs de secrets et de tokens sensibles.
- Centraliser l’accès aux variables d’environnement.
- Restreindre la logique d’auth à un seul point d’entrée.

---

## 14. Performance

### 14.1 Observations

1. Bundle volumineux
- Le build Vite indique des chunks grands et un bundle principal de plus de 500 kB.
- C’est un risque de performance perçu.

2. Chargement de pages lourdes
- App.tsx charge beaucoup de pages en lazy loading, mais la structure reste très dense, ce qui peut nuire à l’expérience utilisateur et au rendement du navigateur.

3. Assets lourds
- Plusieurs images volumineuses sont intégrées au site, ce qui augmente le temps de chargement initial.

### 14.2 Recommandations

- Décomposer davantage les routes lourdes.
- Optimiser les images et retirer les assets inutilisés.
- Supprimer les anciennes implémentations qui alourdissent le code et l’arborescence.

---

## 15. Arborescence cible idéale

Une structure plus propre serait la suivante :

```text
project/
  api/
    auth/
    email/
    lib/
  public/
    assets/
    favicon.ico
    robots.txt
  src/
    app/
      App.tsx
      routes.tsx
    components/
      admin/
      candidate/
      site/
      ui/
    features/
      auth/
      jobs/
      blog/
      candidates/
      notifications/
    hooks/
    integrations/
      supabase/
    lib/
    pages/
      admin/
      candidate/
      public/
    styles/
    types/
  docs/
    architecture/
    audits/
    runbooks/
  scripts/
    maintenance/
  tests/
    api/
    unit/
```

### Objectif

- Un frontend strictement orienté UI dans src/.
- Un backend serverless strictement orienté API dans api/.
- Une séparation claire entre pages, features, composants et intégrations.
- Une zone docs/ dédiée aux documents techniques et historiques.

---

## 16. Plan de nettoyage en étapes indépendantes

### Étape 1 - Clarifier l’architecture actuelle
- Identifier précisément les fichiers encore liés à TanStack Start.
- Désactiver ou archiver les fichiers de runtime non utilisés.
- Ajouter une règle de gouvernance : src/ = frontend pur, api/ = serverless backend.
- Risque : faible si l’archivage est sélectif et ne touche pas aux routes actives.

### Étape 2 - Supprimer les doublons et fichiers de compatibilité
- Supprimer CandidateDashboardPage-old.tsx.
- Choisir une seule implémentation de dashboard candidat.
- Supprimer les fichiers d’auth middleware/attacher s’ils ne sont plus utilisés.
- Risque : moyen, mais contrôlable si la sélection se fait après vérification des imports.

### Étape 3 - Nettoyer les assets et la racine
- Déplacer les documents techniques vers docs/.
- Supprimer les scripts temporaires et fichiers de debug.
- Unifier favicon/robots/logo.
- Risque : faible.

### Étape 4 - Corriger la base TypeScript
- Résoudre les 51 erreurs TypeScript identifiées.
- Alignement des types Supabase et des types métier.
- Risque : moyen.

### Étape 5 - Rationaliser les imports et la structure des pages
- Éliminer les imports inutiles ou incohérents.
- Clarifier la structure src/pages/public et src/pages/candidate.
- Risque : moyen.

### Étape 6 - Optimiser les performances et la prod
- Décomposer les bundles lourds.
- Optimiser la gestion des assets.
- Vérifier le comportement Vercel et les fonctions API en production.
- Risque : faible à moyen.

---

## 17. Problèmes prioritaires à corriger en premier

### Priorité haute
- Les erreurs TypeScript réelles observées par la compilation.
- Les imports liés à @tanstack/react-start non résolus.
- Les implémentations concurrentes de CandidateDashboardPage.

### Priorité moyenne
- Fichiers de debug, scripts temporaires et rapports techniques à la racine.
- Doublons d’assets et robots.txt.
- Structure des pages publiques/services encore dispersée.

### Priorité basse
- Optimisation des assets et du bundle.
- Rangement documentaire.

---

## 18. Conclusion

Le projet n’est pas “cassé” au sens strict du build Vite, mais il n’est pas non plus dans un état d’architecture saine pour une maintenance durable.

Les principaux dangers sont :
- mélange d’anciennes et nouvelles architectures,
- doublons fonctionnels,
- typage non fiable,
- possible confusion des responsabilités entre frontend et backend,
- accumulation de fichiers temporaires et de documentation de travail à la racine.

Le meilleur levier de stabilité n’est pas une correction “rapide”, mais un nettoyage progressif et indépendant par étapes, en commençant par la suppression des artefacts obsolètes et la normalisation des types et imports.
