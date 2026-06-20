import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg gradient-brand grid place-items-center text-brand-foreground font-display font-bold shadow-brand">
              E+
            </div>
            <div className="font-display text-lg font-bold">EmploiPlus Group</div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">{t("footer.tagline")}</p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">{t("nav.services")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">{t("nav.services")}</Link></li>
            <li><Link to="/jobs" className="hover:text-foreground">{t("nav.jobs")}</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">{t("nav.blog")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">{t("nav.contact")}</Link></li>
            <li><Link to="/auth" className="hover:text-foreground">{t("nav.admin")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <div>© {year} EmploiPlus Group. {t("footer.rights")}</div>
          <div>Tech Company · Job Media · Digital Services</div>
        </div>
      </div>
    </footer>
  );
}
