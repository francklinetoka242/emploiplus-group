# Audit technique — gestion des formulaires dans le projet

Date : 2026-07-11

## Résumé exécutif

Le projet repose majoritairement sur des formulaires React contrôlés manuellement, avec des states locaux et des fonctions de validation écrites à la main. La logique de formulaire est souvent intégrée directement dans les pages ou dans des hooks dédiés, plutôt que dans un système formuel centralisé.

Le point important est que la bibliothèque React Hook Form est présente dans les dépendances et qu’un wrapper générique existe dans [src/components/ui/form.tsx](src/components/ui/form.tsx), mais elle n’est pas utilisée dans les flows réels observés. Zod est aussi présent dans les dépendances, mais il n’est pas utilisé pour la validation des formulaires actuellement.

---

## 1. Bibliothèques utilisées

### Bibliothèques réellement présentes

- React Hook Form : présent dans package.json et utilisé via un wrapper générique dans [src/components/ui/form.tsx](src/components/ui/form.tsx).
- Zod : présent dans package.json, mais aucune utilisation observée pour la validation de formulaires dans les pages du projet.
- @hookform/resolvers : présent dans package.json, mais aucune utilisation observée.

### Bibliothèques non utilisées pour les formulaires

- Formik : aucune trace dans le code.
- Yup : aucune trace dans le code.
- Joi : aucune trace dans le code.
- Vest : aucune trace dans le code.
- TanStack Form : aucune trace dans le code.

### Approche dominante

Le projet utilise principalement :

- useState
- useReducer de façon très limitée, voire absente pour les formulaires
- des fonctions de validation maison
- des services et hooks personnalisés

---

## 2. Architecture des formulaires

### Pattern dominant : formulaires contrôlés avec useState

C’est le schéma le plus fréquent.

Exemples principaux :

- Authentification candidat : [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx), [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx), [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx), [src/pages/candidate/CandidateForgotPasswordPage.tsx](src/pages/candidate/CandidateForgotPasswordPage.tsx)
- Profil candidat : [src/pages/candidate/CandidateProfilePageModern.tsx](src/pages/candidate/CandidateProfilePageModern.tsx)
- Profil sections : [src/features/profile/components/sections/ProfileSection.tsx](src/features/profile/components/sections/ProfileSection.tsx), [src/features/profile/components/sections/ProfessionalPresentationSection.tsx](src/features/profile/components/sections/ProfessionalPresentationSection.tsx)
- Candidature : [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx)

Dans ces composants, la valeur du formulaire est stockée dans un objet unique comme formData ou profileForm, et chaque champ est mis à jour par un handler générique ou un setter spécifique.

### Pattern secondaire : plusieurs states simples

Certaines pages utilisent des states séparés plutôt qu’un objet global.

Exemples :

- [src/pages/candidate/CandidateSkillsPage.tsx](src/pages/candidate/CandidateSkillsPage.tsx) : un seul champ newSkill et un état d’erreur.
- [src/pages/candidate/CandidateExperiencePage.tsx](src/pages/candidate/CandidateExperiencePage.tsx) : un objet currentExperience plus plusieurs états de UI.
- [src/pages/candidate/CandidateEducationPage.tsx](src/pages/candidate/CandidateEducationPage.tsx) : un objet currentEducation plus états de gestion.

### Pattern “listes CRUD” avec hooks personnalisés

Les pages liées aux compétences, langues, expériences et éducation s’appuient sur des hooks dédiés pour charger, créer, modifier et supprimer des éléments.

Exemples :

- [src/features/candidates/hooks/useCandidateExperiences.ts](src/features/candidates/hooks/useCandidateExperiences.ts)
- [src/features/candidates/hooks/useCandidateEducation.ts](src/features/candidates/hooks/useCandidateEducation.ts)
- [src/features/candidates/hooks/useCandidateLanguages.ts](src/features/candidates/hooks/useCandidateLanguages.ts)
- [src/features/candidates/hooks/useCandidateSkills.ts](src/features/candidates/hooks/useCandidateSkills.ts)

Le formulaire lui-même reste souvent local au composant, tandis que la logique métier est déportée dans le hook.

### Pattern “logique directe dans les pages”

Beaucoup de formulaires sont encore construits “en dur” dans la page elle-même, avec :

- handlers onChange locaux
- validation directe dans la page
- appels API directement dans le submit

Exemples :

- [src/pages/admin/AdminJobsPage.tsx](src/pages/admin/AdminJobsPage.tsx)
- [src/pages/admin/AdminBlogCreatePage.tsx](src/pages/admin/AdminBlogCreatePage.tsx)
- [src/pages/admin/AdminJobCreatePage.tsx](src/pages/admin/AdminJobCreatePage.tsx)

