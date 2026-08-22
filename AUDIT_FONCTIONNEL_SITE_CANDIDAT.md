# AUDIT FONCTIONNEL — EMPLOI+

## 1. Résumé exécutif

L’état général du site est solide sur la base technique et la couverture fonctionnelle du parcours public + candidat. La plateforme dispose d’une vraie structure de job board avec navigation publique, pages offres, recherches avancées, dashboard candidat, profil, sauvegarde d’offres, notifications et parcours d’inscription. La valeur est claire : EmploiPlus Group propose à la fois un site d’emploi et un espace candidat avec éléments d’accompagnement RH.

Principales forces :
- couverture fonctionnelle large du site public et du compte candidat ;
- parcours d’offre, candidature et dashboard présents ;
- recherche d’emploi enrichie par filtres, historique, suggestions et recommandations ;
- profil candidat structuré avec complétion, CV, documents, compétences, expérience, langues, préférences ;
- sauvegarde d’offres, notifications et gestion du compte déjà en place ;
- UX parfois maîtrisée sur les écrans critiques, notamment le dashboard et les pages de candidature.

Principales faiblesses :
- la plateforme semble plus riche que le parcours candidat réel ne le montre ; certains modules sont présents mais peu intégrés ou peu guidés ;
- la conversion visiteur → inscrit → candidat actif est probablement freinée par le manque de parcours “sans friction” ;
- les alertes et recommandations sont présentes, mais pas encore orchestrées comme un service de veille emploi clair ;
- le pouvoir de la plateforme est plus fort côté produit que côté expérience de conversion et de rétention ;
- la navigation candidate est large mais parfois dispersée ; l’utilisateur doit trouver ses repères dans plusieurs modules.

Principales opportunités :
- transformer les fonctionnalités existantes en expérience plus guidée ;
- consolider les alertes emploi, recommandations et sauvegardes en service d’engagement ;
- clarifier le parcours de candidature, le suivi et la confiance dans le processus ;
- rendre le profil candidat davantage exploitable pour le matching et la conversion ;
- enrichir la rétention avec des parcours d’onboarding et de relance ciblés.

## 2. Cartographie du produit

Routes publiques principales découvertes :
- / ; /about ; /services ; /services/:slug ; /services/hub-candidat-intelligent ; /services/solutions-entreprises-bpo ; /services/hub-emploi-recrutement/landing ;
- /jobs ; /jobs/:slug ;
- /blog ; /blog/:slug ;
- /faq ; /contact ;
- /politique-de-confidentialite ; /mentions-legales ; /cgu ;
- /auth ;
- 404 / page de redirection via UtilityPages.

Routes candidat principales découvertes :
- /candidate/login ; /candidate/signup ; /candidate/forgot-password ; /candidate/reset-password ; /candidate/confirm ;
- /candidate/dashboard ;
- /candidate/profile ; /candidate/profile/edit ;
- /candidate/documents ;
- /candidate/guides ;
- /candidate/subscription ; /candidate/subscription/free ; /candidate/subscription/premium ; /candidate/subscription/premium-plus ;
- /candidate/applications ; /candidate/applications/:id ;
- /candidate/saved-jobs ; /candidate/saved-offers ;
- /candidate/notifications ;
- /candidate/account ; /candidate/settings ;
- /candidate/jobs/:slug/apply ;
- redirections internes /candidate/creation, /experience, /education, /skills, /languages, /preferences.

Navigation interne et structure :
- Shell public avec PublicLayout ;
- Shell candidat avec CandidateLayout, sidebar, topbar, drawer mobile ;
- routes protégées par ProtectedRoute ;
- redirection logicielle pour mobile vers /jobs ;
- parcours candidat accessibles dans le shell public ou dans le shell candidat selon l’état d’authentification.

## 3. Fonctionnalités existantes

