# Analyse Fonctionnelle et Idéation - Espace Candidat EmploiPlus Group

## 1. Fonctionnement Actuel du Parcours Candidat
- **L'expérience utilisateur :**
  - Connexion : le candidat s'authentifie via Supabase (email/mot de passe ou lien magique). Après authentification il est redirigé vers son tableau de bord candidat.
  - Dashboard : page centrale présentant un résumé (offres sauvegardées, candidatures récentes, notifications). L'utilisateur peut accéder à son profil, aux offres et aux sections de gestion (CV, favoris, candidatures).
  - Complétion du profil : le candidat peut compléter son profil utilisateur (informations personnelles, compétences, historique professionnel) et téléverser un CV via l'interface dédiée ou choisir un modèle. Le CV est stocké (Supabase Storage ou table dédiée).
  - Recherche et navigation : le candidat parcourt les offres via les pages de recherche/listing, filtre les résultats et peut sauvegarder des offres en favoris.
  - Postuler : en cliquant sur « Postuler », le front envoie une requête à une API interne qui enregistre la candidature (référence à l'offre, id candidat, CV, message). Un écran de confirmation s'affiche.
  - Suivi : le candidat retrouve l'historique de ses candidatures dans son espace (liste chronologique, statut basique : envoyé/consulté).
  - Notifications : confirmations par e-mail (via les routes serveur / lambdas existantes) et notifications in-app minimales (bannière/alertes) lors d'événements clés (candidature envoyée, reset mot de passe, etc.).

- **Mécanique technique :**
  - Authentification : Supabase Auth gère les sessions utilisateur et les tokens. Les routes côté serveur (fichiers `api/*.ts`) valident l'utilisateur via le token et effectuent les écritures en base.
  - Données : le profil candidat, favoris et historique de candidatures sont persistés en Postgres via Supabase (tables `profiles`, `favorites`, `applications` ou équivalentes). Les fichiers CV sont stockés dans Supabase Storage.
  - Actions serveur : l'envoi d'e-mails et la logique métier (validation de candidature, reset) passent par des fonctions/Endpoints (`api/*.ts`) et utilitaires (`lib/transactional-email.ts`, `lib/password-reset-utils.ts`).
  - Temps réel / notifications : usage limité de Realtime ; la majorité des notifications est gérée via e-mail et rafraîchissement côté client.

## 2. Les Limites de l'Expérience Actuelle
- Manque de personnalisation : peu (ou pas) de recommandations proactives basées sur le profil ou l'historique.
- Suivi trop basique : statuts de candidature rudimentaires (soumis/lu) sans timeline détaillée ni feedback employeur.
- Peu d'interaction : pas d'échange direct candidat-recruteur ou d'outils pour organiser entretiens depuis la plateforme.
- Découverte d'offres limitée : pas de matching avancé (scoring, classement personnalisé) ou d'alertes fines basées sur compétences et préférences.
- Aide à la candidature absente : pas d'analyse automatique du CV, de suggestions de mots-clés ou d'optimisation pour l'offre.
- Engagement et onboarding : pas de micro-interactions guidant la complétion du profil ni de gamification pour encourager la complétude.

## 3. Top 5 des Nouvelles Fonctionnalités à Développer
[Propositions concrètes, pragmatiques et compatibles React + Supabase]

### ### 1. Matching Automatisé et Alerte Emploi Enrichie
- **Le concept :** moteur de matching qui compare le profil (compétences, expérience, localisation) et le contenu du CV aux offres, et envoie des alertes intelligentes (email + in-app).
- **La valeur ajoutée :** le candidat reçoit des opportunités pertinentes sans recherche active ; meilleure qualité des candidatures et engagement augmenté.
- **Faisabilité technique (React/Supabase) :** stocker des champs indexés (skills, tags, lieu) dans Supabase Postgres, utiliser des vues matérialisées ou requêtes full-text pour scorer offres; exécuter un job côté serveur (cron ou fonction) qui calcule un score et écrit des recommandations dans une table `recommendations`. Le front récupère ces recommandations via API/Realtime pour notification in-app.

### ### 2. Timeline de Candidature et Statuts Riches
- **Le concept :** vue visuelle par candidature (timeline) montrant étapes : reçu, examiné, shortlisté, entretien proposé, rejet, embauche. Possibilité d'afficher feedbacks ou pièces jointes (notes RH).
- **La valeur ajoutée :** transparence du process pour le candidat, réduction de l'anxiété et fidélisation par visibilité sur l'avancement.
- **Faisabilité technique (React/Supabase) :** ajouter une table `application_events` liée à `applications` ; les recruteurs (ou des tâches serveur) poussent des événements. Le front affiche une timeline interactive en React. Les événements peuvent déclencher des emails via les fonctions existantes (`transactional-email.ts`).

### ### 3. Builder CV + Analyse Automatique (Suggestions)
- **Le concept :** éditeur de CV intégré (templates) + analyse automatique du CV téléversé (extraction mots-clés, score d'adéquation pour une offre) et suggestions d'amélioration.
- **La valeur ajoutée :** candidats optimisent leur CV pour chaque offre, augmentant leurs chances ; parcours plus guidé pour les moins expérimentés.
- **Faisabilité technique (React/Supabase) :** front React pour builder et stocker la version HTML/PDF dans Supabase Storage. Une fonction serveur (API) parse le fichier (lib/services ou un worker) en extrayant texte et mots-clés (bibliothèque Node existante). Le calcul d'adéquation peut être une logique JS simple (matching de mots-clés pondérés) stockée en Postgres pour rapide réexécution.

### ### 4. Planification d'Entretiens & Calendrier Intégré
- **Le concept :** permettre au candidat de réserver créneaux proposés par le recruteur, synchronisation avec Google Calendar / iCal, et rappel automatique.
- **La valeur ajoutée :** réduit la friction entre candidats et recruteurs, augmente le taux de disponibilité et professionnalise l'expérience.
- **Faisabilité technique (React/Supabase) :** table `interviews` + endpoints pour proposer/créer créneaux; webhooks ou intégration OAuth pour synchroniser avec Google Calendar (optionnel). Utiliser Supabase Functions pour envoyer invitations et rappels ; front React intègre un calendrier (ex. FullCalendar) pour sélection et confirmation.

### ### 5. Messagerie In-App et Feedback Structuré
- **Le concept :** canal de communication sécurisé entre candidat et recruteur (messages liés à une candidature) et formulaire de feedback structuré (motif, conseils) quand une candidature est rejetée.
- **La valeur ajoutée :** améliore la qualité des retours, permet itération du profil/CV, et crée un sentiment de relation continue avec la plateforme.
- **Faisabilité technique (React/Supabase) :** implémenter une table `messages` répliquée en temps réel via Supabase Realtime. Les messages sont affichés dans une UI React. Les recruteurs peuvent envoyer des feedbacks normalisés stockés dans `application_events` ; les notifications envoient e-mail et in-app.

---

Conclusion : ces évolutions ciblées apportent de la personnalisation, de la transparence et de l'interaction — leviers essentiels pour augmenter la rétention des candidats et la qualité des candidatures. La plupart des solutions s'appuient sur les primitives déjà présentes (Supabase Auth/Postgres/Storage, API routes, utilitaires d'e-mail) et sont réalisables de façon incrémentale.
