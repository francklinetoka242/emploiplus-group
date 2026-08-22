## 1. Vue d'ensemble
Le compte candidat de EMPLOI+ est bien plus riche que le simple dépôt de CV. Il inclut un parcours complet de profil, de gestion de documents, de recherche d'offres, de matching IA, de candidature directe et de suivi des candidatures. Ce qui est réellement présent dans le code est conforme à un parcours candidat moderne, avec intégration d'IA et parcours de conversion vers la candidature.

## 2. Fonctionnalités réellement présentes dans le compte candidat

### A. PROFIL CANDIDAT
### 1. Profil personnel
**Route :** `/candidate/profile`
**Ce que le candidat peut faire :** renseigner son nom, téléphone, bio, titre professionnel, photo et informations de base.
**État :** Complète

### 2. Expérience professionnelle
**Route :** `/candidate/profile?tab=experience`
**Ce que le candidat peut faire :** ajouter, modifier et supprimer des expériences professionnelles.
**État :** Complète

### 3. Formations
**Route :** `/candidate/profile?tab=education`
**Ce que le candidat peut faire :** gérer le parcours académique et les qualifications.
**État :** Complète

### 4. Compétences
**Route :** `/candidate/profile?tab=skills`
**Ce que le candidat peut faire :** ajouter et retirer des compétences.
**État :** Complète

### 5. Langues
**Route :** `/candidate/profile?tab=languages`
**Ce que le candidat peut faire :** gérer les langues et niveaux associés.
**État :** Complète

### 6. Préférences professionnelles
**Route :** `/candidate/profile?tab=preferences`
**Ce que le candidat peut faire :** renseigner mobilité, disponibilité, salaire cible, mode de travail, etc.
**État :** Complète

### 7. Suivi de complétion du profil
**Route :** `/candidate/dashboard`
**Ce que le candidat peut faire :** vérifier les informations manquantes et compléter progressivement son profil.
**État :** Complète

### B. RECHERCHE ET CONSULTATION DES OFFRES
### 8. Recherche d'offres
**Route :** `/jobs`
**Ce que le candidat peut faire :** parcourir les offres avec recherche et filtres.
**État :** Complète

### 9. Filtres et tri
**Route :** `/jobs`
**Ce que le candidat peut faire :** filtrer par contrat, localisation, salaire, durée, etc., puis trier les résultats.
**État :** Complète

### 10. Détail d'une offre
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** lire la description détaillée, le profil recherché, le type de contrat, le lieu, la rémunération et les dates clés.
**État :** Complète

### 11. Offres similaires
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** consulter des offres proches de l'offre consultée.
**État :** Complète

### 12. Enregistrement d'offres
**Route :** `/candidate/saved-offers`
**Ce que le candidat peut faire :** enregistrer, relire et supprimer des offres favorites.
**État :** Complète

### C. CANDIDATURE ET POSTULAT
### 13. Candidature directe sur le site
**Route :** `/jobs/:slug` et `/candidate/jobs/:slug/apply`
**Ce que le candidat peut faire :** postuler directement depuis l'application avec un bouton de candidature, sans sortir de la plateforme.
**État :** Complète

### 14. Envoi de candidature avec pièces jointes
**Route :** `/candidate/jobs/:slug/apply`
**Ce que le candidat peut faire :** joindre des documents, déposer une candidature et envoyer un message optionnel.
**État :** Complète

### 15. Historique des candidatures
**Route :** `/candidate/applications`
**Ce que le candidat peut faire :** consulter les candidatures envoyées et leur contexte.
**État :** Complète

### 16. Suivi du statut
**Route :** `/candidate/applications`
**Ce que le candidat peut faire :** voir l'état d'avancement de sa candidature.
**État :** Complète

### 17. Retrait / suppression d'une candidature
**Route :** `/candidate/applications`
**Ce que le candidat peut faire :** retirer une candidature déjà soumise.
**État :** Complète

### D. DOCUMENTS, CV ET LETTRE DE MOTIVATION
### 18. Gestion des documents
**Route :** `/candidate/documents` et `/candidate/profile`
**Ce que le candidat peut faire :** gérer son CV, ses documents annexes et ses pièces justificatives.
**État :** Complète

### 19. Téléversement de CV PDF
**Route :** `/candidate/documents` / `/candidate/CV`
**Ce que le candidat peut faire :** importer un CV PDF, l'extraire et le transformer en texte exploitable pour le matching.
**État :** Complète

### 20. Documents complémentaires
**Route :** `/candidate/documents`
**Ce que le candidat peut faire :** ajouter une lettre de motivation, un diplôme, une attestation, un certificat ou un portfolio.
**État :** Complète

