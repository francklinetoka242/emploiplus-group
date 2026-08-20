# Audit visuel final — 5 zones restantes

## 1. Périmètre

Audit ciblé de `HomePage.tsx`, `JobsPage.tsx` et `JobCard.tsx`, `JobOfferDetailPage.tsx`, `ContactPage.tsx` et `BlogPage.tsx`. Référence : `docs/audit-ai-visual-identity-post-refonte.md`. Aucun fichier de code n'a été modifié.

## 2. Home

### Hero
Le hero reste une composition de landing page : promesse, grand titre, CTA et image. C'est cohérent pour l'accueil et aucune réécriture n'est nécessaire. Le problème est surtout la transition vers les statistiques, qui reprend immédiatement une grande surface arrondie.

**Modification minimale :** renforcer l'espace et le contraste entre hero et statistiques, sans ajouter de nouvel élément.

### Statistiques
Les trois statistiques sont encore trois cartes identiques dans un panneau arrondi, avec icônes, points décoratifs et animations d'entrée. Les données sont réelles et la carte est justifiée, mais le traitement reste le fragment le plus SaaS de la Home.

**Modification minimale :** conserver le groupe de données, réduire les décorations et donner davantage de poids aux chiffres qu'aux surfaces.

### Services
La paire est réellement différenciée : un bloc à bordure latérale et un panneau sombre. Le contenu, les listes et les CTA sont lisibles. Le second service reste plus démonstratif avec shadow, blur, badge et lift.

**Est-ce trop générique ?** Non, pas au point de justifier une refonte. Une harmonisation légère du niveau d'ombre suffirait.

### Offres / emplois
Aucune section d'offres n'est rendue dans le JSX actuel ; `homeJobs` est chargé mais inutilisé. C'est une anomalie fonctionnelle potentielle, pas un problème de composition à corriger dans cet audit.

### Blog et CTA
Le Blog Home reste une grille de cartes avec shadow et lift, tandis que le CTA final est un panneau de marque avec gradient radial et lift. Ces blocs ont chacun un rôle clair, mais leur succession conserve un rythme de landing page.

### Score
**Home — Apparence IA : 5.8/10**

**Home — Professionnalisme : 7.2/10**

## 3. Jobs + JobCard

`JobsPage.tsx` a une barre de recherche/filtres sticky, des résultats en liste et une pagination. Le sticky est utile et plus professionnel qu'une grille marketing. Les champs et boutons utilisent toutefois beaucoup de `rounded-xl` et les actions secondaires des pills.

`JobCard.tsx` ressemble davantage à une offre d'emploi professionnelle qu'à une carte marketplace : entreprise, intitulé, localisation, contrat, échéance, salaire, extrait et actions sont clairement séparés. La bordure sans ombre est sobre.

La densité reste élevée : contrat, match, tags, icônes, partage, Voir l'offre et Postuler peuvent rivaliser visuellement. Les badges sont fonctionnels, mais leur accumulation dépend des données disponibles.

**Amélioration minimale :** hiérarchiser davantage le titre, l'entreprise et l'action principale ; ne pas changer la structure métier ni supprimer les informations.

**Jobs — IA : 5.5/10**

**JobCard — IA : 5.4/10**

**Jobs — Professionnalisme : 7.1/10**

## 4. Job detail

Le header d'offre est maintenant un bloc ouvert avec séparation et gradient discret. Les informations principales sont plus lisibles qu'avant. Les blocs description et exigences utilisent également une structure ouverte, ce qui réduit nettement l'effet de succession de panneaux.

Les zones candidature et analyse IA restent des panneaux arrondis. C'est justifié : elles portent des actions, des états et des résultats interactifs. Les listes d'exigences et d'informations secondaires gardent cependant des sous-blocs arrondis imbriqués.

**Est-ce encore une succession de panneaux UI ?** Partiellement, dans la colonne d'action ; la colonne éditoriale ressemble désormais à une page d'offre professionnelle.

**Amélioration minimale :** maintenir la colonne principale ouverte et limiter les sous-surfaces de la sidebar. Ne pas modifier la logique de candidature.

**Job Detail — IA : 5.7/10**

**Job Detail — Professionnalisme : 7.5/10**

## 5. Contact

Le hero sombre avec gradients radiaux, badge et titre centré conserve une forte signature de landing page. Il n'est pas automatiquement problématique : le contraste peut signaler l'entrée dans un parcours de contact corporate. Le formulaire est le seul grand panneau de la zone et sa fonction justifie cette surface.

Les coordonnées sont maintenant un groupe ouvert avec icônes inline et séparateurs. La hiérarchie entre informations de contact et formulaire est claire. Le principal résidu SaaS est la combinaison hero très spectaculaire + formulaire gradient + grand titre.

**Le design ressemble-t-il à une vraie page de contact ?** Oui, mais avec une introduction plus marketing que nécessaire.

