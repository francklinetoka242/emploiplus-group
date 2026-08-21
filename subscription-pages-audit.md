# Audit UX/UI — Pages abonnements candidat

## 1. Verdict général

Les trois pages partagent une logique commerciale claire, mais elles souffrent d’une forte répétition visuelle. Les trois fichiers — src/pages/candidate/CandidateFreeSubscriptionPage.tsx, src/pages/candidate/CandidatePremiumSubscriptionPage.tsx, src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx — sont structurés selon un même schéma : intro forfait, bloc de valeur, bloc d’outils, bloc de différenciation, bloc comparatif. Le design reste propre, mais il manque de personnalité éditoriale et donne souvent l’impression d’un catalogue de cartes produit généré par un template SaaS.

## 2. Style générique IA

Oui, ces pages présentent plusieurs traits typiques du style “AI-generated SaaS” :
- gradients décoratifs sur certains blocs d’introduction ;
- nombreuses cartes avec bg-card, border, rounded-2xl/3xl, shadow ;
- répétition de l’icône + titre + description ;
- structures quasi identiques entre les trois forfaits ;
- sections visuellement très symétriques ;
- manque de vraie hiérarchie éditoriale entre “offre”, “valeur”, “différenciation” et “comparatif”.

Problèmes importants :
- Fichier : src/pages/candidate/CandidateFreeSubscriptionPage.tsx ; élément : section principale ; problème : bloc d’introduction très standardisé avec badge, icône, prix, CTA implicite ; preuve : classes rounded-3xl + border + bg-card + shadow-soft ; impact UX : donne l’impression d’un package générique ; priorité : ÉLEVÉE.
- Fichier : src/pages/candidate/CandidatePremiumSubscriptionPage.tsx ; élément : blocs “Ce que ce forfait inclut” ; problème : répétition du même pattern visuel que la page gratuite ; preuve : mêmes cartes, même icône, même structure ; impact UX : fatigue visuelle ; priorité : ÉLEVÉE.
- Fichier : src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx ; élément : cartes de fonctionnalité ; problème : répétition quasi mécanique entre les trois pages ; preuve : générativeFeatures identique sur les trois fichiers ; impact UX : peu de différenciation perçue ; priorité : ÉLEVÉE.
- Fichier : src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx ; élément : icône CrownIcon ; problème : accent décoratif non justifié ; impact UX : met davantage l’accent sur l’effet visuel que sur la compréhension ; priorité : MOYENNE.

## 3. Répétitions

Les répétitions nécessaires :
- le bloc “analyse CV ↔ offre”, score, résumé, lettre de motivation est logique et utile ;
- le comparatif entre forfaits est utile pour lire les différences.

Les répétitions inutiles :
- l’introduction d’un forfait est presque identique sur les 3 pages : badge, icône, prix, texte, encart de valeur ;
- les sections “Ce que ce forfait inclut” sont identiques en structure et en ton ;
- le même ensemble de 5 cartes de fonctionnalités est répété sur les 3 pages ;
- les blocs “Comparatif des forfaits” sont presque dupliqués ;
- les styles de cartes (rounded-2xl + border + bg-background/70 + p-4) se répètent sans variation réelle.

Le résultat : la page premium ressemble à une version “premiumized” de la page gratuite, pas à une expérience distincte.

## 4. Fatigue visuelle

Fatigue visuelle : Forte.

Pourquoi :
- les trois pages sont longues et surtout très répétitives ;
- la densité de contenu reste élevée ;
- les cartes se succèdent avec les mêmes bordures et les mêmes ombres ;
- les icônes sont nombreuses et toujours placées dans des cercles/carrés colorés ;
- les blocs de comparaison créent un rythme visuel trop régulier ;
- il manque des ruptures de rythme, comme de grandes zones de respiration ou de véritables chapitres éditoriaux.

## 5. Icônes

Nombre approximatif : élevé pour une page de comparaison d’abonnement.

Les icônes les plus fréquentes : Sparkles, FileText, GitCompareArrows, Mail, Bookmark, BellRing, Check, SlidersHorizontal, CrownIcon.

Problèmes observés :
- les icônes sont quasiment systématiquement intégrées dans des carrés/cercles colorés ;
- elles se répètent d’une page à l’autre ;
- elles ne structurent pas toujours l’information ; elles servent surtout à donner un effet “produit” ;
- certaines sont purement décoratives, surtout dans les blocs d’introduction et de valeur.

Conclusion : certaines icônes sont utiles, mais leur nombre et leur placement créent une surcharge visuelle.

## 6. Cards / borders / radius / shadows

Les pages utilisent très massivement :
- rounded-2xl, rounded-3xl, rounded-full ;
- border border-border ;
- bg-card / bg-background/70 ;
- shadow-[var(--shadow-soft)] ;
- multiples conteneurs empilés.

