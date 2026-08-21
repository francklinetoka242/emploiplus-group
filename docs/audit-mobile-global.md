# Audit global mobile — EmploiPlus Group

## 1. Méthodologie
Audit statique du code TypeScript/TSX/CSS présent dans `src/`, sans modification fonctionnelle et sans test sur appareil réel. Les constats sont fondés sur les classes, dimensions, breakpoints, flux flex/grid, règles globales et éléments `fixed`/`sticky`. Les points non démontrables statiquement sont marqués **À TESTER**.

## 2. Périmètre
Pages publiques (Home, Services, Jobs, détail offre, Blog, About, Contact, FAQ, BPO/solutions), authentification, espace candidat (dashboard, profil, documents, candidatures, paramètres), administration, layouts, Header/Footer, JobCard, formulaires, overlays, tableaux, dark mode et contrôles partagés.

## 3. Résumé exécutif
La base est réellement responsive : les grandes grilles passent généralement en une colonne sous `md`/`lg`, les cartes utilisent `min-w-0`, `flex-wrap` et `line-clamp`, et le détail d’offre empile sa sidebar sous `lg`. Aucun overflow global certain n’a été prouvé pour les pages publiques principales.

Risques confirmés ou très probables : le footer légal de la connexion impose une ligne `whitespace-nowrap` qui dépasse à 320–390 px et est masquée par `overflow-hidden`; les onglets du profil candidat forment un rail horizontal nécessaire mais très dense; le Blog impose une carte de 360 px à partir de `sm`; les tableaux restent larges et scrollables. Les interactions entre Header/filtres sticky, cookie banner et widget WhatsApp restent à tester réellement.

## 4. Tableau des problèmes

| Priorité | Page/Composant | Largeur concernée | Problème | Impact | Correction recommandée |
|---|---|---:|---|---|---|
| ÉLEVÉ | `CandidateLoginPage` footer | 320–390 px | Cinq liens dans un flex `whitespace-nowrap`; `overflow-hidden` masque la suite. | Liens légaux/contact coupés ou inaccessibles. | Autoriser le retour à la ligne ou empiler les liens sur mobile. |
| MOYEN | `ProfileTabs` | 320–430 px | Six onglets `shrink-0 whitespace-nowrap` dans un rail horizontal. | Défilement nécessaire; libellés longs peu scannables. | Conserver un rail explicite mais vérifier affordance, focus et largeur des cibles. |
| MOYEN | Blog featured rail | 320–390 px | Carte `min-w-[min(360px,calc(100vw-2.5rem))]`, puis `sm:min-w-[360px]`. | Carte suivante hors écran; rail acceptable mais très large à 320–390. | Documenter le rail et tester le scroll/touch à chaque largeur. |
| MOYEN | Jobs sticky search/filter | 320–430 px | Barre `sticky z-40`; Header global `sticky z-50`; WhatsApp/fixed potentiellement superposé. | Risque de recouvrement et de perte de contenu en bas. | Tester les offsets, z-index et espace bas avec les éléments flottants. |
| MOYEN | Candidate applications / admin analytics | 320–820 px | Tableaux non transformés en cartes, contenus accessibles par `overflow-x-auto`. | Comparaison difficile et scroll horizontal répété. | Vérifier que le scroll est visible et volontaire; envisager une vue mobile synthétique. |
| FAIBLE | Cookie consent banner | 320–430 px | Banner `fixed bottom-0`; texte et trois actions augmentent fortement sa hauteur. | Masque temporairement le contenu inférieur. | Prévoir un espace bas ou vérifier le focus/positionnement sur petits écrans. |
| FAIBLE | Candidate dashboard completion | 320 px | Bloc de progression fixé à `w-[132px]` en mobile. | Espace très réduit pour le titre et la description. | Tester les titres longs et permettre la réduction/rupture du groupe. |
| FAIBLE | Dark mode classes light | Tous mobiles | Plusieurs composants déclarent `bg-white`, `bg-slate-*`, `text-slate-*`; overrides globaux dans `styles.css`. | Contraste et rendu dépendants de la cascade, surtout admin/profil. | Vérifier chaque surface importante en dark mode réel. |

## 5. Audit par zone

### Structure et breakpoints
- **320 px** : principal risque sur les textes longs, footer login, onglets profil et rail Blog; aucun `min-width` global manifeste trouvé.
- **360/375/390 px** : les mêmes rails restent utilisables mais consomment presque toute la largeur; les CTA des cartes passent en colonne/retour à la ligne.
- **430 px** : les champs et cartes ont une marge plus confortable; les actions restent à valider avec des libellés longs.
- **768/820 px** : les variantes `sm`/`md` commencent à afficher tableaux, deux colonnes et topbars; surveiller les transitions à 768 exact.
- **1024 px et desktop large** : les grilles `lg` et sidebars se déploient; les colonnes utilisent des tracks `minmax(0,...)` dans les zones principales.

### Navigation
- `SiteHeader` est sticky (`z-50`, hauteur 64 px), masque la navigation sous `lg` et affiche un menu vertical mobile. Le menu n’est pas `fixed`, donc pas d’overlay horizontal identifié.
- Le drawer candidat est `fixed`, `w-4/5`, `h-screen`, avec overlay `z-40` et panneau `z-50`; structure cohérente, mais fermeture, focus et scroll interne sont **À TESTER**.
- Le panneau admin mobile est `w-72` avec overlay sous le header; à 320 px il occupe 288 px, ce qui laisse une zone étroite mais ne dépasse pas le viewport.

