# Audit préalable — Paiements PawaPay Sandbox

**Date :** 12 octobre 2026
**Périmètre :** dépôt applicatif, migrations présentes et configuration Vercel. Audit en lecture seule ; aucun secret ni contenu de fichier d’environnement n’a été consulté ou reproduit. Le seul fichier créé est ce rapport.

## Synthèse

Les pages et tarifs sont présents, mais Premium et Premium+ ne disposent pas d’un parcours de paiement opérationnel. Aucun abonnement n’est stocké, aucune transaction PawaPay ni notification de paiement n’est traitée, et les avantages tarifés ne sont pas vérifiés côté serveur. Supabase reste fortement couplé au frontend ; il faut introduire des ports de persistance sans remplacer Supabase maintenant.

## État constaté

| Sujet | État | Constat |
|---|---|---|
| Offres | Présent, présentation seulement | Gratuit : 0 FCFA ; Premium : 550 FCFA/mois, jusqu’à 7 recommandations ; Premium+ : 1 050 FCFA/mois, toutes recommandations et alertes e-mail. |
| Souscription | Incomplet | Les routes candidat et pages d’information existent. Premium affiche un bouton désactivé « Bientôt disponible » ; aucun appel de paiement ni parcours de souscription actif n’a été trouvé. |
| Authentification/profil | Présent | Supabase Auth identifie le candidat ; `candidates` lie un profil à `auth.users`. Aucun champ/objet d’abonnement dans le profil ou les types examinés. |
| Stockage/RLS | Présent pour les profils, absent pour la facturation | Migrations candidat avec RLS et liaison au propriétaire ; aucune migration/table/politique d’abonnement, de paiement, de remboursement ou de webhook trouvée. Ne pas ajouter les droits d’abonnement à une ligne profil modifiable par le candidat. |
| Backend et API | Présent, sans paiement | API Vercel existantes pour inscription, e-mail, mots de passe, etc. ; aucun handler PawaPay/transaction/webhook. Aucun dossier Edge Functions Supabase trouvé. |
| SMTP | Présent, non raccordé aux abonnements | Nodemailer et variables SMTP côté serveur ; le modèle transactionnel est réutilisable. `/api/send-email` est un endpoint générique sans contrôle d’accès ni limitation explicites visibles : ne pas l’exposer comme déclencheur de notifications de paiement. |
| Configuration/déploiement | Présent, à compléter | Vercel déploie `api/` et redirige le frontend ; aucun cron de réconciliation dans `vercel.json`. La configuration PawaPay et ses secrets ne sont pas établis par le code audité. |
| Paiements, historique, remboursements | Absent | Aucun registre d’ordres/transactions, événement de paiement, statut vérifié, mécanisme de remboursement ou journal de réconciliation trouvé. |
| Protection Premium | Absente | L’accès candidat est contrôlé, mais aucune vérification d’entitlement Premium côté API/matching n’a été trouvée. Le nombre de recommandations par forfait est décrit dans l’UI ; la recherche de recommandations reçoit une limite générique. |
| Rappels PawaPay | Absent / à préciser | Aucune catégorie, préférence ou configuration de rappel PawaPay dans le dépôt. Les quatre catégories exactes et leur sémantique doivent être confirmées dans la documentation/console du compte marchand Sandbox, sans en inventer les noms. |

## Fichiers à connaître et éléments réutilisables

- Offres et parcours : [CandidateSubscriptionPage](src/pages/candidate/CandidateSubscriptionPage.tsx), [CandidatePremiumSubscriptionPage](src/pages/candidate/CandidatePremiumSubscriptionPage.tsx), [CandidatePremiumPlusSubscriptionPage](src/pages/candidate/CandidatePremiumPlusSubscriptionPage.tsx), [CandidateFreeSubscriptionPage](src/pages/candidate/CandidateFreeSubscriptionPage.tsx), [App](src/App.tsx).
- Identité et profil : [AuthContext](src/features/authentication/context/AuthContext.tsx), [profileApi](src/features/candidates/api/profileApi.ts), [candidates migration](supabase/migrations/20260702_create_candidates_table.sql).
- Couplage DB/matching : [client Supabase](src/integrations/supabase/client.ts), [client.server.ts](src/integrations/supabase/client.server.ts), [aiMatchingService](src/services/aiMatchingService.ts), [types Supabase](src/integrations/supabase/types.ts). Le client « server » est un alias du client Supabase standard, pas un dépôt privilégié à réutiliser pour les paiements.
- Hébergement/e-mails : [vercel.json](vercel.json), [send-email API](api/send-email.ts), [modèle transactionnel](server/transactional-email.ts). Nodemailer et le rendu d’e-mail sont réutilisables ; l’envoi de reçu/activation n’est pas raccordé.
- La dépendance `standardwebhooks` est présente, mais aucun usage dans le flux PawaPay n’a été trouvé ; sa présence seule ne valide ni signature ni authenticité de notification.

