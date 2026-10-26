import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { getActiveOffersCount } from "@/features/jobs/api/activeOffersApi";
import { useI18n } from "@/i18n";

interface HeroLinksProps {
  isEcoMode: boolean;
}

export function HeroLinks({ isEcoMode }: HeroLinksProps) {
  const { t } = useI18n();
  const [activeOffersCount, setActiveOffersCount] = useState<number | null>(null);
  const linkColor = isEcoMode ? "text-primary" : "text-white";

  useEffect(() => {
    let mounted = true;
    void getActiveOffersCount()
      .then((count) => {
        if (mounted) setActiveOffersCount(count);
      })
      .catch((error: unknown) => {
        console.error("Impossible de charger le nombre d’offres actives", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mt-5 space-y-3">
      <nav aria-label={t("home.hero.links.label")} className="flex flex-wrap gap-x-6 gap-y-2">
        <Link
          to="/jobs"
          className={`inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${linkColor}`}
        >
          {t("home.hero.link.jobs")}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link
          to="/services"
          className={`inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${linkColor}`}
        >
          {t("home.hero.link.business")}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </nav>
      {activeOffersCount !== null && (
        <p className={`text-sm ${isEcoMode ? "text-muted-foreground" : "text-white/80"}`}>
          <Link
            to="/jobs"
            className={`underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${linkColor}`}
          >
            {t(
              activeOffersCount === 1 ? "home.hero.offers.singular" : "home.hero.offers.plural",
            ).replace("{count}", String(activeOffersCount))}
          </Link>
        </p>
      )}
    </div>
  );
}
