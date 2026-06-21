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
          <div className="text-sm text-muted-foreground">Tech Company · Job Media · Digital Services</div>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Services</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/jobs" className="hover:text-foreground">Emplois</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Tel: <a href="tel:+242067311033" className="font-semibold hover:underline">+242067311033</a></li>
            <li><a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-2"><MessageSquare className="size-4" />Chaîne WhatsApp</a></li>
            <li><a href="https://chat.whatsapp.com/JxHlaMwrzBA6gUopLg7C5s" target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-2"><MessageSquare className="size-4" />Groupe WhatsApp</a></li>
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
          <div>Tech Company · Job Media · Digital Services</div>
        </div>
      </div>
    </footer>
  );
}
