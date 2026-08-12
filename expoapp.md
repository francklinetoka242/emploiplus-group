## Intégration WebView (Expo / React Native) — EmploiPlus Group

Ce document décrit la logique et la configuration permettant d'adapter l'affichage et le comportement du site lorsqu'il est consulté depuis l'application mobile (WebView). Il référence les fichiers et fonctions exacts du projet.

---

1) Détection du trafic mobile / WebView

- Mécanisme principal : détection via l'en-tête `User-Agent` contenant la chaîne `EmploiPlusApp`.
  - Frontend : `src/lib/isMobileApp.ts` (fonction `isMobileApp()`)
    - Code : renvoie `navigator.userAgent.includes("EmploiPlusApp")`.
  - Initialisation côté client : `src/App.tsx` (useEffect autour de `navigator.userAgent`) — ajoute ou retire la classe `is-mobile-app` sur le `document.body` lorsque `navigator.userAgent.includes("EmploiPlusApp")`.

- Paramètres URL / headers / cookies :
  - Il n'existe pas de paramètre URL global `?app=true` dans le code (aucune occurrence trouvée).
  - Aucun en-tête HTTP personnalisé ou cookie spécifique au mode application n'est injecté par le site (pas de gestion explicite `X-App-...` dans les routes serveur du repo).

- Fichiers pertinents :
  - `src/lib/isMobileApp.ts` — fonction de détection.
  - `src/App.tsx` — lecture initiale du `userAgent` et ajout de la classe `is-mobile-app`.
  - `src/components/site/PublicLayout.tsx` — utilise `isMobileApp()` pour masquer l'en-tête, le footer et la bannière de cookies.
  - `src/components/candidate/CandidateSidebar.tsx` — réduit/ajuste le menu en mode application.

---

2) Adaptation de l'interface & règles d'affichage (Responsive & App-like)

