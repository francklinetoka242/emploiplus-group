# Audit et plan de finalisation — PawaPay Sandbox abonnements

**Verdict général : partiellement prêt.** L’encaissement d’abonnements est implémenté côté dépôt avec contrôle fournisseur et idempotence. Les changements de forfait sont limités à des changements payés et programmés à l’échéance. Les remboursements ne sont pas implémentés. La configuration distante PawaPay/Vercel et un test E2E Sandbox restent à confirmer.

## 1. État de l’existant

| Domaine | État constaté dans le dépôt |
|---|---|
| Paiement d’un abonnement | Présent : `api/payments/pawapay/initiate.ts`, `server/billing/pawapay.ts`, RPC `billing_create_order`, `billing_create_payment_attempt`, `billing_confirm_deposit`. Prix XAF du plan déterminé en base, pas fourni par le navigateur. |
| Statut et callback | Présents pour **Deposits** uniquement : `/status`, `/callback`, `server/billing/reconcile.ts`. Le callback ne déclenche pas de droits sur son seul contenu : le serveur consulte l’API PawaPay, puis transmet montant/devise/statut à la RPC transactionnelle. |
| Confirmation / droits | Présents dans `billing_confirm_deposit` : verrouillage des lignes, contrôle dépôt/commande/montant/devise/candidat, période et entitlement écrits dans la même transaction. `order_id` unique dans `entitlement_periods` et retour idempotent si commande déjà payée. |
| Renouvellement | Même forfait avant échéance : nouvelle période commence à l’expiration existante ; après échéance : le candidat est Free et la période commence à la confirmation. Aucun prélèvement automatique. |
| Upgrade/downgrade | RPC `billing_create_order` les classe `scheduled_change`, tarif plein du forfait cible, effet à l’expiration. L’UI annonce que le forfait courant reste valable jusque-là et qu’aucun prorata n’est appliqué. `upgrade_proration` existe dans le schéma mais n’est pas utilisé. |
| Expiration | RPC `billing_apply_due_entitlements`, appelée par le cron horaire, bascule au forfait Free si aucune période active ne prend le relais ; applique aussi les périodes payées programmées. |
| Remboursements | Absents : aucune route/service, aucun appel API Refund, aucun statut/réconciliation dédié, aucun stockage ou RPC de remboursement, aucune UI/action d’approbation. Le modèle actuel lie les tentatives aux dépôts seulement. |
| Checkout / Payout | Absents et non nécessaires au parcours actuel d’achat par dépôt. |

Migrations locales consultées uniquement : `supabase/migrations/20261012153900_create_billing_schema.sql`, `20261012160000_add_billing_backend_rpcs.sql`, `20261012163000_add_billing_subscription_read_rpc.sql`, `20261012164000_distinguish_rejected_billing_attempts.sql`. L’utilisateur indique qu’elles sont appliquées ; aucune vérification distante n’a été faite dans cet audit, et aucun SQL/migration n’a été exécuté ou changé. Le schéma actuel n’a pas de table dédiée aux remboursements.

## 2. Encaissement des abonnements — flux retenu

Conserver **Deposits** (PawaPay `POST /v2/deposits`) : c’est l’opération documentée pour collecter une Mobile Money. L’API serveur vérifie le pays, l’opérateur et XAF à partir de la configuration active, prédit le fournisseur du numéro, utilise les montants issus du plan serveur et stocke un UUID de dépôt avant l’appel. `ACCEPTED` signifie traitement accepté, pas paiement réussi. Les timeout/résultats incertains gardent le même dépôt pour statut/réconciliation ; `DUPLICATE_IGNORED` ne crée pas de nouvel identifiant.

L’endpoint `/api/payments/pawapay/providers` filtre les opérateurs actifs XAF du pays configuré. Le code pays n’est pas devinable depuis le dépôt : les opérateurs effectifs, l’activation de XAF et les limites doivent être vérifiés dans le compte via `active-conf`. Le handler, les fonctions SQL, l’authentification candidat par token Supabase, les garde-fous de propriété et les événements idempotents sont réutilisables. Configuration PawaPay et test réseau réels Sandbox restent nécessaires avant de déclarer l’encaissement opérationnel de bout en bout.

## 3. Changement de forfait — règles constatées et validation métier

