import { useEffect, useState } from "react";
import { Cookie, ShieldCheck, BarChart3, X } from "lucide-react";

interface CookiePreferences {
  supabase: boolean;
  analytics: boolean;
}

const STORAGE_KEY = "emploiplus-cookie-consent";

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      supabase: parsed.supabase ?? true,
      analytics: parsed.analytics ?? false,
    };
  } catch {
    return null;
  }
}

function persistPreferences(preferences: CookiePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function openCookieBanner() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("open-cookie-consent"));
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    supabase: true,
    analytics: false,
  });

  useEffect(() => {
    const stored = getStoredPreferences();
    if (stored) {
      setPreferences(stored);
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOpenCookieBanner = () => {
      const stored = getStoredPreferences();
      if (stored) {
        setPreferences(stored);
      }
      setIsModalOpen(true);
      setIsVisible(true);
    };

    window.addEventListener("open-cookie-consent", handleOpenCookieBanner);

    return () => {
      window.removeEventListener("open-cookie-consent", handleOpenCookieBanner);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !preferences.analytics) {
      return;
    }

    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) {
      return;
    }

    if (document.getElementById("ga-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "ga-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement("script");
    inlineScript.id = "ga-inline";
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(inlineScript);
  }, [preferences.analytics]);

  const handleAcceptAll = () => {
    const nextPreferences = { supabase: true, analytics: true };
    setPreferences(nextPreferences);
    persistPreferences(nextPreferences);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const nextPreferences = { supabase: true, analytics: false };
    setPreferences(nextPreferences);
    persistPreferences(nextPreferences);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    persistPreferences(preferences);
    setIsModalOpen(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Cookie className="h-4 w-4" />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience, sécuriser l’accès et analyser l’usage du site.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand/90"
            >
              Tout accepter
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Tout refuser
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full px-3 py-2 text-sm font-medium text-brand underline-offset-4 transition hover:text-brand/80 hover:underline"
            >
              Personnaliser
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Cookies</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Personnaliser votre expérience</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choisissez les catégories de cookies que vous souhaitez autoriser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Fermer la personnalisation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cookies techniques & session</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Indispensables pour l’espace candidat, l’authentification Supabase et la continuité de votre session.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="relative h-6 w-11 rounded-full bg-brand/80 opacity-90"
                    aria-label="Cookies techniques activés"
                  >
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cookies statistiques</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Utilisés pour mesurer les performances du site et améliorer l’expérience globale.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`relative h-6 w-11 rounded-full transition ${preferences.analytics ? "bg-brand" : "bg-muted-foreground/30"}`}
                    aria-label="Activer les cookies statistiques"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${preferences.analytics ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand/90"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
