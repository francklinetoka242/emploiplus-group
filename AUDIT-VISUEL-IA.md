# Audit visuel IA — EmploiPlus Group

## 1. Résumé exécutif

Audit statique visuel et structurel du dépôt, couvrant les routes publiques, l’authentification, les parcours candidat, les offres, les services, les formulaires, les shells de navigation et les composants partagés. Le site ne ressemble pas à une sortie IA brute : il possède une marque identifiable, de vraies images métier, un parcours candidature riche et plusieurs états fonctionnels travaillés.

L’impression « générée par IA » vient surtout de l’accumulation : cartes blanches, bordures, ombres douces, grands rayons, badges, icônes Lucide, gradients et animations d’entrée réapparaissent sur de nombreuses pages. Le problème est donc systémique et répétitif, plus que lié à une couleur ou à un composant isolé.

**Constat global : aspect IA important mais récupérable.** Les pages publiques sont plus génériques que les flux métier candidat, qui sont plus spécifiques et plus professionnels.

## 2. Score global Aspect IA

**SCORE ASPECT IA : 69 / 100**

Calcul : 120 points obtenus sur 175 possibles, soit `(120 / 175) × 100 = 68,6`, arrondi à 69.

Interprétation : **aspect IA important** (61–80).

Principales causes : répétition du modèle « badge + titre + description + cards », utilisation fréquente de `rounded-2xl`/`rounded-3xl`, combinaison `border + shadow + radius`, CTA et badges très standardisés, animations d’apparition répétées.

Catégories contributrices :

```text
Cards / composants       ████████░░ 69%
Layouts répétitifs       ████████░░ 65%
Radius / formes          ████████░░ 72%
Ombres / bordures        ████████░░ 75%
CTA / interactions       ██████░░░░ 60%
```

## 3. Méthodologie

Inspection du code source et des routes dans `src/App.tsx`, des tokens dans `src/styles.css`, des shells `PublicLayout`, `CandidateLayout`, `Header`, `Footer`, ainsi que des pages Home, Services, Jobs, détail d’offre, authentification et dashboard candidat. Les observations s’appuient notamment sur `src/features/jobs/components/JobCard.tsx`, `src/components/ui`, `src/pages/public` et `src/pages/candidate`.

Le score mesure la ressemblance avec les patterns d’interfaces générées automatiquement, pas la qualité fonctionnelle ni l’origine réelle du site. L’audit responsive est déduit des breakpoints et variantes présentes dans le code ; il ne remplace pas une campagne de captures sur appareils réels.

## 4. Tableau des critères

