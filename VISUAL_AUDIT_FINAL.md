# Audit visuel final

## 1. Résumé

Le site a clairement progressé par rapport au précédent audit. Les éléments les plus évidents de placeholder visuel ont disparu : pas de blocs gris vides dans la home, pas de header vide dans Services, et la hero a été simplifiée. La composition est maintenant plus lisible, plus sobre et moins proche d'un template "IA" brut.

Cependant, plusieurs signes de template persistent : répétition de cartes, badges, icônes circulaires, bordures et ombres, et une impression générale de design récurrent. Le point le plus sérieux reste le code `homeJobs` dans `HomePage.tsx` : le hook est appelé, mais les offres ne sont pas réellement rendues dans cette page. Ce défaut est visuel et structurel, même s'il n'est pas forcément visible en exécution si le composant est remplacé ailleurs.

La qualité globale est meilleure que dans le précédent audit, mais elle reste inégale et n'est pas encore réellement premium. Le site est désormais plus professionnel, mais pas complètement dépourvu d'artifice.

## 2. Vérification des problèmes précédents

| Problème | Statut | Observation |
|---|---|---|
| Rectangles gris `h-12 w-36` dans la home | CORRIGÉ | Aucune occurrence de ce motif n'est visible dans `HomePage.tsx`. La home actuelle est plus simple, sans blocs gris vides ni placeholders actionnels. |
| Hero décoratif faux dashboard | PARTIELLEMENT CORRIGÉ | Le faux dashboard a disparu. Il n'y a plus de panneau décoratif chargé de carrés/graphes sans sens. La composition reste propre, mais l'élément stat-card reste très "design-system" et n'est pas totalement neutre. |
| Cellule statistique vide | CORRIGÉ | La grille des statistiques est cohérente et équilibrée, sans cellule vide. Les 3 cartes sont remplies et lisibles. |
| Header vide dans `ServicesPage.tsx` | CORRIGÉ | Le `header` vide n'existe plus. La première section démarre immédiatement avec du contenu réel et des blocs cohérents. |
| Rendu des offres dans `homeJobs` | NON CORRIGÉ | Le hook `usePublishedJobOffers(2)` est appelé dans `HomePage.tsx`, mais `homeJobs` n'est pas réellement exploité dans le JSX. Il n'y a pas de rendu de cartes de jobs sur la home. Le chargement semble donc inutile ou inactif. |
| Rail featured blog mobile avec `min-w-[360px]` | PARTIELLEMENT CORRIGÉ | La contrainte n'a pas disparu, mais elle est encadrée par `min-w-[min(360px,calc(100vw-2.5rem))]` et un overflow horizontal intentionnel. Cela reste un rail scrollable, pas un débordement accidentel majeur, mais cela mérite une vérification réelle sur petit écran. |
| Bouton WhatsApp fixe mobile | NON VÉRIFIABLE | Le bouton est bien fixé avec `bottom-[calc(1.25rem+env(safe-area-inset-bottom))]`, `z-40` et un `position: fixed`, donc le risque de chevauchement existe. Le code suggère une bonne prise en compte du safe area, mais le comportement réel doit être vérifié sur appareil. |
| Articles solutions entreprises | CORRIGÉ | Les cinq articles sont cohérents, lisibles et ne virent pas dans le faux "card design" artificiel. Les bordures et espacements restent légers et professionnels. |
| Cartes vides ou wrappers inutiles | PARTIELLEMENT CORRIGÉ | Les cartes vides ont été évitées dans les grandes sections publiques. Les skeletons sont justifiés pendant le chargement, mais la répétition de card pattern reste visible. |
| Répétition IA / template | PARTIELLEMENT CORRIGÉ | Le site est nettement plus propre, mais les mêmes motifs reparaissent : cartes arrondies, bordures, ombres légères, icônes dans des cercles, badges colorés, hover lift. |
| Hiérarchie visuelle | PARTIELLEMENT CORRIGÉ | Les titres et CTA se distinguent mieux. L'hégémonie de la structure par carte reste encore présente dans certaines sections, surtout sur la home et les pages de services. |
| Responsive général | PARTIELLEMENT CORRIGÉ | Aucune erreur évidente de min-width excessif ou de grilles cassées dans le code. Le point de vigilance reste le rail horizontal blog et le bouton WhatsApp fixe. |

## 3. Cards et éléments artificiels

### Éléments justifiés

- Les cartes de statistiques de la home sont correctes : elles contiennent des chiffres réels, des icônes utiles et un libellé lisible.
- Les cartes blog de la home sont légitimes ; elles présentent de vrais articles avec image, titre, extrait et CTA.
- Les cartes de services sont utiles et structurées : elles expliquent des parcours métier et ne sont pas vides.
- Les cards des sections entreprise BPO restent cohérentes : elles ont un rôle éditorial clair.
- Les skeletons visibles pendant le chargement sont acceptables et ne doivent pas être confondus avec des cartes vides.

### Éléments décoratifs mais tolérables

- Les petits points couleur dans les stats créent un effet de "dashboard" très léger. Ce n'est pas vide, mais cela participe à l'impression de design système.
- Les badges de type "À la une" ou label de section sont justifiés, mais ils se répètent souvent dans plusieurs pages.
- Les icônes dans des pastilles restent cohérentes, mais contribuent à la logique de "template premium" lorsque la composition est trop uniforme.

### Éléments artificiels encore présents

