# CHARTE GRAPHIQUE – EMPLOIPLUS GROUP

# Document de Référence Visuelle
Dernière mise à jour : 18 sept. 2026

# 1. Identité visuelle générale

EmploiPlus Group adopte une identité visuelle professionnelle, moderne et orientée technologie. Le style doit transmettre simultanément :

- La confiance et la stabilité d'un acteur RH.
- L'énergie et la visibilité nécessaires à la recherche d'emploi.
- La simplicité d'utilisation pour les candidats, les entreprises et les administrateurs.
- Une image numérique contemporaine, claire et accessible.

La direction artistique repose sur un contraste entre un bleu de marque affirmé, un bleu profond institutionnel et un accent or utilisé avec mesure. Les surfaces blanches et les gris bleutés assurent la lisibilité et permettent aux contenus métiers de rester prioritaires.

## Principes de composition

1. Utiliser le bleu de marque pour guider l'action et identifier EmploiPlus.
2. Utiliser le bleu profond pour les héros, les bandeaux et les contextes à forte présence visuelle.
3. Utiliser l'or pour attirer l'attention sur les éléments secondaires, les indicateurs et les moments importants.
4. Conserver des fonds clairs et peu chargés pour les formulaires, les listes et les tableaux.
5. Réserver les dégradés et les halos aux zones de mise en valeur, sans les appliquer à tous les composants.
6. Maintenir une hiérarchie typographique nette : titre, sous-titre, contenu, information secondaire.

# 2. Palette de couleurs principale

## Couleurs de marque

| Nom | Valeur | Rôle principal |
| --- | --- | --- |
| Bleu EmploiPlus | `#1B2CE3` | Actions principales, liens, boutons, icônes et éléments de marque. |
| Bleu profond | `#000079` | Fonds de hero, navigation sombre, bandeaux et dégradés institutionnels. |
| Or EmploiPlus | `#E8A900` | Actions secondaires, accents, indicateurs et mise en évidence. |
| Blanc | `#FFFFFF` | Texte sur fond sombre, cartes et surfaces principales. |
| Noir | `#000000` | Texte placé sur l'accent or et contrastes forts. |

## Utilisation recommandée

- Le **bleu EmploiPlus** est la couleur d'action par défaut. Il doit identifier les boutons principaux, les liens importants et les éléments interactifs actifs.
- Le **bleu profond** est destiné aux zones de grande surface ou de forte identité : hero, footer, dashboard et bandeaux de navigation.
- L'**or EmploiPlus** sert à créer un point focal. Il ne doit pas remplacer le bleu pour les actions principales.
- Le **blanc** constitue la surface de lecture privilégiée pour les cartes, formulaires et contenus éditoriaux.
- Le **noir** est utilisé ponctuellement lorsque le texte doit rester lisible sur un bouton ou une surface or.

## Couleurs sémantiques du thème

| Token | Valeur actuelle | Utilisation |
| --- | --- | --- |
| `background` | `oklch(0.985 0.008 250)` | Fond général clair de l'application. |
| `foreground` | `oklch(0.18 0.04 255)` | Texte principal et titres sur fond clair. |
| `card` | `oklch(0.998 0.006 250)` | Fond des cartes et blocs de contenu. |
| `muted` | `oklch(0.965 0.012 250)` | Surfaces secondaires et zones atténuées. |
| `muted-foreground` | `oklch(0.5 0.03 255)` | Texte secondaire, aide et métadonnées. |
| `border` | `oklch(0.9 0.014 250)` | Bordures, séparateurs et champs. |
| `destructive` | `oklch(0.58 0.22 27)` | Erreurs, suppressions et actions irréversibles. |
| `sidebar` | `oklch(0.15 0.08 264)` | Navigation latérale et espaces administratifs. |

# 3. Couleurs fonctionnelles

## États de l'interface

Les couleurs d'état doivent rester compréhensibles sans dépendre uniquement de la couleur. Elles doivent être accompagnées d'un libellé, d'une icône ou d'un message explicite.

| État | Couleur de référence | Usage |
| --- | --- | --- |
| Succès | `#22C55E` | Confirmation d'une action, statut validé ou opération terminée. |
| Avertissement | `#E8A900` | Attention, information à vérifier ou délai à surveiller. |
| Erreur | `#DC2626` | Erreur de saisie, échec d'une action ou suppression. |
| Information | `#1B2CE3` | Information neutre, état actif ou aide contextuelle. |
| Surface neutre | `#F8FAFC` | Fond discret pour les blocs secondaires. |

## Réseaux sociaux

| Réseau | Valeur | Usage |
| --- | --- | --- |
| WhatsApp | `#25D366` | Boutons et liens de contact WhatsApp. |
| Facebook | `#1877F2` | Icônes et liens Facebook. |
| LinkedIn | `#0A66C2` | Icônes et liens LinkedIn. |

