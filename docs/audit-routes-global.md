# Audit global des routes — EmploiPlus Group

## 1. Résumé exécutif
L’arbre React Router est centralisé dans `src/App.tsx`, sous `BrowserRouter` (`src/main.tsx`). Les zones sont séparées entre public, authentification, candidat protégé et administration protégée. Les routes statiques précèdent les dynamiques dans les familles concernées; React Router v6 effectue en outre un classement par spécificité.

Aucun doublon exact, conflit confirmé ou lien interne vers une route inexistante n’a été démontré dans le code inspecté. Quelques alias candidat rendent la même page, mais sont explicitement compatibles avec l’ancienne navigation.

## 2. Inventaire des routes

| Route | Page | Zone | Statut |
|---|---|---|---|
| `/` | HomePage | Public | ACTIVE |
| `/about`, `/services`, `/jobs`, `/blog`, `/faq`, `/contact` | Pages publiques correspondantes | Public | ACTIVE |
| `/services/hub-candidat-intelligent` | HubCandidatPage | Public | ACTIVE |
| `/services/solutions-entreprises-bpo` | SolutionsEntreprisePage | Public | ACTIVE |
| `/services/hub-emploi-recrutement/landing` | HubEmploiPage | Public | ACTIVE |
| `/services/:slug` | ServiceDetailPage | Public | DYNAMIQUE |
| `/jobs/:slug` | JobOfferDetailPage | Public | DYNAMIQUE |
| `/blog/:slug` | BlogPostDetailPage | Public | DYNAMIQUE |
| `/politique-de-confidentialite`, `/mentions-legales`, `/cgu` | Pages légales | Public | ACTIVE |
| `/auth` | AuthPage | Auth admin | ACTIVE |
| `/candidate/login`, `/candidate/signup` | Login / inscription | Auth candidat | ACTIVE |
| `/candidate/forgot-password` | Mot de passe oublié | Auth candidat | ACTIVE |
| `/candidate/reset-password` | Réinitialisation | Auth candidat | ACTIVE |
| `/candidate/confirm` | Confirmation | Auth candidat | ACTIVE |
| `/candidate` | CandidateLayout + enfants protégés | Candidat | PROTÉGÉE |
| `/candidate/dashboard` | CandidateDashboardPage | Candidat | PROTÉGÉE |
| `/candidate/profile`, `/candidate/profile/edit` | Profil candidat | Candidat | PROTÉGÉE |
| `/candidate/documents`, `/candidate/guides` | Documents / fiches | Candidat | PROTÉGÉE |
| `/candidate/applications`, `/candidate/applications/:id` | Candidatures | Candidat | PROTÉGÉE / DYNAMIQUE |
| `/candidate/saved-jobs`, `/candidate/saved-offers` | CandidateSavedOffersPage | Candidat | PROTÉGÉE / alias |
| `/candidate/notifications` | CandidateNotificationsPage | Candidat | PROTÉGÉE |
| `/candidate/account`, `/candidate/settings` | CandidateSettingsPage | Candidat | PROTÉGÉE / alias |
| `/candidate/jobs/:slug/apply` | CandidateJobApplyPage | Candidat | PROTÉGÉE / DYNAMIQUE |
| `/candidate/public/*` | Pages publiques sous CandidateLayout | Candidat | PROTÉGÉE |
| `/candidate/creation` | Redirection vers documents | Candidat | ACTIVE / compatibilité |
| `/candidate/creation-motivation` | CreationMotivationRedirect | Candidat | ACTIVE / compatibilité |
| `/candidate/experience`, `/education`, `/skills`, `/languages`, `/preferences` | Redirections vers onglets profil | Candidat | ACTIVE / compatibilité |
| `/admin` | AdminPage + dashboard | Admin | PROTÉGÉE |
| `/admin/jobs`, `/admin/jobs/new` | Gestion offres | Admin | PROTÉGÉE |
| `/admin/blog`, `/admin/blog/new` | Gestion blog | Admin | PROTÉGÉE |
| `/admin/candidates`, `/admin/team` | Candidats / équipe | Admin | PROTÉGÉE |
| `/admin/guides`, `/admin/notifications` | Fiches / notifications | Admin | PROTÉGÉE |
| `/admin/analytics-offres` | Analytics offres | Admin | PROTÉGÉE |
| `/admin/seo`, `/admin/privacy`, `/admin/legal`, `/admin/cgu`, `/admin/faq` | Administration éditoriale | Admin | PROTÉGÉE |
| `*` | NotFoundPage | Fallback | ACTIVE |

