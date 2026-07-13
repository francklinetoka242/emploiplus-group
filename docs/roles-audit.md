# Audit technique du système de rôles actuel

Ce document est limité aux éléments réellement présents dans le projet et dans les migrations Supabase visibles dans le dépôt. Il ne décrit ni des rôles hypothétiques ni des mécanismes non implémentés.

## 1. Architecture actuelle des rôles

### 1.1 Où les rôles sont définis

Les rôles sont définis à deux niveaux :

- côté frontend, dans le fichier src/features/authentication/permissions/roles.ts ;
- côté base de données, dans l’enum SQL public.app_role défini par la migration Supabase.

Le fichier frontend déclare :

- super_admin
- admin
- editor
- candidate
- rh
- company
- manager
- accountant
- recruiter

En revanche, le type de base de données utilisé par Supabase n’autorise que trois valeurs.

### 1.2 Tables Supabase utilisées pour les rôles

La table utilisée est :

- public.user_roles

Elle contient au minimum les colonnes suivantes dans la migration visible :

- id
- user_id
- role
- created_at

Une migration complémentaire ajoute ensuite :

- email
- full_name
- specialty
- is_active

### 1.3 Migrations qui créent ou étendent les rôles

Migration principale :

- supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql

Cette migration crée :

- l’enum public.app_role avec les valeurs super_admin, admin, editor ;
- la table public.user_roles ;
- les fonctions SQL public.has_role(_user_id, _role) et public.is_staff(_user_id) ;
- les policies RLS sur public.user_roles.

Migration d’extension :

- supabase/migrations/20260629140000_extend_admin_members_management.sql

Cette migration ajoute des colonnes à public.user_roles :

- email
- full_name
- specialty
- is_active

Elle ajoute aussi la fonction public.is_admin_active(_user_id).

### 1.4 Enums existants

L’enum réellement présent dans la base est :

- public.app_role = ('super_admin', 'admin', 'editor')

Il n’existe pas, dans le dépôt, d’autre enum de rôles utilisé pour public.user_roles.

### 1.5 Fonctions SQL existantes

Fonctions réellement présentes :

- public.has_role(_user_id UUID, _role app_role) -> BOOLEAN
- public.is_staff(_user_id UUID) -> BOOLEAN
- public.is_admin_active(_user_id UUID) -> BOOLEAN

### 1.6 Résumé architectural

Le système observé est donc un système de rôles stockés dans une table Supabase, avec une validation de type par enum SQL et une logique d’interface React qui lit ces rôles côté client.

---

## 2. Liste des rôles présents

### 2.1 Rôles réellement définis dans la base

La base, telle qu’elle est définie dans les migrations visibles, autorise uniquement ces trois rôles :

- super_admin
- admin
- editor

### 2.2 Rôles présents dans le dépôt mais non présents dans la base

Le frontend déclare aussi ces rôles :

- candidate
- rh
- company
- manager
- accountant
- recruiter

Ils ne sont pas des valeurs de l’enum public.app_role et ne sont donc pas des rôles de base de données valides dans la structure actuellement visible.

### 2.3 Rôles réellement créés dans la base

Le dépôt ne contient aucune migration ni seed qui insère des lignes dans public.user_roles pour créer des rôles d’utilisateur. La seule définition observable est donc l’enum et la structure de table.

En pratique, il n’existe pas, dans le code du dépôt, d’insertion initiale de rôles dans la base.

---

## 3. Comparaison Frontend / Base

| Zone | Contenu observé | Observations |
|---|---|---|
| Frontend | src/features/authentication/permissions/roles.ts | Déclare 9 rôles, dont 3 sont compatibles avec la base et 6 ne le sont pas. |
| Base Supabase | public.app_role enum | N’autorise que 3 valeurs : super_admin, admin, editor. |
| Frontend | src/features/authentication/hooks/useRoles.ts | Filtre les rôles récupérés dans user_roles pour ne conserver que super_admin, admin, editor. |
| Base | public.user_roles | Table utilisée pour stocker les rôles attribués aux utilisateurs. |

