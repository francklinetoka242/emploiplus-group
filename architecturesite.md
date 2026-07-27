# ==============================================================================
# EMPLOIPLUS GROUP - COMPREHENSION ET ARCHITECTURE GLOBALE DU SITE
# ==============================================================================

# 1. PAGING ET ROUTAGE
# Liste toutes les routes/pages publiques et privées identifiées
ROUTES_PUBLIQUES="/, /about, /services, /services/:slug, /services/hub-emploi-recrutement/landing, /jobs, /jobs/:slug, /blog, /blog/:slug, /faq, /contact, /politique-de-confidentialite, /mentions-legales, /cgu"
ROUTES_CANDIDAT="/candidate/login, /candidate/signup, /candidate/forgot-password, /candidate/reset-password, /candidate/confirm, /candidate/dashboard, /candidate/public/* (redir vers public), /candidate/profile, /candidate/profile/edit, /candidate/documents, /candidate/guides, /candidate/applications, /candidate/applications/:id, /candidate/saved-offers, /candidate/notifications, /candidate/settings, /candidate/jobs/:slug/apply"
ROUTES_ADMIN="/admin, /admin/jobs, /admin/jobs/new, /admin/blog, /admin/blog/new, /admin/candidates, /admin/guides, /admin/notifications, /admin/seo, /admin/privacy, /admin/legal, /admin/cgu, /admin/team, /admin/faq"

# 2. ESPACE CANDIDAT ET TRAITEMENT DU CV
# Bucket Supabase utilisé pour stocker les CV/documents candidats (valeur par défaut si non configurée)
CV_UPLOAD_STORAGE_BUCKET="VITE_SUPABASE_CANDIDATE_BUCKET || VITE_SUPABASE_STORAGE_BUCKET || public"
# Stratégie actuelle d'extraction/stockage du contenu des CVs :
# - Les CVs sont uploadés en PDF dans Supabase Storage (cf. `uploadFileToStorage` dans src/services/storageService.ts)
# - Aucune extraction de texte côté serveur trouvée dans le code : pas de parsing PDF/OCR centralisé détecté
# - Le front-end met en cache métadonnées/URL dans localStorage via `useCandidateDocuments`
CV_PARSING_STRATEGY="PDFs stockés tels quels en Supabase Storage; pas d'extraction/parse serveur centralisé; métadonnées en localStorage (useCandidateDocuments)"
# Table SQL principale contenant les profils candidats
CANDIDATE_PROFILE_TABLE="candidates"

# 3. GESTION DES OFFRES D'EMPLOI
# Table Supabase stockant les offres d'emploi
JOBS_TABLE="job_offers"
# Table Supabase stockant les candidatures déposées par les candidats
JOB_APPLICATIONS_TABLE="job_applications"

# 4. MODULES COMPLÉMENTAIRES IDENTIFIÉS
# Présence des modules détectés dans le code
BLOG_MODULE_PRESENT="true"   # tables + pages (blog_posts, pages /blog, /blog/:slug)
FAQ_MODULE_PRESENT="true"    # table `faqs` + page /faq
ADMIN_MODULE_PRESENT="true"  # pages /admin/* et ProtectedRoute

# 5. EMPLACEMENT DES COMPOSANTS CLEFS POUR LA FUTURE INTÉGRATION IA
# Composant affichant les cartes d'offres (Job card)
JOB_CARD_COMPONENT_PATH="[src/features/jobs/components/JobCard.tsx](src/features/jobs/components/JobCard.tsx)"
# Page de détail d'une offre d'emploi
JOB_DETAIL_PAGE_PATH="[src/pages/public/JobOfferDetailPage.tsx](src/pages/public/JobOfferDetailPage.tsx)"
# Initialisation du client Supabase utilisée par l'application
SUPABASE_CLIENT_PATH="[src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)"

# 6. BUCKET / TABLES RECOMMANDÉS POUR LES FUTURES FONCTIONNALITÉS IA
# Nom recommandé pour une future colonne vectorielle (offres / candidats)
RECOMMENDED_EMBEDDING_COLUMN="embedding_vector"
# Nom recommandé pour une table de cache d'analyses / embeddings (Supabase)
RECOMMENDED_ANALYSIS_CACHE_TABLE="ai_analysis_cache"

# -------------------------------------------------------------------------------
# NOTES RAPIDES (non modifiantes) :
# - Le contrat Supabase et les types DB se trouvent dans [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) — utile pour nommer précisément les colonnes.
# - Les buckets par défaut sont contrôlés via Vite env vars : VITE_SUPABASE_STORAGE_BUCKET, VITE_SUPABASE_OFFRES_BUCKET, VITE_SUPABASE_BLOG_BUCKET, VITE_SUPABASE_CANDIDATE_BUCKET.
# - Pas d'implémentation existante d'index vectoriel/embeddings; les noms recommandés ci‑dessus sont proposés pour une intégration future.
# ==============================================================================
