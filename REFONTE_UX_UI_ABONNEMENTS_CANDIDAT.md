# Refonte UX/UI — pages d’abonnement candidat

## Fichiers modifiés

- [src/pages/candidate/CandidateFreeSubscriptionPage.tsx](src/pages/candidate/CandidateFreeSubscriptionPage.tsx)
- [src/pages/candidate/CandidatePremiumSubscriptionPage.tsx](src/pages/candidate/CandidatePremiumSubscriptionPage.tsx)
- [src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx](src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx)

## Principales améliorations UX

- Réorganisation stricte de la hiérarchie visuelle : le candidat lit d’abord le forfait, puis le prix, puis la promesse commerciale, puis le nombre de recommandations.
- Renforcement de la compréhension immédiate de la différence entre Gratuit, Premium et Premium+.
- Mise en avant claire du principe produit : les recommandations dépendent des correspondances réellement disponibles, et le score reste identique quel que soit le forfait.
- Le nombre de recommandations est désormais mis en valeur sous forme d’éléments de décision plus visibles que les blocs de fonctionnalités génériques.
- Réduction de la répétition des “cards” identiques et simplification du rythme visuel pour améliorer la lecture et le décodage rapide.
- Clarification du rôle de l’IA et du matching, avec une distinction plus lisible entre outils intelligents et rapprochement algorithmique.
- Les blocs de comparaison rapide ont été repensés pour devenir plus lisibles et plus décisifs plutôt que de simples grilles de contenu.
- L’état “Bientôt disponible” a été conservé sans inventer de paiement ni aucune logique métier.

## Principales améliorations UI

- Refonte des héros de page avec une hiérarchie plus éditoriale et plus professionnelle.
- Utilisation plus nette de la couleur secondaire comme accent de valeur, notamment sur les chiffres clés “3”, “7”, “Toutes”, afin de donner une vraie priorité visuelle à la différence commerciale.
- Soin accordé à l’espace, la densité, les bordures fines et la respiration textuelle, pour éviter l’impression de template SaaS.
- Remplacement de la logique “card après card” par une architecture qui associe sections, sous-sections et blocs de mise en avant plus lisibles.
- Les comparatifs sont désormais plus lisibles en desktop comme en mobile, sans surcharger la page.
- La palette reste alignée sur le design system existant et n’introduit pas de nouvelle couleur arbitraire.

## Utilisation de la couleur secondaire

La couleur secondaire a été utilisée comme signal de valeur et non comme décoration pure :

- sur les badges de niveau de forfait ;
- dans les blocs “Valeur clé” / “Valeur ajoutée” / “Accès complet” ;
- sur les chiffres 3, 7 et Toutes ;
- sur certains accents de comparaison rapide.

La couleur primaire reste utilisée pour l’identité institutionnelle et la structure, tandis que la secondaire sert de repère visuel pour l’élément de décision produit. Cela répond à la demande de hiérarchie claire entre identité / structure et valeur / accent.

## Différenciation Gratuit / Premium / Premium+

- Gratuit : 0 FCFA, puis “Jusqu’à 3 recommandations”, avec une mise en avant claire du niveau de base et du principe de score identique.
- Premium : 550 FCFA / mois, puis “Pour aller plus loin dans votre recherche d’emploi” et “Jusqu’à 7 recommandations”.
- Premium+ : 1 050 FCFA / mois, puis “Pour accéder à l’ensemble des opportunités correspondant à votre profil” et “Toutes les recommandations disponibles”.

Les différences réelles sont maintenant plus visibles en quelques secondes sans faire de promesse non conforme sur le score ni sur le matching.

## Vérifications effectuées

- Vérification des trois routes concernées : OK.
- Vérification du retour vers /candidate/subscription : conservé via le bouton “Retour aux abonnements”.
- Vérification des prix : 0 FCFA, 550 FCFA / mois, 1 050 FCFA / mois.
- Vérification des recommandations : 3 / 7 / Toutes.
- Vérification de la cohérence du message sur le score : conservé et clairement rappelé.
- Lint des fichiers modifiés : OK.
- Build Vite : OK.

## Éventuels points restants à vérifier

- Validation visuelle finale en navigateur sur les écrans tactiles réels et les tailles de mobile plus faibles.
- Vérification manuelle de la page dans un contexte authentifié complet du candidat.
- Vérification du dark mode si un comportement spécifique est attendu dans le produit final.

## Conclusion

La refonte a renforcé la hiérarchie éditoriale, réduit la répétition des cartes et mieux mis en avant la vraie valeur commerciale de chaque forfait, tout en conservant le design system et la logique produit existante. Aucune logique backend, matching, score ni paiement n’a été ajoutée ni modifiée.
