# Page Services - Configuration et contenu

## Vue d'ensemble

La page de services est la page de destination principale du parcours "Services" du site. Elle présente deux parcours principaux :

- un parcours candidat
- un parcours entreprise / BPO

Elle est rendue par le composant principal situé dans le fichier [src/pages/public/ServicesPage.tsx](src/pages/public/ServicesPage.tsx).

---

## 1. Fichier principal

Composant principal :
- [src/pages/public/ServicesPage.tsx](src/pages/public/ServicesPage.tsx)

Ce fichier contient :
- le SEO de la page
- l'en-tête de section
- les deux cartes de services
- les liens de navigation vers les pages détaillées

---

## 2. Structure de la page

La page est construite autour de quatre parties principales :

### 2.1 En-tête de présentation

Cette partie présente la thématique générale :
- titre : "Nos solutions RH pour candidats et entreprises"
- sous-titre descriptif
- badge "Solutions RH Digitales"

Elle sert à contextualiser la page et à orienter le visiteur.

### 2.2 Carte candidat

Cette carte met en avant le parcours candidat avec :
- un titre principal
- une description courte
- une liste de bénéfices
- un bouton "Découvrir l'espace candidat"
- une illustration visuelle

### 2.3 Carte entreprise / BPO

Cette carte met en avant le parcours entreprise avec :
- un titre principal
- une description courte
- un résumé de la solution BPO
- une liste de points clés
- un bouton "Découvrir nos solutions"
- une illustration visuelle

### 2.4 Navigation

Les deux cartes redirigent vers des pages plus détaillées :
- Candidat -> /services/hub-candidat-intelligent
- Entreprise -> /services/solutions-entreprises-bpo

---

## 3. Configuration SEO

La page utilise le composant SEO pour définir les métadonnées de la page.

### Informations SEO actuellement définies

- title : "Nos solutions RH | EmploiPlus Group"
- description : "Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes."
- canonical : "${BASE_URL}/services"
- robots : "index,follow"

Cette configuration permet :
- d’optimiser le référencement naturel
- d’identifier proprement la page sur les moteurs de recherche
- d’associer la bonne URL canonique

---

## 4. Contenu textuel de la page

### 4.1 Texte principal

Le texte introductif de la page est le suivant :

> Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes.

### 4.2 Carte candidat

Titre :
- "Trouvez les meilleures opportunités et postulez rapidement"

Description :
- "Trouvez rapidement les meilleures opportunités, créez votre profil professionnel et postulez en quelques clics."

Bénéfices affichés :
- Matching intelligent
- Offres recommandées
- Lettre automatique
- Candidature express

### 4.3 Carte entreprise

Titre :
- "Solutions Entreprises / BPO"

Description :
- "Un processus métier clair, puissant et parfaitement orchestré pour externaliser vos opérations et renforcer vos performances RH."

Résumé présenté :
- Vous avez un besoin
- Nous analysons
- Nous déployons
- Nous pilotons

---

## 5. Composants visuels utilisés

### 5.1 Icônes

La page utilise des icônes provenant de la bibliothèque Lucide React :
- User pour la carte candidat
- Briefcase pour la carte entreprise
- Check pour les listes de bénéfices

### 5.2 Illustrations

Deux images sont utilisées :
- candidateIllustration : image liée au parcours candidat
- enterpriseIllustration : image liée au parcours entreprise

Ces images sont importées depuis le dossier des assets services.

### 5.3 Style

Le design est basé sur une structure moderne avec :
- fond blanc
- cartes pleine largeur
- bordures discrètes
- ombre douce
- bouton neutre avec style sobre

---

## 6. Navigation associée

### 6.1 Lien candidat

Destination :
- /services/hub-candidat-intelligent

### 6.2 Lien entreprise

Destination :
- /services/solutions-entreprises-bpo

Ces liens sont placés uniquement sur les boutons de découverte, afin de garder la carte non cliquable dans sa totalité.

---

## 7. Pages détaillées liées

### 7.1 Page candidat détaillée

Fichier :
- [src/pages/public/services/HubCandidatPage.tsx](src/pages/public/services/HubCandidatPage.tsx)

Cette page propose un parcours plus détaillé autour du candidat :
- matching intelligent
- offres recommandées
- lettre de motivation
- candidature express

### 7.2 Page entreprise détaillée

Fichier :
- [src/pages/public/services/SolutionsEntreprisePage.tsx](src/pages/public/services/SolutionsEntreprisePage.tsx)

Cette page présente en détail :
- l’externalisation de processus métier
- la délégation de personnel
- la gestion de projets
- le pilotage opérationnel

---

## 8. Bonnes pratiques de maintenance

Pour modifier cette page efficacement :

1. Modifier le contenu textuel dans [src/pages/public/ServicesPage.tsx](src/pages/public/ServicesPage.tsx)
2. Ajuster les images si nécessaire dans les imports du fichier
3. Mettre à jour les liens si de nouvelles pages sont créées
4. Garder la cohérence entre la page de services et les pages détaillées

---

## 9. Résumé technique

La page service est une landing page de présentation qui :
- informe le visiteur sur les solutions RH proposées
- oriente vers deux parcours distincts
- met en valeur les offres principales
- relie la page d’entrée à des pages de détail plus riches

Elle est pensée comme un point d’entrée marketing et de navigation, plus que comme une page de contenu purement informatif.
