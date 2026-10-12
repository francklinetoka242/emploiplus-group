# Implémentation des quatre callbacks PawaPay

## Résumé

Les quatre catégories ont maintenant des routes de callback séparées. Le callback **Deposits** existant est conservé. Les trois nouveaux handlers vérifient le type et l'identifiant attendu, valident la signature RFC 9421 selon la configuration, interrogent l'API PawaPay authentifiée et enregistrent un événement idempotent sans initier de transaction ni modifier les droits d'abonnement.

Une migration additive crée le stockage idempotent pour les callbacks Checkouts, Payouts et Refunds et un registre Refund → dépôt payé. **La migration n'a pas été exécutée.** Les endpoints nécessitant cette migration ne seront opérationnels dans l'environnement déployé qu'après examen puis application de celle-ci. Les tests font appel à une API et à un stockage simulés ; aucun paiement, déploiement, accès aux paramètres PawaPay/Vercel ou SQL distant n'a été effectué.

PawaPay documente les callbacks comme des POST portant l'objet de transaction à son statut final. Les callbacks signés utilisent les en-têtes RFC 9421 et les clés publiques PawaPay. Le tableau de bord autorise la même URL pour différents types, mais ce projet configure ici des routes distinctes pour éviter tout dispatch ambigu et lier chaque signature au chemin correspondant.

## Fichiers créés et modifiés

**Créés**

- `api/payments/pawapay/checkouts/callback.ts`
- `api/payments/pawapay/payouts/callback.ts`
- `api/payments/pawapay/refunds/callback.ts`
- `server/billing/callbacks.ts`
- `supabase/migrations/20261012170000_add_pawapay_callback_categories.sql` — migration additive, non exécutée.
- `tests/server/pawapay-callback-categories.test.ts`
- `docs/audits/PAWAPAY_FOUR_CALLBACKS_IMPLEMENTATION.md`

**Modifiés**

- `server/billing/config.ts` — configuration des URL par catégorie.
- `server/billing/signatures.ts` — vérification RFC 9421 à partir de l'URL de callback propre à la route.
- `server/billing/pawapay.ts` — interrogation des ressources Checkout, Payout et Refund par l'API authentifiée.
- `PAWAPAY_SANDBOX_SETUP.md` — variables, routes et prérequis.

Le handler Deposits et `vercel.json` n'ont pas été modifiés. Les fichiers `api/` sont les fonctions Vercel selon l'architecture décrite dans le dépôt ; le domaine et le routage du déploiement réel restent à vérifier.

## URL et traitement par catégorie

Le dépôt utilise `emploiplus-group.com` comme domaine canonique du site, mais ne confirme pas son rattachement au projet Vercel cible. Les URL complètes ci-dessous sont donc des **candidates conditionnelles**, pas des URL de production vérifiées. Si un autre domaine dessert le déploiement, conserver les chemins et remplacer le domaine par celui confirmé.

| Catégorie     | Endpoint et URL candidate                                                                                                | Traitement                                                                                                                                                                                                                                                                                                                                                          | Tests                                                                                                                                    | Prêt pour Sandbox                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Checkouts** | `POST /api/payments/pawapay/checkouts/callback` — `https://emploiplus-group.com/api/payments/pawapay/checkouts/callback` | Exige `checkoutId` et un statut final (`COMPLETED`, `FAILED`, `EXPIRED`, `CANCELLED`), puis confirme l'identifiant et le statut via `GET /v2/checkouts/{checkoutId}`. Enregistre l'événement. Ne crédite aucun compte et n'active aucun abonnement ; l'application n'initie pas de Checkouts.                                                                       | Oui : callback valide, doublon, payload de mauvaise catégorie, statut fournisseur différent, signature manquante lorsqu'elle est exigée. | **Non** — migration non appliquée, domaine/configuration Vercel à confirmer ; stockage d'événement uniquement.                 |
| **Deposits**  | `POST /api/payments/pawapay/callback` — `https://emploiplus-group.com/api/payments/pawapay/callback`                     | Handler existant conservé. Vérifie le callback, enregistre son empreinte, relit le statut du dépôt chez PawaPay et ne confirme le paiement/droit qu'au moyen des RPC billing existantes.                                                                                                                                                                            | Oui : tests de régression existants, dont le test où un callback `COMPLETED` non confirmé par PawaPay ne confère aucun droit.            | **Non** — le code est testé, mais le domaine, le déploiement, les variables et la configuration du compte restent à confirmer. |
| **Payouts**   | `POST /api/payments/pawapay/payouts/callback` — `https://emploiplus-group.com/api/payments/pawapay/payouts/callback`     | Exige `payoutId` et `COMPLETED` ou `FAILED`, confirme le statut via `GET /v2/payouts/{payoutId}`, puis enregistre l'événement. Le callback n'initie jamais de payout. L'application n'a pas de workflow métier d'émission de payouts.                                                                                                                               | Oui : callback valide, doublon, mauvais type, statut fournisseur différent et erreur de consultation fournisseur.                        | **Non** — migration non appliquée et aucun workflow métier payout dans l'application.                                          |
| **Refunds**   | `POST /api/payments/pawapay/refunds/callback` — `https://emploiplus-group.com/api/payments/pawapay/refunds/callback`     | Exige `refundId` et `COMPLETED` ou `FAILED`, confirme le statut via `GET /v2/refunds/{refundId}`. N'accepte d'enregistrer un statut que si le Refund a été préenregistré par l'appel backend `billing_register_pawapay_refund(refundId, sourceDepositId)` et associé à un dépôt réussi. Ne déclenche pas de remboursement et ne modifie pas les droits du candidat. | Oui : callback associé, doublon, Refund non enregistré, mauvais type, statut fournisseur différent et signature requise absente.         | **Non** — migration non appliquée et le projet n'a pas encore de workflow opérateur qui enregistre/initie un remboursement.    |

