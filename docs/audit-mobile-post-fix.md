# Audit mobile post-fix — EmploiPlus Group

## 1. Fichiers modifiés
- `src/pages/candidate/CandidateLoginPage.tsx`
- `src/features/profile/components/ProfileTabs.tsx`
- `src/pages/public/BlogPage.tsx`
- `src/pages/public/BlogPostDetailPage.tsx`
- `src/pages/public/JobsPage.tsx`
- `src/pages/public/JobOfferDetailPage.tsx`
- `src/components/candidate/NotificationsDropdown.tsx`

Aucune route, API, requête, donnée ou logique métier n’a été modifiée.

## 2. Problèmes corrigés
- Footer login candidat : suppression de `overflow-hidden` et de `whitespace-nowrap`; liens et copyright passent en wrap mobile, avec espacement et centrage adaptés sous `sm`. Le mode desktop conserve une ligne sans wrap à partir de `sm`.
- Onglets profil : rail horizontal conservé; ajout de `touch-pan-x`, `overscroll-x-contain`, `max-w-full`, marge de défilement et hauteur tactile minimale. Les couleurs utilisent désormais `border-border`, `bg-card`, `text-muted-foreground`, `bg-secondary/15` et `text-secondary`.
- Blog featured : rail horizontal conservé; scroll tactile contenu avec `max-w-full`, `overscroll-x-contain` et cartes explicitement non compressibles (`shrink-0`).
- Blog détail : colonnes, articles et sidebar rendus réductibles avec `min-w-0`; titre, extrait, contenu éditorial, métadonnées et liens longs acceptent la rupture sans élargir la page.
- Jobs : champ de recherche passé de `bg-white` à `bg-background` pour suivre le dark mode sans changer la logique ou la structure.
- Job detail : colonnes et enfants rendus `min-w-0`; grille large passée à des tracks `minmax(0,...)`; titre, entreprise et exigences acceptent les contenus longs sans débordement forcé.
- Notifications candidat : popup limité à `calc(100vw - 2rem)` sur mobile avec `max-w-96` desktop; en-tête repliable, lignes et badges réductibles, état non lu compatible avec le thème et label accessible sur l’icône.

## 3. Problèmes volontairement laissés inchangés
- Le rail featured Blog n’a pas été transformé en grille.
- Les tableaux candidat/admin restent scrollables horizontalement dans leur conteneur.
- Le sticky Jobs, le widget WhatsApp et le cookie banner fixed n’ont pas été supprimés ni déplacés sans preuve statique d’un recouvrement effectif.
- Le bloc de complétude candidat conserve `w-[132px]`; le code ne démontre pas à lui seul une coupure certaine.
- Le design system, la palette, les tailles typographiques globales et le desktop restent inchangés.

## 4. Vérification par largeur
| Largeur | Vérification statique |
|---:|---|
| 320 px | Footer wrap; rail profil/Blog contenu; Job detail avec `min-w-0` et `break-words`. |
| 360 px | Même protection; carte Blog reste lisible et scrollable localement. |
| 375 px | Même protection; aucune nouvelle largeur fixe ajoutée. |
| 390 px | Même protection; actions et titres gardent leur flux naturel. |
| 430 px | Rails et cartes restent limités au conteneur. |
| 768 px | Breakpoint `sm` : footer revient en ligne et onglets peuvent se replier selon le composant Tabs. |
| 820 px | Layout candidat/public reste dans les variantes existantes. |
| 1024 px | Grilles desktop Job detail avec `minmax`; aucune logique de route changée. |
| 1280/1440/1920 px | Pas de règle desktop supprimée; largeur et espacement existants conservés. |

Mesure navigateur sur `/blog` et `/blog/G-DYM` : à 320, 360, 375, 390 et 430 px, la largeur scrollable du `body` est restée égale à la largeur viewport. Sur `/blog`, le seul scroll détecté est le rail featured local, volontairement plus large que son conteneur.

## 5. Dark mode
- Les onglets profil n’imposent plus `bg-white`, `text-slate-600` ou `border-slate-200`; ils utilisent les tokens de thème.
- Le champ de recherche Jobs utilise `bg-background`.
- Le détail Blog n’impose plus de surface ou largeur intrinsèque susceptible de pousser le contenu en dark mode.
- Blog, Job detail, cookie, dropdowns, drawer et tableaux conservent les tokens existants; leurs interactions visuelles complètes restent à confirmer sur écran réel.
- Le popup notifications n’impose plus `w-96` sur mobile; sa largeur suit le viewport et son état non lu utilise `bg-primary/5`.

## 6. Overflow horizontal
- Le footer login ne masque plus le contenu avec `overflow-hidden` et peut se replier.
- Les rails Blog et Profil restent intentionnels et leur scroll est contenu au composant avec `max-w-full`/`overscroll-x-contain`.
- Le détail Blog accepte les URLs et mots longs via `break-words` et `[overflow-wrap:anywhere]` dans la zone éditoriale.
- Les tableaux restent dans leurs wrappers `overflow-x-auto`.
- Aucun `overflow-x-hidden` n’a été ajouté comme correctif.

## 7. Sticky/fixed
- Le Header reste `sticky z-50`.
- Les filtres Jobs restent sticky avec leurs offsets existants.
- WhatsApp reste fixed `z-40`; le cookie banner reste fixed `z-[60]`.
- La coordination exacte avec le contenu, la pagination et le safe area est **À TESTER** sur 320–430 px.

## 8. Validation technique
- `npm run build:vite` : succès.
- ESLint ciblé : bloqué par 1 977 erreurs Prettier de fins de ligne/formatage déjà présentes dans les fichiers, sans warning.
- `npx tsc --noEmit` : erreurs de typage préexistantes, notamment le type `JobOffer` incomplet dans `JobOfferDetailPage`; le build Vite passe.
- Aucun test Playwright/appareil réel n’a été exécuté dans cette passe.
- Vérification Playwright locale effectuée sur `/blog` et `/blog/G-DYM` aux largeurs 320/360/375/390/430; captures mobiles contrôlées.

## 9. À TESTER sur appareil réel
- Scroll tactile et perception du rail Blog à 320, 360, 375, 390 et 430 px.
- Premier/dernier onglet Profil, focus clavier et état actif en clair/dark.
- Header + filtres sticky + WhatsApp + cookie banner sur Jobs, notamment la pagination.
- Clavier virtuel sur login, recherche, candidature et formulaires.
- Tables candidat/admin, dropdowns, drawer candidat et contrastes dark mode.
- Popup notifications candidat ouvert depuis la navbar mobile, avec session candidate réelle et notifications longues/non lues.
- Vérification sur appareil physique et avec clavier virtuel, non couverte par la mesure navigateur locale.

## 10. Verdict final
La passe corrige les défauts mobiles démontrables sans refonte : le footer login ne force plus une ligne coupée, les rails restent intentionnels mais mieux contenus, les contenus longs des détails Blog et offre peuvent se réduire, et le popup notifications ne dépasse plus la largeur mobile par construction. Les deux routes Blog vérifiées ne présentent plus d’overflow horizontal global aux largeurs mobiles ciblées. Le build frontend est valide. L’ouverture du popup avec un compte candidat réel et des données de notification reste à valider sur appareil ou session authentifiée.
