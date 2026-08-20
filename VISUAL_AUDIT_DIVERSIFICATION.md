# Audit visuel après diversification

## 1. Résumé

Audit statique du code actuel après la passe de diversification. Aucun fichier de code n'a été modifié pendant cet audit.

La passe a produit une amélioration réelle mais localisée :

- la Home distingue maintenant un service en bloc ouvert et un service en panneau ;
- les valeurs de About utilisent une composition séparée par lignes plutôt que trois cartes ;
- le composant `Card` de Hub Emploi est plus plat et utilise une séparation latérale.

L'effet reste partiel. Les pages publiques conservent une forte présence de `border + shadow + grand radius`, de pills, d'icônes en pastilles et de hover lift. La diversification n'est donc pas seulement cosmétique, mais elle n'a pas encore changé la grammaire globale du site.

## 2. Modifications détectées

L'historique Git n'est pas disponible dans l'environnement utilisé pour cet audit. Les changements sont donc identifiés par comparaison avec l'état précédent connu et par lecture du code actuel.

| Zone | Modification visible | Verdict |
|---|---|---|
| `HomePage.tsx` | Le premier service est un bloc avec bordure latérale ; le second reste une carte sombre. L'icône et les marqueurs de liste diffèrent. | Diversification réelle, contenu inchangé. |
| `AboutPage.tsx` | Les valeurs sont présentées dans une grille avec séparateurs, sans surface de carte ni lift. | Amélioration pertinente. |
| `HubEmploiPage.tsx` | Le composant `Card` conserve son contenu mais perd l'ombre, le scale et la pastille d'icône. | Allègement pertinent. |

Aucun nouveau composant, texte, jeu de données, route ou fonctionnalité n'est identifiable dans ces changements.

## 3. Cards et éléments artificiels

### Cartes justifiées

- Home : cartes d'articles avec image, titre, extrait, lien et partage. Elles ont un rôle éditorial clair.
- Jobs : `JobCard` contient des données d'offre, des tags et des actions. La carte est fonctionnelle.
- Job detail : panneaux d'informations, actions et sections métier. La séparation est justifiée.
- About : cartes d'équipe avec photo, nom et rôle. Justifiées.
- Contact : blocs téléphone, email et localisation. Justifiés par la séparation des moyens de contact.
- FAQ : chaque question/réponse est un contenu réel, même si la répétition de surface est forte.

### Cartes répétitives

- `BlogPage.tsx` répète deux variantes très proches de carte article : featured et grille régulière.
- `ContactPage.tsx` répète trois fois la même structure icône + libellé + valeur + aide.
- `FAQPage.tsx` applique la même surface à chaque réponse et aux deux blocs statiques.
- Les sections services de `HubEmploiPage.tsx` et `CandidateSection.tsx` utilisent encore des séries de cartes similaires.

### Cartes artificielles, redondantes ou vides

Aucune nouvelle carte artificielle identifiable dans la passe récente. Le changement de `Card` dans `HubEmploiPage.tsx` ne crée pas une carte : il simplifie un composant existant.

Les skeletons vides de Home, Jobs et Blog sont des états de chargement légitimes. Les blocs d'image sans image sont des fallbacks conditionnels, pas des cartes vides. Aucun wrapper vide critique n'a été trouvé dans les zones auditées.

Les blocs visuels superposés de `CandidateDiscoverySection.tsx` contiennent des données de démonstration visibles ; ils restent à surveiller, mais ne sont pas issus de la dernière passe.

## 4. Diversification des compositions

La Home contient maintenant plusieurs rythmes : hero, bandeau de statistiques en cartes, grille éditoriale, section services asymétrique, logo partenaire et CTA pleine largeur. La section services est la réussite principale de la passe : les deux items ne suivent plus exactement la même surface.

About combine valeurs séparées, équipe en cartes et statistiques en panneau. Services combine listes, blocs image + texte, étapes et panneaux. Jobs utilise une barre de filtres, une liste d'offres et des actions. Blog combine rail featured et grille.

La diversification est donc structurelle dans quelques zones, et non uniquement un changement de rayon ou d'ombre. Elle reste cependant incomplète : plusieurs sous-sections de services reviennent encore à `icon + title + description` dans des cartes presque identiques.

## 5. Répétitions restantes

Une recherche dans `src/pages/public/**` retourne au moins 263 occurrences de motifs parmi `rounded-*`, ombres, hover scale/lift, rail horizontal et éléments fixed ; la sortie est plafonnée, ce nombre est donc un minimum.

- `rounded-2xl`, `rounded-3xl` et des valeurs comme `[28px]` ou `[32px]` restent fréquents.
- `border + shadow + radius` reste très présent dans Blog, FAQ, Contact, Job detail et Hub Emploi.
- `shadow-soft` et `shadow-sm` sont encore utilisés sur de nombreuses surfaces, parfois avec une bordure et un grand rayon.
- Les hover lifts persistent sur Blog, services, équipe, workflows et plusieurs composants d'offre.
- Les pills restent fonctionnelles pour catégories, statuts, filtres et labels, mais leur fréquence conserve un aspect standardisé.
- Les icônes dans des carrés ou cercles restent fréquentes dans Contact, Services, Job detail et les services candidat.