- Free → Premium/Premium+ : achat au tarif plan versionné, accès après confirmation.
- Renouvellement même plan : paiement confirmé ajoute 30 jours à l’échéance existante si encore actif ; s’il est expiré, commence à la confirmation.
- Premium ↔ Premium+ : paiement du prix plein du plan cible et changement programmé à l’échéance ; les droits actuels restent jusqu’à cette date. Pas de prorata immédiat, remboursement de différence ou supplément candidat.
- Une commande en attente par candidat, une tentative ouverte par commande et une tentative réussie par commande sont contraintes en base ; les transitions candidates sont sérialisées par verrouillage.
- Le passage immédiat avec complément n’est pas offert. L’application n’a ni calcul du prorata côté serveur ni politique de rentabilité. L’ancien calcul envisagé ne doit pas être activé sans décision commerciale et coûts/frais confirmés.
- Pas d’interface/API de résiliation ou d’annulation d’un changement programmé. Comme le renouvellement est manuel, l’absence d’achat suffit au retour à Free à expiration ; l’annulation d’un changement déjà payé demanderait une règle métier spécifique.

Le fonctionnement du changement de plan est donc présent pour le chemin différé, mais les règles métier suivantes demandent validation avant toute extension : autoriser ou non un upgrade immédiat, traiter une annulation après paiement, et laisser ou retirer l’accès déjà payé après remboursement complet/partiel.

## 4. Remboursement — opération PawaPay adaptée

La documentation officielle propose **Refunds** pour retourner au client les fonds d’un dépôt réussi, depuis le solde/wallet marchand PawaPay, vers le portefeuille du dépôt d’origine. C’est l’opération à privilégier, pas un payout générique : un payout est un transfert distinct vers un destinataire et n’équivaut pas à l’annulation/remboursement d’un dépôt.

Flux documenté : stocker d’abord un UUIDv4 `refundId` et le `depositId` d’origine ; envoyer `POST /v2/refunds`. Sans montant, la demande est le remboursement du reliquat complet ; le remboursement partiel précise montant et devise. Un dépôt peut recevoir des remboursements partiels multiples si la somme ne dépasse pas l’encaissement d’origine, mais un seul remboursement peut être en cours à la fois. `ACCEPTED` est seulement l’acceptation du traitement. Confirmer par callback ou `GET /v2/refunds/{refundId}` et ne déclarer réussi qu’après statut final `COMPLETED`. Le `refundId` stable évite de réémettre aveuglément après timeout.

Avant implémentation, vérifier dans `active-conf?country=…&operationType=REFUND` que l’opérateur/devise autorise REFUND, ses minimum/maximum et sa précision décimale. Le compte doit aussi disposer du solde PawaPay requis ; frais, limites du contrat et conditions propres au compte restent à confirmer. La doc générale indique le mécanisme, pas que chaque opérateur/compte en XAF l’autorise.

Flux applicatif recommandé : remboursement **initié par un opérateur support/admin autorisé et audité**, non par un candidat pouvant falsifier son montant. RPC atomique d’éligibilité réservée à un dépôt `COMPLETED` détenu par la commande concernée ; limite cumulée et verrouillage contre demandes simultanées ; identifiant enregistré avant l’appel externe ; statut `pending/unknown` tant que le fournisseur n’a pas confirmé ; callback/statut vérifié directement auprès de PawaPay ; rapprochement idempotent. Ne pas retirer les droits ni marquer le remboursement réussi à `ACCEPTED`. Définir et valider auparavant l’effet sur les droits à `COMPLETED`, la politique full/partial, les délais d’éligibilité et l’autorité qui approuve. Aucun de ces choix ne doit être inventé.

Le modèle actuel ne suffit pas à tracer ces opérations : prévoir une table privée de remboursements liée au paiement initial, les références refund/provider, montant/devise, auteur/raison, statuts, horodatages et idempotency key ; contraintes de cumul et événements de callback ; RPCs à privilèges backend pour créer/appliquer le remboursement. Toute nouvelle migration éventuelle devra être préparée séparément et approuvée avant exécution.

## 5. Callbacks — nécessité et couverture

PawaPay dit que la même URL peut être saisie dans les champs de callback des différents types. Cela ne rend pas les corps compatibles : le handler existant exige `depositId` et n’est qu’un traitement Deposits.

