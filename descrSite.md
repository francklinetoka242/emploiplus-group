# Description des Fonctionnalités - EmploiPlus Group

## 1. Vue d'Ensemble du Site
- **Objectif principal :** Proposer une plateforme de mise en relation entre candidats et offres d'emploi, tout en présentant des services RH et de transformation pour les entreprises.
- **Public cible :** Candidats en recherche d'emploi, recruteurs/entreprises clientes et administrateurs internes gérant les offres, le blog et les utilisateurs.

## 2. Architecture des Pages et Fonctionnalités Détaillées

### ### Accueil
- **Hero interactif :** Présentation de l'offre de service avec appel à l'action vers les offres d'emploi et les services.
- **Statistiques clés :** Affichage animé de chiffres de performance (offres, entreprises, lecteurs).
- **Présentation des services :** Mise en avant des quatre pôles de services RH.
- **Aperçu des offres récentes :** Liste de quelques offres d'emploi publiées avec preview, lieu, type de contrat et accès direct aux fiches.
- **Aperçu des articles :** Sélection de billets de blog récents avec lien vers la page blog.

### ### Services
- **Catalogue de services :** Liste des services proposés par EmploiPlus Group, avec carte descriptive par pôle.
- **Accès aux détails :** Lien vers des pages de détail de services, y compris un landing spécifique pour le service "Hub Emploi & Recrutement".
- **Demande de devis :** Bouton vers le formulaire de contact prérempli pour demander un devis ou une prestation.

### ### Page de détail de service
- **Contenu détaillé :** Description approfondie de chaque service avec sections spécifiques.
- **Navigation back :** Retour vers la page de services.
- **SEO structurée :** Balises SEO et fil d’Ariane pour chaque service.

### ### Offres d'emploi
- **Liste d'offres :** Page regroupant les offres publiées avec pagination.
- **Filtres et recherche :** Recherche par mot-clé, entreprise, localisation et type de contrat.
- **Contrôles :** Bouton pour afficher/masquer les filtres, réinitialiser les critères et navigation page suivante/précédente.
- **Candidature :** Chaque offre propose une action de postuler vers le parcours candidat.

### ### Détail d'offre d'emploi
- **Fiche d'offre complète :** Titre, entreprise, localisation, type de contrat, salaire, date de publication et deadline.
- **Description et exigences :** Corps de l’offre, conditions, tags métiers.
- **Actions de postulation :** Boutons pour postuler par email, WhatsApp ou lien externe.
- **Partage social :** Partage de l’offre via des boutons sociaux.

### ### Blog
- **Liste d'articles :** Page de blog montrant des articles publiés.
- **Navigation interne :** Liens vers chaque article.
- **Catégories et contenus :** Présentation synthétique et accès direct à la lecture complète.

### ### Article de blog
- **Page de contenu :** Article avec image, titre, extrait et contenu textuel.
- **Informations complémentaires :** Catégorie, date de publication, tags, ressources externes et éventuelles vidéos.
- **Partage social :** Boutons pour partager l’article.

### ### Contact
- **Formulaire de contact :** Nom, email, sujet et message avec validation email au niveau du front.
- **Soumission :** Envoi simulé avec reset du formulaire après soumission.
- **Informations directes :** Coordonnées téléphoniques, email et liens WhatsApp.
- **Localisation :** Présentation du siège et contact rapide.

### ### À propos
- **Mission et valeurs :** Présentation de l’entreprise, ses objectifs et ses valeurs.
- **Équipe :** Mise en avant de membres clés avec photos.
- **Chiffres clés :** Indicateurs quantitatifs similaires à ceux de la page d’accueil.

### ### Authentification admin
- **Page de connexion dédiée :** Formulaire email/mot de passe pour accéder à l’administration.
- **Validation :** Vérification du format email et gestion des erreurs de connexion.
- **Redirection :** En cas de succès, redirection vers le tableau de bord admin.

### ### Espace candidat - Inscription et récupération
- **Connexion candidat :** Page de login pour les utilisateurs candidats.
- **Inscription :** Page d’inscription à un compte candidat.
- **Mot de passe oublié :** Page de récupération de mot de passe.
- **Réinitialisation :** Page de reset de mot de passe depuis un lien sécurisé.
- **Confirmation :** Page de validation de compte / email.

