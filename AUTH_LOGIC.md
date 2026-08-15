# Logique d’authentification candidat — EmploiPlus Group

Ce document décrit la logique réelle utilisée par le projet pour l’authentification des candidats sur le web, en s’appuyant sur les fichiers de code et les migrations Supabase du dépôt.

## Vue d’ensemble

Le flux principal repose sur Supabase Auth pour la gestion des comptes et sur une table métier `public.candidates` pour le profil candidat.

Les éléments clés sont :

- `auth.users` : comptes d’authentification Supabase
- `public.candidates` : profil métier du candidat
- `src/features/authentication/api/authApi.ts` : API d’authentification
- `src/integrations/supabase/candidate-auth.ts` : orchestration de l’inscription candidat
- `src/features/candidates/api/profileApi.ts` : création et lecture du profil candidat
- `api/password-reset-request.ts` et `api/password-reset-confirm.ts` : flux de mot de passe oublié personnalisé

---

## 1) Formulaire de connexion (Login)

### Champs demandés

Le formulaire de connexion est défini dans `src/features/forms/schemas/auth.schemas.ts` avec le schéma `loginSchema` :

- `email` : obligatoire, valide via format email
- `password` : obligatoire
- `rememberMe` : optionnel, booléen pour l’UI

Le composant de page correspondant est `src/pages/candidate/CandidateLoginPage.tsx`.

### Fonction Supabase appelée

La connexion appelle :

```ts
supabase.auth.signInWithPassword({ email, password })
```

C’est l’implémentation utilisée dans `loginCandidate()` de `src/features/authentication/api/authApi.ts` :

```ts
export async function loginCandidate(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // ...
}
```

### Vérifications métier supplémentaires

Le projet ajoute une vérification importante avant de considérer la connexion comme valide :

- le compte doit avoir `email_confirmed_at` non nul
- sinon, la méthode `assertEmailConfirmed()` déclenche une erreur `EMAIL_NOT_CONFIRMED`
- le code force alors `supabase.auth.signOut()` si une session a été créée et relance une erreur technique côté UI

Cela permet d’empêcher les utilisateurs non confirmés d’accéder au dashboard.

### Traitement après une connexion réussie

Après un login réussi, la page `CandidateLoginPage` surveille :

- `isAuthenticated`
- `rolesResolved`

Quand ces conditions sont vraies, elle redirige vers :

```text
/candidate/dashboard
```

La redirection est faite via `navigate("/candidate/dashboard", { replace: true })`.

---

## 2) Formulaire d’inscription (Sign Up)

### Champs demandés au candidat

Le formulaire d’inscription est défini dans `signupSchema` (`src/features/forms/schemas/auth.schemas.ts`) et contient :

- `firstName` : prénom, requis
- `lastName` : nom, requis
- `email` : email, requis, validé
- `password` : mot de passe, minimum 8 caractères
- `confirmPassword` : confirmation obligatoire
- `agreeTerms` : case à cocher, obligatoire

Le composant UI est `src/pages/candidate/CandidateSignupPage.tsx`.

### Envoi des données à Supabase Auth

Le flux réel passe d’abord par `supabase.auth.signUp(...)` dans `signupCandidate()` :

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

Les métadonnées transmises à `auth.users` sont ajoutées dans `options.data` :

```ts
data: {
  first_name: params.firstName,
  last_name: params.lastName,
}
```

Ces valeurs sont stockées dans les métadonnées utilisateur Supabase (donc dans `user.user_metadata`), pas dans une table dédiée pour l’authentification elle-même.

### Création du profil candidat dans la table métier

Après la création Auth, le code appelle `createCandidateProfile(user.id, ...)` depuis `src/integrations/supabase/candidate-auth.ts` :

```ts
const profile = await createCandidateProfile(user.id, {
  firstName: params.firstName,
  lastName: params.lastName,
  email: params.email,
  location_city: params.location_city,
  location_country: params.location_country,
  date_of_birth: params.date_of_birth,
});
```

