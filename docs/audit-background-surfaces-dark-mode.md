# AUDIT GLOBAL — COULEURS D'ARRIÈRE-PLAN, SURFACES ET DARK MODE

## Objectif

Audit uniquement visuel et systématique du site EmploiPlus Group. Aucun fichier de code n'a été modifié. Document créé dans docs/audit-background-surfaces-dark-mode.md.

## 1. INVENTAIRE DES COULEURS

Principaux tokens observés dans src/styles.css :

- Light background : oklch(0.99 0.005 250)
- Foreground : oklch(0.18 0.04 255)
- Card : oklch(1 0 0)
- Muted : oklch(0.96 0.012 250)
- Border : oklch(0.92 0.012 250)
- Primary / brand : #00009e
- Brand deep : #000079
- Secondary / accent : #e8a900
- Dark background : oklch(0.18 0.03 264)
- Dark card : oklch(0.26 0.04 264)
- Dark muted : oklch(0.35 0.03 264)
- Dark border : oklch(0.68 0.03 264 / 22%)

Classes et usages répétés :

- bg-background, bg-slate-50, bg-slate-100, bg-white, bg-card, bg-card/80
- bg-primary, bg-secondary, bg-accent
- bg-black/50, bg-black/60, bg-black/80
- dark:bg-* via .dark + variables CSS
- gradients : from-secondary/8 via-card to-card, bg-gradient-to-br from-slate-950 ...

### Résumé système

| Token / rôle | Light | Dark | Usage |
|---|---|---|---|
| Background principal | oklch(0.99 0.005 250) | oklch(0.18 0.03 264) | page |
| Surface primaire | white / card | oklch(0.26 0.04 264) | cards |
| Surface secondaire | muted / slate-50 | oklch(0.35 0.03 264) | sections |
| Texte principal | oklch(0.18 0.04 255) | oklch(0.95 0.03 250) | titres |
| Texte secondaire | oklch(0.5 0.03 255) | oklch(0.84 0.02 264) | body |
| Bordure | oklch(0.92 0.012 250) | oklch(0.68 0.03 264 / 22%) | séparation |
| Accent | #00009e / #e8a900 | #00009e / #e8a900 | marque |

## 2. AUDIT DU FOND CLAIR

Le fond clair n'est pas un blanc pur agressif. Il est légèrement bleuâtre, donc correct et plutôt professionnel.

Le vrai problème n'est pas “blanc vs non blanc”, mais l'uniformité des surfaces :

- page = bg-background presque blanc ;
- sections = souvent bg-slate-50 ou bg-white ;
- cards = white ou card sur fond presque identique ;
- bordures et ombres parfois trop légères.

### Verdict

- Trop blanc ? Non, pas de manière critique.
- Correct ? Oui.
- Trop gris ? Pas vraiment.
- Professionnel ? Oui, avec quelques zones trop lisses.

## 3. STRUCTURE DES SURFACES

Hiérarchie cible :

Page background -> Section -> Card -> Elevated panel -> Interactive element

### Observé

- La hiérarchie existe, mais elle est parfois peu perceptible.
- Il y a quelques cas de white-on-white, surtout sur les filtres/sticky surfaces.
- Certaines sections de Services et Jobs sont visuellement trop proches de la page.

### Problème réel

- Absence de différence suffisante entre page, section et card sur certains écrans.
- Pas besoin de 10 nuances ; 3 niveaux clairs suffisent.

## 4. AUDIT DES PAGES PUBLIQUES

| Page | Fond principal | Surfaces | Contraste visuel | Problème |
|---|---|---|---|---|
| Home | background clair + hero dark image | cards claires, accents dorés | Bon | Hero excellent ; light sections parfois plates |
| Services | bg-slate-50 | sections très proches | Correct | Certaines zones uniformes |
| Jobs | bg-background | sticky search bar + cards | Correct | Surface sticky quasi identique au fond |
| Job detail | bg-background | cards lisibles | Correct | Peu de profondeur sur certains blocs |
| Blog | hero bleu foncé + section claire | cards/nettes | Bon | Très bon équilibre |
| About | bg-background | cards + sections | Bon | Très professionnel |
| Contact | hero dark + form card | contrasté | Bon | Formulaire et CTA clairs |
| FAQ | light | simple | Correct | Peu de risque |
| Solutions Entreprise/BPO | dark sections + light content | bonne variation | Bon | Très cohérent |

## 5. AUDIT DU HEADER

### Light mode

- fond : bg-background/85 + border + blur visible ;
- lisibilité : bonne ;
- bouton principal : bien visible ;
- navigation : claire et propre.

### Dark mode

- le système dark est présent, mais la mise en œuvre globale de header dark n'est pas toujours visible partout.
- Le header n'est pas catastrophique, mais pas toujours “sombre profond”.

### Verdict

- Header light : bon.
- Header dark : acceptable, mais pas toujours suffisamment différencié.

## 6. AUDIT DU FOOTER

