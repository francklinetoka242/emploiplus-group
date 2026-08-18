# 📝 Logique du Formulaire d'Inscription Candidat

## 1. Vue d'ensemble

Le formulaire d'inscription (`CandidateSignupPage.tsx`) permet aux candidats de créer un compte sur la plateforme EmploiPlus Group. C'est un processus multi-étapes qui implique :
- **Frontend** : Validation des données côté client
- **API Backend** : Création du compte utilisateur et envoi d'email de confirmation
- **Supabase** : Stockage de l'utilisateur et du profil candidat

---

## 2. Architecture et Dépendances

### 2.1 Composants Externes
```typescript
// UI Components
- Button, Input, Label, Card
- Checkbox, Alert
- Form (react-hook-form)

// Validation
- Zod (schema validation)
- @hookform/resolvers/zod

// Routing
- useNavigate, Link, useLocation (react-router-dom)

// SEO
- usePageSEO
```

### 2.2 Schémas de Validation (Zod)

Le fichier `src/features/forms/schemas/auth.schemas.ts` définit les règles de validation :

```typescript
export const signupSchema = z
  .object({
    firstName: z.string()
      .trim()
      .min(1, "Le prénom est requis"),
    
    lastName: z.string()
      .trim()
      .min(1, "Le nom est requis"),
    
    email: z.string()
      .trim()
      .min(1, "L'email est requis")
      .email("Email invalide"),
    
    password: z.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    
    confirmPassword: z.string()
      .min(1, "La confirmation du mot de passe est requise"),
    
    agreeTerms: z.boolean()
      .refine((value) => value, {
        message: "Vous devez accepter les conditions",
      }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    // Validation croisée : les mots de passe doivent correspondre
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Les mots de passe ne correspondent pas",
      });
    }
  });
```

**Validations clés :**
- ✅ Prénom et nom : requis, non vides
- ✅ Email : format valide, requis
- ✅ Mot de passe : minimum 8 caractères
- ✅ Confirmation : doit correspondre au mot de passe
- ✅ Conditions : doit être accepté

---

## 3. Flux Frontend

### 3.1 Initialisation du Formulaire

```typescript
const form = useForm<SignupFormValues>({
  resolver: zodResolver(signupSchema),  // ← Zod validation
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  },
});
```

Le hook `useForm` de `react-hook-form` gère :
- L'état des champs
- La validation en temps réel
- Les messages d'erreur
- L'envoi du formulaire

### 3.2 Soumission du Formulaire

Quand l'utilisateur clique sur "S'inscrire", la fonction `handleSubmit` est appelée :

```typescript
const handleSubmit = async (values: SignupFormValues) => {
  // 1. Réinitialiser les messages
  setErrorMessage("");
  setSuccessMessage("");
  setLoading(true);

  try {
    // 2. Appeler l'API backend
    const resp = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      }),
    });

    // 3. Parser la réponse
    const body = await resp.json().catch(() => ({}));

    // 4. Traiter les erreurs
    if (!resp.ok) {
      // Cas spécial : email déjà utilisé (422)
      if (resp.status === 422) {
        setErrorMessage(
          "Un compte existe déjà pour cette adresse e-mail. " +
          "Connectez-vous ou utilisez la réinitialisation du mot de passe."
        );
      } else {
        setErrorMessage(body?.error || body?.message || "Une erreur est survenue");
      }
      console.error("Register API error", resp.status, body);
    } else {
      // 5. Succès : rediriger vers la page de connexion
      navigate("/candidate/login", {
        replace: true,
        state: {
          notification: "Inscription réussie ! Un email de confirmation a été envoyé...",
          pendingEmail: values.email,
          from: state?.from,
        },
      });
    }
  } catch (error: unknown) {
    const errorMsg = parseAuthErrorMessage(error);
    setErrorMessage(errorMsg);
    console.error("Signup error:", error);
  } finally {
    setLoading(false);
  }
};
```

**Étapes :**
1. Réinitialiser les messages d'erreur/succès
2. Envoyer les données à `/api/register`
3. Attendre la réponse
4. Si erreur → afficher le message d'erreur
5. Si succès → rediriger vers `/candidate/login` avec notification

---

## 4. Flux Backend (API `/api/register`)

### 4.1 Validation des Champs

```typescript
const { email, password, firstName, lastName } = requestBody;

if (!email || !password) {
  return res.status(400).json({ error: "Missing required fields" });
}
```

### 4.2 Création de l'Utilisateur Supabase

L'API utilise la clé de service Supabase pour créer un utilisateur :

