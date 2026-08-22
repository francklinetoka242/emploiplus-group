# Audit fonctionnel EmploiPlus

## 1. Résumé

Le site présente une base fonctionnelle solide pour un parcours de recrutement en ligne : navigation publique structurée, catalogue d'offres, détail d'offre, espace candidat complet sur le plan des écrans, authentification, profil, documents, candidature et notifications. La structure de route et les services Supabase sont bien en place.

En revanche, plusieurs parcours sont seulement partiellement aboutis ou trop dépendants d'éléments visuels. Les vraies faiblesses sont surtout sur la conversion candidat, la cohérence des données et la transformation des fonctionnalités existantes en expérience réellement utile et continue. Le principal risque n'est pas l'absence de fonctionnalités, mais leur fragmentation et leur sous-exploitation.

## 2. Fonctionnalités existantes

- Navigation publique : accueil, services, page d'offres, détail d'offre, blog, FAQ, contact, legal, CGU, politique de confidentialité.
- Recherche d'emploi : recherche textuelle, filtres par contrat, localisation, entreprise, domaine, salaire, tri par date/pertinence/salaire.
- Parcours candidat : inscription, connexion, confirmation e-mail, mot de passe oublié, réinitialisation, tableau de bord, profil, expériences, formations, compétences, langues, préférences, documents, candidatures, offres enregistrées, notifications, paramètres, abonnement.
- Candidature : parcours de candidature dédié à partir d'une offre, avec vérification du cooldown de 30 jours, lettre de motivation et pièces jointes.
- Recommandations : offres recommandées sur la base d'un profil candidat et d'un CV/embedding.
- Communication : e-mail de contact public, notifications internes, gestion d'alertes dans le dashboard.
- SEO : titres, meta, canonical, données structurées sur les offres, pages publiques consacrées.

## 3. Fonctionnalités manquantes ou améliorables

- Parcours d'inscription vers candidature rapide : le site propose une forte promesse de parcours candidat, mais l'étape de profil complet reste trop longue avant la première candidature.
- Suivi de candidature réel mais peu exploité : le statut est présent, mais le candidat n'a pas de timeline d'avancement claire ni de relance automatique.
- Offres enregistrées limitées à 5 : utile, mais pas assez intégré au parcours de conversion ou de relance.
- Recommandations IA : fonctionnelles techniquement, mais dépendantes d'un profil complété et surtout d'un CV/embedding exploitable. Hors ce cas, il n'y a pas de vraie conversion guidée.
- Alerte emploi / alertes personnalisées : il existe des intentions de recommandation et de notification, mais pas de vrai système d'alertes par email ou SMS sur les nouvelles offres correspondantes.
- CRM candidat incomplet : le dashboard montre des éléments, mais il n'existe pas de vrai “next best action” pour guider le candidat vers la prochaine étape.
- Rôle public fonctionnel mais peu orienté acquisition : les CTA sont présents, mais il manque une logique de conversion continue depuis la page d'offre jusqu'à la candidature finalisée.

## 4. Problèmes fonctionnels détectés

- Persistance incohérente : les documents candidat sont stockés localement, alors que le profil candidat et les applications sont centralisés dans Supabase. Cela crée des écarts de données et des risques de synchronisation.
- Duplication fonctionnelle visible : /candidate/saved-jobs et /candidate/saved-offers, /candidate/account et /candidate/settings, /candidate/creation et /candidate/documents, etc. Cela augmente la confusion et fragilise la découverte.
- Parcours public/candidat non homogènes : le même objet “offre” est accessible en public et en candidat, mais la logique de CTA et de postulation est dispersée entre plusieurs routes.
- Certaines zones semblent plus complètes côté interface que côté expérience utilisateur : le dashboard expose de nombreuses actions, mais le “chemin critique” vers candidature est encore trop long.
- Absence de vrai canal de communication post-candidature : le système de notifications existe, mais il ne semble pas transformer l'engagement en relance utile pour l'utilisateur.
- États vide et erreur présents, mais pas toujours orientés vers une action concrète : recommencer, compléter le profil, se connecter, ajouter un CV, etc.
- L'application publique de contact est bien connectée à une API email, mais le reste de la communication candidat est peu piloté par le parcours utilisateur.

## 5. Opportunités à forte valeur

- Parcours d'onboarding guidé : “Inscription → profil minimum → CV → première recommandation → première candidature”.
- Candidature rapide avec préremplissage : utiliser profil + CV + lettre de motivation réutilisable.
- Alertes emploi : nouvelles offres correspondant au profil, expirations proches, candidatures en cours.
- Tableau de bord orienté action : prioriser la prochaine étape plutôt que présenter des blocs de données séparés.
- Relance intelligente du candidat : “Votre profil est incomplet”, “Votre CV est ancien”, “Offres proches de votre profil”.
- Rapprochement entre offres enregistrées et candidatures : possibilité de rappeler des offres à relancer, sans avoir à tout retrouver manuellement.

## 6. Priorisation P0 → P3

### P0 — Critique
- Fonctionnalité : Parcours candidat complet de conversion
  - Zone concernée : Inscription → profil → candidatures.
  - État actuel : Inscription et connexion existent ; le profil est complet et les candidatures sont possibles, mais la conversion reste dépendante d'un profil très bien rempli.
  - Problème/opportunité : Le candidat peut se perdre entre les écrans et la vraie action de candidature ne semble pas suffisamment guidée.
  - Amélioration proposée : forcer/miner le profil minimum avant la première candidature, avec actions ciblées et un parcours unique en 3 étapes.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Moyenne.