### Pattern “logique séparée”

Quelques modules sont plus structurés :

- [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) centralise l’état du profil candidat.
- [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts) centralise la logique d’upload et de stockage des documents candidats.
- [src/services/storageService.ts](src/services/storageService.ts) centralise les règles d’upload vers Supabase Storage.

---

## 3. Validation

### Méthode dominante : validations manuelles avec des if

C’est la méthode la plus courante.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx) : validation du prénom, nom, email, mot de passe, confirmation, case d’acceptation.
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx) : validation email et mot de passe.
- [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx) : validation du mot de passe et de la confirmation.
- [src/pages/candidate/CandidateForgotPasswordPage.tsx](src/pages/candidate/CandidateForgotPasswordPage.tsx) : validation de l’email.

### Regex

Les regex sont utilisées principalement pour les emails.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx)
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)
- [src/pages/candidate/CandidateForgotPasswordPage.tsx](src/pages/candidate/CandidateForgotPasswordPage.tsx)

### Fonctions utilitaires

Quelques validations sont faites via des fonctions locales ou utilitaires.

Exemples :

- [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx) : vérification de la présence de documents, du consentement, de l’email destinataire et des limites de fichier.
- [src/services/storageService.ts](src/services/storageService.ts) : vérification du type MIME et de la taille des fichiers.
- [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts) : règles d’upload de documents candidats.

### Bibliothèque de validation

Aucune bibliothèque de validation n’est utilisée pour les formulaires actuels. React Hook Form et Zod ne sont pas branchés sur les formulaires fonctionnels.

### Validation directement dans les composants

La majorité des validations se fait directement dans les composants, parfois avec un objet errors local.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx)
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)
- [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx)
- [src/pages/candidate/CandidateExperiencePage.tsx](src/pages/candidate/CandidateExperiencePage.tsx)

---

## 4. Gestion des erreurs

### Erreurs sous les champs

C’est la méthode de base pour les pages d’authentification et de profil.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx) : messages d’erreur affichés sous chaque champ.
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx) : messages d’erreur affichés sous le champ concerné.
- [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx) : même approche.

### Alertes globales de page

Beaucoup de pages utilisent des alertes de type “global message” pour les succès et les erreurs.

Exemples :

- [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx)
- [src/pages/candidate/CandidateProfilePageModern.tsx](src/pages/candidate/CandidateProfilePageModern.tsx)
- [src/features/profile/components/sections/ProfileSection.tsx](src/features/profile/components/sections/ProfileSection.tsx)
- [src/features/profile/components/sections/ProfessionalPresentationSection.tsx](src/features/profile/components/sections/ProfessionalPresentationSection.tsx)

### Toasts

Le toast est utilisé dans l’admin, via Sonner.

Exemple :

- [src/pages/admin/AdminTeamPage.tsx](src/pages/admin/AdminTeamPage.tsx)

Le système est globalement initialisé dans [src/App.tsx](src/App.tsx).

### Alertes natives

Quelques pages utilisent encore window.alert ou alert().

Exemple :

- [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx)

C’est moins cohérent et moins agréable que l’usage des alertes UI ou des toasts.

### Erreurs Supabase / serveur

Les erreurs backend sont récupérées puis propagées sous forme de messages utilisateur.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx)
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)
- [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx)
- [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts)

### Workflow global

Le flux est généralement le suivant :

1. l’utilisateur modifie un champ
2. le state local est mis à jour
3. au submit, la validation est exécutée
4. en cas d’erreur, des messages sont stockés dans un state d’erreurs
5. en cas de succès, l’API est appelée
6. les erreurs réseau ou Supabase sont transformées en message utilisateur
7. un message de succès ou d’erreur est affiché
8. la navigation ou la mise à jour de state suit

---

## 5. Gestion des valeurs

### Principalement useState sur un objet unique

C’est le modèle dominant.

Exemples :

- [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx)
- [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx)
- [src/pages/candidate/CandidateResetPasswordPage.tsx](src/pages/candidate/CandidateResetPasswordPage.tsx)
- [src/pages/candidate/CandidateProfilePageModern.tsx](src/pages/candidate/CandidateProfilePageModern.tsx)

### Plusieurs states séparés

Quelques formulaires utilisent des states séparés au lieu d’un seul objet.

Exemples :

- [src/pages/candidate/CandidateSkillsPage.tsx](src/pages/candidate/CandidateSkillsPage.tsx)
- [src/features/profile/components/sections/ProfessionalPresentationSection.tsx](src/features/profile/components/sections/ProfessionalPresentationSection.tsx)

### Context et store

