# Éléments de Conformité Initiaux - EmploiPlus Group

## 1. Données collectées et fonctionnalités associées

- **Espace Candidat (Inscription/Profil) :**
  - Données personnelles de base saisies ou gérées dans le profil candidat : prénom, nom, email, téléphone, ville, pays, biographie, intitulé/profession, avatar.
  - Données liées à l'expérience professionnelle : expériences, dates, entreprises, postes, descriptions.
  - Données liées à la formation : études, diplômes, établissements, dates.
  - Données liées aux compétences : compétences métiers, niveaux ou listes de compétences.
  - Données liées aux langues : langues maîtrisées et niveaux associés.
  - Données liées aux préférences : préférences de recherche ou paramètres liés au profil.
  - Documents téléversés par le candidat : CV, documents annexes, pièces justificatives ou fichiers liés à la candidature.
  - Données de progression de profil : informations permettant d'évaluer l'avancement du dossier candidat.

- **Formulaire de Contact & Devis :**
  - Nom.
  - Adresse email.
  - Objet du message.
  - Message libre saisi par l'utilisateur.
  - Les données saisies transitent via le formulaire front-end et sont actuellement traitées localement côté interface sans traitement backend visible dans le code fourni.

- **Système d'Authentification (Supabase) :**
  - Adresse email utilisateur.
  - Mot de passe chiffré et géré par le système d'authentification Supabase.
  - Identifiant utilisateur et métadonnées de session.
  - Tokens de session et éléments techniques associés à l'authentification.
  - Cookies techniques liés à l'authentification et à la session utilisateur.
  - Données de rôle/permissions associées à l'accès admin ou candidat.

- **Postulation (Email, WhatsApp, Liens externes) :**
  - Les données de candidature sont principalement transférées vers l'outil de postulation choisi par l'utilisateur : email, WhatsApp ou lien externe vers une plateforme tierce.
  - Les informations de l'offre et du candidat peuvent être utilisées pour alimenter une démarche de candidature externe.
  - Le code actuel ne montre pas de stockage centralisé des candidatures dans un backend dédié pour ce parcours, mais l'espace candidat permet la consultation des candidatures enregistrées via l’application.

## 2. Éléments techniques pour les Mentions Légales

- **Hébergement :**
  - L'architecture front-end  Vercel, L'hébergeur "Nous utilisant Github"

- **Gestion de la base de données & Authentification :**
  - Supabase pour la gestion de l'authentification et de la base de données.
  - Les données utilisateur, profils, offres, contenus et sessions sont liées à cette infrastructure.

- **Directeur de la publication :**
  - ETOKA IBEAHO Francklin Sylver

- **Informations de l'entreprise :**
  - Pointe Noire, Republique du Congo

## 3. Emplacement dans le Footer

- Le composant Footer du site est présent et peut accueillir des liens vers les documents légaux futurs.
- À l'état actuel, il n'intègre pas encore de liens explicites vers la Politique de Confidentialité, les Mentions Légales ou les Conditions Générales d'Utilisation, mais l'espace du pied de page est disponible pour cette finalisation.