Ces couleurs sont limitées aux éléments identifiant le réseau concerné. Elles ne doivent pas devenir des couleurs générales de l'interface.

# 4. Dégradés et effets de surface

## Dégradés de marque

Le dégradé principal associe le bleu profond, le bleu EmploiPlus et l'or :

```css
linear-gradient(135deg, var(--brand-deep) 0%, var(--brand) 60%, var(--accent) 120%)
```

Il est destiné aux zones de marque, aux bandeaux et à certains composants principaux. Pour les boutons ou blocs plus sobres, le dégradé bleu suivant est également utilisé :

```css
linear-gradient(135deg, #1B2CE3 0%, #000079 100%)
```

Le dégradé de texte de marque suit cette logique :

```css
linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)
```

## Superpositions d'images

Les images hero et les images d'articles peuvent recevoir une superposition sombre afin de garantir la lisibilité du texte :

- Hero services : dégradé horizontal sombre basé sur `slate`.
- Blog : dégradé vertical partant du noir vers la transparence.
- Article détaillé : dégradé vertical basé sur le bleu profond.
- Contact : fond sombre avec des halos bleu et or très légers.

Une superposition ne doit pas masquer le sujet principal de l'image. Le texte doit rester lisible sans rendre l'image artificiellement sombre.

## Ombres

Les ombres sont discrètes et servent à distinguer les surfaces sans créer un effet de profondeur excessif :

- `shadow-soft` : cartes, tableaux et conteneurs courants.
- `shadow-elev` : éléments nécessitant une séparation plus forte.
- `shadow-brand` : boutons ou actions principales de marque.

Les ombres ne doivent pas être utilisées pour compenser une mauvaise hiérarchie de mise en page.

# 5. Typographie

## Familles de caractères

| Famille | Utilisation |
| --- | --- |
| Inter | Texte courant, formulaires, navigation, tableaux et informations fonctionnelles. |
| Plus Jakarta Sans | Titres, accroches, éléments de présentation et affichage de marque. |

Les deux familles sont intégrées via `@fontsource` et déclarées dans `src/styles.css`.

## Hiérarchie typographique

- **Titre principal H1** : Plus Jakarta Sans, poids 700 ou 800, utilisé une seule fois par page.
- **Titre de section H2** : Plus Jakarta Sans, poids 600 ou 700, pour structurer le contenu.
- **Sous-section H3** : Plus Jakarta Sans ou Inter, poids 600, pour les blocs fonctionnels.
- **Texte courant** : Inter, poids 400, avec une hauteur de ligne confortable.
- **Libellés et boutons** : Inter, poids 500 ou 600.
- **Métadonnées** : Inter, poids 400 ou 500, dans une teinte `muted-foreground`.

La taille des textes doit suivre le contexte : les pages éditoriales peuvent utiliser des titres plus expressifs, tandis que les écrans candidat et administration privilégient une typographie compacte et facilement scannable.

## Règles de lisibilité

1. Ne pas utiliser l'or comme couleur de texte sur fond blanc pour les paragraphes.
2. Vérifier le contraste entre le texte et chaque fond, notamment sur les dégradés.
3. Ne pas transmettre une information uniquement par la couleur.
4. Conserver des libellés courts et suffisamment espacés dans les boutons et les champs.
5. Prévoir un état `focus-visible` clairement identifiable pour la navigation clavier.

# 6. Composants et style d'interface

## Boutons

- **Primaire** : fond bleu EmploiPlus, texte blanc, rayon arrondi et ombre de marque légère.
- **Secondaire** : fond or, texte noir, utilisé pour attirer l'attention sans concurrencer l'action principale.
- **Secondaire discret** : fond blanc ou transparent, bordure visible et texte de marque.
- **Destructif** : rouge réservé aux suppressions et opérations irréversibles.

Les boutons doivent présenter des états distincts : repos, survol, focus, désactivé et chargement. Une icône peut accompagner le texte lorsqu'elle facilite la compréhension de l'action.

## Cartes et surfaces

Les cartes utilisent généralement :

- un fond `card` ou blanc ;
- une bordure `border` légère ;
- un rayon cohérent avec les tokens du thème ;
- une ombre douce lorsque la carte doit être séparée du fond ;
- un espacement interne régulier.

Les cartes ne doivent pas être empilées les unes dans les autres sans nécessité. Les grandes sections de page doivent rester ouvertes et structurées par l'espacement plutôt que transformées en succession de conteneurs flottants.

## Navigation et sidebar

La navigation latérale utilise une base sombre, avec le bleu de marque pour l'élément actif et l'or pour les accents ou actions secondaires. L'état actif doit être identifiable par plusieurs signaux : couleur, fond, icône, bordure ou indicateur.