### ### Espace candidat - Tableau de bord
- **Vue générale :** Accueil personnel candidat avec recommandations et accès rapide.
- **Actions rapides :** Liens vers compléter le profil, voir candidatures, modifier le profil.
- **Offres récentes :** Aperçu d’offres publiées et section de positionnement personnel.
- **Suivi de progression :** Calcul du pourcentage de complétion de profil et statuts de complétion.

### ### Espace candidat - Profil
- **Gestion du profil :** Section principale de profil avec informations personnelles.
- **Expériences :** Ajout, modification et suppression d’entrées d’expérience professionnelle.
- **Éducation :** Ajout, modification et suppression de parcours scolaires ou formation.
- **Compétences :** Gestion des compétences métiers.
- **Langues :** Ajout, modification et suppression de langues maîtrisées.
- **Préférences :** Gestion des préférences métier et d’affectation.
- **Documents :** Gestion des CV et documents du candidat.
- **Présentation professionnelle :** Section dédiée aux éléments de pitch personnel.

### ### Espace candidat - Candidatures
- **Liste des candidatures :** Tableau des offres postées avec statut, date et entreprise.
- **Détails :** Affichage des détails de candidature en modal.
- **Actions :** Possibilité de retirer une candidature.

### ### Espace candidat - Offres enregistrées
- **Page dédiée :** Section existante prévue pour les offres sauvegardées.
- **Statut :** Indique qu’il s’agit d’une fonctionnalité bientôt disponible.

### ### Espace candidat - Notifications
- **Centre de notifications :** Liste des notifications candidate.
- **Marquer comme lu :** Possibilité de marquer toutes les notifications lues.
- **Suppression :** Suppression de notifications individuelles.
- **Filtrage visuel :** Distinction claire entre notifications lues et non lues.

### ### Espace candidat - Paramètres
- **Paramètres de compte :** Section de paramétrage avec carte de sécurité et compte.
- **Gestion de mot de passe :** Fonctionnalités de sécurité éditables via composants de réglages.
- **Gestion du compte :** Composants dédiés aux paramètres de profil et préférences.

### ### Administration
- **Tableau de bord admin :** Vue de synthèse des offres, articles et demandes.
- **Gestion des offres :** Page permettant de créer, éditer et gérer des offres d’emploi.
- **Gestion du blog :** Page de création/édition de billets de blog.
- **Gestion des candidats :** Accès aux données candidats pour les rôles autorisés.
- **Notifications admin :** Page de gestion et suivi des notifications internes.
- **SEO admin :** Page dédiée à la gestion SEO du site.
- **Équipe admin :** Gestion des membres de l’équipe et des rôles.

## 3. Flux d'Utilisation Majeurs (User Flows)
- **Parcours 1 :** Navigation publique vers une offre d'emploi. L'utilisateur arrive sur l'accueil, consulte les services ou les offres, utilise les filtres de recherche sur la page Jobs, puis ouvre une fiche d'offre et utilise les actions de postulation.
- **Parcours 2 :** Création de compte candidat et complétion du profil. Le candidat s’inscrit ou se connecte, accède à son espace candidat, complète ses informations personnelles, ajoute expériences/éducation/compétences/langues et suit ses candidatures.

## 4. Éléments Transversaux (Header, Footer, Global)
- **Header :** Menu de navigation principal avec logo, liens vers Accueil, Services, Jobs, Blog, À propos et Contact. Boutons de connexion et inscription candidat, responsive mobile avec menu hamburger. Sélecteur de langue multilingue accessible.
- **Footer :** Liens de navigation vers services, blog, à propos et contact. Présentation de la marque, contact téléphonique, WhatsApp et réseaux sociaux (Facebook, LinkedIn). Espace réservé aux mentions légales et informations de copyright.
- **Global :** Layout public commun avec en-tête et pied de page sur toutes les pages publiques. Gestion de l'authentification candidate/admin via Supabase, protection des routes avec garde d'accès. SEO dynamique via composants SEO et balises open graph. Gestion des erreurs 404.