- Fond : bg-slate-950/95 ; très bon.
- Texte : white / slate-300 ; lisible.
- Liens : hover blanc ; correct.
- Séparateurs : bien visibles.

### Verdict

Le footer est l'un des éléments visuellement les plus solides du site : vraie séparation, bon contraste, aspect corporate.

## 7. AUDIT DES BOUTONS

| Variante | Light background | Light text | Dark background | Dark text | Lisibilité |
|---|---|---|---|---|---|
| Primary | bleu #00009e | blanc | bleu #00009e | blanc | Très bonne |
| Secondary | doré #e8a900 | noir | doré #e8a900 | noir | Bonne |
| Outline | white/background | foreground | card/surface | foreground | Bonne |
| Ghost | transparent | foreground | transparent | foreground | Bonne |
| Destructive | rouge token | blanc | rouge token | blanc | Bonne |

### Risque réel

Le doré + texte blanc peut devenir fragile selon le fond et la variante utilisée. Ce n'est pas un bug général, mais un point à surveiller.

## 8. AUDIT DES CTA

CTA vérifiés : home hero, services, contact, jobs, inscription, connexion, candidature.

- Home / services : bon contraste, très visibles.
- CTA principal blue : excellent.
- CTA doré : correct mais à surveiller si le texte n'est pas adapté.

### Verdict

Les CTA restent visibles globalement dans les deux thèmes. Le risque principal est la combinaison doré + texte blanc dans certains usages inline.

## 9. AUDIT DES FORMULAIRES

- Inputs : border + bg-background + text foreground ; corrects.
- Placeholders : placeholder:text-muted-foreground ; acceptable.
- Focus ring : généralement bien visible.
- Dark mode : la logique .dark + variables CSS est globalement correcte.

### Points forts

- Les champs ne sont pas trop faibles sur fond clair.
- Le formulaire Contact est bien structured.

### Points à surveiller

- certains composants ad hoc (bg-white/text-slate-700) peuvent devenir délicats en dark mode s'ils ne sont pas remappés.

## 10. AUDIT DES CARTES ET PANNEAUX

### Light

- Cards blanches sur fond blanc : acceptable si bordure + ombre + espace présents.
- Les meilleures cartes (Blog, About) ont mieux cette hiérarchie.
- Les plus faibles sont les cards très pâles ou très peu élevées.

### Dark

- Le dark mode n'est pas noir pur ; c'est un bleu nuit profond, ce qui est bon.
- Il y a plusieurs niveaux de surface, même si la hiérarchie n'est pas homogène sur tous les composants.

### Conclusion

- Light : correct mais parfois trop lisse.
- Dark : globalement bon et plus professionnel que le “noir pur”.

## 11. DARK MODE — AUDIT APPROFONDI

Palette sombre actuelle :

- background : oklch(0.18 0.03 264)
- card : oklch(0.26 0.04 264)
- border : faible alpha bleu
- text principal : très clair

Cette palette est une version bleu nuit / gris profond, pas un noir générique. C'est cohérent avec la marque EmploiPlus Group.

### Ce qui est bon

- fond sombre profond sans devenir noir pur ;
- bleu corporatif conservé ;
- accent doré conservé.

### Ce qui est à améliorer

- quelques surfaces presque trop proches du fond ;
- certains composants non standard de type bg-white/text-slate-* peuvent créer des contrastes faibles.

## 12. DARK MODE — CONTRASTE

| Élément | Background | Foreground | Problème | Gravité |
|---|---|---|---|---|
| Button doré | dark surface | white text | contraste variable | Moyenne |
| Border faible | dark background | border alpha blue | parfois trop douce | Moyenne |
| Texte secondaire | dark card | muted foreground | proche du fond | Faible/Moyenne |
| Placeholders | dark input | muted foreground | acceptable | Faible |

### Verdict

Le dark mode est bon globalement, mais pas “parfait” : quelques éléments non standard peuvent perdre en lisibilité.

## 13. CONTRASTE ET ACCESSIBILITÉ

Le système est globalement cohérent :

- texte normal sur fond clair : bon ;
- texte sur fond sombre : bon ;
- boutons primaires : très lisibles ;
- labels et inputs : lisibles ;
- bordures : suffisantes.

### À vérifier visuellement / avec outil de contraste

- accent doré sur fond clair ou fond sombre ;
- bouton outline sur surfaces très foncées ;
- composants non standard bg-white/text-slate-* dans dark mode.

## 14. COULEURS DE MARQUE

- Bleu profond : À CONSERVER.
- Doré : À CONSERVER, mais éviter la combinaison doré + texte blanc sur fond trop léger.
- Blanc et neutres : adaptés au light mode.
- Dark mode : reste dans la famille bleu nuit / doré ; cohérent avec EmploiPlus Group.

## 15. GRADIENTS ET TRANSPARENCES