### 3.1 Rôles présents dans le front mais absents de la base

- candidate
- rh
- company
- manager
- accountant
- recruiter

### 3.2 Rôles présents dans la base mais absents du front

Aucun. Les trois valeurs de la base sont bien présentes côté frontend.

### 3.3 Incohérences observées

L’incohérence majeure est la suivante :

- le frontend expose des rôles supplémentaires qui ne sont pas des valeurs valides de l’enum SQL ;
- la logique de lecture des rôles côté frontend filtre explicitement les entrées de public.user_roles pour ne conserver que les trois valeurs de la base.

Autrement dit, le frontend contient un registre de rôles plus large que le modèle de base réellement exploitable.

---

## 4. Attribution des rôles

### 4.1 Comment un utilisateur reçoit un rôle

Le flux observable est le suivant :

1. Un administrateur ou un utilisateur autorisé ouvre la page d’administration des membres dans src/pages/admin/AdminTeamPage.tsx.
2. Cette page crée un utilisateur Supabase avec supabase.auth.signUp(...).
3. Elle insère ensuite une ligne dans public.user_roles avec :
   - user_id
   - role
   - email
   - full_name
   - specialty
   - is_active

### 4.2 Le rôle est-il attribué automatiquement ?

Non, selon le code visible, il n’existe pas d’attribution automatique par trigger, par migration, ni par fonction SQL.

### 4.3 Existe-t-il un trigger ?

Aucun trigger de rôle n’est visible dans les migrations du dépôt.

### 4.4 Existe-t-il une migration qui crée des rôles ?

Non. Les migrations créent la structure du système, mais aucune ne remplit public.user_roles avec des rôles par défaut.

### 4.5 Existe-t-il une interface d’administration ?

Oui. La page src/pages/admin/AdminTeamPage.tsx permet :

- de créer un membre d’équipe ;
- de définir son rôle ;
- de modifier son rôle ;
- de bloquer/débloquer ;
- de supprimer la ligne public.user_roles.

### 4.6 Flux complet observé

- l’utilisateur est créé dans Auth Supabase ;
- une ligne est ajoutée dans public.user_roles ;
- les gardes frontend lisent ensuite cette ligne pour déterminer l’accès.

---

## 5. Lecture des rôles

### 5.1 Analyse de useRoles()

Le hook src/features/authentication/hooks/useRoles.ts exécute la requête suivante :

```ts
await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", session.user.id);
```

### 5.2 Tables interrogées

La requête interroge :

- public.user_roles

### 5.3 Fonctions SQL utilisées

Aucune fonction SQL n’est utilisée par le hook useRoles().

### 5.4 Utilisation de has_role()

Non. Le hook useRoles() n’appelle pas public.has_role().

### 5.5 Utilisation de is_staff()

Non. Le hook useRoles() n’appelle pas public.is_staff().

### 5.6 Interrogation directe de user_roles

Oui. C’est le comportement réel : le hook lit la table public.user_roles directement, puis filtre les valeurs.

### 5.7 Comportement réel du hook

Le hook :

- récupère la session via useAuth();
- lit les rôles de l’utilisateur dans public.user_roles ;
- ne conserve que les valeurs appartenant à la liste ["super_admin", "admin", "editor"] ;
- expose un objet avec :
  - roles
  - loading
  - error
  - hasRole
  - isStaff

### 5.8 Code réellement exécuté

Le filtre effectif est :

```ts
const nextRoles = (data ?? [])
  .map((row) => row.role)
  .filter((role) => Boolean(role) && ["super_admin", "admin", "editor"].includes(role));
```

---

## 6. Vérification des rôles

