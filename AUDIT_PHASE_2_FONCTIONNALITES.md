# AUDIT PHASE 2 — FONCTIONNALITÉS MANQUANTES ET SOUS-EXPLOITÉES

## 1. Synthèse

Le projet EMPLOI+ dispose d’une base fonctionnelle solide pour un job board + espace candidat. La vraie différence entre ce qui existe et ce qui crée de la valeur réside dans la qualité d’orientation, la cohérence du parcours et la capacité à transformer les fonctionnalités en expérience de conversion continue.

Les faits observés dans le code montrent :
- recherche d’emploi très bien structurée ;
- profil candidat riche et diversifié ;
- offres sauvegardées et candidatures réellement présentes ;
- notifications et recommandations actives ;
- matching candidat/offre en place, mais peu explicité et peu valorisé ;
- alertes emploi réelles absentes ;
- parcours candidat fonctionnel mais dispersé, avec trop de redirections et de doublons.

Le principal risque n’est pas l’absence de fonctionnalités, mais leur sous-exploitation. La plateforme a déjà de nombreux blocs utiles ; il faut maintenant les rendre plus naturels, plus guidés et plus orientés vers le candidat actif.

## 2. Vérification fonctionnelle par domaine

### 2.1 Recherche
État réel : COMPLÈTE à PARTIELLE.

Ce qui existe :
- recherche textuelle sur les offres ;
- filtres par entreprise, localisation, contrat, domaine ;
- tri par date / pertinence / salaire ;
- historique de recherches ;
- recherches sauvegardées ;
- possibilité de réappliquer des critères ;
- suggestions de recherche sur base du texte saisi ;
- recommandations en fonction du profil candidat.

Ce qui manque ou est faible :
- pagination claire et explicite sur les grands volumes ;
- expérience “no-result” plus efficace ;
- persistance d’une recherche préférée n’est pas encore un vrai service de veille ;
- tri par pertinence encore peu visible comme valeur centrale ;
- recherche avancée semble plus technique que réellement “candidat-friendly”.

Conclusion : la recherche est déjà un point fort, mais elle n’est pas encore un moteur d’engagement proprement dit.

### 2.2 Offres sauvegardées
État réel : COMPLÈTE.

Ce qui existe :
- sauvegarde d’offres ;
- suppression ;
- limite maximale configurable ;
- affinage avec statut d’offre expirée / archivée ;
- détection si l’offre a déjà été postée ;
- notification créée à la détection d’offre proche de l’expiration.

Ce qui manque :
- point de vue “veille emploi” : pas de mise en avant des offres prioritaires ;
- pas de “liste d’action” clairement orientée : postuler / relancer / comparer ;
- pas d’agrégation simple des offres urgentes ;
- pas de vraie gestion des favoris comme moteur de retour utilisateur.

Conclusion : fonction largement présente, mais encore vue comme un utilitaire plutôt qu’un service de fidélisation.

### 2.3 Candidatures
État réel : PARTIELLE à COMPLÈTE.

Ce qui existe :
- création d’une candidature ;
- couverture par lettre de motivation optionnelle ;
- lien avec les documents du candidat ;
- statut de candidature ;
- historique de candidatures ;
- suppression / retrait d’une candidature ;
- notification post retrait ou mise à jour ;
- sécurité “cooldown” de 30 jours pour la même offre.

Ce qui manque :
- historique détaillé des étapes de suivi (soumise → revue → shortlist → décision) ;
- contexte de la progression ;
- rappel “prochaine étape à faire” ;
- confirmation claire de la candidature après dépôt ;
- suivi d’un parcours entre page offre, candidature et statut final ;
- relances ciblées ou rappels si candidature inactive.

Conclusion : la candidature est bien implémentée, mais pas encore pleinement “expérience candidat” ; elle reste encore trop transactionnelle.

### 2.4 Alertes emploi
État réel : ABSENTE.

Ce qui n’existe pas réellement :
- création d’une alerte avec critères ;
- fréquence de notification ;
- activation / désactivation ;
- gestion multiple d’alertes ;
- préférences de ville / secteur / type de contrat ;
- déclenchement automatique basé sur un nouveau matching.

Ce qui existe :
- notifications système et offres proches de l’expiration ;
- création de notifications manuelles ou semi-automatiques ;
- liste de notifications dans le compte candidat.

Important : cela ne suffit pas à qualifier le système comme des “alertes emploi”. Il manque la couche métier de définition et d’activation des alertes par le candidat.