| Catégorie | Nécessaire pour l’abonnement ? | Couverture actuelle | À configurer / URL cible |
|---|---|---|---|
| **Deposits** | Oui, pour notification rapide ; le statut peut aussi être interrogé | Pris en charge | `https://emploiplus-group.com/api/payments/pawapay/callback` (domaine/projet Vercel à confirmer) |
| **Refunds** | Oui si les remboursements doivent être suivis par callback ; à défaut, polling de statut possible | Non pris en charge | Après extension du callback avec dispatch `refundId` et statut vérifié : même URL cible ci-contre ; ne pas lancer de refund avant cela ou un poller dédié |
| **Checkouts** | Non : le frontend initie un dépôt Mobile Money, pas un checkout | Non pris en charge | Ne pas utiliser pour ce flux ; pas d’URL applicative dédiée |
| **Payouts** | Non : aucun versement générique n’est requis pour acheter ou changer de forfait | Non pris en charge | Ne pas utiliser comme substitut de Refund ; pas d’URL applicative dédiée |

Le chemin Vercel conventionnel est celui du handler `api/payments/pawapay/callback.ts`. `vercel.json` contient un rewrite SPA `/(.*) -> /index.html` après des routes ciblées ; le routage effectif et le domaine principal ne sont pas prouvés par les fichiers seuls. Sur le déploiement visé, vérifier TLS et que `GET /api/payments/pawapay/callback` répond `405` avec `Allow: POST`, jamais le HTML SPA. Si les quatre champs du tableau de bord sont obligatoires pour générer le jeton, PawaPay autorise officiellement la même URL dans chacun : on peut la déclarer pour le provisionnement Sandbox, mais **ne pas émettre d’opération Checkout/Payout/Refund non couverte**. Avant tout remboursement, déployer le dispatch Refund et la persistance dédiés. Toute notification inattendue doit être authentifiée/archivée et ne jamais changer d’état financier.

## 6. Configuration manuelle — PawaPay, Vercel, Supabase

1. Dans le tableau de bord **Sandbox** PawaPay, confirmer le domaine callback accessible, pays, XAF, opérateurs et opération REFUND pour l’opérateur. Les frais et limites viennent du compte/contrat et de `active-conf`, pas d’une hypothèse.
2. Déclarer l’URL callback Deposits ci-dessus. L’URL Refund sera le même ingress seulement après ajout du traitement Refund ; Checkouts/Payouts ne sont pas utilisés. Si PawaPay bloque la génération de jeton tant que les quatre champs ne sont pas remplis, la doc autorise la même URL, mais garder Checkout/Payout inutilisés et ne pas traiter leur notification comme un dépôt.
3. Vérifier l’état « signed callbacks » dans le compte. Le code supporte RFC 9421 sur la route Deposits, vérifie le digest/signature lorsque les en-têtes sont présents et peut exiger leur présence par configuration. Ne pas choisir le mode ni désactiver des signatures à l’aveugle. Une route Refund étendue devra vérifier la même signature et confirmer le statut Refund par API.
4. Générer le jeton **Sandbox** après sauvegarde des callbacks, selon le tableau de bord PawaPay, puis le saisir directement dans le coffre de secrets Vercel. Jamais dans le chat, le code ou une variable `VITE_`.
5. Renseigner le projet Vercel **Preview/Sandbox** les variables ci-dessous ; activer aussi Development pour tests locaux si nécessaire. `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont côté serveur seulement. L’utilisateur a indiqué que les migrations sont appliquées ; ne pas les rejouer. Le schéma billing est privé, les fonctions applicatives utilisent des RPC `service_role`.
6. Confirmer les variables et l’environnement attaché dans Vercel, puis redéployer le projet Sandbox pour appliquer toute modification d’environnement.
7. `vercel.json` planifie `/api/payments/pawapay/reconcile` chaque heure (`0 * * * *`), avec authentification `CRON_SECRET`. Vercel Hobby n’autorise pas une fréquence horaire (une exécution quotidienne seulement) ; la doc Vercel indique qu’il faut un plan compatible Pro/Enterprise pour ce cron horaire. Le plan attaché et le succès du cron sont à vérifier dans Vercel.

## 7. Variables exactes et statut

Les valeurs secrètes n’ont pas été lues. Le contrôle local a recherché uniquement présence/absence des noms dans `.env` et `.env.local`.

| Variable | Utilité / source | Statut local |
|---|---|---|
| `PAWAPAY_API_TOKEN` | Jeton créé dans le dashboard Sandbox ; bearer d’API serveur | Absent/vide dans les deux fichiers |
| `PAWAPAY_BASE_URL` | Hôte Sandbox officiel `https://api.sandbox.pawapay.io` ; le code refuse l’hôte production | Absent/vide |
| `PAWAPAY_COUNTRY_CODE` | Pays activé dans le compte, code ISO alpha-3 à confirmer via dashboard/active-conf | Absent/vide |
| `PAWAPAY_CALLBACK_URL` | URL publique HTTPS réellement saisie dans PawaPay ; requise pour callback et vérification de signature | Absent/vide |
| `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` | `true` ou `false` selon l’option constatée au dashboard ; rend les signatures exigées ou facultatives | Absent/vide |
| `SUPABASE_URL` | URL du projet Supabase | Présent ; valeur non affichée/vérifiée |
| `SUPABASE_SERVICE_ROLE_KEY` | Accès backend privilégié aux RPC ; coffre Vercel uniquement | Présent ; valeur non affichée/vérifiée |
| `PAWAPAY_RECONCILE_SECRET` | Secret choisi par l’opérateur pour appel manuel de réconciliation | Absent/vide |
| `PAWAPAY_RECONCILE_AFTER_SECONDS` | Délai opérateur (code : entier de 1 à 86400 secondes) avant de sélectionner les tentatives à réconcilier | Absent/vide |
| `CRON_SECRET` | Secret Vercel Cron ; authentifie l’exécution planifiée | Absent/vide dans fichiers locaux ; Vercel inconnu |

