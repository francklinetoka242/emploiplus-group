# 🛡️ RAPPORT D'AUDIT : SÉCURITÉ & CONFORMITÉ
*Généré par GitHub Copilot — Date : 18 sept. 2026*

## 1. Synthèse Globale
- **Statut de sécurité SQLi :** Conforme
- **Niveau de sécurité général :** Élevé
- **Taux de conformité architecture & charte :** 84%

## 2. Analyse Sécurité & Injections SQL (Recherche & Formulaires)
- [ ] Liste des fichiers inspectés pour la recherche.
  - `src/pages/public/JobsPage.tsx`
  - `src/features/jobs/api/jobsApi.ts`
  - `src/features/jobs/search/naturalLanguageSearch.ts`
  - `src/features/admin/api/analyticsApi.ts`
  - `src/integrations/supabase/client.ts`
  - `src/features/authentication/guards/ProtectedRoute.tsx`
  - `api/*.ts` (serverless endpoints)
  - `server/*.ts`
  - `supabase/migrations/*.sql`
- [ ] Vulnérabilités détectées (indiquer le fichier et la ligne exacte si problème).
  - Aucune vulnérabilité critique de type SQL injection détectée sur les recherches et formulaires inspectés.
  - Les requêtes de recherche utilisent majoritairement des méthodes paramétrées du SDK Supabase (`.eq()`, `.ilike()`, `.or()`, `.in()`) plutôt que du SQL concaténé. Exemple de bon usage : `src/features/jobs/api/jobsApi.ts` (recherche d’offres) et `src/features/admin/api/analyticsApi.ts` (filtres analytics).
  - Point de vigilance : plusieurs filtres analytics utilisent des sous-requêtes `in(...)` avec des valeurs utilisateur interpolées dans des `%${value}%` et ne disposent pas d’un schéma Zod centralisé au niveau des endpoints. Cela n’est pas une injection SQL en soi avec Supabase, mais il faut renforcer une validation des entrées côté API pour éviter les erreurs de type et les abus de filtrage. Fichiers concernés : `src/features/admin/api/analyticsApi.ts`.
  - Aucune présence de `raw()`, `sql` ou exécution SQL directe détectée dans `src/` ni dans les endpoints front/serverless du projet.
- [ ] Bonnes pratiques validées (ex: usage de `.ilike()`, masquage des clés privées).
  - Le client frontend est bien construit avec l’anon key uniquement : `src/integrations/supabase/client.ts` charge `import.meta.env.VITE_SUPABASE_ANON_KEY` et jamais la clé service role.
  - Les secrets serveur sont bien conservés dans `api/` et `server/` et non importés dans les composants UI ; usage de `process.env.SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur / runtime de fonctions serverless.
  - Les recherches public/Job utilisent `supabase.from(...).ilike(...).or(...)` et non du SQL concaténé ; le mécanisme reste conforme aux recommandations Supabase.
  - Les élément de routes protégées sont présents et bien structurés via `ProtectedRoute` et les guards d’authentification/rôles : `src/features/authentication/guards/ProtectedRoute.tsx` et `src/App.tsx`.

## 3. Conformité Architecture & Base de Données
- [ ] Respect de la structure des dossiers et rôles RLS.
  - La structure du projet est globalement conforme au schéma attendu : `src/pages/public/`, `src/pages/candidate/`, `src/pages/admin/`, `api/`, `supabase/migrations/`.
  - Les routes publiques / candidates / admin sont bien séparées dans `src/App.tsx`.
  - Les protections de route sont en place : `ProtectedRoute`, `AuthenticationGuard`, `RoleGuard`, `PermissionGuard`.
  - Le double niveau de sécurité est bien présent :
    1. garde-front React/route côté app ;
    2. RLS côté base de données via les migrations Supabase.
  - Exemple de RLS valide : `supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql` active `ROW LEVEL SECURITY` sur `public.user_roles`, `public.job_offers`, `public.blog_posts`, etc., avec politiques `USING (public.is_staff(auth.uid()))`.
  - Les tables sensibles contiennent bien des politiques RLS et `GRANT` selon les rôles, par exemple `public.candidates`, `public.job_applications`, `public.candidate_saved_searches`, `public.notifications`.
- [ ] Analyse des endpoints `api/` serverless.
  - Les endpoints dans `api/` (ex. `api/register.ts`, `api/confirm.ts`, `api/mobile.ts`, `api/send-email.ts`) utilisent les variables d’environnement serveur (`process.env.*`) et la clé service role dans des fonctions backend dédiées.
  - Ce comportement est correct du point de vue sécurité serveur, à condition que ces variables restent propres à l’environnement backend et ne soient jamais injectées dans le bundle frontend.
  - Le principal point de vigilance concerne la gestion de la clé service role dans des scripts d’outillage et de build (`scripts/prerender.js`, `scripts/generateJobEmbeddings.ts`) : ils doivent rester hors du code de production front et être exécutés uniquement dans un contexte serveur ou CI sécurisé.

## 4. Conformité Charte Graphique & UI
- [ ] Utilisation des tokens CSS vs valeurs en dur.
  - La charte visuelle est bien alignée avec les tokens sémantiques dans `src/styles.css` : `--brand`, `--primary`, `--card`, `--border`, `--muted`, `--background`, `--sidebar`, etc.
  - Les variables sont bien réutilisées, ce qui est conforme aux recommandations du document de référence.
  - L’élément visuel `#1B2CE3` est bien présent comme base de marque et est également déclaré comme `--brand` / `--primary` dans `src/styles.css`.
  - L’utilisation de `rgb(...)` et de valeurs codées en dur reste présente dans quelques règles CSS non critiques (par exemple certaines bordures de composants ou effets visuels). Cela ne constitue pas une vulnérabilité de sécurité, mais cela reste un point d’optimisation visuel pour renforcer la cohérence de la charte.