| # | Critère | Score /5 | Constat | Niveau | Priorité |
|---:|---|---:|---|---|---|
| 1 | Répétition des layouts | 4 | Même recette de sections et cartes sur accueil, services, offres et dashboard. | Important | P1 |
| 2 | Symétrie excessive | 3 | Grilles équilibrées et blocs centrés, peu de tension visuelle. | Modéré | P3 |
| 3 | Grilles systématiques de 3 colonnes | 2 | Présentes dans stats/footer/admin, mais pas dominantes partout. | Faible | P4 |
| 4 | Manque d’asymétrie éditoriale | 4 | Peu de compositions libres ou de ruptures de rythme. | Important | P2 |
| 5 | Espacement vertical | 3 | Beaucoup de grands `gap`/`space-y`, avec parfois des zones peu denses. | Modéré | P3 |
| 6 | Largeur des conteneurs | 2 | `container-page` et `max-w-7xl` donnent une base cohérente. | Faible | P4 |
| 7 | Sections centrées | 3 | Nombreux titres, CTA et blocs d’introduction centrés. | Modéré | P3 |
| 8 | Badge + titre + description + cards | 5 | Motif très visible dans Home, Services, FAQ et dashboards. | Critique | P1 |
| 9 | Border-radius global | 4 | Le rayon de base de 0,75 rem est amplifié par les utilitaires. | Important | P2 |
| 10 | `rounded-xl/2xl/3xl` | 5 | `rounded-3xl`, `rounded-[28px]`, `rounded-[32px]` reviennent souvent. | Critique | P1 |
| 11 | Pills / `rounded-full` | 4 | Badges, filtres et CTA utilisent fréquemment la forme capsule. | Important | P2 |
| 12 | Cohérence des rayons | 3 | Cohérente mais trop uniforme entre page, carte et contrôle. | Modéré | P3 |
| 13 | Formes décoratives | 2 | Peu de blobs ; le carousel et les anneaux restent contenus. | Faible | P4 |
| 14 | Nombre de cards | 4 | Cards dominantes sur services, stats, offres, dashboard et admin. | Important | P1 |
| 15 | Cards imbriquées | 3 | Certaines surfaces de dashboard/sidebar combinent plusieurs niveaux. | Modéré | P2 |
| 16 | Cards là où un bloc suffirait | 4 | Plusieurs listes d’information sont artificiellement cardifiées. | Important | P2 |
| 17 | Icône + titre + texte | 5 | Structure répétée dans services, overview d’offre, FAQ et actions. | Critique | P1 |
| 18 | Uniformité des composants | 4 | Même vocabulaire visuel malgré des contextes RH différents. | Important | P2 |
| 19 | Badges décoratifs | 4 | Contract, match, tags et statuts s’empilent facilement dans JobCard. | Important | P2 |
| 20 | Quantité d’ombres | 3 | `shadow-soft`, `shadow-elev`, `shadow-brand` sont omniprésentes. | Modéré | P3 |
| 21 | Intensité des shadows | 3 | Diffusion douce et cohérente, mais peu de hiérarchie entre surfaces. | Modéré | P3 |
| 22 | Quantité de bordures | 4 | Bordures sur champs, cartes, séparateurs, filtres et footer. | Important | P2 |
| 23 | Border + shadow + radius | 5 | Combinaison récurrente, marqueur typique de template SaaS. | Critique | P1 |
| 24 | Nombre de couleurs principales | 2 | Bleu profond et or dominent ; les couleurs sémantiques restent lisibles. | Faible | P4 |
| 25 | Gradients | 3 | Utiles dans Hero et médias, mais parfois décoratifs. | Modéré | P3 |
| 26 | Gradient bleu/violet/rose | 1 | Le violet/rose IA est peu présent ; le bleu/or est plus propriétaire. | Faible | P4 |
| 27 | Pastels | 2 | Fonds clairs et transparences ponctuelles, sans pastel envahissant. | Faible | P4 |
| 28 | Cohérence avec la marque | 2 | Bleu `#00009e` et or `#e8a900` rendent EmploiPlus identifiable. | Faible | P4 |
| 29 | Glassmorphism | 2 | `backdrop-blur` limité au header et à quelques surfaces. | Faible | P4 |
| 30 | Blobs / halos / glow | 2 | Peu de formes abstraites ; les ombres de marque suffisent parfois. | Faible | P4 |
| 31 | Hiérarchie typographique | 2 | Bonne distinction des niveaux, sans confusion majeure. | Faible | P4 |
| 32 | Très grands titres | 3 | Hero en `text-4xl` à `text-6xl`, standard mais peu singulier. | Modéré | P3 |
| 33 | Répétition des titres centrés | 2 | Forte sur les introductions, moins dans les flux opérationnels. | Faible | P4 |
| 34 | Blocs de texte / interlignage | 2 | Largeurs et `leading-relaxed` généralement maîtrisés. | Faible | P4 |
| 35 | Boutons, animations, flottants, responsive, navigation/footer | 12/25 | CTA standardisés, animations répétées ; responsive candidat solide, public plus desktop-first. | Important | P2 |

## 5. Analyse des principales catégories

**Structure.** Les shells sont clairement séparés entre public, candidat et admin, mais les pages publiques partagent une grammaire très prévisible. Les services et la home alternent souvent introduction, grille de bénéfices, CTA et cartes.

**Formes.** Les rayons sont cohérents mais insuffisamment différenciés : une carte, une section majeure et un contrôle peuvent tous sembler appartenir au même niveau. C’est l’un des signaux les plus visibles d’un assemblage de design system.

**Cards.** `JobCard` est réellement réutilisée entre `JobsPage` et `CandidateDashboardPage`, ce qui est positif. En revanche, elle cumule société, titre, score, contrat, localisation, date, salaire, résumé, tags, candidature et partage : sa densité renforce l’effet composant générique exhaustif.

**Couleurs et effets.** La palette bleu profond/or est une vraie signature et évite le banal violet-blanc. Les effets restent modérés, mais leur répétition produit une sensation de finition automatique.

**Typographie.** Inter et Plus Jakarta Sans sont lisibles et cohérentes, mais très communes dans les interfaces SaaS récentes. La hiérarchie est meilleure dans les écrans métier que dans les pages marketing.

