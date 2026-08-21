# Base de connaissances Support — site officiel EmploiPlus Group

## 1. Produit et périmètre

Le site officiel est un site de recrutement / mise en relation candidaturaire. Il mélange :
- contenu public marketing et institutionnel ;
- recherche d’offres d’emploi publique ;
- espace candidat protégé ;
- gestion de profil, documents, candidatures, recommandations ;
- abonnements Free / Premium / Premium+ ;
- back-office admin pour contenu et gestion.

Le futur site Support doit expliquer l’usage réel pour le candidat, pas la logique interne.

### Statut général des grandes fonctionnalités

| Fonctionnalité | Statut | Vérification |
|---|---|---|
| Création de compte | ACTIVE | code Supabase Auth confirmée |
| Connexion | ACTIVE | signInWithPassword confirmé |
| Confirmation email | ACTIVE | vérification email_confirmed_at confirmée |
| Mot de passe oublié | ACTIVE | API reset confirmée |
| Profil candidat | ACTIVE | table candidates confirmée |
| CV | ACTIVE | upload + extraction PDF confirmée |
| Autres documents | ACTIVE | stockage local + Supabase Storage |
| Recherche d'offres | ACTIVE | query + filtres confirmés |
| Offres sauvegardées | ACTIVE | candidate_saved_offers confirmée |
| Candidatures | ACTIVE | job_applications confirmée |
| Recommandations | PARTIELLEMENT ACTIVE | RPC + embeddings confirmés |
| Notifications | ACTIVE | table notifications confirmée |
| Guides / fiches | ACTIVE | local_guides confirmées |
| Abonnements | PARTIELLEMENT ACTIVE | pages + prix visibles, logique réelle partiellement confirmée |
| Admin | ACTIVE | routes + pages admin confirmées |

## 2. Ce que l’utilisateur peut réellement faire

### Compte et accès
- créer un compte candidat ;
- recevoir un email de confirmation ;
- se connecter ;
- retrouver un mot de passe ;
- accéder à un espace candidat protégé ;
- se déconnecter ;
- modifier son mot de passe via le compte.

### Profil candidat
- renseigner nom, email, téléphone, localisation, bio, titre professionnel ;
- ajouter une photo ;
- ajouter des expériences, formations, compétences, langues, préférences ;
- compléter son profil ;
- consulter le pourcentage de complétude.

### CV et documents
- ajouter un CV PDF ;
- visualiser le CV ;
- remplacer le CV ;
- supprimer le CV ;
- ajouter d’autres documents PDF ou images selon les règles ;
- supprimer ou remplacer les documents additionnels.

### Offres et recherche
- consulter la liste des offres publiées ;
- rechercher par mot-clé ;
- filtrer par entreprise, localisation, type de contrat ;
- ouvrir le détail d’une offre ;
- sauvegarder une offre ;
- postuler à une offre ;
- suivre ses candidatures.

### Recommandations
- recevoir des offres recommandées à partir du CV et du profil ;
- améliorer les recommandations en complétant son profil et son CV.

### Abonnements
- consulter les forfaits Gratuit / Premium / Premium+ ;
- voir ce que chaque formule inclut ;
- certaines fonctionnalités présentées comme incluses peuvent être uniquement marketing ou non totalement activées, selon le code et l’UI.

## 3. Vérification des fonctionnalités critiques

### 3.1. Création de compte

STATUT : ACTIVE

CONFIRMÉ :
- appel Supabase Auth signUp ;
- email demandé ;
- mot de passe demandé ;
- redirection de confirmation configurable ;
- l’email doit être confirmé pour considérer la session comme valide.

Problèmes Support fréquents :
- email non reçu ;
- compte non confirmé ;
- inscription refusée.

### 3.2. Connexion

STATUT : ACTIVE

CONFIRMÉ :
- signInWithPassword ;
- vérification email_confirmed_at ;
- déconnexion si email non confirmé ;
- session gérée via AuthContext + Supabase.

Problèmes possibles :
- identifiants incorrects ;
- email non confirmé ;
- session expirée ;
- compte sans profil candidat.

### 3.3. Mot de passe oublié / reset

STATUT : ACTIVE

CONFIRMÉ :
- endpoint de demande de reset ;
- endpoint de confirmation / reset ;
- API updateUser({ password: newPassword }) pour la mise à jour.

Support à prévoir :
- lien introuvable ;
- email non reçu ;
- reset refusé.

