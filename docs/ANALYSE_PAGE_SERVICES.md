# Analyse de `/services` et des pages de services

## 1. Page `/services` actuelle
- Route/composant/fichier : `/services` → `ServicesPage`, `src/pages/public/ServicesPage.tsx`; sans guard. `SharedPublicRouteShell` utilise `PublicLayout` ou `CandidateLayout` selon la session.
- Ordre : une section entreprise seulement : image à gauche, titre/introduction et quatre liens de services à droite. La section « Candidat » a été supprimée.
- Textes : JSX en dur, français ; aucune requête ni donnée dynamique. Image `src/assets/services/candidate-journey/success-management.webp`; aucun pictogramme dans cette section.
- Intitulés affichés : « Des solutions RH pour chaque étape de votre organisation » ; « Mise à disposition & intérim », « Recrutement & chasse de tête », « Externalisation administrative et RH », « Conseil & formation RH ».
- Actions : « Découvrir l’intérim » → `/services/mise-disposition-rh`; « Explorer le recrutement » → `/services/recrutement`; « Voir l’externalisation » → `/services/externalisation`; « Découvrir le conseil RH » → `/services/conseil-formation`. Aucun CTA `/contact`, formulaire ou témoignage.
- SEO : `Nos solutions RH | EmploiPlus Group` (déjà suffixé, suffixe non répété), description « Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes. », canonical `${BASE_URL}/services`, `index,follow`. Aucun `<h1>` dans le contenu courant (titre principal en `<h2>`); JSON-LD générique Organization/WebSite, aucun fil d’Ariane ou schéma service fourni.
- Design : image 4:3, grille `0.8fr/1.2fr`, un filet supérieur, lignes séparatrices. Sobre et lisible ; pas de carte, ombre, gradient ou pastille d’icône. Il manque une introduction `<h1>`/hero, un repère de page et une comparaison plus synthétique des offres.

## 2. Fiches des quatre pages

### Mise à disposition / Intérim
- Route/composant/fichier : `/services/mise-disposition-rh` → `MiseADispositionPage`, `src/pages/public/services/MiseADispositionPage.tsx`.
- Structure : hero « Confiez-nous la gestion de vos intérimaires » → « Une gestion fiable, de la sélection à l’intégration » → « Une formule adaptée à votre réalité » → « Une relation suivie et responsable » (engagements interactifs) → CTA « Renforcez vos équipes avec le bon profil ».
- Promesse : prestation clé en main de sélection et mise à disposition, avec gestion administrative et suivi RH. Cible : entreprises, des TPE/startups aux grands comptes ; secteurs divers.
- Offres : « Intérim de gestion », formule TPE/PME/startups, formule grands comptes ; sélection, contrats, paie, déclarations, conformité et accompagnement. Besoins ponctuels, saisonniers ou durables.
- Processus : sélection rigoureuse, mise à disposition rapide, adaptation de durée et accompagnement jusqu’à l’intégration ; aucun parcours numéroté distinct.
- Bénéfices/affirmations : gain de temps, profils qualifiés, satisfaction « élevée », conformité juridique ; CTA « Présenter votre besoin » et « Nous contacter » → subject `Besoin de mise à disposition - Intérim`. Pas de formulaire, FAQ ou témoignage.
- Source/SEO : textes en dur, env. 364 lignes ; images `backgroun-page-services/208is.jpg`, `home/home-recruitment-image.webp`, et illustration d’engagements en CSS. Titre SEO « Mise à disposition / Intérim » + marque ; description « Confiez à EmploiPlus Group la gestion de vos intérimaires… » ; H1 « Confiez-nous la gestion de vos intérimaires ».

