import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { I18nProvider } from "@/lib/i18n";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { Toaster } from "@/components/ui/sonner";

// Immediately loaded pages (critical path)
import {
  HomePage,
  AuthPage,
  NotFoundPage,
} from "./pages/index";

// Lazy load secondary pages
const AboutPage = lazy(() => import("./pages/public/AboutPage").then(m => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import("./pages/public/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogPostDetailPage = lazy(() => import("./pages/public/BlogPostDetailPage").then(m => ({ default: m.BlogPostDetailPage })));
const ContactPage = lazy(() => import("./pages/public/ContactPage").then(m => ({ default: m.ContactPage })));
const JobOfferDetailPage = lazy(() => import("./pages/public/JobOfferDetailPage").then(m => ({ default: m.JobOfferDetailPage })));
const JobsPage = lazy(() => import("./pages/public/JobsPage").then(m => ({ default: m.JobsPage })));
const ServiceDetailPage = lazy(() => import("./pages/public/UtilityPages").then(m => ({ default: m.ServiceDetailPage })));
const ServicesPage = lazy(() => import("./pages/public/ServicesPage").then(m => ({ default: m.ServicesPage })));

// Lazy load admin pages (heavy feature area)
const AdminPage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminPage })));
const AdminHomePage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminHomePage })));
const AdminJobsPage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminJobsPage })));
const AdminBlogPage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminBlogPage })));
const AdminTeamPage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminTeamPage })));
const AdminJobCreatePage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminJobCreatePage })));
const AdminBlogCreatePage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminBlogCreatePage })));
const AdminSEOPage = lazy(() => import("./pages/admin").then(m => ({ default: m.AdminSEOPage })));

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
  const hideShell = location.pathname === "/auth" || location.pathname.startsWith("/admin");

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
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:slug" element={<JobOfferDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminPage />}>
                <Route index element={<AdminHomePage />} />
                <Route path="jobs" element={<AdminJobsPage />} />
                <Route path="jobs/new" element={<AdminJobCreatePage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="blog/new" element={<AdminBlogCreatePage />} />
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