- Fonctionnalité : Cohérence de persistance des données candidat
  - Zone concernée : Documents, profil, recommandations, CV.
  - État actuel : Les documents sont gérés localement dans le navigateur, tandis que le profil et les recommandations reposent sur Supabase.
  - Problème/opportunité : Risque de divergence, de données incomplètes et de comportement incohérent entre écrans.
  - Amélioration proposée : centraliser le référentiel de données critiques dans une source unique ou exposer clairement les règles de synchronisation.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Moyenne.

### P1 — Haute valeur
- Fonctionnalité : Candidature rapide et préremplie
  - Zone concernée : Offres et candidature.
  - État actuel : La candidature existe, avec cooldown et pièces jointes.
  - Problème/opportunité : La logique existe, mais l'expérience n'est pas assez fluide pour maximiser la conversion.
  - Amélioration proposée : générer automatiquement un résumé, réutiliser le CV et la lettre de motivation, simplifier le formulaire.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Moyenne.

- Fonctionnalité : Alertes emploi personnalisées
  - Zone concernée : Recommandations et jobs.
  - État actuel : Recommandations IA existantes, mais aucun mécanisme de notification proactive sur de nouvelles offres pertinentes.
  - Problème/opportunité : Manque un outil de réengagement qui transforme l'intérêt en retour sur le site.
  - Amélioration proposée : alertes par email/notification dès qu'une offre correspond à un profil ou à une recherche enregistrée.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Moyenne.

- Fonctionnalité : Suivi candidat orienté “prochaine action”
  - Zone concernée : Dashboard et applications.
  - État actuel : Le dashboard compte des modules, mais la logique de priorisation n'est pas très forte.
  - Problème/opportunité : Le candidat ne reçoit pas assez de signal clair sur la prochaine action à faire.
  - Amélioration proposée : “3 priorités”, “profil incomplet”, “offres proches”, “candidature à relancer”.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Faible à moyenne.

- Fonctionnalité : Offres enregistrées comme levier de conversion
  - Zone concernée : Offres enregistrées.
  - État actuel : La liste de sauvegarde existe et est limitée à 5.
  - Problème/opportunité : L'action “enregistrer” existe, mais elle ne produit pas assez de retour ni de relance utile pour convertir en candidature.
  - Amélioration proposée : rappeler les offres proches de l'expiration, proposer un “relancer plus tard” et un bouton “postuler” direct.
  - Valeur utilisateur : Élevée.
  - Complexité estimée : Faible à moyenne.

### P2 — Opportunité
- Fonctionnalité : Notifications plus utiles et exploitables
  - Zone concernée : Notifications utilisateur.
  - État actuel : Le système existe et est affiché, avec lecture, suppression et lecture globale.
  - Problème/opportunité : Les notifications semblent moins centralisées dans le parcours que les données métier elles-mêmes.
  - Amélioration proposée : catégoriser par “offre”, “candidature”, “profil”, “rappel”, et les relier à des actions.
  - Valeur utilisateur : Moyenne.
  - Complexité estimée : Faible à moyenne.

- Fonctionnalité : Compléter le parcours public de conversion vers candidat
  - Zone concernée : Landing services et pages d'offres.
  - État actuel : Les pages de services et d'offres sont bien construites visualement.
  - Problème/opportunité : Il manque un chemin de conversion plus fort depuis la page publique vers l'inscription, sans friction inutile.
  - Amélioration proposée : CTA plus orientés “je m'inscris”, “je crée mon profil”, “je postule en 1 clic”.
  - Valeur utilisateur : Moyenne.
  - Complexité estimée : Faible.

### P3 — Plus tard
- Fonctionnalité : Abonnements et plans mieux liés au réel usage
  - Zone concernée : Espace candidat / abonnement.
  - État actuel : Pages de forfaits présentes, mais pas clairement rattachées à un mécanisme de valeur réelle pour le candidat.
  - Problème/opportunité : Risque de pages techniques sans valeur fonctionnelle perçue.
  - Amélioration proposée : lier les forfaits à des avantages concrets et vérifiables, sans générer de confusion.
  - Valeur utilisateur : Faible à moyenne.
  - Complexité estimée : Moyenne.

- Fonctionnalité : Guides et contenus plus actionnables
  - Zone concernée : Espace candidat / guides / contenus.
  - État actuel : Des guides et contenus existent.
  - Problème/opportunité : Ils peuvent être plus utiles s'ils sont reliés directement à des étapes de profil ou de candidature.
  - Amélioration proposée : liens directs vers complétion du profil, CV, lettre de motivation, recherche d'emploi.
  - Valeur utilisateur : Faible à moyenne.
  - Complexité estimée : Faible.

## 7. Top 10 des fonctionnalités recommandées

1. Parcours d'inscription orienté conversion.
2. Profil minimum obligatoire avant candidature.
3. Candidature en 1 clic avec préremplissage.
4. Alertes nouvelles offres personnalisées.
5. Relance des offres enregistrées avant expiration.
6. Timeline claire de candidature et statut pédagogique.
7. Dashboard guidé par “prochaine action”.
8. Centralisation des données documents/profil/CV.
9. Notifications actionnables, catégorisées et contextualisées.
10. CTA de conversion plus direct sur les pages publiques et d'offre.

