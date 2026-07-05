# Analyse du projet - Fonctionnalité de candidature

Ce document synthétise l’architecture actuelle du projet autour des offres d’emploi, des candidats et des documents, sans modifier le code.

## 1. Structure des offres d’emploi

### Table utilisée

- `public.job_offers`

### Colonnes de la table

| Colonne                | Type            | Signification                     | Obligatoire | Remarques                          |
| ---------------------- | --------------- | --------------------------------- | ----------- | ---------------------------------- |
| `id`                   | `UUID`          | Identifiant unique de l’offre     | Oui         | Clé primaire                       |
| `slug`                 | `TEXT`          | Identifiant URL                   | Oui         | Unique, utilisé dans `/jobs/:slug` |
| `title`                | `TEXT`          | Intitulé du poste                 | Oui         | Requis en admin                    |
| `company`              | `TEXT`          | Nom de l’entreprise               | Oui         | Requis en admin                    |
| `company_logo`         | `TEXT`          | URL du logo                       | Non         | Stocké en texte/URL                |
| `location_city`        | `TEXT`          | Ville                             | Non         | Optionnel                          |
| `location_country`     | `TEXT`          | Pays                              | Non         | Optionnel                          |
| `contract_type`        | `contract_type` | Type de contrat                   | Non         | Enum                               |
| `description`          | `TEXT`          | Description du poste              | Oui         | Requis en admin                    |
| `requirements`         | `TEXT`          | Profil recherché                  | Non         | Texte libre                        |
| `application_email`    | `TEXT`          | Email de réception de candidature | Non         | Utilisé comme cible d’envoi        |
| `application_whatsapp` | `TEXT`          | Contact WhatsApp                  | Non         | Optionnel                          |
| `external_link`        | `TEXT`          | Lien externe de candidature       | Non         | Optionnel                          |
| `cover_image`          | `TEXT`          | Image de couverture               | Non         | URL                                |
| `status`               | `job_status`    | Statut de publication             | Oui         | Défaut `draft`                     |
| `publish_at`           | `TIMESTAMPTZ`   | Date de publication               | Non         | Utilisé pour l’affichage public    |
| `expires_at`           | `TIMESTAMPTZ`   | Date d’expiration                 | Non         | Optionnel                          |
| `created_at`           | `TIMESTAMPTZ`   | Date de création                  | Oui         | Défaut `now()`                     |
| `updated_at`           | `TIMESTAMPTZ`   | Date de modification              | Oui         | Mise à jour automatique            |
| `salary`               | `TEXT`          | Salaire                           | Non         | Ajouté par migration               |
| `auto_share`           | `BOOLEAN`       | Diffusion automatique             | Non         | Défaut `false`                     |
| `deadline`             | `TIMESTAMPTZ`   | Date limite de candidature        | Non         | Ajouté par migration               |
| `tags`                 | `TEXT[]`        | Mots-clés / tags                  | Non         | Défaut `[]`                        |
| `published_at`         | `TIMESTAMPTZ`   | Date de publication effective     | Non         | Ajouté par migration               |
| `featured_until`       | `TIMESTAMPTZ`   | Date de mise en avant             | Non         | Ajouté par migration               |
| `meta_title`           | `TEXT`          | Titre SEO                         | Non         | Ajouté par migration               |
| `meta_description`     | `TEXT`          | Description SEO                   | Non         | Ajouté par migration               |
| `og_image`             | `TEXT`          | Image Open Graph                  | Non         | Ajouté par migration               |
| `views_count`          | `INTEGER`       | Comptage de vues                  | Non         | Défaut `0`                         |

### Enums

- `job_status`: `draft`, `published`, `archived`, `expired`, `scheduled`
- `contract_type`: `cdi`, `cdd`, `stage`, `freelance`, `consultance`, `temps_partiel`, `interim`

---

## 2. TypeScript utilisé pour représenter une offre

Le projet utilise principalement les types générés par Supabase, complétés par quelques alias de projection.

### Types / interfaces