### 3.4. Profil candidat

STATUT : ACTIVE

CONFIRMÉ :
- le candidat peut renseigner des informations personnelles et professionnelles ;
- profil stocké dans la table candidates ;
- données additionnelles dans les tables dédiées : experience, education, skills, languages, preferences.

Éléments utiles au support :
- nom, localisation, résumé, photo, compétences, expériences, langues, préférences ;
- profil incomplet = perte éventuelle de recommandations ou de confiance dans le parcours.

### 3.5. Complétude du profil

STATUT : ACTIVE

CONFIRMÉ :
- le calcul est basé sur 10 éléments :
  - nom complet ;
  - titre professionnel ;
  - localisation ;
  - résumé professionnel ;
  - photo ;
  - expérience ;
  - formation ;
  - compétence ;
  - langue ;
  - préférences RH.

Le pourcentage est calculé à partir de ces éléments.

Support à prévoir :
- pourquoi le profil est “incomplet” ;
- quels champs manquent ;
- comment améliorer la recommandation.

## 4. Vérification des abonnements

### 4.1. Formules affichées

CONFIRMÉ :
- Gratuit : 0 FCFA ;
- Premium : 550 FCFA ;
- Premium+ : 1 050 FCFA.

### 4.2. Gratuit

STATUT : PARTIELLEMENT ACTIVE

CONFIRMÉ :
- page /candidate/subscription/free existante ;
- avantages affichés en UI ;
- l’accès au parcours candidat est déjà fonctionnel même sans abonnement.

À distinguer :
- ce qui est visible comme “fonctionnement” dans l’UI ;
- ce qui est réellement activé dans la logique métier.

Compatibilité Support :
- le candidat peut avoir un compte gratuit et utiliser les fonctions de base ;
- les limites de contenu ou d’accès doivent être décrites comme offertes dans l’UI et non comme garantie de logique backend.

### 4.3. Premium

STATUT : PARTIELLEMENT ACTIVE

CONFIRMÉ :
- page /candidate/subscription/premium existante ;
- “Jusqu’à 7 recommandations” et “accès à davantage de correspondances” visibles dans l’UI.

À VÉRIFIER / À NUANCER :
- le niveau exact d’accès réel et les limites fonctionnelles doivent être distingués de l’UI marketing.

### 4.4. Premium+

STATUT : PARTIELLEMENT ACTIVE

CONFIRMÉ :
- page /candidate/subscription/premium-plus existante ;
- le prix affiché est 1 050 FCFA / mois ;
- les fonctionnalités suivantes sont présentées comme incluses dans l’UI :
  - toutes les recommandations disponibles ;
  - aucune limite artificielle ;
  - accès complet aux correspondances ;
  - alertes e-mail ;
  - filtres par niveau de compatibilité.

Attention :
- les textes marketing peuvent ne pas correspondre exactement au comportement réel complet du produit.
- certaines fonctionnalités peuvent être visibles en UI sans être totalement activées côté logique de runtime.

### 4.5. Bientôt disponible / UI uniquement

STATUT : BIENTÔT DISPONIBLE / UI UNIQUEMENT

À distinguer absolument :
- éléments affichés dans les cartes / pages d’abonnement ;
- éléments réellement actifs dans les services et APIs ;
- éléments annoncés mais non confirmés comme fonctionnels.

Le futur Support doit documenter :
- ce qui est disponible ;
- ce qui est marketing ;
- ce qui est annoncé mais non encore disponible.

## 5. Vérification du flux CV / documents

### 5.1. Ajout du CV

STATUT : ACTIVE

COMPORTEMENT visible :
- le candidat ajoute un CV PDF ;
- le fichier est uploadé ;
- il est visible dans la page Documents / Profil / Dashboard.

COMPORTEMENT interne confirmé :
- uploadFileToStorage ;
- stockage dans bucket configuré ;
- extraction du texte PDF avec pdfjs-dist ;
- sauvegarde dans candidates.cv_text ;
- génération d’un embedding vector léger ;
- enregistrement de cv_url côté table candidates.

### 5.2. Formats acceptés

CONFIRMÉ :
- CV et documents principaux : PDF uniquement ;
- taille maximum : 2 Mo ;
- images acceptées pour autres fichiers visuels : JPG, PNG, WEBP, GIF ;
- taille images : 8 Mo.