### 2.5 Notifications
État réel : COMPLÈTE à PARTIELLE.

Ce qui existe :
- table notifications ;
- création de notifications ;
- marquage lu/non lu ;
- suppression ;
- notifications de type candidature, offre, admin, blog, événement ;
- liste côté candidat ;
- notification unique à partir d’un même événement.

Ce qui manque :
- préférences de notification par canal ;
- catégories très claires pour le candidat ;
- filtrage par priorité ou urgence ;
- logique de relance intelligente ;
- déclenchement d’alerte emploi “vraie” à partir des critères du candidat.

Conclusion : le mécanisme de notification est bien en place, mais il est surtout un support de communication, pas encore un système d’activation comportementale.

### 2.6 Matching / recommandations
État réel : PARTIELLE.

Ce qui existe :
- génération de texte CV ;
- calcul de vecteur / embedding ;
- appel RPC au matching candidate/offres ;
- recommandations affichées dans le dashboard et dans la page jobs ;
- fallback local de score quand le RPC est insuffisant ;
- recommandations liées au CV.

Ce qui manque :
- explication claire du score ;
- score visible pour le candidat ;
- catégories de pertinence ;
- optimisation des recommandations sur la base de préférences et localisation ;
- “pourquoi cette offre vous correspond” ;
- amélioration continue de la qualité du matching.

Conclusion : il s’agit d’une fonctionnalité réelle, mais elle est surtout technique et peu lisible comme valeur directe pour le candidat.

## 3. Profil candidat : état réel et gaps

### 3.1 Profil de base
État réel : COMPLÈTE.

Le profil couvre :
- prénom / nom ;
- région / localisation ;
- titre professionnel ;
- résumé ;
- photo et avatar si fourni ;
- informations de contact ;
- complétion sur la base d’éléments métier.

### 3.2 CV et documents
État réel : COMPLÈTE.

Le projet gère :
- CV PDF ;
- extraction de texte ;
- stockage ;
- document(s) annexes ;
- suppression ;
- intégration dans le profil et le matching.

### 3.3 Expérience, formation, compétences, langues
État réel : COMPLÈTE.

Présents dans le code et le profil :
- expérience ;
- formation ;
- compétences ;
- langues ;
- préférences RH ;
- mise à jour de plusieurs sections par onglets.

### 3.4 Gaps fonctionnels importants
Les éléments suivants sont soit absents, soit insuffisants :
- disponibilité réelle ;
- mobilité ;
- salaire souhaité ;
- secteur / domaine recherché ;
- type de contrat recherché ;
- niveau d’expérience recherché ;
- certifications / portfolio / liens professionnels ;
- outil de score de profil ;
- recommandations explicites pour compléter le profil.

Valeur ajoutée → emplacement recommandé → priorité → complexité
- disponibilité + mobilité → profil / préférences → P1 → Faible
- salaire souhaité / fourchette → profil / préférences → P1 → Faible
- secteur / domaine / contrat recherché → profil / page recherche → P1 → Faible
- certifications / portfolio → profil / documents → P2 → Moyenne
- score de profil → dashboard + profil → P1 → Faible
- recommandations de complétion → dashboard + profil → P1 → Faible

## 4. Recherche explicite de fonctionnalités

### 4.1 Présentes et fonctionnelles
- offres similaires : OUI, dans le détail de l’offre ;
- offres recommandées : OUI, sur le dashboard et la page jobs ;
- historique de consultation : PARTIEL, pas d’historique explicite de consultation complet ;
- nouvelles offres depuis la dernière visite : ABSENT ;
- recherches sauvegardées : OUI ;
- alertes emploi : ABSENT ;
- rappels : PARTIEL, notifications de type offre / CV ancien / candidature ;
- relance après absence : ABSENT ;
- suivi de candidatures : PARTIEL ;
- partage d’offre : OUI dans la page détail ;
- score / matching : OUI partiel ;
- préférences professionnelles : OUI partiel ;
- disponibilité / mobilité : ABSENT ou insuffisant ;
- score de profil : PARTIEL / sous-exploité ;
- portfolio / liens : ABSENT ou peu structuré.

## 5. Doubles et redondances fonctionnelles

