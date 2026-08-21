# REFAONTE UX/UI — FAQ EMPLOIPLUS GROUP

## Fichiers modifiés
- src/pages/public/FAQPage.tsx

## Changements UX
- la page reprend un parcours plus naturel : introduction courte, recherche, catégories, réponses, aide supplémentaire ;
- le vrai centre de gravité devient les questions et leurs réponses ;
- les blocs de mise en avant ont été fortement réduits pour éviter la surcharge visuelle ;
- les filtres par catégorie sont transformés en navigation plus sobre et plus éditoriale ;
- la recherche reste accessible dès le haut de la page sans détour ;
- le CTA final est conservé, mais repositionné comme une aide utile plutôt qu’un bloc marketing artificiel.

## Changements UI
- suppression de la surabondance de cartes, d’icônes décoratives et d’éléments presque template-like ;
- réduction des gradients et des effets de profondeur excessifs ;
- adoption d’une structure plus claire avec séparation nette entre sections ;
- utilisation d’une ligne et d’une typographie plus forte pour créer de la hiérarchie ;
- accent mis sur la lisibilité et le “respiration” de la page ;
- accordéon plus minimaliste, plus lisible, plus premium.

## Utilisation de la couleur primaire
- primaire #00009e conservée comme couleur dominante de l’identité ;
- utilisée pour les éléments structurants, le CTA principal et les états actifs importants ;
- maintient la cohérence avec la charte EmploiPlus Group.

## Utilisation de la couleur secondaire
- secondaire #e8a900 utilisée avec parcimonie comme signal visuel ;
- appliqué à un repère visuel de catégorie et à un léger accent d’attention ;
- sert à guider l’œil sans saturer la page.

## Éléments supprimés ou simplifiés
- cartes d’accroche “Compte / Services / Confiance” fortement allégées en poids visuel ;
- blocs décoratifs et effets de surface inutiles ;
- nombreux arrondis excessifs et ombres répétées ;
- styles trop “SaaS” autour des filtres et des sections ;
- éléments visuellement chargés qui détournaient l’attention de la FAQ.

## Vérifications effectuées
- contrôle de la recherche : conservée et fonctionnelle ;
- contrôle des catégories : conservées et actives ;
- contrôle des accordéons : conservés et lisibles ;
- contrôle du CTA contact : conservé ;
- contrôle de la compatibilité TypeScript : validation via `npx tsc --noEmit`.

## Problèmes restants
- la page reste très dépendante du système de design actuel ;
- la refonte est plus sobre et plus premium, mais certains contenus restent encore très “data-driven” selon la structure des FAQ ;
- une future passe peut encore améliorer la personnalisation éditoriale des catégories et des titres.

## Verdict
La FAQ a été transformée en une page plus distinguée, plus sérieuse et plus humaine. Elle garde toutes les fonctions essentielles, tout en évitant la sensation de template IA. Le résultat est plus cohérent avec l’identité EmploiPlus Group, avec une hiérarchie plus forte et une présentation plus mature.