La combinaison a diminué dans les trois zones modifiées, mais elle est globalement stable à l'échelle du site. Elle n'a pas augmenté à cause de la passe.

## 6. Responsive

Le code conserve des variantes `sm`, `md` et `lg` pour les grilles principales. La composition asymétrique de Home reste lisible en colonne sur petit écran grâce à la grille responsive et aux espacements relatifs.

Points à surveiller :

- `BlogPage.tsx` utilise toujours un rail `overflow-x-auto` avec une largeur minimale de 360 px pour les featured cards ; le comportement est intentionnel mais reste à tester sur appareil réel.
- `JobsPage.tsx` combine filtres sticky, grilles et widget WhatsApp fixed ; le code ne suffit pas à garantir l'absence de recouvrement sur tous les mobiles.
- Les CTA pleine largeur et les panneaux à grands paddings doivent être vérifiés sur petits écrans.

Aucun overflow ou min-width manifestement cassé n'est démontré par le code seul. Test appareil réel : requis pour le rail Blog, le sticky Jobs et WhatsApp.

## 7. Régressions

Aucune suppression de texte, donnée, action, route, API, formulaire ou navigation n'est identifiable dans les modifications visuelles récentes.

Point fonctionnel non corrigé et toujours présent : dans `HomePage.tsx`, `usePublishedJobOffers(2)` fournit `homeJobs` et `jobsLoading`, mais `homeJobs` n'est jamais rendu dans le JSX. Aucune section d'offres correspondante n'est visible dans la Home actuelle. L'intention fonctionnelle est **NON DÉTERMINABLE À PARTIR DU CODE** ; le chargement paraît inutile, mais il ne doit pas être supprimé aveuglément.

Les fallbacks d'images et skeletons conditionnels sont cohérents avec des états de chargement ou d'absence de média. Aucun placeholder fictif nouveau n'a été ajouté.

## 8. Score estimé

**Score aspect IA estimé : 64/100.**

Références fournies : 69/100 initial, 58/100 précédent, 67/100 dernier audit.

La baisse par rapport à 67 reste modeste, mais elle est justifiée par trois changements de composition réels et ciblés. Le score reste élevé car les pages publiques conservent une forte standardisation des surfaces, des rayons, des ombres, des badges et des animations.

Le résultat est meilleur que le dernier audit, sans atteindre une diversification profonde. Il ne s'agit pas d'une simple recoloration, mais l'amélioration est locale plutôt que systémique.

## 9. Priorités

### P0 — Critique

Aucun élément vide critique, aucune régression visuelle majeure et aucune nouvelle carte artificielle démontrée.

### P1 — Important

- Répétition globale de `border + shadow + grand radius` sur les pages publiques.
- `homeJobs` chargé mais non rendu ; intention fonctionnelle à clarifier séparément.
- Répétition du motif badge + icône + titre + description dans les services.

### P2 — Modéré

- Rail featured Blog avec hover lift important et largeur minimale fixe.
- Trois cartes de contact presque identiques avec pastilles et animation commune.
- FAQ et Job detail très dépendants de grands panneaux arrondis.
- Hover lift et ombres encore appliqués à des séries entières de cartes.

### P3 — Faible

- Uniformité des pills et des rayons entre contrôles, cartes et panneaux.
- Rythme parfois prévisible dans les grilles de trois éléments.
- Vérification appareil réel des espacements et CTA.

## 10. Verdict final

1. **La diversification a-t-elle réellement fonctionné ?** Oui, mais seulement sur trois zones ciblées ; l'effet est structurel et pas uniquement cosmétique.
2. **Les cards sont-elles mieux utilisées ?** Oui dans Home, About et le composant Card de Hub Emploi ; elles restent trop nombreuses ailleurs.
3. **Y a-t-il de nouvelles cards artificielles ?** Non identifiable.
4. **Y a-t-il des éléments vides ?** Aucun élément vide critique ; les skeletons et fallbacks sont justifiés.
5. **Les répétitions ont-elles diminué ?** Localement oui, globalement légèrement seulement.
6. **Le site est-il plus professionnel ?** Oui, avec une hiérarchie plus nuancée sur les zones modifiées.
7. **Le score estimé est-il meilleur ou pire ?** Meilleur que 67, estimé à 64/100, mais encore élevé.
8. **Une nouvelle passe est-elle nécessaire ?** Oui, mais ciblée : FAQ, Contact et services publics avant toute refonte globale.

Conclusion : la passe est validée comme amélioration qualitative réelle, mais elle ne suffit pas encore à faire disparaître l'impression de système de cartes répétées sur l'ensemble des pages publiques.