### 5.3. Enregistrement du CV

CONFIRMÉ :
- le fichier est stocké dans le bucket candidat ;
- l’URL est générée via public URL ou signed URL ;
- le document est aussi référencé dans le stockage local du client pour l’affichage rapide.

### 5.4. Affichage / remplacement / suppression

STATUT : ACTIVE

CONFIRMÉ :
- le CV peut être affiché ;
- il peut être remplacé ;
- il peut être supprimé ;
- le remplacement et la suppression passent par la logique locale + stockage Supabase.

Important pour le Support :
- les fichiers peuvent être présents côté UI même si l’état local ou le cache est partiellement vide ou désynchronisé.

### 5.5. Autres documents

STATUT : ACTIVE

CONFIRMÉ :
- les candidats peuvent ajouter plusieurs types de documents ;
- types reconnus : motivation, diploma, certificate, attestation, portfolio, other, recepisse ;
- l’humain voit ces documents dans l’espace “Documents”.

### 5.6. Différence CV vs autres documents

CONFIRMÉ :
- le CV est utilisé pour les recommandations et le matching ;
- autres documents ne sont pas traités de la même manière dans le matching IA ;
- le CV est l’élément clé pour l’analyse de compatibilité.

### 5.7. Cas problématiques fréquemment documentables

- fichier trop lourd ;
- fichier non PDF ;
- document introuvable dans la liste ;
- CV non affiché ;
- remplacement du CV qui ne se reflète pas immédiatement ;
- recommandations absentes après upload d’un CV.

## 6. Vérification du parcours de candidature

### 6.1. Parcours utilisateur

1. le candidat consulte une offre ;
2. il peut ouvrir le détail de l’offre ;
3. il peut se connecter si nécessaire ;
4. il peut postuler ;
5. il peut inclure une lettre de motivation et un objet ;
6. la candidature est enregistrée ;
7. il peut voir la candidature dans son espace ;
8. il peut voir l’état ;
9. il peut retirer sa candidature.

### 6.2. Vérifications de code

CONFIRMÉ :
- table job_applications ;
- upsert sur (candidate_id, job_offer_id) ;
- statut initial = submitted ;
- statuts possibles : submitted, reviewed, shortlisted, rejected, accepted, withdrawn.

### 6.3. Durée de conservation

CONFIRMÉ :
- les candidatures sont nettoyées après 30 jours sur la logique de récupération côté API.

### 6.4. Retrait / doublon

CONFIRMÉ :
- retrait possible via update status = withdrawn ;
- doublon évité par upsert sur la même offre pour le même candidat.

### 6.5. Questions Support Likely

- pourquoi ma candidature n’apparaît-elle pas ?
- pourquoi je vois une candidature en doublon ?
- puis-je retirer ma candidature ?
- que signifie le statut ?
- combien de temps ma candidature reste visible ?

## 7. Vérification des offres

### 7.1. Liste des offres

STATUT : ACTIVE

CONFIRMÉ :
- liste publique via /jobs ;
- filtres par mot-clé, entreprise, localisation, type de contrat ;
- statut de publication pris en compte ;
- offre publique si publiée.

### 7.2. Détail d’une offre

STATUT : ACTIVE

CONFIRMÉ :
- page /jobs/:slug ;
- informations visibles : type de contrat, localisation, description, exigences, salaire, date limite, contact, liens externes selon configuration.

### 7.3. Sauvegarde / candidature

STATUT : ACTIVE

CONFIRMÉ :
- sauvegarde d’une offre possible dans table candidate_saved_offers ;
- candidature possible via page candidate côté espace candidat.

### 7.4. Expiration / publication

PARTIELLEMENT CONFIRMÉ

CONFIRMÉ :
- les offres utilisent status = published ;
- publish_at et expires_at existent dans la structure ;
- les offres sont filtrées selon le statut et la date.

À VÉRIFIER :
- le comportement exact lors de l’expiration complète côté UI et les messages affichés.

### 7.5. Questions Support prioritaires

- “Pourquoi je ne trouve pas cette offre ?”
- “Pourquoi l’offre a disparu ?”
- “Comment enregistrer une offre ?”
- “Comment postuler ?”
- “Puis-je retirer ma candidature ?”

## 8. Vérification des recommandations et matching

### 8.1. Ce que l’utilisateur voit

STATUT : PARTIELLEMENT ACTIVE