La table exacte utilisée est :

```sql
public.candidates
```

Mise en place dans la migration :

```sql
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  headline TEXT,
  location_city TEXT,
  location_country TEXT,
  date_of_birth DATE,
  status candidate_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

La table contient notamment :

- `id`
- `user_id` : lien vers `auth.users.id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `avatar_url`
- `bio`
- `headline`
- `location_city`
- `location_country`
- `date_of_birth`
- `status`
- `created_at`
- `updated_at`

### Flux de confirmation email

Le projet prévoit un processus d’email de confirmation automatique tiré de Supabase Auth, avec un comportement explicite côté UI :

- après inscription, la page `CandidateSignupPage` redirige vers `/candidate/login`
- dans `location.state`, elle envoie :
  - `notification`
  - `pendingEmail`
  - `from`
- la page de connexion affiche un message du type :

> “Inscription réussie ! Un email de confirmation a été envoyé. Vérifiez votre boîte de réception…”

L’authentification bloque ensuite les connexions si `email_confirmed_at` est nul.

### Cas de nettoyage après inscription

Si une session est active au moment de la création du profil, le code effectue un `signOut()` de nettoyage :

```ts
if (authData.session) {
  const { error: signOutError } = await supabase.auth.signOut();
}
```

Cela évite de laisser un utilisateur connecté sans profil exploitable ou sans confirmation d’email complète.

---

## 3) Mot de passe oublié (Forgot Password)

### Formulaire concerné

Le schéma `forgotPasswordSchema` ne demande qu’un seul champ :

- `email`

### Implémentation réelle du flux

Le dépôt ne passe pas par `supabase.auth.resetPasswordForEmail()` directement. La logique est personnalisée via un endpoint serveur Vercel :

- `api/password-reset-request.ts`

Ce handler :

1. reçoit un email POST
2. cherche le candidat correspondant dans `public.candidates` via la colonne `email`
3. récupère `candidate.user_id`
4. construit un token signé avec un secret `EMAIL_SIGNING_SECRET`
5. génère un lien :

```text
${SITE_URL}/candidate/reset-password?token=... 
```

6. envoie l’email via le service `api/send-email` / `renderTransactionalEmail`

### `redirectTo` configurée

Dans cette implémentation, le lien n’est pas construit avec `supabase.auth.resetPasswordForEmail` ni avec `emailRedirectTo`, mais directement par le serveur avec un URL locale :

```text
${confirmationBaseUrl}/candidate/reset-password?token=...
```

La base est déterminée à partir de :

- `process.env.SITE_URL`
- ou fallback : `https://www.emploiplus-group.com`

### Mise à jour du mot de passe

Le formulaire de réinitialisation est rendu par `src/pages/candidate/CandidateResetPasswordPage.tsx`.

Le flux est :

1. validation du token via :

```text
/api/password-reset-validate?token=...
```

2. soumission du nouveau mot de passe vers :

```text
/api/password-reset-confirm
```

3. le handler `api/password-reset-confirm.ts` vérifie le token signé avec `verifyPasswordResetToken()`
4. puis il met à jour le mot de passe par appel administration Supabase :

