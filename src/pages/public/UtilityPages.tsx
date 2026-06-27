import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/constants";

export function NotFoundPage() {
  return (
    <>
      {usePageSEO({
        title: "Page non trouvée - 404",
        description: "La page que vous recherchez n'existe pas ou a été supprimée.",
        canonical: `${BASE_URL}/404`,
        robots: "noindex,nofollow",
      })}
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">Page introuvable.</p>
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}

export function ServiceDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service = SERVICES.find((item) => item.slug === slug);

  if (!service) {
    return <NotFoundPage />;
  }

  return (
    <>
      {usePageSEO({
        title: `${t(service.titleKey)} | ${t('services.title')}`,
        description: t(service.detailKey),
        keywords: "services, détail, devis, EmploiPlus",
        canonical: `${BASE_URL}/services/${service.slug}`,
        breadcrumbs: [
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('services.title'), url: `${BASE_URL}/services` },
          { name: t(service.titleKey), url: `${BASE_URL}/services/${service.slug}` },
        ],
      })}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-brand font-semibold">{t('services.title')}</p>
              <h1 className="font-display text-4xl font-bold text-foreground">{t(service.titleKey)}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{t(service.descriptionKey)}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t('services.detail.overviewTitle')}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{t(service.detailKey)}</p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="text-xl font-semibold text-foreground">{t('services.requestQuote.title')}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{t('services.requestQuote.description')}</p>
              <Button asChild size="lg" className="mt-6 w-full bg-brand text-brand-foreground hover:bg-brand/90">
                <Link to={`/contact?subject=${encodeURIComponent(`${t('services.requestQuote.subjectPrefix')} - ${t(service.titleKey)}`)}`}>{t('services.requestQuote.button')}</Link>
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/services')}>
              {t('services.detail.back')}
            </Button>
          </aside>
        </div>
      </section>
    </>
  );
}
