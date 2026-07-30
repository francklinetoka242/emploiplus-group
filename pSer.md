# Rapport complet de la page Services

## 1. Vue d'ensemble

La page Services de EmploiPlus Group est une page publique dédiée à présenter l'offre de services de l'organisation de manière élégante, structurée et orientée conversion. Elle met en avant deux grands axes stratégiques :

- le pôle candidat / emploi
- le pôle entreprise / BPO & délégation RH

La page a été conçue pour donner une impression de modernité, de premium et d'accompagnement sur mesure, avec une mise en page en deux blocs principaux, séparés visuellement, plutôt qu'un système d'onglets ou de switcher.

Le composant principal est implémenté dans [src/pages/public/ServicesPage.tsx](src/pages/public/ServicesPage.tsx).

---

## 2. Objectif de la page

Cette page vise à :

1. expliquer clairement les services proposés par EmploiPlus Group ;
2. renforcer la crédibilité de l'entreprise ;
3. guider les visiteurs vers une action concrète : demander un service, demander un devis ou contacter l'équipe ;
4. transmettre une image premium, professionnelle et rassurante.

---

## 3. Structure générale de la page

La page suit une structure en trois grandes parties :

### 3.1 En-tête de page / hero
Une première zone introductive présente le positionnement global de l'offre de services.

Contenu visible :
- un petit label en haut : "Nos Pôles d'Expertise"
- un titre principal : "Des solutions pensées pour avancer, avec élégance et impact."
- un sous-texte descriptif : présentation de l'offre comme deux parcours complémentaires pour les candidats et les entreprises.

Cette zone sert de point d'entrée visuel et donne immédiatement l'impression d'un site moderne et soigné.

### 3.2 Bloc 1 : Hub candidats & emploi
Ce premier bloc est dédié aux services proposés aux candidats et aux personnes en recherche d'emploi.

Il contient :
- un bandeau de présentation à gauche
- un ensemble de cartes de services à droite

Le message principal est : accompagner et faire décoller les parcours professionnels.

### 3.2 Bloc 2 : BPO & délégation RH
Le second bloc est dédié aux entreprises et aux besoins RH / opérationnels.

Il contient :
- un bandeau de présentation à gauche, dans un style plus sombre et plus corporate
- un ensemble de cartes de services à droite

Le message principal est : exécuter pour le compte du client, avec précision et rythme.

---

## 4. Contenu textuel de la page

### 4.1 Texte principal du hero

Titre :
- "Des solutions pensées pour avancer, avec élégance et impact."

Sous-texte :
- "Deux parcours complémentaires, conçus pour accompagner les candidats et renforcer les entreprises avec des services premium, fluides et engagés."

### 4.2 Contenu du bloc candidats

Badge :
- "HUB CANDIDATS & EMPLOI"

Titre :
- "Accompagner et faire décoller les parcours professionnels."

Sous-texte :
- "Un écosystème de services pensé pour renforcer la visibilité, améliorer les candidatures et accélérer l’insertion professionnelle."

#### Cartes présentes dans ce bloc

1. Publication & Recherche d'Emploi
   - description : accès prioritaire aux opportunités du marché, mise en relation directe avec les recruteurs et alertes personnalisées.

2. Conception & Refonte de CV / Lettre de Motivation
   - description : optimisation professionnelle des outils de candidature pour capter l’attention des recruteurs et réussir les logiciels ATS.

3. Orientation Professionnelle & Coaching
   - description : bilans de compétences, préparation ciblée aux entretiens d'embauche et conseils de carrière personnalisés.

4. Formations & Renforcement de Compétences
   - description : modules de formation pratiques pour développer les compétences métiers les plus recherchées.

### 4.3 Contenu du bloc entreprises

Badge :
- "BPO & DÉLÉGATION RH"

Titre :
- "Exécuter pour le compte du client, avec précision et rythme."

Sous-texte :
- "Des solutions B2B robustes pour déléguer des opérations, renforcer vos effectifs et piloter des projets clés en main."

#### Cartes présentes dans ce bloc

1. Externalisation de Processus Métier (BPO - Business Process Outsourcing)
   - tagline : "Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels."
   - détails : prise en charge intégrale des tâches récurrentes ou sous-traitées.

2. Délégation de Personnel & Mise à Disposition
   - tagline : "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale."
   - détails : mise à disposition rapide de personnel qualifié, avec gestion administrative RH.

3. Gestion de Projets & Équipes Déléguées
   - tagline : "Une exécution clé en main pour vos projets stratégiques."
   - détails : déploiement et supervision directe d'équipes opérationnelles dédiées.

---

## 5. Éléments UI utilisés dans le code

### 5.1 Composants React utilisés

