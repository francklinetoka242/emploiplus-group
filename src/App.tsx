import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { I18nProvider } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "@/features/authentication/context/AuthContext";
import { CandidateSidebarProvider } from "@/contexts/CandidateSidebarContext";
import { PublicLayout } from "@/components/site/PublicLayout";
import { useAuthContext } from "@/features/authentication/context/AuthContext";
import { ProtectedRoute } from "@/features/authentication/guards";
import { DashboardLayoutSkeleton } from "@/components/ui/skeletons";

// Immediately loaded pages (critical path)
import { HomePage } from "@/pages/public/HomePage";
import { AuthPage } from "@/pages/public/AuthPage";

// Lazy load secondary pages
const AboutPage = lazy(() =>
  import("@/pages/public/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const BlogPage = lazy(() =>
  import("@/pages/public/BlogPage").then((m) => ({ default: m.BlogPage })),
);
const BlogPostDetailPage = lazy(() =>
  import("@/pages/public/BlogPostDetailPage").then((m) => ({ default: m.BlogPostDetailPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/public/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const JobOfferDetailPage = lazy(() =>
  import("@/pages/public/JobOfferDetailPage").then((m) => ({ default: m.JobOfferDetailPage })),
);
const JobsPage = lazy(() =>
  import("@/pages/public/JobsPage").then((m) => ({ default: m.JobsPage })),
);
const ServiceDetailPage = lazy(() =>
  import("@/pages/public/UtilityPages").then((m) => ({ default: m.ServiceDetailPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/public/UtilityPages").then((m) => ({ default: m.NotFoundPage })),
);
const ServicesPage = lazy(() =>
  import("@/pages/public/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
const HubEmploiPage = lazy(() => import("@/pages/public/services/HubEmploiPage"));
const PrivacyPolicyPage = lazy(() =>
  import("@/pages/public/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage })),
);
const LegalDocumentsPage = lazy(() =>
  import("@/pages/public/LegalDocumentsPage").then((m) => ({ default: m.LegalDocumentsPage })),
);
const CguPage = lazy(() => import("@/pages/public/CguPage").then((m) => ({ default: m.CguPage })));

// Lazy load admin pages (heavy feature area)
const AdminPage = lazy(() => import("@/pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const AdminHomePage = lazy(() =>
  import("@/pages/admin/AdminHomePage").then((m) => ({ default: m.AdminHomePage })),
);
const AdminJobsPage = lazy(() =>
  import("@/pages/admin/AdminJobsPage").then((m) => ({ default: m.AdminJobsPage })),
);
const AdminBlogPage = lazy(() =>
  import("@/pages/admin/AdminBlogPage").then((m) => ({ default: m.AdminBlogPage })),
);
const AdminTeamPage = lazy(() =>
  import("@/pages/admin/AdminTeamPage").then((m) => ({ default: m.AdminTeamPage })),
);
const AdminJobCreatePage = lazy(() =>
  import("@/pages/admin/AdminJobCreatePage").then((m) => ({ default: m.AdminJobCreatePage })),
);
const AdminBlogCreatePage = lazy(() =>
  import("@/pages/admin/AdminBlogCreatePage").then((m) => ({ default: m.AdminBlogCreatePage })),
);
const AdminSEOPage = lazy(() => import("@/pages/admin/AdminSEOPage").then((m) => ({ default: m.AdminSEOPage })));
const AdminPrivacyPolicyPage = lazy(() =>
  import("@/pages/admin/AdminPrivacyPolicyPage").then((m) => ({ default: m.AdminPrivacyPolicyPage })),
);
const AdminLegalDocumentsPage = lazy(() =>
  import("@/pages/admin/AdminLegalDocumentsPage").then((m) => ({ default: m.AdminLegalDocumentsPage })),
);
const AdminCguPage = lazy(() => import("@/pages/admin/AdminCguPage").then((m) => ({ default: m.AdminCguPage })));
const AdminNotificationsPage = lazy(() =>
  import("@/pages/admin/AdminNotificationsPage").then((m) => ({ default: m.AdminNotificationsPage })),
);
const AdminCandidatesPage = lazy(() =>
  import("@/pages/admin/AdminCandidatesPage").then((m) => ({ default: m.AdminCandidatesPage })),
);
const AdminLocalGuidesPage = lazy(() =>
  import("@/pages/admin/AdminLocalGuidesPage").then((m) => ({ default: m.AdminLocalGuidesPage })),
);

// Lazy load candidate pages
const CandidateLoginPage = lazy(() =>
  import("@/pages/candidate/CandidateLoginPage").then((m) => ({ default: m.CandidateLoginPage })),
);
const CandidateSignupPage = lazy(() =>
  import("@/pages/candidate/CandidateSignupPage").then((m) => ({ default: m.CandidateSignupPage })),
);
const CandidateForgotPasswordPage = lazy(() =>
  import("@/pages/candidate/CandidateForgotPasswordPage").then((m) => ({
    default: m.CandidateForgotPasswordPage,
  })),
);
const CandidateResetPasswordPage = lazy(() =>
  import("@/pages/candidate/CandidateResetPasswordPage").then((m) => ({
    default: m.CandidateResetPasswordPage,
  })),
);
const CandidateConfirmPage = lazy(() =>
  import("@/pages/candidate/CandidateConfirmPage").then((m) => ({
    default: m.CandidateConfirmPage,
  })),
);
const CandidateLayout = lazy(() =>
  import("@/pages/candidate/CandidateLayout").then((m) => ({ default: m.CandidateLayout })),
);
const CandidateDashboardPage = lazy(() =>
  import("@/pages/candidate/CandidateDashboardPage").then((m) => ({
    default: m.CandidateDashboardPage,
  })),
);
const CandidateProfilePage = lazy(() =>
  import("@/pages/candidate/CandidateProfilePage").then((m) => ({
    default: m.CandidateProfilePage,
  })),
);
const CandidateCVPage = lazy(() =>
  import("@/pages/candidate/CandidateCVPage").then((m) => ({ default: m.CandidateCVPage })),
);
const CandidateCreateCVPage = lazy(() =>
  import("@/pages/candidate/CandidateCreateCVPage").then((m) => ({ default: m.CandidateCreateCVPage })),
);
const CandidateCreateCVEditorPage = lazy(() =>
  import("@/pages/candidate/CandidateCreateCVEditorPage").then((m) => ({ default: m.CandidateCreateCVEditorPage })),
);
const CreationMotivationRedirect = lazy(() =>
  import("@/pages/candidate/CreationMotivationRedirect").then((m) => ({ default: m.default })),
);
const CandidateDocumentsPage = lazy(() =>
  import("@/pages/candidate/CandidateCVPage").then((m) => ({ default: m.CandidateCVPage })),
);
const CandidateProfileEditPage = lazy(() =>
  import("@/pages/candidate/CandidateProfileEditPage").then((m) => ({ default: m.default })),
);
const CandidateApplicationDetailPage = lazy(() =>
  import("@/pages/candidate/CandidateApplicationDetailPage").then((m) => ({ default: m.default })),
);
const CandidateExperiencePage = lazy(() =>
  import("@/pages/candidate/CandidateExperiencePage").then((m) => ({
    default: m.CandidateExperiencePage,
  })),
);
const CandidateEducationPage = lazy(() =>
  import("@/pages/candidate/CandidateEducationPage").then((m) => ({
    default: m.CandidateEducationPage,
  })),
);
const CandidateSkillsPage = lazy(() =>
  import("@/pages/candidate/CandidateSkillsPage").then((m) => ({ default: m.CandidateSkillsPage })),
);
const CandidateLanguagesPage = lazy(() =>
  import("@/pages/candidate/CandidateLanguagesPage").then((m) => ({
    default: m.CandidateLanguagesPage,
  })),
);
const CandidatePreferencesPage = lazy(() =>
  import("@/pages/candidate/CandidatePreferencesPage").then((m) => ({
    default: m.CandidatePreferencesPage,
  })),
);
const CandidateApplicationsPage = lazy(() =>
  import("@/pages/candidate/CandidateApplicationsPage").then((m) => ({
    default: m.CandidateApplicationsPage,
  })),
);
const CandidateSavedOffersPage = lazy(() =>
  import("@/pages/candidate/CandidateSavedOffersPage").then((m) => ({
    default: m.CandidateSavedOffersPage,
  })),
);
const CandidateNotificationsPage = lazy(() =>
  import("@/pages/candidate/CandidateNotificationsPage").then((m) => ({
    default: m.CandidateNotificationsPage,
  })),
);
const CandidateSettingsPage = lazy(() =>
  import("@/pages/candidate/CandidateSettingsPage").then((m) => ({
    default: m.CandidateSettingsPage,
  })),
);
const CandidateLocalGuidesPage = lazy(() =>
  import("@/pages/candidate/CandidateLocalGuidesPage").then((m) => ({
    default: m.CandidateLocalGuidesPage,
  })),
);
const CandidateJobApplyPage = lazy(() =>
  import("@/pages/candidate/CandidateJobApplyPage").then((m) => ({
    default: m.CandidateJobApplyPage,
  })),
);

// Loading fallback component
const PageLoadingFallback = () => <DashboardLayoutSkeleton />;

function SharedPublicRouteShell() {
  const { profile, isLoading, isProfileLoading } = useAuthContext();
  const content = <Outlet />;

  if (isLoading || isProfileLoading) {
    return <PublicLayout>{content}</PublicLayout>;
  }

  if (profile) {
    return (
      <ProtectedRoute fallbackPath="/candidate/login" requiredPermissions={["dashboard.candidate"]}>
        <CandidateLayout>{content}</CandidateLayout>
      </ProtectedRoute>
    );
  }

  return <PublicLayout>{content}</PublicLayout>;
}

function AppContent() {
  const { session } = useAuthContext();

  // CRITICAL: On app startup, verify that any restored candidate session has a confirmed email
  // This prevents Supabase from silently restoring an unconfirmed session from localStorage
  useEffect(() => {
    const validateCandidateSession = async () => {
      if (!session) {
        return;
      }

      if (session.user.email_confirmed_at) {
        return;
      }

      try {
        console.warn("[App] Restored session has unconfirmed email. Clearing session...");
        await supabase.auth.signOut();

        // Clear session storage
        try {
          localStorage.removeItem("sb-zhldgrvmmdhtlsnsxuys-auth-token");
          localStorage.removeItem("sb-zhldgrvmmdhtlsnsxuys-auth-token-code-verifier");
          sessionStorage.clear();
        } catch (e) {
          console.warn("Could not clear session storage:", e);
        }
      } catch (error) {
        console.error("[App] Error validating session:", error);
      }
    };

    void validateCandidateSession();
  }, [session]);

  const routes = (
    <Routes>
      <Route element={<SharedPublicRouteShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/services/hub-emploi-recrutement/landing" element={<HubEmploiPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:slug" element={<JobOfferDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/politique-de-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/mentions-legales" element={<LegalDocumentsPage />} />
        <Route path="/cgu" element={<CguPage />} />
      </Route>

      <Route path="/auth" element={<AuthPage />} />

      {/* Candidate pages */}
      <Route path="/candidate/login" element={<CandidateLoginPage />} />
      <Route path="/candidate/signup" element={<CandidateSignupPage />} />
      <Route path="/candidate/forgot-password" element={<CandidateForgotPasswordPage />} />
      <Route path="/candidate/reset-password" element={<CandidateResetPasswordPage />} />
      <Route path="/candidate/confirm" element={<CandidateConfirmPage />} />
      <Route
        path="/candidate"
        element={
          <ProtectedRoute
            fallbackPath="/candidate/login"
            requiredPermissions={["dashboard.candidate"]}
            loadingSkeleton={<DashboardLayoutSkeleton />}
          >
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="public" element={<HomePage />} />
        <Route path="public/services" element={<ServicesPage />} />
        <Route path="public/jobs" element={<JobsPage />} />
        <Route path="public/blog" element={<BlogPage />} />
        <Route path="public/about" element={<AboutPage />} />
        <Route path="public/contact" element={<ContactPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="profile/edit" element={<CandidateProfileEditPage />} />
        <Route path="documents" element={<CandidateDocumentsPage />} />
        <Route path="guides" element={<CandidateLocalGuidesPage />} />
        {/* Backwards-compatible redirects */}
        <Route path="creation" element={<Navigate to="/candidate/documents" replace />} />
        <Route path="creation-motivation" element={<CreationMotivationRedirect />} />
        <Route path="experience" element={<Navigate to="/candidate/profile?tab=experience" replace />} />
        <Route path="education" element={<Navigate to="/candidate/profile?tab=education" replace />} />
        <Route path="skills" element={<Navigate to="/candidate/profile?tab=skills" replace />} />
        <Route path="languages" element={<Navigate to="/candidate/profile?tab=languages" replace />} />
        <Route path="preferences" element={<Navigate to="/candidate/profile?tab=preferences" replace />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="applications/:id" element={<CandidateApplicationDetailPage />} />
        <Route path="saved-offers" element={<CandidateSavedOffersPage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
        <Route path="jobs/:slug/apply" element={<CandidateJobApplyPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute fallbackPath="/auth" allowedRoles={["super_admin", "admin", "editor"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["dashboard.admin"]}
            >
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["jobs.read"]}
            >
              <AdminJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs/new"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["jobs.create"]}
            >
              <AdminJobCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="blog"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin", "editor"]}
              requiredPermissions={["blog.read"]}
            >
              <AdminBlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="blog/new"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin", "editor"]}
              requiredPermissions={["blog.write"]}
            >
              <AdminBlogCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidates"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["candidate.read"]}
            >
              <AdminCandidatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="guides"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["dashboard.admin"]}
            >
              <AdminLocalGuidesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["notifications.manage"]}
            >
              <AdminNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="seo"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["seo.manage"]}
            >
              <AdminSEOPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="privacy"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["dashboard.admin"]}
            >
              <AdminPrivacyPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="legal"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["dashboard.admin"]}
            >
              <AdminLegalDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cgu"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin", "admin"]}
              requiredPermissions={["dashboard.admin"]}
            >
              <AdminCguPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <ProtectedRoute
              fallbackPath="/auth"
              allowedRoles={["super_admin"]}
              requiredPermissions={["team.manage"]}
            >
              <AdminTeamPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  return (
    <I18nProvider>
      <CandidateSidebarProvider>
        <Suspense fallback={<PageLoadingFallback />}>{routes}</Suspense>
        <Toaster richColors position="top-right" />
      </CandidateSidebarProvider>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
