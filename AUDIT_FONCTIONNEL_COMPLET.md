# AUDIT FONCTIONNEL COMPLET — EMPLOI+

## 1. RÉSUMÉ EXÉCUTIF

Le produit réel observé est un site de recrutement avec trois volets clairs :

- site public : accueil, services, offres, blog, FAQ, contact, mentions légales ;
- espace candidat : authentification, onboarding, dashboard, profil, CV/documents, recommandations, candidatures, offres enregistrées, notifications, abonnement ;
- espace administration : gestion des offres, blog, FAQ, notifications, guides, analytics, gestion des candidats.

Le niveau de réalisation est globalement solide sur les fondations : navigation, recherche d’offres, profil candidat, candidatures, recommandations IA et protections de routes existent réellement dans le code. Les principaux écarts sont plutôt fonctionnels qu’architecturaux : plusieurs parcours sont présents mais inégalement reliés, certains modules sont sous-exploités, et plusieurs routes/alias créent de la dispersion.

## 2. INVENTAIRE DES FONCTIONNALITÉS RÉELLES

| Fonctionnalité | Statut | Observation |
|---|---|---|
| Accueil public | Complète | Page d’accueil avec hero, services, offres publiées, blog, sections de services et CTA. |
| Services / pages métier | Complète | Pages publiques dédiées aux services, hubs candidat/emploi et pages détaillées. |
| Recherche d’offres | Complète | Recherche par mots-clés, filtres, tri, suggestions, historique, recherches sauvegardées. |
| Détail d’offre | Complète | Page d’offre avec contenu, contexte SEO, offres similaires, sauvegarde, partage, analyse IA. |
| Recommandations candidat | Complète | Recommandations server-side basées sur CV/profile, avec pagination. |
| Sauvegarde d’offres | Complète | Enregistrement/désenregistrement d’offres, limite de sauvegarde, affichage côté candidat. |
| Candidature | Complète | Flux d’application sur offre, cooldown 30 jours, statut, historique, retrait. |
| Authentification candidat | Complète | Inscription, login, reset, confirm email, onboarding gating. |
| Authentification admin | Complète | Route /auth pour admin + garde de routes protégées par rôles/permissions. |
| Dashboard candidat | Complète | Vue globale, profil completion, documents, recommandations, actions rapides. |
| Profil candidat | Complète | Bloc de profil, présentation, expérience, formation, compétences, langues, préférences, documents. |
| CV / documents | Complète | Upload CV, gestion de documents, suppression, aperçu. |
| Notifications | Complète | Système de notifications côté candidat et admin, lecture, marquage, suppression. |
| Abonnements | Partielle | Pages plan gratuit / premium / premium+ existent, mais aucune vraie logique de paiement/activation n’est visible dans le flux principal. |
| Blog / guides / FAQ | Complète | Pages publiques et gestion admin présentes. |
| SEO / légales | Complète | Pages légales, CGU, FAQ, métadonnées, canonical. |
| Admin analytics | Partielle | Tableau d’analytics offert par l’admin, mais la couverture fonctionnelle n’est pas équivalente au reste du produit. |
| IA / matching | Partielle | Réseau de recommandation et analyse de CV/offre existe, mais l’usage semble dispersé et peu unifié dans le parcours. |
| Mobile app shell | Partielle | Redirection mobile et layout candidat existent, mais le découpage garde des chemins d’accès différents selon contexte. |

## 3. ANALYSE PAR ZONE

### A. SITE PUBLIC

- Complète : accueil, about, services, pages liées aux services, blog, FAQ, contact, mentions légales, CGU, routes /jobs et /jobs/:slug.
- Complète : recherche publique d’offres avec filtres, recherche avancée et historique/sauvegardes quand l’utilisateur est candidat.
- Complète : page détail d’offre avec contenu, statut, partage, liens similaires, messages d’IA.
- Partielle : la promesse marketing de “matching intelligent” et “WhatsApp / alertes temps réel” est visible dans les contenus marketing sans qu’une vraie chaîne de notification externe soit clairement centralisée dans le produit principal.

### B. AUTHENTIFICATION

- Complète : login, signup, forgot password, reset password, email confirmation, `AuthProvider`, `ProtectedRoute` et permissions.
- Complète : redirection après connexion selon onboarding / dashboard, gestion de la session Supabase et validation de rôle.
- Partielle : le système est robuste mais réparti entre plusieurs chemins (`/auth`, `/candidate/login`, `/candidate/signup`, `/candidate/onboarding`), ce qui alourdit la compréhension du parcours.
- Fragile : le mécanisme de restauration de session et la garde de route dépend d’états asynchrones (`rolesResolved`, `candidateAccessResolved`), ce qui rend le flux sensible aux races d’état si le système grandit.

