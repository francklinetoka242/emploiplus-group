# Arborescence du projet

`	ext
.
├──.env
├──.env.example
├──.github/
│   └──.github/workflows/
│       └──.github/workflows/main.yml
├──.gitignore
├──.prettierignore
├──.prettierrc
├──.vercelignore
├──AGENTS.md
├──api/
│   ├──api/confirm.ts
│   ├──api/lib/
│   │   ├──api/lib/password-reset-utils.ts
│   │   └──api/lib/transactional-email.ts
│   ├──api/password-reset-confirm.ts
│   ├──api/password-reset-request.ts
│   ├──api/password-reset-validate.ts
│   ├──api/register.ts
│   └──api/send-email.ts
├──arbo.md
├──AUDIT_POST_REFACTORING.md
├──build-output.txt
├──build.out
├──CANDIDATE_APPLY_PAGE_IMPLEMENTATION.md
├──CANDIDATE_NOTIFICATIONS_IMPLEMENTATION.md
├──components.json
├──curl-test.sh
├──debug-vite.txt
├──descrip.md
├──emploi.md
├──emploidesc.md
├──env.md
├──eslint.config.js
├──generate-curl-test.mjs
├──index.html
├──package-lock.json
├──package.json
├──public/
│   ├──public/favicon.ico
│   ├──public/hero-bg.jpg
│   ├──public/Logo.png
│   ├──public/og-default.svg
│   └──public/robots.txt
├──REFACTORING_REPORT.md
├──scripts/
│   ├──scripts/test-smtp.js
│   ├──scripts/test-token-symmetry.cjs
│   └──scripts/test-token-symmetry.js
├──SEND_EMAIL_HOOK_DEPLOYMENT.md
├──src/
│   ├──src/App.tsx
│   ├──src/assets/
│   │   ├──src/assets/Equipe_Experte/
│   │   │   ├──src/assets/Equipe_Experte/Claude_OMVOULET.jpeg
│   │   │   ├──src/assets/Equipe_Experte/Ing_Destinée_MOUISSOU.jpeg
│   │   │   └──src/assets/Equipe_Experte/Ing_Francklin_ETOKA.jpeg
│   │   ├──src/assets/favicon.ico
│   │   ├──src/assets/hero-bg.jpg
│   │   ├──src/assets/hero-bg1.jpg
│   │   ├──src/assets/hero-main-BX7R5hCp.jpg
│   │   ├──src/assets/IMG_Page-Services/
│   │   │   ├──src/assets/IMG_Page-Services/2147626421.jpg
│   │   │   ├──src/assets/IMG_Page-Services/employee-energie-solaire-fournissant-soutien-distance-dans-usine-panneaux-solaires_482257-125116(1).jpg
│   │   │   ├──src/assets/IMG_Page-Services/groupe-hommes-affaires-afro-americains_926199-3049393.jpg
│   │   │   ├──src/assets/IMG_Page-Services/ingenieurs-equipe-discutant-dans-salle-serveurs-train-faire-du-brainstorming_482257-118150(1).jpg
│   │   │   └──src/assets/IMG_Page-Services/ingenieurs-equipe-discutant-dans-salle-serveurs-train-faire-du-brainstorming_482257-118150(1)8.jpg
│   │   ├──src/assets/logo-monago.jpg
│   │   ├──src/assets/logo_monago-zUYR3nnk.jpg
│   │   ├──src/assets/robots.txt
│   │   └──src/assets/services/
│   │       ├──src/assets/services/conseil-training.svg
│   │       ├──src/assets/services/hub-emploi.svg
│   │       ├──src/assets/services/rh-gestion.svg
│   │       └──src/assets/services/service-opérationnel.svg
│   ├──src/components/
│   │   ├──src/components/admin/
│   │   │   ├──src/components/admin/AdminSidebar.tsx
│   │   │   └──src/components/admin/AdminTopbar.tsx
│   │   ├──src/components/candidate/
│   │   │   ├──src/components/candidate/CandidateMobileHeader.tsx
│   │   │   ├──src/components/candidate/CandidateSidebar.tsx
│   │   │   ├──src/components/candidate/CandidateTopbar.tsx
│   │   │   ├──src/components/candidate/index.ts
│   │   │   ├──src/components/candidate/NotificationsDropdown.tsx
│   │   │   ├──src/components/candidate/ProtectedCandidateRoute.tsx
│   │   │   ├──src/components/candidate/SaasCard.tsx
│   │   │   └──src/components/candidate/SaasLayout.tsx
│   │   ├──src/components/page/
│   │   │   ├──src/components/page/PageHeading.tsx
│   │   │   └──src/components/page/SectionHeader.tsx
│   │   ├──src/components/SEO.tsx
│   │   ├──src/components/site/
│   │   │   ├──src/components/site/AnimatedCounter.tsx
│   │   │   ├──src/components/site/Footer.tsx
│   │   │   ├──src/components/site/Header.tsx
│   │   │   ├──src/components/site/JobCard.tsx
│   │   │   ├──src/components/site/JobSkeleton.tsx
│   │   │   └──src/components/site/ShareButtons.tsx
│   │   └──src/components/ui/
│   │       ├──src/components/ui/accordion.tsx
│   │       ├──src/components/ui/alert-dialog.tsx
│   │       ├──src/components/ui/alert.tsx
│   │       ├──src/components/ui/aspect-ratio.tsx
│   │       ├──src/components/ui/avatar.tsx
│   │       ├──src/components/ui/badge.tsx
│   │       ├──src/components/ui/breadcrumb.tsx
│   │       ├──src/components/ui/button.tsx
│   │       ├──src/components/ui/calendar.tsx
│   │       ├──src/components/ui/card.tsx
│   │       ├──src/components/ui/carousel.tsx
│   │       ├──src/components/ui/chart.tsx
│   │       ├──src/components/ui/checkbox.tsx
│   │       ├──src/components/ui/collapsible.tsx
│   │       ├──src/components/ui/command.tsx
│   │       ├──src/components/ui/context-menu.tsx
│   │       ├──src/components/ui/dialog.tsx
│   │       ├──src/components/ui/drawer.tsx
│   │       ├──src/components/ui/dropdown-menu.tsx
│   │       ├──src/components/ui/form.tsx
│   │       ├──src/components/ui/hover-card.tsx
│   │       ├──src/components/ui/input-otp.tsx
│   │       ├──src/components/ui/input.tsx
│   │       ├──src/components/ui/label.tsx
│   │       ├──src/components/ui/menubar.tsx
│   │       ├──src/components/ui/navigation-menu.tsx
│   │       ├──src/components/ui/pagination.tsx
│   │       ├──src/components/ui/popover.tsx
│   │       ├──src/components/ui/progress.tsx
│   │       ├──src/components/ui/radio-group.tsx
│   │       ├──src/components/ui/resizable.tsx
│   │       ├──src/components/ui/scroll-area.tsx
│   │       ├──src/components/ui/select.tsx
│   │       ├──src/components/ui/separator.tsx
│   │       ├──src/components/ui/sheet.tsx
│   │       ├──src/components/ui/sidebar.tsx
│   │       ├──src/components/ui/skeleton.tsx
│   │       ├──src/components/ui/slider.tsx
│   │       ├──src/components/ui/sonner.tsx
│   │       ├──src/components/ui/switch.tsx
│   │       ├──src/components/ui/table.tsx
│   │       ├──src/components/ui/tabs.tsx
│   │       ├──src/components/ui/textarea.tsx
│   │       ├──src/components/ui/toggle-group.tsx
│   │       ├──src/components/ui/toggle.tsx
│   │       └──src/components/ui/tooltip.tsx
│   ├──src/contexts/
│   │   └──src/contexts/CandidateSidebarContext.tsx
│   ├──src/hooks/
│   │   ├──src/hooks/pages.ts
│   │   ├──src/hooks/use-mobile.tsx
│   │   ├──src/hooks/useCandidate.ts
│   │   ├──src/hooks/useNotifications.ts
│   │   └──src/hooks/usePublishedOffers.ts
│   ├──src/integrations/
│   │   └──src/integrations/supabase/
│   │       ├──src/integrations/supabase/auth-attacher.ts
│   │       ├──src/integrations/supabase/auth-middleware.ts
│   │       ├──src/integrations/supabase/candidate-auth.ts
│   │       ├──src/integrations/supabase/client.server.ts
│   │       ├──src/integrations/supabase/client.ts
│   │       ├──src/integrations/supabase/notifications.ts
│   │       └──src/integrations/supabase/types.ts
│   ├──src/lib/
│   │   ├──src/lib/candidate-documents.ts
│   │   ├──src/lib/centralAfricaCities.ts
│   │   ├──src/lib/confirm-url.ts
│   │   ├──src/lib/confirm-utils.ts
│   │   ├──src/lib/constants.ts
│   │   ├──src/lib/error-capture.ts
│   │   ├──src/lib/error-page.ts
│   │   ├──src/lib/geo.ts
│   │   ├──src/lib/i18n.tsx
│   │   ├──src/lib/lovable-error-reporting.ts
│   │   ├──src/lib/password-reset-utils.ts
│   │   ├──src/lib/seo.tsx
│   │   ├──src/lib/supabase-storage.ts
│   │   ├──src/lib/utils-ext.ts
│   │   └──src/lib/utils.ts
│   ├──src/main.tsx
│   ├──src/pages/
│   │   ├──src/pages/admin/
│   │   │   ├──src/pages/admin/AdminBlogCreatePage.tsx
│   │   │   ├──src/pages/admin/AdminBlogPage.tsx
│   │   │   ├──src/pages/admin/AdminCandidatesPage.tsx
│   │   │   ├──src/pages/admin/AdminHomePage.tsx
│   │   │   ├──src/pages/admin/AdminJobCreatePage.tsx
│   │   │   ├──src/pages/admin/AdminJobsPage.tsx
│   │   │   ├──src/pages/admin/AdminNotificationsPage.tsx
│   │   │   ├──src/pages/admin/AdminPage.tsx
│   │   │   ├──src/pages/admin/AdminSEOPage.tsx
│   │   │   ├──src/pages/admin/AdminTeamPage.tsx
│   │   │   └──src/pages/admin/index.ts
│   │   ├──src/pages/candidate/
│   │   │   ├──src/pages/candidate/CandidateApplicationsPage.tsx
│   │   │   ├──src/pages/candidate/CandidateConfirmPage.tsx
│   │   │   ├──src/pages/candidate/CandidateCVPage.tsx
│   │   │   ├──src/pages/candidate/CandidateDashboardPage-old.tsx
│   │   │   ├──src/pages/candidate/CandidateDashboardPage.tsx
│   │   │   ├──src/pages/candidate/CandidateDashboardPageModern.tsx
│   │   │   ├──src/pages/candidate/CandidateEducationPage.tsx
│   │   │   ├──src/pages/candidate/CandidateExperiencePage.tsx
│   │   │   ├──src/pages/candidate/CandidateForgotPasswordPage.tsx
│   │   │   ├──src/pages/candidate/CandidateJobApplyPage.tsx
│   │   │   ├──src/pages/candidate/CandidateLanguagesPage.tsx
│   │   │   ├──src/pages/candidate/CandidateLayout.tsx
│   │   │   ├──src/pages/candidate/CandidateLoginPage.tsx
│   │   │   ├──src/pages/candidate/CandidateNotificationsPage.tsx
│   │   │   ├──src/pages/candidate/CandidatePreferencesPage.tsx
│   │   │   ├──src/pages/candidate/CandidateProfilePage.tsx
│   │   │   ├──src/pages/candidate/CandidateProfilePageModern.tsx
│   │   │   ├──src/pages/candidate/CandidateResetPasswordPage.tsx
│   │   │   ├──src/pages/candidate/CandidateSavedOffersPage.tsx
│   │   │   ├──src/pages/candidate/CandidateSettingsPage.tsx
│   │   │   ├──src/pages/candidate/CandidateSignupPage.tsx
│   │   │   ├──src/pages/candidate/CandidateSkillsPage.tsx
│   │   │   └──src/pages/candidate/index.ts
│   │   ├──src/pages/index.ts
│   │   └──src/pages/public/
│   │       ├──src/pages/public/AboutPage.tsx
│   │       ├──src/pages/public/AuthPage.tsx
│   │       ├──src/pages/public/BlogPage.tsx
│   │       ├──src/pages/public/BlogPostDetailPage.tsx
│   │       ├──src/pages/public/ContactPage.tsx
│   │       ├──src/pages/public/HomePage.tsx
│   │       ├──src/pages/public/index.ts
│   │       ├──src/pages/public/JobOfferDetailPage.tsx
│   │       ├──src/pages/public/JobsPage.tsx
│   │       ├──src/pages/public/services/
│   │       │   └──src/pages/public/services/HubEmploiPage.tsx
│   │       ├──src/pages/public/ServicesPage.tsx
│   │       └──src/pages/public/UtilityPages.tsx
│   ├──src/server.ts
│   ├──src/start.ts
│   └──src/styles.css
├──supabase/
│   ├──supabase/config.toml
│   └──supabase/migrations/
│       ├──supabase/migrations/20260620162250_c064733e-cfeb-4fea-9cda-f3224f6cc61a.sql
│       ├──supabase/migrations/20260620174442_23c9bfed-04ff-4596-a2fe-353f1ffa3dd1.sql
│       ├──supabase/migrations/20260628120000_add_job_offer_admin_fields.sql
│       ├──supabase/migrations/20260628140000_allow_authenticated_admin_content.sql
│       ├──supabase/migrations/20260629120000_add_blog_featured_and_sort_order.sql
│       ├──supabase/migrations/20260629140000_extend_admin_members_management.sql
│       ├──supabase/migrations/20260702_add_admin_notifications.sql
│       ├──supabase/migrations/20260702_create_candidate_languages.sql
│       ├──supabase/migrations/20260702_create_candidate_notifications_system.sql
│       ├──supabase/migrations/20260702_create_candidate_preferences.sql
│       ├──supabase/migrations/20260702_create_candidate_saved_offers.sql
│       ├──supabase/migrations/20260702_create_candidates_table.sql
│       ├──supabase/migrations/20260702_create_job_applications.sql
│       └──supabase/migrations/20260704_add_candidate_documents_storage_policies.sql
├──temp-send-email-hook-test.js
├──temp-send-email-hook-test.mjs
├──temp-smtp-test.mjs
├──tests/
│   └──tests/api/
│       ├──tests/api/confirm-url.test.ts
│       ├──tests/api/confirm-utils.test.ts
│       ├──tests/api/password-reset-validate.test.ts
│       ├──tests/api/register-response.test.ts
│       └──tests/api/register.test.ts
├──tree.md
├──tsconfig.json
├──utils/
│   └──utils/token.ts
├──vercel-build-debug.txt
├──vercel.json
├──vite.config.ts
├──vite.md
└──webhook-payload.json
`