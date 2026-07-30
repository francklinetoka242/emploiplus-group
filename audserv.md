# Audit page Services — EmploiPlus Group

Date: 2026-07-30
Auteur: Audit automatique (analyse repo)

---

**Résumé rapide**
- J'ai analysé le rendu de la section « Hub Candidat & Emploi » et les composants liés dans le code source. Plusieurs causes potentielles d'invisibilité ont été identifiées : animations Framer Motion (whileInView/initial state), classes CSS/Tailwind (background / z-index / couleur texte), overlays (FloatingBackground), et potentielles conditions de rendu/responsives. Le rapport suivant documente les fichiers concernés, les observations, diagnostics et recommandations sans modifier aucun fichier.

---

## 1. Informations générales de la page

Fichiers principaux et rôle
- `src/pages/public/ServicesPage.tsx` — point d'entrée de la page Services (composition des sections). (rôle : assembler `HeroServices`, `CandidateJourney`, `EnterpriseWorkflow`).
- `src/pages/public/services/HeroServices.tsx` — nouvelle implémentation de la section « Hub Candidat & Emploi » (rôle : header premium + grille 4 cartes + panneau illustratif). (voir approx. L1-L240)
- `src/pages/public/services/CandidateSection.tsx` — section candidate (dans l'état actuel du repo : existante mais retirée du rendu `ServicesPage`). Contient ancien UI détaillé et cartes (rôle : composants features et right-side panel). (voir approx. L1-L240)
- `src/pages/public/services/CandidateJourney.tsx` — section suivante sur la page (rôle : parcours candidat, animations et images).
- `src/components/FloatingBackground.tsx` — élément décoratif positionné en absolu et mis derrière le contenu (`-z-10`, role: background gradient blobs).
- `src/lib/animations/animations.ts` — variantes Framer Motion (`fadeUp`, `fadeLeft`, `fadeRight`, `staggerContainer`, `staggerItem`, ...)

Dépendances et librairies utilisées
- Framer Motion (`motion` in `HeroServices.tsx`) — animations d'entrée et hover
- Lucide React (`ListChecks`, `Sparkles`, `FileText`, `Clock`) — icônes
- Tailwind CSS classes (nombreuses utilitaires : `bg-card`, `text-foreground`, `shadow-soft`, `z-20`, etc.)
- React Router used elsewhere, React + TypeScript project

Fichiers CSS / Tailwind concernés
- Tailwind utility classes inlined in components (`bg-card`, `bg-background`, `text-foreground`, `border-border`, etc.).
- Potentiel fichier config Tailwind non modifié ici (`tailwind.config.js` or project config at root) — influence sur available utility classes.

---

## 2. Audit du rendu visuel actuel — section "Hub Candidat & Emploi"

Vérifications faites (lecture du code source) :
- `HeroServices.tsx` rend : badge, AnimatedHeading, paragraph, 4 `FeatureCard` composants, et un panneau illustratif SVG.
- `FeatureCard` était initialement construit avec `bg-white/95` (pouvant poser problème en thème sombre) et a été ajusté dans le repo pour `bg-card` et `z-20`.
- Animations Framer Motion : `motion.div` du container utilise `variants={staggerContainer}` et `whileInView="visible" initial="hidden" viewport={{ once:true }}`.

Questions-clés et observations
- Est-ce que les éléments existent réellement dans le DOM ?
  - Oui : le code montre que les éléments sont rendus par React (JSX présent). Ils devraient être dans le DOM si le composant est monté.
- Est-ce que les composants sont bien appelés ?
  - Oui : `HeroServices` est importé et rendu dans `ServicesPage.tsx`.
- Est-ce que les données sont bien transmises ?
  - Les `FeatureCard` utilisent children statiques (textes passés en dur) — pas de dépendance de données asynchrones.
- Est-ce que textes, icônes, illustrations sont présents ?
  - Oui dans le JSX. La présence réelle dans le rendu visuel dépend du CSS/animations/responsive.

Éléments visibles / invisibles / partiellement affichés (d'après le code et problèmes rapportés)
- Élément visible attendu : titre, badge, 4 cards, panneau illustratif.
- Rapport utilisateur : "les éléments que tu a ajouté sont invisible" — potentiellement les `FeatureCard` ou l'illustration.
- Élément partiellement affiché possible : cards présentes mais fond/texte masqués ou z-index inversé.

Pour chaque problème potentiel trouvé, cause probable (exemples) :
- `HeroServices.tsx` (approx L10-L60) : si `motion.div` whileInView ne s'active pas, toutes les cartes (children) restent en `opacity: 0` (variante `staggerItem.hidden`), rendant le bloc invisible.
- `FloatingBackground.tsx` (approx L1-L20) : s'il y a un overlay ou z-index mal positionné (par ex. negative z-index non supporté par certains stacking contexts), le background peut recouvrir le contenu (rare mais à vérifier).
- `FeatureCard` classes (approx L1-L40 dans `HeroServices.tsx`) : si classes `bg-card` rendent le fond identique au background (theme mismatch), le contraste peut être insuffisant.

---

## 3. Analyse des problèmes d'invisibilité — causes probables détaillées

A. CSS / Tailwind
- Classes `hidden` / `invisible` / `opacity-0` :
  - Dans le code, Framer Motion applique `opacity: 0` in the `staggerItem.hidden` variant; if whileInView never toggles to `visible`, elements remain with opacity 0. Search showed `staggerItem.hidden` is { opacity: 0, y: 12 }.
- `overflow-hidden` / clipping :
  - Parent containers (`section.relative.overflow-hidden`) may clip elements positioned outside the box. `HeroServices` root uses `overflow-hidden` — this is normal but can hide animated elements that translate outside the container.
- `z-index` and stacking contexts :
  - `FloatingBackground` uses `-z-10` and `HeroServices` uses `.container-page relative z-10`. Feature cards were changed to `z-20` — this should put them above background.
  - If container has a stacking context (e.g., transform, opacity, z-index), negative z-index children sometimes appear on top in certain browsers (rare), so check computed stacking contexts.
- Colors identical to background / theme mismatch :
  - If `bg-card` is close to page background, cards may blend in; text color `text-muted-foreground` may be too light depending on theme (dark mode/light mode). Verify color tokens.
- Display/size problems :
  - Zero height/width or `display:none` would hide content; not present in JSX.

B. Animations (Framer Motion)
- `whileInView` + `viewport={{ once: true }}` relies on IntersectionObserver. If the element's rootMargin or the container's CSS prevents intersection events, animation won't trigger. For example:
  - parent with `overflow: hidden` and children animated from outside may not intersect.
  - SSR/CSR mismatch: if the page is server rendered and motion props expect client-side observer, first paint may show opacity 0 until interaction.
- `initial: "hidden"` and `whileInView: "visible"` means default is hidden. If whileInView never fires, elements stay invisible.
- Delay / stagger: heavy staggering with many children may give long perceived delay; but not full invisibility.

C. Responsive classes
- Tailwind responsive classes (`md:grid-cols-2`, `sm:grid-cols-2`) might hide or rearrange content; if user is on narrow viewport the illustration may be above/below cards and user may not see it where expected.

D. Other runtime causes
- Build caching: dev server cache may not reflect changes; rebuilt site needed.
- Missing Tailwind utility classes: if PurgeCSS removed classes (e.g., dynamic class names not detected), background or text classes might be stripped in production build causing default styles.

Conclusion (causes likely):
1. Framer Motion `whileInView` not triggering (most likely if content present in DOM but invisible).  
2. CSS color/contrast / background blending causing elements to visually disappear (cards blend into background).  
3. z-index / stacking context issues (less likely after `z-20` added).  
4. Tailwind purge or missing utilities (possible in production builds).

---

## 4. Audit structure React / TypeScript

Observations:
- No compile-time TypeScript errors visible from file inspection; components are standard functional components.
- Imports appear correct: `AnimatedHeading` exists, `FloatingBackground` exists, `framer-motion` variants imported from `src/lib/animations/animations.ts`.
- Rendering conditions: `HeroServices` is always rendered in `ServicesPage` (no conditional rendering there). `CandidateSection` was removed from `ServicesPage` render to avoid duplication; ensure that is intentional.
- Hooks: `HeroServices` does not use hooks requiring async data — `FeatureCard` content is static; therefore no data fetch issue.

Potential runtime pitfalls:
- If `AnimatedHeading` internally uses a motion variant that conflicts (e.g., setting `opacity:0` and not animating), it could hide the heading — check component definition. (`src/components/AnimatedHeading.tsx` shows it uses `fadeUp` and should animate when in view.)
- Keys/Lists: grid uses static components — no `.map()` issues.

---

## 5. Audit des composants UI (table)

| Composant | Présent | Visible | Problème détecté | Correction recommandée |
|-----------|---------|---------|------------------|------------------------|
| `HeroServices` (`src/pages/public/services/HeroServices.tsx`) | Oui | Possiblement non visible pour l'utilisateur | Animations `initial`/`whileInView` peuvent conserver `opacity:0` si whileInView non déclenché; background/contrast possible | Vérifier via DevTools: computed opacity; tester en enlevant whileInView temporai rement; vérifier couleurs `bg-card`/`text-foreground` en runtime. |
| `FeatureCard` (sous-composant dans `HeroServices`) | Oui | Potentiellement invisible (fond/texte confondus) | initial `bg-card` might match background; previously `bg-white/95` might have been better for light theme | Inspecter `bg-card` value (tailwind tokens) et adapter; augmenter z-index si overlay; vérifier `text-muted-foreground` contrast. |
| `FloatingBackground` (`src/components/FloatingBackground.tsx`) | Oui | Visible mais arrière-plan | Uses `-z-10` which should place it behind content; check stacking context | Ensure parent stacking context allows negative z to be behind; avoid using negative z with transformed parents. |
| `AnimatedHeading` (`src/components/AnimatedHeading.tsx`) | Oui | Visible | Relie à Framer Motion `fadeUp` (should animate) | Confirm it triggers; if not, adjust viewport triggers. |
| SVG illustration (dans `HeroServices`) | Oui | Visible but stylized | Might blend in depending on gradient opacity | No action unless visual tweaks requested. |

---

## 6. Audit des animations et effets visuels

- Framer Motion variants are defined sensibly (`fadeUp`, `fadeLeft`, `fadeRight`, `staggerContainer` etc.).
- Risk: using `initial: hidden` + `whileInView: visible` for a top-of-page hero can be fine, but depends on IntersectionObserver. If the observer doesn't consider the element "in view" (due to layout or parent overflow/positioning), animations stay hidden.
- Performance: current animations are lightweight (opacity/translate) and should be performant. SVG background gradients are simple.
- Recommendation: keep animations, but provide fallback or ensure they trigger:
  - Option A (preferred): use `animate="visible"` on top-level after mount or on inView hook (so SSR mismatch less likely).
  - Option B: add `initial=false` then control visibility with class or JS.

Recommendation: Simplifier les animations pour le hero critical content et ajouter `prefers-reduced-motion` respect.

---

## 7. Audit accessibilité et lisibilité

- Contraste: utiliser `text-foreground` pour titres et `text-muted-foreground` pour descriptions; verify contrast ratio in both themes. If `bg-card` is dark and `text-muted-foreground` is low contrast, small text could be unreadable.
- Target sizes: icons and buttons appear to be > 44px interactive area; card text sizes 14–16px acceptable.
- Keyboard and focus: motion hover effects should also have focus styles; ensure keyboard navigation reveals same interactions.

Recommendations:
- Test with Lighthouse/axe for contrast.
- Provide visible focus states for interactive elements.

---

## 8. Audit console et erreurs potentielles

Observations from static code review (no runtime logs available here):
- No obvious import typos or missing identifiers in the modified files.
- Potential runtime warnings to check in browser console:
  - Framer Motion related warnings if IntersectionObserver unsupported in environment.
  - Tailwind purge warnings if dynamic class names used elsewhere.

Action to perform (manual):
- Run `npm run dev` and check browser console for errors (JS/React warnings, missing assets).
- Run `npm run build` to detect production purge issues.

---

## 9. Diagnostic final — pourquoi les nouveaux éléments sont invisibles ?

Synthèse (priorisée):

Critique (empêche totalement l'affichage) — Priorité haute
1. Framer Motion `initial: hidden` + `whileInView: visible` never triggers (IntersectionObserver condition failed) → cards remain with opacity: 0. (Cause la plus probable si le DOM contient les éléments mais l'utilisateur ne les voit pas.)

Important (dégrade fortement le rendu) — Priorité moyenne
2. Couleurs / contraste et thème mismatch (`bg-card` vs page background ; `text-muted-foreground` faible contraste) → éléments présents mais visuellement indistincts.
3. Tailwind purge / classes manquantes en production → propriétés attendues absentes (ex: `bg-card` non définie), entraînant rendu neutre.

Mineur (amélioration esthétique)
4. Overflow / clipping ou stacking context inhabituel (moins probable après `z-20`) ; possible si parent a transform/opacity créé stacking context.
5. Longue pause de stagger ou delays : perception d'invisibilité temporaire.

---

## 10. Plan de correction recommandé (étapes) — sans modifier le code ici

Etape 0 – Pré-requis diagnostics (exécution par développeur)
- Ouvrir la page dans un navigateur (dev server) et utiliser DevTools (Elements / Computed) pour les vérifications ci-dessous.

Étape 1 : Vérifier si les éléments sont dans le DOM
- Ouvrir `ServicesPage` dans le navigateur.
- Inspecter DOM pour `HeroServices` et les `.FeatureCard` (rechercher le texte "Matching intelligent").
- Si absents : le composant n'est pas rendu (vérifier imports et erreurs console).

Étape 2 : Vérifier l'opacité et l'état des animations (blocage critique)
- Dans DevTools > Elements, sélectionner une `FeatureCard` et vérifier computed style `opacity`.
  - Si `opacity: 0` et style provient d'un `framer-motion` inline style, alors `whileInView` n'a pas déclenché.
- Tester manuellement en forçant `opacity: 1` dans DevTools — si éléments apparaissent correctement, confirmer que le problème est lié aux animations.
- Vérifier IntersectionObserver events (Console): essayer `document.querySelector(...).getBoundingClientRect()` pour tester visibilité.

Étape 3 : Vérifier le stacking & overlay
- Vérifier `z-index` et stacking context pour `FloatingBackground` et `HeroServices` container.
  - `FloatingBackground` a `-z-10`. Assurez-vous que le parent n'impose pas un stacking context empêchant negative z-index derrière (ex: transform or z-index on ancestor).
- Si un overlay est au dessus, ajuster via CSS (élément au-dessus est souvent `position: relative` with z-index).

Étape 4 : Vérifier couleurs / contraste
- Vérifier computed background-color pour `.bg-card` et couleur texte `.text-foreground`/`.text-muted-foreground`.
- Si contraste insuffisant, utiliser `bg-white/95` ou augmenter `text-foreground` weight/opacity.

Étape 5 : Vérifier production Tailwind purge
- Si le problème n'apparaît qu'en build production, exécuter `npm run build` et inspecter la build output. Rechercher classes supprimées.

Étape 6 : Vérifier SSR / hydration issues
- Si page server-side rendered, `initial: hidden` may produce initial paint with hidden content; ensure that motion plays on mount. Consider changing to `animate` or using `useEffect` to trigger.

Étape 7 : Recommandations correctives non invasives (à appliquer par dev)
- Short-term fix (no design change): Temporarily remove `initial`/`whileInView` or change to `initial={{ opacity: 1 }}` to confirm visibility; or use `animate` instead of whileInView for hero.
- Verify and if needed change card background token to `bg-card`/`bg-white/95` depending on theme, increase `z-index`.
- Add CSS fallback for `prefers-reduced-motion` to avoid stuck animations.

Étape 8 : Test post-correction
- Validate in different viewport sizes and themes (light/dark).
- Run accessibility checks (axe/lighthouse) for contrast and keyboard navigation.

---

## Annexes — Commandes utiles pour le développeur
- Démarrer dev server:

```bash
npm run dev
# ou
npm run start
```

- Construire et vérifier production issues:

```bash
npm run build
# Inspect console output for missing classes or build-time warnings
```

- Vérifier DOM / styles (manuellement dans browser DevTools):
  - Inspect element, computed styles, check `opacity`, `display`, `visibility`, `z-index`.
  - Check console for JS warnings/errors.

---

### Conclusion
- Les éléments sont présents dans le code, la cause la plus probable d'invisibilité est la combinaison `initial: hidden` + `whileInView` (Framer Motion) qui n'est pas déclenchée dans l'environnement observé, ou un conflit de thème/contraste (les cards se fondent dans le background). Priorité : vérifier l'opacité et le déclenchement des animations dans DevTools.

Si vous voulez, j'exécute les commandes de build et je collecte la sortie console, puis je génère une liste de vérifications spécifiques (styles computed) à effectuer dans le navigateur — dites-moi si je peux lancer `npm run build` maintenant.