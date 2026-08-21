# Audit global — Liens, boutons et navigation
# EmploiPlus Group

## 1. Résumé exécutif
Audit statique de `src/` : `Link`, `NavLink`, `Navigate`, `navigate`, `href`, `window.location`, boutons, CTA, menus, sidebars, breadcrumbs, pagination, partage et destinations dynamiques.

Les routes principales correspondent aux destinations internes inspectées. Aucun lien interne cassé n’est confirmé. Deux usages internes de `<a>` au lieu de `Link` sont confirmés : ils fonctionnent mais déclenchent un rechargement complet. Deux CTA externes utilisent un domaine `www` différent de la base canonique : point **À VÉRIFIER**, pas une panne démontrée.

## 2. Liens internes
- Header : `/`, `/services`, `/jobs`, `/blog`, `/about`, `/contact`, `/faq` : routes déclarées.
- Footer : services, jobs, blog et pages légales : routes déclarées.
- Home, FAQ, Services, Hub candidat et Solutions : CTA vers des routes existantes.
- Sidebars candidat/admin, topbars, popup notifications et menus mobiles ciblent des routes déclarées.
- Les pages légales, auth candidat/admin et redirections de guards utilisent des destinations existantes.

**Problèmes confirmés de chemin : 0.**

## 3. Routes dynamiques
| Construction | Preuve dans le code | État |
|---|---|---|
| `/jobs/${job.slug}` | JobCard, JobsPage, admin preview | `slug` correspond à `/jobs/:slug` |
| `/blog/${post.slug}` | BlogPage, HomePage, admin preview | `slug` correspond à `/blog/:slug` |
| `/candidate/jobs/${slug}/apply` | Jobs, Job detail, dashboard | `slug` gardé ou vérifié avant navigation |
| `/candidate/applications/${id}` | route et détail candidature | `id` est l’identifiant de candidature |
| `/services/${slug}` | ServiceDetailPage et UtilityPages | `slug` correspond au service |

Aucun risque démontrable de chaîne `undefined` dans les constructions inspectées. `CreationMotivationRedirect` vérifie le slug et redirige vers documents s’il manque.

## 4. Boutons et actions de navigation
- `AdminSidebar.onSelect` mappe les vues vers `/admin` ou `/admin/${view}`; les vues déclarées ont toutes une route.
- Les boutons candidature naviguent vers l’application candidate ou ouvrent le login selon l’état d’authentification.
- Les boutons de retour utilisant `navigate(-1)` fonctionnent selon l’historique; ouverture directe sans historique utile reste **À VÉRIFIER**.
- Pagination Jobs, analytics et dashboard modifie l’état local; elle ne cible pas une route inexistante.
- Les boutons de partage, documents, upload et téléchargement ouvrent des ressources externes ou modifient un état; aucun défaut de navigation confirmé.

## 5. Anomalies confirmées
| Priorité | Fichier | Preuve | Impact |
|---|---|---|---|
| FAIBLE | `src/features/profile/components/sections/CompletionSection.tsx` | Les liens `/candidate/profile?tab=...` sont des `<a href>` internes. | Rechargement complet au lieu d’une transition SPA; destination valide. |
| FAIBLE | `src/pages/public/services/HubEmploiPage.tsx` | Le CTA `/contact?subject=...` est un `<a href>` interne. | Rechargement complet; route et query valides. |

Ces cas ne sont pas des liens cassés et ne justifient pas une correction urgente.

## 6. Header, Footer, candidat et admin
Le Header public, Footer, drawer candidat, CandidateMobileHeader, CandidateTopbar, NotificationsDropdown et AdminSidebar exposent des chemins cohérents avec `App.tsx`. Les alias explicitement maintenus (`saved-jobs/saved-offers`, `account/settings`) ne sont pas classés comme erreurs.

Le lien de complétude utilise des paramètres `tab` correspondant aux onglets du profil. Les liens admin de création et d’édition reviennent vers `/admin/jobs` ou `/admin/blog`, routes existantes.

## 7. URLs externes et navigation navigateur
- `https://www.emploiplus-group.com/jobs` est utilisé dans `HeroSection` et `CandidateDiscoverySection`, avec nouvel onglet.
- `BASE_URL` vaut `https://emploiplus-group.com` sans `www`.
- **À VÉRIFIER** : DNS, certificat et redirection du domaine `www`; le code seul ne permet pas de confirmer une casse.
- WhatsApp, Facebook, LinkedIn, téléphone, mailto, documents et URLs de partage sont externes et intentionnels.
- `/api/confirm?token=...` est assigné par `CandidateConfirmPage`; l’endpoint API existe et le token est encodé.

## 8. Redirections, breadcrumbs et fallback
- Guards : `/candidate/login` et `/auth`, valides.
- `/candidate` : redirection vers `/candidate/dashboard`, valide.
- Anciennes routes candidat : redirections vers documents ou onglets profil, valides.
- Fallback `*` : `NotFoundPage`; aucune seconde route catch-all observée.
- Breadcrumbs inspectés : Home, Blog, Jobs et pages publiques utilisent des URLs cohérentes.

## 9. Éléments À VÉRIFIER
- Boutons `navigate(-1)` sur détail candidature, édition profil, candidature et pages légales ouverts directement.
- Résolution réelle de `www.emploiplus-group.com/jobs` en production.
- Slugs réels contenant accents, espaces encodés, chaînes vides ou valeurs très longues.
- Confirmation email avec token absent, expiré et valide.

## 10. Corrections recommandées
- **FAIBLE** : remplacer les deux `<a>` internes identifiés par `Link` si la navigation SPA est attendue.
- **FAIBLE** : centraliser ou vérifier le domaine externe `www`.
- **FAIBLE** : prévoir une destination de secours pour les retours `navigate(-1)` si l’ouverture directe doit être déterministe.

## 11. Verdict final
- Liens internes invalides confirmés : **0**
- Routes dynamiques incohérentes confirmées : **0**
- Boutons de navigation sans comportement démontré : **0**
- Anomalies confirmées : **2**, priorité faible
- Familles d’URLs externes à vérifier : **1**
- Score liens et navigation : **94/100**

**NAVIGATION GLOBALEMENT SAINE AVEC CORRECTIONS MINEURES**
