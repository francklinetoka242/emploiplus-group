# Audit des correctifs Maélise

Audit statique du code actuel. Aucun fichier source n'a été modifié.

## 1. Correctif 1 — Documentation de candidates(id)

- Dans [api/maelise.ts](api/maelise.ts#L188-L196), le commentaire existe au-dessus de la requête :
  > `Exception technique incontournable : seul l'identifiant candidat est lu pour retrouver la ligne de permissions.`
  > `Aucune donnée de profil n'est exposée à ce stade; toute donnée métier reste conditionnée à la permission ci-dessous.`
- La requête réelle est `.from("candidates").select("id")`, utilisée pour retrouver `candidate_id`.
- La vérification de permission est exécutée juste après via `candidate_ai_permissions`.
- Le nombre d'opérations reste équivalent sur le chemin candidat. L'ordre a changé par rapport à l'audit précédent : [api/maelise.ts](api/maelise.ts#L477-L486) attend maintenant `candidateContextForIntent` avant `publicContext`, alors que ces deux chargements étaient auparavant lancés dans un `Promise.all`. Le comportement de données est conservé, mais l'exécution n'est plus parallèle.

## 2. Correctif 2 — Intentions parcours_professionnel et offres_sauvegardees

- Les deux valeurs existent dans `MaeliseIntent` dans [api/lib/maelise.ts](api/lib/maelise.ts#L29-L42).
- `parcours_professionnel` est reconnu par les mots-clés normalisés : `experience`, `experiences`, `diplome`, `diplomes`, `formation`, `formations`, `competence`, `competences`, `langue`, `langues`, `parcours professionnel`, `langue parle` ([api/lib/maelise.ts](api/lib/maelise.ts#L56-L63)).
- `offres_sauvegardees` est reconnu par : `offre|offres` suivi de `sauvegard|enregistr|mises? de cote`, ou `favoris`, `recherche enregistr`, `recherche sauvegard` ([api/lib/maelise.ts](api/lib/maelise.ts#L44-L50)).
- Le mapping réel est dans [api/maelise.ts](api/maelise.ts#L165-L175) : `parcours_professionnel -> career_profile`; `offres_sauvegardees -> saved_offers_searches`.
- `parcours_professionnel` interroge `candidate_experience`, `candidate_education`, `candidate_skills`, `candidate_languages` en parallèle ([api/maelise.ts](api/maelise.ts#L272-L303)).
- `offres_sauvegardees` interroge `candidate_saved_offers` avec jointure `job_offers`, puis `candidate_saved_searches` ([api/maelise.ts](api/maelise.ts#L306-L340)).
- Les deux branches passent par le contrôle commun `permissions?.[permission] !== true` avant leurs requêtes métier. Une permission désactivée retourne `candidate: null` et ajoute `La catégorie de données « ... » n'est pas accessible.` dans `unavailable` ([api/maelise.ts](api/maelise.ts#L202-L213)).
- Mapping complet permission -> intentions : `identity_contact -> infos_compte`; `cv -> cv`; `career_profile -> parcours_professionnel`; `preferences -> offres_recommandees, preferences_recherche`; `applications -> statut_candidature`; `saved_offers_searches -> offres_sauvegardees`; `alerts -> alertes`.
- Les sept permissions ont donc chacune au moins une intention métier associée.

## 3. Correctif 3 — Filtrage réel des offres par préférences

- Pour `offres_recommandees`, [api/maelise.ts](api/maelise.ts#L108-L132) récupère `candidate_preferences` si `preferences` est active, puis [api/maelise.ts](api/maelise.ts#L477-L486) transmet ces préférences à `publicContext` en mode `jobs`.
- La clause réelle est :
  > `if (contractTypes.length > 0) jobsQuery = jobsQuery.in("contract_type", contractTypes);`
  dans [api/maelise.ts](api/maelise.ts#L128-L128).
- Aucun filtrage `work_types`, `salary_min`, `salary_max` ou `seniority_level` n'est implémenté. Le schéma réel de `job_offers` consulté dans les migrations contient `contract_type` et `salary` texte, mais pas les autres colonnes compatibles. Le correctif est donc partiel par rapport à la liste demandée.
- Si `preferences` est désactivée, `candidateContextForIntent` ne requête pas `candidate_preferences`, ajoute la restriction et `publicContext` reçoit des préférences absentes : la requête `job_offers` reste non filtrée.

## 4. Correctif 4 — access_restrictions en message système

- `access_restrictions` n'existe plus dans l'objet `context` du message utilisateur ([api/maelise.ts](api/maelise.ts#L510-L519)).
- La restriction est envoyée comme message système conditionnel, après `MAELISE_SYSTEM_PROMPT` et avant le résumé de session ([api/maelise.ts](api/maelise.ts#L532-L543)).
- La forme réelle commence par `Restrictions d'accès actives pour cette conversation : [...]` et précise que les catégories ne doivent pas être présentées comme disponibles.
- Le message n'est ajouté que si `candidateResult.unavailable.length > 0`; il est absent lorsque la liste est vide.

## 5. Correctif 5 — publicContext restreint pour offres_recommandees

- L'appel réel est [api/maelise.ts](api/maelise.ts#L477-L486) :
  > `intent === "offres_recommandees" ? "jobs" : "public"`
- La signature est `publicContext(supabase, message, mode, preferences?)`, avec `type PublicContextMode = "jobs" | "public"` ([api/maelise.ts](api/maelise.ts#L102-L109)).
- En mode `jobs`, seule `job_offers` est interrogée et le retour contient `faqs: [], services: [], blog: []` ([api/maelise.ts](api/maelise.ts#L111-L132)).
- En mode `public`, FAQ, services et blog sont toujours interrogés ([api/maelise.ts](api/maelise.ts#L135-L158)). Toutes les intentions autres que `offres_recommandees`, dont `services_emploiplus`, passent en mode `public`.

## 6. Non-régression sur l'existant validé précédemment

- Le garde-fou appelle `classifyIntent` après validation du corps et retourne immédiatement pour `hors_sujet`, avant création du client Supabase et avant Groq ([api/maelise.ts](api/maelise.ts#L367-L390)).
- Le widget conserve les sept toggles et le bouton global. Le bouton global construit les sept clés avec `Object.fromEntries`, appelle une fois `updateMaelisePermissions`, puis utilise la réponse serveur ([src/features/maelise/MaeliseWidget.tsx](src/features/maelise/MaeliseWidget.tsx#L152-L178)).
- Son libellé reste `Tout désactiver` si toutes les permissions sont actives, sinon `Tout activer` ([src/features/maelise/MaeliseWidget.tsx](src/features/maelise/MaeliseWidget.tsx#L291-L301)).
- `generateSessionSummary()` et sa construction par concaténation sont inchangées ([api/lib/maelise.ts](api/lib/maelise.ts#L81-L96)). La régénération reste conditionnée par résumé vide, séquence multiple de 8 ou changement de permission ([api/maelise.ts](api/maelise.ts#L490-L503)).
- `MAX_HISTORY_MESSAGES` vaut toujours `4` dans [api/maelise.ts](api/maelise.ts#L16).

## 7. Cohérence transverse et nombre de requêtes

Le prompt parle de « 9 intentions » (7 initiales + 2), mais le type actuel contient 10 valeurs en comptant `hors_sujet`.

Mapping intention -> permission -> tables réellement interrogées :

- `offres_recommandees -> preferences -> candidates(id), candidate_ai_permissions, candidate_preferences si autorisée, job_offers`; sinon pas de `candidate_preferences` et `job_offers` non filtrées.
- `statut_candidature -> applications -> candidates(id), candidate_ai_permissions, job_applications + job_offers`.
- `infos_compte -> identity_contact -> candidates(id), candidate_ai_permissions, candidates(identity)`.
- `cv -> cv -> candidates(id), candidate_ai_permissions, candidates(cv_text)`.
- `preferences_recherche -> preferences -> candidates(id), candidate_ai_permissions, candidate_preferences`.
- `alertes -> alerts -> candidates(id), candidate_ai_permissions, notifications`.
- `parcours_professionnel -> career_profile -> candidates(id), candidate_ai_permissions, candidate_experience, candidate_education, candidate_skills, candidate_languages`.
- `offres_sauvegardees -> saved_offers_searches -> candidates(id), candidate_ai_permissions, candidate_saved_offers + job_offers, candidate_saved_searches`.
- `services_emploiplus -> aucune -> faqs, services, blog_posts`.

Pour une conversation existante et un candidat authentifié, les opérations communes sont : `auth.getUser`, lecture conversation, lecture historique, puis les chargements de contexte; Groq est appelé une fois si la configuration est présente.

- `services_emploiplus` : 1 lecture conversation + 1 lecture historique + 3 lectures publiques + 1 lecture message permissions non effectuée = environ 5 opérations Supabase, plus insertion des deux messages et Groq, soit environ 6 opérations Supabase au total.
- `infos_compte` avec permission désactivée : lecture conversation + historique + `candidates(id)` + permissions + 3 lectures publiques + insertion messages = environ 7 opérations Supabase, plus Groq.
- `parcours_professionnel` avec permission active : lecture conversation + historique + `candidates(id)` + permissions + 4 requêtes parcours + 3 lectures publiques + mise à jour résumé éventuelle + insertion messages = environ 11 à 12 opérations Supabase, plus Groq.
- Une conversation nouvellement créée ajoute une insertion de conversation. Le résumé ajoute une mise à jour seulement lorsque sa condition de régénération est satisfaite.

Les deux nouvelles branches vérifient la permission commune avant leurs requêtes métier; aucun chemin de ces branches ne charge les quatre tables sans `career_profile = true`, ni les deux tables sauvegardées sans `saved_offers_searches = true`.

## 8. Résumé des écarts restants

- Le filtrage des offres recommandées est limité à `contract_type`; `work_types`, salaires et séniorité ne sont pas filtrés.
- Le chargement candidat est exécuté avant le chargement public et non plus en parallèle comme dans l'état audité précédemment.
- Le type contient 10 valeurs avec `hors_sujet`, alors que la consigne de comptage parle de 9 intentions.
- La lecture technique de `candidates(id)` a lieu avant la lecture de permission; elle est documentée comme exception et n'expose que l'identifiant technique.