Aucun usage observé de Zustand, Redux ou d’un store global dédié pour les formulaires.

### Persistence hors formulaire

Le profil candidat est chargé via le hook [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts) et certains documents sont sauvegardés localement via [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts).

---

## 6. Soumission

### Workflow type d’un submit

Prenons l’exemple de la connexion candidat dans [src/pages/candidate/CandidateLoginPage.tsx](src/pages/candidate/CandidateLoginPage.tsx).

Workflow observé :

1. Utilisateur remplit les champs
2. onChange met à jour le state local
3. au submit, validateForm vérifie les champs
4. si OK, le composant appelle CandidateAuthService.login
5. la réponse de Supabase est traitée
6. en cas de succès, un message de succès est défini puis la navigation se fait vers le dashboard
7. en cas d’erreur, le message est affiché dans une alerte

### Autre exemple : inscription

Dans [src/pages/candidate/CandidateSignupPage.tsx](src/pages/candidate/CandidateSignupPage.tsx), le flux est :

- validation locale
- appel API /api/register
- traitement de la réponse HTTP
- en cas de succès, navigation vers la page de connexion avec state de succès
- en cas d’erreur, affichage d’un message d’erreur

### Exemple plus complexe : candidature

Dans [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx), le workflow est plus riche :

- contrôle du consentement et de la présence de documents
- lecture des fichiers sélectionnés
- transformation en base64 si nécessaire
- préparation d’un payload d’email
- appel à /api/send-email
- retour avec succès ou erreur
- affichage d’un message global

### Composants et hooks impliqués

