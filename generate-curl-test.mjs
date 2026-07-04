import dotenv from 'dotenv';
import { Webhook } from 'standardwebhooks';

const env = dotenv.config({ path: './.env' }).parsed;
// SEND_EMAIL_HOOK_SECRET removed — this generator now sends an unsigned curl example
const secret = '';
const payload = JSON.stringify({
  type: 'signup',
  recipient: 'test.candidate@example.com',
  subject: 'Confirmation de votre inscription',
  html: '<p>Merci de confirmer votre email</p>',
});

console.log('Commande curl:');
console.log('');
console.log(`curl.exe -X POST https://emploiplus-group.com/send-email \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '${payload}' \\`);
console.log(`  -i`);
console.log('');
console.log('Résultat attendu: HTTP 200 avec status "sent"');