PawaPay indique explicitement qu'une même URL peut être utilisée pour plusieurs catégories ([documentation des URL de callback](https://docs.pawapay.io/dashboard/other/system_conf/callback_urls)). **Ne pas mettre la même URL dans les quatre champs avec la configuration de routes distinctes ci-dessus** : chaque URL et variable doit correspondre exactement au chemin signé de la catégorie concernée.

## Sécurité, déduplication et transitions

- Tous les nouveaux endpoints sont `POST` seulement, lisent le corps brut (limite 64 Kio), rejettent le JSON invalide, les identifiants non UUID, les statuts non finaux et les identifiants appartenant à une autre catégorie.
- Les vérifications de signature réutilisent l'implémentation RFC 9421 et les clés PawaPay (`/v2/public-key/http`). Lorsque `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED=true`, une signature absente/invalide est rejetée. Lorsque le paramètre vaut `false`, le contenu du callback n'est pas réputé authentifié ; chaque nouveau handler confirme malgré tout le statut par l'API PawaPay avant tout enregistrement.
- Le statut reçu doit être le même que le statut renvoyé par l'API de consultation correspondante. Un statut absent, non trouvé ou différent n'est pas acquitté comme réussi.
- La table `billing.pawapay_callback_events` rend l'identifiant d'opération unique par catégorie ; un callback final répété est acquitté sans réappliquer de transition. Les callbacks contradictoires sont refusés. Seuls le statut final confirmé et une empreinte SHA-256 sont enregistrés, pas le corps potentiellement personnel du callback.
- La table `billing.pawapay_refund_operations` relie chaque `refundId` à un `payment_attempt` réussi. La RPC de préenregistrement refuse un dépôt qui n'est pas associé à une commande payée et à une tentative réussie. La RPC de callback ne met à jour que le statut Refund vérifié ; aucune activation, révocation ou modification du montant d'un paiement n'est déclenchée.
- Les callbacks Checkout/Payout sont un journal confirmé côté fournisseur seulement. Ils ne confèrent pas de droits, ne modifient pas le solde et n'initient aucune opération financière.
- En cas d'erreur de configuration, de stockage ou de vérification, les endpoints renvoient une erreur au lieu d'un succès fictif. PawaPay demande une réponse `HTTP 200` pour considérer le callback livré et effectue des tentatives de livraison ; les nouveaux handlers ne renvoient `200` qu'après confirmation fournisseur et enregistrement.

