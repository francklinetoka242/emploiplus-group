import { Link } from "react-router-dom";
import { Facebook, Linkedin, MessageSquare, Globe } from "lucide-react";
import { useI18n, type Locale } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { openCookieBanner } from "@/components/site/CookieConsentBanner";

const AVAILABLE_LOCALES: Locale[] = ["fr", "en", "ln"];

export function SiteFooter() {
  const { t, locale, setLocale } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-slate-950/95">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img
              src="/Logo.png"
              alt="EmploiPlus Group"
              className="h-9 w-9 rounded-lg object-cover shadow-brand"
            />
            <div className="font-display text-lg font-bold text-white">EmploiPlus-Group</div>
          </div>
          <div className="text-sm text-slate-300">{t("footer.tagline")}</div>
          <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
            <SelectTrigger
              aria-label={t(`lang.${locale}`)}
              className="w-12 rounded-md border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-sm hover:bg-slate-800"
            >
              <Globe className="size-4" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LOCALES.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(`lang.${code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm text-slate-100">{t("footer.links.services")}</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/services" className="transition-colors duration-200 hover:text-white">
                {t("nav.services")}
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="transition-colors duration-200 hover:text-white">
                {t("nav.jobs")}
              </Link>
            </li>
            <li>
              <Link to="/blog" className="transition-colors duration-200 hover:text-white">
                {t("nav.blog")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm text-slate-100">{t("footer.links.company")}</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/politique-de-confidentialite" className="transition-colors duration-200 hover:text-white">
                Politique de Confidentialité
              </Link>
            </li>
            <li>
              <Link to="/mentions-legales" className="transition-colors duration-200 hover:text-white">
                Mentions Légales
              </Link>
            </li>
            <li>
              <Link to="/cgu" className="transition-colors duration-200 hover:text-white">
                Conditions Générales d'Utilisation
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openCookieBanner()}
                className="text-left transition-colors duration-200 hover:text-white"
              >
                Gestion des cookies
              </button>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm text-slate-100">Contact</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <a href="tel:+242067311033" className="font-semibold text-slate-100 transition-colors duration-200 hover:text-white">
                Contact
              </a>
            </li>
            <li className="flex flex-col gap-2">
              <a
                href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-white"
              >
                <MessageSquare className="size-4" />
                WhatsApp
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-white"
              >
                <MessageSquare className="size-4" />
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-3 mt-2">
              <a
                href="https://www.facebook.com/EmploiplusConsulting"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-slate-300 transition-colors duration-200 hover:text-white"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/emploiplus-consulting/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-300 transition-colors duration-200 hover:text-white"
              >
                <Linkedin className="size-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <div>
            © {year} EmploiPlus Group. {t("footer.rights")}
          </div>
          <div>{t("footer.tagline")}</div>
        </div>
      </div>
    </footer>
  );
}
