import { Link } from "react-router-dom";
import { Facebook, Globe, Instagram, Linkedin } from "lucide-react";
import { useI18n, type Locale } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { openCookieBanner } from "@/components/site/CookieConsentBanner";

const AVAILABLE_LOCALES: Locale[] = ["fr", "en", "ln"];

export function SiteFooter() {
  const { t, locale, setLocale } = useI18n();
  const year = 2025;
  return (
    <footer className="border-t border-white/15 bg-[linear-gradient(135deg,#1B2CE3_0%,#000079_100%)] text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-12 md:py-14">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="EmploiPlus Group"
              className="h-9 w-9 rounded-lg object-cover shadow-brand"
            />
            <div className="leading-tight text-white">
              <div className="font-display font-bold text-base">EmploiPlus</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">Group</div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4 text-sm font-medium text-white/65">Navigation</div>
          <ul className="space-y-3 text-sm text-white">
            <li>
              <Link to="/about" className="transition-colors hover:text-white/70">{t("nav.about")}</Link>
            </li>
            <li>
              <Link to="/services" className="transition-colors hover:text-white/70">{t("nav.services")}</Link>
            </li>
            <li>
              <a href="https://support.emploiplus-group.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/70">
                Support
              </a>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-white/70">{t("nav.contact")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 text-sm font-medium text-white/65">Contact</div>
          <ul className="space-y-3 text-sm text-white">
            <li>
              <a href="tel:+242067311033" className="transition-colors hover:text-white/70">+242 0673 11033</a>
            </li>
            <li>
              <a href="mailto:contact@emploiplus-group.com" className="transition-colors hover:text-white/70">
                contact@emploiplus-group.com
              </a>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-white/70">{t("nav.contact")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 text-sm font-medium text-white/65">Adresse</div>
          <address className="not-italic text-sm leading-relaxed text-white">
            Brazzaville<br />
            République du Congo
          </address>
          <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
            <SelectTrigger
              aria-label={t(`lang.${locale}`)}
              className="mt-5 w-12 rounded-md border-white/30 bg-white/10 p-2 text-white shadow-sm hover:bg-white/20"
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
      </div>
      <div className="border-t border-white/20">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-5 text-xs text-white/65 sm:flex-row sm:items-center">
          <div>
            © {year} EmploiPlus Group. {t("footer.rights")}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/politique-de-confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
            <Link to="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
            <button type="button" onClick={() => openCookieBanner()} className="transition-colors hover:text-white">
              Cookies
            </button>
            <a href="https://www.linkedin.com/company/emploiplus-consulting/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white transition-colors hover:text-white/70">
              <Linkedin className="size-5" />
            </a>
            <a href="https://www.instagram.com/emploiplus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white transition-colors hover:text-white/70">
              <Instagram className="size-5" />
            </a>
            <a href="https://www.facebook.com/EmploiplusConsulting" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white transition-colors hover:text-white/70">
              <Facebook className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