### Formulaires
- Les champs de recherche Jobs sont `w-full`; les formulaires Contact, inscription et candidature utilisent majoritairement des grilles `grid-cols-1 md:grid-cols-2`.
- Le bouton de recherche Jobs est icon-only en `h-11 w-11`, dimension compatible avec le tactile; son voisinage avec le champ doit être testé à 320 px.
- Les liens du footer de connexion constituent le seul dépassement statique clairement identifié.
- Les erreurs, uploads, clavier virtuel et select longs sont **À TESTER** sur appareil.

### Jobs et Job detail
- `JobCard` protège correctement le contenu avec `min-w-0`, `truncate`, `line-clamp` et `flex-wrap`; aucun défaut structurel certain dans la carte partagée.
- Jobs combine recherche, filtres sticky (`top: 0` en contexte candidat/mobile app, sinon `64`) et `pb-32`; le recouvrement avec éléments fixed est **À TESTER**.
- Le détail d’offre passe de `lg:grid-cols-[1.3fr_0.7fr]` à une colonne; titre, métadonnées et exigences utilisent des limites de ligne, mais les titres très longs sont **À TESTER**.

### Pages publiques
- Home, About, Services, Contact, FAQ et BPO utilisent des grilles qui s’empilent sous `md`/`lg`; les grands paddings (`py-20`, `py-28`) peuvent allonger les pages mais ne prouvent pas un défaut.
- Contact utilise une grille `md:grid-cols-3 lg:grid-cols-5` et un formulaire à `p-8` mobile; empilement et hauteur du formulaire sont **À TESTER**.
- Blog : le rail featured est un scroll horizontal contenu (`overflow-x-auto`), donc ce n’est pas un overflow global certain.
- Images principales utilisent `object-cover` et des ratios/hauteurs définis; crop et contexte visuel doivent être vérifiés visuellement.

### Dark mode mobile
- Les tokens `background`, `card`, `foreground`, `border` sont utilisés par les composants modernes.
- `styles.css` remplace globalement les classes `bg-white`, `bg-slate-*`, `text-slate-*` et bordures dans `.dark`, ce qui réduit le risque de surface blanche forcée.
- La cascade est large et peut modifier des couleurs prévues pour des badges ou images; contraste, dropdowns, sticky Jobs, drawer candidat et tableaux admin sont **À TESTER**.

### Accessibilité mobile et animations
- Les boutons menu et recherche ont des `aria-label`; les onglets et contrôles de complétude exposent leur état.
- Les boutons standards ont une hauteur minimale proche de 36 px, tandis que le menu mobile et les champs auth utilisent 48 px; les boutons secondaires et icon-only restants sont **À TESTER**.
- Framer Motion anime principalement l’opacité/translation/scale à l’entrée; aucun déplacement horizontal permanent n’est certain. Vérifier `prefers-reduced-motion` et les transforms aux bords.

## 6. Problèmes à tester sur appareil
1. Viewports 320, 360, 375, 390 et 430 : footer login, onglets profil, Blog rail, menus et textes longs.
2. Jobs : Header sticky + filtre sticky + widget WhatsApp + cookie banner, notamment en bas de page.
3. Clavier mobile : Contact, login, signup, candidature, recherche et textarea; vérifier que le champ actif reste visible.
4. Dark mode : drawer candidat, admin, dropdowns, inputs, tableaux et surfaces `bg-white`.
5. Touch/focus : défilement des rails, fermeture des overlays, pagination et cibles rapprochées.

## 7. Score global
| Critère | Score |
|---|---:|
| Responsive structurel | 84/100 |
| Lisibilité | 80/100 |
| Navigation mobile | 82/100 |
| Formulaires | 83/100 |
| Jobs / Job detail | 80/100 |
| Espacement | 78/100 |
| Typographie | 82/100 |
| Images | 82/100 |
| Dark mode mobile | 74/100 |
| Ergonomie tactile | 78/100 |

**Score mobile global : 80/100**

## 8. Priorités de correction
1. Corriger le footer légal de `CandidateLoginPage` pour supprimer la coupure à 320–390 px.
2. Tester et régler l’empilement Header/filtres sticky/WhatsApp/cookie banner sur Jobs.
3. Valider le rail Blog et les onglets Profil sur les cinq petites largeurs.
4. Vérifier les tableaux candidat/admin et leur lisibilité tactile.
5. Faire une passe dark mode mobile sur surfaces, inputs, dropdowns et overlays.

## 9. Verdict final
1. **Le site est-il responsive ?** Oui dans sa structure générale, avec quelques flux horizontaux intentionnels et un footer login défaillant.
2. **Risques d’overflow horizontal ?** Oui, surtout la coupure du footer login; rails Blog/profil et tableaux sont contenus mais exigent un scroll.
3. **Pages les moins adaptées ?** Login candidat, profil candidat, Blog à la une et Jobs avec éléments sticky.
4. **Composants partagés problématiques ?** `ProfileTabs`, `CookieConsentBanner`, système de tables et coordination des sticky/fixed.
5. **Éléments trop grands/petits ?** Rail featured et drawer admin sont larges; footer login et onglets deviennent trop serrés; dimensions exactes à confirmer visuellement.
6. **Chevauchements possibles ?** Filtres Jobs, Header, WhatsApp et cookie banner; non confirmé sans exécution mobile.
7. **Sticky/fixed correctement gérés ?** Structure cohérente, coordination réelle **À TESTER**.
8. **Dark mode cohérent ?** Partiellement garanti par overrides globaux; validation écran par écran nécessaire.
9. **Boutons/tactile utilisables ?** Majoritairement oui; footer, rails et actions groupées restent à valider.
10. **Cinq corrections prioritaires ?** Footer login, coordination Jobs sticky/fixed, rail Blog, onglets profil, validation dark mode/tableaux.