```typescript
const createUserResp = await fetch(
  `${SUPABASE_URL}/auth/v1/admin/users`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      user_metadata: { 
        first_name: firstName, 
        last_name: lastName 
      },
    }),
  }
);

if (!createUserResp.ok) {
  // Gérer les erreurs (ex: email déjà existant)
  return res.status(createUserResp.status).json({ error: errorText });
}

const userId = createUserBody?.id;
```

**Points clés :**
- ✅ Appelle l'API Admin Supabase Auth
- ✅ Transmet le mot de passe hashé par Supabase
- ✅ Stocke le prénom/nom en `user_metadata`
- ✅ Récupère le `userId` généré
- ✅ Statut HTTP 422 = email déjà existant

### 4.3 Création du Profil Candidat

Après la création de l'utilisateur, l'API crée un profil candidat :

```typescript
try {
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
        user_id: userId,        // Lien vers auth.users
        first_name: firstName,
        last_name: lastName,
        email,
        status: "active",
      },
    ]),
  });
} catch (profileError) {
  console.warn("Candidate profile insert failed", profileError);
  // ⚠️ Ne pas bloquer si le profil échoue
}
```

**Raison :** Le profil candidat contient les informations étendues (CV, documents, compétences, etc.)

### 4.4 Génération du Token de Confirmation Email

L'API génère un JWT signé pour la confirmation :

```typescript
// Créer le payload
const tokenPayload = {
  sub: userId,              // Subject (user ID)
  email,
  iat: Math.floor(Date.now() / 1000),           // Issued at
  exp: Math.floor(Date.now() / 1000) + 60*60*24, // Expire in 24 hours
};

// Encoder en base64url
const payloadEncoded = base64url(
  Buffer.from(JSON.stringify(tokenPayload), "utf8")
);

// Signer avec HMAC-SHA256
const signature = base64url(
  createHmac("sha256", EMAIL_SIGNING_SECRET)
    .update(payloadEncoded)
    .digest()
);

// Combiner payload + signature
const token = `${payloadEncoded}.${signature}`;

// Créer le lien
const confirmLink = 
  `${confirmationBaseUrl}/api/confirm?token=${encodeURIComponent(token)}`;
```

**Sécurité :**
- 🔐 Token signé avec `EMAIL_SIGNING_SECRET`
- ⏱️ Expire après 24 heures
- 🔑 Contient l'ID utilisateur et l'email
- 🛡️ Impossible de falsifier sans le secret

### 4.5 Envoi de l'Email de Confirmation

L'API utilise Nodemailer pour envoyer un email transactionnel :

```typescript
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});

await transporter.sendMail({
  from: `"${fromName}" <${fromEmail}>`,
  to: email,
  replyTo: fromEmail,
  subject: "Confirmez votre adresse e-mail",
  text: /* Plain text version */,
  html: renderTransactionalEmail({
    title: "Confirmation de votre inscription",
    intro: "Pour activer votre compte candidat, veuillez confirmer...",
    ctaLabel: "Confirmer mon adresse email",
    ctaUrl: confirmLink,  // ← Lien avec token
    logoUrl,
    fromName,
    bodyHtml: /* HTML content */,
  }),
});
```

**Email envoyé :**
- 📧 Template professionnel avec logo
- 🔗 Bouton CTA pointant vers `/api/confirm?token=...`
- ⚠️ Message : "Lien valable 24 heures"
- 💡 Si pas reçu : "Demandez un renvoi sur la page de connexion"

### 4.6 Réponse Finale

```typescript
return res.status(201).json({
  success: true,
  message: "User created. Confirmation email sent.",
  user: { id: userId },
});
```

---

## 5. Après l'Inscription

### 5.1 Redirection vers la Connexion

Le frontend redirige vers `/candidate/login` avec état :

```typescript
navigate("/candidate/login", {
  replace: true,
  state: {
    notification: "Inscription réussie ! Un email de confirmation a été envoyé...",
    pendingEmail: values.email,
    from: state?.from,
  },
});
```

### 5.2 Confirmation de l'Email

L'utilisateur clique sur le lien `https://site.com/api/confirm?token=...`

L'API `/api/confirm` :
1. Valide le token
2. Vérifie la signature
3. Vérife que le token n'a pas expiré
4. Marque l'utilisateur comme `email_confirmed` dans Supabase Auth
5. Redirige vers `/candidate/login` avec message de succès

### 5.3 Premier Login

Une fois l'email confirmé, l'utilisateur peut se connecter avec :
- Email : l'adresse utilisée à l'inscription
- Mot de passe : le mot de passe choisi

---

## 6. Gestion des Erreurs

### 6.1 Erreurs Communes

