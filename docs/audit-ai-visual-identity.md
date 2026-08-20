# Audit visuel — Apparence « site généré par IA »

## 1. Périmètre et méthode

Audit statique fondé sur les pages publiques, les composants réutilisables et les tokens CSS présents dans `src/`. Aucun code n'a été modifié. L'évaluation décrit les conséquences visuelles probables du code ; elle ne remplace pas une série de captures sur appareils réels.

Sources principales : `src/styles.css`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/site/Header.tsx`, `src/pages/public/HomePage.tsx`, `ServicesPage.tsx`, `JobsPage.tsx`, `JobOfferDetailPage.tsx`, `BlogPage.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, `FAQPage.tsx` et les pages `src/pages/public/services/`.

## 2. Marqueurs d'un design généré par IA

### Répétition des surfaces — niveau élevé

`rounded-2xl`, `rounded-3xl`, `[28px]`, `[32px]`, `border`, `bg-card` et `shadow-soft` reviennent sur Home, Blog, FAQ, Contact, Job detail et les services. Chaque usage est parfois justifié, mais leur combinaison répétée rend les sections interchangeables.

**Direction conceptuelle :** réserver les surfaces aux contenus qui doivent être regroupés ; utiliser davantage de séparateurs, de fonds de section et de blocs éditoriaux ouverts.

### Motif icône + titre + texte — niveau élevé

Les services candidat, Contact, Job detail et plusieurs composants de services alignent une icône, un titre et une description dans une grille. C'est lisible, mais très proche des patterns de landing pages générées.

**Direction conceptuelle :** alterner avec des listes, des étapes numérotées, des titres inline et des compositions image + texte.

### Grilles parfaites — niveau moyen à élevé

Home, About, Blog et Services utilisent des grilles régulières de deux ou trois colonnes. Les grilles servent souvent un contenu réel, mais le rythme devient prévisible lorsque chaque item reçoit la même surface et le même padding.

**Direction conceptuelle :** introduire une asymétrie éditoriale ponctuelle, sans supprimer les grilles utiles.

### Badges et pills — niveau moyen à élevé

Les labels de rôle, catégories, statuts et CTA emploient fréquemment `rounded-full`. Les badges fonctionnels sont légitimes ; le problème apparaît lorsqu'ils précèdent systématiquement un titre ou doublonnent une icône décorative.

**Direction conceptuelle :** conserver les labels de statut et réduire les pills purement introductives.

### Ombres et glassmorphism — niveau moyen

`shadow-soft`, `shadow-sm`, `shadow-lg`, `shadow-xl`, `shadow-elev`, gradients et `backdrop-blur` donnent une profondeur familière aux interfaces SaaS. La profondeur est plus marquée dans Home, Hero services, Hub Emploi et EnterpriseWorkflow.

**Direction conceptuelle :** faire porter la hiérarchie par le contraste, l'espace et les lignes ; réserver l'ombre aux éléments surélevés ou interactifs.

### Hero prévisible — niveau moyen

Les heroes combinent badge, grand titre, paragraphe, CTA et illustration. Le contenu métier est réel, mais la structure reste celle d'une landing page SaaS conventionnelle.

**Direction conceptuelle :** donner à chaque hero une priorité éditoriale claire : promesse, offre, preuve ou parcours, plutôt que tous les signaux simultanément.

### Hiérarchie typographique — niveau moyen

Inter et Plus Jakarta Sans créent une hiérarchie cohérente. Les titres en `text-3xl` à `text-5xl` sont toutefois employés dans de nombreuses sections, ce qui réduit l'écart entre introduction, contenu et action.

**Direction conceptuelle :** réserver les plus grands niveaux aux véritables introductions et renforcer la hiérarchie par la longueur de ligne et le poids.

## 3. Direction artistique

La marque possède une identité reconnaissable : bleu profond `#00009e`, accent doré `#e8a900`, logo, vocabulaire RH/BPO, photos d'équipe et visuels de parcours candidat. Cette base soutient la crédibilité et convient à une entreprise RH.

Le système est techniquement cohérent : tokens CSS, `Button`, `Card`, `container-page`, typographies dédiées et variantes responsive. La cohérence est néanmoins parfois obtenue par répétition de surfaces plutôt que par une direction éditoriale différenciée.

La direction actuelle est plus proche de **C — site corporate générique**, avec des tendances **A — template SaaS** et **B — landing page générée par IA** sur les pages marketing. Elle n'est pas une sortie IA brute : les données, les parcours candidat, les offres et les photos apportent une réalité métier. Elle n'atteint pas encore D, car les rythmes de composition restent trop prévisibles.

## 4. Composants réutilisés

| Composant / système | Effet positif | Risque d'uniformisation |
|---|---|---|
| `Card` | Base claire, réutilisable et accessible. | Impose `border + bg-card + shadow-sm` si les variantes ne le remplacent pas. |
| `Button` | Variantes utiles et cohérentes. | Les tailles, rayons et CTA restent très similaires entre pages. |
| `Header` | Navigation stable, marque visible, responsive. | Sticky + blur + shadow renforce le pattern SaaS standard. |
| `SectionHeader` / `PageHeading` | Lecture et alignement cohérents. | Peut produire la même introduction de section partout. |
| `JobCard` | Regroupe une vraie offre et ses actions. | Densité de badges, tags et icônes élevée, mais fonctionnelle. |
| `ShareButtons` | Fonction de partage explicite. | Menus et boutons ajoutent une couche de contrôles répétitifs. |
| `container-page` | Largeur stable et responsive. | Devient prévisible si toutes les sections suivent le même axe. |

