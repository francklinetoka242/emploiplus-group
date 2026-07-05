# Envoi d'e-mails — architecture simplifiée

Le projet n'utilise plus Supabase Send Email Hook. Le flux actuel est :

Frontend → `api/register` → Supabase Admin API → génération d'un token signé (HMAC) → Nodemailer → SMTP LWS → email de confirmation

L'endpoint `POST /send-email` accepte des payloads JSON non signés et envoie l'email via `nodemailer`.

## Variables d'environnement requises

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME`, `PORT`

## Remarques

- `SEND_EMAIL_HOOK_SECRET` n'est plus utilisé et ne doit plus être configuré.
- La signature et la validation des tokens utilisent uniquement `EMAIL_SIGNING_SECRET`.