### C. COMPTE CANDIDAT

- Complète : dashboard, onboarding, profil, expérience, formation, compétences, langues, préférences, documents, CV, candidatures, offres sauvegardées, notifications, paramètres/compte, abonnement.
- Complète : progression de profil et onglets de complétion visibles dans le dashboard et la center profile.
- Partielle : la gestion documentaire et le profil sont multi-onglets et efficaces, mais les liens entre les sections sont parfois moins directs qu’un parcours mono-objectif.
- Fragile : plusieurs pages du candidat sont accessibles via des routes projets/responsives ou via des alias (`saved-jobs`, `saved-offers`, `settings`, `account`, `profile/edit`, etc.), ce qui divise le parcours.

### D. LOGIQUE MÉTIER ET ENGAGEMENT

- Complète : recherche + recommandations + offre + candidature + historique de recherche + sauvegarde.
- Complète : notifications de bienvenue, offres expirant, candidature retirée, notification sur les offres enregistrées.
- Partielle : les mécanismes d’engagement sont présents mais pas uniformisés. Les notifications, recommandations IA et onboarding existent, mais leur orchestration conjointe n’est pas clairement visible comme un système unique de rétention.
- Partielle : le moteur “matching” semble opérationnel dans les recommandations, mais l’expérience utilisateur ne montre pas toujours un cadre clair autour du score, de la confiance et des actions à faire ensuite.

## 4. PARCOURS UTILISATEUR

### Visiteur → découverte

- Ce qui fonctionne : accueil, services, blog, offres publiées, CTA vers /jobs et /services.
- Points de friction : certains contenus marketing dépassent la réalité fonctionnelle exacte ; le parcours public est très riche mais peut être dispersé selon les sections.
- Impact : faible / moyen.

### Visiteur → recherche d’emploi

- Ce qui fonctionne : recherche par mot-clé, filtres, suggestions, liste d’offres, détail d’offre, offres similaires.
- Points de friction : la logique de filtre et le tri sont présents, mais le parcours n’est pas toujours cohérent entre les filtres public, les préférences candidat et les recommandations.
- Impact : moyen.

### Visiteur → inscription

- Ce qui fonctionne : inscription candidat via flux dédié, confirmation email, onboarding conditionnel.
- Points de friction : toute l’expérience passe par plusieurs chemins et est soumise à des états locaux (`onboarding_pending`, `completed`), ce qui augmente le nombre de redirections.
- Impact : moyen.

### Candidat → candidature

- Ce qui fonctionne : l’offre, l’analyse IA, la sauvegarde, le formulaire de candidature, le cooldown, le statut.
- Points de friction : le cooldown de 30 jours est explicite, mais cela peut être perçu comme une friction forte si l’expérience n’est pas suffisamment encadrée dans le parcours.
- Impact : fort.

### Candidat → retour

- Ce qui fonctionne : tableau de bord, notifications, recommandations, profil, espace candidat structuré.
- Points de friction : le retour est présent mais pas toujours centralisé ; la navigation se répartit entre dashboard, public sections et fichiers de profil.
- Impact : moyen.

### Candidat → amélioration du profil

- Ce qui fonctionne : onglets de profil critiques, documents, compétences, expériences, langues, préférences, score de complétion.
- Points de friction : l’outil est puissant mais la progression est dispersée dans plusieurs onglets, avec peu de parcours guidés vers l’action la plus utile.
- Impact : fort.

## 5. DOUBLONS ET INCOHÉRENCES FONCTIONNELLES

| Fonctionnalité | Emplacements concernés | Problème | Action recommandée |
|---|---|---|---|
| Accès public candidat | /candidate/public, /candidate/public/jobs, /candidate/public/services, /candidate/public/blog | Duplicat de l’expérience publique sous le shell candidat | Fusionner / réduire |
| Alias de sauvegarde | /candidate/saved-jobs et /candidate/saved-offers | Même fonction avec deux chemins | Conserver un alias principal / rediriger |
| Alias de compte | /candidate/account et /candidate/settings | Même écran de compte, deux chemins | Conserver / rediriger |
| Alias de profil | /candidate/profile et /candidate/profile/edit | Deux points d’entrée pour un même objet métier | Conserver un chemin unique |
| Auth admin vs candidat | /auth et /candidate/login | Deux mécanismes d’auth distincts malgré la même logique d’accès | Fusionner / clarifier |
| Routes de redirection legacy | experience, education, skills, languages, preferences, creation, creation-motivation | Pages historiques redirigées vers des onglets du profil | Conserver au besoin, mais les masquer |
| Notifications multi-couches | notifications Supabase + hook singleton + dropdown + page candidat | Même source de vérité partagée mais gérée dans plusieurs couches | Conserver / centraliser |

