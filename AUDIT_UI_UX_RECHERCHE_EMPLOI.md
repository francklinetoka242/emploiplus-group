# Audit UI/UX recherche d'emploi

## Structure avant

La page `JobsPage` présentait une barre de recherche sticky avec une recherche textuelle, deux boutons d'action candidat, des filtres repliés, puis les recommandations et les recherches sauvegardées/récentes avant la liste principale des offres. Cette séquence donnait un poids visuel similaire aux fonctions secondaires et aux résultats.

## Structure après

La hiérarchie visuelle est maintenant organisée ainsi :

1. Recherche principale clairement titrée « Rechercher un emploi ».
2. Filtres regroupés sous « Critères de recherche ».
3. Actions candidat distinctes : préférences et proximité.
4. Résultats sous « Offres disponibles », avec nombre et tri affichés.
5. « Mes recherches » regroupant les recherches sauvegardées et récentes.
6. Recommandations conservées dans leur panneau séparé, accessible par l'action dédiée.

## Composants modifiés

- `src/pages/public/JobsPage.tsx` uniquement pour la disposition, les libellés et les classes de présentation.
- Aucun nouveau composant créé.
- Aucun composant UI partagé modifié.

## Fonctionnalités conservées

- Recherche textuelle et interprétation en langage naturel.
- Filtres contrat, localisation, entreprise, domaine et salaire minimum.
- Tri et réinitialisation.
- Application des préférences candidat.
- Recherche « Offres proches de moi ».
- Sauvegarde, modification, activation/désactivation et suppression des recherches.
- Historique récent, restauration, suppression individuelle et effacement.
- Recommandations personnalisées et pagination dans le panneau latéral.
- Accès candidat pour postuler et demande de connexion pour les visiteurs.
- États de chargement et état sans résultat.

## Modifications comportementales

Aucune règle métier, requête Supabase, donnée, moteur de recherche ou moteur de matching n'a été modifié. Les handlers existants sont réutilisés.

La seule adaptation fonctionnelle visible est la présentation de textes d'aide : l'action de proximité indique qu'elle repose sur la ville et les préférences de mobilité, sans prétendre calculer une distance réelle. « Ma prochaine action » n'a pas été dupliquée dans la page de recherche.

## Responsive

- La recherche reste immédiatement accessible sur mobile.
- Les filtres restent repliables et ne remplissent pas l'écran en permanence.
- Les deux actions candidat passent en grille sur petits écrans puis en deux colonnes sur écrans plus larges.
- Les résultats occupent la zone principale avant les fonctions secondaires.
- « Mes recherches » passe d'une colonne sur mobile à deux colonnes sur desktop.
- Les contrôles et libellés restent adaptables grâce aux classes responsive existantes.

## Vérifications demandées

Le build `npm run build:vite` a réussi après la modification. Les branches de rendu existantes restent en place pour visiteur, candidat connecté, chargement, absence de résultats, absence de préférences, recherches sauvegardées/récentes, recommandations, proximité, réinitialisation et recherche.

La vérification visuelle réelle dans un navigateur n'a pas été exécutée dans cette session. Les warnings existants du build concernent `eval` dans `pdfjs-dist` et la taille de certains chunks, pas cette refonte.

## Problèmes restants

Les limites métier identifiées dans l'analyse sont volontairement conservées : proximité fondée sur les libellés ville/pays, rayon non utilisé comme distance, préférences partiellement reprises, filtres domaine/salaire exécutés localement et recommandations distinctes de la recherche. Leur présentation a été clarifiée sans modifier leur fonctionnement.
