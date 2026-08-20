# Documentation métier — Emploiplus Group
> Synthèse factuelle basée sur les pages, routes, composants, services, traductions, données et configurations du projet. Toute information non confirmée est indiquée comme « Non déterminé dans le projet ».
## 1. IDENTITÉ DE L’ENTREPRISE
### Identification
- Nom utilisé : EmploiPlus Group et Emploiplus Group.
- Nom commercial visible : EmploiPlus.
- Domaine configuré : `https://emploiplus-group.com`.
- Nom juridique exact : Non déterminé dans le projet.
- Signature récurrente : « Emplois, Business Process Outsourcing ».
### Activité et zone
- Secteurs : employabilité, emploi, recrutement, RH, BPO, conseil, formation, transformation digitale et contenus professionnels.
- Zone mise en avant : Afrique centrale, principalement République du Congo.
- Lieux mentionnés : Brazzaville, Pointe-Noire et plusieurs villes congolaises dans les données de localisation.
- Pays d’intervention hors Congo : Non déterminé dans le projet.
### Positionnement
Emploiplus Group se présente à la fois comme une plateforme d’offres et d’accompagnement candidat, un intermédiaire de recrutement et un prestataire B2B de services RH, BPO, conseil et transformation digitale. Le parcours candidat est le plus concrètement implémenté ; les services B2B sont surtout présentés comme une offre commerciale administrée en interne.
### Mission et vision observables
- Mission : connecter les entreprises aux talents, accompagner les chercheurs d’emploi, favoriser des opportunités durables et soutenir la transformation digitale des organisations.
- Vision formelle : Non déterminée dans le projet.
### Valeurs
- Engagement : répondre sérieusement et professionnellement aux besoins des entreprises et candidats.
- Innovation : accompagner la transformation digitale avec des solutions modernes et adaptées au terrain.
- Impact : produire des effets concrets sur l’emploi, la performance et la croissance des talents.
### Promesse et différenciation
- Candidat : trouver des offres, améliorer son profil, préparer ses documents, recevoir des recommandations et postuler.
- Entreprise : recruter, diffuser des offres, déléguer des processus ou des équipes et accéder à des services RH/BPO.
- Différenciation : association emploi + employabilité + contenu + RH/BPO, espace candidat, matching CV/offre, analyse IA, guides, blog et chaînes WhatsApp.
### Qu’est-ce qu’Emploiplus Group ?
C’est une entreprise de services d’employabilité et de gestion RH qui utilise une plateforme numérique pour diffuser des offres, accompagner les candidats et relier les besoins de recrutement aux organisations. Son contenu commercial étend son activité au BPO, à la mise à disposition de personnel, à la formation, au conseil et à la transformation digitale.
Sources : `src/pages/public/AboutPage.tsx`, `src/i18n/translations.ts`, `src/pages/public/services/data.ts`, `src/pages/public/services/SolutionsEntreprisePage.tsx`.
## 2. ACTIVITÉS ET SERVICES
### Services candidats
- Publication et recherche d’emploi : offres filtrables par mot-clé, entreprise et contrat ; répond au besoin de trouver des opportunités ; pages `/jobs` et `/jobs/:slug` ; résultat attendu : consultation puis candidature.
- Mise en relation : email, WhatsApp ou lien externe configurés dans chaque offre ; répond au besoin d’identifier le canal de candidature ; espace recruteur autonome non observé.
- CV et lettre : optimisation pour recruteurs et ATS ; service présenté commercialement ; profil, documents et analyse CV/offre sont implémentés, mais la prestation complète de conseil n’est pas déterminée.
- Orientation et coaching : bilans, préparation d’entretiens et conseils personnalisés ; contenu présent, processus de vente et livraison non déterminés.
- Formation et compétences : modules pratiques, outils numériques, bureautique, ERP, leadership et coaching ; service présenté, catalogue et inscription non déterminés.
### Services entreprises et recruteurs
- Publication/diffusion d’offres : création, modification, publication, masquage, SEO, image, salaire, contrat, localisation et canaux de candidature ; existant dans `/admin/jobs`.
- Recrutement/sélection : recherche de candidats, évaluation, viviers et recrutement pour entreprises ; contenu présent ; pipeline recruteur complet non observé.
- Mise à disposition et RH déléguées : personnel, administration, contrats, paie, suivi et sous-traitance RH ; contenu B2B présent ; portail opérationnel non déterminé.
### BPO et prestations
- Externalisation de processus métier : service client, prospection, saisie, modération, archivage et gestion administrative ; cible : entreprises ; répond à la surcharge interne ; fonctionnement annoncé : analyse, équipes, supervision et reporting ; automatisation dans le site non observée.
- Délégation de personnel : hôtes, agents administratifs, techniciens et commerciaux terrain ; cible : entreprises ; répond au besoin de renfort sans alourdir l’organisation ; contrats et modalités réels non déterminés.
- Gestion de projets/équipes : équipes dédiées sur site ou à distance, assistance opérationnelle et pilotage ; service présenté, exécution réelle non déterminée.
### Conseil, formation et numérique
Le contenu mentionne conseil organisationnel, audit, optimisation, transformation digitale, conduite du changement, digitalisation RH, automatisation, GED, workflows, tableaux de bord, Cloud, ERP, CRM, logiciels RH, développement web et formations. Ces services sont présentés commercialement ; tarifs, processus de livraison et clients ne sont pas déterminés.
## 3. PUBLICS CIBLES
### Candidats
Chercheurs d’emploi, stagiaires, professionnels en évolution ou personnes souhaitant améliorer leur CV. Besoins : offres, profil, documents, préparation, recommandations et suivi. Parcours : accueil ou `/jobs` → offre → inscription/connexion → profil/documents → candidature → suivi.
### Entreprises
Organisations ayant un besoin de recrutement, de personnel, de RH déléguées ou de BPO. Parcours visible : consulter `/services/solutions-entreprises-bpo` puis contacter Emploiplus. Compte et portail entreprise : Non déterminés.
### Recruteurs
Acteurs recevant les candidatures ou recherchant des profils. Les offres configurent email, WhatsApp ou lien externe. Tableau recruteur, pipeline et accès direct : Non déterminés.
### Administrateurs et éditeurs
Équipe interne gérant offres, candidats, blog, guides, FAQ, notifications, SEO, pages légales, équipe et analytics. Rôles présents : `super_admin`, `admin`, `editor`.
### Partenaires/BPO
Organisations pouvant intervenir dans des missions d’externalisation ou de délégation. Espace partenaire : Non déterminé.
## 4. PARCOURS CANDIDAT
### Flux global
`Découverte → Inscription/Connexion → Profil → Documents → Recherche → Offre → Candidature → Suivi`
### Découverte et recherche
Le candidat arrive par `/`, `/jobs`, `/blog`, `/candidate/guides`, les services ou les chaînes WhatsApp. `/jobs` propose recherche, entreprise, contrat, pagination et liste d’offres. `/jobs/:slug` affiche description, exigences, informations et canaux de candidature.
### Compte
- Inscription : `/candidate/signup`.
- Connexion : `/candidate/login`.
- Confirmation : `/candidate/confirm`.
- Mot de passe : `/candidate/forgot-password` et `/candidate/reset-password`.
- Authentification : Supabase Auth complété par des endpoints serveur et un profil métier candidat.
### Profil
Le candidat peut gérer identité, email, téléphone, titre, résumé, localisation, expériences, formations, compétences, langues, préférences, avatar et documents. Routes principales : `/candidate/profile`, `/candidate/profile/edit`, `/candidate/experience`, `/candidate/education`, `/candidate/skills`, `/candidate/languages`, `/candidate/preferences`.
### CV et documents
Le candidat téléverse un CV, gère des documents PDF, les supprime et sélectionne des pièces pour une candidature. Supabase Storage et `localStorage` sont utilisés selon les flux. Les règles de taille et de type sont définies dans `storageService.ts`.
### Recommandations et analyse
Les recommandations utilisent le profil, le texte du CV, des données vectorielles et une RPC/matching lorsque les données sont disponibles. L’analyse CV/offre prévoit score, forces, faiblesses et lettre de motivation via un service IA. Disponibilité réelle : dépendante de la configuration et des données.
### Candidature
Route : `/candidate/jobs/:slug/apply`. Le candidat sélectionne des documents, peut ajouter des fichiers temporaires, renseigne objet/message, accepte le consentement puis envoie. La candidature est persistée dans `job_applications`; l’email de l’offre peut recevoir un message et des pièces. Les canaux WhatsApp/lien externe peuvent aussi être utilisés.
### Suivi
- `/candidate/applications` : liste.
- `/candidate/applications/:id` : détail.
- `/candidate/saved-offers` : offres enregistrées.
- `/candidate/notifications` : notifications.
- `/candidate/account` et `/candidate/settings` : compte.
La logique d’application impose notamment documents et consentement ; limites de texte et règles de conservation sont définies dans les APIs candidates.
### Tableau de bord
`/candidate/dashboard` regroupe accueil, complétude du profil, actions rapides, recommandations, dernières offres et accès aux documents, candidatures, guides, notifications et réglages.
## 5. PARCOURS ENTREPRISE / RECRUTEUR
### Existant
- Administration des offres : création, édition, publication, masquage, statuts, entreprise, ville, contrat, description, exigences, salaire, échéance, email, WhatsApp, lien, images, tags et SEO.
- Réception : candidatures persistées et email possible vers l’adresse de l’offre.
- Gestion candidats interne : consultation, pagination, statut et suppression selon l’administration.
### Partiellement implémenté
- Recrutement et sélection : offres et candidatures fonctionnent, mais pas de pipeline recruteur public.
- Communication : canaux email/WhatsApp/lien fonctionnent selon les données de l’offre ; espace de conversation non observé.
- Processus BPO/RH : présentation commerciale, workflow numérique non observé.
### Non déterminé
- création de compte entreprise ;
- tableau de bord entreprise ;
- réception centralisée par recruteur ;
- gestion de devis, contrats, factures ou délais de service ;
- processus de recrutement client complet.
## 6. CONTENU ET PAGES DU SITE
### Pages publiques
- `/` : accueil, mission, services, statistiques éditoriales, offres, actualités, partenaires et CTA.
- `/about` : mission, valeurs, équipe et résultats affichés.
- `/services` : portefeuille candidats/entreprises.
- `/services/:slug` : détail d’un service.
- `/services/hub-candidat-intelligent` : parcours candidat, matching et recommandations.
- `/services/solutions-entreprises-bpo` : BPO, délégation, équipes et pilotage.
- `/services/hub-emploi-recrutement/landing` : pôle emploi/recrutement ; la variante canonique sans `/landing` est incohérente dans le projet.
- `/jobs` : recherche et découverte d’offres.
- `/jobs/:slug` : fiche détaillée et canaux de candidature.
- `/blog` : hero, articles à la une, liste, pagination et partage.
- `/blog/:slug` : article, image, extrait, contenu, métadonnées, ressources et partage.
- `/faq` : questions fréquentes sur services, compte et candidatures.
- `/contact` : informations et formulaire ; envoi serveur réel non confirmé.
- `/politique-de-confidentialite`, `/mentions-legales`, `/cgu` : pages légales.
### Compte candidat
`/candidate/login`, `/candidate/signup`, `/candidate/confirm`, `/candidate/forgot-password`, `/candidate/reset-password`, `/candidate/dashboard`, `/candidate/profile`, `/candidate/documents`, `/candidate/jobs/:slug/apply`, `/candidate/applications`, `/candidate/applications/:id`, `/candidate/saved-offers`, `/candidate/notifications`, `/candidate/guides`, `/candidate/account`, `/candidate/settings`.
### Administration
`/admin` pilote le tableau de bord. `/admin/jobs` et `/admin/jobs/new` gèrent les offres ; `/admin/candidates` les candidats ; `/admin/blog` et `/admin/blog/new` les articles ; `/admin/guides` les guides ; `/admin/notifications` les notifications ; `/admin/analytics-offres` les statistiques ; `/admin/seo` les paramètres SEO ; `/admin/faq`, `/admin/team`, `/admin/privacy`, `/admin/legal`, `/admin/cgu` les contenus associés.
## 7. POSITIONNEMENT DE MARQUE
- Ton : professionnel, accessible, encourageant et orienté action.
- Image recherchée : acteur sérieux de l’emploi, accompagnateur humain, partenaire RH moderne et opérateur BPO proche du terrain.
- Messages récurrents : opportunités, profil, accompagnement, performance, innovation, recrutement, transformation et impact.
- Éléments de confiance : équipe nommée, pages institutionnelles, offres détaillées, comptes candidats, pages légales, contenus, contacts et chaînes WhatsApp.
- Différence avec une simple job board : accompagnement candidat, documents, recommandations, analyse IA, guides, conseil, RH déléguées et BPO.
## 8. IDENTITÉ VISUELLE
- Couleurs principales : bleu `#00009E`, bleu profond `#000079`, orange/or `#E8A900`, blancs et gris clairs ; tokens OKLCH complémentaires.
- Typographies : Inter pour le texte, Plus Jakarta Sans pour les titres.
- Visuels : logo, favicon, photos de l’équipe, images d’articles, images de services et carrousels.
- Composants : cartes arrondies, ombres `shadow-soft`/`shadow-elev`, boutons CTA, bordures discrètes, icônes Lucide et animations Framer Motion.
- Mise en page : publique éditoriale et visuelle ; candidat fonctionnelle avec sidebar/topbar ; admin orientée gestion.
- Responsive : grilles, tailles responsive, navigation mobile et adaptation des cartes/formulaires.
## 9. CONTENU ÉDITORIAL
### Institutionnel
Mission, connexion talents-entreprises, employabilité, transformation digitale, emploi durable, engagement, innovation et impact.
### Candidat
Voir les offres, créer un compte, compléter le profil, préparer CV et candidature, consulter les guides, recevoir des recommandations et postuler.
### Entreprise
Recrutement, diffusion, BPO, délégation, équipes, pilotage, reporting, gestion RH et digitalisation.
### CTA
« Voir les offres », « Nos services », « Voir toutes les offres », « Créer un compte », « Se connecter », « Découvrir l’espace candidat », « Découvrir nos solutions », « Contactez-nous » et « Lire l’article ».
## 10. BLOG, GUIDES ET CONTENU ÉDUCATIF
### Blog
Le blog est dynamique et alimenté par Supabase. L’administration gère titre, slug, extrait, contenu, image, catégorie, tags, auteur, statut, date, mise en avant, ordre, SEO, liens et vidéos. Le blog propose articles à la une, pagination, détail et partage social.
### Guides
Les guides sont des fiches pratiques avec titre, slug, catégorie, description, image, document et visibilité. Ils sont administrables et accessibles dans l’espace candidat. Le contenu publié réel dépend de Supabase.
### Rôle global
Blog et guides attirent les candidats, expliquent les services, améliorent la visibilité SEO, renforcent la crédibilité et fournissent des conseils partageables.
## 11. FONCTIONNALITÉS TECHNIQUES À IMPACT MÉTIER
- Authentification : Supabase Auth, confirmation, réinitialisation, rôles et profil candidat.
- Candidats : identité, parcours, compétences, préférences et documents.
- Offres : stockage Supabase, recherche, statuts, publication, pagination et canaux.
- Candidatures : persistance candidat/offre, documents, consentement et email.
- Matching/IA : recommandations, score, analyse CV/offre et lettre ; dépend de la configuration.
- Notifications : messages généraux ou ciblés, actifs ou masqués ; automatisation de publication indiquée comme désactivée.
- CMS : offres, blog, guides, FAQ, légaux, SEO et équipe administrables.
- SEO : titres, descriptions, canoniques, Open Graph, Twitter cards, breadcrumbs, JSON-LD et sitemap/prerender.
- Storage : CV/documents et images publiques selon les buckets et règles du service.
- Analytics : candidatures, candidats, offres, contrats, entreprises, statuts, localisations, tendances et vues.
- Géolocalisation métier : ville et pays, sans GPS utilisateur démontré.
- Architecture : React/Vite, React Router, Supabase, Storage, APIs serverless Vercel et déploiement Vercel.
## 12. MODÈLE DE FONCTIONNEMENT GLOBAL
`Administration/Entreprise → Offre → Publication → Visiteur/Candidat → Profil/Documents → Candidature → Canal recruteur → Suivi`.
`Administration/Éditeur → Article/Guide → Publication → Lecture/Partage → Visibilité de marque`.
`Entreprise → Services BPO/RH → Contact → Traitement commercial/opérationnel supposé`.
Les contenus attirent l’audience, les offres et guides orientent les candidats, l’espace candidat centralise le parcours et l’administration alimente le système. Le B2B n’est pas matérialisé par un portail autonome.
## 13. ÉCOSYSTÈME EMPLOIPLUS GROUP
- Emploiplus Group : opérateur de la marque, plateforme et services.
- Candidat : consulte, s’inscrit, prépare son profil, postule et suit ses démarches.
- Entreprise : besoin de recrutement, personnel, RH ou BPO ; espace autonome non confirmé.
- Recruteur : reçoit ou traite les candidatures via les canaux des offres.
- Administrateur/éditeur : gère contenus, opérations et paramètres.
- Partenaire/BPO : acteur commercial ou opérationnel possible ; espace dédié non déterminé.
Relations : Emploiplus relie candidats et entreprises, l’administration publie et contrôle, le recruteur reçoit les candidatures, et les contenus développent l’audience.
## 14. INFORMATIONS UTILES POUR LA COMMUNICATION
### Candidat
Offres, profil, CV, documents, candidature, recommandations, guides, entretien, chaînes WhatsApp et accompagnement.
### Entreprise
Recrutement, diffusion d’offres, accès aux profils, délégation, RH externalisées, BPO et pilotage.
### Recrutement
Sélection, viviers, compétences, qualité d’une offre, entretiens, canaux de candidature et recrutement régional.
### Emploi
Opportunités locales, métiers, contrats, recherche d’emploi, insertion et marché du travail congolais.
### Conseils carrière
CV/ATS, lettre, entretien, présentation, compétences, orientation, formation et évolution.
### Entreprise / RH
Administration, paie et contrats dans le périmètre présenté, mise à disposition, équipes, processus et digitalisation RH.
### Actualités Emploiplus
Nouvelles offres, articles, guides, évolutions du site, actions réellement menées, équipe et partenariats confirmés.
### Marque employeur
Engagement, innovation, impact, proximité, expertise RH/BPO, équipe et contribution au développement professionnel.
À éviter sans preuve : tarifs, clients, certifications, volumes réels, résultats garantis, pays non mentionnés, contrats signés et fonctionnalités recruteur non implémentées.
## 15. SYNTHÈSE POUR UNE IA
## Qui est Emploiplus Group ?
Une entreprise et plateforme numérique d’employabilité, emploi, recrutement, RH, BPO, conseil, formation et transformation digitale, orientée vers l’Afrique centrale et principalement le Congo.
## Que fait Emploiplus Group ?
Elle diffuse des offres, accompagne les candidats et présente aux entreprises des services de recrutement, mise à disposition, RH déléguées, BPO et transformation.
## À qui s’adresse Emploiplus Group ?
Aux candidats, chercheurs d’emploi, professionnels en évolution, entreprises, recruteurs, organisations BPO/RH et lecteurs de contenus professionnels.
## Quels problèmes résout Emploiplus Group ?
Elle aide les candidats à trouver des offres, valoriser leur profil et candidater ; elle aide les entreprises à recruter, renforcer leurs équipes ou externaliser des processus.
## Quels services propose Emploiplus Group ?
Offres, mise en relation, CV/lettres, orientation, coaching, formation, recrutement, sélection, BPO, délégation, RH, prestations opérationnelles, conseil et transformation digitale.
## Quelle est sa proposition de valeur ?
Réunir opportunités, accompagnement candidat et services RH/BPO dans un écosystème numérique régional.
## Quel est son positionnement ?
Un hybride entre plateforme d’emploi, accompagnateur d’employabilité et partenaire entreprise en recrutement, RH et BPO.
## Quelle image de marque cherche-t-elle à transmettre ?
Une image professionnelle, moderne, sérieuse, accessible, humaine, orientée impact et proche des réalités régionales.
## Quel est son ton de communication ?
Professionnel, encourageant, accessible, orienté action et promotionnel avec un vocabulaire d’opportunités, accompagnement, performance et innovation.
## Quels sont ses principaux sujets de communication ?
Emploi, offres, recrutement, CV, entretiens, carrière, compétences, guides, RH, BPO, transformation digitale et actualités Emploiplus.
## Quels sujets faut-il éviter ou ne pas inventer ?
Tarifs, certifications, clients, partenaires, volumes réels, garanties, délais, pays non confirmés, portail recruteur, contrats BPO et résultats non présents dans le projet.
## Informations certaines
- EmploiPlus/Emploiplus Group est le nom utilisé.
- Le projet traite employabilité, emploi, recrutement, RH et BPO.
- Afrique centrale, République du Congo, Brazzaville et Pointe-Noire sont mentionnés.
- Les candidats disposent de comptes, profils, documents, candidatures et offres sauvegardées.
- Les offres sont administrées, recherchées et associées à des canaux de candidature.
- Blog, guides, FAQ, SEO et notifications sont présents ; plusieurs sont administrables.
- Matching et analyse IA existent dans le code.
- Valeurs affichées : engagement, innovation et impact.
- Couleurs de marque : `#00009E`, `#000079`, `#E8A900`; polices : Inter et Plus Jakarta Sans.
## Informations non déterminées
- Nom juridique, tarifs, modèle économique et certifications.
- Liste réelle des clients/partenaires et volumes publics.
- Pays d’intervention exacts hors Congo.
- Portail entreprise/recruteur et pipeline client.
- Modalités réelles des prestations BPO/RH et formations.
- Disponibilité de l’IA, qualité du matching et conservation à long terme des candidatures.
- Existence d’une application mobile publiée et fonctionnement serveur complet du contact.