### Doublons identifiés
- saved-jobs vs saved-offers : redondance route + alias fonctionnel ;
- expérience / education / skills / languages / preferences : séparés dans plusieurs routes, mais redirigés vers le profil ;
- documents vs CV : fonctionnellement liés, mais visualement dispersés ;
- dashboard vs profil : plusieurs informations se chevauchent ;
- notifications vs alertes : même logique partiellement recouverte sans véritable service d’alerte ;
- recommandations vs matching : même objectif, sans paradigme clair pour l’utilisateur.

### Action recommandée
- conserver : fonctionnalités utiles ;
- fusionner : profils et préférences dans un parcours cohérent ;
- rediriger : routes legacy vers le profil unique ;
- différencier : notifications de veille vs alertes emploi vs système de relance.

## 6. Tableau des fonctionnalités nécessitant une action

| Fonctionnalité | État réel | Problème / manque | Proposition | Impact utilisateur | Impact business | Complexité | Priorité |
|---|---|---|---|---|---|---|---|
| Alertes emploi | Absente | Pas de création, critère, fréquence, activation réelle | Ajouter alerte personnalisée par ville, contrat, secteur, fréquence | Très fort | Très fort | Moyenne | P1 |
| Matching candidat/offre | Partielle | Score peu explicité et peu exploité | Afficher score + “pourquoi cette offre” | Très fort | Très fort | Moyenne | P1 |
| Suivi candidatures | Partielle | Peu de contexte étape par étape | Historique détaillé + statut clair + prochaine action | Très fort | Fort | Moyenne | P1 |
| Parcours onboarding | Partielle | Inscription sans guide de mise en route | Profil, CV, première offre, première candidature | Fort | Fort | Faible | P1 |
| Score de profil | Partielle | Très utile mais sous-exploité | Checklist + progression + recommandations | Fort | Fort | Faible | P1 |
| Navigation candidat | Fragile | Trop d’alias et de redirections | Unifier les chemins et réduire la dispersion | Fort | Moyen | Faible | P1 |
| Favoris / offres enregistrées | Complète | Sous-exploité comme moteur de retour | Mieux segmenter les offres urgentes / déjà postées / à relancer | Moyen | Fort | Faible | P2 |
| Recherche avancée | Complète | Peu orientée “candidat” | Clarifier priorité, plus de suggestions et de persistance réelle | Fort | Fort | Faible | P2 |
| Notifications | Partielle | Communication présente mais pas un système de veille | Prioriser, filtrer, relancer | Fort | Fort | Faible | P2 |
| Profil préférences | Partielle | Manque des critères métiers concrets | Disponibilité, mobilité, salaire, contrat, secteur | Fort | Fort | Faible | P1 |
| Candidature rapide | Partielle | Sujet de friction sur mobile et sur parcours long | Version “1 clic + validation” | Très fort | Fort | Moyenne | P1 |
| Relances | Absente | Le candidat n’est pas encouragé à revenir | Rappels profil / candidature / offre expirante | Fort | Fort | Moyenne | P2 |
| Historique consultation | Absente / partielle | Pas de mémoire d’usage direct | Revoir les offres consultées et les réafficher | Moyen | Moyen | Faible | P2 |
| Portfolio / liens professionnels | Absente | Profil peu utilisable pour recruteurs | Ajouter portfolio et profils externes | Moyen | Moyen | Moyenne | P3 |
| Certificats / qualifications | Partielle | Peu structuré | Ajouter espace certifications et formations complémentaires | Moyen | Moyen | Faible | P2 |

## 7. Top 15 des meilleures améliorations

