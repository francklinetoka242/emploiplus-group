# Audit post-refonte — Professionnalisation et déstandardisation visuelle

## 1. Méthode

Audit statique de l'état actuel, comparé à `docs/audit-ai-visual-identity.md`. Aucun fichier de code n'a été modifié pour cet audit. Les conclusions responsive restent à confirmer par des captures desktop, tablette et mobile.

## 2. Comparaison avant / après

| Problème | Avant | Après | Appréciation | Reste-t-il un problème ? |
|---|---|---|---|---|
| Répétition des cartes | Très forte sur FAQ, Contact, Blog, Services et BPO. | FAQ, Contact, Blog régulier et BPO utilisent davantage de listes ou séparateurs. | Fortement amélioré | Oui sur Job detail, JobCard et certaines pages services. |
| `border + shadow + grand radius` | Motif dominant dans les pages marketing. | Retiré de plusieurs blocs éditoriaux ; panneaux d'action conservés. | Amélioré | Encore visible dans Home, formulaire Contact et composants partagés. |
| Icône + titre + texte | Répété dans les services, Contact et Job detail. | Icônes davantage inline dans Contact, Services et BPO. | Amélioré | Encore fréquent dans Job detail et services candidat. |
| Grilles régulières | Plusieurs grilles de cartes interchangeables. | Les grilles sont complétées par des séquences et blocs ouverts. | Amélioré | Home, Blog featured et About restent structurés par grilles. |
| Badges / pills | Labels introductifs et statuts nombreux. | Les badges fonctionnels restent ; certains labels décoratifs persistent. | Légèrement amélioré | Pills encore fréquentes dans Blog, Jobs et Job detail. |
| Heroes similaires | Badge + grand titre + texte + action souvent répétés. | Certaines pages ont des rythmes différents, mais les heroes n'ont pas tous été repris. | Légèrement amélioré | Contact et Services conservent une grammaire de landing page. |
| Ombres | `shadow-soft`, `shadow-sm` et lifts très fréquents. | Plusieurs lifts et ombres supprimés sur FAQ, Contact, Blog, BPO et détail. | Amélioré | Home, Header, JobCard et quelques services restent démonstratifs. |
| Glassmorphism / gradients | Gradients et blur utilisés comme profondeur générique. | Moins présents dans les blocs de contenu modifiés. | Légèrement amélioré | Contact, Home et certains heroes gardent des gradients décoratifs. |
| Hiérarchie typographique | De nombreux titres de section avaient une échelle de hero. | Les séparateurs et blocs ouverts laissent davantage porter la hiérarchie par le texte. | Amélioré | Les grands titres restent nombreux sur les pages marketing. |
| Rythme des sections | Succession prévisible de cartes. | Alternance plus nette entre panneau, liste, grille, image et formulaire. | Fortement amélioré | Home et Blog restent plus prévisibles que les pages refondues. |

## 3. Composition actuelle

La diversification est maintenant pertinente plutôt que purement décorative :

- **Contenu ouvert / séparation :** FAQ, coordonnées Contact, features Services et workflow BPO.
- **Panneau :** formulaire Contact, action de candidature et analyse IA du détail d'offre.
- **Carte :** offres, articles featured, équipe et contenus nécessitant une séparation nette.
- **Composition éditoriale :** liste régulière du Blog et FAQ.
- **Image + texte :** Services, About et plusieurs sections BPO.
- **Séquence :** Solutions Entreprises / BPO et features Services.
- **Grille :** statistiques, résultats Jobs, équipe et articles featured lorsque la comparaison est utile.
- **Données structurées :** JobCard, résumé d'offre, filtres et informations de contrat.

La refonte ne cherche pas à rendre chaque section différente. Les cartes restent associées aux contenus comparables et les panneaux aux actions ou informations importantes. C'est un usage plus professionnel du Design System.

## 4. Nouveaux problèmes éventuels

Aucune régression majeure de lisibilité n'est démontrée dans le code actuel. Quelques risques doivent toutefois être surveillés :

- FAQ et coordonnées Contact sont désormais plus plates ; une séparation trop légère pourrait réduire le regroupement sur de très larges écrans.
- Job detail mélange maintenant des blocs ouverts, des listes arrondies et des panneaux arrondis ; la hiérarchie est meilleure mais les rayons restent hétérogènes.
- Blog combine un rail featured et une grille/liste régulière ; le rail `overflow-x-auto` reste à tester au doigt sur mobile.
- Contact conserve un hero très travaillé et un formulaire en gradient, alors que les coordonnées sont sobres : contraste pertinent, mais direction à vérifier visuellement.
- Les styles ponctuels restent nombreux ; la diversification est propre visuellement, mais pas entièrement encapsulée en variantes partagées.

Aucun excès d'asymétrie, wrapper vide critique ou composition inutilisable n'est identifiable à la lecture seule.

## 5. Identité Emploiplus-Group

L'identité RH/BPO est conservée. Les pages présentent toujours recrutement, emploi, services aux entreprises, workflow opérationnel, offres, candidature et équipe humaine. Le bleu profond, l'accent doré, le logo, les photos et les typographies Inter / Plus Jakarta Sans restent cohérents.

La refonte ne transforme pas le site en portfolio, magazine ou startup SaaS. Elle le rapproche d'un site corporate RH structuré : les informations métier sont davantage portées par l'ordre, les séparateurs et les proportions, plutôt que par une succession de boîtes.

## 6. Pages principales

