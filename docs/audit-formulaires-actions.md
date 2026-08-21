# Audit global — Formulaires et actions utilisateur

## 1. Résumé exécutif
L’audit statique couvre les formulaires publics, auth, candidat et admin, ainsi que validations, soumissions, uploads, suppressions, loading, erreurs, succès et actions de navigation. La couverture technique est globalement structurée, mais trois anomalies sont démontrables.

## 2. Méthodologie
Lecture des handlers `onSubmit`, `onClick`, `onChange`, schémas Zod, appels Supabase/API, contrôles fichiers, `try/catch`, flags `loading/saving/submitting` et feedback UI. Aucun test de saisie ou d’appareil réel n’a été réalisé.

## 3. Problèmes confirmés

| Priorité | Fichier/composant | Action | Problème | Preuve | Impact |
|---|---|---|---|---|---|
| ÉLEVÉE | `src/pages/public/ContactPage.tsx` | Envoi contact | Le submit ne fait aucun appel API/email : il fait seulement `console.log`, vide le formulaire et affiche « envoyé avec succès ». | `handleSubmit` contient `console.log`, `setSubmitted(true)` et aucun `fetch`/Supabase. | Le message utilisateur est trompeur; aucune demande n’est transmise. |
| ÉLEVÉE | `src/pages/public/AuthPage.tsx` | Login admin | Le verrou `isSubmittingRef` est activé avant les validations; les `return` sur email/mot de passe invalide précèdent le `finally` qui le remet à `false`. | `isSubmittingRef.current = true` puis retours lignes de validation; reset uniquement dans `finally`. | Après une saisie invalide, les tentatives suivantes peuvent rester bloquées. |
| MOYENNE | `src/pages/admin/AdminJobCreatePage.tsx` | Création offre | Le select permet `draft/published/archived`, mais le submit force `nextStatus = "published"` et ignore `form.status`. | Payload `status: nextStatus`; le champ `form.status` n’est pas utilisé. | Une offre choisie comme brouillon/archivée est publiée. |

## 4. Problèmes probables / À vérifier

| Priorité | Fichier/composant | Action | Risque | Pourquoi |
|---|---|---|---|---|
| FAIBLE | `CandidateApplicationDetailPage`, `CandidateProfileEditPage`, `CandidateJobApplyPage` | Retour | `navigate(-1)` dépend d’un historique utile et peut ne pas fournir une destination métier si la page est ouverte directement. | Le code ne prévoit pas de fallback local dans ces composants. |
| FAIBLE | `CandidateJobApplyPage` | Envoi candidature | Si l’envoi email échoue, l’application est enregistrée puis l’UI navigue vers les candidatures avec un message de réussite partielle. | Ce comportement peut être intentionnel; il faut vérifier le wording attendu. |
| À TESTER | Auth/API | Login, signup, reset, confirmation | Réponses réseau, tokens expirés et sessions restaurées nécessitent un environnement réel. | Le code gère plusieurs branches mais pas leur exécution externe ici. |

## 5. Formulaires validés
- Login candidat, signup, forgot password et reset password utilisent React Hook Form + Zod; email, champs requis, mot de passe, confirmation et acceptation des conditions sont contrôlés.
- Login admin possède validation email/mot de passe et feedback d’erreur, malgré le verrou bloquant décrit ci-dessus.
- Contact utilise `required` et `type="email"` sur ses champs et relie correctement `onSubmit` au `<form>`.
- Expérience, formation et langues utilisent des schémas Zod; compétences et préférences gèrent leurs actions via handlers dédiés.
- Candidature vérifie destinataire, document, consentement, session, profil et offre avant envoi.

## 6. Loading / erreurs / succès
- Les auth, créations admin, uploads CV/documents et éditions candidat disposent généralement de flags `loading`, `saving`, `submitting` ou `isUploading` avec `finally`.
- Les erreurs sont le plus souvent affichées via message local, alerte ou toast; les pages admin gèrent les réponses Supabase.
- Le Contact est l’exception majeure : succès local sans opération distante.
- Les doubles soumissions sont explicitement protégées dans login candidat/admin; le verrou admin présente toutefois le défaut de réinitialisation précoce décrit plus haut.

## 7. Upload / sauvegarde / suppression
- CV et documents complémentaires contrôlent le MIME PDF et la limite de 2 Mo avant upload; les états d’upload sont restaurés dans `finally`.
- Les documents ajoutés sont réinjectés dans l’état local; les erreurs d’upload sont affichées.
- Expérience, formation, langues et compétences mettent à jour leurs listes après création/modification/suppression via hooks.
- Les suppressions d’offres sauvegardées et candidatures demandent une confirmation ou un contrôle utilisateur et rafraîchissent l’état; vérification runtime recommandée.
- Les formulaires admin job/blog/guides/notifications ont des feedbacks d’erreur et des flags d’opération.

## 8. Authentification / candidat / admin
- Auth candidat redirige après résolution des rôles; signup redirige vers login après réponse API positive.
- Reset et confirmation gèrent token absent/invalide avec message; la confirmation assigne l’endpoint API avec token encodé.
- Les routes admin sont protégées par rôle/permission; les formulaires admin restent soumis à ces guards.
- Les paramètres candidat d’apparence utilisent localStorage; ce n’est pas une sauvegarde métier distante.

## 9. Statistiques
- Formulaires inspectés : **environ 25** zones publiques, auth, candidat et admin.
- Actions inspectées : **plus de 60** handlers de soumission, sauvegarde, suppression, upload, filtres et navigation.
- Validations inspectées : **environ 20** schémas/contrôles requis, email, consentement et fichiers.
- Uploads inspectés : **CV, documents candidat, images blog/offres, guides**.
- Suppressions inspectées : **candidatures, offres sauvegardées, documents et entités admin**.
- Problèmes confirmés : **3**.
- Problèmes probables : **2**.
- Éléments à tester : **4 familles**.

## 10. Priorités de correction
1. **ÉLEVÉE** : connecter réellement le formulaire Contact à son mécanisme d’envoi, ou ne plus afficher de succès d’envoi.
2. **ÉLEVÉE** : garantir la remise à zéro du verrou du login admin lors d’un échec de validation locale.
3. **MOYENNE** : utiliser le statut sélectionné lors de la création d’une offre admin.

## 11. Verdict final
- Problèmes critiques : **0**.
- Problèmes élevés : **2**.
- Problèmes moyens : **1**.
- Problèmes faibles/probables : **2**.
- Éléments **À TESTER** : réseau auth, tokens, retours directs et candidature avec échec d’email.

**Score formulaires et actions : 76/100**

Le site possède une base de formulaires solide, mais le faux succès du Contact, le verrou du login admin et le statut d’offre ignoré nécessitent des corrections avant de considérer le fonctionnement comme fiable.