## Champs et formulaires

Les champs utilisent un fond clair, une bordure gris bleuté et un état de focus visible. Les messages d'erreur sont placés au plus près du champ concerné et utilisent une formulation explicite en plus de la couleur rouge.

## Rayons et densité

Les rayons sont arrondis mais doivent rester maîtrisés afin de préserver une apparence professionnelle. Les composants de données, tableaux et zones administratives doivent être plus compacts que les sections marketing ou les pages publiques.

# 7. Style par zone fonctionnelle

## Site public

Le site public peut employer des compositions plus expressives : images hero, dégradés, grands titres, animations d'entrée et appels à l'action visibles. Le bleu profond porte les sections immersives, tandis que le bleu EmploiPlus et l'or orientent le parcours.

## Espace candidat

L'espace candidat privilégie la clarté, la progression et la confiance. Les fonds clairs, les cartes lisibles, les étapes explicites et les statuts colorés doivent faciliter les tâches de profil, de CV et de candidature.

## Espace administration

L'administration adopte une présentation fonctionnelle et dense : navigation latérale sombre, surfaces blanches, tableaux, indicateurs KPI et contrôles compacts. Les accents de couleur doivent aider à prioriser l'information sans transformer chaque bloc en élément décoratif.

## Pages éditoriales et blog

Les pages du blog utilisent des images fortes, des superpositions sombres et une lecture confortable. Les titres et métadonnées doivent rester visibles sur les images et conserver un contraste suffisant sur mobile.

# 8. Animation et interaction

Les animations doivent renforcer la compréhension de l'interface :

- apparition progressive des sections importantes ;
- transitions courtes sur les liens et les boutons ;
- agrandissement léger des images au survol ;
- animation de notification ou d'assistant lorsque l'état change.

Les transitions existantes sont généralement courtes, autour de 180 à 260 ms. Les animations doivent respecter `prefers-reduced-motion: reduce` et être désactivées ou simplifiées pour les utilisateurs qui le demandent.

# 9. Responsive design et accessibilité

Le style doit rester cohérent sur mobile, tablette et desktop :

- les titres doivent pouvoir passer sur plusieurs lignes sans chevaucher les autres éléments ;
- les boutons doivent conserver une zone d'interaction confortable ;
- les grilles doivent se réduire progressivement, sans provoquer de défilement horizontal inutile ;
- les tableaux complexes doivent proposer un comportement adapté aux petits écrans ;
- les contrastes et les états de focus doivent rester visibles sur toutes les tailles ;
- les images doivent conserver un ratio stable et un cadrage pertinent.

Les couleurs de marque sont des repères visuels, mais l'information doit également être disponible dans le texte, les icônes ou la structure de l'interface.

# 10. Tokens et fichiers de référence

Les tokens visuels principaux sont définis dans :

- `src/styles.css` : variables de couleur, typographie, rayons, ombres, dégradés et règles globales ;
- `COLOR-PALETTE.md` : inventaire des couleurs et des usages identifiés ;
- `src/styles/eco-mode.css` : adaptations du mode économie de données ;
- `src/components/ui/` : composants UI réutilisables ;
- `AUDIT-DESIGN.md` : observations de cohérence sur certains écrans et composants.

Les nouveaux composants doivent réutiliser les tokens existants (`brand`, `primary`, `secondary`, `accent`, `background`, `card`, `muted`, `border`) avant d'introduire une nouvelle couleur en valeur directe.

# 11. Contrôle qualité visuel

Avant de valider une évolution de style :

1. Vérifier la cohérence avec les couleurs et les tokens existants.
2. Tester les états normal, survol, focus, désactivé, chargement et erreur.
3. Contrôler le rendu sur mobile et desktop dans le navigateur.
4. Vérifier qu'aucun texte, bouton ou composant ne se chevauche.
5. Tester le contraste des textes sur les fonds unis, les images et les dégradés.
6. Vérifier le comportement avec `prefers-reduced-motion`.
7. Comparer les pages publiques, candidat et administration afin d'éviter la création de styles isolés.

# 12. Synthèse de la direction artistique

La signature visuelle d'EmploiPlus Group repose sur :

- un **bleu vif** pour l'action et la reconnaissance de marque ;
- un **bleu profond** pour la confiance et les grandes surfaces ;
- un **or maîtrisé** pour les accents et la hiérarchisation ;
- des **fonds blancs et gris bleutés** pour la lisibilité ;
- une typographie **Inter + Plus Jakarta Sans** pour associer efficacité et caractère ;
- des dégradés, ombres et animations utilisés comme supports de hiérarchie, jamais comme décoration systématique.

---

Approbation design :
Personne
Signature