| Rôle | Réellement utilisé ? | Où ? | Dans quel composant / guard / route ? |
|---|---|---|---|
| super_admin | Oui | src/pages/admin/AdminTeamPage.tsx, src/features/authentication/hooks/useRoles.ts, src/features/authentication/permissions/rolePermissions.ts | Utilisé pour décider qui peut gérer les membres d’équipe ; utilisé dans la logique de filtre des rôles et dans la table de permissions. |
| admin | Oui | src/features/authentication/hooks/useRoles.ts, src/features/authentication/permissions/rolePermissions.ts, src/pages/admin/AdminTeamPage.tsx | Utilisé comme valeur de rôle possible côté interface et comme rôle défini dans la table de permissions. |
| editor | Oui | src/features/authentication/hooks/useRoles.ts, src/features/authentication/permissions/rolePermissions.ts, src/pages/admin/AdminTeamPage.tsx | Utilisé comme valeur de rôle possible côté interface et comme rôle défini dans la table de permissions. |
| candidate | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |
| rh | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |
| company | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |
| manager | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |
| accountant | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |
| recruiter | Non en base | src/features/authentication/permissions/rolePermissions.ts | Présent uniquement dans la logique frontend de permissions, pas dans l’enum SQL. |

### 6.1 Conclusion sur l’usage réel

Les rôles réellement exploitables dans la base sont trois : super_admin, admin, editor.

Les autres rôles sont uniquement des rôles “frontend” ou “de mapping de permissions”, pas des rôles de base de données autorisés par la structure SQL visible.

---

## 7. Vérification des routes

### 7.1 Routes protégées observées

Les routes protégées observées dans le router sont :

