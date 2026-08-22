# Analyse de la disposition

## 1. Structure actuelle

La page est portée principalement par `src/pages/public/JobsPage.tsx`.

- La barre de recherche sticky contient la recherche textuelle, le bouton Rechercher et l'ouverture des filtres.
- Pour un candidat connecté, une barre secondaire ajoute « Utiliser mes préférences » et « Offres proches de moi ».
- Les filtres dépliés contiennent Type de contrat, Localisation, Entreprise, Domaine, Salaire minimum, Trier par, Réinitialiser et Rechercher.
- Les offres sont affichées sous les contrôles, avec pagination côté client.
- Pour un candidat connecté, les recommandations sont ouvertes dans un `Sheet` séparé.
- Les recherches sauvegardées et récentes sont deux panneaux placés sous les recommandations et avant la liste des offres.
- « Ma prochaine action » et « Compléter votre profil » appartiennent au tableau de bord candidat (`CandidateDashboardPage.tsx`), pas à la page publique `/jobs`.

## 2. Rôle de chaque élément

- **Utiliser mes préférences** : construit une recherche à partir du profil et des préférences chargées, notamment headline, ville, premier type de contrat et salaire minimum.
- **Offres proches de moi** : renseigne la ville du profil, active `nearbyOnly`, puis filtre localement les offres.
- **Type de contrat** : filtre Supabase via `contract_type` après validation de la recherche.
- **Localisation** : filtre Supabase sur ville ou pays, puis le tableau est également filtré localement.
- **Entreprise** : filtre Supabase avec `ilike`.
- **Domaine** : filtre local sur les tags des offres déjà chargées.
- **Salaire minimum** : filtre local en analysant le texte `salary`.
- **Trier par** : tri local par date, pertinence, salaire croissant ou décroissant.
- **Réinitialiser** : efface les champs, les critères appliqués, l'interprétation naturelle et le mode proximité.
- **Rechercher** : applique les champs, interprète éventuellement le langage naturel et enregistre l'historique si l'utilisateur est candidat.
- **Recherches sauvegardées** : liste Supabase des recherches propres au candidat.
- **Sauvegarder** : demande un nom via `window.prompt`, puis insère les critères courants dans Supabase.
- **Recherches récentes** : liste Supabase des recherches enregistrées, limitée aux dix plus récentes.
- **Ma prochaine action** : carte du dashboard qui choisit une action prioritaire selon CV, complétude et préférences.
- **Compléter votre profil** : libellé de la section de complétude du dashboard et lien affiché dans certains états de recommandation.
- **Continuer** : lien du dashboard vers l'action calculée, par exemple `/candidate/profile?tab=documents` ou `/candidate/profile`.

## 3. Relations entre les éléments

`JobsPage` charge les offres publiées avec `useJobs(appliedFilters)`. La recherche serveur couvre texte, entreprise, localisation et type de contrat. Domaine et salaire sont ensuite appliqués côté client, comme le mode proximité.

`useCandidate()` fournit le profil candidat depuis Supabase et son cache partagé. `useCandidatePreferences(profile.id)` charge `candidate_preferences` depuis Supabase. Ces données ne sont utilisées que si l'utilisateur possède le rôle candidat et un profil chargé.

« Utiliser mes préférences » ne reprend pas tous les champs : il ignore `work_types`, `mobility_radius_km`, `mobility_modes`, `salary_max`, `seniority_level`, disponibilité et alertes. Il prend seulement le headline, la ville, le premier contrat et `salary_min`.

Les recommandations utilisent le CV (`cv_text` ou `embedding_vector`) et le matching IA ; elles ne sont pas le même mécanisme que la recherche filtrée. Une absence de CV masque les recommandations personnalisées et affiche une invitation à compléter le profil.

## 4. Parcours utilisateur actuel

- **Non connecté** : accès aux offres publiques, recherche et filtres publics. Les actions candidat, préférences, proximité, recherches sauvegardées et historique ne sont pas affichées. La candidature déclenche une demande de connexion.
- **Connecté sans profil candidat** : le shell candidat n'est pas pleinement activé ; les contrôles candidat ne sont donc pas fiables tant que `profile` n'est pas chargé.
- **Connecté avec profil et préférences** : les préférences sont lues depuis Supabase et le candidat peut les appliquer à la recherche. Les sauvegardes et l'historique sont persistants.
- **Préférences présentes mais aucune offre** : la recherche produit un état vide et propose de réinitialiser les filtres ; aucun parcours spécifique ne suggère d'assouplir les critères.
- **Profil incomplet** : le dashboard calcule `missingItems` via `useProfileCompletion`, affiche « Compléter votre profil » et propose `Continuer` vers le premier élément manquant. Cette carte n'est pas intégrée visuellement à la recherche `/jobs`.
- **CV ancien** : le dashboard donne priorité à « Mettre à jour votre CV » avant la complétude, selon `cv_last_updated_at` et un seuil de 180 jours.

