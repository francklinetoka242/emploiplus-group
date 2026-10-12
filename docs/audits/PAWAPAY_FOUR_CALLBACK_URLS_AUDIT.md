# Audit des quatre URL de callbacks PawaPay

## 1. Résumé et conclusion

**Conclusion : le dépôt n'est pas prêt à traiter les quatre catégories de callbacks.** Il contient un handler de callback pour les **Deposits** seulement. Aucun handler ni traitement des callbacks **Checkouts**, **Payouts** ou **Refunds** n'a été trouvé.

Le domaine `emploiplus-group.com` apparaît dans le dépôt comme domaine canonique du site, notamment dans `vite.config.ts` et des utilitaires SEO. En revanche, `vercel.json` ne déclare aucun domaine et les fichiers examinés ne prouvent ni le rattachement du domaine au projet Vercel de production, ni le routage public effectif de l'API. L'URL de callback Deposits ci-dessous est donc une **candidate**, pas une URL de production confirmée.

Il est possible de configurer une même chaîne d'URL dans plusieurs champs du tableau de bord, si celui-ci l'accepte, mais cela ne rend pas le handler compatible avec plusieurs types de callbacks. Le comportement du tableau de bord PawaPay et les conditions exactes de génération du jeton ne peuvent pas être confirmés par le code du dépôt.

## 2. Tableau des quatre champs

| Champ PawaPay | URL exacte à renseigner | Route existante | Compatibilité actuelle et action requise |
|---|---|---|---|
| **Checkouts callback URL** | **À déterminer**. Aucun endpoint Checkout n'est présent. | Aucune route dédiée dans `api/payments/pawapay/`. | Non prise en charge. Ne pas déclarer l'URL Deposits comme compatible. Ajouter un handler Checkout avant d'utiliser ce flux, ou confirmer qu'il ne sera pas utilisé et que le tableau de bord permet néanmoins de générer le jeton sans endpoint Checkout fonctionnel. |
| **Deposits callback URL** | Candidate : `https://emploiplus-group.com/api/payments/pawapay/callback`. **Ne la saisir comme URL de production qu'après confirmation du domaine, du déploiement Vercel et du routage public.** | `POST /api/payments/pawapay/callback`, correspondant à `api/payments/pawapay/callback.ts`. | Traitement Deposits présent. Confirmer d'abord l'accès HTTPS public et le routage vers la fonction. Configurer également `PAWAPAY_CALLBACK_URL` à l'identique et renseigner explicitement le réglage des signatures dans l'environnement serveur. |
| **Payouts callback URL** | **À déterminer**. Aucune route Payout n'est présente. | Aucune route dédiée dans `api/payments/pawapay/`. | Non prise en charge. Ajouter un handler et son traitement avant toute utilisation de Payouts. |
| **Refunds callback URL** | **À déterminer**. Aucune route Refund n'est présente. | Aucune route dédiée dans `api/payments/pawapay/`. | Non prise en charge. Ajouter un handler et le traitement/persistance de remboursement avant toute utilisation de Refunds. |

**Même URL pour plusieurs champs :** une même adresse HTTP pourrait être saisie dans plusieurs champs si le tableau de bord l'autorise, mais, avec le code actuel, seule la notification Deposits est traitée comme telle. Les trois autres types ne sont pas validés ni appliqués par un traitement qui leur est propre. Leur envoyer des notifications vers le handler Deposits peut produire une réponse d'erreur ou faire interpréter des données au mauvais format comme une notification de dépôt. Il ne faut donc pas considérer cette URL comme une prise en charge de Checkouts, Payouts ou Refunds.

## 3. État du callback Deposits

Le fichier `api/payments/pawapay/callback.ts` expose un handler `POST` (les autres méthodes renvoient `405` et `Allow: POST`) qui :

- lit le corps brut avec une limite de 64 Kio, analyse le JSON et exige un `depositId` au format UUID ainsi qu'un `status` en majuscules ;
- exige une configuration `PAWAPAY_CALLBACK_URL` et un réglage explicite `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` (`true` ou `false`) ; sans configuration exploitable, le handler renvoie une erreur de configuration ;
- vérifie le digest et les signatures RFC 9421 lorsque les en-têtes signés sont fournis ; si les signatures sont exigées, leur absence est rejetée ;
- enregistre l'événement de callback par empreinte via les RPC billing, puis vérifie l'état du dépôt auprès de l'API PawaPay authentifiée avant d'appliquer le résultat. Le callback seul n'active donc pas un paiement ;
- ne termine l'événement qu'après la vérification et le traitement du dépôt ; les erreurs de vérification ou de consultation fournisseur ne sont pas présentées comme un succès.

