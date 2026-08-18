# Authentification, inscription et indépendance Supabase

## Résumé exécutif

L’architecture actuelle est un système hybride :

- la gestion des comptes et des sessions est basée sur Supabase Auth
- la logique métier d’inscription et de profil est enrichie par des endpoints serveur custom
- les emails de confirmation / reset sont envoyés à partir d’un service SMTP Nodemailer
- une table custom `public.email_verification_codes` existe pour un modèle de codes de vérification indépendant, mais il n’est pas encore le moteur principal du flux actuel

Autrement dit, le projet n’est pas totalement “portable” hors Supabase tant que la couche d’authentification Session/Auth reste étroitement couplée à `supabase.auth.*` et au client Supabase.

La bonne lecture est :

- la logique métier est relativement portable
- la couche d’authentification n’est pas encore entièrement abstraite
- pour un vrai découplage, il faut extraire une couche auth interne et remplacer les appels `supabase.auth` par une implémentation générique

---

## 1) Flux complet d’inscription

### 1.1 Point d’entrée côté front

Le formulaire d’inscription se fait dans les composants React dédiés au candidat, notamment :

- `src/pages/candidate/CandidateSignupPage.tsx`
- `src/features/forms/schemas/auth.schemas.ts`
- `src/features/authentication/api/authApi.ts`

Le flux standard est le suivant :

1. le front valide les champs (email, mot de passe, confirmation, prénom, nom, acceptation des CGU)
2. il appelle `signupCandidate(email, password, options)` depuis `authApi.ts`
3. cette fonction exécute `supabase.auth.signUp(...)`
4. Supabase Auth crée l’utilisateur principal et le stocke dans Auth
5. la logique frontend / backend ajoute les données métier (profil candidat, rôle, statut, etc.)

### 1.2 Création de l’utilisateur

Le point clé est que l’application utilise Supabase Auth comme source de vérité pour l’authentification. On le voit dans `src/features/authentication/api/authApi.ts` :

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: options?.redirectTo,
    data: options?.data,
  },
});
```

Cela signifie que l’utilisateur est créé via la méthode officielle Supabase Auth, avec :

- `email`
- `password`
- `options.data` pour des métadonnées métier (`first_name`, `last_name`)

### 1.3 Création d’un profil candidat

Le projet ne se contente pas d’un compte Auth. Il ajoute aussi un profil business dans la table `public.candidates`.

C’est exactement ce que fait l’endpoint custom `api/register.ts` :

- envoie une requête POST à `/auth/v1/admin/users` de Supabase
- utilise `SUPABASE_SERVICE_ROLE_KEY` pour créer l’utilisateur côté admin
- insère ensuite un profil dans `public.candidates` via le REST Supabase avec `user_id`, `first_name`, `last_name`, `email`, `status`

Extrait simplifié :

```ts
await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({
    email,
    password,
    user_metadata: { first_name: firstName, last_name: lastName },
  }),
});
```

Et ensuite :

```ts
await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=representation",
  },
  body: JSON.stringify([
    {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      status: "active",
    },
  ]),
});
```

### 1.4 Base de données / schéma

Le code indique deux niveaux de stockage :

1. Auth Supabase
   - stocke l’utilisateur, le hash du mot de passe, la session, le token, l’email confirmé, etc.
   - c’est la couche d’identité

2. Table métier `public.candidates`
   - stocke le profil métier du candidat
   - contient des colonnes comme `user_id`, `first_name`, `last_name`, `email`, `status`

### 1.5 L’authentification est-elle “personnelle” ?

La réponse courte est : non, pas entièrement.

Le projet utilise bien une logique custom autour du profil et des étapes métier, mais l’authentification principale reste Supabase Auth :

- `supabase.auth.signInWithPassword()` pour le login
- `supabase.auth.signOut()` pour la déconnexion
- `supabase.auth.getSession()` pour l’état de session
- `supabase.auth.updateUser()` pour le reset/mise à jour de mot de passe

Donc, il n’y a pas de “propre auth engine” indépendant du fournisseur.

---

## 2) Gestion des codes de vérification

### 2.1 Table dédiée

Le dépôt contient un fichier de migration :

- `supabase/migrations/20260818_create_email_verification_codes.sql`

Cette table est :

```sql
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

