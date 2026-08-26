# Audit design du builder CV

- Stack : React 19 + TypeScript + Vite ; navigation via React Router.
- Styling : Tailwind CSS v4 (imports dans `src/styles.css`) ; pas de CSS modules ni styled-components.
- Composant principal : `src/pages/candidate/CandidateCreateCVPage.tsx`.
- Donnees/formulaire : etat local React `CVData`, champs Input/Textarea ; aucune persistance DB.
- Templates : apercus inline `CVPreview`, `CompactCVPreview` et `TemplateThumbnail` ; donnees additionnelles dans `src/data/cvTemplates.ts`.
- Routes : selection `/candidate/create-cv`, categories `/minimaliste` et `/modern`, editeurs avec `:modelId`.
- UI : composants locaux de style shadcn/Radix dans `src/components/ui` (Card, Button, Dialog, Input, Label, Textarea).
- Icones : `lucide-react` (Eye, Download, Phone, Mail, MapPin, UserRound).
- Design tokens : variables CSS exposees via `@theme inline` dans `src/styles.css` ; couleurs, rayons et ombres en tokens.
- Typographie : Inter pour le texte et Plus Jakarta Sans pour l’affichage, declarees dans `src/styles.css`.
- Mise en page CV : CSS Grid pour le modele deux colonnes, Flex pour les en-tetes/contact ; format A4 via `aspect-ratio`.
- Export : `jsPDF` genere un PDF A4 cote navigateur ; pas de generation serveur ni de print CSS complet.
- Personnalisation exposee : nom, titre, contact, resume, formation, experience et competences ; apercu live, visualisation Dialog et telechargement PDF.
- Non expose actuellement : choix de couleurs/polices, photo, reordonnancement des sections, ajout/suppression dynamique de blocs et sauvegarde.