Aucune variable dédiée à Refund n’existe aujourd’hui ; l’API partage le token et l’hôte PawaPay mais le code de traitement manque. Opérateurs MTN/Airtel ne sont pas configurés en dur : ils sont obtenus par l’endpoint fournisseur, après confirmation du pays actif et de la devise XAF. Vérifier tous les secrets séparément dans les environnements Vercel sans les afficher.

## 8. Sécurité, fiabilité et coût

- Candidat authentifié via `auth.getUser(token)` ; son identité, propriétaire des commandes et tarif viennent du serveur/base.
- Tables billing privées ; RLS forcé sans policy client et RPC `SECURITY DEFINER` à `search_path` fixé, propriétaire `postgres`, exécution accordée au rôle backend seulement (selon migrations locales et vérifications Supabase précédentes).
- Dépôt : UUID préparé et persisté avant appel externe, idempotency key commande, référence unique, transaction de confirmation avec verrous ; statut fournisseur, montant et devise revérifiés ; attente/timeout ne donne aucun droit.
- Callback Deposit : corps brut borné, événement dédupliqué, vérification signature si activée, consultation status PawaPay obligatoire. Callback dupliqué ou isolé n’active pas deux fois.
- Refund à concevoir avec mêmes garanties, mais protections/idempotence **ne sont pas encore disponibles** pour les refunds ; aucune opération de remboursement ne doit être appelée avant la mise en place.
- Les appels active-conf sont faits à la lecture des opérateurs et à la validation du payeur ; statut fournisseur est appelé en cas de rafraîchissement/callback/réconciliation. Éviter le polling agressif ; utiliser le callback et cron, garder les tentatives ambiguës sans nouveau dépôt.
- Économie : pas de frais PawaPay hardcodés, pas de supplément caché ni seuil arbitraire. REFUND peut dépendre de l’opérateur, des limites et du solde marchand ; examiner le contrat et `active-conf`. Payout n’est pas présumé moins cher ni équivalent.

## 9. Tests Sandbox requis