**Amélioration minimale :** réduire la concurrence visuelle du hero par l'espace et la typographie, sans supprimer le gradient par principe.

**Contact — IA : 5.6/10**

**Contact — Professionnalisme : 7.3/10**

## 6. Blog

Le rail featured est une vraie hiérarchie éditoriale : image, label « À la une », titre, extrait et partage. La grille régulière a été aplatie en liste de contenus avec bordure inférieure et hover de bordure ; elle ressemble moins à une grille de cards marketing.

Les catégories et dates sont utiles. Les pills de catégorie restent acceptables, car elles classent les articles. Le scale des images est discret et cohérent avec un lien image.

Le rail `overflow-x-auto` avec une largeur minimale de 360 px reste le principal point responsive. Il peut être pertinent sur mobile, mais doit être testé au doigt : visibilité de la carte suivante, scroll horizontal involontaire et interaction avec le contenu vertical.

**Blog — IA : 5.8/10**

**Blog — Professionnalisme : 7.2/10**

## 7. Comparaison des 5 zones

| Zone | IA avant dernière refonte | IA actuelle | Professionnalisme actuel | Priorité |
|---|---:|---:|---:|---|
| Home | 5.8/10 | 5.8/10 | 7.2/10 | Moyenne |
| Jobs / JobCard | 5.5/10 | 5.4/10 | 7.1/10 | Faible |
| Job Detail | 7/10 | 5.7/10 | 7.5/10 | Faible |
| Contact | 7/10 | 5.6/10 | 7.3/10 | Moyenne |
| Blog | 7/10 | 5.8/10 | 7.2/10 | Moyenne |

Les scores Home et Jobs progressent peu parce que les patterns restants sont concentrés dans des composants fonctionnels ou des sections déjà légitimes. Job detail, Contact et Blog montrent la baisse la plus perceptible.

## 8. Problèmes réellement restants

1. `HomePage.tsx` — statistiques : trois cartes identiques et animations décoratives ; impact moyen ; renforcer la hiérarchie des chiffres.
2. `HomePage.tsx` — blog/CTA : deux surfaces fortes consécutives ; impact moyen ; augmenter la respiration entre les rythmes.
3. `JobCard.tsx` — densité badges/actions ; impact moyen ; clarifier visuellement l'action principale.
4. `JobOfferDetailPage.tsx` — sous-blocs arrondis dans la sidebar ; impact faible à moyen ; conserver seulement les surfaces nécessaires.
5. `ContactPage.tsx` — hero très marketing ; impact moyen ; réduire la concurrence entre badge, titre et gradients.
6. `BlogPage.tsx` — rail horizontal mobile ; impact responsive moyen ; tester sur appareil réel avant toute modification.

## 9. À laisser tranquille

- La structure ouverte de la FAQ n'appartient pas à ces cinq zones, mais son principe de séparateurs ne doit pas être réappliqué mécaniquement partout.
- La séparation des coordonnées Contact est maintenant adaptée et ne doit pas redevenir une série de cartes.
- Le JobCard sans ombre est suffisamment sobre ; ne pas le transformer en bloc éditorial abstrait.
- Le panneau de candidature et l'analyse IA du Job detail sont fonctionnels et justifient une surface.
- Le featured Blog doit rester distinct des articles réguliers ; supprimer toute carte rendrait la hiérarchie éditoriale moins claire.

## 10. Score final des 5 zones

**Apparence IA moyenne des 5 zones : 5.7/10**

**Professionnalisme moyen : 7.3/10**

**Cohérence avec l'identité Emploiplus-Group : 7.5/10**

### Nouvelle refonte générale ?

**OUI : une nouvelle refonte générale serait inutile.** Les cinq zones ont maintenant des compositions suffisamment adaptées à leurs fonctions. Seules des corrections locales de hiérarchie, densité et responsive restent pertinentes ; une nouvelle passe globale risquerait de créer de l'incohérence.

### À CORRIGER MAINTENANT

- Rééquilibrer légèrement le groupe de statistiques de `HomePage.tsx`.
- Clarifier le poids de l'action principale dans `JobCard.tsx`.
- Réduire les sous-surfaces de la sidebar de `JobOfferDetailPage.tsx` si leur imbrication devient perceptible.
- Vérifier le contraste visuel entre hero et formulaire de `ContactPage.tsx`.

### À TESTER SUR APPAREIL RÉEL

- Rail featured `BlogPage.tsx` à 320–390 px.
- Barre sticky et filtres `JobsPage.tsx`.
- Widget WhatsApp fixed sur Jobs.
- Longs titres et listes d'exigences du Job detail.
- Empilement hero/formulaire sur Contact mobile.

### À NE PLUS TOUCHER

- La composition ouverte régulière du Blog.
- Le groupe de coordonnées Contact avec séparateurs.
- La colonne éditoriale ouverte du Job detail.
- Les cartes d'offres fonctionnelles et sans ombre de `JobCard`.
- La paire de compositions distinctes des services sur Home.
