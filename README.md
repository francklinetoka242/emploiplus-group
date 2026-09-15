# Synthèse technique

### Technologie

- **Projets techniques** : Emploi+ est une application web de recrutement destinée aux candidats et aux administrateurs. Elle couvre notamment la consultation d’offres, les candidatures, la gestion de profils, les notifications, la génération de CV et l’assistance conversationnelle.
- **Architecture** : Le frontend repose sur React 19, TypeScript et Vite. Le code est organisé par domaines (`features`), composants réutilisables, pages, services, hooks et contextes. Le routage est assuré par React Router et les formulaires sont gérés avec React Hook Form et Zod.
- **Infrastructure** : Le frontend statique et les endpoints backend sont hébergés sur Vercel. Supabase fournit la base PostgreSQL, l’authentification et les fonctions associées. Les communications avec le backend passent par des API HTTP et le client `@supabase/supabase-js`.
- **Déploiements** : La commande `npm run build` compile l’application avec Vite puis lance le prérendu. Vercel utilise cette commande, publie le dossier `dist` et redirige les routes applicatives vers `index.html`. Les routes `/api` sont exposées comme fonctions serverless.
- **Sécurité** : Les secrets et clés de service sont conservés dans des variables d’environnement. L’authentification est centralisée dans Supabase ; les droits doivent être vérifiés côté serveur et renforcés par les politiques RLS de la base. Les contenus Markdown sont traités avec des mécanismes de sanitation lorsqu’ils sont rendus dans l’interface.
- **Comptes & accès** : Les parcours comprennent l’inscription, la confirmation d’adresse e-mail, la connexion et la réinitialisation du mot de passe. Les espaces candidats et administrateurs sont protégés par des contrôles de rôle et des permissions spécifiques, notamment pour les notifications et la gestion des offres.
- **Documentation technique** : Les documents de référence comprennent `AUDIT-DESIGN.md`, les README des modules, les diagnostics d’authentification et les rapports du dossier `diagnostic-reports`. Les scripts `scripts/` servent aux vérifications, aux diagnostics, au prérendu et à la génération d’embeddings pour les offres.

### Pilotage

- **Roadmap produit** : Prioriser les évolutions autour du parcours candidat, de la recherche d’offres, des candidatures, de l’espace administrateur et de l’assistant Maëlise. Chaque évolution doit être reliée à un besoin utilisateur, un périmètre, un responsable et un critère d’acceptation.
- **Bugs & incidents** : Centraliser les anomalies avec leur environnement, leur gravité, les étapes de reproduction, l’impact utilisateur et le statut. Les diagnostics d’authentification, les rapports de `diagnostic-reports/` et les tests automatisés servent de supports d’analyse.
- **Améliorations** : Suivre séparément les demandes fonctionnelles, les optimisations UX, les performances et les besoins d’accessibilité. Valider chaque changement par un test ciblé, une vérification du build et, pour les évolutions visuelles, un contrôle dans le navigateur.
- **Dette technique** : Surveiller les erreurs TypeScript, les dépendances, la couverture des tests, la duplication de logique, les règles RLS et les parcours API. Traiter en priorité les sujets qui augmentent le risque de sécurité, de régression ou de blocage des déploiements.
