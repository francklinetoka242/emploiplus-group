import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
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
          <img src="/Logo.png" alt="EmploiPlus Group" className="h-9 w-9 rounded-lg object-cover shadow-brand" />
          <div className="leading-tight hidden sm:block">
            <div className="font-display font-bold text-foreground">EmploiPlus</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Group</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground rounded-md bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border border-border hover:bg-accent transition-colors"
            aria-label="Change language"
          >
            <Globe className="size-3.5" />
            {locale}
          </button>
          <Button asChild size="sm" className="hidden md:inline-flex bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
            <Link to="/jobs">{t("cta.viewJobs")}</Link>
          </Button>
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
            <Button asChild className="mt-2 bg-brand hover:bg-brand/90 text-brand-foreground">
              <Link to="/jobs" onClick={() => setOpen(false)}>{t("cta.viewJobs")}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