## 6. FONCTIONNALITÉS SOUS-EXPLOITÉES

| Fonctionnalité | Ce qui existe réellement | Pourquoi sous-exploitée | Amélioration précise | Priorité |
|---|---|---|---|---|
| Matching IA / recommandations | Recommandations selon CV/profile sur /jobs et dashboard | Peu de contexte explicite sur le score ou l’action à prendre | Exposer le score + “pourquoi cette offre” + priorisation | P1 |
| Analyse CV ↔ offre | Analyse IA sur détail d’offre | Le parcours semble présent mais pas toujours visible dans le flux complet | Rendre l’analyse plus visible avant candidature | P1 |
| Score de compatibilité | Présent dans onboarding et profils, plus dans l’UX de matching | Non centralisé dans le parcours candidat | Afficher un score clair avec recommandations d’action | P1 |
| Notifications | Système complet de lecture/suppression | Peu de déclenchement contextualisé sur les candidatures et les offres | Corréler les notifications à l’événement utile et au prochain step | P1 |
| Onboarding | Parcours de 5 étapes | Flux conditionnel avec localStorage, mais peu intégré à une vraie expérience de conversion | Utiliser l’onboarding comme étape de qualification et non comme simple écran | P2 |
| Offres sauvegardées | Fonction réelle | Le produit compte la limite, mais l’usage de relance manque | Donner des relances et une meilleure visibilité des offres proches d’expirer | P2 |
| Historique de recherche | Recherches sauvegardées et historique existants | Peu mis en valeur dans le parcours retour candidat | Créer un “retour aux recherches” simplifié | P2 |
| Préférences professionnelles | Section de préférences avec logique | Pas intégré comme moteur d’optimisation du parcours principal | Lier directement aux recommandations et filtres | P2 |
| Suivi de candidature | Page de candidatures réelle | Le statut est présent, mais la logique de relance / décision manque | Ajouter étapes d’info et rappels de suivi | P2 |

## 7. FONCTIONNALITÉS MANQUANTES (À FORTE VALEUR)

| Fonctionnalité | Pourquoi utile | Où l’intégrer | Complexité | Priorité |
|---|---|---|---|---|
| Rappels de candidature / relances automatiques | Augmente le suivi et réduit l’abandon | Dashboard candidat + notifications | Moyenne | P1 |
| Expérience “offres adaptées” avec score explicite | Améliore la conviction et la conversion | /jobs + /jobs/:slug + dashboard | Moyenne | P1 |
| Suivi de candidature enrichi (étapes, dates, messages) | Renforce la confiance et la rétention | CandidateApplicationsPage | Moyenne | P1 |
| Alerte “offre bientôt expirée” + relance d’action | Convertit les offres sauvegardées en candidatures | SavedOffersPage + notifications | Faible | P1 |
| Recommandations personnalisées par motivations / preferences | Améliore la qualité des matches | /jobs + dashboard | Moyenne | P1 |
| Parcours d’auto-complétion guidé | Réduit le taux d’abandon du profil | onboarding / profile / dashboard | Faible | P2 |
| Historique d’actions et “reprendre là où j’en étais” | Rétention et retour utilisateur | dashboard + recherches | Moyenne | P2 |
| Préférences de recherche sauvegardées / alerts | Augmente la récurrence | /jobs | Moyenne | P2 |
| Tutoriel de candidature rapide | Réduit la friction pour les nouveaux candidats | /jobs/:slug + onboarding | Faible | P2 |
| Match score + bonnes pratiques par poste | Valorise le profil et rassure | /jobs/:slug | Moyenne | P3 |

## 8. À AMÉLIORER AVANT D’AJOUTER DE NOUVELLES FONCTIONNALITÉS