```ts
fetch(`${SUPABASE_URL}/auth/v1/admin/users/${payload.sub}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ password: newPassword }),
});
```

Le code valide aussi :

```ts
if (newPassword.length < 8) {
  throw new Error("Le mot de passe doit contenir au moins 8 caractères");
}
```

En pratique, la logique de reset password est donc personnalisée et non purement standard Supabase.

---

## 4) Configuration & Métadonnées Supabase

### Tables touchées

#### `auth.users`

C’est la table d’authentification Supabase standard.

- créée / gérée par Supabase Auth
- utilisée pour les comptes email / mot de passe
- email confirmés via `email_confirmed_at`

#### `public.candidates`

Cette table représente le profil métier du candidat.

```sql
public.candidates
```

Ses colonnes principales sont :

- `id`
- `user_id`
- `first_name`
- `last_name`
- `email`
- `phone`
- `avatar_url`
- `bio`
- `headline`
- `location_city`
- `location_country`
- `date_of_birth`
- `status`
- `created_at`
- `updated_at`

#### Autres tables liées

Le projet contient aussi, dans les migrations, des tables associées au profil candidat :

- `public.candidate_skills`
- `public.candidate_experience`
- `public.candidate_education`

Elles sont toutes liées à `public.candidates` via `candidate_id`.

### Enum métier

La migration crée aussi le type :

```sql
public.candidate_status
```

avec les valeurs :

- `active`
- `inactive`
- `archived`

### RLS (Row Level Security)

Les politiques de sécurité de `public.candidates` indiquent que :

- un utilisateur ne peut lire que son propre profil
- un utilisateur ne peut insérer que son propre profil
- un utilisateur ne peut modifier que son propre profil
- les membres du staff peuvent voir tous les candidats via `public.is_staff(auth.uid())`

### Triggers / création automatique de profil

À partir du code et des migrations vérifiés dans le dépôt :

- il n’existe pas de trigger nommé `on_auth_user_created` dans le code du projet pour créer automatiquement un candidat lors de l’inscription
- il n’existe pas de logique SQL de type “create candidate profile on auth.user creation” qui soit activée automatiquement
- la création du profil candidat est faite explicitement dans le code du flux d’inscription, via `createCandidateProfile(...)`

Le seul trigger visible dans la table candidat est :

```sql
CREATE TRIGGER set_candidates_updated_at BEFORE UPDATE ON public.candidates
```

qui met à jour `updated_at` automatiquement.

### Configuration Auth Supabase côté client

Dans `src/integrations/supabase/client.ts`, la configuration actuelle est :

```ts
auth: {
  storage: window.localStorage,
  storageKey: 'emploiplus-auth-token',
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false,
  flowType: 'implicit',
}
```

Cela donne une persistance locale de session pour l’application web, avec stockage dans le localStorage du navigateur.

---

## 5) Points métier importants

### Vérification d’email

La connexion est refusée si l’utilisateur n’a pas confirmé son email :

```ts
if (user?.email_confirmed_at !== null) return;
throw Object.assign(new Error("EMAIL_NOT_CONFIRMED"), { ... });
```

### Contrôle de rôle / accès candidat

Le code de `AuthContext` détecte ensuite si l’utilisateur a un profil candidat dans `public.candidates`, puis expose des rôles/permissions associés au candidat.

Cela conditionne la navigation après connexion et protège les routes du candidat.

### Protection des routes

Après une connexion réussie, le projet s’appuie sur :

- la session Supabase
- le statut `isAuthenticated`
- la résolution des permissions / rôles

pour permettre ou refuser l’accès aux routes de l’espace candidat.

---

## 6) Résumé des flux

### Connexion

- le candidat remplit email + mot de passe
- appel `supabase.auth.signInWithPassword`
- le code vérifie `email_confirmed_at`
- si OK, redirection vers `/candidate/dashboard`

### Inscription

- le candidat remplit prénom, nom, email, mot de passe, confirmation, acceptation CGU
- appel `supabase.auth.signUp` avec `options.data` pour `first_name` et `last_name`
- insertion dans `public.candidates`
- retour vers `/candidate/login` avec message de confirmation par email

### Mot de passe oublié

- demande de mail d’email sur `/api/password-reset-request`
- génération d’un token signé et envoi d’un lien `/candidate/reset-password?token=...`
- validation du token puis update de password via Admin API Supabase

---

## Conclusion

La logique d’authentification utilisée par le projet est un mélange de :

- Supabase Auth pour la gestion standard des comptes
- une table métier `public.candidates` pour le profil candidat
- des endpoints personnalisés pour la validation et la réinitialisation du mot de passe

Le point le plus important à retenir est que le profil candidat n’est pas créé automatiquement par un trigger `on_auth_user_created` dans le dépôt ; il est créé explicitement dans le code de l’inscription après la création du compte Auth.
