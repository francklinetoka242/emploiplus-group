import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { useCandidate } from "@/hooks/useCandidate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const { profile, loading } = useCandidate();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
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
    { to: "/faq", label: t("nav.faq") },
  ];
  const serviceLinks = [
    { to: "/services/mise-disposition-rh", label: "Mise à disposition" },
    { to: "/services/recrutement", label: "Recrutement" },
    { to: "/services/externalisation", label: "Externalisation" },
    { to: "/services/conseil-formation", label: "Formation & Conseil" },
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
          {links.map((l) =>
            l.to === "/services" ? (
              <div
                key={l.to}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-haspopup="menu"
                  onClick={() => setServicesOpen(true)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    servicesOpen
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {l.label}
                  <ChevronDown
                    className={cn("size-4 transition-transform", servicesOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                {servicesOpen ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-background p-2 shadow-lg"
                  >
                    {serviceLinks.map((service) => (
                      <NavLink
                        key={service.to}
                        to={service.to}
                        role="menuitem"
                        onClick={() => setServicesOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {service.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
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
                <Link to="/candidate/login">connexion</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand"
              >
                <Link to="/candidate/signup">S'inscrire</Link>
              </Button>
            </>
          )}
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
            {links.map((l) =>
              l.to === "/services" ? (
                <div key={l.to} className="rounded-md">
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-haspopup="menu"
                    onClick={() => setServicesOpen((isOpen) => !isOpen)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                  >
                    {l.label}
                    <ChevronDown
                      className={cn("size-4 transition-transform", servicesOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {servicesOpen ? (
                    <div role="menu" className="mt-1 space-y-1 border-l border-border pl-3">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.to}
                          to={service.to}
                          role="menuitem"
                          onClick={() => {
                            setServicesOpen(false);
                            setOpen(false);
                          }}
                          className="link link-animated block rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="link link-animated rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {l.label}
                </Link>
              ),
            )}
            {!loading && !profile && (
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="justify-center"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/candidate/login">connexion</Link>
                </Button>
                <Button
                  asChild
                  className="justify-center bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/candidate/signup">S'inscrire</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
