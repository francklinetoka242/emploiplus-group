# Audit visuel post-refonte

## 1. Résumé exécutif

Le résultat est partiellement amélioré : les offres et les blocs fonctionnels sont plus plats et plus lisibles, mais la refonte reste hétérogène et conserve une forte signature de template. Deux défauts certains dominent l’audit : des blocs décoratifs statiques sans contenu dans l’accueil et un header vide dans Services. La hiérarchie est affaiblie par l’usage simultané de cartes, gradients, bordures, ombres, pills et animations sur de nombreuses pages.

L’analyse est basée sur le code courant. Le diff Git n’a pas pu être vérifié car `git` n’est pas disponible dans l’environnement terminal. Les modifications dites « récentes » sont donc identifiées par les motifs visuels présents, pas par une chronologie Git.

## 2. État général

- **Qualité visuelle globale :** correcte mais inégale. Les composants ont du contenu réel, toutefois plusieurs pages semblent appartenir à des versions différentes du design system.
- **Répétition :** importante : mêmes cartes bordées, mêmes hover lifts, mêmes badges et mêmes animations d’entrée.
- **Cards :** majoritairement justifiées et alimentées par des données ; quelques blocs statiques sont artificiels ou vides.
- **Spacing :** globalement généreux ; un espace sans justification est certain dans Services, et certains wrappers d’accueil sont très aérés.
- **Radius :** hiérarchie insuffisante : `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `[28px]` et `[32px]` coexistent fréquemment.
- **Borders/shadows :** acceptables sur les contenus principaux, mais la combinaison border + shadow + grand radius revient trop souvent.
- **Animations :** nombreuses et redondantes ; `prefers-reduced-motion` ne couvre pas l’ensemble des animations de pages.
- **Responsive :** plusieurs risques logiques ; le rail Blog impose `min-w-[360px]` et le contrôle WhatsApp est fixe sur mobile. Validation visuelle réelle encore nécessaire.

## 3. Modifications détectées

- Accueil : hero sombre avec panneau dashboard décoratif, bloc de statistiques dans un grand container arrondi, cartes Blog et cartes Services avec élévation au hover (`HomePage.tsx`, autour des lignes 118, 249, 349 et 433).
- Accueil : mode éco utilisant deux rectangles sans libellé ni action à la place des CTA (`HomePage.tsx`, autour des lignes 35-38).
- Accueil : chargement de `homeJobs` et `jobsLoading`, mais aucune restitution visible des offres dans le JSX courant (`HomePage.tsx`, autour des lignes 176-177 et fin de page). Régression visuelle/contenu à confirmer selon l’intention de la section.
- Services : grille de quatre bénéfices par parcours, carousel d’illustrations candidat et image entreprise (`ServicesPage.tsx`, autour des lignes 110-232).
- Services : `<header className="space-y-6 text-center">` vide, conservant une structure et un espace sans contenu (`ServicesPage.tsx`, autour des lignes 109-111).
- Blog : rail horizontal de contenus « à la une », grille d’articles, placeholders de chargement et variantes de rendu proches (`BlogPage.tsx`, autour des lignes 136-350).
- Offres : filtre sticky volontairement plat, puis `JobCard` en liste sans ombre ; cette rupture est fonctionnelle mais visuellement marquée (`JobsPage.tsx`, autour des lignes 147-256 et `JobCard.tsx`, autour des lignes 76-88).
- Design partagé : `Card` impose par défaut `rounded-lg + border + bg + shadow-sm` (`src/components/ui/card.tsx`, autour des lignes 5-12), tandis que les pages ajoutent souvent leurs propres traitements.
- Animations : variantes Framer Motion centralisées et classes CSS `fadeIn/slideIn` présentes en parallèle (`src/lib/animations/animations.ts`, lignes 1-43 ; `src/styles.css`, autour des lignes 399-549).
- Nouveaux composants ou fichiers réellement récents : non vérifiables sans Git ; aucun nouveau composant ne peut être attribué factuellement à la dernière modification.

## 4. Cards à vérifier

### VIDE

- **Accueil / HeroSection**, `HomePage.tsx` autour des lignes 35-38 — deux rectangles `h-12 w-36` en mode éco. **CRITIQUE.** Ils ne contiennent ni texte, ni action, ni donnée ; ils ressemblent à des placeholders persistants.
- **Accueil / panneau dashboard du hero**, `HomePage.tsx` autour des lignes 118-135 — blocs, barres et mini-cellules sans contenu sémantique, masqués sous `lg`. **IMPORTANT.** C’est une décoration, pas une carte métier ; son caractère vide est intentionnel mais visuellement artificiel.
- **Services / header**, `ServicesPage.tsx` autour des lignes 109-111 — structure vide avec spacing. **IMPORTANT.** Ce n’est pas une card mais produit un espace sans fonction.

### ARTIFICIELLE

- **Accueil / panneau statistiques**, `HomePage.tsx` autour des lignes 249-284 — colonne gauche faite de barres et d’un carré vide à côté de trois statistiques réelles. **IMPORTANT.** La grille est justifiée par les statistiques, mais la cellule gauche est uniquement décorative et déséquilibre la composition.
- **Accueil / skeletons**, `HomePage.tsx` autour des lignes 334-337 et Blog autour de 136-146 — cartes vides avec `animate-pulse`. **FAIBLE.** Acceptables pendant le chargement ; ne pas considérer comme cartes vides à l’exécution normale.

### REDONDANTE

- **Blog / cartes featured et régulières**, `BlogPage.tsx` autour des lignes 170-237 et 269-350 — structure titre, catégorie/date, extrait, lien et partage répétée dans plusieurs renderers. **MODÉRÉ.** Le contenu diffère, mais l’implémentation et le poids visuel sont presque identiques.
- **Accueil / cartes Blog et Blog page**, `HomePage.tsx` autour des lignes 349-410 et `BlogPage.tsx` autour des lignes 170-350 — même contenu éditorial représenté par deux styles proches mais pas alignés (`rounded-3xl` contre `rounded-xl`). **MODÉRÉ.** Risque de duplication visuelle et de drift.

### POTENTIELLEMENT INUTILE

- **Contact / téléphone, email, localisation**, `ContactPage.tsx` autour des lignes 98-176 — trois cartes de même structure, gradient, border, radius et hover. **MODÉRÉ.** Le contenu est réel et la séparation peut aider au scan, mais trois cartes élevées répétitives donnent un effet formulaire-template.
- **About / valeurs et équipe**, `AboutPage.tsx` autour des lignes 104-166 — deux séries de cartes avec le même border/radius/hover lift. **FAIBLE.** Les contenus sont distincts ; la réserve porte sur la répétition de traitement.
- **Solutions Entreprises / cinq articles**, `SolutionsEntreprisePage.tsx` autour des lignes 42-106 — contenu réel, mais présentation en pile de cartes très uniforme. **FAIBLE.** Une liste structurée pourrait être plus sobre, sans que la card soit une erreur.

### CORRECTE

- **JobCard**, `src/features/jobs/components/JobCard.tsx` autour des lignes 76-176 — titre, entreprise, localisation, contrat, dates, salaire, extrait et actions conditionnelles. **Correcte.** Le contenu est dynamique ; ne pas la qualifier de vide lorsque certains champs optionnels manquent.
- **Blog articles**, `BlogPage.tsx` autour des lignes 170-350 — contenu dynamique réel ; l’image de fallback et l’extrait de remplacement sont conditionnels. **Correcte sous réserve d’exécution.**
- **About valeurs/équipe**, `AboutPage.tsx` autour des lignes 104-166 — titres, descriptions et images membres. **Correcte.**

## 5. Répétitions restantes

- Répétition du triptyque `border + bg-card/white + shadow + grand radius` sur Blog, About, Contact, Job detail, FAQ et les hubs Services.
- Répétition de `hover:-translate-y-*` et `hover:shadow-*` sur les cartes de contenu, parfois doublée par `whileHover` Framer Motion.
- Badges/pills fréquents avant les titres, notamment Blog, Services et offres ; ils peuvent concurrencer le titre quand plusieurs sont présents.
- Icône dans un carré/cercle puis titre puis texte : motif répété dans Contact, About, Services et Job detail.
- CTA répété sous forme de bouton plein arrondi, parfois dans la carte puis à nouveau en bas de page, notamment Solutions Entreprises.
- Animations `fadeUp`, `slide-in-*`, stagger et hover scale utilisées sur presque toutes les pages publiques ; l’effet de système généré reste perceptible.
- Rayon incohérent : `rounded-xl` pour JobCard/Blog, `rounded-2xl` pour Contact/About, `rounded-3xl` et `[28px]/[32px]` pour les surfaces importantes. Les boutons utilisent souvent `rounded-full` ou `rounded-xl` sans distinction stable.

## 6. Régressions détectées

- **CRITIQUE :** mode éco : les deux CTA sont devenus des blocs gris sans contenu ou action (`HomePage.tsx`, autour des lignes 35-38).
- **IMPORTANT :** l’accueil récupère des offres mais ne rend pas `homeJobs` ; une section attendue peut donc manquer visuellement (`HomePage.tsx`, autour des lignes 176-177).
- **IMPORTANT :** le header vide de Services introduit un espace vertical artificiel (`ServicesPage.tsx`, autour des lignes 109-111).
- **IMPORTANT :** `min-w-[360px]` sur les cartes featured du rail Blog peut rendre l’aperçu trop large sur les petits mobiles (`BlogPage.tsx`, autour de la ligne 170). À vérifier à l’exécution.
- **MODÉRÉ :** le bouton WhatsApp fixe et son panneau peuvent recouvrir le bas d’une liste ou d’un CTA sur mobile (`JobsPage.tsx`, autour des lignes 332-380). À vérifier à l’exécution.
- **MODÉRÉ :** la page Solutions Entreprises retire le radius des cinq articles mais conserve shadow, hover lift et border ; la rupture peut sembler accidentelle plutôt que hiérarchique (`SolutionsEntreprisePage.tsx`, autour des lignes 42-106).
- **FAIBLE :** `prefers-reduced-motion` désactive surtout le ring de bienvenue ; les classes CSS `slide-in-*`, Framer Motion et les transitions de hover restent actives (`styles.css`, autour des lignes 532-549). À vérifier selon le contexte d’utilisation.

## 7. Priorités de correction

### P0 — Critique

- Remplacer les deux blocs gris statiques du mode éco par les contrôles déjà prévus, ou retirer l’espace s’ils ne doivent pas apparaître.

### P1 — Important

- Supprimer ou transformer le panneau décoratif vide du hero et la cellule décorative vide des statistiques.
- Vérifier pourquoi `homeJobs` est chargé sans rendu et confirmer si l’absence de section d’offres est intentionnelle.
- Supprimer le header vide de Services et contrôler l’espace produit.
- Tester Blog et Jobs aux largeurs mobiles réelles, notamment le rail `min-w-[360px]` et le widget WhatsApp fixe.

### P2 — Modéré

- Réduire le nombre de traitements simultanés border/shadow/radius/gradient et aligner les variantes de cartes entre Accueil, Blog, Contact et les hubs.
- Factoriser les renderers Blog proches pour éviter les dérives visuelles.
- Distinguer davantage les CTA principaux, secondaires et liens de lecture.

### P3 — Faible

- Harmoniser progressivement les rayons des grandes surfaces, cards et boutons.
- Prévoir une stratégie `prefers-reduced-motion` couvrant aussi les animations de page et les hover lifts.

## 8. Verdict final

- **Score estimé d’aspect IA actuel : 58/100** (100 = aspect le plus généré/template). La répétition des cartes, pills et animations reste forte ; les blocs vides aggravent nettement le score.
- **Score précédent connu : 69/100.**
- **Amélioration estimée :** environ 11 points, principalement grâce aux JobCards plus plates et à certains layouts fonctionnels moins ombrés. L’amélioration n’est pas homogène sur les pages publiques.
- **Principaux problèmes restants :** décorations vides de l’accueil, header vide, absence potentielle du rendu des offres, rayons non hiérarchisés, répétition border/shadow/hover et animations omniprésentes.
- **Conclusion générale :** le site est plus professionnel sur les flux d’offres, mais pas encore globalement sobre ni cohérent. La refonte a amélioré certains composants isolés sans unifier suffisamment la composition d’ensemble. Les points responsive et les états conditionnels doivent encore être confirmés par une exécution aux formats desktop, tablette et mobile.