Indexes créés :

- par email
- par code
- par user_id
- par expiration

### 2.2 Comment les codes sont générés

Le fichier de migration ne contient pas l’algorithme de génération. Le code actif observé dans l’app montre plutôt un autre mécanisme :

- génération d’un token signé HMAC dans `api/register.ts`
- `payloadEncoded` + `signature` + token final
- ce token est ensuite placé dans un lien de confirmation

Extrait :

```ts
const tokenPayload = {
  sub: userId,
  email,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
};
const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), "utf8"));
const signature = base64url(
  createHmac("sha256", EMAIL_SIGNING_SECRET).update(payloadEncoded).digest(),
);
const token = `${payloadEncoded}.${signature}`;
```

Donc, le code “de vérification” est un token signé, pas un code 6 chiffres stocké en base pour les flux observés.

### 2.3 Comment les codes sont validés

La validation du token est orchestrée via le endpoint `api/confirm.ts` (non lu dans le détail complet ici, mais le registre de création du token montre clairement le modèle).

Le principe est :

- le backend reçoit le token en paramètre
- il reconstruit le payload
- vérifie la signature HMAC
- vérifie que `exp` n’est pas dépassé
- valide l’identité du `user_id` ou de l’email
- confirme l’utilisateur dans Supabase Auth ou met à jour le statut métier

### 2.4 TTL / expiration

Le TTL observé est de 24 heures :

```ts
exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
```

Donc le lien de confirmation expire après 24h.

Pour la table `email_verification_codes`, le champ `expires_at` existe aussi, et il est prévu pour une logique de code court. Même si ce mécanisme n’est pas le flux principal actuellement, la table est bien pensée pour un TTL explicite.

### 2.5 Point important

Le code de migration montre une intention de “code de vérification indépendant”, mais le flux réel d’inscription observé dans `api/register.ts` utilise un token HMAC plus qu’un code numérique. Donc il y a une dualité :

- logique de vérification côté base de données prévue
- logique de confirmation réelle côté serveur active : token signé

---

## 3) Envoi d’emails

### 3.1 Qui envoie les emails ?

Le service d’envoi est Nodemailer.

Il est utilisé dans :

- `api/register.ts`
- `api/send-email.ts`

Le transport est construit avec les variables d’environnement SMTP :

```ts
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});
```

### 3.2 Quand sont-ils envoyés ?

Ils sont envoyés immédiatement après l’inscription ou en réponse à un événement spécifique.

Exemples observés :

- après création du compte, le backend envoie le mail de confirmation
- après demande de reset, un endpoint `/api/password-reset-request` envoie un message en direct
- `api/send-email.ts` peut aussi envoyer n’importe quel mail custom avec un payload JSON

Il n’y a pas de queue persistante visible dans le code. Donc le modèle actuel est “envoi immédiat”, pas “worker async / queue RabbitMQ / BullMQ / cron”.

### 3.3 Quel provider utilise-t-on ?