Le candidat peut accéder à des offres recommandées dans le dashboard, en fonction de son CV et de son profil.

### 8.2. Ce qui influence les recommandations

CONFIRMÉ :
- CV (texte extrait) ;
- profil candidat ;
- compétences, expérience, formation, langue, préférences utiles à la logique de profil ;
- URLs / embeddings de la table candidates et job_offers.

### 8.3. Limites à communiquer au Support

- les recommandations ne sont pas un moteur de recherche classique ;
- elles dépendent du CV et du profil ;
- si le CV est absent ou incomplet, les recommandations peuvent être faibles ou absentes ;
- les “scores” ne sont pas toujours visibles pour l’utilisateur dans une interface claire.

### 8.4. Questions Support courantes

- “Pourquoi je n’ai pas de recommandations ?”
- “Pourquoi certaines offres ne sont pas suggérées ?”
- “Comment améliorer mes recommandations ?”

## 9. Vérification du profil et complétude

STATUT : ACTIVE

Le profil est un élément central. Le candidat peut renseigner :
- identités ;
- bio ;
- headline ;
- photo ;
- localisation ;
- expérience ;
- formations ;
- compétences ;
- langues ;
- préférences RH ;
- CV.

Le score de complétude est calculé sur les champs ci-dessus.

Support à prévoir :
- “Mon profil est incomplet” ;
- “Pourquoi mes recommandations sont faibles ?” ;
- “Quelles informations manquent à mon profil ?”

## 10. Problèmes utilisateurs plausibles

### Problème : email de confirmation non reçu
- Ce que voit l’utilisateur : compte créé mais non validé.
- Cause probable : email non confirmé, lien ou envoi non reçu.
- Solution utilisateur : vérifier la boîte mail et relancer l’email.
- Escalade Support : si l’email ne part pas / mauvais paramétrage ou cas système.

### Problème : impossible de se connecter
- Ce que voit l’utilisateur : identifiants refusés ou session invalide.
- Cause probable : mot de passe incorrect, email non confirmé, compte inexistant.
- Solution utilisateur : réinitialiser le mot de passe ou vérifier son email.
- Escalade Support : cas de session corrompue ou compte sans profil.

### Problème : mot de passe oublié
- Ce que voit l’utilisateur : lien ou email de réinitialisation absent.
- Cause probable : email n’a pas été envoyé ou le lien est invalide.
- Solution utilisateur : relancer la demande.
- Escalade Support : si l’email ne part pas.

### Problème : CV refusé / non pris en charge
- Ce que voit l’utilisateur : erreur sur upload ou CV non traité.
- Cause probable : fichier non PDF, trop volumineux, mauvais format.
- Solution utilisateur : vérifier le format et la taille.
- Escalade Support : si l’upload échoue malgré un fichier valide.

### Problème : document absent ou non affiché
- Ce que voit l’utilisateur : document non visible.
- Cause probable : cache local désynchronisé, fichier non ajouté, mauvais type, URL non résolue.
- Solution utilisateur : recharger le compte / réajouter le document.
- Escalade Support : lorsque la page ne reflète pas l’état du fichier.

### Problème : candidature impossible ou introuvable
- Ce que voit l’utilisateur : candidature non enregistrée ou non visible.
- Cause probable : email non confirmé, pas de profil candidat, offre non disponible, doublon ou retrait.
- Solution utilisateur : vérifier le profil / état de l’offre / candidature.
- Escalade Support : cas de données incohérentes ou suppression accidentelle.

### Problème : recommandations absentes
- Ce que voit l’utilisateur : très peu d’offres recommandées ou aucune.
- Cause probable : profil incomplet, CV absent, CV non traité, pas d’éléments de compatibilité.
- Solution utilisateur : remplir le profil et ajouter un CV.
- Escalade Support : si le CV est bien présent mais les recommandations restent vides.

### Problème : abonnement / forfait
- Ce que voit l’utilisateur : confusion sur ce qui est inclus.
- Cause probable : marketing UI plus fort que preuve fonctionnelle, ou différence entre texte et comportement réel.
- Solution utilisateur : vérifier la page détaillée de l’abonnement et ses limites affichées.
- Escalade Support : si un abonnement semble promettre une fonctionnalité non disponible.

## 11. Base de connaissances à créer pour le Support

### Compte
- Créer un compte candidat
- Confirmer son adresse email
- Se connecter
- Réinitialiser son mot de passe
- Se déconnecter

