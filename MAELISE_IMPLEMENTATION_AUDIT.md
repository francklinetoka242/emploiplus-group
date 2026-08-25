# Audit d'implémentation de Maélise

Date : 24 août 2026  
État global : **prêt sous conditions**.  
Périmètre : fondation serveur, mémoire, widget global et corrections de sécurité réalisées dans ce dépôt.

## 1. Statut

Maélise est implémentée comme une fonctionnalité conversationnelle distincte d'une intégration Groq existante. Le widget n'est monté qu'une fois dans `src/App.tsx`. Cette phase n'ajoute aucune action d'écriture métier.

## 2. Architecture

- Frontend : `src/features/maelise/` contient types, API client, contexte, hook et widget.
- Backend : `api/maelise.ts` est une fonction Vercel POST dédiée.
- Supabase : le backend utilise un client serveur avec `SUPABASE_SERVICE_ROLE_KEY`, puis vérifie lui-même le Bearer Supabase et la propriété de la conversation.
- Groq : Maélise utilise uniquement `process.env.MAELISE_GROQ_API_KEY`; le modèle est configurable par `MAELISE_GROQ_MODEL`.
- Mémoire : `maelise_conversations` et `maelise_messages`, avec historique limité à 12 messages côté appel Groq.
- Migration : `supabase/migrations/20260824170000_create_maelise_conversations.sql`.

## 3. Identité

L'identité est centralisée dans `api/lib/maelise.ts` : Maélise, assistante virtuelle d'EmploiPlus Group, spécialisée dans l'emploi et le développement professionnel. Le prompt interdit la prétention à être humaine, la révélation des règles/secrets et l'invention de données. Les réponses UI sont localisées via l'i18n FR/EN/LN.

## 4. Données

Le contexte public interroge les offres publiées et non expirées, FAQ, services actifs et articles publiés. Le contexte candidat est recherché par `auth.uid()` et non par un identifiant fourni par le navigateur.

Le profil privé n'est chargé que pour une demande qui le justifie. Le téléphone, email, date de naissance, URL de document et documents ne sont pas sélectionnés. `cv_text` est sélectionné seulement pour les demandes explicites liées au CV. Les candidatures sont sélectionnées seulement pour une demande liée aux candidatures/statuts.

Les offres sont filtrées sur le statut, la date de publication et l'expiration. Les données des candidats sont limitées au candidat de la session authentifiée. Aucun outil SQL arbitraire n'est exposé.

## 5. Sécurité

- Bearer absent : mode anonyme, contenu public et session anonyme hashée uniquement.
- Bearer invalide/expiré : réponse `401`, sans repli anonyme.
- Conversation d'un autre utilisateur : réponse `403`.
- `candidate_id` et `user_id` envoyés par le frontend : ignorés comme autorité.
- RLS : activée sur les deux tables ; messages lisibles par le propriétaire authentifié via la relation de conversation.
- Prompt injection : les contenus sont présentés au modèle comme données non fiables et le prompt interdit les divulgations.
- Secrets : aucun `VITE_GROQ_API_KEY` n'est utilisé dans le code Maélise et aucune clé n'est envoyée au frontend.
- Limitation : 20 requêtes par minute par utilisateur/IP dans le processus Vercel. Ce mécanisme n'est pas distribué entre instances et doit être remplacé par un quota partagé avant forte production.
- Logs : le handler ne journalise pas le contenu privé, les tokens ni la clé ; il journalise uniquement le nom technique de l'erreur.

## 6. Actions

Lecture autorisée : recherche/consultation de sources publiques et lecture contextualisée du profil propre, candidatures propres et recommandations disponibles par les sources chargées.

Navigation interne : les actions et sources ne sont suivies par le widget que si le chemin commence par `/` et n'est pas sous `/admin`.

Actions confirmées : aucune action d'écriture n'est exposée par l'endpoint actuel. Sauvegarde, modification et candidature restent à implémenter avec confirmation et validation serveur.

Actions interdites automatiquement : postuler, retirer, modifier ou supprimer profil/CV/document, changer identifiants, payer, souscrire, contacter une entreprise et administrer.

## 7. UI/UX