### Recrutement / Chasseur de tête
- Route/composant/fichier : `/services/recrutement` → `RecrutementChasseurDeTetePage`, fichier éponyme dans `src/pages/public/services/`.
- Structure : hero « Besoin d'une nouvelle ressource ? » → « Découvrez nos trois principaux avantages » → « Aider votre entreprise à réussir » → « Quatre étapes pour avancer avec précision » → « Questions les plus fréquentes » → CTA chasse de tête.
- Promesse : aider à constituer des équipes performantes et trouver des talents adaptés. Public cible : entreprises, postes critiques ou profils rares/stratégiques.
- Offres/livrables : conseil associé, sourcing, tri des CV, entretiens/tests/références, rapports détaillés, présentation des profils, entretiens finaux et suivi post-recrutement.
- Processus : analyse des besoins → recherche et sélection → évaluation/validation → présentation et intégration. Engagements annoncés : rapidité, qualité, confidentialité.
- CTA : « Parler de votre recrutement » → `/contact?subject=Demande de recrutement`; « Contactez-nous dès aujourd'hui » → subject `Demande de chasse de tête`. Six questions FAQ affichées, mais chaque réponse est un placeholder (« Réponse à compléter… »). Aucun formulaire local/témoignage.
- Source/SEO : contenu statique, env. 345 lignes ; `208is.jpg`, `img-ressource-p.webp`, `Business-img.webp`. Titre SEO « Recrutement / Chasseur de tête » + marque ; H1 « Besoin d'une nouvelle ressource ? ».

### Externalisation administrative
- Route/composant/fichier : `/services/externalisation` → `SolutionsEntreprisePage` (nom de composant distinct du sujet), `src/pages/public/services/SolutionsEntreprisePage.tsx`.
- Structure : hero « Externalisez vos processus » → « Une gestion fiable au service de vos opérations » → « Des outils essentiels pour votre réussite. » → « Une tarification adaptée à vos besoins » → « Notre méthodologie » → « Questions les plus fréquentes » → CTA.
- Promesse : externaliser les processus RH, administratifs et l’assistance technique au Congo. Public cible : entreprises locales et étrangères.
- Prestations : dossiers du personnel, paie/déclarations, recrutement/formation, conformité, archivage, saisie, secrétariat, facturation, créances, appels/courriers, assistance technique et coordination locale.
- Processus : analyse des besoins → proposition personnalisée → mise en place → suivi et optimisation. Six avantages incluent expertise locale, réseau, transparence, confidentialité et réactivité.
- CTA : « Présenter votre besoin » → subject `Demande d'externalisation administrative`; « Demander un devis » → `Demande de devis - Externalisation`; « Parler à un expert » et CTA final « Contactez-nous dès aujourd'hui ». FAQ présente, plusieurs réponses sont des placeholders ou indiquent un périmètre à préciser. Aucun formulaire local.
- Tarification déclarée : forfaits mensuels ou prestations à la carte ; première consultation annoncée gratuite. Source/SEO : JSX statique, env. 425 lignes ; `208is.jpg`, `enterprise-team-02.webp`, `img-ext-p.webp`. Titre « Externalisation administrative » + marque ; H1 « Externalisez vos processus ».

### Conseil & Formation RH
- Route/composant/fichier : `/services/conseil-formation` → `ConseilFormationPage`, `src/pages/public/services/ConseilFormationPage.tsx`.
- Structure : hero « Choisissez notre expertise RH » → « Nos services de conseil & formation RH » → six groupes de prestations → « Pourquoi choisir notre service de conseil & formation RH ? » → « Nos modalités d’intervention » → CTA.
- Promesse : conseil et formation adaptés aux objectifs et à la culture d’entreprise. Public : PME et grandes entreprises.
- Prestations : talents/performance, carrières/mobilité, rémunération, relations sociales, transformation/conduite du changement, conformité/risques ; évaluations, plans de formation, coaching, médiation, audits et accompagnement.
- Modalités : consultation ponctuelle ou longue durée, sur site ou à distance, forfaits ou interventions à la carte. Six avantages incluent expertise personnalisée, accompagnement, éthique et outils modernes.
- CTA : « Parler à un consultant », « Parler à un expert », « Contactez-nous » → subject `Demande de conseil et formation RH`. Aucun formulaire, FAQ ou témoignage.
- Source/SEO : JSX statique, env. 327 lignes ; `208is.jpg`, `4ade292be.jpg`, `office-girl-f-c.webp`. Titre « Conseil & Formation RH » + marque ; H1 « Choisissez notre expertise RH ».