| Nom               | Définition                                                     | Propriétés principales                                                                                                                                                                                                                                                                                                                             | Fichier                             |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `JobOfferPreview` | `Pick<Database["public"]["Tables"]["job_offers"]["Row"], ...>` | `id`, `slug`, `title`, `company`, `contract_type`, `location_city`, `location_country`, `description`, `requirements`, `status`, `publish_at`, `salary`, `deadline`, `tags`                                                                                                                                                                        | `src/hooks/usePublishedOffers.ts`   |
| `JobOfferDetail`  | `Pick<Database["public"]["Tables"]["job_offers"]["Row"], ...>` | `id`, `slug`, `title`, `company`, `company_logo`, `contract_type`, `location_city`, `location_country`, `description`, `requirements`, `status`, `publish_at`, `expires_at`, `application_email`, `application_whatsapp`, `external_link`, `cover_image`, `meta_title`, `meta_description`, `og_image`, `updated_at`, `salary`, `deadline`, `tags` | `src/hooks/usePublishedOffers.ts`   |
| `JobCardProps`    | Type local                                                     | `job`, `location`, `previewText`, `contractLabel`, `tags`, `deadlineValue`, `isExpired`, `t`, `index`                                                                                                                                                                                                                                              | `src/components/site/JobCard.tsx`   |
| `JobOffer`        | Alias local basé sur le type Supabase                          | Toutes les colonnes de `job_offers`                                                                                                                                                                                                                                                                                                                | `src/pages/admin/AdminJobsPage.tsx` |

### Type généré Supabase

- `Database["public"]["Tables"]["job_offers"]["Row"]`
- `Database["public"]["Tables"]["job_offers"]["Insert"]`
- `Database["public"]["Tables"]["job_offers"]["Update"]`

---

## 3. Création d’une offre

### Où une offre est créée

Les créations/modifications se font côté administration dans :

- `src/pages/admin/AdminJobsPage.tsx`
- `src/pages/admin/AdminJobCreatePage.tsx`

### Composants utilisés

- formulaire d’administration avec champs pour le titre, l’entreprise, la ville, le contrat, le salaire, la description, l’email de réception, le WhatsApp, le lien externe, les mots-clés, la date limite, le statut et l’image de couverture.

### Services appelés

- client Supabase : `supabase`
- service d’upload d’image : `uploadFileToStorage`

### Fonctions d’enregistrement

Les données sont enregistrées avec :

- `supabase.from("job_offers").insert([...])`
- `supabase.from("job_offers").update(...)`

---

## 4. Lecture des offres

### Requêtes Supabase utilisées

#### Offres publiées

```ts
supabase
  .from("job_offers")
  .select(...)
  .eq("status", "published")
  .order("publish_at", { ascending: false })
  .limit(limit)
```

#### Offre par slug

```ts
supabase.from("job_offers").select("*").eq("slug", slug).single();
```

### Filtres

La page liste applique des filtres côté front dans `src/pages/public/JobsPage.tsx` :

- recherche textuelle sur titre / entreprise / description / exigences
- filtre par entreprise
- filtre par localisation
- filtre par type de contrat

### Tri

- ordre décroissant sur `publish_at`

### Pagination

- taille de page : 8
- pagination côté React via `slice(...)`

---

## 5. Affichage des offres