La réutilisation technique est saine. Le problème est l'usage de la même combinaison de classes autour de ces abstractions, pas l'existence des abstractions elles-mêmes.

## 5. Pages publiques

| Page | Apparence IA /10 | Problème principal | Élément réussi | Diversification prioritaire |
|---|---:|---|---|---|
| Home | 6.5 | Grilles, cartes, ombres et CTA très balisés. | Services désormais en deux compositions distinctes ; contenu RH clair. | Varier statistiques, blog et CTA sans multiplier les surfaces. |
| Services | 6.5 | Badge + titre + texte + grille d'items répétés. | Vrai parcours candidat, carousel et photo entreprise. | Transformer certaines features en liste ou séquence éditoriale. |
| Jobs | 5.5 | Contrôles arrondis et densité de tags. | `JobCard` contient des données et actions utiles. | Mieux hiérarchiser filtres, résultats et état vide. |
| Job detail | 7 | Nombreux panneaux `rounded-[28px]` avec ombre et icônes. | Informations et actions métier bien regroupées. | Réserver les panneaux aux blocs prioritaires. |
| Blog | 7 | Featured rail et grille répètent les cartes d'article. | Images, catégories, date et partage donnent un vrai rôle éditorial. | Différencier featured, liste et lecture sans même hover lift. |
| About | 5.5 | Équipe et statistiques reprennent le langage des cartes. | Photos, valeurs et chiffres portent une identité humaine. | Poursuivre le rythme ouvert introduit pour les valeurs. |
| Contact | 7 | Trois cartes de contact presque identiques. | Priorité des moyens de contact immédiatement lisible. | Utiliser un bloc de coordonnées structuré plutôt que trois surfaces. |
| FAQ | 7.5 | Chaque réponse est une grande carte identique. | Contenu direct et lisible. | Passer à une liste ou à des séparateurs fonctionnels. |
| Solutions Entreprises | 5.5 | Étapes en articles répétés, malgré un style plus plat. | Ton BPO concret et workflow compréhensible. | Accentuer la progression plutôt que la répétition de cartes. |

## 6. Patterns à casser en priorité

1. Impact très élevé — « titre + sous-titre + trois cartes » sur Home, About et services : varier la composition des groupes.
2. Impact très élevé — `border + shadow + grand radius` : conserver une seule profondeur dominante par section.
3. Impact très élevé — icône en pastille + titre + description : remplacer certaines occurrences par icône inline ou liste.
4. Impact élevé — FAQ en cartes identiques : utiliser des séparateurs et une hiérarchie de questions.
5. Impact élevé — trois cartes Contact identiques : créer un groupe de coordonnées plus éditorial.
6. Impact élevé — Blog featured et grille avec hover lift similaire : réserver l'élévation au featured ou aux liens.
7. Impact moyen — badges introductifs trop fréquents : conserver uniquement les labels informatifs.
8. Impact moyen — mêmes grands rayons entre sections, cartes et contrôles : établir une hiérarchie de rayons.
9. Impact faible — Header sticky avec blur et ombre : maintenir la fonction, réduire l'effet lorsque la page est au sommet.
10. Impact faible — répétition de grandes animations d'entrée : garder les transitions utiles, réduire les effets parallèles.

## 7. Comparaison avec un site corporate mature

Un site corporate mature de ce secteur ferait davantage varier le rythme entre preuve, offre, méthode, équipe et contact. Les informations prioritaires seraient portées par la typographie, l'ordre des contenus et des séparations nettes avant d'être portées par des cartes.

EmploiPlus possède déjà les ingrédients de cette maturité : marque claire, photos réelles, données d'offres, workflow BPO, navigation complète et responsive pensé dans le code. Il manque surtout une parcimonie plus forte des surfaces et une hiérarchie éditoriale plus assumée. L'espace blanc existe, mais il sert parfois à éloigner des grilles plutôt qu'à créer une tension de lecture.

La crédibilité professionnelle est bonne ; l'originalité compositionnelle est moyenne. Le site paraît davantage « système corporate cohérent avec des patterns SaaS » que « identité digitale singulière ».

## 8. Score synthétique

| Critère | Score /10 |
|---|---:|
| Apparence générique / IA | 6.5 |
| Identité de marque | 6.5 |
| Maturité corporate | 6.5 |
| Hiérarchie visuelle | 6 |
| Variété des compositions | 5.5 |
| Qualité typographique | 7 |
| Cohérence du Design System | 7.5 |
| Originalité | 5 |
| Crédibilité professionnelle | 7 |
| Qualité globale | 6.5 |

## Verdict

Le site présente un niveau **moyen à élevé de ressemblance avec un site construit à partir de patterns IA/SaaS**, environ **6.5/10**. Son identité RH et ses contenus réels empêchent l'impression de prototype générique, mais la répétition des cartes, des grands rayons, des ombres, des pills et des compositions centrées maintient une signature visuelle standardisée.

**Estimation globale : 65/100 d'apparence générée par IA.** La priorité n'est pas d'ajouter des effets, mais de faire porter la personnalité par la composition, la typographie, les preuves métier et le rythme des sections.