- /candidate
- /candidate/*
- /admin
- /admin/*

### 7.2 Rôle réellement exigé

Aucune route ne demande explicitement un rôle via allowedRoles ou requireRole.

### 7.3 Rôle théorique

Le système frontend définit des permissions théoriques pour l’espace admin, par exemple :

- dashboard.admin
- team.manage
- seo.manage
- notifications.manage

Ces permissions sont associées aux rôles dans src/features/authentication/permissions/rolePermissions.ts.

### 7.4 Rôle effectivement vérifié

En pratique, les routes ne vérifient pas un rôle spécifique. Elles vérifient :

- une session via AuthenticationGuard ;
- puis, pour les routes candidat, une permission dashboard.candidate via PermissionGuard ;
- pour les routes admin, aucune vérification de rôle ni de permission spécifique n’est appliquée dans le code actuel.

### 7.5 Tableau synthétique des routes

| Route | Rôle théorique | Rôle réellement exigé | Vérification effective |
|---|---|---|---|
| /candidate | dashboard.candidate | aucun rôle explicite | permission dashboard.candidate |
| /admin | admin/super_admin (théorique) | aucun rôle explicite | uniquement authentification session |

---

## 8. Vérification de ProtectedRoute

### 8.1 ProtectedRoute utilise-t-il réellement RoleGuard ?

Non, pas dans le code actuel.

### 8.2 Comment ProtectedRoute fonctionne réellement

Le composant src/features/authentication/guards/ProtectedRoute.tsx fait ceci :

1. il enveloppe d’abord le contenu dans AuthenticationGuard ;
2. si requireRole et allowedRoles sont présents, il applique RoleGuard ;
3. si requiredPermissions sont présents, il applique PermissionGuard.

### 8.3 Flux réel observé

Dans le code actuel, les routes ne passent ni allowedRoles ni requireRole à ProtectedRoute.

Les routes observées utilisent plutôt :

- requiredPermissions={['dashboard.candidate']} pour les routes candidat ;
- aucun allowedRoles ni requiredPermissions pour /admin.

Par conséquent :

- ProtectedRoute ne passe pas par RoleGuard sur les routes actuelles ;
- il passe par PermissionGuard seulement sur les routes candidat ;
- il passe par AuthenticationGuard pour toutes les routes.

### 8.4 Conclusion sur ProtectedRoute

Le flux réel est donc :

- AuthenticationGuard -> PermissionGuard (si permission demandée) -> rendu

et non :

- AuthenticationGuard -> RoleGuard -> PermissionGuard

sur les routes actuellement utilisées.

---

## 9. Vérification des administrateurs

### 9.1 Comment un utilisateur devient administrateur aujourd’hui

Le code visible montre qu’un utilisateur devient “administrateur” par l’ajout d’une ligne dans public.user_roles depuis la page AdminTeamPage.

La page :

- crée un utilisateur Supabase ;
- insère une ligne dans public.user_roles ;
- choisit un rôle parmi super_admin, admin, editor.

### 9.2 Comment il est reconnu

Le frontend reconnaît l’utilisateur administrateur via :

- la lecture de public.user_roles dans useRoles() ;
- la lecture de la liste des rôles de l’utilisateur ;
- la logique de permissions dans usePermissions().

### 9.3 Quelle vérification est réellement effectuée

Pour l’accès aux routes admin, la vérification réelle est :

- la présence d’une session Supabase,
- puis éventuellement une permission dashboard.candidate pour les routes candidat,
- mais pas un contrôle explicite de rôle sur /admin.

### 9.4 Le simple fait d’avoir une session Supabase suffit-il ?

Oui, pour les routes admin actuellement visibles dans App.tsx, la réponse est oui :

- ProtectedRoute applique AuthenticationGuard ;
- AuthenticationGuard vérifie seulement la présence d’une session ;
- aucune vérification de rôle n’est demandée sur /admin.

### 9.5 Est-ce qu’un rôle est réellement contrôlé ?

Le rôle est contrôlé dans les pages et hooks liés à l’administration, mais pas comme garde de route pour /admin.

Exemple concret :

- la page AdminTeamPage vérifie si l’utilisateur courant possède super_admin avant d’autoriser la gestion des membres ;
- la route /admin elle-même ne contient pas cette vérification.

---

## 10. Dette technique

### 10.1 Rôles inutilisés

- editor est défini et peut être assigné, mais il n’est pas utilisé comme garde de route dans le dépôt visible.

### 10.2 Rôles fictifs

- candidate
- rh
- company
- manager
- accountant
- recruiter

Ces rôles sont déclarés côté frontend, mais ils ne sont pas des valeurs valides de l’enum SQL public.app_role.

### 10.3 Rôles non synchronisés

- le frontend et la base ne partagent pas le même registre de rôles ;
- la base autorise seulement super_admin, admin, editor ;
- le frontend connaît aussi des rôles supplémentaires qui ne peuvent pas être stockés dans la structure SQL actuelle.

### 10.4 Rôles non attribuables

- candidate, rh, company, manager, accountant, recruiter ne sont pas des valeurs acceptées par public.app_role dans la migration visible.

### 10.5 Rôles jamais vérifiés

- Les rôles frontend supplémentaires ne sont jamais vérifiés comme rôles de base de données dans les routes actuelles.
- Les rôles admin/editor/super_admin ne sont pas utilisés comme garde explicite sur les routes /admin.

---

## 11. Conclusion

Le système de rôles actuel est partiellement fonctionnel, mais il est encore surtout préparé que complètement exploité.

### Ce qui est réellement fonctionnel

- la table public.user_roles existe ;
- l’enum public.app_role existe ;
- la lecture des rôles depuis la base existe ;
- l’interface d’administration permet d’assigner des rôles ;
- les permissions frontend sont définies.

### Ce qui n’est pas réellement fonctionnel comme contrôle d’accès strict

- aucun rôle n’est exigé sur les routes /admin dans le code visible ;
- ProtectedRoute ne passe pas réellement par RoleGuard sur les routes actuelles ;
- les rôles frontend supplémentaires ne sont pas des rôles réels de la base ;
- il n’existe pas de mécanisme automatique d’attribution ni de trigger de rôle.

### Conclusion finale

Le système de rôles est actuellement :

- partiellement fonctionnel pour la lecture et la gestion de rôles via l’interface ;
- seulement partiellement exploité pour le contrôle d’accès réel ;
- encore davantage “préparé” que “complètement fonctionnel”.