1. Alertes emploi personnalisées — Pourquoi maintenant : c’est le vrai moteur d’engagement latent ; Impact attendu : très fort ; Complexité : Moyenne ; Priorité : P1.
2. Matching candidat/offre plus explicite — Pourquoi maintenant : le projet l’a déjà, mais il est invisible ; Impact attendu : très fort ; Complexité : Moyenne ; Priorité : P1.
3. Suivi étape par étape des candidatures — Pourquoi maintenant : candidats veulent rassurance ; Impact attendu : fort ; Complexité : Moyenne ; Priorité : P1.
4. Parcours onboarding post-inscription — Pourquoi maintenant : réduit l’abandon après création de compte ; Impact attendu : fort ; Complexité : Faible ; Priorité : P1.
5. Score de complétion du profil — Pourquoi maintenant : améliore la conversion + qualité des candidatures ; Impact attendu : fort ; Complexité : Faible ; Priorité : P1.
6. Préférences professionnelles complètes — Pourquoi maintenant : améliore le matching et la qualité des candidatures ; Impact attendu : fort ; Complexité : Faible ; Priorité : P1.
7. Candidature rapide — Pourquoi maintenant : réduit la friction de conversion ; Impact attendu : très fort ; Complexité : Moyenne ; Priorité : P1.
8. Unification des chemins candidat — Pourquoi maintenant : réduit la confusion et l’abandon ; Impact attendu : fort ; Complexité : Faible ; Priorité : P1.
9. Relances et rappels intelligents — Pourquoi maintenant : aide à la rétention ; Impact attendu : fort ; Complexité : Moyenne ; Priorité : P2.
10. Meilleure valorisation des offres enregistrées — Pourquoi maintenant : les favoris existent déjà mais sont sous-exploités ; Impact attendu : moyen ; Complexité : Faible ; Priorité : P2.
11. Recherche avancée plus orientée candidat — Pourquoi maintenant : la base est bonne, mais la logique de conversion manque ; Impact attendu : fort ; Complexité : Faible ; Priorité : P2.
12. Historique de consultation — Pourquoi maintenant : aide à la rétention et à la personnalisation ; Impact attendu : moyen ; Complexité : Faible ; Priorité : P2.
13. Certificats et qualifications — Pourquoi maintenant : enrichit le profil sans surcomplexifier ; Impact attendu : moyen ; Complexité : Faible ; Priorité : P2.
14. Portfolio / liens professionnels — Pourquoi maintenant : utile aux profils plus avancés ; Impact attendu : moyen ; Complexité : Moyenne ; Priorité : P3.
15. Priorisation des notifications par urgence — Pourquoi maintenant : améliore clarté et actionabilité ; Impact attendu : moyen ; Complexité : Faible ; Priorité : P2.

## 8. Fonctionnalités à ne pas ajouter maintenant

Les fonctionnalités ci-dessous sont tentantes, mais risquent de créer du bruit ou du coût sans valeur immédiate pour EMPLOI+ au stade actuel :

- assistant de recrutement complet : trop coûteux et peu justifié ;
- chat IA candidat massif : peu utile si la relation avec les offres reste faible ;
- alertes multi-canal non justifiées : email + SMS + WhatsApp peut être trop lourd sans validation du besoin ;
- “recommandation ultra-personnalisée” sans explication : risque de perte de confiance ;
- module social / réseau professionnel candidat : non prioritaire pour une plateforme de job board ;
- gamification excessive : peu compatible avec le besoin de sérieux d’un service RH ;
- énorme catalogue de filtres avancés : plus de complexité que d’utilité si le parcours reste peu guidé ;
- offres de la même entreprise en masse : utile seulement si le nombre d’offres est important et si le matching est solide.

L’objectif est de rester lean : mieux exploiter les fonctionnalités fondatrices avant d’ajouter des systèmes plus lourds.

## 9. Roadmap finale

### IMMÉDIAT
- Alertes emploi personnalisées
- Parcours onboarding candidat
- Candidature rapide
- Score de profil + checklist
- Préférences professionnelles
- Simplification navigation candidate

### PROCHAINE VERSION
- Suivi détaillé des candidatures
- Matching explicite et transparent
- Relances et rappels
- Historique de consultation
- Gestion intelligente des offres enregistrées
- Recommandations plus actionnables

### PLUS TARD
- Portfolio / liens professionnels
- Certificats / spécialisation étendue
- Assistant de recherche ou co-pilot candidat
- Expérimentation de déclencheurs multi-canal si besoin vérifié

## 10. Conclusion

### Les 5 fonctionnalités que je recommande réellement d’ajouter
1. Alertes emploi personnalisées
2. Candidature rapide
3. Suivi détaillé des candidatures
4. Score de profil + checklist
5. Préférences professionnelles complètes

### Les 5 fonctionnalités existantes que je recommande réellement d’améliorer
1. Matching candidat/offre
2. Navigation candidat
3. Recherche avancée
4. Notifications / relances
5. Gestion des offres sauvegardées et offres urgentes

Le point de départ le plus rentable pour EMPLOI+ n’est pas de multiplier les modules, mais de transformer ses fonctionnalités existantes en un parcours candidat cohérent, guidé et rassurant. L’enjeu est moins de “rajouter” que de “faire fonctionner mieux” les éléments déjà présents et de compléter les vrais manques de conversion et de fidélisation.
