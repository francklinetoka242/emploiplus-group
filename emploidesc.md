# Analyse Front-End — Page « Postuler » (inventaire)

Ce document rassemble l'analyse complète du Front‑End existant relative à la création d'une page "Postuler". Il liste les champs affichés, les données disponibles (même si non affichées), les actions existantes et les composants UI réutilisables.

**Remarque**: Aucune modification de fichier et aucune proposition d'implémentation n'ont été faites — ceci est une analyse uniquement.

**1. Carte d'offre (JobCard)**

- Fichier principal: [src/components/site/JobCard.tsx](src/components/site/JobCard.tsx#L1-L200)
- Props exposées par le composant (`JobCardProps`):
  - `job` (objet) — l'offre entière telle que fournie par le hook
  - `location` (string) — affichage formaté de la localisation
  - `previewText` (string) — extrait à afficher
  - `contractLabel` (string | null) — label lisible du type de contrat
  - `tags` (string[]) — tags à afficher
  - `deadlineValue` (string | null) — date limite/expiration
  - `isExpired` (boolean) — drapeau d'expiration
  - `t?` (fonction de traduction)
  - `index?` (number) — pour délai d'animation

- Champs affichés sur la carte:
  - Entreprise (`job.company`)
  - Titre du poste (`job.title`)
  - Type de contrat (`contractLabel`) — badge en haut à droite
  - Localisation (`location`) — zone avec icône `MapPin`
  - Date limite (si `deadlineValue`) — affichée avec icône `CalendarDays` et état "Expirée" si applicable
  - Salaire (`job.salary`) — s'il est présent
  - Extrait de description / preview (`previewText`) — texte tronqué
  - Tags (liste courte)
  - Actions visuelles: bouton `Voir plus`, bouton `Postuler` (ouvre options), bouton `Partager` (`ShareButtons`)

- Actions disponibles:
  - `Voir plus` : lien interne vers `/jobs/{job.slug}`
  - `Postuler` : bouton qui affiche un menu d'options d'application (dans `JobCard` les options générées sont :
    - `mailto:` si `job.application_email` présent
    - lien externe (`job.external_link`) si présent
    - Remarque: `job.application_whatsapp` n'est pas utilisé par `JobCard` (présent dans la page détail)
  - `Partager` : via le composant `ShareButtons` (copie du lien, WhatsApp/Facebook/LinkedIn etc.)

- Données présentes mais non affichées directement sur la carte (exemples):
  - `job.slug` (utilisé pour le lien, mais pas visible)
  - `job.company_logo` (pas rendu comme image dans la carte)
  - `job.cover_image` / `job.og_image` (non affichés)
  - `job.application_whatsapp` (non utilisé ici)
  - `job.updated_at`, `meta_title`, `meta_description` (pas visibles)

**2. Page de détail d'une offre**

- Fichier principal: [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx#L1-L400)
- Route: `/jobs/:slug` (définie dans `App.tsx`)

- Données reçues (via `useJobOfferBySlug`) — objet `job` contenant (liste non exhaustive, basée sur le type `JobOfferDetail`):
  - `id`, `slug`, `title`, `company`, `company_logo`
  - `contract_type`, `location_city`, `location_country`
  - `description`, `requirements`
  - `status`, `publish_at`, `expires_at`, `updated_at`
  - `application_email`, `application_whatsapp`, `external_link`
  - `cover_image`, `meta_title`, `meta_description`, `og_image`
  - `salary`, `deadline`, `tags`

- Champs affichés explicitement par la page de détail:
  - Titre (`job.title`)
  - Entreprise (`job.company`)
  - Localisation (concat `location_city`, `location_country` ou "Remote")
  - Type de contrat (libellé traduit/fallback)
  - Description courte (méta / extrait)
  - Description complète (`job.description`, rendu avec `whitespace-pre-line`)
  - Profil recherché / exigences (découpé par lignes depuis `job.requirements`)
  - Tags (liste)
  - Aperçu des informations (cartes): entreprise, localisation, type de contrat, salaire, date de publication, date limite
  - Section de candidature (aside) avec boutons:
    - `Envoyer par email` si `job.application_email`
    - `Contacter via WhatsApp` si `job.application_whatsapp`
    - `Postuler sur le site` si `job.external_link`
    - message d'aide si aucun canal configuré
  - Bouton `Partager` (via `ShareButtons`) avec partage des métadonnées

- Données reçues mais non nécessairement rendues visuellement:
  - `company_logo` (présent dans les données mais non affiché comme image dans l'en-tête)
  - `cover_image` / `og_image` (utilisés pour SEO/OG mais pas toujours rendus en grand sur la page)
  - `meta_title`, `meta_description` (utilisés dans `SEO` mais pas affichés directement)
  - `id`, `updated_at`, `expires_at` (utilisés pour SEO/structuredData mais pas visibles)

**3. Informations du candidat connecté**

- Hook principal: [src/hooks/useCandidate.ts](src/hooks/useCandidate.ts#L1-L200) — expose `profile`, `loading`, `error`, `logout`, `updateProfile`, `refetch`, `isAuthenticated`.
- Type central: `CandidateProfile` défini dans [src/integrations/supabase/candidate-auth.ts](src/integrations/supabase/candidate-auth.ts#L1-L120)

- Champs disponibles pour le candidat (`CandidateProfile`):
  - `id` (UUID)
  - `user_id` (UUID lié à Supabase Auth)
  - `first_name` (prénom)
  - `last_name` (nom)
  - `email`
  - `phone`
  - `avatar_url` (photo)
  - `bio` (biographie)
  - `headline` (titre professionnel)
  - `location_city`, `location_country`
  - `date_of_birth`
  - `status` (ex: active)
  - `created_at`, `updated_at`

- Données liées au candidat (via `CandidateAuthService`):
  - Expériences (`candidate_experience`): `job_title`, `company`, `description`, `start_date`, `end_date`, `is_current`, ...
  - Formations (`candidate_education`): `school`, `degree`, `field_of_study`, ...
  - Compétences (`candidate_skills`)
  - Langues (`candidate_languages`)
  - Préférences (`candidate_preferences`)
  - Candidatures (`job_applications`) retournées par `getCandidateApplications` => chaque entrée contient :
    - `id`, `status`, `cover_letter`, `applied_at`, `updated_at`
    - jointure `job_offers:job_offer_id(...)` avec `id`, `title`, `company`, `location_city`, `contract_type`, `salary`
  - Offres enregistrées (`candidate_saved_offers`) retournées par `getCandidateSavedOffers` => `id`, `saved_at`, jointure `job_offers`

**4. Documents du candidat (page "Mes Documents")**

- Fichier principal: [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx#L1-L400)
- Stockage côté front:
  - Les documents (CV + documents complémentaires) sont conservés localement dans `localStorage` sous la clé `emploiplus-candidate-documents-{profile.id}` (cf. `useEffect`)
  - Upload réel via `uploadFileToStorage(...)` (voir [src/lib/supabase-storage.ts](src/lib/supabase-storage.ts#L1-L120))

- Types de documents gérés (liste dans la page):
  - `motivation` (Lettre de motivation)
  - `diploma` (Diplôme)
  - `certificate` (Certificat)
  - `attestation` (Attestation)
  - `portfolio` (Portfolio)
  - `other` (Autre) — permet de fournir un label personnalisé
  - `recepisse` (Récépissé ACPE)

- Métadonnées conservées / affichées pour chaque document:
  - `id` (local, ex: `doc-${Date.now()}`)
  - `type` (parmi les types ci‑dessus)
  - `name` (nom du fichier)
  - `displayName` (label pour affichage)
  - `date` (ISO string)
  - `size` (formaté, ex: `512 KB`)
  - `url` (URL retournée par Supabase Storage)
  - `customType` (si `other`)

- Actions disponibles dans l'UI:
  - Aperçu (ouvre `doc.url` dans une nouvelle fenêtre)
  - Télécharger (ouvre `doc.url` — même action que Aperçu)
  - Supprimer (supprime de la liste locale / `localStorage`)
  - Remplacer le CV (upload via input de type `file` acceptant `application/pdf`)
  - Ajouter un document (sélection du type + upload PDF)

- Contraintes / validations côté front:
  - Format accepté: `application/pdf` uniquement (`ALLOWED_DOCUMENT_MIME_TYPES`)
  - Taille maximale: `2 Mo` (`MAX_DOCUMENT_SIZE_BYTES`)
  - Upload fait via `uploadFileToStorage(file, folder, bucket)` qui renvoie une URL

**5. Navigation & accès aux offres**

- Routes importantes (extrait de [src/App.tsx](src/App.tsx#L1-L220)):
  - Page liste: `/jobs` — `JobsPage` ([src/pages/public/JobsPage.tsx](src/pages/public/JobsPage.tsx#L1-L200))
  - Détail: `/jobs/:slug` — `JobOfferDetailPage`
  - Candidate area: `/candidate` protégé par `ProtectedCandidateRoute` et routes internes (`/candidate/Mes-Documents`, `/candidate/applications`, `/candidate/saved-offers`, etc.)

- Comment un candidat accède à une offre:
  - Via la liste des offres (`JobsPage`) qui rend une liste de `JobCard`
  - `JobCard` propose un lien `Voir plus` vers `/jobs/{slug}`
  - Dans la page de détail, les boutons de candidature redirigent vers le canal configuré (email, WhatsApp, lien externe)

- Boutons/actions déjà présents:
  - `Voir plus` (link)
  - `Postuler` (ouvre options mailto / lien externe dans la card; détail page propose boutons dédiés pour email/WhatsApp/lien)
  - `Partager` (ShareButtons)
  - Dans l'espace candidat: `Voir` / `Retirer` / `Supprimer` (candidatures & offres enregistrées)

**6. Design System — composants réutilisables identifiés**

- Emplacement principal des composants UI: `src/components/ui/`.
- Composants réutilisables utilisés dans les pages candidat/offres (exemples):
  - `Button` — [src/components/ui/button.tsx](src/components/ui/button.tsx#L1-L120)
  - `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription` — [src/components/ui/card.tsx](src/components/ui/card.tsx#L1-L120)
  - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogDescription` — [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx#L1-L140)
  - `Alert`, `AlertDescription` — [src/components/ui/alert.tsx](src/components/ui/alert.tsx#L1-L120)
  - `Input` — [src/components/ui/input.tsx](src/components/ui/input.tsx#L1-L80)
  - `Label` — [src/components/ui/label.tsx](src/components/ui/label.tsx#L1-L80)
  - `Table`, `TableRow`, `TableCell`, `TableHead` — [src/components/ui/table.tsx](src/components/ui/table.tsx#L1-L200)
  - `Badge` — utilisé dans `CandidateApplicationsPage` (visual status)
  - `ShareButtons` — [src/components/site/ShareButtons.tsx](src/components/site/ShareButtons.tsx#L1-L200)
  - `JobCard` — composant carte déjà stylé et prêt à l'emploi
  - Composants de feedback/chargement: `skeleton` / loaders (présents dans `src/components/ui`)

- Éléments d'interface visibles et patterns récurrents à réutiliser:
  - Cartes (`Card`) pour encadrer sections (description, candidature, informations utiles)
  - Boutons arrondis / badges pour CTA
  - Dialog/modal pour les formulaires de chargement de documents
  - Zone de upload (input type=file) avec validations côté front
  - Tables pour listes (candidatures, offres enregistrées)
  - `ShareButtons` pour le partage d'offre

**7. Conclusion — Inventaire réutilisable pour la page "Postuler"**
Ci‑dessous la liste des éléments déjà disponibles dans le Front‑End et directement réutilisables pour construire une page "Postuler" cohérente:

- Données d'offre disponibles (via `useJobOfferBySlug` / hooks):
  - `id`, `slug`, `title`, `company`, `company_logo`, `contract_type`, `location_city`, `location_country`, `description`, `requirements`, `publish_at`, `expires_at`, `updated_at`, `salary`, `deadline`, `tags`, `application_email`, `application_whatsapp`, `external_link`, `cover_image`, `meta_title`, `meta_description`, `og_image`

- Composants UI réutilisables:
  - `JobCard` (affichage résumé)
  - `ShareButtons` (partage)
  - `Card`, `Button`, `Dialog`, `Input`, `Label`, `Alert`, `Table`, `Badge`, `Skeleton` (chargement), `Table` (listes)

- Utilitaires & hooks:
  - `usePublishedJobOffers`, `useJobOfferBySlug` (hooks de lecture d'offres)
  - `useCandidate` (profil connecté)
  - `CandidateAuthService` (fonctions métier côté client: accès candidatures, sauvegarde, applyToJob disponible côté service)
  - `uploadFileToStorage`, `ALLOWED_DOCUMENT_MIME_TYPES`, `MAX_DOCUMENT_SIZE_BYTES` (gestion upload documents)

- Pages / routes à connaître:
  - `/jobs` (liste) — `JobsPage` ([src/pages/public/JobsPage.tsx](src/pages/public/JobsPage.tsx#L1-L200))
  - `/jobs/:slug` (détail) — `JobOfferDetailPage` ([src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx#L1-L400))
  - Espace candidat protégé: `/candidate/...` (ex: `/candidate/Mes-Documents`, `/candidate/applications`, `/candidate/saved-offers`)

Cette liste devrait permettre de concevoir l'interface "Postuler" en réutilisant les composants et données existantes pour garantir cohérence visuelle et comportementale.

---

Fichiers consultés (extraits utiles):

- [src/components/site/JobCard.tsx](src/components/site/JobCard.tsx#L1-L200)
- [src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx#L1-L400)
- [src/pages/public/JobsPage.tsx](src/pages/public/JobsPage.tsx#L1-L220)
- [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx#L1-L400)
- [src/hooks/usePublishedOffers.ts](src/hooks/usePublishedOffers.ts#L1-L200)
- [src/integrations/supabase/candidate-auth.ts](src/integrations/supabase/candidate-auth.ts#L1-L160)
- [src/hooks/useCandidate.ts](src/hooks/useCandidate.ts#L1-L200)
- [src/lib/supabase-storage.ts](src/lib/supabase-storage.ts#L1-L120)
- [src/components/ui/button.tsx](src/components/ui/button.tsx#L1-L120)
- [src/components/ui/card.tsx](src/components/ui/card.tsx#L1-L120)
- [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx#L1-L140)
- [src/components/ui/alert.tsx](src/components/ui/alert.tsx#L1-L120)
