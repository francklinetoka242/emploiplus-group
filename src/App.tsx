import { Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { I18nProvider } from "@/lib/i18n";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { Toaster } from "@/components/ui/sonner";
import {
  AboutPage,
  AdminHomePage,
  AdminPage,
  AdminBlogPage,
  AdminTeamPage,
  AdminBlogCreatePage,
  AdminJobsPage,
  AdminJobCreatePage,
  AuthPage,
  BlogPage,
  ContactPage,
  HomePage,
  JobsPage,
  NotFoundPage,
  ServiceDetailPage,
  ServicesPage,
} from "./pages";

export default function App() {
  const location = useLocation();
  const hideShell = location.pathname === "/auth" || location.pathname.startsWith("/admin");

  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {!hideShell && <SiteHeader />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin/*" element={<AdminPage />}>
              <Route index element={<AdminHomePage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="jobs/new" element={<AdminJobCreatePage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="blog/new" element={<AdminBlogCreatePage />} />
              <Route path="team" element={<AdminTeamPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!hideShell && <SiteFooter />}
        <Toaster richColors position="top-right" />
        <Analytics />
      </div>
    </I18nProvider>
  );
}
