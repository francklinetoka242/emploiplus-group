# Endpoint POST /api/send-email

Ce document décrit la logique complète de l’endpoint `POST /api/send-email`, tel qu’implémenté dans `api/send-email.ts`.

## 1) Format de payload accepté

L’endpoint attend un corps JSON. Il lit le body brut puis le parse avec `JSON.parse(...)`.

### Champs acceptés

Le type TypeScript `SendEmailPayload` contient ces champs (optionnels au niveau du type, mais plusieurs sont ensuite considérés comme requis par la logique métier) :

- `recipient` : destinataire principal
- `to` : alias de `recipient`
- `email` : alias de `recipient`
- `replyTo`, `reply_to`, `replyto` : destinataire de réponse
- `subject` : objet du mail
- `html` : contenu HTML du message
- `body` : alias de `html`
- `message` : alias de `html`
- `text` : version texte du message
- `attachments` : tableau de pièces jointes
- `template`, `emailTemplate`, `layout` : mode de template
- `params` : objet permettant de passer des valeurs alternatives, notamment pour les alias (`recipient`, `to`, `email`, etc.)
- tout autre champ est toléré via `[key: string]: unknown`

### Règle de résolution des valeurs

La fonction `getPayloadValue(body, keys)` récupère la première valeur non vide parmi les clés demandées :

- `recipient` via `recipient`, `to`, `email`
- `replyTo` via `replyTo`, `reply_to`, `replyto`
- `subject` via `subject`
- `html` via `html`, `body`, `message`
- `text` via `text`
- `template` via `template`, `emailTemplate`, `layout`

Elle cherche aussi dans `body.params` si une clé est fournie sous ce format :

```json
{
  "params": {
    "to": "me@example.com",
    "subject": "Objet",
    "html": "<p>Bonjour</p>"
  }
}
```

### Exemple de payload valide

```json
{
  "recipient": "recruteur@exemple.com",
  "replyTo": "candidat@exemple.com",
  "subject": "Nouvelle candidature - Développeur Front",
  "html": "<div><p>Bonjour,</p><p>Je vous adresse ma candidature.</p></div>",
  "text": "Bonjour,\nJe vous adresse ma candidature.",
  "template": "simple-application",
  "attachments": [
    {
      "filename": "cv.pdf",
      "path": "https://example.com/cv.pdf",
      "contentType": "application/pdf"
    }
  ]
}
```

### Note importante sur les templates

Il n’existe pas de vrai moteur de template dédié dans cet endpoint. La variable `templateMode` est seulement utilisée pour détecter un mode spécifique (`simple-application`) et, dans ce cas, le code garde tout le contenu déjà construit côté frontend sans le rewrapper dans un layout e-mail standard.

Autrement dit :

- `template` n’est pas compilé ou rendu automatiquement
- le contenu HTML est transmis tel quel dans `html`
- le code ne charge pas de fichier `.hbs`, `.ejs`, `.njk` etc.

---

## 2) Validation

### Validation du verbe HTTP

L’endpoint vérifie :

```ts
if (req.method !== "POST") {
  res.setHeader("Allow", "POST");
  return res.status(405).json({ error: "Method not allowed" });
}
```

Réponse si mauvaise méthode :

```json
{ "error": "Method not allowed" }
```

### Validation du JSON

Il lit le body brut, puis tente `JSON.parse(...)`.

Si le JSON est invalide :

```json
{ "error": "Unable to parse JSON payload" }
```

avec code HTTP `400`.

### Vérification des champs obligatoires

À la fin, il valide :

```ts
if (!recipient || !subject || !finalHtml) {
  return res.status(400).json({
    error: "Invalid payload",
    missing: {
      recipient: !recipient,
      subject: !subject,
      html: !finalHtml,
    },
  });
}
```

Donc, en pratique, le payload doit contenir au minimum :

- `recipient` (alias acceptable : `to`, `email`)
- `subject`
- soit `html`, soit `body`, soit `message`, ou fallback par conversion de `text`

Important :

- `finalHtml` peut être construit automatiquement à partir de `text` si `html` manque.
- `finalText` est aussi dérivé si besoin.

### Vérification de signature / authentification

Il n’y a AUCUNE vérification d’authentification, d’API key, de JWT, de signature HMAC ou de token sur cet endpoint.

Le code ne lit ni :

- `Authorization` header
- `x-api-key`
- cookie de session
- signature de webhook
- token de sécurité

Le endpoint est donc un service d’envoi SMTP “ouvert” tant que la requête est une requête POST valide JSON.

### Gestion des erreurs

Les erreurs sont renvoyées selon le type :

1. JSON invalide -> `400`
2. méthode non POST -> `405`
3. payload invalide -> `400`
4. échec SMTP / Nodemailer -> `500`

Exemple d’erreur SMTP :

