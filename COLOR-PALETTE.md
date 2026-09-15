# Palette de couleurs EmploiPlus Group

Aperçu des couleurs actuellement utilisées dans l’interface.

> Les carrés colorés sont visibles dans l’aperçu Markdown de VS Code (`Ctrl+Shift+V`).

## Palette de marque

| Couleur | Aperçu | Valeur | Usage |
|---|---|---|---|
| Bleu principal | 🟦 | `#1B2CE3` | Boutons principaux, liens, icônes, marque |
| Bleu profond | 🔵 | `#000079` | Hero, fonds foncés, dégradés |
| Or secondaire | 🟨 | `#E8A900` | Boutons secondaires, accents, indicateurs |
| Blanc | ⬜ | `#FFFFFF` | Texte sur fond foncé, cartes, fonds |
| Noir | ⬛ | `#000000` | Texte sur fond secondaire |
| Bleu du dégradé | 🔷 | `#1B2CE3` | Départ du nouveau dégradé de marque |


## degrader des cartes et boutons


## Couleurs sémantiques

| Token | Aperçu | Valeur | Usage |
|---|---|---|---|
| Background | ⬜ | `oklch(0.985 0.008 250)` | Fond général clair |
| Foreground | 🔷 | `oklch(0.18 0.04 255)` | Texte principal |
| Card | ⬜ | `oklch(0.998 0.006 250)` | Fonds des cartes |
| Muted | ◻️ | `oklch(0.965 0.012 250)` | Fonds atténués |
| Muted foreground | 🔘 | `oklch(0.5 0.03 255)` | Texte secondaire |
| Border | ▫️ | `oklch(0.9 0.014 250)` | Bordures et séparateurs |
| Destructive | 🟥 | `oklch(0.58 0.22 27)` | Erreurs et suppressions |
| Success | 🔷 | `#1B2CE3` / `var(--primary)` | Succès, validations et confirmations |
| Warning | 🔷 | `#1B2CE3` / `var(--primary)` | Alertes et avertissements |
| Sidebar | ⬛ | `oklch(0.15 0.08 264)` | Navigation latérale |

## Couleurs des réseaux sociaux

| Réseau | Aperçu | Valeur |
|---|---|---|
| WhatsApp | 🟩 | `#25D366` |
| Facebook | 🔵 | `#1877F2` |
| LinkedIn | 🔷 | `#0A66C2` |

## Couleurs spécifiques repérées

| Contexte | Aperçu | Valeur |
|---|---|---|
| Blog arrière-plan | ⬜ | `oklch(0.985 0.008 250)` / `bg-background` |
| Blog bordures | ▫️ | `oklch(0.9 0.014 250)` / `border-border` |
| Blog texte secondaire | 🔘 | `oklch(0.5 0.03 255)` / `text-muted-foreground` |
| Rouge erreur | 🟥 | `#DC2626` |
| Rouge pâle | 🩷 | `#FECACA` |
| Jaune CV | 🟨 | `#FFD52F` |
| Or CV | 🟨 | `#E6BD00` |
| Vert dashboard | 🟩 | `#22C55E` |
| Gris très clair | ◻️ | `#F8FAFC` |
| Gris clair | ◽ | `#E2E8F0` |
| Gris moyen | 🔘 | `#94A3B8` |
| Gris bleu | 🔘 | `#64748B` |
| Gris foncé | ◾ | `#334155` |

## Dégradés utilisés