| Composant                                           | Rôle                                   | Données utilisées                                                                                                                                                                   |
| --------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/site/JobCard.tsx`                   | Carte d’offre publique                 | `title`, `company`, `contract_type`, `location_city`, `location_country`, `salary`, `deadline`, `description`, `requirements`, `tags`, `slug`, `application_email`, `external_link` |
| `src/pages/public/JobsPage.tsx`                     | Liste complète des offres              | offres chargées via hook + filtres + pagination                                                                                                                                     |
| `src/pages/public/HomePage.tsx`                     | Mise en avant des offres sur l’accueil | 2 offres publiées                                                                                                                                                                   |
| `src/pages/public/JobOfferDetailPage.tsx`           | Page détaillée d’une offre             | données complètes de l’offre                                                                                                                                                        |
| `src/pages/admin/AdminJobsPage.tsx`                 | Tableau d’admin des offres             | liste complète des offres                                                                                                                                                           |
| `src/pages/candidate/CandidateApplicationsPage.tsx` | Candidatures du candidat               | jointure avec `job_applications`                                                                                                                                                    |
| `src/pages/candidate/CandidateSavedOffersPage.tsx`  | Offres enregistrées                    | jointure avec `candidate_saved_offers`                                                                                                                                              |

---

## 6. Identifiant de l’entreprise

### Structure actuelle

Il n’existe pas de table `companies` et pas de `company_id` dans `job_offers`.

### Informations stockées

- nom de l’entreprise : colonne `company`
- email : colonne `application_email`
- WhatsApp : colonne `application_whatsapp`
- lien externe : colonne `external_link`
- logo : colonne `company_logo`

### Conséquence pour les candidatures

Le lien entre une offre et son entreprise est réalisé par des champs texte directement stockés dans l’offre.

Pour envoyer une candidature à la bonne adresse, le projet s’appuie actuellement sur :

- `application_email` si présent
- sinon `external_link` ou `application_whatsapp`

---

## 7. Informations affichées sur une offre

### Sur les cartes d’offres

Affichés dans `src/components/site/JobCard.tsx` :

- titre
- entreprise
- type de contrat
- localisation
- date limite
- salaire
- extrait de description / exigences
- tags

### Sur la page de détail

Affichés dans `src/pages/public/JobOfferDetailPage.tsx` :

- titre
- entreprise
- localisation
- contrat
- salaire
- date de publication
- date limite
- description complète
- profil recherché / exigences
- tags
- options de candidature (email / WhatsApp / lien externe)

---

## 8. Côté candidat

### Tables utilisées

- `public.candidates`
- `public.candidate_experience`
- `public.candidate_education`
- `public.candidate_skills`
- `public.candidate_languages`
- `public.candidate_preferences`
- `public.job_applications`
- `public.candidate_saved_offers`

### Interfaces TypeScript

Dans `src/integrations/supabase/candidate-auth.ts` :

- `CandidateProfile`
- `CandidateExperience`
- `CandidateEducation`
- `CandidateSkill`
- `CandidatePreferences`
- `CandidateLanguage`
- `CandidateExperienceInsert`
- `CandidateEducationInsert`
- `CandidateSkillInsert`
- `CandidatePreferencesInsert`
- `CandidateLanguageInsert`

### Informations disponibles sur un candidat

Le profil contient :

- `id`
- `user_id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `avatar_url`
- `bio`
- `headline`
- `location_city`
- `location_country`
- `date_of_birth`
- `status`
- `created_at`
- `updated_at`

### Données annexes

- expériences : `candidate_experience`
- formations : `candidate_education`
- compétences : `candidate_skills`
- langues : `candidate_languages`
- préférences : `candidate_preferences`

---

## 9. Documents du candidat

### Stockage

Les documents ne sont pas stockés dans une table SQL dédiée. Ils sont gérés via :

- Supabase Storage
- stockage local du navigateur via `localStorage`

### Enregistrement

Dans `src/pages/candidate/CandidateCVPage.tsx` :

- le CV est uploadé via `uploadFileToStorage(...)`
- les documents complémentaires sont uploadés de la même façon

### Chemins utilisés

- `candidates/{profile.id}/cv`
- `candidates/{profile.id}/documents`

### Récupération

- l’URL retournée par l’upload est utilisée directement
- les métadonnées sont conservées localement dans `localStorage`

### Métadonnées existantes

- `id`
- `type`
- `name`
- `displayName`
- `date`
- `size`
- `url`
- `customType`

### Point important pour les candidatures

Aucune colonne de liaison n’existe actuellement dans `job_applications` pour rattacher un CV ou un document à une candidature.

---

## 10. Conclusion

### Tables concernées

- `public.job_offers`
- `public.job_applications`
- `public.candidate_saved_offers`
- `public.candidates`
- `public.candidate_experience`
- `public.candidate_education`
- `public.candidate_skills`
- `public.candidate_languages`
- `public.candidate_preferences`

### Composants concernés

- `src/components/site/JobCard.tsx`
- `src/pages/public/JobsPage.tsx`
- `src/pages/public/HomePage.tsx`
- `src/pages/public/JobOfferDetailPage.tsx`
- `src/pages/admin/AdminJobsPage.tsx`
- `src/pages/admin/AdminJobCreatePage.tsx`
- `src/pages/candidate/CandidateCVPage.tsx`
- `src/pages/candidate/CandidateApplicationsPage.tsx`
- `src/pages/candidate/CandidateSavedOffersPage.tsx`

### Services concernés

- `src/hooks/usePublishedOffers.ts`
- `src/integrations/supabase/candidate-auth.ts`
- `src/lib/supabase-storage.ts`

### Points importants à connaître avant une implémentation de candidature

- l’offre est liée à l’entreprise via des champs texte, pas par `company_id`
- l’email de réception est stocké dans `application_email`
- les candidatures sont déjà représentées par `job_applications`
- les documents candidats sont stockés dans Supabase Storage et non dans une table dédiée
- l’interface publique actuelle n’appelle pas encore l’application métier de manière complète ; elle se contente principalement de liens mailto / liens externes