- `SEO` : pour la balise SEO, le titre, la description, les mots-clés, le canonical et les breadcrumbs.
- `Link` de React Router : pour les liens internes vers la page de contact.
- `Button` : pour les CTA principaux et secondaires.
- `lucide-react` : pour les icônes associées à chaque service.

### 5.2 Icônes utilisées

Dans le bloc candidats :
- `UserCheck`
- `FileText`
- `GraduationCap`
- `Briefcase`

Dans le bloc entreprises :
- `Building2`
- `Users`
- `Briefcase`

### 5.3 Boutons d'action

La page comporte plusieurs call-to-action :
- "Demander un service"
- "En savoir plus"
- "Demander un devis"
- "Contactez notre équipe B2B"

Ces boutons sont stylisés de manière différente selon leur importance :
- bouton primaire : couleur de marque
- bouton secondaire : fond blanc ou blanc transparent selon le bloc

---

## 6. Style visuel de la page

### 6.1 Direction artistique
Le design de cette page est volontairement :
- premium
- moderne
- calme
- orienté “site de services haut de gamme”
- plus visuel qu'informational

L'ambiance est proche d'un design éditorial ou d'un site touristique premium, avec une attention particulière à la respiration, à la clarté et à la hiérarchie.

### 6.2 Palette de couleurs
La page repose sur une palette sobre et professionnelle :
- fond général : blanc / très clair
- cartes : blanc ou gris très doux
- couleur principale (brand) : utilisée pour les accents, badges, icônes et boutons
- fond du bloc entreprises : bleu-gris sombre, pour donner une impression plus corporate et institutionnelle

### 6.3 Structure spatiale
Le layout utilise :
- des containers centrés avec `max-w-6xl`
- des espacements importants entre sections
- des blocs arrondis avec `rounded-[32px]` et `rounded-[36px]`
- une grande marge verticale pour une lecture plus agréable

### 6.4 Bordures et ombres
Les cartes et blocs sont dotés de :
- bordures fines et discrètes
- ombres douces
- un rendu plus “card-based” que “simple panel"

L'effet visuel permet de créer une texture premium sans surcharger la page.

### 6.5 Gradients et profondeur
Le hero et les panneaux latéraux utilisent des dégradés subtils :
- fond clair avec une touche de couleur de marque
- fond sombre pour le bloc entreprises

Cela apporte de la profondeur et un aspect plus travaillé.

### 6.6 Typographie
La page utilise :
- une typographie principale sobre et lisible
- un style plus marqué pour les titres avec la classe `font-display`
- des textes secondaires plus doux avec `text-muted-foreground`

Les titres sont plus grands et plus imposants pour renforcer la hiérarchie visuelle.

### 6.7 États interactifs
Les cartes et boutons comportent des animations légères au survol :
- légère translation vers le haut
- ombre plus forte
- agrandissement discret de l'icône
- boutons qui changent d'apparence au survol

Ces micro-interactions apportent de la fluidité sans être agressives.

---

## 7. Comportement responsive

La page est pensée pour fonctionner correctement sur plusieurs écrans :
- sur mobile : les contenus sont empilés verticalement
- sur tablette : la structure reste lisible et compacte
- sur desktop : les blocs s'affichent en colonnes plus équilibrées avec un rendu plus aéré

Les cartes passent d'une disposition en grille à une disposition plus compacte selon la taille d'écran.

---

## 8. Composition technique du contenu

Le contenu est séparé en deux tableaux de données :

- `CANDIDATE_SERVICES` : services pour les candidats
- `B2B_SERVICES` : services pour les entreprises

Cette approche rend le code plus propre, plus maintenable et plus facile à étendre.

Chaque service contient :
- un titre
- une description ou un tagline
- un détail complémentaire
- une icône

---

## 9. Éléments de conversion

La page ne se contente pas d'informer : elle oriente aussi vers l'action.

Les principaux points de conversion sont :
- le bouton "Demander un service"
- le bouton "En savoir plus"
- le bouton "Demander un devis"
- le bouton "Contactez notre équipe B2B"

Ces appels à l'action sont placés de manière stratégique dans les zones de forte visibilité.

---

## 10. Positionnement marketing

La page transmet un positionnement clair :
- EmploiPlus Group accompagne les candidats dans leur parcours professionnel
- EmploiPlus Group soutient les entreprises dans leur performance RH et opérationnelle
- L'entreprise combine accompagnement humain, services stratégiques et expertise opérationnelle

Ce positionnement est renforcé par un ton rassurant, professionnel et premium.

---

## 11. Résumé synthétique

La page Services est une page de présentation haut de gamme qui combine :
- un contenu clair et orienté service
- une structure visuelle moderne
- des cartes bien hiérarchisées
- des boutons d'action bien visibles
- une identité visuelle premium et professionnelle

Elle est conçue pour faire sentir à l'utilisateur que EmploiPlus Group propose des solutions sérieuses, élégantes et adaptées à des besoins concrets.