Ce traitement et cette vérification de signature sont propres au flux **Deposits**. Le fait que les valeurs de `depositId` et `status` soient validées ne suffit pas à rendre cette route compatible avec d'autres catégories.

## 4. État des callbacks Checkouts, Payouts et Refunds

L'examen de `api/payments/pawapay/` et `server/billing/` a trouvé l'initiation et la consultation de **dépôts**, leur statut, leur réconciliation, ainsi que le handler callback Deposits. Il n'a trouvé ni endpoint callback Checkout/Payout/Refund, ni logique de validation et d'application du statut propre à ces opérations.

La présence d'une route de paiement ou de la route de réconciliation ne constitue pas une prise en charge d'un callback d'une autre catégorie. Pour utiliser réellement Checkouts, Payouts ou Refunds par callback, il faut ajouter les routes ou un routage explicitement adapté, la validation du format concerné, la vérification fournisseur/signature pertinente et le traitement de statut correspondant. Pour Refunds, il faut également le traitement métier et la persistance appropriés ; le dépôt n'en fournit pas actuellement.

## 5. Configuration recommandée

| Champ | Valeur recommandée maintenant |
|---|---|
| Checkouts callback URL | **À déterminer** ; aucune URL de callback Checkout n'est implémentée. |
| Deposits callback URL | Candidate conditionnelle : `https://emploiplus-group.com/api/payments/pawapay/callback`. À ne saisir qu'après confirmation que ce domaine dessert le projet Vercel visé et que ce chemin atteint la fonction. |
| Payouts callback URL | **À déterminer** ; aucune URL de callback Payout n'est implémentée. |
| Refunds callback URL | **À déterminer** ; aucune URL de callback Refund n'est implémentée. |

`emploiplus-group.com` est identifiable comme domaine canonique dans les sources, mais sa configuration comme domaine de production Vercel et l'accès réel au chemin API ne sont pas confirmés. `vercel.json` contient un rewrite SPA générique vers `/index.html`, mais aucune preuve locale ne permet de confirmer le comportement du déploiement. L'URL candidate ne doit donc pas être considérée comme vérifiée avant un contrôle du déploiement, par exemple en vérifiant que `GET /api/payments/pawapay/callback` atteint le handler et répond `405` avec `Allow: POST`, plutôt que de renvoyer la page SPA.

## 6. Actions minimales nécessaires

1. Confirmer dans Vercel le domaine de production associé au projet qui héberge ces fonctions, puis vérifier le certificat HTTPS et l'accès réel à `/api/payments/pawapay/callback`. Si le domaine effectif diffère, construire l'URL Deposits avec le domaine confirmé, et non avec une valeur supposée.
2. Pour le seul flux Deposits, configurer `PAWAPAY_CALLBACK_URL` à l'URL publique exacte et définir explicitement `PAWAPAY_CALLBACK_SIGNATURES_REQUIRED` conformément au paramétrage des signatures PawaPay. Ne pas inscrire ni exposer de secret dans ce rapport.
3. Avant d'utiliser les callbacks Checkouts, Payouts ou Refunds, implémenter le traitement spécifique à chaque catégorie. Une URL commune peut éventuellement être utilisée comme adresse de transport, mais le code doit identifier et traiter chaque type de callback sans le confondre avec un dépôt.
4. Si le but immédiat est uniquement de générer un jeton Sandbox, vérifier dans le tableau de bord PawaPay si les champs sans flux correspondant doivent réellement pointer vers un endpoint fonctionnel. Le dépôt seul ne permet pas de confirmer qu'une URL Deposits peut être inscrite sans risque dans ces champs, ni que cette configuration suffit à générer le jeton.

## Réponse explicite

**« Quelles sont les quatre URL que je dois saisir maintenant dans PawaPay pour générer mon jeton API Sandbox, et lesquelles nécessitent une modification du code avant d'être utilisées ? »**

Le dépôt ne permet pas de confirmer sans réserve quatre URL de production à saisir maintenant. Pour **Deposits** uniquement, l'URL candidate est `https://emploiplus-group.com/api/payments/pawapay/callback`, sous réserve de confirmer que le domaine et le chemin sont effectivement servis par le projet Vercel visé. Pour **Checkouts**, **Payouts** et **Refunds**, la valeur est **à déterminer** : aucune route correspondante n'existe. Une modification du code est nécessaire avant d'utiliser les callbacks de ces trois catégories. Même si le tableau de bord accepte la même URL dans les quatre champs pour la génération du jeton, le handler actuel ne fournit pas cette compatibilité fonctionnelle ; l'acceptation de cette configuration par le tableau de bord doit être confirmée séparément.
