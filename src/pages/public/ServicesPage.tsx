import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/constants/services";
import hubImage from "@/assets/IMG_Page-Services/2147626421.jpg";
import rhImage from "@/assets/IMG_Page-Services/groupe-hommes-affaires-afro-americains_926199-3049393.jpg";
import conseilImage from "@/assets/IMG_Page-Services/ingenieurs-equipe-discutant-dans-salle-serveurs-train-faire-du-brainstorming_482257-118150(1).jpg";
import serviceImage from "@/assets/IMG_Page-Services/employee-energie-solaire-fournissant-soutien-distance-dans-usine-panneaux-solaires_482257-125116(1).jpg";

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
      <SEO
        title={t("services.title")}
        description={t("services.subtitle")}
        keywords="services, offres emploi, développement web, stratégie média, branding employeur"
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("services.title"), url: `${BASE_URL}/services` },
        ]}
      />
      <section className="container-page pb-12 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {SERVICES.map((item, i) => {
              const detailPath =
                item.slug === "hub-emploi-recrutement"
                  ? `/services/${item.slug}/landing`
                  : `/services/${item.slug}`;
              return (
                <article
                  key={item.slug}
                  className="group overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-background to-brand/5">
                    <img
                      src={SERVICE_IMAGES[item.slug as keyof typeof SERVICE_IMAGES]}
                      alt={`Illustration ${t(item.titleKey)}`}
                      className="h-52 w-full rounded-t-[28px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    {item.slug === "hub-emploi-recrutement" && (
                      <div className="absolute inset-0 flex items-end justify-end p-4">
                        <Button
                          asChild
                          size="sm"
                          className="bg-white/90 text-brand shadow-sm hover:bg-white"
                        >
                          <Link to={detailPath} className="text-sm font-medium">
                            En savoir plus
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex h-full flex-col justify-between gap-6 p-6">
                    <div>
                      <div className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                        Pôle de services
                      </div>
                      <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                        {t(item.titleKey)}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {t(item.descriptionKey)}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        asChild
                        size="default"
                        className="w-full border border-brand/30 bg-white text-brand shadow-sm hover:bg-brand hover:text-brand-foreground"
                      >
                        <Link to={detailPath}>{t("services.cardAction.details")}</Link>
                      </Button>
                      <Button
                        asChild
                        size="default"
                        className="w-full bg-brand text-brand-foreground shadow-sm hover:bg-brand/90"
                      >
                        <Link
                          to={`/contact?subject=${encodeURIComponent(`${t("services.requestQuote.subjectPrefix")} - ${t(item.titleKey)}`)}`}
                        >
                          {t("services.cardAction.quote")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">
            {t("services.requestQuote.title")}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t("services.requestQuote.description")}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link
              to={`/contact?subject=${encodeURIComponent(t("services.requestQuote.subjectPrefix"))}`}
            >
              {t("services.requestQuote.button")}
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