| Fonctionnalité | Zone | État | Qualité | Observation |
|---|---|---:|---:|---|
| Navigation publique | Public | Fonctionnelle | Bonne | Menu, footer, pages services, blog, FAQ, contact, CGU et mentions bien présentes. |
| Recherche d’emploi | Public | Fonctionnelle | Bonne | Filtres, tri, recherche textuelle, historique, recherches sauvegardées, recommandations. |
| Détail d’offre | Public | Fonctionnelle | Bonne | Page riche : informations, partage, status, offres similaires, bouton d’action. |
| Candidature | Candidat | Fonctionnelle | Moyenne | Parcours solide mais encore assez lourd et parfois peu guidé. |
| Profil candidat | Candidat | Fonctionnelle | Bonne | Structure complète : profil, présentation, CV, docs, compétences, expériences, langues, préférences. |
| Dashboard candidat | Candidat | Fonctionnelle | Bonne | Informations utiles, recommandations, progression, actions rapides. |
| Gestion CV/documents | Candidat | Fonctionnelle | Bonne | Documents, CV, téléchargement, suppression, stockage documentaire présent. |
| Offres enregistrées | Candidat | Fonctionnelle | Bonne | Stockage, affichage, statut expirée, limite, notifications de relance. |
| Notifications | Candidat | Partielle | Moyenne | Présentes et lisibles, mais pas encore un système de veille emploi proprement paramétrable. |
| Authentification | Candidat | Fonctionnelle | Bonne | Inscription, login, reset password, confirm email, protection de routes. |
| Paramètres compte | Candidat | Fonctionnelle | Moyenne | Sécurité + paramètres d’account visibles ; probablement encore peu exploités. |
| Onboarding / guidance | Candidat | Partielle | Moyenne | Quelques guides et complétion de profil, mais pas de parcours onboarding clair. |
| Alertes emploi | Public/Candidat | Partielle | Faible | Les briques sont là, mais pas de mécanisme d’alertes métier réellement éprouvé et paramétrable. |
| Matching candidat/offre | Candidat | Partielle | Moyenne | Recommandations et AI matching visibles, mais pas encore un “score” fluide et transparent. |
| Suivi candidature | Candidat | Partielle | Moyenne | Liste de candidatures présente, mais manque de profondeur de suivi et d’historique cohérent. |
| Mobile | Global | Fonctionnelle | Moyenne | Le layout mobile existe, mais les parcours critiques restent plus lourds que sur desktop. |
| 404 / pages d’erreur | Public | Fonctionnelle | Bonne | Page 404 simple et utile; gestion de la route inexistante présente. |
| Incohérence navigation | Global | Fragile | Moyenne | Plusieurs chemins font doublon (saved-jobs / saved-offers, expérience/education/skills/languages via redirections). |

États possibles : Fonctionnelle, Partielle, Fragile, Incomplète, À vérifier, Absente.

## 4. Fonctionnalités à améliorer

| Fonctionnalité | Problème actuel | Amélioration proposée | Priorité | Valeur | Complexité |
|---|---|---|---|---|---|
| Parcours d’inscription | L’inscription est correcte mais peut être perçue comme isolée du parcours emploi ; peu de guidance après création du compte | Ajouter un onboarding compact : compléter profil, télécharger CV, sauvegarder 1 offre, choisir préférences | P1 | Forte | Faible |
| Profil candidat | Très riche, mais parfois dispersé entre onglets, redirections et sections | Unifier le profil en parcours orienté “compléter mon profil” avec score et checklist claire | P1 | Forte | Moyenne |
| Candidature rapide | Le parcours peut être long et demander des documents sans explication des avantages | Ajouter le “postuler en 1 clic” avec validation minimale et rappel document à télécharger | P1 | Forte | Moyenne |
| Suivi des candidatures | Liste présente, mais peu de contexte sur le statut, l’étape ou le délai | Ajouter historique, étapes, messages de progression et calendrier | P1 | Forte | Moyenne |
| Alertes emploi | Des notifications existent, mais pas de vrai service “alertes personnalisées” | Créer préférences d’alertes (ville, contrat, secteur, fréquence) | P1 | Forte | Moyenne |
| Recommandations | Présentes mais peu visibles comme service de valeur | Afficher un score de matching plus lisible et un CTA “Voir les offres qui correspondent le mieux” | P1 | Forte | Moyenne |
| Recherche | Très bonne base, mais l’expérience est lourde sans hiérarchisation claire | Rendre les filtres plus visibles, privilégier tri pertinence + persistance de recherche | P1 | Forte | Faible |
| Offres enregistrées | Fonctionnel, mais pas assez guidé | Ajouter mise en avant des offres proches de l’expiration, “déjà postulé”, “offres à relancer” | P2 | Moyenne | Faible |
| Navigation candidate | Beaucoup de points d’entrée et de redirections | Simplifier l’arborescence et réduire les doublons de routes | P1 | Moyenne | Faible |
| Notifications | Mises à jour fonctionnelles mais pas toujours orientées candidat | Trier par urgence, marquer “important”, rattacher à une action claire | P2 | Moyenne | Faible |
| Page détail offre | Très bonne, mais pas assez de preuve d’opportunité / confiance | Ajouter “compatibilité candidat”, “pourquoi cette offre est faite pour vous”, CTA explicite | P2 | Moyenne | Faible |
| Mobile | Parcours existants, mais lourds et parfois peu lisibles sur petits écrans | Réduire les écrans et le nombre d’actions par page, améliorer les filtres glissables | P1 | Forte | Moyenne |
| 404 / erreurs | Très basique, mais pas de parcours de reprise utile | Rediriger vers offres les plus pertinentes ou proposer un retour immédiat | P3 | Faible | Faible |