Le provider réel est SMTP, via les variables :

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FROM_EMAIL`
- `FROM_NAME`

Il n’y a pas d’usage de Resend, SendGrid, Mailgun ou Brevo dans les fichiers lus. L’architecture est compatible avec un fournisseur SMTP standard, ce qui est bon pour la portabilité.

---

## 4) Indépendance de Supabase

### 4.1 Utilise-t-on Supabase Auth ou juste la DB ?

Le projet utilise les deux, mais de manière inégale :

- Supabase Auth : pour l’identité, session, login, logout, reset password, email confirmation
- Supabase Database : pour les tables métier (`candidates`, `user_roles`, etc.)

La logique d’inscription n’est pas totalement séparée de Supabase Auth.

### 4.2 Peut-on remplacer la DB par PostgreSQL/MySQL ?

Oui, dans le sens où :

- les tables métier peuvent être migrées vers PostgreSQL/MySQL
- les endpoints Node.js peuvent être adaptés à n’importe quel SGBD
- l’envoi d’email via SMTP est tout à fait portable

Mais il faut refactoriser les parties qui dépendant directement de Supabase :

- `supabase.auth.*`
- `supabase.auth.getSession()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.updateUser()`
- `supabase.auth.onAuthStateChange()`

La couche “business” est portable ; la couche “session/auth” ne l’est pas encore.

### 4.3 Points critiques à adapter si on quitte Supabase

Les points critiques sont :

1. Gestion des sessions JWT / refresh token
2. storage local des tokens (`authStorage.ts`)
3. génération et validation des tokens de session
4. password hashing et validation
5. email confirmation logic
6. reset password logic
7. protection des routes côté client/server
8. dépendance à `@supabase/supabase-js`

À noter : les fichiers de logique montrent des conventions très spécifiques à Supabase, notamment le nom des clés de stockage, la méthode `getSession()`, la validation `email_confirmed_at`, et l’usage du client `supabase` dans presque tous les flux d’auth.

### 4.4 Verdict de portabilité

Le projet est partiellement portable :

- l’emailing est portable
- le backend métier est portable
- l’authentification n’est pas encore portable

Pour être réellement “portable” et indépendant de Supabase, il faudrait :

- centraliser une interface `AuthProvider`
- remplacer les appels `supabase.auth.*` par un wrapper
- stocker les comptes dans un autre backend ou ORM
- migrer `authStorage` et les vérifications de session
- externaliser les règles de confirmation et reset password

---

## 5) Architecture cible pour VPS autonome

### 5.1 Stack recommandée

Le projet est déjà compatible avec une architecture Node.js + PostgreSQL + SMTP :

- backend Node.js/TypeScript
- API REST sous forme de handlers serveur (Vercel/Express-like)
- base PostgreSQL (ou MySQL si on adapte les requêtes)
- Nodemailer pour SMTP
- front React/Vite côté client

### 5.2 Fichiers critiques de l’authentification

Fichiers à surveiller si on veut refactoriser :

- `src/features/authentication/api/authApi.ts`
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/authentication/utils/authStorage.ts`
- `src/integrations/supabase/client.ts`
- `api/register.ts`
- `api/confirm.ts`
- `api/password-reset-request.ts`
- `api/password-reset-confirm.ts`
- `api/send-email.ts`
- `supabase/migrations/20260818_create_email_verification_codes.sql`

### 5.3 Dépendances externes critiques

Les dépendances vraiment critiques sont :

- `@supabase/supabase-js`
- `nodemailer`
- `@vercel/node`
- `zod` (validation côté UI)
- React / Vite / TypeScript
- variables d’environnement `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`, `SITE_URL`

### 5.4 Peut-on déployer sur un VPS autonome ?

Oui, avec un refactor ciblé :

- backend Node.js sur le VPS
- base PostgreSQL sur le VPS ou un service dédié
- SMTP via un provider externe
- front static build ou reverse proxy

Mais sans refactor, le dépôt est “déployable” sur VPS seulement si on garde Supabase comme service de session/authentification.

### 5.5 Conclusion pratique

Le site est déjà partiellement portable à l’échelle de la logique métier, mais il n’est pas encore totalement indépendant de Supabase.

Le plus important est de distinguer :

- logique JOUEUR / métier : portable
- logique d’authentification / session : dépendante de Supabase aujourd’hui

Donc, si l’objectif est “quitter Supabase complètement”, il faut refactoriser la couche d’authentification et la session, pas seulement le frontend ou les emails.

---

## Verdict final

- Déjà assez portable pour le business logic : oui
- Déjà portable pour l’emailing : oui
- Déjà portable pour la base métier : oui, si on adapte le schéma
- Déjà indépendante de Supabase au niveau Auth : non
- Nécessite un refactor sérieux pour un vrai retrait de Supabase : oui

La conclusion la plus honnête est :

Le code est “hybride”, pas “complètement découplé”.
L’architecture actuelle est opérationnelle, mais elle n’est pas encore prête pour un remplacement total de Supabase sans une refonte de la couche Auth.
