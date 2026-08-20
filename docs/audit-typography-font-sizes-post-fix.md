# Audit typographique post-fix

## Modifications effectuées

| Fichier | Élément | Ancienne taille | Nouvelle taille | Justification |
|---|---|---|---|---|
| `src/pages/public/ContactPage.tsx` | H1 du hero Contact | `text-4xl md:text-5xl lg:text-6xl` | `text-4xl md:text-5xl` | Supprime le palier mega-heading desktop, en conservant un H1 dominant. |
| `src/pages/public/HomePage.tsx` | Titre du CTA final | `text-3xl md:text-5xl` | `text-2xl md:text-3xl` | Maintient la hiérarchie Hero Home > sections > CTA final. |
| `src/pages/public/HomePage.tsx` | Badge article « À la une » | `text-[11px]` | `text-xs` | Retour à l'échelle publique standard, sans perte de fonction. |
| `src/pages/public/HomePage.tsx` | Badge de service | `text-[11px]` | `text-xs` | Réduit une exception arbitraire sans changer la proportion du badge. |
| `src/pages/public/HomePage.tsx` | Descriptions principales des services | `text-sm` | `text-base` | Traite ces paragraphes comme du contenu métier principal plutôt que comme des métadonnées. |

## Éléments volontairement non modifiés

`SectionHeader` n'a pas été réduit globalement. Il n'est utilisé que pour les sections structurantes de Home et Blog, où `text-3xl md:text-4xl` conserve un niveau H2 lisible. Une réduction globale aurait aplati la hiérarchie de ces pages.

Les tailles de `Button`, `JobCard`, des statistiques `2xl/3xl` et du score de compatibilité `2xl` sont conservées. Elles étaient explicitement jugées cohérentes dans l'audit initial.

Les `text-sm` des dates, lieux, tags, extraits d'articles, aides, labels et contrôles n'ont pas été agrandis. Les micro-labels admin/candidat en `[8px]–[11px]` n'ont pas été modifiés automatiquement : ils appartiennent à des interfaces denses et nécessitent un contrôle visuel réel avant décision.

Aucun texte, contenu, appel API, route, logique métier, couleur, image, icône, rayon, ombre, bordure, animation ou fonctionnalité n'a été modifié.

`homeJobs` reste volontairement inchangé, conformément à la consigne.

## Vérification responsive

- **320 px :** le H1 Contact revient à `text-4xl` au lieu de `text-5xl/6xl`; le risque de hauteur excessive est réduit. Vérifier les retours à la ligne avec le contenu traduit.
- **375 px :** le CTA Home est en `text-2xl`; son titre doit rester dominant sans pousser le bouton hors du premier écran.
- **390 px :** les descriptions Home en `text-base` peuvent occuper une ligne supplémentaire ; vérifier la hauteur des deux services.
- **768 px :** les transitions `md` du H1 Contact et du CTA Home restent maîtrisées ; contrôler l'équilibre avec les paddings existants.
- **1024 px :** le H1 Contact reste en `text-5xl`, suffisamment fort sans rejoindre le niveau `text-6xl`.
- **Desktop large :** le hero Home conserve `text-6xl`, le CTA final passe en `text-3xl`; la hiérarchie est maintenant nette.

Ces constats sont déduits du code. Une vérification sur appareil réel reste nécessaire pour les traductions longues, les titres multi-lignes et les interfaces admin denses.

## Résultat

**Qualité typographique avant : 74/100**

**Qualité typographique après : 78/100**

La hiérarchie est plus intentionnelle sur les deux zones qui présentaient les excès les plus clairs. Les corrections sont subtiles : le hero Contact reste fort, le CTA Home reste important et les services Home gagnent en lisibilité sans devenir surdimensionnés.

Une nouvelle correction typographique générale n'est pas nécessaire. Il reste seulement une surveillance responsive et, si un test réel le confirme, une éventuelle révision ponctuelle des micro-labels admin à `8–9 px`.