## Lacunes et architecture cible

1. Ajouter des API Vercel serveur uniquement : création de paiement, webhook PawaPay, consultation de statut, annulation et remboursement si disponibles. Le client ne choisit jamais le montant final ; le serveur valide l’utilisateur, le forfait, la devise, le téléphone et les prix/durées d’un catalogue maîtrisé.
2. Séparer `PaymentProvider` (adaptateur PawaPay) de `SubscriptionService` et de `SubscriptionRepository`. Ajouter d’abord un adaptateur Supabase/PostgreSQL ; les handlers/services ne doivent dépendre ni du SDK Supabase ni de son format de réponse. Garder l’auth Supabase existante derrière un service d’identité.
3. Enregistrer commandes, transactions, abonnements, événements de webhook et outbox e-mail avec clés d’idempotence/contraintes uniques. Aucune activation depuis le navigateur, un retour URL ou un webhook non authentifié ; appliquer une machine d’états avec transitions autorisées.
4. Authentifier le webhook selon le mécanisme officiel PawaPay ; valider référence, montant, devise, compte bénéficiaire et état. Dédupliquer chaque notification, persister l’événement, répondre rapidement, traiter les reprises sans double activation.
5. Avant activation, vérifier l’état auprès de PawaPay (webhook comme signal, API de statut comme vérification), puis enregistrer dates de début/fin et événement de renouvellement. Définir avant codage si « / mois » signifie achat d’un mois ou renouvellement automatique, ainsi que les règles d’échec, grâce et annulation.
6. Vérifier PawaPay et le compte marchand pour disponibilité/éligibilité aux remboursements ; modéliser remboursement partiel/total et ses états uniquement si l’API les autorise. Sinon, documenter le processus manuel sans simuler un remboursement technique.
7. Confirmer les quatre catégories de rappels avec PawaPay, leurs identifiants, délais et réglages disponibles ; les représenter par une configuration validée, séparée des secrets. Ne déclencher chaque rappel qu’une fois, selon l’état effectif du paiement.
8. Envoyer reçu, activation, renouvellement, expiration, annulation et remboursement via un service serveur utilisant SMTP existant et une outbox rejouable. Journaliser les échecs sans perdre l’état de paiement ni révéler de données sensibles.
9. Ajouter contrôles d’accès Premium dans les services backend qui délivrent les fonctions/quotas et une lecture d’entitlement côté UI. L’état d’abonnement ne doit être modifiable que par le service serveur ; RLS refuse les écritures directes du candidat.
10. Ajouter journal d’audit sans secrets, tâche périodique de réconciliation des paiements en attente/incohérents et alertes opérationnelles. Vercel Cron/stockage durable aujourd’hui ; même interface repository et worker/cron PostgreSQL sur LWS demain. Ne pas dépendre de mémoire locale ou d’un processus persistant Vercel.

## Plan d’implémentation ordonné

1. Confirmer contrat marchand Sandbox, moyens de paiement, callbacks/statuts, rappels et remboursement ; décider renouvellement et règles métier des forfaits.
2. Définir états, schéma et migrations idempotentes (commandes, transactions, événements, abonnements, outbox), contraintes uniques et RLS restrictive.
3. Introduire les ports dépôt/identité/e-mail et leurs implémentations Supabase/SMTP ; établir le catalogue tarifaire côté serveur.
4. Implémenter initiation sécurisée, vérification de statut et webhook authentifié/idempotent ; tests unitaires et d’intégration des doublons, erreurs et états hors ordre.
5. Ajouter activation/renouvellement/expiration/annulation, autorisations Premium serveur, notifications et remboursements conditionnels.
6. Ajouter rapprochement planifié, journalisation, alertes et tests Sandbox de bout en bout ; documenter secrets à configurer côté Vercel sans les versionner.
7. Pour LWS, remplacer uniquement les adaptateurs DB/hébergement planifié après tests de migration et de compatibilité PostgreSQL ; conserver les règles métier et l’adaptateur fournisseur.
