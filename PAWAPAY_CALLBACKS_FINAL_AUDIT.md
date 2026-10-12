# Audit final PawaPay Sandbox — callbacks et jeton API

**Verdict : BLOQUÉ pour une configuration complète des quatre catégories.** Le dépôt traite les callbacks de dépôts uniquement. L’URL candidate existe, mais le domaine et le déploiement Vercel ne sont pas vérifiables depuis les fichiers locaux. Aucun secret n’est reproduit dans ce rapport.

## 1. URLs et couverture

| Catégorie PawaPay | Route du dépôt | URL à déclarer | État |
|---|---|---|---|
| Checkouts | Aucune route/aucun traitement de checkout | **Indisponible** — ne pas déclarer la route de dépôt comme prise en charge | Non pris en charge |
| Deposits | `api/payments/pawapay/callback.ts` | `https://emploiplus-group.com/api/payments/pawapay/callback` | Handler présent ; domaine public à confirmer |
| Payouts | Aucune route/aucun traitement de payout | **Indisponible** — handler à créer avant utilisation | Non pris en charge |
| Refunds | Aucune route/aucun traitement de refund | **Indisponible** — handler à créer avant utilisation | Non pris en charge |

PawaPay indique que **la même URL peut être saisie pour tous les types** dans le tableau de bord ([documentation callbacks du tableau de bord](https://docs.pawapay.io/dashboard/other/system_conf/callback_urls)). Toutefois, cette application n’accepte que les corps de callback avec `depositId` et interroge ensuite le statut d’un dépôt. Elle ne traite donc pas sûrement les formats checkout, payout ou refund. **Ne pas considérer la même URL comme une couverture fonctionnelle des quatre catégories.** Si le tableau de bord exige ces champs pour générer le jeton, les handlers manquants doivent être ajoutés (ou une décision explicite doit être prise pour les catégories que l’application n’utilisera pas).

Le fichier API Vercel sous `api/payments/pawapay/callback.ts` correspond conventionnellement au chemin `/api/payments/pawapay/callback`. `vercel.json` déclare également une réécriture générique vers `/index.html` et un cron ; les fichiers seuls ne prouvent pas la priorité des règles effectives dans le projet déployé. Le domaine `emploiplus-group.com` a été fourni, mais son rattachement au projet Vercel et le certificat HTTPS ne sont pas vérifiables ici. Avant configuration PawaPay, tester ce chemin sur le déploiement visé : `GET` doit atteindre la fonction et renvoyer `405` avec `Allow: POST`, pas la page SPA.

## 2. Vérifications de sécurité du handler Deposits

- Accepte seulement `POST`, lit le corps brut (limite 64 Kio), valide le JSON, l’UUID du dépôt et le format du statut.
- Exige `PAWAPAY_CALLBACK_URL` et le réglage explicite `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED`.
- Si les en-têtes RFC 9421 sont présents, vérifie le digest et la signature avec les clés publiques PawaPay. Si leur absence est autorisée par le réglage du compte, le callback est traité comme **non fiable**.
- Avant toute confirmation, appelle l’API PawaPay authentifiée de statut de dépôt ; le callback seul ne donne aucun droit. Le RPC de confirmation vérifie ensuite dépôt, statut, montant et devise et applique les changements en base.
- Enregistre les événements par empreinte et utilise les RPC de billing pour éviter un double traitement. Une indisponibilité du statut fournisseur renvoie une erreur réessayable plutôt qu’une activation.
- Cette validation et cette idempotence ne valent que pour **Deposits**. Les autres formats sont rejetés ou non gérés ; ne pas les activer comme flux de paiement.

PawaPay décrit les callbacks comme asynchrones, exige un endpoint accessible en HTTPS acceptant `POST`, attend `200 OK`, réessaie pendant 15 minutes et permet un renvoi dans les 90 jours. Les signatures de callback RFC 9421 sont optionnelles côté compte ([callbacks](https://docs.pawapay.io/v2/docs/what_to_know#callbacks), [signatures](https://docs.pawapay.io/v2/docs/signatures), [callback Deposit](https://docs.pawapay.io/v2/api-reference/deposits/deposit-callback)). Le handler confirme par consultation API avant attribution, ce qui protège aussi lorsque le callback n’est pas signé.

## 3. Variables d’environnement

| Nom exact | Usage / où obtenir la valeur | Présence vérifiable |
|---|---|---|
| `PAWAPAY_API_TOKEN` | Jeton **Sandbox** généré dans le tableau de bord Sandbox avec le rôle Technical Administration ; garder côté serveur | Absent des `.env` et `.env.local` locaux inspectés ; Vercel inconnu |
| `PAWAPAY_BASE_URL` | Hôte officiel Sandbox : `https://api.sandbox.pawapay.io` ; la configuration serveur refuse tout hôte différent | Absent des fichiers locaux inspectés ; Vercel inconnu |
| `PAWAPAY_COUNTRY_CODE` | Code pays à trois lettres réellement activé dans le compte Sandbox ; confirmer dans le tableau de bord / `active-conf` | Absent local ; valeur du compte inconnue |
| `PAWAPAY_CALLBACK_URL` | URL HTTPS publique effectivement configurée dans PawaPay ; pour les dépôts, URL candidate du tableau ci-dessus, sans query string | Absent local ; domaine/déploiement non vérifiés |
| `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` | `true`/`false` selon l’activation effective des callbacks signés dans le compte. Si activée, le handler exige RFC 9421 ; ne pas désactiver pour contourner un échec | Absent local ; option du compte inconnue |
| `SUPABASE_URL` | URL du projet Supabase utilisé par le backend | Nom présent dans `.env` et `.env.local` ; valeur et validité non affichées/non vérifiées ici |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur privilégiée du projet Supabase ; secret uniquement, jamais `VITE_` ni côté navigateur | Nom présent dans `.env` et `.env.local` ; valeur et validité non affichées/non vérifiées ici |
| `PAWAPAY_RECONCILE_SECRET` | Secret aléatoire choisi et stocké côté serveur ; protège l’appel manuel de réconciliation | Absent local ; Vercel inconnu |
| `PAWAPAY_RECONCILE_AFTER_SECONDS` | Délai choisi par l’opérateur (entier entre 1 et 86400) avant réconciliation des tentatives ouvertes ; aucune valeur commerciale n’est imposée par le code | Absent local ; Vercel inconnu |
| `CRON_SECRET` | Secret Vercel pour autoriser l’appel planifié du cron ; configurer dans Vercel et localement si exécution locale du cron | Absent de l’environnement du processus inspecté ; fichiers/Vercel non vérifiés |

Les valeurs des fichiers `.env` n’ont pas été lues ni révélées ; seule la présence des noms a été contrôlée. Les opérateurs ne sont pas codés en dur : le backend les récupère dans la configuration active PawaPay et filtre les dépôts XAF du pays sélectionné. Il faut confirmer dans le compte que le pays, XAF et au moins un opérateur sont activés.

## 4. Actions manuelles, dans l’ordre

1. Dans le tableau de bord **Sandbox** PawaPay, déterminer si les quatre champs sont obligatoires et si les catégories Checkout/Payout/Refund seront réellement utilisées. Ne pas considérer leur URL configurée comme une prise en charge par l’application.
2. Faire confirmer/rattacher `emploiplus-group.com` au projet Vercel cible. Vérifier HTTPS et le test `GET` décrit plus haut. Si le domaine n’héberge pas cette API, remplacer le domaine par l’URL publique du projet Vercel qui héberge ces fonctions.
3. Pour le champ **Deposits**, déclarer exactement `https://emploiplus-group.com/api/payments/pawapay/callback` seulement après confirmation du routage public. Pour Checkout, Payout et Refund, attendre les handlers dédiés ou décider explicitement de ne pas utiliser ces types. Ne pas faire passer le handler dépôt pour un handler universel.
4. Enregistrer les callbacks dans le tableau de bord Sandbox. Confirmer le réglage de signature dans le compte ; configurer `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` en conséquence. Activer la signature RFC 9421 si disponible et la valider avant test.
5. Après validation de la configuration de callback par PawaPay, générer le jeton API Sandbox dans le tableau de bord ([guide officiel](https://docs.pawapay.io/dashboard/other/system_conf/api_tokens)). Le jeton est montré ici nulle part ; le placer directement dans le gestionnaire de secrets Vercel sous `PAWAPAY_API_TOKEN`.
6. Définir les autres variables du tableau dans le projet Vercel, environnements **Preview/Sandbox** et **Development** selon le flux de test. Garder service-role, jeton et secrets de réconciliation exclusivement côté serveur. Ne pas utiliser Production ni les identifiants Production.
7. Confirmer le code pays, XAF et les opérateurs réellement configurés via le tableau de bord / active configuration. Renseigner le code confirmé dans `PAWAPAY_COUNTRY_CODE`.
8. Vérifier `vercel.json` : réconciliation horaire (`0 * * * *`) sur `/api/payments/pawapay/reconcile`, authentifiée avec `CRON_SECRET`. D’après la documentation Vercel actuelle, Hobby ne permet qu’un cron quotidien ; une fréquence horaire exige un plan compatible (Pro/Enterprise). Les Cron Jobs sont disponibles sur tous les plans, mais cette fréquence échoue au déploiement Hobby ([usage et tarification](https://vercel.com/docs/cron-jobs/usage-and-pricing)). Vérifier le plan réel et l’exécution des logs.
9. Après changement des variables Vercel, redéployer le projet ciblé ; les variables ne prennent effet que sur les déploiements créés avec cette configuration.
10. Valider en Sandbox uniquement : route callback publique et TLS ; dépôt XAF simulé avec numéro de test officiel ; statuts en attente, succès et échec ; callback signé si activé ; callback dupliqué ; notification non signée/invalide ; différence montant/devise ; timeout puis réconciliation du même dépôt ; aucune activation avant statut fournisseur final et aucune double activation. Aucun paiement réel.

## 5. Commandes/tests et critères

Tests présents : `tests/server/pawapay.test.ts`, `tests/server/pawapay-signatures.test.ts`, `tests/server/pawapay-api.test.ts`. Ils couvrent notamment les faux appels PawaPay, statuts, validation d’authentification, montant serveur, callbacks, signatures, propriété de commande et timeouts.

`package.json` ne déclare pas de script `test`. Une tentative de lancement avec Node 24 en mode strip-types a échoué : les imports `.js` pointant vers les sources `.ts` ne sont pas résolus par ce mode et certaines syntaxes TypeScript ne sont pas prises en charge. **Les tests n’ont donc pas été validés pendant cet audit.** Avant mise en service, fournir/utiliser le runner TypeScript ESM compatible du projet, puis exécuter ces trois fichiers et exiger zéro échec. Les tests automatisés sont simulés et ne doivent pas appeler un vrai jeton.

Critères d’acceptation Sandbox : endpoint déployé qui répond en HTTPS ; callbacks Deposits livrés avec `200` après vérification fournisseur ; les autres catégories ne sont pas considérées couvertes ; montants et devise concordent ; événements répétés n’appliquent aucun droit deux fois ; attente, échec, callback forgé, timeout ou statut indisponible n’activent pas de forfait.

## 6. Points non vérifiables depuis le dépôt

- Rattachement DNS/domaine et certificat HTTPS de `emploiplus-group.com` au projet Vercel ; version actuellement déployée et résultat réel du routage API face à la réécriture SPA.
- Variables d’environnement Vercel, environnements auxquels elles sont attachées, jeton Sandbox actif, réglage RFC 9421 et URLs déjà enregistrées dans le tableau de bord PawaPay.
- Pays, opérateurs, devise et opérations activés sur le compte ; plan Vercel réel ; exécution réelle du cron.
- Contrat PawaPay, frais ou limites de compte ; aucun tarif ni seuil n’est supposé ici.

Sources officielles consultées : [démarrage / hôtes Sandbox et authentification](https://docs.pawapay.io/v2/docs/how_to_start), [URL de callback dans le tableau de bord](https://docs.pawapay.io/dashboard/other/system_conf/callback_urls), [notifications et reprises](https://docs.pawapay.io/v2/docs/what_to_know#callbacks), [signature RFC 9421](https://docs.pawapay.io/v2/docs/signatures), [configuration active](https://docs.pawapay.io/v2/api-reference/toolkit/active-configuration), [routage Vercel](https://vercel.com/docs/routing), [Cron Jobs Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing).

**Aucune modification de code ou de migration, aucune exécution SQL, aucun déploiement et aucune transaction n’ont été effectués pour cet audit.**