- composants de page : pages candidat, pages admin
- services : [src/features/authentication/api/authApi.ts](src/features/authentication/api/authApi.ts), [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- hooks : [src/features/candidates/hooks/useCandidate.ts](src/features/candidates/hooks/useCandidate.ts), [src/features/candidates/hooks/useCandidateExperiences.ts](src/features/candidates/hooks/useCandidateExperiences.ts)
- intégration backend : Supabase Auth, Supabase Storage, API Vercel

---

## 7. Réutilisation

### Composants de base réutilisés

Le projet contient bien des composants génériques de champs :

- Input : [src/components/ui/input.tsx](src/components/ui/input.tsx)
- Textarea : [src/components/ui/textarea.tsx](src/components/ui/textarea.tsx)
- Select : [src/components/ui/select.tsx](src/components/ui/select.tsx)
- Checkbox : [src/components/ui/checkbox.tsx](src/components/ui/checkbox.tsx)
- Alert : [src/components/ui/alert.tsx](src/components/ui/alert.tsx)

### Ce qui est réutilisé

- Les composants UI basiques sont bien utilisés dans les pages.
- Les pages d’authentification réutilisent les mêmes primitives Input, Button, Alert, Card.

### Ce qui n’est pas réutilisé

- Aucun système de champs de formulaire “complet” n’est en place.
- Aucun composant dédié de “FileUpload” ou “DatePicker” n’est centralisé. Les pages utilisent des input natifs.
- Le wrapper React Hook Form est présent mais non utilisé dans les formulaires réels.
- La logique d’upload de documents est répétée en partie entre la page CV et la page de candidature.

---

## 8. Typage

### Ce qui est bien fait

- TypeScript est utilisé de façon générale dans le projet.
- Des types spécifiques existent pour les profils, expériences, formations, langues et documents.
- Des types de base sont utilisés pour les objets de formulaire et les payloads API.

Exemples :

- [src/features/candidates/api/types.ts](src/features/candidates/api/types.ts)
- [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts)
- [src/integrations/supabase/candidate-auth.ts](src/integrations/supabase/candidate-auth.ts)

### Points faibles

- Beaucoup de formulaires utilisent des objets non explicitement typés, ou des types très généraux comme Record<string, string>.
- Les erreurs de formulaire sont souvent représentées comme des strings indexées par clé, ce qui est pratique mais peu robuste.
- Certaines pages utilisent des casts et des assertions de type à la volée.
- La validation métier et le typage des champs ne sont pas centralisés, ce qui accroît le risque d’incohérence.
- Le code contient encore des objets inline sans interface claire, notamment dans les pages d’authentification et d’admin.

### any

Aucune utilisation visible de any n’a été détectée dans les fichiers de formulaires et hooks principaux. Les casts sont présents, mais ils restent majoritairement orientés vers unknown ou des unions de types.

---

## 9. Upload de fichiers

### Upload de CV

Le CV est géré dans [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx) et [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts).

Workflow :

- sélection d’un fichier via input type=file
- vérification du type MIME et de la taille
- appel à uploadCandidateCV
- envoi vers Supabase Storage via [src/services/storageService.ts](src/services/storageService.ts)
- stockage de l’URL obtenue dans l’état local du composant

### Upload photo / avatar

La photo de profil est partiellement intégrée dans [src/pages/candidate/CandidateProfilePageModern.tsx](src/pages/candidate/CandidateProfilePageModern.tsx).

Actuellement :

- un aperçu local est possible via FileReader
- l’upload réel vers le stockage n’est pas encore complètement branché dans cette vue
- la section affiche un message indiquant que la fonctionnalité est à venir

### Upload lettre de motivation ou documents complémentaires

Ce flux existe dans [src/pages/candidate/CandidateCVPage.tsx](src/pages/candidate/CandidateCVPage.tsx) et [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx).

Règles observées :

- seuls les fichiers PDF sont acceptés
- taille maximale de 2 Mo
- validation réalisée côté composant et côté service storage

### Particularité importante

Les documents candidats sont stockés localement dans le navigateur sous forme de JSON dans localStorage via [src/features/candidates/api/documentsApi.ts](src/features/candidates/api/documentsApi.ts), tandis que les fichiers eux-mêmes sont uploadés vers Supabase Storage. Ce choix rend la gestion des documents un peu hybride : stockage de métadonnées local, fichiers distants.

---

## 10. Performance

### Problèmes potentiels

- Beaucoup de formulaires utilisent des handlers inline qui créent de nouvelles fonctions à chaque rendu, ce qui peut alourdir les re-renders.
- La logique de validation est répétée dans plusieurs pages plutôt que centralisée.
- Le composant de candidature [src/pages/candidate/CandidateJobApplyPage.tsx](src/pages/candidate/CandidateJobApplyPage.tsx) est particulièrement volumineux et mélange UI, validation de fichiers, préparation de payload, envoi d’email et affichage de feedback.
- Les sections profil utilisent plusieurs states locaux et des effets de synchronisation, ce qui peut entraîner des re-renders inutiles.
- Les formulaires hérités ne bénéficient pas d’optimisations liées à React Hook Form telles que la mémorisation et le rendu ciblé des champs.

### Points positifs

- Les hooks personnalisés permettent d’isoler une partie de la logique métier.
- Les autres écrans ne sont pas toujours “trop volumineux”, mais la duplication de logique est visible.

---

## 11. Cohérence

Le projet n’utilise pas une seule approche. On observe plusieurs modèles distincts :

1. Formulaires contrôlés avec useState et objet unique
2. Formulaires contrôlés avec plusieurs states séparés
3. Formulaires de listes avec hooks CRUD et état local
4. Formulaires lourds intégrés directement dans des pages très volumineuses
5. Wrapper React Hook Form disponible mais non utilisé

En pratique, cela signifie que la cohérence est moyenne à faible. Le code est fonctionnel, mais la mental model change d’un écran à l’autre.

---

## 12. Bonnes pratiques

### Ce qui respecte les bonnes pratiques React

- séparation claire entre UI et logique métier dans plusieurs modules
- utilisation de hooks personnalisés pour les données candidates
- états de loading, error, success visibles
- composants UI réutilisables pour les éléments de base
- gestion de l’authentification via services dédiés

### Ce qui devrait être amélioré

- unifier le modèle de formulaire sur un système unique
- centraliser la validation dans un schéma partagé
- réduire la duplication entre pages d’authentification
- remplacer les validations maison par des schémas vérifiables et testables
- remplacer les alert() natives par une approche cohérente de feedback utilisateur
- rendre les champs plus réutilisables avec des composants de formulaire plus abstraits
- éviter de mélanger logique métier, UI et validation dans des pages trop volumineuses

---

## 13. Migration recommandée

Une migration vers React Hook Form + Zod est pertinente, surtout pour :

- l’inscription candidat
- la connexion candidat
- la réinitialisation du mot de passe
- le profil candidat
- la page de candidature
- les formulaires d’upload de documents

### Pourquoi cette migration est pertinente

- réduction de la duplication
- validation déclarative et centralisée
- meilleure maintenabilité
- meilleur contrôle des messages d’erreur
- meilleure lisibilité des composants
- plus facile à tester et à faire évoluer

### Recommandation de stratégie

Il serait préférable de procéder par étapes :

1. commencer par les formulaires d’authentification
2. ensuite migrer le profil candidat
3. ensuite les formulaires de documents et de candidature
4. conserver les listes CRUD simples tant que la valeur ajoutée reste limitée

En l’état, l’existant fonctionne, mais il est assez dispersé et fortement dépendant d’une logique manuelle qu’il serait plus robuste de remplacer progressivement par un système formuel plus standardisé.