Impact : l’interface est “encadrée” de façon excessive. Chaque information semble enfermée dans une boîte. Cela produit l’effet “catalogue SaaS”, notamment sur les cartes de fonctionnalités et les blocs de comparaison.

Les arrondis ne sont pas forcément mauvais en eux-mêmes, mais leur usage généralisé est excessif et donne l’impression d’un design standardisé.

## 7. Couleurs

Le design system définit :
- primaire : #00009e ;
- secondaire : #e8a900.

Dans ces pages :
- la primaire est utilisée pour l’identité et les éléments de structure ;
- la secondaire est utilisée comme accent, surtout dans les badges et les cartes “valeur ajoutée” ;
- mais elle reste peu utilisée pour hiérarchiser des informations commerciales importantes.

Problème : la secondaire est souvent decorative plutôt qu’intelligente. Elle apparaît dans des encarts de mise en avant, mais ne sert pas assez à distinguer les niveaux, les différences clés ou les points d’attention.

La primaire est dominante, ce qui est cohérent, mais l’équilibre visuel global manque de nuances : toutes les pages restent trop monochromes à l’exception de petits accents secondaires.

## 8. Hiérarchie commerciale

Les informations commerciales attendues sont bien présentes :
- Gratuit : 0 FCFA / 3 recommandations / 4 offres enregistrées ;
- Premium : 550 FCFA / 7 recommandations / 7 offres enregistrées ;
- Premium+ : 1 050 FCFA / recommandations complètes / 10 offres enregistrées / alertes & filtres à venir.

Le problème n’est pas le contenu ; c’est la lisibilité commerciale. Sur les pages, l’œil est souvent attiré en premier par les éléments visuels (icônes, cartes, badges, contours) plutôt que par la vraie information de valeur : prix + nombre d’offres + différence avec le niveau inférieur.

Le score de compatibilité est correctement indiqué comme identique entre les forfaits ; ce point est mentionné, mais il est noyé dans la densité des blocs. Ce message clé devrait être plus net visuellement.

## 9. Comparaison des trois pages

| Critère | Gratuit | Premium | Premium+ |
|---|---|---|---|
| Personnalité visuelle | Faible | Faible | Faible |
| Densité | Élevée | Élevée | Élevée |
| Répétitions | Forte | Forte | Forte |
| Icônes | Nombreuses | Nombreuses | Nombreuses |
| Cartes | Très présentes | Très présentes | Très présentes |
| Border-radius | Excessif | Excessif | Excessif |
| Couleurs | Bleu dominant | Bleu + accents jaune | Bleu + accents jaune |
| Hiérarchie | Correcte mais faible | Correcte mais faible | Correcte mais faible |
| Lisibilité | Moyenne | Moyenne | Moyenne |
| Perception de valeur | Acceptable | Acceptable | Acceptable |
| Fatigue visuelle | Élevée | Élevée | Élevée |
| Impression template | Forte | Forte | Forte |
| Différenciation | Faible | Faible | Faible |

## 10. Problèmes prioritaires

1. Répétition extrême des sections et des cartes entre les trois pages.  
2. Surcharge visuelle due aux nombreux encadrements, icônes et bordures.  
3. Hiérarchie commerciale insuffisamment claire.  
4. Utilisation secondaire de la couleur jaune trop décorative et pas assez stratégique.  
5. Impression globale de “catalogue SaaS” plutôt que de page institutionnelle RH.

## 11. Recommandations pour la future refonte

- réduire le nombre de cartes et les blocs semblables ;
- donner plus de place à la typographie et aux différences entre niveaux ;
- utiliser la couleur secondaire comme signal d’importance plutôt que comme accent décoratif ;
- simplifier la structure des pages pour mieux mettre en avant prix, volume d’accès et différence réelle ;
- éviter les répétitions visuelles qui fatiguent ;
- introduire des variations de composition entre les trois forfaits sans casser la cohérence globale ;
- réduire les encadrements et les rayons excessifs ;
- traiter les pages comme des pages de décision commerciale, pas comme un catalogue de composants.

## 12. Scores

- UX : 66/100
- UI : 62/100
- Hiérarchie : 64/100
- Lisibilité : 68/100
- Personnalité : 45/100
- Professionnalisme : 60/100
- Différenciation : 38/100
- Fatigue visuelle : 72/100
- Perception “design IA” : 74/100

## 13. Verdict final

Oui, si un candidat parcourt successivement les trois pages, la répétition des composants, icônes, cartes, bordures et structures risque de fatiguer son attention. Les pages sont correctes fonctionnellement, mais visuellement elles manquent de respiration, de personnalité et de variation. La logique commerciale est compréhensible, mais le design ne la met pas suffisamment en valeur. L’impression dominante est celle d’une série de pages produites selon le même pattern générique, et non celle d’une vraie entreprise RH offrant une expérience de décision claire et crédible.