## 5. Fonctionnalités manquantes à forte valeur

- Fonctionnalité : Alertes emploi personnalisées.
  - Pourquoi utile : le candidat a besoin d’une veille qui le rassure sans effort ; c’est un puissant moteur de retour et de rétention.
  - Où l’intégrer : page /candidate/settings, dashboard, recherche d’offres, notification centre.
  - Priorité : P1.
  - Complexité : Moyenne.

- Fonctionnalité : Suivi détaillé des candidatures avec étapes et commentaires.
  - Pourquoi utile : la candidature n’est pas terminée au clic ; le candidat veut comprendre où il en est et ce qu’il doit faire ensuite.
  - Où l’intégrer : /candidate/applications et /candidate/applications/:id.
  - Priorité : P1.
  - Complexité : Moyenne.

- Fonctionnalité : Matching visuel / score de pertinence avec explication simple.
  - Pourquoi utile : le candidat comprend pourquoi une offre est recommandée, ce qui accroît la confiance et la conversion.
  - Où l’intégrer : page offres, page détail, dashboard.
  - Priorité : P1.
  - Complexité : Moyenne.

- Fonctionnalité : Parcours d’onboarding candidat minimal.
  - Pourquoi utile : beaucoup de visiteurs s’inscrivent sans créer un profil utilisable ; il faut orienter vers l’action immédiate.
  - Où l’intégrer : après inscription, page de confirmation et dashboard.
  - Priorité : P1.
  - Complexité : Faible.

- Fonctionnalité : Recherches sauvegardées / alertes sur critères
  - Pourquoi utile : c’est un vrai produit de retour sur la plateforme ; on peut le transformer en boucle de engagement.
  - Où l’intégrer : /jobs + compte candidat.
  - Priorité : P2.
  - Complexité : Moyenne.

- Fonctionnalité : Préférences professionnelles et critères de recherche plus explicites.
  - Pourquoi utile : déclaration de localisation, contrat, salaire, secteur, mobilité, disponibilité, etc. augmente la qualité du matching.
  - Où l’intégrer : profil/candidat et page recherche.
  - Priorité : P1.
  - Complexité : Moyenne.

- Fonctionnalité : Relances et rappels intelligents.
  - Pourquoi utile : le site contient déjà des créations de notifications, mais pas de relances réelles pour les candidatures ou offres expirant.
  - Où l’intégrer : dashboard, notifications, saved-offers.
  - Priorité : P2.
  - Complexité : Faible à moyenne.

- Fonctionnalité : Expérience d’application “sans formulaire lourd”
  - Pourquoi utile : les candidats abandonnent souvent quand la candidature ressemble à un dépôt administratif. Une version “rapide + complément” serait très efficace.
  - Où l’intégrer : /candidate/jobs/:slug/apply.
  - Priorité : P1.
  - Complexité : Moyenne.

## 6. Parcours candidat

### Visiteur → offre
- Le parcours est bien pris en charge : accès au site public, pages services, recherche d’offres, détail offre, partage, sauvegarde.
- La friction principale est la quantité d’information + le manque de guidance sur ce qu’il faut faire ensuite.
- Opportunité : proposer un CTA plus lisible “Se connecter pour postuler / créer un compte pour sauvegarder”.

### Offre → inscription
- Il existe un chemin clair vers l’inscription, mais le moment de conversion fait encore trop appel à l’utilisateur : il doit comprendre l’intérêt immédiat.
- L’état “sans profil” n’est pas forcément bien guidé dans le parcours de candidature.
- Opportunité : lors d’un clic sur postuler, afficher un message explicite : “Vous devez créer un compte pour candidater. 2 minutes, puis vous pouvez déposer votre CV et postuler.”