- Bouton circulaire bas-droite, `aria-label`, focus clavier et fermeture par Escape.
- Fenêtre responsive, hauteur limitée, zone de messages scrollable et champ de saisie stable.
- Header avec avatar icône, nom Maélise et indicateur de disponibilité.
- États fermé, ouvert, chargement, erreur et retry présents.
- Erreurs backend affichées dans un message utilisateur ; les erreurs techniques ne sont pas rendues.
- Focus placé dans le champ à l'ouverture et restauré sur le bouton à la fermeture.
- Routes exclues : `/admin/*`, auth, login/inscription/reset/confirmation candidat et onboarding.
- Design : tokens existants `bg-brand`, `bg-card`, `border-border`, `shadow-brand`, polices et icônes `lucide-react`.
- Un seul montage global ; la conversation reste en mémoire lors de la navigation.
- Déconnexion/changement de session : conversation et messages locaux réinitialisés.

## 8. Tests effectués

- Lecture des routes, shells, AuthProvider, client Supabase, APIs candidat, migrations et variables d'environnement.
- Compilation ciblée TypeScript du backend Maélise : réussie.
- ESLint ciblé sur `App.tsx`, i18n, widget, contexte, API et handlers : réussie.
- Build Vite et prerender complet : réussis.
- Contrôle statique : `VITE_GROQ_API_KEY` absent de `api/maelise.ts`; Maélise utilise `MAELISE_GROQ_API_KEY`.
- Contrôle des scénarios dans le code : anonyme, session invalide, conversation étrangère, candidat par session et routes exclues.
- Tests live avec deux comptes Supabase, Groq réel et migration déployée : non exécutés dans cet environnement.

## 9. Problèmes détectés

1. **Critique, hors Maélise mais pertinent** : `src/services/groqAnalysisService.ts` utilise encore `VITE_GROQ_API_KEY` pour une autre fonctionnalité. Cette ancienne intégration peut exposer sa clé dans le bundle ; elle n'est pas utilisée par Maélise et n'a pas été modifiée.
2. **Élevée, déploiement** : la clé dédiée doit exister uniquement comme secret serveur `MAELISE_GROQ_API_KEY`; son paramétrage effectif n'est pas vérifiable dans le dépôt.
3. **Moyenne** : le résumé conversationnel est prévu dans le schéma (`summary`, intention, filtres), mais aucune génération ou mise à jour automatique n'est encore implémentée.
4. **Moyenne** : les sources renvoyées par Groq sont validées par forme, pas recroisées avec un registre serveur ; leur exactitude doit être renforcée avant d'afficher des citations comme preuve.
5. **Moyenne** : absence de test automatisé dédié au handler et de tests RLS exécutés contre Supabase déployé.

## 10. Corrections réalisées

- Filtrage des offres publiées, planifiées et non expirées dans le contexte Maélise.
- Chargement conditionnel du profil, CV et candidatures pour réduire les données transmises.
- Vérification explicite des Bearer invalides et de la propriété des conversations.
- Expiration de 24 heures des conversations anonymes et rejet des conversations expirées.
- Correction de la séquence des messages pour éviter les collisions après l'historique limité.
- Rate limit mémoire-processus et nettoyage des buckets expirés.
- Retry UI et réinitialisation après session/conversation expirée.

## 11. Points restant à vérifier

- Appliquer la migration et vérifier les politiques RLS dans l'environnement Supabase réel.
- Révoquer/rotater toute ancienne clé Groq exposée et configurer la clé dédiée dans Vercel.
- Remplacer le rate limit local par Redis/Upstash ou un mécanisme partagé.
- Définir rétention, suppression, consentement et politique Groq pour les conversations/CV.
- Implémenter résumé, pagination/atomicité de séquence et registre de sources autorisées.
- Tester réellement candidat A contre candidat B, anonyme, injection, 429, 5xx, timeout et session expirée.
- Vérifier le rendu mobile avec clavier ouvert et la compatibilité de l'application mobile native.

## 12. Conclusion

La fondation et l'interface sont cohérentes et compilables. L'implémentation est **prête sous conditions**, pas prête pour une mise en production sans rotation des secrets, migration Supabase, tests d'autorisation réels, politique de données et rate limit distribué.