- La home conserve une forte logique de cartes identiques dans les blocs de services et statistiques : pas de contenu vide, mais beaucoup de répétition de motif.
- Les courses de design par `rounded-3xl`, `border`, `shadow-soft` et hover lift se répètent dans plusieurs pages publiques ; le site n'est pas encore totalement libre d'une esthétique générique.
- Le code montre que les pages publiques sont construites sur des composants visuels standardisés, ce qui est efficace mais un peu mécanique.

### Verdict

Il n'y a pas de card vide majeure. Le vrai problème actuel n'est pas l'absence de contenu, mais la densité de motifs visuels standardisés qui donnent encore un effet de design massifié et IA.

## 4. Répétitions visuelles restantes

La répétition n'a pas disparu complètement :

- `border + shadow + radius` : très présent dans les sections publiques.
- badges colorés, petites pastilles, icônes dans des cercles : récurrents.
- `rounded-2xl` / `rounded-3xl` : très utilisé sur les pages public, service, blog.
- `hover:-translate-y-1` / `hover:-translate-y-3` : présence constante, surtout sur cartes et articles.
- `shadow-soft` / `shadow-elev` : répétés sur plusieurs pages, parfois sur des sections qui ne nécessitent pas autant d'ombre.
- structure "icon + title + text" : très courante et cohérente d'un point de vue UX, mais de moins en moins originale visuellement.

La répétition est encore forte, mais elle n'est plus aussi agressive qu'avant. Elle est surtout visible dans des pages très structurées, plus que dans des sections vides ou des faux dashboards. Le résultat est maintenant plus lisible, même s'il reste "standard premium".

## 5. Responsive

### Positif

- Aucune erreur de structure évidente sur la home dans le code.
- Les sections utilisent des grilles fluides (`grid`, `md:grid-cols-*`, `lg:grid-cols-*`), ce qui est correct.
- Les CTA restent assez souples et ne semblent pas saturer la largeur d'écran.
- Les éléments de navigation et de contenu ne montrent pas d'overflow structurel majeur dans les composants inspectés.

### Points de vigilance

- Le rail de blog `featured` reste horizontal scrollable sur mobile. Cela n'est pas forcément une erreur, mais il peut rester légèrement encombrant sur les petits écrans ; c'est un cas à tester sur appareil réel.
- Le bouton WhatsApp fixe est bien protégé par `safe-area-inset-bottom`, mais reste un élément flottant qui peut recouvrir du contenu en bas de page selon la hauteur du viewport et la présence de CTA flottants.
- Les cartes peuvent rester un peu trop larges à certains breakpoints si la grille est très dense, mais rien de critique ne ressort du code.

## 6. Régressions éventuelles

Les régressions observées sont surtout de nature fonctionnelle et structurelle :

- `homeJobs` est encore demandé mais non utilisé dans `HomePage.tsx`. Cela introduit un faux chargement de données dont le résultat n'a pas d'impact visuel sur la page actuelle.
- Le design reste parfois trop standardisé, ce qui n'est pas une régression technique mais une régression visuelle de différenciation.
- Aucune suppression d'information majeure n'a été observée dans les sections clés.
- Aucun composant apparemment supprimé ou route cassée n'a été détecté dans les fichiers lus.

Le risque principal n'est donc pas de perte de contenu, mais d'inefficacité et de standardisation visuelle continue.

## 7. Score final

Score estimé : 67/100.

Le score a augmenté par rapport à l'audit précédent, surtout parce que les éléments les plus flagrants de placeholder ont été retirés. La home est plus sobre, la section services n'a plus de faux header vide, et le faux dashboard décoratif a presque disparu. Le site paraît maintenant plus professionnel et plus délibéré.

Le score reste limité par la persistance de motifs récurrents et de cartes standardisées, ainsi que par le code mort lié à `homeJobs`. La qualité visuelle globale est meilleure, mais elle reste encore de niveau "site de service premium standardisé" plutôt que "design vraiment original ou haut de gamme".

## 8. Priorités restantes

### P0

- Vérifier le `homeJobs` dans `HomePage.tsx` : il est semble-t-il inutile ou non rendu ; ce point doit être clarifié pour éviter un code mort et une mauvaise impression de données inexploitée.

### P1

- Confirmer le comportement réel du bouton WhatsApp fixe sur appareil mobile avec recouvrement potentiel.
- Tester le rail blog horizontal sur petits écrans afin de confirmer s'il reste lisible et non contraignant.

### P2

- Réduire la répétition de motifs visuels sur les pages publiques : moins de cartes identiques, moins de badges, moins d'icônes dans des pastilles, plus de variation de composition.

### P3

- Éviter les effets de "dashboard" léger dans les stats et les blocs de service qui renforcent encore l'impression de template.

## 9. Verdict

Le site est dans un état nettement meilleur qu'au précédent audit. Les problèmes les plus visibles ont été corrigés ou fortement atténués ; l'impression générale est plus professionnelle et plus lisible. La plupart des faux blocs et placeholders ont disparu.

En revanche, le projet n'est pas encore totalement clean visuellement. Le plus grave reste `homeJobs` non rendu malgré le chargement. Le second point est la persistance d'un design standardisé, qui donne encore un effet de template premium répété. Le responsive est globalement correct mais non totalement validé sur appareil réel pour les éléments flottants et le rail horizontal.

Conclusion objective : la correction est partiellement réussie, mais une nouvelle passe de design structurel reste recommandée pour atteindre un niveau réellement solide et cohérent.
