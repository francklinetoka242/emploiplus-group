**Rapport technique — Gestion des CV**

Objectif: décrire uniquement l'organisation actuelle des fichiers, la configuration des styles et les composants réutilisables liés aux templates CV.

**Organisation des fichiers**
- **Données & catalogues :** [src/data/cvTemplates.ts](src/data/cvTemplates.ts)
  - Définit l'interface `CVTemplate`, la liste `cvTemplates`, les catégories et la fonction `getCvTemplateById`.
  - Génère les images d'aperçu (`thumbnail` / `preview`) via des fonctions `buildPreviewSvg`/`buildCorporatePreviewSvg` (SVG encodé).

- **Composants UI liés aux templates :** (dossier central)
  - [src/components/Template-CV/CVTemplateGrid.tsx](src/components/Template-CV/CVTemplateGrid.tsx)
  - [src/components/Template-CV/CVTemplateCard.tsx](src/components/Template-CV/CVTemplateCard.tsx)
  - [src/components/Template-CV/CVTemplateHeader.tsx](src/components/Template-CV/CVTemplateHeader.tsx)
  - [src/components/Template-CV/CVTemplateSearch.tsx](src/components/Template-CV/CVTemplateSearch.tsx)
  - [src/components/Template-CV/CVTemplateFilters.tsx](src/components/Template-CV/CVTemplateFilters.tsx)
  - [src/components/Template-CV/NoCVTemplate.tsx](src/components/Template-CV/NoCVTemplate.tsx)

- **Templates (implémentation complète de rendu & éditeur)**
  - [src/components/Template-CV/ProfessionalVioletTemplate.tsx](src/components/Template-CV/ProfessionalVioletTemplate.tsx)
  - [src/components/Template-CV/ProfessionalCorporateTemplate.tsx](src/components/Template-CV/ProfessionalCorporateTemplate.tsx)
  - Ces fichiers contiennent l'éditeur (formulaire) ET la prévisualisation imprimable/exportable du CV.

- **Pages utilisatrices**
  - [src/pages/candidate/CandidateCreateCVPage.tsx](src/pages/candidate/CandidateCreateCVPage.tsx) — liste/selection des templates
  - [src/pages/candidate/CandidateCreateCVEditorPage.tsx](src/pages/candidate/CandidateCreateCVEditorPage.tsx) — route d'édition qui instancie le template choisi


**Configuration des styles et des formats**
- **Système global de styles :**
  - [src/styles.css](src/styles.css) contient la base des tokens (couleurs, radius, polices) via variables CSS (`--font-sans`, `--primary`, `--accent`, etc.).
  - Le projet utilise Tailwind (import `@import "tailwindcss"`) et des utilitaires personnalisés (`@utility ...`).
  - Polices : variables `--font-sans` et `--font-display` définies dans `src/styles.css` (ex : `Inter`, `Plus Jakarta Sans`).

- **Couleurs / thèmes :**
  - Tokens de couleurs (ex : `--primary`, `--accent`, `--brand`, `--brand-deep`) définis dans `:root` et override `.dark`.
  - Les templates utilisent deux approches :
    - Aperçus/miniatures : couleurs passées quand on construit les SVG (`buildPreviewSvg` / `buildCorporatePreviewSvg` dans [src/data/cvTemplates.ts](src/data/cvTemplates.ts)).
    - Rendu réel : couleurs et accents souvent hardcodés en inline styles dans les templates (ex : `#6d28d9`, `#f3eefd`, `#0f172a` dans `ProfessionalVioletTemplate.tsx` et `ProfessionalCorporateTemplate.tsx`).

- **Format d'impression / A4 / export PDF :**
  - Chaque template implémente sa logique d'export (`downloadPDF`) :
    - Tente d'utiliser `html2pdf` avec `jsPDF` options `{ unit: "mm", format: "a4", orientation: "portrait" }`.
    - Sinon ouvre une fenêtre imprimable et injecte une feuille `<style>` contenant `@page { size: A4 portrait; margin: 0; }`.
  - Le rendu de la prévisualisation utilise des styles inline pour forcer la taille imprimable : `maxWidth: "210mm"` et `aspectRatio: "210 / 297"` (voir les deux templates).


**Composants réutilisables et articulation**
- Composants réutilisables dédiés à la gestion/choix des templates :
  - `CVTemplateGrid` — grille d'affichage des cards (utilise `CVTemplateCard`).
  - `CVTemplateCard` — carte visuelle d'un template (vignette, catégorie, bouton d'action).
  - `CVTemplateHeader` — petit header animé pour les pages/modales liées aux templates.
  - `CVTemplateSearch` — champ de recherche pour les modèles.
  - `CVTemplateFilters` — filtres/categories pour la liste de modèles.

- Composants/structures présents mais encapsulés dans chaque template :
  - Les templates `ProfessionalVioletTemplate` et `ProfessionalCorporateTemplate` contiennent
    - Un éditeur (formulaire contrôlé par `useState`) pour `personal`, `profile`, `languages`, `skills`, `experiences`, `educations`.
    - Une zone de prévisualisation qui reproduit la mise en page finale (colonne latérale / colonne principale).
    - Des fonctions utilitaires locales (ex: `getInterestIcon`, gestion d'ajout/suppression d'expériences/compétences).
    - Un petit composant local `SectionCard` (déclaré inline) qui encapsule l'UI récurrente des sections éditables.
  - Il n'y a pas, dans le dossier `Template-CV`, de composants atomiques séparés nommés `Header`, `ExperienceItem`, `SkillsList`, etc., exportés globalement — ces blocs sont implémentés localement dans chaque template.


**Faits importants (à garder pour l'analyse)**
- Les données de catalogue (liste des modèles et miniatures) sont centralisées dans `src/data/cvTemplates.ts`.
- La configuration visuelle globale (tokens, polices, thèmes) est dans `src/styles.css` — mais les couleurs spécifiques des templates sont majoritairement codées inline dans les templates.
- Le comportement d'export PDF/A4 est implémenté localement dans chaque template (double stratégie `html2pdf` + fallback window.print avec `@page`), et le sizing se fait via `maxWidth: "210mm"` + `aspectRatio`.
- Les templates mélangent éditeur et rendu (prévisualisation) dans un seul fichier par template, ce qui facilite la copie mais réduit la réutilisabilité des sous-blocs UI.

---
Fichiers clés à consulter rapidement :
- [src/data/cvTemplates.ts](src/data/cvTemplates.ts)
- [src/components/Template-CV/ProfessionalVioletTemplate.tsx](src/components/Template-CV/ProfessionalVioletTemplate.tsx)
- [src/components/Template-CV/ProfessionalCorporateTemplate.tsx](src/components/Template-CV/ProfessionalCorporateTemplate.tsx)
- [src/styles.css](src/styles.css)

Fin du rapport.
