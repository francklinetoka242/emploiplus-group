import { Link } from "react-router-dom";
import { Facebook, Linkedin, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="EmploiPlus Group" className="h-9 w-9 rounded-lg object-cover shadow-brand" />
            <div className="font-display text-lg font-bold">EmploiPlus-Group</div>
          </div>
          <div className="text-sm text-muted-foreground">{t("footer.tagline")}</div>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">{t("footer.links.services")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">{t("nav.services")}</Link></li>
            <li><Link to="/jobs" className="hover:text-foreground">{t("nav.jobs")}</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">{t("nav.blog")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">{t("footer.links.company")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">{t("nav.contact")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">{t('footer.contact.title')}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t('footer.contact.phoneLabel')}: <a href="tel:+242067311033" className="font-semibold hover:underline">{t('footer.contact.phoneValue')}</a></li>
            <li className="flex flex-col gap-2">
              <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-2"><MessageSquare className="size-4" />{t('footer.contact.whatsapp1')}</a>
              <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-2"><MessageSquare className="size-4" />{t('footer.contact.whatsapp2')}</a>
            </li>
            <li className="flex items-center gap-3 mt-2">
              <a href="https://www.facebook.com/EmploiplusConsulting" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><Facebook className="size-4" /></a>
              <a href="https://www.linkedin.com/company/emploiplus-consulting/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="size-4" /></a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <div>© {year} EmploiPlus Group. {t("footer.rights")}</div>
          <div>{t("footer.tagline")}</div>
        </div>
      </div>
    </footer>
  );
}
