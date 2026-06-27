import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/page/SectionHeader";
import { SERVICES } from "@/lib/constants";
import hubImage from "@/assets/services/hub-emploi.svg";
import rhImage from "@/assets/services/rh-gestion.svg";
import conseilImage from "@/assets/services/conseil-training.svg";
import serviceImage from "@/assets/services/service-opérationnel.svg";

const SERVICE_IMAGES = {
  "hub-emploi-recrutement": hubImage,
  "mise-disposition-rh": rhImage,
  "conseil-formation-transformation": conseilImage,
  "prestations-operationnelles": serviceImage,
};

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
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {SERVICES.map((item, i) => (
              <article
                key={item.slug}
                className="group overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-background to-brand/5 p-4">
                  <img
                    src={SERVICE_IMAGES[item.slug as keyof typeof SERVICE_IMAGES]}
                    alt={`Illustration ${t(item.titleKey)}`}
                    className="h-44 w-full rounded-[20px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex h-full flex-col justify-between gap-6 p-6">
                  <div>
                    <div className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                      Pôle de services
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{t(item.titleKey)}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(item.descriptionKey)}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button asChild size="default" className="w-full border border-brand/30 bg-white text-brand shadow-sm hover:bg-brand hover:text-brand-foreground">
                      <Link to={`/services/${item.slug}`}>{t('services.cardAction.details')}</Link>
                    </Button>
                    <Button asChild size="default" className="w-full bg-brand text-brand-foreground shadow-sm hover:bg-brand/90">
                      <Link to={`/contact?subject=${encodeURIComponent(`${t('services.requestQuote.subjectPrefix')} - ${t(item.titleKey)}`)}`}>{t('services.cardAction.quote')}</Link>
                    </Button>
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