- Clarifier le parcours d’authentification : candidat vs admin vs public.
- Réduire les chemins dupliqués dans le compte candidat.
- Centraliser les notifications autour d’un seul mécanisme métier cohérent.
- Rendre visible le score / le matching / les recommandations comme centre du parcours.
- Simplifier le parcours de profil en guidant directement l’utilisateur vers les champs les plus utiles.
- Aligner les parcours de recherche, sauvegarde, recommandation et candidature autour d’une même logique d’action.
- Réduire les redirections legacy des anciens chemins.
- Mieux distinguer l’information utile de la promesse marketing non entièrement traduite en action concrète.

## 9. PRIORISATION FINALE

### P1 — À FAIRE EN PRIORITÉ

- Clarifier le parcours candidat principal et supprimer les doublons de routes.
- Rendre le matching IA / score explicite et actionnable.
- Mieux relier recommandations, sauvegarde et candidature.
- Renforcer les notifications et rappels utiles.
- Simplifier le profil et le diagnostic de complétion.

### P2 — PROCHAINE ÉVOLUTION

- Avoir un parcours de relance / historique plus fort.
- Rendre les préférences et les recherches sauvegardées davantage visibles.
- Améliorer la cohérence des flux mobile/app.
- Mieux intégrer le onboarding dans la conversion.

### P3 — PLUS TARD

- Ajout de modules plus avancés de gestion de suivi ou d’alertes.
- Pilotage de nouveaux mécanismes d’engagement profond.
- Évolutions de monétisation premium si l’usage est validé.

## 10. TOP 10 DES ACTIONS LES PLUS PERTINENTES

1. Clarifier le parcours candidat unique
   - Type : Amélioration existante
   - Pourquoi maintenant : il y a trop de chemins pour le même objectif.
   - Impact : Fort
   - Complexité : Faible
   - Priorité : P1

2. Rendre le score de matching visible et explicite
   - Type : Amélioration existante
   - Pourquoi maintenant : c’est le cœur de la valeur candidat.
   - Impact : Fort
   - Complexité : Moyenne
   - Priorité : P1

3. Relier recommandations, sauvegarde et candidature
   - Type : Amélioration existante
   - Pourquoi maintenant : cela réduit la friction du chemin conversion.
   - Impact : Fort
   - Complexité : Moyenne
   - Priorité : P1

4. Centraliser les notifications de relance
   - Type : Amélioration existante
   - Pourquoi maintenant : le système existe mais manque de cohérence fonctionnelle.
   - Impact : Fort
   - Complexité : Moyenne
   - Priorité : P1

5. Simplifier la complétion du profil
   - Type : Amélioration existante
   - Pourquoi maintenant : le profil est solide mais la progression est fragmentée.
   - Impact : Fort
   - Complexité : Faible
   - Priorité : P1

6. Renforcer le suivi de candidature
   - Type : Amélioration existante
   - Pourquoi maintenant : les candidatures existent, mais leur suivi est incomplet.
   - Impact : Fort
   - Complexité : Moyenne
   - Priorité : P1

7. Clarifier l’usage des offres enregistrées expirantes
   - Type : Amélioration existante
   - Pourquoi maintenant : c’est un levier important de conversion.
   - Impact : Moyen
   - Complexité : Faible
   - Priorité : P2

8. Mieux valoriser l’historique de recherche
   - Type : Amélioration existante
   - Pourquoi maintenant : cela augmente le retour sur site et la rétention.
   - Impact : Moyen
   - Complexité : Moyenne
   - Priorité : P2

9. Supprimer/standardiser les redirections legacy
   - Type : Amélioration existante
   - Pourquoi maintenant : elles perturbent la lisibilité du produit.
   - Impact : Moyen
   - Complexité : Faible
   - Priorité : P2

10. Mieux rassurer sur le parcours premium / abonnement
   - Type : Amélioration existante
   - Pourquoi maintenant : la promesse commerciale existe, mais le périmètre opérationnel reste flou.
   - Impact : Moyen
   - Complexité : Moyenne
   - Priorité : P3

## 11. CONCLUSION

Le produit EMPLOI+ a un socle fonctionnel solide. Les fonctionnalités principales sont bien présentes, notamment la recherche d’offres, le profil candidat, le matching, les candidatures et les notifications. Le vrai enjeu n’est pas d’ajouter de nouveaux modules au hasard, mais d’aligner les parcours existants autour d’une logique de conversion claire : découvrir, comparer, enregistrer, apprécier, candidater, suivre et revenir.

La priorité la plus forte est donc de consolider ce qui existe déjà avant d’étendre le produit. La vraie valeur ajoutée à venir ne viendra pas d’une fonctionnalité isolée, mais d’un parcours candidat plus fluide, plus lisible et plus actionnable.