## 6. Analyse du Hero

Le Hero de `HomePage.tsx` est plus réussi que la moyenne : image réelle `hero-bg.jpg`, overlay pour la lisibilité, titre, sous-titre et deux CTA. L’animation `fadeUp`/`staggerContainer` apporte une entrée lisible.

Il reste proche d’une landing page SaaS générique : titre imposant centré à gauche, eyebrow en capsule, deux boutons colorés et forte hauteur. La grille réserve une colonne droite de 320 px mais la laisse vide et masquée, ce qui affaiblit la composition desktop. Aucun élément de preuve sociale, donnée métier ou scène humaine n’équilibre cette zone.

La version Eco Mode remplace les CTA par des blocs gris non interactifs : cohérente techniquement, mais pauvre visuellement. Le Hero est donc une bonne base de marque, pas encore une composition très reconnaissable sans logo.

## 7. Analyse des Cards

Types repérés : `JobCard`, cards de statistiques de la home, cartes de bénéfices des services, cartes d’actions/dashboard, cartes d’overview du détail d’offre, cartes de formulaires/auth, cartes de skeleton et surfaces admin.

Sont réellement nécessaires : JobCard, certains panneaux de formulaire, quelques blocs de dashboard et les cartes d’actions. Les statistiques, avantages et listes de liens pourraient souvent être traités comme des blocs éditoriaux ou des lignes structurées plutôt que comme des cartes autonomes.

Signaux les plus génériques : icône Lucide + titre + texte, icône dans pastille, fond `bg-card`, bordure, ombre et rayon élevé. Les cartes imbriquées du dashboard et de la sidebar ajoutent une hiérarchie artificielle. Les cartes de services en `rounded-3xl` et les stats avec `gradient-brand` sont particulièrement démonstratives.

## 8. Analyse des CTA

Les CTA utilisent surtout le bleu de marque ou l’or, avec texte clair, ombre et rayon élevé. La hiérarchie primaire/secondaire est compréhensible et adaptée à la conversion emploi/services. Les boutons de la home sont toutefois interchangeables avec ceux d’un SaaS : deux CTA proches, grande taille, couleur pleine et peu de contexte adjacent.

Les CTA de `Header`, `HomePage`, `ServicesPage`, `JobsPage` et `JobCard` répètent la même logique. Les filtres et actions de recherche mélangent boutons carrés arrondis et capsules, ce qui crée une famille moins nette. Les CTA de candidature sont fonctionnels et appropriés ; leur répétition est surtout un enjeu de sobriété, pas de fonctionnalité.

## 9. Analyse des animations

Présents : fade-in du Hero, `fadeUp`, `staggerContainer`, `slide-in-left/right/up`, délais successifs, hover lift/scale, carousel automatique des services, transitions du header et filtres.

Les animations servent utilement la lecture du Hero, du carousel et des transitions de navigation. En revanche, les délais répétés et les entrées par direction sur de nombreux blocs peuvent donner un vernis « premium généré » sans information supplémentaire. Le support `is-mobile-app` coupe correctement animations et transitions ; la réduction complète pour `prefers-reduced-motion` n’est pas démontrée pour toutes les animations Framer Motion.

## 10. Analyse responsive

**Desktop.** Conteneurs et grilles sont lisibles, mais la hauteur du Hero et certains grands espacements produisent du vide. Les pages services reposent fortement sur des compositions deux colonnes.

**Tablet.** Les passages `sm/md/lg` sont nombreux et les grilles se replient de façon raisonnable. Le risque principal est la compression des groupes de CTA et des cartes plutôt qu’un débordement manifeste.

**Mobile.** Le `CandidateLayout` est le plus abouti : drawer/sidebar, topbar et variantes dédiées. Les pages publiques empilent correctement les cartes et les formulaires, mais conservent parfois beaucoup de padding et des rayons très visibles. Les footers auth avec liens horizontaux et `whitespace-nowrap` sont à surveiller. Les listes d’offres restent utilisables grâce aux variantes `list`, filtres et actions compactes.

## 11. Les 10 problèmes prioritaires

