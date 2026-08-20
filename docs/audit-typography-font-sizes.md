# Audit typographique global — Tailles de polices

## 1. Périmètre et inventaire

Audit statique de `src/` sans modification de fichier. La recherche relève **939 occurrences** de motifs de tailles dans **131 fichiers**. L'échelle Tailwind standard est largement utilisée : `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl` et `text-6xl`. Aucun usage significatif de `text-7xl` n'a été observé dans les pages inspectées.

Les tailles arbitraires repérées sont concentrées dans les interfaces denses : `text-[8px]`, `[9px]`, `[10px]` et `[11px]`, surtout dans `src/pages/admin/`, les sidebars candidat et deux badges de `HomePage.tsx`. Elles servent principalement aux micro-labels uppercase et aux statuts compacts. Aucun `font-size` local important ni `clamp()` typographique n'a été identifié dans les styles inspectés.

Échelle Tailwind de référence utilisée : `xs` 12 px, `sm` 14 px, `base` 16 px, `lg` 18 px, `xl` 20 px, `2xl` 24 px, `3xl` 30 px, `4xl` 36 px, `5xl` 48 px, `6xl` 60 px.

## 2. Hiérarchie actuelle

| Niveau | Tailles principalement présentes | Usage |
|---|---|---|
| Display / hero exceptionnel | `text-5xl`, `text-6xl` | Hero Home et Contact, certains heroes services. |
| H1 page | `text-4xl`, parfois `text-5xl`, mobile souvent `text-3xl/4xl` | PageHeading, Blog, FAQ, Services, BPO. |
| H2 section | `text-2xl`, `text-3xl`, parfois `text-4xl` | Sections publiques, SectionHeader, contenus services. |
| H3 / sous-section | `text-xl`, `text-2xl` | Cartes, étapes BPO, Job detail, FAQ. |
| Titre d'offre / article | `text-lg`, `text-xl`, parfois `text-2xl` | JobCard, Blog, détails d'offre. |
| Introduction | `text-lg`, parfois `text-base` | Sous-titres de hero et descriptions de page. |
| Corps courant | `text-base`, `text-sm` | Paragraphes, descriptions, listes et métadonnées longues. |
| Secondaire / métadonnée | `text-sm`, `text-xs` | Dates, lieux, labels, aides et navigation compacte. |
| Micro-label | `[8px]` à `[11px]` | Admin, sidebars, badges très compacts. |
| Boutons / contrôles | `text-sm`, `text-xs` en taille small | Button générique, filtres, pagination, badges. |
| Statistiques | `text-2xl`, `text-3xl`, `text-4xl` | Home, StatsCard, compteurs et scores. |

La hiérarchie générale est lisible : les titres dominent les textes et les CTA ne dépassent pas les titres. Le système n'est pas anarchique, mais certains niveaux se chevauchent selon les pages.

## 3. Pages publiques

| Page | H1 dominant | H2 dominant | Body principal | Principal risque |
|---|---|---|---|---|
| Home | `4xl` → `6xl` | `3xl` → `5xl` pour le CTA | `base`, `lg` | Mega-heading répété entre hero et CTA ; statistiques `2xl/3xl` restent correctes. |
| Services | `4xl` | `3xl`, `2xl` | `base`, `lg` | Deux grands titres de services proches d'un hero. |
| Jobs | Page heading partagé, résultats sans grand H1 local | `lg` / `xl` | `sm`, `base` | Filtres et métadonnées utilisent beaucoup `sm`, mais lisibles. |
| Job detail | `3xl` → `4xl` | `2xl` | `base` | Bon rapport titre/description ; H3 de sidebar parfois proche des H2. |
| Blog | `4xl` → `5xl` | `3xl` | `lg`, `sm` | Hero et titre « Ressources » créent deux moments forts. |
| About | `3xl` → `4xl` | `2xl` | `lg` | Hiérarchie stable, statistiques visuellement dominantes. |
| Contact | `4xl` → `6xl` | `3xl` | `lg` | H1 très grand et sous-titre répété dans le hero. |
| FAQ | `4xl` | `2xl` | `lg` | H2 de chaque question assez imposant mais adapté à une lecture longue. |
| Solutions BPO | `4xl` | cinq H2 en `2xl` | `lg` | Les étapes sont cohérentes ; CTA H3 en `2xl` peut concurrencer les étapes. |
| Services associés | `4xl`, `3xl` | `2xl`, `3xl` | `base`, `lg` | Quelques pages utilisent `H2 3xl` et `H3 2xl` pour des rôles proches. |

