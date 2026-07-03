# Déploiement Send Email Hook Supabase

## Architecture demandée

Supabase Auth
  ↓
Send Email Hook
  ↓
Mon API Express TypeScript
  ↓
Nodemailer
  ↓
SMTP LWS
  ↓
contact@emploiplus-group.com

## Description

Cette API Express TypeScript reçoit uniquement les requêtes du Send Email Hook de Supabase.
Elle vérifie le secret du hook, journalise le payload, et envoie l'email via SMTP LWS.

## Endpoints

- `GET /health`
  - Vérifie que le serveur fonctionne
  - Réponse: `200 { status: "ok" }`

- `POST /send-email`
  - Reçoit le webhook Supabase
  - Vérifie la signature avec `SEND_EMAIL_HOOK_SECRET`
  - Envoie l'email via `nodemailer`

## Variables d'environnement requises

- `SMTP_HOST` : `mail55.lwspanel.com`
- `SMTP_PORT` : `465`
- `SMTP_USER` : `contact@emploiplus-group.com`
- `SMTP_PASS` : mot de passe SMTP LWS
- `FROM_EMAIL` : `contact@emploiplus-group.com`
- `FROM_NAME` : `EmploiPlus Group`
- `SEND_EMAIL_HOOK_SECRET` : secret Supabase Send Email Hook
- `PORT` : port du serveur (par défaut `3000`)

## Comment configurer Supabase

1. Dans Supabase Dashboard, allez dans `Authentication` → `Settings`.
2. Cliquez sur `Send Email Hook`.
3. Entrez l'URL de votre serveur: `https://votre-domain.tld/send-email`
4. Copiez le secret et placez-le dans `SEND_EMAIL_HOOK_SECRET`.

## Exemple de `.env`

```env
SMTP_HOST=mail55.lwspanel.com
SMTP_PORT=465
SMTP_USER=contact@emploiplus-group.com
SMTP_PASS=mot_de_passe_smtp_lws
FROM_EMAIL=contact@emploiplus-group.com
FROM_NAME=EmploiPlus Group
SEND_EMAIL_HOOK_SECRET=v1,whsec_base64_secret
PORT=3000
```

## Lancer localement

```bash
npm install
npm run dev:server
```

## Déploiement

### Option 1: VPS / Serveur dédié
1. Copier le code sur le serveur
2. Installer Node.js
3. Installer les dépendances: `npm install`
4. Créer un fichier `.env` sur le serveur
5. Lancer: `npm run dev:server`

### Option 2: Plateforme de déploiement (Heroku / Railway / Fly)
1. Pousser le code sur GitHub
2. Configurer le déploiement sur la plateforme
3. Définir les variables d'environnement exactes
4. Assurez-vous que l'URL `/send-email` est accessible publiquement

## Compatibilité payload Supabase

Le serveur accepte le payload officiel Supabase Send Email Hook.
Si le format n'est pas exactement connu, il journalise intégralement `req.body` et renvoie un message d'erreur clair.

## Journalisation

- `console.info` : payload reçu, email envoyé
- `console.error` : signature invalide, payload invalide, erreur SMTP

## Notes importantes

- Ce serveur ne fait qu'une chose : recevoir le hook et envoyer l'email.
- Supabase Auth reste responsable de l'inscription, de la connexion, de la confirmation d'email, de la réinitialisation de mot de passe et des magic links.
- Il n'y a aucune logique d'envoi d'email dans React.
- Il n'y a aucune solution de fallback, ni SendGrid, ni Mailgun, ni Brevo.