## 3. Contenu non vérifiable ou à risque
- Mise à disposition, `MiseADispositionPage.tsx` : « vivier de plus de 2 000 profils », « taux de satisfaction client élevé », « 100 % digitalisée », garantie de conformité juridique et « meilleur candidat ». Textes statiques, aucune métrique, preuve ou source métier reliée dans ces fichiers.
- Recrutement, `RecrutementChasseurDeTetePage.tsx` : délai « rapide », promesses de meilleurs talents, confidentialité totale et adéquation garantie ; statiques, sans délais/chiffres ni preuve associés. FAQ prix/contrat sans réponses validées.
- Externalisation, `SolutionsEntreprisePage.tsx` : réduction des coûts, conformité, confidentialité/sécurité, réseau local, première consultation gratuite et tarification forfaitaire ; texte statique, tarifs et conditions non reliés à une source.
- Conseil/Formation, `ConseilFormationPage.tsx` : conformité légale, confidentialité et respect déontologique ; promesses statiques non adossées ici à des références ou labels.
- Aucun nom de client, témoignage, partenaire, label certifié ou chiffre de résultat vérifiable relevé dans ces cinq pages.

## 4. Design actuel des pages
- Tableau : `/services` = image `success-management.webp`, pas de hero/overlay, grille plate et séparateurs ; 4 pages détail = hero image `208is.jpg` avec overlay inline `linear-gradient(90deg, rgba(15,23,42,.82/.68/.35))`, illustration secondaire h-72/lg:h-96.
- | Page | Conteneurs / accents | Sections et typographie |
  |---|---|---|
  | `/services` | pas de cartes/ombres/icônes ; filet `border-t` | H2 2xl/3xl, espacements aérés, un seul bloc |
  | Intérim | cartes colorées `rounded-[26px]`, bannière CTA arrondie, orbite avec pastilles et ombres | H1 2xl/3xl ; H2 xl/2xl |
  | Recrutement | cartes numérotées, timeline, liserés latéraux, ombres, CTA arrondi | H1 2xl/3xl ; H2 xl/2xl |
  | Externalisation | cartes `shadow-*`, motif pointillé, icônes en carrés colorés, bordure latérale, sections bleues | H1 2xl/3xl ; H2 xl/2xl |
  | Conseil/Formation | cartes ombrées, carrousel horizontal, pastilles numérotées, icônes sur fonds | H1 2xl/3xl ; H2 xl/2xl |
- Cohérence partielle : les 4 héros partagent image de fond, overlay et gabarit, mais les sections sont indépendantes et leurs patterns varient. Réutilisation : `Button`, `Accordion` (2 pages), `SEO`; pas de gabarit de page partagé. `page-image-hover` ajoute arrondi/transition aux images.
- Écarts « IA » : nombreuses cartes avec ombres/rayons, badges/icônes colorés, fonds dégradés ou colorés, liserés `border-l`, numérotation décorative, textes CTA répétitifs ; la section actuelle `/services` est la seule déjà éditoriale et plate.
- Animations : classes/transitions CSS et interactions locales ; pas d’usage explicite de `EcoModeContext`. `prefers-reduced-motion` global neutralise le hover des images `page-image-hover`, pas toutes les transitions/animations propres aux composants.