```json
{
  "error": "Failed to send email",
  "details": "SMTP connection failed"
}
```

L’erreur est logguée côté serveur via `console.error("Failed to send email", error);`.

---

## 3) Traitement

### 3.1 Configuration SMTP

Au chargement du module, l’endpoint exige des variables d’environnement :

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

Ces valeurs sont validées par :

```ts
function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required in environment variables`);
  }
  return value;
}
```

Puis :

```ts
const smtpPort = Number(smtpPortRaw);
if (Number.isNaN(smtpPort) || smtpPort <= 0) {
  throw new Error("SMTP_PORT must be a valid positive number");
}
```

Le transport SMTP est créé avec Nodemailer :

```ts
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});
```

### 3.2 Construction de l’email

Le code construit ensuite :

- `recipient` : première valeur trouvée parmi `recipient`, `to`, `email`
- `replyTo` : première valeur trouvée parmi `replyTo`, `reply_to`, `replyto`, sinon fallback `replyToEmail`
- `subject` : valeur fournie ou défaut `"Message from " + fromName`
- `originalHtml` : valeur HTML depuis `html`, `body`, `message`
- `text` : contenu texte
- `templateMode` : `template`, `emailTemplate`, ou `layout`

Ensuite :

```ts
let finalHtml = originalHtml || "";
let finalText = text || "";
```

Cas particulier :

```ts
if (templateMode === "simple-application") {
  finalHtml = originalHtml || "";
  finalText = text || "";
}
```

Cela signifie que pour ce mode, le frontend a déjà généré le HTML et le texte, et l’endpoint ne fait pas d’encapsulation supplémentaire.

### 3.3 Fallback HTML depuis le texte

Si `html` n’est pas présent mais que `text` existe :

```ts
if (!finalHtml && finalText) {
  finalHtml = `<div style="font-family:Arial, Helvetica, sans-serif;color:#111827;line-height:1.6;">${finalText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />")}</div>`;
}
```

Cela transforme le texte brut en HTML simple et sûre.

### 3.4 Pièces jointes

Les pièces jointes peuvent être envoyées sous forme de tableau. Le code tente de résoudre les pièces jointes distantes (`path` commençant par `http://` ou `https://`) :

- effectue un `fetch(attachment.path)`
- vérifie `response.ok`
- récupère le `arrayBuffer`
- convertit le contenu en base64
- remplace `path` par `undefined` et ajoute `content` + `encoding`

Si l’URL de pièce jointe échoue, il logue un warning et garde la pièce jointe d’origine pour un retry.

### 3.5 Envoi via Nodemailer

La structure finale de l’email est ensuite envoyée :

```ts
return transporter.sendMail({
  from: `"${fromName}" <${senderEmail}>`,
  to: recipient,
  replyTo,
  subject,
  html: finalHtml,
  text: finalText ?? undefined,
  attachments: attachments.length > 0 ? attachments : undefined,
});
```

Le `from` utilise :

- `fromName`: `process.env.FROM_NAME || "EmploiPlus Group"`
- `senderEmail`: `fromEmail` = `smtpUser`

Autrement dit, le mail est envoyé depuis l’adresse SMTP configurée, sauf si `FROM_EMAIL` est utilisée comme valeur de `replyToEmail`, pas comme expéditeur principal.

---

## 4) Réponse

### Cas de succès

En cas d’envoi réussi :

```json
{
  "status": "sent",
  "messageId": "<abc123@mailer>",
  "from": "smtp-user@exemple.com",
  "replyTo": "support@exemple.com"
}
```

Code HTTP : `200`.

### Cas d’erreur

#### Payload invalide

```json
{
  "error": "Invalid payload",
  "missing": {
    "recipient": true,
    "subject": false,
    "html": true
  }
}
```

Code HTTP : `400`.

#### JSON invalide

```json
{ "error": "Unable to parse JSON payload" }
```

Code HTTP : `400`.

#### Envoi SMTP impossible

```json
{
  "error": "Failed to send email",
  "details": "SMTP connection failed"
}
```

Code HTTP : `500`.

#### Méthode HTTP incorrecte

```json
{ "error": "Method not allowed" }
```

Code HTTP : `405`.

---

## Exemple d’utilisation côté client

```ts
await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    recipient: "recruteur@exemple.com",
    replyTo: "candidat@exemple.com",
    subject: "Nouvelle candidature - Développeur Front",
    html: "<div><p>Bonjour,</p><p>Voici ma candidature.</p></div>",
    text: "Bonjour,\nVoici ma candidature.",
    template: "simple-application",
    attachments: [
      {
        filename: "cv.pdf",
        path: "https://example.com/cv.pdf",
        contentType: "application/pdf",
      },
    ],
  }),
});
```

Ce code est bien compatible avec l’implémentation actuelle de l’endpoint.