## 5. Données et Supabase

- Les offres viennent de `job_offers` via `jobService.searchOffers` ou `getPublishedOffers`.
- Les préférences viennent de `candidate_preferences` via `preferencesApi.ts` et non d'un état local persistant.
- Les recherches sauvegardées viennent de `candidate_saved_searches`.
- L'historique vient de `candidate_search_history`.
- Les deux tables de recherche sont protégées par RLS et liées à `candidates.user_id = auth.uid()`.
- Les dix dernières recherches sont déterminées par `ORDER BY searched_at DESC LIMIT 10`.
- Une recherche est restaurée en appliquant ses critères aux champs et à `appliedFilters`.
- Une sauvegarde peut être renommée, activée/désactivée ou supprimée. La modification actuelle du nom ne modifie pas les critères.
- Une ligne d'historique peut être supprimée individuellement ou l'historique entier peut être effacé.
- La persistance après reconnexion est prévue par Supabase, sous réserve que les migrations soient déployées sur le projet distant et que les policies autorisent l'utilisateur.
- L'historique n'est enregistré qu'à la soumission d'une recherche non vide ; restaurer une recherche sauvegardée ne crée pas un nouvel historique.

## 6. Vérification `cv_url` / `cv_last_updated_at`

- `candidates.cv_url` existe dans la migration `20260727_add_cv_url_to_candidates.sql` avec `ADD COLUMN IF NOT EXISTS`.
- `candidates.cv_last_updated_at` existe dans `20260822100000_required_candidate_mobility_and_cv_tracking.sql` avec `ADD COLUMN IF NOT EXISTS`.
- Ces deux champs existent aussi dans `src/integrations/supabase/types.ts`, `CandidateProfile`, les API CV et le dashboard.
- `cv_url` sert à restaurer le fichier et `cv_last_updated_at` sert à détecter un CV ancien.
- Le code d'upload persiste la date et déclenche le rafraîchissement du profil partagé.
- Cette analyse ne peut pas confirmer l'état de la base Supabase distante, l'application effective des migrations ni le schéma PostgREST courant. Les migrations locales et les types ne prouvent donc pas à eux seuls que les colonnes sont déployées à distance.

## 7. Incohérences détectées

- « Proches de moi » ne calcule aucune distance géographique : même ville ou même pays suffit. Le rayon est seulement testé comme valeur positive.
- `mobility_radius_km` n'est pas utilisé comme distance et `mobility_modes` n'est utilisé que pour reconnaître le télétravail sur une offre sans localisation.
- Sans préférence de mobilité, le rayon de secours vaut 50 km ; la proximité par ville/pays peut donc fonctionner malgré l'absence de préférence.
- Sans ville dans le profil, le bouton proximité ne lance aucune recherche et affiche seulement une indication dans la barre.
- La ville affichée vient de `candidates.location_city`, pas de la géolocalisation du navigateur ni d'une distance calculée.
- « Utiliser mes préférences » ignore plusieurs préférences pourtant stockées en base.
- Domaine et salaire minimum ne sont pas des filtres Supabase et ne portent que sur le lot d'offres chargé ; le service limite aussi les requêtes à 50 malgré `limit: 100` côté page.
- La pertinence dépend des recommandations CV et peut être nulle sans CV ; elle ne constitue pas un moteur de recherche indépendant.
- Les critères sauvegardés sont JSONB et acceptent donc des champs que le moteur peut ne pas appliquer de façon uniforme.
- La carte « Ma prochaine action » est redondante avec la complétude du profil et le panneau de recommandations, mais elle reste hors du contexte visuel de `/jobs`.
- Les migrations locales existent, mais aucune vérification distante n'a été possible dans cette analyse.

## 8. Points à améliorer pour la future UX

- Conserver une séparation claire entre recherche générale, préférences et recommandations.
- Regrouper les actions liées au profil candidat autour d'un même contexte plutôt que de les disperser entre `/jobs` et le dashboard.
- Rendre visible la différence entre filtre de ville, proximité réelle et télétravail.
- Donner une réponse plus explicite quand les préférences n'existent pas, sont partielles ou ne donnent aucun résultat.
- Harmoniser les critères appliqués, sauvegardés, restaurés et réellement exécutés.
- Clarifier le statut de l'historique : soumission effective uniquement, et non simple consultation ou restauration.
- Prévoir un état de confiance pour la date du CV et la complétude lorsque les données Supabase sont absentes ou non synchronisées.

## 9. Conclusion

La page de recherche combine correctement une base publique d'offres avec des services candidat persistants dans Supabase. Toutefois, le lien recherche-profil est partiel : les préférences ne sont pas toutes utilisées, la proximité est une comparaison de libellés et non une distance, et plusieurs filtres sont locaux. « Ma prochaine action » est pilotée par le dashboard et non par la recherche. Toute future refonte UI/UX devra préserver ces responsabilités tout en rendant leurs limites et leurs dépendances visibles.