- Comportement d'affichage :
  - Quand `isMobileApp()` retourne `true` ou que la classe `is-mobile-app` est présente sur le `body` :
    - Le header et le footer sont cachés par CSS.
    - La bannière de consentement aux cookies (`CookieConsentBanner`) est masquée (via `PublicLayout` qui n'affiche pas la bannière si `isMobileApp()`).
    - Les composants et cartes (`.card`, ombres, bordures, arrière-plans) sont simplifiés (suppression d'ombres, fonds transparents) pour un rendu plus « app-like ».

- Règles CSS / classes :
  - Fichier principal : [src/styles.css](src/styles.css#L148-L277)
  - Classe appliquée : `body.is-mobile-app`.
  - Exemples de règles :
    - `body.is-mobile-app header, body.is-mobile-app footer { display: none !important; }`
    - `body.is-mobile-app .card, .shadow, .bg-card { border: none !important; box-shadow: none !important; background: transparent !important; }`
    - Ajustements spécifiques aux pages d'authentification candidat (`.candidate-auth-page`, `.candidate-auth-card`, `.auth-submit-button`, etc.) pour rendre les formulaires pleins écrans et boutons plus grands (voir `src/styles.css`#L175-L266).

- Middlewares / logique d'affichage :
  - Côté rendu React, `PublicLayout` décide d'afficher ou non le shell (header/footer/cookie) selon `isMobileApp()`.
  - `CandidateSidebar` adapte la structure du menu (menu réduit en mode app) via `const mobileApp = isMobileApp()`.

---

3) Traitement des routes `/candidate/signup` et `/candidate/login`

- Pages :
  - `src/pages/candidate/CandidateLoginPage.tsx` — logique de connexion
  - `src/pages/candidate/CandidateSignupPage.tsx` — logique d'inscription

- Comportement lorsqu'affiché dans la WebView :
  - L'application ne communique pas explicitement via `postMessage` dans ces pages ; le rendu « app-like » est assuré par la présence de la classe `is-mobile-app` (masquage header/footer + styles), et par la logique de navigation interne.

- Flux d'authentification (succinct, fichiers & fonctions) :
  - Action de login : `CandidateLoginPage` appelle `useAuth().login(email, password)` (via `src/features/authentication/hooks/useAuth.ts` → `AuthContext.login`).
  - `AuthContext.login` appelle `authApi.loginCandidate(email, password)` (voir `src/features/authentication/api/authApi.ts`).
    - `loginCandidate` utilise `supabase.auth.signInWithPassword(...)` (Supabase client dans `src/integrations/supabase/client.ts`).
    - Après connexion, `AuthContext` récupère la session via `authApi.getCandidateSession()` et met à jour le `session` dans le contexte.
  - Redirections après succès : `CandidateLoginPage` effectue `navigate(state?.from || "/candidate/dashboard", { replace: true })` après un login réussi.

- Inscription :
  - `CandidateSignupPage` invoque `useAuth().signup(...)` qui appelle l'API `authApi.signupCandidate(...)` (côté client) et/ou l'API serveur `api/register.ts` lors d'inscription via endpoint custom.
  - `api/register.ts` (serverless) crée l'utilisateur via l'admin REST API Supabase puis envoie un email de confirmation contenant un lien vers `/api/confirm?token=...`.
  - Le handler `api/confirm` valide le token et redirige vers `${SITE_URL}/candidate/login?confirmed=true` (voir `api/confirm.ts`). La page de login détecte `?confirmed=true` et affiche un message de confirmation (voir `CandidateLoginPage` useEffect qui lit `searchParams`).

- Communication spécifique WebView :
  - Aucun envoi automatique de message vers l'application mobile après connexion/inscription n'a été trouvé dans le code source (pas d'utilisation de `window.ReactNativeWebView.postMessage()` dans les fichiers sources de l'application React).
  - Le flux actuel repose sur : navigation classique (redirects / navigate) + mise à jour du stockage local (Supabase stocke le token/session en `localStorage`).

---

4) Interaction Web <-> Application Mobile

- Usage de `postMessage` :
  - Recherche dans le code : aucune utilisation de `window.ReactNativeWebView.postMessage()` dans `src/` (les occurrences `postMessage` trouvées sont liées aux workers/bundles dans `dist/` ou aux API internes, pas à la communication WebView).

- Deep Linking / schémas personnalisés :
  - Le code serveur/client n'émet pas de redirections vers un schéma d'URL personnalisé (ex: `emploiplus://callback`) pour l'instant.

- Conclusion :
  - Il n'y a pas de canal explicite Web→App implémenté. La WebView doit s'appuyer sur la navigation et sur l'écoute d'URL (redirects) ou l'utilisation côté natif de `onNavigationStateChange` / `onMessage` pour capturer les événements de la WebView.
  - Si une intégration plus riche est nécessaire (ex: transmettre un token JWT après login, confirmer la fin d'un flux), il faut ajouter explicitement dans le code React une instruction du type :

```js
// Exemple à ajouter côté web après succès d'auth
if (window?.ReactNativeWebView?.postMessage) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'auth:login', success: true }));
}
```

---

5) Sécurité, CORS & Authentification

- Gestion de session / persistance :
  - Client Supabase configuration : `src/integrations/supabase/client.ts` crée le client avec :
    - `auth.storage: localStorage`
    - `persistSession: true`
    - `autoRefreshToken: true`
  - Conséquence : la session et les tokens sont stockés dans `localStorage` du navigateur / WebView. Le renouvellement automatique de token est activé.

- Cookies / SameSite / Secure :
  - Le projet n'utilise pas explicitement de cookies côté serveur pour la session (les routes `api/*` ne définissent pas d'en-têtes `Set-Cookie` spécifiques, et aucune config `SameSite`/`Secure` n'a été trouvée dans le repo).
  - Cela signifie que l'authentification s'appuie sur le SDK Supabase en mode client (tokens en localStorage), pas sur des cookies de session tiers.

- CORS / CSP / Frame options :
  - Les routes serveur (fichiers sous `api/`) n'ajoutent pas explicitement d'en-têtes CORS (`Access-Control-Allow-Origin`).
  - Pour le chargement en WebView natif, il n'y a pas d'en-têtes `X-Frame-Options` ou `Content-Security-Policy` injectés par ces fichiers ; vérifier la configuration d'hébergement si nécessaire.

- Remarques de sécurité importantes pour la WebView :
  - Stockage dans `localStorage` : sur certaines plateformes (Android WebView / iOS WKWebView), le stockage peut être isolé ou supprimé quand l'app est réinstallée. Si l'on souhaite partager une session native ↔ Web, il faut prévoir un mécanisme de passage de token sécurisé (Deep Link, Keychain/Keystore côté natif, ou message postMessage sécurisé).
  - Cookies et SameSite : si l'API d'auth venait à passer à des cookies (ex: `HttpOnly`), il faudrait s'assurer de `SameSite=None; Secure` pour autoriser l'utilisation en WebView dans certains contextes et régler CORS côté serveur.

---

6) Recommandations pratiques (si vous voulez améliorer l'intégration)

- Pour une communication explicite Web→App :
  - Implémenter `window.ReactNativeWebView.postMessage(...)` dans `CandidateLoginPage` et `CandidateSignupPage` après succès (envoyer un objet JSON minimal : type, token si nécessaire, userId).
  - Côté natif, écouter `onMessage` et valider l'origine/message avant de stocker un token natif.

- Pour une persistance partagée / SSO entre WebView et code natif :
  - Après login, renvoyer côté web un `postMessage` contenant le `access_token` (si sécurisé et chiffré) ou mieux : émettre un `deep link` vers le schéma natif (ex: `emploiplus://auth?token=...`) tout en gardant un fallback par navigation.

- Pour la sécurité :
  - Ne jamais poster brut un `refresh_token` sans chiffrement et validation côté natif.
  - Mettre en place CSP/Frame-ancres contrôlées si nécessaire et documenter l'origine de la WebView.

---

7) Références code (récapitulatif fichiers et fonctions clefs)

- Détection / UI
  - `src/lib/isMobileApp.ts` — fonction `isMobileApp()`
  - `src/App.tsx` — ajout / retrait de `document.body.classList.add("is-mobile-app")`
  - `src/components/site/PublicLayout.tsx` — hide shell si `isMobileApp()`
  - `src/components/candidate/CandidateSidebar.tsx` — adaptation du menu en mode mobile
  - `src/styles.css` — règles `body.is-mobile-app` (masquage header/footer, styles auth pages)

- Auth & session
  - `src/pages/candidate/CandidateLoginPage.tsx` — page de connexion (détecte `?confirmed=true`)
  - `src/pages/candidate/CandidateSignupPage.tsx` — page d'inscription
  - `src/features/authentication/context/AuthContext.tsx` — logique de session, `login`, `signup`, `logout`, `refreshSession`
  - `src/features/authentication/api/authApi.ts` — `loginCandidate`, `signupCandidate`, `getCandidateSession`, `logoutCandidate`
  - `src/integrations/supabase/client.ts` — configuration client Supabase (`localStorage`, `persistSession`, `autoRefreshToken`)
  - `api/register.ts`, `api/confirm.ts` — endpoints server pour inscription et confirmation d'email (redirection vers `/candidate/login?confirmed=true`)

---

Si vous voulez, j'intègre des exemples de `postMessage` dans `CandidateLoginPage`/`CandidateSignupPage` et ajoute une petite note dans `arbapp.md` expliquant le format du message attendu côté natif. Voulez-vous que je fasse ces modifications (ajout d'exemples dans le code) ?
