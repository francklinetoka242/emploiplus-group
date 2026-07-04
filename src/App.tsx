import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { I18nProvider } from "@/lib/i18n";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// Immediately loaded pages (critical path)
import {
  HomePage,
  AuthPage,
  NotFoundPage,
} from "@/pages";

// Lazy load secondary pages
const AboutPage = lazy(() => import("@/pages/public/AboutPage").then(m => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import("@/pages/public/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogPostDetailPage = lazy(() => import("@/pages/public/BlogPostDetailPage").then(m => ({ default: m.BlogPostDetailPage })));
const ContactPage = lazy(() => import("@/pages/public/ContactPage").then(m => ({ default: m.ContactPage })));
const JobOfferDetailPage = lazy(() => import("@/pages/public/JobOfferDetailPage").then(m => ({ default: m.JobOfferDetailPage })));
const JobsPage = lazy(() => import("@/pages/public/JobsPage").then(m => ({ default: m.JobsPage })));
const ServiceDetailPage = lazy(() => import("@/pages/public/UtilityPages").then(m => ({ default: m.ServiceDetailPage })));
const ServicesPage = lazy(() => import("@/pages/public/ServicesPage").then(m => ({ default: m.ServicesPage })));
const HubEmploiPage = lazy(() => import("@/pages/public/services/HubEmploiPage"));

// Lazy load admin pages (heavy feature area)
const AdminPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminPage })));
const AdminHomePage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminHomePage })));
const AdminJobsPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminJobsPage })));
const AdminBlogPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminBlogPage })));
const AdminTeamPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminTeamPage })));
const AdminJobCreatePage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminJobCreatePage })));
const AdminBlogCreatePage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminBlogCreatePage })));
const AdminSEOPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminSEOPage })));
const AdminNotificationsPage = lazy(() => import("@/pages/admin/AdminNotificationsPage").then(m => ({ default: m.AdminNotificationsPage })));


// Lazy load candidate pages
const CandidateLoginPage = lazy(() => import("@/pages/candidate/CandidateLoginPage").then(m => ({ default: m.CandidateLoginPage })));
const CandidateSignupPage = lazy(() => import("@/pages/candidate/CandidateSignupPage").then(m => ({ default: m.CandidateSignupPage })));
const CandidateForgotPasswordPage = lazy(() => import("@/pages/candidate/CandidateForgotPasswordPage").then(m => ({ default: m.CandidateForgotPasswordPage })));
const CandidateResetPasswordPage = lazy(() => import("@/pages/candidate/CandidateResetPasswordPage").then(m => ({ default: m.CandidateResetPasswordPage })));
const CandidateConfirmPage = lazy(() => import("@/pages/candidate/CandidateConfirmPage").then(m => ({ default: m.CandidateConfirmPage })));
const CandidateLayout = lazy(() => import("@/pages/candidate/CandidateLayout").then(m => ({ default: m.CandidateLayout })));
const CandidateDashboardPage = lazy(() => import("@/pages/candidate/CandidateDashboardPage").then(m => ({ default: m.CandidateDashboardPage })));
const ProtectedCandidateRoute = lazy(() => import("@/components/candidate/ProtectedCandidateRoute").then(m => ({ default: m.ProtectedCandidateRoute })));
const CandidateProfilePage = lazy(() => import("@/pages/candidate/CandidateProfilePage").then(m => ({ default: m.CandidateProfilePage })));
const CandidateCVPage = lazy(() => import("@/pages/candidate/CandidateCVPage").then(m => ({ default: m.CandidateCVPage })));
const CandidateExperiencePage = lazy(() => import("@/pages/candidate/CandidateExperiencePage").then(m => ({ default: m.CandidateExperiencePage })));
const CandidateEducationPage = lazy(() => import("@/pages/candidate/CandidateEducationPage").then(m => ({ default: m.CandidateEducationPage })));
const CandidateSkillsPage = lazy(() => import("@/pages/candidate/CandidateSkillsPage").then(m => ({ default: m.CandidateSkillsPage })));
const CandidateLanguagesPage = lazy(() => import("@/pages/candidate/CandidateLanguagesPage").then(m => ({ default: m.CandidateLanguagesPage })));
const CandidatePreferencesPage = lazy(() => import("@/pages/candidate/CandidatePreferencesPage").then(m => ({ default: m.CandidatePreferencesPage })));
const CandidateApplicationsPage = lazy(() => import("@/pages/candidate/CandidateApplicationsPage").then(m => ({ default: m.CandidateApplicationsPage })));
const CandidateSavedOffersPage = lazy(() => import("@/pages/candidate/CandidateSavedOffersPage").then(m => ({ default: m.CandidateSavedOffersPage })));
const CandidateNotificationsPage = lazy(() => import("@/pages/candidate/CandidateNotificationsPage").then(m => ({ default: m.CandidateNotificationsPage })));
const CandidateSettingsPage = lazy(() => import("@/pages/candidate/CandidateSettingsPage").then(m => ({ default: m.CandidateSettingsPage })));
const CandidateJobApplyPage = lazy(() => import("@/pages/candidate/CandidateJobApplyPage").then(m => ({ default: m.CandidateJobApplyPage })));

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="container-page py-20 md:py-28">
    <div className="rounded-3xl border border-border bg-card p-10 text-center">
      <div className="inline-flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-cyan-500 animate-pulse"></div>
        <span className="text-sm text-muted-foreground animate-pulse">Chargement...</span>
      </div>
    </div>
  </div>
);