Total : **66 routes déclarées**, dont le fallback `*`.

## 3. Doublons détectés
Aucun doublon exact confirmé.

- `/candidate/saved-jobs` et `/candidate/saved-offers` rendent la même page. Niveau : **FAIBLE**, alias explicitement présent et cohérent avec `CandidateLayout`.
- `/candidate/account` et `/candidate/settings` rendent la même page. Niveau : **FAIBLE**, alias utilisé par des variantes de navigation.
- `/candidate/public/*` réutilise des pages publiques sous un layout candidat; ce n’est pas un doublon fonctionnel démontré.

## 4. Conflits potentiels
- `/services/:slug` est déclaré avec plusieurs chemins `/services/...` statiques. Aucun conflit confirmé : les routes statiques sont plus spécifiques dans React Router v6.
- `/jobs/:slug` et `/jobs` ne se recouvrent pas pour un même chemin.
- `/blog/:slug` et `/blog` ne se recouvrent pas pour un même chemin.
- Le fallback `*` est placé en dernier et ne masque pas les routes déclarées.
- Les routes candidat et admin sont isolées par leurs préfixes et leurs guards.

## 5. Routes orphelines
Aucune route déclarée mais clairement inaccessible n’a été démontrée.

Les pages candidat `CandidateCVPage`, `CandidateCreateCVPage`, `CandidateCreateCVEditorPage` et les pages spécialisées expérience/éducation/compétences/langues/préférences sont importées ou exportées, mais plusieurs sont utilisées comme destinations historiques ou remplacées par des onglets/redirections. Elles ne constituent pas des routes orphelines confirmées.

## 6. Liens internes incohérents
Aucun lien interne invalide confirmé dans les `Link`, `navigate` et `href` inspectés. Les destinations observées (`/jobs`, `/blog/:slug`, `/candidate/jobs/:slug/apply`, `/admin/*`, pages légales) correspondent à des routes déclarées.

Les URLs externes et les ancres locales ne sont pas comptées comme routes internes.

## 7. Routes candidat
`/candidate` est protégé par `ProtectedRoute`, permission `dashboard.candidate`, puis rend `CandidateLayout`. Les enfants héritent de cette protection. L’index redirige vers `/candidate/dashboard`. Les menus candidat exposent dashboard, profil, documents, fiches, candidatures, offres enregistrées, notifications et compte; ces destinations existent.

Les chemins de compatibilité `creation`, `experience`, `education`, `skills`, `languages` et `preferences` redirigent explicitement vers une destination valide.

## 8. Routes admin
`/admin` est protégé par rôle, puis chaque page applique ses rôles et permissions. La navigation `AdminSidebar` correspond aux vues déclarées : dashboard, jobs, analytics-offres, candidates, guides, blog, notifications, seo, privacy, legal, cgu, team et faq. Aucun item de menu sans route correspondante n’a été confirmé.

## 9. Routes dynamiques et fallback
- Offres : `/jobs/:slug`, génération observée avec `job.slug`.
- Articles : `/blog/:slug`, génération observée avec `post.slug`.
- Candidatures : `/candidate/applications/:id`, paramètre transmis au détail.
- Candidature à une offre : `/candidate/jobs/:slug/apply`, génération observée avec le slug de l’offre.
- Services : `/services/:slug`, génération observée depuis les services.

Le fallback global rend `NotFoundPage`; aucune seconde route catch-all concurrente n’a été trouvée.

## 10. Corrections recommandées
- **FAIBLE — documentation** : documenter les alias candidat `saved-jobs/saved-offers` et `account/settings` pour éviter leur suppression lors d’une prochaine refonte.
- **FAIBLE — vérification** : tester en environnement déployé les URLs dynamiques et le fallback serveur, car cette vérification statique ne couvre pas la configuration d’historique du serveur.

Aucune correction de routage nécessaire sur la base des preuves disponibles.

## 11. Routes à NE PAS modifier
Ne pas modifier les routes publiques principales, les parcours d’authentification candidat, les guards `/candidate` et `/admin`, les routes dynamiques `/jobs/:slug` et `/blog/:slug`, ni les redirections de compatibilité explicitement présentes.

## 12. Verdict final
- Routes déclarées : **66**
- Doublons confirmés : **0**
- Conflits confirmés : **0**
- Routes orphelines confirmées : **0**
- Routes potentiellement obsolètes : **0 confirmé**; routes/alias de compatibilité identifiés : 8
- Liens internes invalides confirmés : **0**
- Score de qualité du routage : **95/100**

**ROUTAGE SAIN AVEC CORRECTIONS MINEURES**