Références officielles : [callbacks et tentatives HTTP](https://docs.pawapay.io/v2/docs/what_to_know#callbacks), [signatures](https://docs.pawapay.io/v2/docs/signatures), [callback Checkout](https://docs.pawapay.io/v2/api-reference/checkouts/checkout-callback), [callback Deposit](https://docs.pawapay.io/v2/api-reference/deposits/deposit-callback), [callback Payout](https://docs.pawapay.io/v2/api-reference/payouts/payout-callback), [callback Refund](https://docs.pawapay.io/v2/api-reference/refunds/refund-callback), [statuts finaux](https://docs.pawapay.io/dashboard/transactions/transaction_statuses).

## Tests et validation

Commande exécutée avec Node `v24.14.1`, `ts-node/esm` en mode transpilation :

```powershell
$env:TS_NODE_EXPERIMENTAL_RESOLVER = 'true'
$env:TS_NODE_TRANSPILE_ONLY = 'true'
$env:TS_NODE_COMPILER_OPTIONS = '{"module":"ESNext","moduleResolution":"Bundler","allowImportingTsExtensions":true}'
$env:TS_NODE_LOG_ERROR = 'true'
node --loader ts-node/esm --test tests\server\pawapay-callback-categories.test.ts tests\server\pawapay-signatures.test.ts tests\server\pawapay-api.test.ts tests\server\pawapay.test.ts
```

**Résultat : 25 tests réussis, 0 échec.** Les tests incluent les trois nouveaux endpoints ainsi que les tests de signature, d'initiation/statut et de callback Deposits existants. ESLint ciblé a réussi sur tous les fichiers TypeScript modifiés ; Prettier a validé ces mêmes fichiers. Les diagnostics de l'éditeur ne signalent pas d'erreur sur les nouvelles routes/services/tests.

La migration n'a pas été appliquée ni testée contre une base réelle. Aucun client PostgreSQL n'était disponible dans l'environnement ; l'exécution SQL est volontairement différée jusqu'à validation de cette migration. Les tests utilisent des réponses simulées et ne prouvent ni le déploiement Vercel ni la configuration distante.

## Variables et étapes restantes

Configurer côté serveur uniquement, sans préfixe `VITE_` :

- Variables existantes : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAWAPAY_API_TOKEN`, `PAWAPAY_BASE_URL`, `PAWAPAY_COUNTRY_CODE`.
- URL callback Deposits : `PAWAPAY_CALLBACK_URL`.
- Nouvelles URL : `PAWAPAY_CHECKOUT_CALLBACK_URL`, `PAWAPAY_PAYOUT_CALLBACK_URL`, `PAWAPAY_REFUND_CALLBACK_URL`.
- Paramètre de signature commun : `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` (`true` ou `false`, défini selon le compte PawaPay ; privilégier les callbacks signés).

Avant configuration finale ou utilisation dans Sandbox :

1. Confirmer dans Vercel le domaine HTTPS de production et vérifier que les quatre chemins arrivent à leurs fonctions Vercel. Le domaine canonique du site n'est pas une preuve de rattachement au projet. Adapter chaque URL d'environnement et du tableau de bord au domaine réellement confirmé.
2. Vérifier les migrations réellement appliquées à Supabase. Après revue/validation, appliquer **une seule fois** `20261012170000_add_pawapay_callback_categories.sql`, sans rejouer les migrations antérieures. Cela n'a pas été fait dans cette tâche.
3. Définir les quatre variables d'URL comme des URL HTTPS publiques exactes, sans query string, chacune avec le chemin correspondant. Saisir les mêmes URL dans les champs PawaPay Sandbox concernés et confirmer l'option de signature.
4. Redéployer l'environnement Sandbox, puis contrôler que chaque chemin répond comme une fonction API (un `GET` doit renvoyer `405` avec `Allow: POST`, et non la page SPA).
5. Avant toute opération Refund, faire enregistrer son UUIDv4 et son dépôt source payé par un workflow backend opérateur autorisé appelant la RPC préenregistrement. **Ce workflow n'est pas implémenté ici** ; ne pas initier de remboursement tant qu'il manque et que les règles d'autorisation/effet sur les droits ne sont pas définies.
6. Effectuer ensuite des essais Sandbox contrôlés par catégorie et inspecter les statuts/événements. Aucun paiement ni test E2E PawaPay réel n'a été effectué pendant cette tâche.

La génération du jeton Sandbox et l'acceptation des quatre URLs par le tableau de bord dépendent encore de la configuration distante du compte. Le handler Deposits et ses tests sont présents, mais son domaine, ses variables et son déploiement restent à confirmer. Les trois nouveaux handlers ne peuvent fonctionner en déploiement qu'après application de la migration additive ; Refunds exige en plus un workflow qui enregistre chaque remboursement avant son initiation. Aucune catégorie n'est déclarée prête pour Sandbox avant vérification de ses prérequis.