export default function App() {
  const location = useLocation();
  const hideShell = location.pathname === "/auth" || location.pathname.startsWith("/admin") || location.pathname.startsWith("/candidate");

  // CRITICAL: On app startup, verify that any restored candidate session has a confirmed email
  // This prevents Supabase from silently restoring an unconfirmed session from localStorage
  useEffect(() => {
    const validateCandidateSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !session.user.email_confirmed_at) {
          console.warn('[App] Restored session has unconfirmed email. Clearing session...');
          await supabase.auth.signOut();
          
          // Clear session storage
          try {
            localStorage.removeItem('sb-zhldgrvmmdhtlsnsxuys-auth-token');
            localStorage.removeItem('sb-zhldgrvmmdhtlsnsxuys-auth-token-code-verifier');
            sessionStorage.clear();
          } catch (e) {
            console.warn('Could not clear session storage:', e);
          }
        }
      } catch (error) {
        console.error('[App] Error validating session:', error);
      }
    };

    validateCandidateSession();
  }, []);

  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {!hideShell && <SiteHeader />}
        <main className="flex-1">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
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
                  <ProtectedCandidateRoute>
                    <CandidateLayout />
                  </ProtectedCandidateRoute>
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
                <Route path="Mes-Documents" element={<CandidateCVPage />} />
                <Route path="experience" element={<CandidateExperiencePage />} />
                <Route path="education" element={<CandidateEducationPage />} />
                <Route path="skills" element={<CandidateSkillsPage />} />
                <Route path="languages" element={<CandidateLanguagesPage />} />
                <Route path="preferences" element={<CandidatePreferencesPage />} />
                <Route path="applications" element={<CandidateApplicationsPage />} />
                <Route path="saved-offers" element={<CandidateSavedOffersPage />} />
                <Route path="notifications" element={<CandidateNotificationsPage />} />
                <Route path="settings" element={<CandidateSettingsPage />} />
                <Route path="jobs/:slug/apply" element={<CandidateJobApplyPage />} />
              </Route>
              
              <Route path="/admin" element={<AdminPage />}>
                <Route index element={<AdminHomePage />} />
                <Route path="jobs" element={<AdminJobsPage />} />
                <Route path="jobs/new" element={<AdminJobCreatePage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="blog/new" element={<AdminBlogCreatePage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                <Route path="seo" element={<AdminSEOPage />} />
                <Route path="team" element={<AdminTeamPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        {!hideShell && <SiteFooter />}
        <Toaster richColors position="top-right" />
      </div>
    </I18nProvider>
  );
}