| Statut | Cause | Message |
|--------|-------|---------|
| 400 | Champs manquants | "Missing required fields" |
| 422 | Email déjà utilisé | "Un compte existe déjà..." |
| 500 | Erreur serveur | "Une erreur est survenue" |

### 6.2 Validation Côté Client

```
✗ Prénom vide        → "Le prénom est requis"
✗ Email invalide     → "Email invalide"
✗ Mot de passe < 8   → "Doit contenir au moins 8 caractères"
✗ Confirmations ≠    → "Les mots de passe ne correspondent pas"
✗ Conditions refusées → "Vous devez accepter les conditions"
```

---

## 7. Sécurité

### 7.1 Mesures de Protection

| Protection | Implémentation |
|-----------|-----------------|
| **Mot de passe** | Hachage par Supabase Auth (bcrypt) |
| **Validation email** | Confirmation par token signé |
| **Token expiration** | 24 heures maximum |
| **HTTPS** | Obligatoire en production |
| **CORS** | Contrôle côté API |
| **Throttling** | À implémenter si nécessaire |

### 7.2 JWT Signé

```
Format: base64url(payload).base64url(signature)

Payload: { sub, email, iat, exp }
Signature: HMAC-SHA256(payload, EMAIL_SIGNING_SECRET)

Validation:
  1. Décoder le payload
  2. Régénérer la signature
  3. Comparer avec la signature reçue
  4. Vérifier que exp > maintenant
```

---

## 8. Diagramme Complet du Flux

```
┌─────────────────────────────────────────────────────────────────┐
│                     UTILISATEUR (Frontend)                      │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 1. Remplit le formulaire
           │    - Prénom, Nom, Email, Mot de passe
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│               VALIDATION CLIENT (react-hook-form + Zod)         │
│  - Vérifie les champs requis                                    │
│  - Valide le format email                                       │
│  - Vérifie que les mots de passe correspondent                  │
│  - Vérifie que les conditions sont acceptées                    │
└─────────────────────────────────────────────────────────────────┘
           │ (Si valide)
           │ 2. POST /api/register
           │    (email, password, firstName, lastName)
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                API BACKEND (/api/register)                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Valider les champs                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. Créer utilisateur Supabase Auth                       │  │
│  │    POST /auth/v1/admin/users                             │  │
│  │    → Retourne userId                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 3. Créer profil candidat (try/catch)                     │  │
│  │    POST /rest/v1/candidates                              │  │
│  │    → Profil initial avec status="active"                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 4. Générer token de confirmation                         │  │
│  │    JWT: { sub: userId, email, iat, exp }                │  │
│  │    Signature: HMAC-SHA256 avec EMAIL_SIGNING_SECRET      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 5. Envoyer email de confirmation                         │  │
│  │    - Template professionnel                              │  │
│  │    - Lien: /api/confirm?token=...                        │  │
│  │    - Expire dans 24h                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 6. Retourner 201 Created                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │
           │ (Succès)
           │ 3. Rediriger vers /candidate/login
           │    avec notification
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE DE CONNEXION                            │
│  - Message: "Inscription réussie, vérifiez votre email"         │
│  - Utilisateur clique sur lien dans l'email                     │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 4. /api/confirm?token=...
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│               API CONFIRMATION (/api/confirm)                   │
│                                                                  │
│  1. Valider le token                                            │
│  2. Vérifier la signature                                       │
│  3. Vérifier l'expiration                                       │
│  4. Appeler /auth/v1/admin/user/{userId}/email_confirm        │
│  5. Rediriger vers /candidate/login avec succès                 │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              UTILISATEUR PEUT SE CONNECTER                       │
│  - Email confirmé                                               │
│  - Accès complet à la plateforme                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Files de Code Clés

| Fichier | Rôle |
|---------|------|
| `src/pages/candidate/CandidateSignupPage.tsx` | Formulaire frontend |
| `src/features/forms/schemas/auth.schemas.ts` | Schémas Zod validation |
| `api/register.ts` | Création utilisateur + email |
| `api/confirm.ts` | Confirmation email |
| `api/lib/transactional-email.js` | Template email |

---

## 10. Points Importants à Retenir

✅ **Validation en deux étapes** :
- Client (Zod) : rapide, UX feedback immédiat
- Serveur : sécurité, vérification email unique

✅ **Email de confirmation** :
- Signé avec secret privé
- Expire après 24h
- Impossible de falsifier

✅ **Profil candidat** :
- Créé automatiquement avec status="active"
- Erreur non bloquante (try/catch)

✅ **Gestion d'erreurs** :
- Email déjà existant → 422
- Champs manquants → 400
- Erreur serveur → 500

✅ **Sécurité** :
- Mot de passe hashé par Supabase
- Token JWT signé
- RLS Supabase appliquée