## 5. Navigation et liens entrants
- `SERVICE_NAV_LINKS` → menu Services du `Header` desktop et mobile : Mise à disposition, Recrutement, Externalisation, « Formation & Conseil ». Footer ne lie que `/services`. Candidat : doublons dans `CandidateTopbar` et `CandidateSidebar`.
- `HomePage` lie le parcours candidat et `/services/externalisation`; la page `/services` relie les quatre pages détail. Aucune page de service n’est dans `staticRoutes` du sitemap (`vite.config.ts`), qui ne liste que `/services` parmi ces routes.
- Noms divergents : « Formation & Conseil » navigation vs « Conseil & Formation RH » ; externalisation « administrative » dans SEO mais RH/assistance technique dans le contenu ; l’accueil mentionne d’autres pôles que les quatre pages.
- `ContactPage` n’extrait pas `subject` de l’URL : les liens transmettent des valeurs différentes, mais le champ sujet démarre vide. Aucun formulaire de devis distinct ; le formulaire générique `/contact` ne reçoit pas de préremplissage.
- Redirections `App.tsx` : `/services/solutions-entreprises-bpo` → externalisation ; `/services/conseil-formation-transformation` → conseil/formation ; `/services/hub-emploi-recrutement` → recrutement. Le slug générique `/services/:slug` reste aussi déclaré.

## 6. Contraintes techniques
- `App.tsx` déclare les 5 routes dans `SharedPublicRouteShell`, sans guard de rôle ; une session candidat bascule vers `CandidateLayout`, sinon `PublicLayout` (`Header`, `Footer`, consentement cookies).
- UI utile : `Button`, `Accordion`; typographie Inter, tokens `--primary`, `--secondary`, `--background`, rayons Tailwind ; `styles.css`. Sections détail principalement statiques.
- i18n FR/EN/LN pour navigation ; contenu et SEO des pages services en français codé en dur. Anciennes clés `services.card1..4`, `services.requestQuote.*` sont dans `translations.ts`, mais ne pilotent pas `/services` courant ; traductions détaillées non trouvées.
- Pas d’Eco Mode explicite dans les cinq pages. Réduction de mouvement partielle via `styles.css`/`styles/eco-mode.css`.
- `SEO` → `usePageSEO`/Helmet, canonical par page, marque ajoutée sans doublon ; JSON-LD Organization/WebSite générique. Pas de données structurées de service ni breadcrumb sur ces pages.
- Sitemap produit par plugin Vite : seules les routes statiques `/services` et non les quatre détails sont incluses. Tests dédiés à ces pages : non trouvés.
- Fichiers partagés sensibles : `App.tsx`, `PublicLayout`, `Header`, `Footer`, `SERVICE_NAV_LINKS`, `SEO`/`usePageSEO`, `styles.css`, sitemap `vite.config.ts`; navigation et shell candidat à préserver.

## 7. Diagnostic et recommandations
- Faiblesses `/services` : commence par une section sans H1, ne présente aucune promesse d’accueil, ni preuves vérifiables, ni mode de collaboration ; synthèse correcte mais quatre descriptions et CTA ne comparent pas périmètres/cibles.
- Structure recommandée : 1) introduction H1 + promesse actuelle ; 2) quatre offres comparées par cible/besoin/prestations à partir des pages ; 3) mode d’accompagnement avec les étapes recrutement et externalisation déjà décrites ; 4) liens vers détails ; 5) CTA contact, sans inventer de preuve.
- Conserver : liens/routes, contenus de prestations vérifiables dans le code, navigation et image si elle reste pertinente. Fusionner les avantages redondants entre pages ; supprimer motifs décoratifs et formulations de résultat non démontrées de la page de synthèse.
- À valider/rédiger : proposition de valeur commune, critères de choix entre offres, preuve sociale/chiffres documentés, prix/délais et réponses FAQ ; aucune donnée publique validée trouvée dans le code.
- Questions ouvertes : 1) Présenter les quatre offres à poids égal ou mettre l’externalisation en avant ? 2) Afficher les chiffres statiques après validation métier ? 3) Préremplir `subject` sur `/contact` ? 4) Ajouter les pages détail au sitemap ? 5) Traduire les pages service en EN/LN ?