### 21. Suppression de documents
**Route :** `/candidate/documents`
**Ce que le candidat peut faire :** supprimer un document ou un CV existant.
**État :** Complète

### E. ANALYSE CV ↔ OFFRE ET MATCHING IA
### 22. Analyse CV / offre
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** lancer une analyse IA entre son CV et l'offre affichée.
**État :** Complète

### 23. Score de compatibilité
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** visualiser un score de correspondance sur 100, avec progression visuelle.
**État :** Complète

### 24. Points forts et faiblesses du profil
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** obtenir une synthèse des points forts et des axes d'amélioration du profil pour l'offre ciblée.
**État :** Complète

### 25. Vérification de l'expérience
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** lire une validation de l'expérience détectée dans le CV et son adéquation au poste.
**État :** Complète

### 26. Résumé personnalisé de compatibilité
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** lire un résumé RH factuel explicatif du match entre son profil et l'offre.
**État :** Complète

### 27. Génération de lettre de motivation
**Route :** `/jobs/:slug`
**Ce que le candidat peut faire :** générer un brouillon de lettre de motivation personnalisé à partir du CV et du poste.
**État :** Complète

### 28. Matching intelligent et recommandations
**Routes :** `/candidate/dashboard`, `/jobs`
**Ce que le candidat peut faire :** recevoir des offres recommandées selon son profil, son CV et son embedding vectoriel.
**État :** Complète

### F. NOTIFICATIONS ET COMPTE
### 29. Centre de notifications
**Route :** `/candidate/notifications`
**Ce que le candidat peut faire :** lire, marquer comme lu et supprimer des notifications.
**État :** Complète

### 30. Sécurité et paramètres du compte
**Routes :** `/candidate/account`, `/candidate/settings`
**Ce que le candidat peut faire :** modifier son mot de passe et accéder aux paramètres de compte.
**État :** Complète / partielle selon écrans

### 31. Abonnement
**Route :** `/candidate/subscription`
**Ce que le candidat peut faire :** consulter les formules disponibles et leurs avantages.
**État :** Complète

### 32. Déconnexion
**Route :** navigation du candidat
**Ce que le candidat peut faire :** fermer sa session active.
**État :** Complète

## 3. Ce qui est réellement présent et important à retenir

### Fonctionnalités IA / décisionnelles réellement offertes
1. **Analyse de compatibilité CV ↔ offre** : le site analyse les compétences, l'expérience et le contexte d'une offre pour attribuer un score.
2. **Affichage des points forts** : les composants affichent des éléments du type “Points forts” et “Axes d’amélioration”.
3. **Affichage des faiblesses / écarts** : le système distingue les points forts et les pistes d’amélioration du profil.
4. **Génération d’un brouillon de lettre de motivation** : le candidat peut copier un texte généré à partir du CV + poste.
5. **Matching intelligent** : le dashboard et la recherche d’offres proposent des offres adaptées au profil.
6. **Candidature directe depuis le site** : le candidat peut postuler sans passer par un autre canal externe.
7. **Téléversement / extraction de CV** : le CV est chargé, traité et exploité pour le matching.

### Fonctionnalités non à confondre avec de la simple UI
- Le système n’est pas seulement “visuel” : il utilise des données Supabase, du stockage de fichiers, des analyses IA et des recommandations calculées.
- Le matching est bien plus qu’un simple score de mots-clés ; il s’appuie sur le texte du CV, l’embedding, les recommandations et l’analyse RH.
- La lettre de motivation n’est pas un simple message générique : elle est construite à partir de l’offre et du profil du candidat.

## 4. Ce qu’il faut mettre en avant dans l’onboarding du candidat
1. **Créer et compléter son profil** — informations, expériences, compétences, préférences.
2. **Téléverser son CV** — la plateforme l’analyse automatiquement.
3. **Analyser sa compatibilité avec les offres** — score, forces, faiblesses, résumé RH.
4. **Recevoir des recommandations adaptées** — matching intelligent et offres pertinentes.
5. **Postuler directement depuis le site** — parcours de candidature complet.
6. **Suivre ses candidatures** — statut, historique et suivi.
7. **Gérer ses documents et son parcours de recherche** — CV, lettres, offres enregistrées et notifications.

## 5. Conclusion
Le compte candidat de EMPLOI+ inclut bien les fonctions suivantes : profil complet, recherche d’offres, CV et documents, matching IA, analyse CV ↔ offre, score de compatibilité, points forts / points faibles, lettre de motivation générée, recommandations, candidature directe, suivi des candidatures et notifications. Ces fonctions sont réelles et exploitées dans le code, contrairement à un simple prototype de parcours.