## 4. Incohérences importantes

| Priorité | Fichier / composant | Constat | Taille actuelle | Niveau attendu | Gravité |
|---|---|---|---|---|---|
| Élevée | `HomePage.tsx`, CTA final | Le CTA réutilise un titre `3xl md:5xl` presque au niveau d'un hero. | `3xl/5xl` | `2xl/3xl` pour une section finale | Peut aplatir la hiérarchie de la page. |
| Élevée | `ContactPage.tsx` | Le H1 monte à `6xl` alors que le contenu de contact reste une page fonctionnelle. | `4xl/5xl/6xl` | `4xl/5xl` | Risque de mega-heading disproportionné, surtout mobile. |
| Moyenne | `SectionHeader.tsx` vs pages services | `H2` partagé vaut `3xl/4xl`, tandis que plusieurs H2 locaux valent `2xl/3xl`. | `2xl` à `4xl` | `2xl/3xl` pour sections secondaires | Variation parfois justifiée, mais à surveiller. |
| Moyenne | `JobOfferDetailPage.tsx` | H3 de sidebar en `xl`, titres de blocs en `2xl`, mais certains contrôles utilisent `2xl` de rayon sans différence typographique. | `xl/2xl` | Correct | Problème mineur de densité, pas de taille seule. |
| Moyenne | `src/pages/admin/` | Micro-labels à `[8px]` et `[9px]` avec tracking large. | `8–11px` | `10–12px` | Risque de lisibilité, acceptable seulement pour contexte admin dense. |
| Faible | `HomePage.tsx`, badges | Badges publics à `[11px]` au lieu de `text-xs`. | `[11px]` | `text-xs` | Exception visuelle légère, sans impact majeur. |

## 5. Heroes et titres

Les heroes publics ne sont pas tous identiques, mais Home et Contact utilisent un niveau `text-6xl` desktop qui doit rester réservé aux vraies introductions. Sur mobile, `text-4xl` ou `text-5xl` peut produire plusieurs lignes et une hauteur excessive selon la longueur du contenu. Le code prévoit des breakpoints, mais les largeurs 320–390 px nécessitent une vérification réelle.

`PageHeading` est plus maîtrisé avec `text-4xl md:text-5xl`. `SectionHeader` à `text-3xl md:text-4xl` donne une forte présence aux H2 ; il ne doit pas être placé trop près d'un H1 `4xl` sans respiration suffisante.

## 6. Corps, contrôles et chiffres

`text-base` et `text-lg` sont employés de façon globalement pertinente : `base` pour le corps courant et `lg` pour les introductions. `text-sm` sert à la fois aux descriptions secondaires, métadonnées et contrôles ; cette polyvalence est acceptable, mais les paragraphes importants ne devraient pas descendre en `sm`.

`Button` impose `text-sm`, avec `text-xs` pour `sm`. Cette échelle est cohérente avec les hauteurs `h-9`, `h-8` et `h-10`. Les inputs génériques utilisent `text-base` puis `md:text-sm`, choix lisible sur mobile mais légèrement plus petit sur desktop.

Les statistiques Home en `2xl/3xl` et le `StatsCard` en `2xl` dominent suffisamment leur label. Le score de compatibilité en `2xl` est proportionné à un indicateur secondaire. Aucun chiffre ne nécessite d'être rendu artificiellement plus grand.

## 7. Composants réutilisés

- `Button` fournit une base stable et n'impose pas de titres surdimensionnés.
- `CardDescription` impose `text-sm`, adapté aux descriptions secondaires mais trop petit pour un contenu éditorial principal.
- `JobCard` utilise l'entreprise en `sm`, le titre en `lg` puis `xl` et les métadonnées en `sm` : hiérarchie claire, avec densité élevée mais fonctionnelle.
- `Header` utilise `text-sm` pour la navigation et `[10px]` pour « Group » : le micro-label de marque est acceptable.
- `SectionHeader` est le composant le plus susceptible de rendre les H2 trop présents, surtout lorsqu'il précède déjà un hero visuellement fort.
- `PageHeading` est la référence la plus équilibrée pour une introduction de page.
- Les formulaires utilisent `text-sm` pour labels et contrôles, `text-base` pour certains champs mobiles : cohérent et accessible.