1. Auth absente/invalide et commande d’un autre candidat : refus, aucune mutation.
2. Achat Premium 550 XAF et Premium+ 1050 XAF (si ces tarifs restent les prix DB) : falsification client ignorée, XAF et montant PawaPay concordants.
3. `ACCEPTED`/`PROCESSING` ne donne pas de droits ; `COMPLETED` via statut fournisseur active une seule fois ; `FAILED`, `REJECTED`, `NOT_FOUND` et timeout ne donnent pas de droits.
4. Callback malformé/non signé selon politique, signé RFC 9421 si activé, signature invalide, replay et doublon ; callback disant COMPLETED mais statut API absent/non final ne confirme rien.
5. Renouvellement avant/après expiration ; upgrade/downgrade payé à l’échéance ; expiration vers Free ; paiements concurrents, aucune double période ni activation.
6. Pour Refund une fois implémenté : dépôt original absent/non payé, commande étrangère, montant/devise falsifiés, demande concurrente, remboursement déjà en cours, partiel/full/cumul max, `ACCEPTED` puis `COMPLETED`/`FAILED`, timeout réconcilié avec le même refundId, callback dupliqué ; les droits suivent uniquement la politique approuvée après finalité fournisseur.
7. Vérifier callback public et cron de bout en bout sur le domaine Sandbox. Utiliser les numéros de test officiels et mocks automatisés ; aucune transaction réelle.

Le dépôt contient `tests/server/pawapay.test.ts`, `pawapay-signatures.test.ts` et `pawapay-api.test.ts`, mais `package.json` ne déclare pas de script `test`. L’exécution directe avec Node 24 en mode strip-types lors de l’audit précédent a échoué sur la résolution des imports `.js` vers `.ts` et la syntaxe TypeScript non supportée ; ces tests ne sont donc pas déclarés passants. Choisir/utiliser un runner ESM TypeScript compatible avant le test Sandbox ; aucun vrai jeton ne doit être utilisé en tests unitaires.

## 10. Exécution priorisée et points bloquants

**Priorité 1 — Encaissement :** renseigner configuration Sandbox manquante, vérifier domaine/API Vercel et valeurs actives du compte ; exécuter tests automatisés puis dépôt de test Sandbox ; confirmer que callback/status aboutit à une unique période payée.

**Priorité 2 — Changements de plan :** valider explicitement la politique actuelle de paiement plein montant et prise d’effet à échéance ; valider les règles d’annulation de changement payé et décider si un futur upgrade immédiat proratisé est souhaité. Ne pas implémenter de prorata tant que formule, seuils et frais ne sont pas validés.

**Priorité 3 — Refund :** décider approbateur (support/admin), éligibilité/délai, full vs partial, conséquences exactes sur droits, notification client et gestion des litiges ; vérifier REFUND XAF par opérateur, limites/précision et solde/frais au compte ; concevoir et faire approuver la migration complémentaire, les RPC et route callback/status ; tester en Sandbox avant activation.

**Bloquants réellement externes :** rattachement public `emploiplus-group.com` au projet Vercel et routage/TLS effectifs ; token Sandbox et callbacks/signature au tableau de bord PawaPay ; pays/opérateurs/XAF/REFUND autorisés et limites/frais du compte ; variables Vercel et plan Cron ; règles métier de remboursement et d’annulation. Le dépôt ou la documentation seuls ne permettent pas de confirmer ces éléments.

Sources officielles : [dépôts — initiation](https://docs.pawapay.io/v2/api-reference/deposits/initiate-deposit), [dépôts — callbacks](https://docs.pawapay.io/v2/api-reference/deposits/deposit-callback), [Refunds — guide et limites](https://docs.pawapay.io/v2/docs/refunds), [Refund — initiation](https://docs.pawapay.io/v2/api-reference/refunds/initiate-refund), [Refund — statut](https://docs.pawapay.io/v2/api-reference/refunds/check-refund-status), [Refund — callback](https://docs.pawapay.io/v2/api-reference/refunds/refund-callback), [Payout — initiation](https://docs.pawapay.io/v2/api-reference/payouts/initiate-payout), [signature callbacks](https://docs.pawapay.io/v2/docs/signatures), [configuration active](https://docs.pawapay.io/v2/api-reference/toolkit/active-configuration), [URLs callbacks du dashboard](https://docs.pawapay.io/dashboard/other/system_conf/callback_urls), [hôte Sandbox et jetons](https://docs.pawapay.io/v2/docs/how_to_start), [Cron Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing).

**Aucun fichier applicatif ni aucune migration n’ont été modifiés ; aucune migration, transaction réelle ou déploiement n’a été exécuté.**