1. **Recette visuelle répétée** — Home, Services, FAQ, dashboards — badge, titre, texte puis cards donne un template interchangeable. **P1.** Introduire plusieurs rythmes éditoriaux.
2. **Surutilisation des grands rayons** — `src/styles.css`, pages publiques, `JobCard` — la page, la carte et le contrôle ont presque la même douceur. **P1.** Réserver les grands rayons aux surfaces majeures.
3. **Combinaison border + shadow + radius** — JobCard, stats, auth, services — finition standard de générateur SaaS. **P1.** Choisir une seule séparation dominante par contexte.
4. **Densité de JobCard** — `src/features/jobs/components/JobCard.tsx` — badges, icônes, tags, actions et partage concurrencent le titre. **P1.** Clarifier le niveau primaire de l’offre.
5. **Pages services trop cardifiées** — `src/pages/public/ServicesPage.tsx` — les bénéfices en mini-cartes uniformes ressemblent à une grille de fonctionnalités. **P2.** Donner plus de place aux images et aux récits métier.
6. **Hero desktop déséquilibré** — `src/pages/public/HomePage.tsx` — colonne droite réservée mais vide, grand espace sans information. **P2.** Utiliser une preuve visuelle ou supprimer la colonne.
7. **Animations d’entrée systématiques** — Home, Services, composants globaux — slide/fade avec délais répétés. **P2.** Conserver les animations informatives et réduire les apparitions décoratives.
8. **Typographie très SaaS** — Inter + Plus Jakarta Sans — lisible mais facilement interchangeable. **P3.** Renforcer une voix éditoriale RH et la hiérarchie des textes.
9. **CTA trop homogènes** — Header, Home, Services, Jobs, JobCard — mêmes boutons colorés et arrondis dans des contextes différents. **P2.** Adapter densité, poids et forme au contexte.
10. **Responsive public moins distinctif** — pages Services/Jobs/Footer — empilement correct mais conservation d’un langage desktop très cardifié. **P2.** Repenser la priorité mobile plutôt que seulement replier les grilles.

## 12. Éléments à conserver

- Palette bleu profond/or et tokens centralisés, qui donnent une base réellement EmploiPlus.
- Image du Hero et images métier des services/blog : elles empêchent l’interface d’être purement abstraite.
- Séparation claire des shells public, candidat et admin.
- `JobCard` centralisée et ses variantes card/list, utiles au parcours emploi.
- Formulaire de candidature riche : documents, consentement, profil et états de feedback.
- Skeletons spécialisés, états d’erreur, labels et focus rings.
- Sidebar candidat responsive et mode mobile applicatif.
- Animations du Hero et carousel lorsque leur timing reste discret.
- Footer complet, multilingue et orienté contact.

## 13. Direction artistique recommandée

Viser une identité **RH/BPO humaine, structurée et éditoriale**, plutôt qu’un SaaS de productivité. Conserver le bleu/or, mais réduire les effets qui les rendent interchangeables.

- **Formes :** deux ou trois rayons clairement hiérarchisés ; moins de `rounded-3xl` et de pills.
- **Spacing :** réduire les grands vides décoratifs et réserver les respirations aux transitions de contenu.
- **Cards :** transformer les listes simples en lignes, panneaux plats ou séparateurs ; garder les cartes pour les objets réellement autonomes.
- **Couleurs :** conserver le bleu/or comme signature ; limiter les fonds translucides et couleurs sémantiques concurrentes.
- **Typographie :** renforcer les titres éditoriaux, les labels métier et la lisibilité des données plutôt que grossir les Hero.
- **Grilles :** alterner grilles, colonnes asymétriques, listes et sections pleine largeur.
- **CTA :** moins de CTA par section ; primaire net, secondaire discret, formes adaptées aux actions RH.
- **Images :** privilégier des scènes humaines, bureaux, candidats et équipes réelles dans les zones de preuve.
- **Animations :** conserver les transitions utiles, supprimer les cascades décoratives répétitives et couvrir la réduction de mouvement.
- **Navigation :** garder la structure actuelle, mais renforcer les repères de section et simplifier les groupes d’actions sur mobile.

## 14. Conclusion

EmploiPlus possède déjà les éléments nécessaires pour éviter une refonte complète : marque, médias, architecture de parcours et composants métier. L’aspect IA vient principalement d’une surutilisation uniforme des recettes modernes. Une réduction ciblée des cartes, des grands rayons, des bordures/ombres combinées et des animations répétitives devrait rendre l’ensemble plus corporate, humain et spécifique, sans sacrifier la lisibilité ni les fonctionnalités.
