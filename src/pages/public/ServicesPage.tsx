import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/page/SectionHeader";
import { SERVICES } from "@/lib/constants";

export function ServicesPage() {
  const { t } = useI18n();

  return (
    <>
      {usePageSEO({
        title: t('services.title'),
        description: t('services.subtitle'),
        keywords: "services, offres emploi, développement web, stratégie média, branding employeur",
        canonical: `${BASE_URL}/services`,
        breadcrumbs: [
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('services.title'), url: `${BASE_URL}/services` },
        ],
      })}
      <SectionHeader title={t('services.title')} subtitle={t('services.subtitle')} />
      <section className="container-page pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {SERVICES.map((item, i) => (
              <article key={item.slug} className="rounded-3xl transform transition-transform hover:-translate-y-1 hover:shadow-xl fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="p-[1px] rounded-3xl gradient-brand h-full">
                  <div className="rounded-3xl bg-card p-6 h-full flex flex-col justify-between gap-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">{t(item.titleKey)}</h2>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{t(item.descriptionKey)}</p>
                    </div>
                    <div className="grid gap-3">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link to={`/services/${item.slug}`}>{t('services.cardAction.details')}</Link>
                      </Button>
                      <Button asChild size="sm" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                        <Link to={`/contact?subject=${encodeURIComponent(`${t('services.requestQuote.subjectPrefix')} - ${t(item.titleKey)}`)}`}>{t('services.cardAction.quote')}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">{t('services.requestQuote.title')}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t('services.requestQuote.description')}</p>
          <Button asChild size="lg" className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to={`/contact?subject=${encodeURIComponent(t('services.requestQuote.subjectPrefix'))}`}>{t('services.requestQuote.button')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