| Nom | Rôle | Code / emplacement |
|---|---|---|
| `gradient-brand` | Dégradé officiel de marque pour fonds et composants principaux | `linear-gradient(135deg, var(--brand-deep) 0%, var(--brand) 60%, var(--accent) 120%)` — [styles.css](src/styles.css#L676) |
| `gradient-text-brand` | Dégradé appliqué au texte de marque | `linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)` — [styles.css](src/styles.css#L685) |
| Dégradé bleu marque | Boutons, cartes et blocs visuels de l’accueil, de la page À propos et des modèles CV | `linear-gradient(135deg, #1B2CE3 0%, #000079 100%)` — [HomePage.tsx](src/pages/public/HomePage.tsx#L472), [AboutPage.tsx](src/pages/public/AboutPage.tsx#L120), [CandidateCreateCVPage.tsx](src/pages/candidate/CandidateCreateCVPage.tsx#L584) |
| Dégradé overlay hero | Assombrir les images hero des quatre pages de services pour garantir la lisibilité du texte | `linear-gradient(90deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.68) 42%, rgba(15, 23, 42, 0.35) 100%)` — [SolutionsEntreprisePage.tsx](src/pages/public/services/SolutionsEntreprisePage.tsx#L181) |
| Dégradé overlay blog | Assombrir le bas des images d’articles pour afficher le titre | `bg-gradient-to-t from-black/75 via-black/15 to-transparent` — [BlogPage.tsx](src/pages/public/BlogPage.tsx#L65) |
| Dégradé overlay article | Assombrir l’image principale d’un article détaillé | `bg-gradient-to-t from-[#000079]/95 via-[#000079]/25 to-transparent` — [BlogPostDetailPage.tsx](src/pages/public/BlogPostDetailPage.tsx#L224) |
| Dégradé hero contact | Fond sombre principal de la page Contact | `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800` — [ContactPage.tsx](src/pages/public/ContactPage.tsx#L82) |
| Halo contact or | Halo décoratif derrière le hero Contact | `radial-gradient(circle at 20% 50%, rgba(232, 169, 0, 0.15), transparent 50%)` — [ContactPage.tsx](src/pages/public/ContactPage.tsx#L88) |
| Halo contact bleu | Second halo décoratif du hero Contact | `radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1), transparent 50%)` — [ContactPage.tsx](src/pages/public/ContactPage.tsx#L89) |
| Halo Hub candidat | Deux halos décoratifs bleu et or | `radial-gradient(circle at top left, rgba(0, 0, 158, 0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(232, 169, 0, 0.08), transparent 28%)` — [HubCandidatPage.tsx](src/pages/public/services/HubCandidatPage.tsx#L77) |
| Surface glow | Fond avec halo bleu supérieur réutilisable | `radial-gradient(80% 50% at 50% 0%, oklch(0.41 0.28 264 / 0.15), transparent 60%), var(--background)` — [styles.css](src/styles.css#L689) |
| Dégradé cartes blog | Fond de remplacement quand un article n’a pas d’image | `bg-gradient-to-br from-secondary/20 to-brand/10` — [BlogPage.tsx](src/pages/public/BlogPage.tsx#L158) |
| Dégradé liste blog | Fond de la zone listant tous les articles | `bg-gradient-to-b from-white via-slate-50 to-white` — [BlogPage.tsx](src/pages/public/BlogPage.tsx#L211) |
| Dégradé fiche emploi | Fond léger des blocs d’informations d’une offre | `bg-gradient-to-br from-background via-card to-primary/5` — [JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx#L467) |
| Dégradé dashboard candidat | Bandeau sombre de l’espace candidat | `bg-gradient-to-r from-slate-900 to-slate-800` — [CandidateDashboardPage.tsx](src/pages/candidate/CandidateDashboardPage.tsx#L495) |
| Dégradé KPI admin | Fond des cartes KPI de l’administration | `bg-gradient-to-br from-white via-slate-50 to-slate-100` — [AnalyticsKPICards.tsx](src/pages/admin/components/AnalyticsKPICards.tsx#L48) |
| Dégradé barre KPI admin | Barre colorée en haut des cartes KPI | `bg-gradient-to-r from-slate-900/80 via-slate-500 to-slate-300` — [AnalyticsKPICards.tsx](src/pages/admin/components/AnalyticsKPICards.tsx#L50) |
| Dégradé onboarding | Fond de l’écran d’introduction candidat | `bg-gradient-to-br from-slate-50 via-white to-blue-50` — [CandidateOnboardingPage.tsx](src/pages/candidate/CandidateOnboardingPage.tsx#L146) |
| Dégradé cartes services | Fond des cartes du parcours candidat | `bg-gradient-to-br from-slate-50 to-white` — [CandidateDiscoverySection.tsx](src/pages/public/services/CandidateDiscoverySection.tsx#L41) |
| Dégradé sombre workflow | Fond des étapes de workflow entreprise | `bg-gradient-to-br from-slate-900 to-slate-800` — [EnterpriseWorkflowSection.tsx](src/pages/public/services/EnterpriseWorkflowSection.tsx#L15) |
| Dégradé jauge admin | Jauge circulaire et barre de progression de l’administration | `conic-gradient(#22C55E ${score * 3.6}deg, rgba(148, 163, 184, 0.15) 0deg)` et `linear-gradient(to right, #22D3EE, #34D399)` — [AdminHomePage.tsx](src/pages/admin/AdminHomePage.tsx#L293) |

### Remarque sur les codes Tailwind

Les codes comme `from-brand/5`, `via-card`, `to-secondary/5` sont des dégradés utilisant les variables globales du thème. Leur couleur finale dépend donc de `--brand`, `--secondary`, `--card`, `--background` et des niveaux de transparence associés.

## Résumé

La direction dominante actuelle est :

- **Bleu profond** pour la marque et les actions principales
- **Or** pour les actions secondaires et les accents
- **Blanc et gris bleutés** pour les fonds et cartes
- **Couleurs dédiées** pour les réseaux sociaux, le blog et les modèles de CV

Les couleurs globales sont définies dans [`src/styles.css`](src/styles.css). Plusieurs couleurs spécifiques sont encore écrites directement dans les composants et pourraient être remplacées par des tokens globaux lors d’une future harmonisation.
