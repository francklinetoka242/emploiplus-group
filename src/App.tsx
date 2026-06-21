import { Routes, Route, useLocation } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { Toaster } from "@/components/ui/sonner";
import {
  AboutPage,
  AdminPage,
  AuthPage,
  BlogPage,
  ContactPage,
  HomePage,
  JobsPage,
  NotFoundPage,
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
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!hideShell && <SiteFooter />}
        <Toaster richColors position="top-right" />
      </div>
    </I18nProvider>
  );
}
