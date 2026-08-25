# Audit final Maélise

Audit statique du code présent après les trois séries de modifications. Aucun code source n'a été modifié pour cet audit.

## 1. Classification d'intention

- `classifyIntent()` existe dans [api/lib/maelise.ts](api/lib/maelise.ts#L38-L78) :
  `export function classifyIntent(message: string): MaeliseIntent`.
- Intentions réellement retournées : `statut_candidature`, `cv`, `preferences_recherche`, `alertes`, `infos_compte`, `services_emploiplus`, `offres_recommandees`, `hors_sujet`.
- Dans [api/maelise.ts](api/maelise.ts#L279-L297), le corps est validé puis `classifyIntent(message)` est appelé avant la lecture de `MAELISE_GROQ_API_KEY`, la création du client Supabase et `authenticate()`.
- Pour `hors_sujet`, le bloc retourne directement un JSON avec `answer`, `sources: []`, `actions: []` et `requires_confirmation: false`. Aucun appel Supabase ou Groq ne suit ce `return`.
- Le compteur mémoire `outOfScopeRequestCount` est incrémenté avant le retour dans [api/maelise.ts](api/maelise.ts#L282-L284).

## 2. Permissions de confidentialité

- La table existe dans [supabase/migrations/20260824200000_create_candidate_ai_permissions.sql](supabase/migrations/20260824200000_create_candidate_ai_permissions.sql#L1-L11).
- Colonnes : `candidate_id`, `identity_contact`, `cv`, `career_profile`, `preferences`, `applications`, `saved_offers_searches`, `alerts`, `updated_at`.
- Les sept colonnes booléennes sont `NOT NULL DEFAULT false` dans cette migration.
- [api/maelise-permissions.ts](api/maelise-permissions.ts#L75-L96) implémente GET avec création d'une ligne par défaut si absente.
- PATCH valide chaque entrée contre `permissionColumns` et exige une valeur booléenne. Plusieurs colonnes sont acceptées dans le même objet ; un seul `.upsert({ candidate_id, ...updates })` est exécuté dans [api/maelise-permissions.ts](api/maelise-permissions.ts#L107-L124). Aucune colonne arbitraire n'est acceptée.
- RLS est activée et la policy réelle est :
  `USING (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))`
  et
  `WITH CHECK (candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid()))`
  dans la migration, lignes 15-19.

## 3. Connexion frontend des permissions

- `privacyEnabled` n'existe plus dans [src/features/maelise/MaeliseWidget.tsx](src/features/maelise/MaeliseWidget.tsx). L'état est `permissions: MaelisePermissions | null`, avec les sept clés.
- Le GET est appelé dans un `useEffect` dépendant de `session`, donc au montage et lors d'un changement de session, lignes 98-124.
- Chaque toggle individuel appelle `updateMaelisePermissions({ [column]: enabled })`, lignes 127-151.
- Le bouton global existe lignes 291-301. Il construit un objet via `Object.fromEntries(maelisePermissionColumns.map(...))`, puis appelle exactement une fois `updateMaelisePermissions(updates)`. Il n'y a pas de boucle d'appels HTTP.
- Si toutes les permissions sont actives, le libellé est `Tout désactiver`; dans tous les autres cas, il est `Tout activer`, y compris pour l'état mixte. La réponse PATCH remplace l'état local.
- `permissionsLoading` désactive le bouton global et les sept toggles individuels.

## 4. Chargement sélectif par intention croisé aux permissions

Le chargeur est [api/maelise.ts](api/maelise.ts#L147-L267), fonction `candidateContextForIntent`.

- `offres_recommandees` : requête `candidates(id)`, requête `candidate_ai_permissions`, puis `candidate_preferences`. `publicContext(..., true)` exécute aussi `job_offers`, `faqs`, `services` et `blog_posts`. Les offres ne sont pas filtrées par les préférences dans `publicContext`.
- `statut_candidature` : requête `candidates(id)`, permissions, puis `job_applications` avec jointure `job_offers`.
- `infos_compte` : requête `candidates(id)`, permissions, puis seconde requête `candidates(first_name,last_name,email,phone,location_city,location_country)`.
- `cv` : requête `candidates(id)`, permissions, puis seconde requête `candidates(cv_text)`.
- `preferences_recherche` : requête `candidates(id)`, permissions, puis `candidate_preferences`.
- `alertes` : requête `candidates(id)`, permissions, puis `notifications` filtrée par `user_id` et `status = active`.
- `services_emploiplus` : aucune requête candidat ; `publicContext(..., false)` exécute `faqs`, `services` et `blog_posts`, sans `job_offers`.
- Pour un candidat authentifié et une intention privée, les permissions sont chargées une seule fois dans `candidateContextForIntent`; aucune requête par catégorie n'est faite. En revanche, la requête `candidates(id)` précède cette lecture.
- Une permission désactivée évite la requête métier et ajoute `La catégorie de données « ... » n'est pas accessible.` dans `candidateResult.unavailable`. Cette valeur est ensuite placée dans `access_restrictions` du contenu du message utilisateur, pas dans un message système séparé.
- Divergence fonctionnelle : `offres_recommandees` charge encore `candidate_preferences` quand la permission est active, alors que la demande prévoyait aucune donnée candidat privée et seulement un filtrage des offres publiques par ces préférences.

## 5. Mémoire de session

- `generateSessionSummary()` existe dans [api/lib/maelise.ts](api/lib/maelise.ts#L81-L96). Elle concatène au maximum `Candidat : ...` et `Statut de recherche : ...`; aucun appel LLM séparé n'est effectué.
- Le résumé est généré si `conversation.summary` est vide, si `maxSequence > 0 && maxSequence % 8 === 0`, ou si `candidate_ai_permissions.updated_at` est postérieur à `conversation.updated_at`, lignes 426-454 de [api/maelise.ts](api/maelise.ts).
- Il est écrit dans `maelise_conversations.summary` avec `updated_at`. Il n'est donc pas régénéré à chaque appel lorsque ces conditions sont fausses.
- `MAX_HISTORY_MESSAGES = 4` dans [api/maelise.ts](api/maelise.ts#L16). Quatre messages bruts au maximum sont envoyés, en plus de deux messages système dont le résumé.

## 6. Cohérence transverse et risques

- Les sept noms sont identiques dans la migration, l'endpoint et le frontend. Le mapping serveur contient seulement `preferences`, `applications`, `identity_contact`, `cv` et `alerts`; `career_profile` et `saved_offers_searches` n'ont aucune intention associée, ce qui correspond aux intentions actuellement prévues mais laisse ces permissions inutilisées par le chargeur.
- L'identifiant `candidates.id` est chargé avant la vérification de la permission dans `candidateContextForIntent`. Il s'agit d'une donnée technique candidat obtenue sans permission, même si aucune donnée de profil n'est ensuite exposée au modèle.
- Le garde-fou rejette les messages vides au niveau de `stringValue`; le fallback de `classifyIntent()` retourne `hors_sujet`. Aucun contournement par intention inconnue n'est visible dans le switch, qui ne charge rien dans `default`.
- Appels bornés pour un candidat avec conversation existante : `auth.getUser`, 1 lecture conversation, 1 lecture historique, 3 requêtes publiques pour les services ou 4 avec les offres, 3 requêtes candidat si permission active, éventuellement 1 UPDATE de résumé, 1 INSERT de deux messages et 1 appel Groq. Cela représente environ 10-11 opérations Supabase, plus Groq. Une nouvelle conversation ajoute 1 INSERT.
- Si la permission est refusée, le chemin candidat compte 2 requêtes (`candidates(id)` et permissions) au lieu de 3. Pour un anonyme, il n'y a pas de requêtes candidat.

## 7. Résumé des écarts

- `offres_recommandees` charge `candidate_preferences` et ne filtre pas réellement `job_offers` par ces préférences.
- `access_restrictions` est transmis dans le contenu utilisateur et non dans un message système dédié.
- Une lecture de `candidates(id)` intervient avant la vérification de permission.
- Les intentions `career_profile` et `saved_offers_searches` n'ont pas de chargement métier associé.
- `publicContext` charge FAQ/services/blog pour les offres, alors que la description demandait uniquement `job_offers` pour cette intention.
- Le nombre annoncé de requêtes reste borné, mais inclut plusieurs requêtes publiques et la lecture technique du candidat par intention.