- gradients utilisés avec modération ;
- overlays dark : bien intégrés ;
- backdrop blur : utile sur le header ;
- transparency remains coherent with the overall UI.

### Verdict

Pas de gros problème sur gradients / overlays. Le système reste professionnel.

## 16. ÉTATS INTERACTIFS

- hover / focus / active : globalement corrects.
- cards hover : bonne logique.
- ghost buttons : passables.

### Risques

- surfaces blanches trop proches du fond ;
- hover sur éléments semi-transparents parfois trop léger.

## 17. RESPONSIVE

Le site reste cohérent sur mobile / tablet / desktop. Les réels points faibles sont davantage la hiérarchie des surfaces que la couleur pure.

### À surveiller

- sticky search bars quasi identiques au fond ;
- cartes très blanches ;
- overlays et éléments fixed.

## 18. SCORE

| Critère | Note |
|---|---:|
| Palette Light | 8/10 |
| Confort visuel Light | 7.5/10 |
| Hiérarchie des surfaces Light | 6.5/10 |
| Palette Dark | 8/10 |
| Hiérarchie des surfaces Dark | 7.5/10 |
| Contraste Dark | 7.5/10 |
| Lisibilité des boutons | 8/10 |
| Lisibilité des formulaires | 8/10 |
| Cohérence de marque | 8.5/10 |
| Accessibilité | 7.5/10 |
| Cohérence globale | 8/10 |

**Professionnalisme visuel Light : 80/100**

**Professionnalisme visuel Dark : 82/100**

## 19. TABLEAU DES PROBLÈMES

| Priorité | Fichier/composant | Mode | Problème | Impact | Recommandation |
|---|---|---|---|---|---|
| Moyenne | JobsPage (sticky search/filter) | Light | bg-white presque sans différenciation | hiérarchie faible | créer une vraie surface séparée |
| Moyenne | ServicesPage | Light | sections très proches du fond | lisse / plat | ajouter une légère différence de surface |
| Moyenne | Boutons dorés + texte blanc | Light + Dark | contraste variable | lisibilité | garder texte sombre sur accent doré |
| Faible | composants ad hoc bg-white/text-slate-* dans dark context | Dark | remapping incomplet | risque local | standardiser sur tokens |
| Faible | cards très peu élevées | Light | ombre/bordure insuffisante | faible profondeur | renforcer subtillement |

## 20. RECOMMANDATIONS

- Conserver le fond clair légèrement bleuâtre, pas un blanc cru.
- Séparer page / section / card avec de légères nuances de surface.
- Garder le bleu profond comme base et le doré comme accent.
- Sur les modes sticky et filters, différencier la surface du fond central.
- Vérifier les boutons dorés avec texte blanc sur fond clair ou sombre.
- Ne pas aller vers noir pur ; maintenir un dark bleu nuit profond.

### Hiérarchie recommandée

background sombre -> surface légèrement plus claire -> surface élevée -> border -> text principal -> text secondaire -> accent

## 21. À NE PAS FAIRE

- fond #f5f5f5 partout ;
- fond noir partout ;
- dark mode entièrement noir ;
- suppression de toutes les cartes ;
- suppression de tous les gradients ;
- remplacement du bleu / doré;
- inversion naïve light -> dark.

## 22. VERDICT FINAL

### Light mode

- Trop blanc ? Non, pas de manière critique.
- Correct ? Oui.
- Trop gris ? Pas réellement.
- Professionnel ? Oui.

### Dark mode

- Réellement professionnel ? Oui, globalement.
- Trop noir ? Non.
- Trop gris ? Pas franchement.
- Contrastes suffisants ? Oui, globalement.
- Boutons lisibles ? Oui.
- Formulaires lisibles ? Oui.
- Couleurs de marque correctement conservées ? Oui.

**État global Light : 80/100**

**État global Dark : 82/100**

**Nombre de corrections réellement nécessaires : 4 à 6**

## 23. PRIORITÉS

## À CORRIGER

- JobsPage sticky search/filter trop proche du fond
- Sections ServicesPage trop uniformes
- Boutons dorés avec texte blanc à vérifier
- Quelques cards trop peu différenciées du fond
- Composants ad hoc dark mode à standardiser

## À SURVEILLER

- CTA dorés sur fond clair
- surface sticky/fixed sur contenu
- remapping dark CSS de composants non tokenisés
- bordures très faibles sur certains panels

## À NE PAS TOUCHER

- bleu profond principal
- accent doré
- fond clair légèrement teinté
- dark mode bleu nuit
- système de tokens CSS global

### Verdict synthèse

Le site est déjà dans une bonne direction corporate. Il n'est ni trop blanc ni trop noir. Le vrai point à corriger est la hiérarchie des surfaces sur quelques zones claires. Le dark mode est sérieux et cohérent, avec quelques points de vigilance sur les accents et composants ad hoc.

À CONSERVER : palette primaire bleu profond, accent doré, fond clair légèrement teinté, dark mode bleu nuit profond, système de tokens CSS.