## 8. Responsive

Points de risque détectés par le code :

- Home et Contact : H1 `4xl` à `6xl`, potentiellement trop hauts à 320–390 px.
- Blog : H1 `4xl/5xl` et sous-titre `lg`, à vérifier avec le rail horizontal featured.
- Job detail : titres `3xl/4xl` et listes longues ; vérifier les retours à la ligne.
- Jobs : `text-sm` des filtres et métadonnées reste approprié, mais les boutons icon-only doivent être testés au doigt.
- Admin/candidat : micro-labels `[8px]–[10px]` à vérifier avec zoom et petits écrans.

Les breakpoints `sm`, `md` et `lg` sont nombreux et généralement cohérents. Aucun `clamp()` de taille de texte mal calibré n'est visible. Tests réels nécessaires à 320, 375, 390, 768, 1024 px et desktop large.

## 9. Échelle cible proposée

Cette échelle rationalise les valeurs déjà présentes, sans imposer une nouvelle police ni une nouvelle échelle radicale.

| Niveau | Desktop | Mobile | Usage |
|---|---|---|---|
| Display exceptionnel | `5xl/6xl` | `4xl` | Hero Home ou Contact seulement. |
| H1 | `4xl/5xl` | `3xl/4xl` | Titre principal de page. |
| H2 | `3xl` | `2xl` | Section structurante. |
| H3 | `xl/2xl` | `xl/2xl` | Sous-section, étape, bloc métier. |
| Body large | `lg` | `base` | Introduction ou description prioritaire. |
| Body | `base` | `base` | Texte courant. |
| Small | `sm` | `sm` | Métadonnée, aide, description secondaire. |
| Caption | `xs` | `xs` | Label, badge, date compacte. |
| Micro | `10–11px` | `10–11px` | Admin dense ou marque secondaire uniquement. |

## 10. Évaluation et verdict

| Critère | Note /10 |
|---|---:|
| Hiérarchie | 7.5 |
| Cohérence entre pages | 7 |
| Lisibilité | 7.5 |
| Rapport titres / contenus | 7 |
| Responsive | 6.8 |
| Professionnalisme typographique | 7.4 |
| Cohérence Design System | 7.5 |

**Verdict : PARTIELLEMENT.** Les tailles donnent une hiérarchie professionnelle dans la majorité des parcours, mais Home, Contact et certains services utilisent encore des niveaux de hero trop généreux pour des sections non exceptionnelles.

**Qualité typographique actuelle : 74/100**

**Nombre de corrections réellement nécessaires : 6**

## À CORRIGER

1. Réserver `text-6xl` aux heroes réellement prioritaires, surtout `ContactPage.tsx`.
2. Réduire le titre CTA final de `HomePage.tsx` pour qu'il ne concurrence pas le hero.
3. Vérifier les H2 `SectionHeader` en `3xl/4xl` face aux H1 locaux.
4. Maintenir les descriptions importantes en `text-base` ou `text-lg`, pas `text-sm`.
5. Remplacer progressivement les badges publics `[11px]` par `text-xs` lorsque le rendu reste identique.
6. Relever les micro-labels admin `[8px]–[9px]` si leur lecture réelle est difficile.

## À SURVEILLER

- Retours à la ligne des H1 à 320–390 px.
- Hauteur cumulée des heroes Contact, Blog et Home.
- Titres H3 `2xl` dans les séquences BPO.
- Cohérence des `text-sm` entre métadonnées, descriptions et contrôles.
- Lisibilité des interfaces admin/candidat à zoom élevé.

## À NE PAS TOUCHER

- La base Inter / Plus Jakarta Sans.
- `Button` et ses tailles standard actuelles.
- La hiérarchie `JobCard` entreprise `sm`, titre `lg/xl`, métadonnées `sm`.
- Les statistiques `2xl/3xl` et le score de compatibilité `2xl`.
- Les textes courants `base` et introductions `lg` lorsqu'ils servent réellement la lecture.