| Page | IA /10 | Pro /10 | Variété /10 | Cohérence /10 | Principal problème restant |
|---|---:|---:|---:|---:|---|
| Home | 5.8 | 7.2 | 7 | 7.5 | Statistiques, articles et CTA restent très composés. |
| Services | 5.5 | 7.2 | 7.2 | 7.2 | Hero/carousel et labels gardent un ton landing page. |
| Jobs | 5.5 | 7 | 6 | 7 | Filtres arrondis et densité de JobCard inchangés. |
| Job detail | 5.8 | 7.4 | 6.5 | 7 | Résidus de panneaux et listes arrondies imbriqués. |
| Blog | 6 | 7 | 6.8 | 7 | Rail featured, pills et images suivent encore des patterns éditoriaux SaaS. |
| About | 5.2 | 7.5 | 7 | 7.5 | Équipe et statistiques restent des surfaces familières. |
| Contact | 5.5 | 7.3 | 7.5 | 7.2 | Hero et formulaire conservent une forte esthétique de landing page. |
| FAQ | 5.2 | 7.2 | 7.5 | 7.2 | La liste pourrait manquer de repères sur écran très large. |
| Solutions Entreprises / BPO | 4.8 | 7.6 | 7.6 | 7.5 | Labels et CTA restent arrondis, mais le workflow est désormais lisible. |

Par rapport au premier audit, les baisses les plus nettes d'apparence IA concernent FAQ, Contact, Blog, Job detail et Solutions BPO. Jobs est pratiquement inchangé.

## 7. Contenu et fonctionnalités

Les modifications observées portent sur les classes de présentation, les surfaces, les séparateurs, les ombres et les hover states. Les textes, CTA, images, liens, formulaires et actions visibles sont conservés dans les fichiers inspectés.

Aucune route ou logique métier n'est modifiée par la refonte identifiée. Point indépendant toujours présent : `HomePage.tsx` charge `usePublishedJobOffers(2)` dans `homeJobs`, sans rendu JSX correspondant. L'intention reste non déterminable à partir du code et n'a pas été modifiée.

## 8. Design System

`Card`, `Button`, `Header`, `JobCard`, `SectionHeader` et `PageHeading` restent disponibles et cohérents. La refonte n'a pas détruit les abstractions communes ; elle contourne ponctuellement la carte lorsque le contenu est plus adapté à une liste ou une séparation.

Le compromis est acceptable, mais plusieurs chaînes Tailwind locales deviennent longues. À moyen terme, des variantes documentées de surface ouverte, panneau et liste seraient plus maintenables que l'accumulation de classes ponctuelles. Ce n'est pas une régression visuelle immédiate.

## 9. Responsive

Les grilles et empilements `sm`, `md` et `lg` restent présents. Les nouvelles listes et séparateurs sont naturellement plus robustes que des cartes fixes sur mobile. Aucun débordement évident n'apparaît dans les structures inspectées.

À tester sur appareil réel : rail Blog featured, filtre sticky et bouton WhatsApp de Jobs, longueurs des titres Job detail, CTA Contact et espacements verticaux des listes FAQ/BPO. Le code seul ne permet pas de certifier le confort tactile ni l'absence de recouvrement à toutes les largeurs.

## 10. Score global avant / après

| Critère | Avant | Après |
|---|---:|---:|
| Apparence générique / IA | 6.5/10 | 5.5/10 |
| Identité de marque | 6.5/10 | 7/10 |
| Maturité corporate | 6.5/10 | 7.2/10 |
| Hiérarchie visuelle | 6/10 | 7/10 |
| Variété des compositions | 5.5/10 | 7/10 |
| Qualité typographique | 7/10 | 7/10 |
| Cohérence Design System | 7.5/10 | 7.2/10 |
| Originalité | 5/10 | 6.2/10 |
| Crédibilité professionnelle | 7/10 | 7.5/10 |
| Qualité globale | 6.5/10 | 7.2/10 |

**Professionnalisme visuel actuel : 73/100**

**Ressemblance avec un site généré par IA : 55/100**

## 11. Verdict honnête

**Réponse : plutôt non.** Un designer professionnel ne conclurait probablement plus immédiatement à un site généré par IA en parcourant plusieurs pages : les listes, séparateurs, séquences BPO et compositions ouvertes montrent des choix adaptés aux contenus.

Il identifierait encore des traces de patterns SaaS dans Home, Jobs, Blog, Contact et les composants partagés. La refonte est donc une professionnalisation réelle, pas une disparition complète de la standardisation.

## 12. Ce qui reste à améliorer

1. **Impact très élevé —** Revoir le rythme Home dans `HomePage.tsx`, surtout statistiques, blog et CTA, sans réintroduire de cartes décoratives.
2. **Impact très élevé —** Donner à `JobCard` une hiérarchie plus éditoriale entre données essentielles, tags et actions.
3. **Impact élevé —** Harmoniser les surfaces restantes de `JobOfferDetailPage.tsx` et réduire les cartes imbriquées.
4. **Impact élevé —** Réduire le langage de landing page du hero de `ContactPage.tsx` par la typographie et l'espace plutôt que par des effets.
5. **Impact élevé —** Tester et affiner le rail mobile de `BlogPage.tsx`.
6. **Impact moyen —** Créer des variantes documentées de surface ouverte et de panneau autour de `Card`.
7. **Impact moyen —** Réserver les pills aux statuts et catégories dans Blog, Jobs et Job detail.
8. **Impact moyen —** Contrôler les niveaux de titres et la longueur des paragraphes sur les pages marketing.
9. **Impact faible —** Réduire les animations parallèles restantes sur les groupes statiques.
10. **Impact faible —** Vérifier les espacements et CTA sur appareil réel avant une nouvelle passe.

Conclusion : la refonte a atteint son objectif principal de manière crédible. Le site paraît plus corporate, éditorial et humain ; il reste une base SaaS visible, mais elle n'est plus la lecture dominante de l'expérience.