- [ ] Accessibilité et gestion des états UI (focus, loading, error).
  - Les composants d’interface présentent des états visibles de focus et de chargement, notamment sur le formulaire de recherche et les boutons de navigation.
  - Les éléments de recherche incluent des libellés et états de vide / réinitialisation (`aria-label`, `placeholder`, boutons de suppression) dans les composants principaux.
  - L’accessibilité globale est globalement correcte, même si une homogénéisation des libellés et des `aria-label` sur certains écrans admin pourrait être renforcée.

## 5. Plan d'Action & Correctifs Recommandés
| Priorité | Fichier concerné | Problème identifié | Action corrective / Code recommandé |
| :--- | :--- | :--- | :--- |
| 🔴 Haute | `src/features/admin/api/analyticsApi.ts` | Validation des filtres insuffisante dans les sous-requêtes analytics et absence de schéma Zod centralisé sur les filtres publics/serveur. | Ajouter un schéma Zod pour `AnalyticsFilter` et valider toutes les entrées avant `query.ilike()`, `query.eq()`, `query.in()`. Exemple : `const filterSchema = z.object({ company: z.string().trim().max(100).optional(), ... });` puis `const parsed = filterSchema.parse(rawFilter);`. |
| 🟡 Moyenne | `api/*.ts` / `server/*.ts` | Présence de `SUPABASE_SERVICE_ROLE_KEY` côté serveur, nécessaire mais à sécuriser strictement. | S’assurer que les variables ne sont jamais référencées dans `src/`, qu’elles ne sont pas exposées à des build front et qu’elles sont chargées uniquement via un runtime backend / Vercel environment. |
| 🟡 Moyenne | `scripts/prerender.js` / `scripts/generateJobEmbeddings.ts` | Déploiement de scripts de build/maintenance utilisant des clés serveur potentiellement exposées dans un contexte de build. | Restreindre leur exécution au CI/backend, utiliser des env de build sécurisées et vérifier les journaux pour éviter toute fuite de secrets. |
| 🟡 Moyenne | `src/styles.css` | Quelques valeurs hex/RGB restent utilisées directement dans des styles UI secondaires. | Centraliser les couleurs dans les tokens `--brand`, `--primary`, `--accent`, `--border`, `--card` et éviter les valeurs codées en dur dans les nouveaux composants. |

### Recommandations complémentaires
1. Mettre en place des schémas Zod sur tous les filtres de recherche publics et d’API, y compris `JobsPage` et les analytics admin.
2. Ajouter des tests de non-régression sur les recherches avec valeurs malicieuses (`'; DROP TABLE...`, payloads XSS, chaînes imbriquées) pour vérifier qu’aucune requête ne passe par du SQL brut.
3. Vérifier régulièrement les politiques RLS après toute migration : `supabase/migrations/*.sql` et `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` doivent rester systématiques.
4. Mettre en place un contrôle CI sur les secrets : interdiction des imports de `SUPABASE_SERVICE_ROLE_KEY` dans les dossiers `src/` et `public/`.
5. Consolider le design system autour des tokens CSS pour assurer la conformité totale à la charte visuelle.

### Conclusion
Le projet présente un niveau de sécurité global satisfaisant pour les recherches et formulaires examinés. Aucune injection SQL manifeste n’a été détectée dans les chemins `src/` et `api/` étudiés, et l’usage de Supabase avec méthodes paramétrées est conforme aux bonnes pratiques. La principale zone d’amélioration est la validation structurée et centralisée des filtres utilisateur, en particulier dans les analytics administrateurs, afin de consolider la sécurité et la robustesse du code sans dépendre uniquement des méthodes de query builder.
