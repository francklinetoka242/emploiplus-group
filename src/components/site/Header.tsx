import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useI18n, type Locale } from "@/i18n";
import { useCandidate } from "@/hooks/useCandidate";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AVAILABLE_LOCALES: Locale[] = ["fr", "en", "ln", "es", "sw", "pt", "zh"];

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { profile, loading } = useCandidate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/jobs", label: t("nav.jobs") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-soft"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/Logo.png"
            alt="EmploiPlus Group"
            className="h-9 w-9 rounded-lg object-cover shadow-brand"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-display font-bold text-foreground">EmploiPlus</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Group
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !profile && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:inline-flex border-border/70 bg-background/80 px-3 text-sm font-medium hover:bg-accent"
              >
                <Link to="/candidate/login">Se connecter</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand"
              >
                <Link to="/candidate/signup">Créer un compte</Link>
              </Button>
            </>
          )}
          <div className="hidden sm:block">
            <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
              <SelectTrigger
                aria-label={t(`lang.${locale}`)}
                className="w-10 rounded-md border border-border bg-background p-2 text-foreground shadow-sm hover:bg-accent transition-colors"
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
          <button
            type="button"
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-page py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {!loading && !profile && (
              <div className="mt-2 flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-center" onClick={() => setOpen(false)}>
                  <Link to="/candidate/login">Se connecter</Link>
                </Button>
                <Button asChild className="justify-center bg-brand hover:bg-brand/90 text-brand-foreground" onClick={() => setOpen(false)}>
                  <Link to="/candidate/signup">Créer un compte</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