### Inscription → profil
- Le compte est bien structuré, mais le candidat est souvent laissé seul après création.
- L’architecture du profil est très complète, mais peu docilisée dans le sens d’un parcours guidé.
- Opportunité : onboarding avec priorisation “1) complétez votre profil, 2) ajoutez votre CV, 3) postulez”.

### Profil → candidature
- Le potentiel est présent : documents, profil complet, offres recommandées.
- Le point de friction est la quantité de tâches à faire avant une candidature “réelle”.
- Opportunité : réduire le coût d’entrée de la première candidature sans dégrader la qualité.

### Candidature → suivi
- La candidature existe, mais le suivi est encore assez basique.
- Il manque de la preuve de progression, d’historique et d’informations utiles à chaque étape.
- Opportunité : remplacer l’état “statut” brut par un parcours de suivi simple et rassurant.

### Candidat → retour sur la plateforme
- La plateforme a bonne base de rétention avec notifications, demandes, sauvegardes, recommandations, guides.
- Il manque toutefois un mécanisme proactif de relance, de veille emploi et de reconversion de “candidat statique” vers “candidat actif”.
- Opportunité : un email / notification de relance, un rappel de profil incomplet, une alerte sur offres proches.

## 7. Opportunités UX

- Clarifier les CTA de conversion au bon moment : “Enregistrer”, “Postuler”, “Créer un compte”, “Compléter mon profil”.
- Hiérarchiser la recherche et les filtres plus fortement sur le mobile.
- Ajouter un score de complétion de profil visible dès l’entrée dans le dashboard.
- Rendre le parcours “profil” orienté par étapes, avec progression visible.
- Réduire les redirections et chemins mortels entre les sections profil et expérience/compétences/document.
- Uniformiser les libellés et les modules de status : situation, étape, action suivante.
- Aligner les notifications avec des actions concrètes : “Voir l’offre”, “Compléter le profil”, “Postuler maintenant”.
- Ajouter davantage de feedback après une action : sauvegarde, candidature, suppression, notification lue.
- Simplifier les écrans candidat pour éviter le sentiment d’outil RH trop complet mais peu orienté utilisateur.

## 8. Opportunités mobile

- Rendre la recherche plus rapide et plus lisible sur petite tablette/portable : filtres compactés, tri visible sans scroll.
- Optimiser le parcours de candidature sur mobile : moins de formulaires, plus de sections collapsibles, documents associés à des cases claires.
- Améliorer la lisibilité des notifications sur mobile : tri par priorité et non-lus.
- Affiner le temps de chargement et la logique de navigation dans le drawer candidat.
- Mettre en avant les CTA “Postuler”, “Sauvegarder”, “Voir la recommandation” sans encombre visuel.
- Faciliter la navigation de retour entre offre → détail → candidature → dashboard.

## 9. Top 10 des améliorations recommandées

1. Parcours onboarding post-inscription.
2. Score de complétion du profil + checklist.
3. Candidature rapide + parcours guidé.
4. Suivi détaillé des candidatures.
5. Alertes emploi personnalisées.
6. Matching candidat/offre plus lisible et explicite.
7. Simplification de la navigation candidate.
8. Recommandations plus visibles et actionnables.
9. Meilleure gestion des offres enregistrées / relances.
10. Optimisation mobile du parcours de recherche + candidature.

## 10. Roadmap recommandée

### Court terme
- Clarifier le parcours d’inscription → profil → première candidature.
- Afficher le score de complétion du profil et un checklist de tâches.
- Ajouter un parcours “candidature rapide” et un message de logique avant dépôt.
- Améliorer les statuts de candidature et le détail des étapes.
- Renforcer la visibilité des offres recommandées sur le dashboard.
- Simplifier les chemins de navigation dans le compte candidat.

### Moyen terme
- Créer un vrai système d’alertes emploi paramétrables.
- Développer le matching clair avec explication de pertinence.
- Formaliser le suivi de candidature avec données d’étapes et historique.
- Améliorer les préférences professionnelles et le matching par localisation / secteur / contrat.
- Mettre en place des relances automatiques for “offres expirantes”, “profil incomplet”, “candidature active”.

### Long terme
- Développer un moteur de recommandation plus prédictif et un scoring transparent.
- Ajouter des expériences d’auto-optimisation profil / CV / candidature.
- Éventuellement expérimenter un assistant de recherche ou de recommandation orienté candidat.
- Évaluer un système de “job alert” multi-canal (email, notif, WhatsApp) si le modèle commercial le justifie.