### Profil
- Compléter son profil
- Comprendre le score de complétude
- Modifier ses informations personnelles
- Ajouter ses expériences et formations
- Gérer compétences, langues et préférences

### CV et documents
- Ajouter un CV
- Remplacer un CV
- Supprimer un CV
- Ajouter un document
- Vérifier les formats acceptés
- Comprendre les limites de taille

### Emploi
- Rechercher une offre
- Utiliser les filtres
- Ouvrir le détail d’une offre
- Sauvegarder une offre
- Comprendre les offres expirées ou non publiées

### Candidatures
- Postuler à une offre
- Ajouter une lettre de motivation
- Vérifier le statut de sa candidature
- Retirer une candidature
- Comprendre la durée de conservation

### Recommandations
- Comprendre le mécanisme de recommandation
- Améliorer ses recommandations
- Explainer pourquoi une offre n’est pas recommandée

### Abonnements
- Comparer Free / Premium / Premium+
- Comprendre ce qui est inclus
- Distinguer fonctionnalité réelle et fonction publique marketing
- Traiter les cas “bientôt disponible”

### Problèmes fréquents
- Connexion
- Email / confirmation
- CV / documents
- Candidatures
- Recommandations
- Offres
- Abonnements

## 12. Ce qu’il faut exposer aux utilisateurs vs ce qu’il faut garder interne

### À exposer aux utilisateurs
- création de compte ;
- connexion ;
- reset de mot de passe ;
- profil ;
- CV et documents ;
- recherche / offre ;
- candidatures ;
- recommandations ;
- abonnements ;
- limites de format / taille ;
- erreurs courantes ;
- étapes de résolution.

### À ne pas exposer
- noms de tables Supabase ;
- RPC ;
- buckets Supabase ;
- noms de fichiers internes ;
- variables d’environnement ;
- tokens ou clés ;
- logique de sécurité ou de contournement ;
- détails de procédure de scoring interne inutile au support utilisateur.

## 13. Statuts de vérification

- CONFIRMÉ : les comportements ci-dessus sont directement vérifiés dans le code.
- PARTIELLEMENT CONFIRMÉ : certaines parties du comportement sont prouvées, mais la logique complète ou les limites exactes ne le sont pas entièrement.
- À VÉRIFIER : le code ne permet pas de conclure de manière sûre.
- BIENTÔT DISPONIBLE : présent dans l’UI mais non clairement actif / validé.

## 14. Corrections et contradictions détectées

### 1. Abonnements
- Les prix affichés sont confirmés dans l’UI, mais la disponibilité exacte de chaque fonctionnalité Premium / Premium+ doit être distinguée du marketing.

### 2. CV et documents
- Le code montre que le CV est bien utilisé pour les recommandations, ce qui est plus important que le simple “téléversement de fichier”.

### 3. Candidatures
- Les candidatures sont nettoyées après 30 jours dans la logique de récupération, donc la durée de visibilité doit être documentée comme une règle technique et non comme un simple message marketing.

### 4. Recommandations
- Les recommandations reposent sur le CV, le profil et les embeddings, mais l’implémentation détaillée doit rester côté technique et ne pas être exposée au support utilisateur.

### 5. Expiration des offres
- Les offres utilisent des états et dates de publication/expiration, mais l’expérience exacte côté utilisateur doit être vérifiée à l’écran plutôt que supposée.

### 6. Notifications
- Les notifications existent et sont gestionnées côté code, mais leur comportement précis côté utilisateur dépend de la table et de la logique de publication.

## 15. Informations encore nécessaires

Ces points restent à vérifier directement avec les données de prod / Supabase / règles de sécurité / logs pour une documentation Support plus complète :
- exactitude des fonctionnalités Premium / Premium+ réellement activées ;
- règles exactes d’expiration des offres et affichage des offres inactives ;
- conditions précises de disponibilité des notifications ;
- données exactes des différents statuts de candidatures selon la vraie logique métier ;
- éventuels éléments “bientôt disponibles” non documentés dans l’UI ;
- règles complètes de visibilité côté admin / supabase.

## Conclusion

Ce document ne donne pas la solution technique complète du site officiel. Il donne la base fonctionnelle minimale indispensable pour qu’un Copilot travaillant sur un repository Support séparé puisse produire une documentation utilisateur cohérente, utile, claire et orientée support.
