import React from "react";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import francklinImage from "@/assets/Equipe_Experte/Ing_Francklin_ETOKA.jpeg";
import destineeImage from "@/assets/Equipe_Experte/Ing_Destinée_MOUISSOU.jpeg";
import claudeImage from "@/assets/Equipe_Experte/Claude_OMVOULET.jpeg";

export function AboutPage() {
  const { t } = useI18n();

  const values = [
    { icon: '🤝', title: t('about.values.item1.title'), description: t('about.values.item1.description') },
    { icon: '⚙️', title: t('about.values.item2.title'), description: t('about.values.item2.description') },
    { icon: '📈', title: t('about.values.item3.title'), description: t('about.values.item3.description') },
  ];

  const teamMembers = [
    {
      name: t('about.team.member1.name'),
      role: t('about.team.member1.role'),
      image: francklinImage,
    },
    {
      name: t('about.team.member2.name'),
      role: t('about.team.member2.role'),
      image: destineeImage,
    },
    {
      name: t('about.team.member3.name'),
      role: t('about.team.member3.role'),
      image: claudeImage,
    },
  ];

  return (
    <>
      <SEO
        title={t('about.title')}
        description={t('about.subtitle')}
        canonical={`${BASE_URL}/about`}
        robots="index,follow"
        breadcrumbs={[
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('about.title'), url: `${BASE_URL}/about` },
        ]}
      />
      <section className="container-page py-16 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 text-center">
          <div className="max-w-3xl space-y-4">
            <h2 className="font-display text-3xl font-bold text-foreground">{t('about.mission.title')}</h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="w-full">
            <h3 className="font-display text-2xl font-bold text-foreground">{t('about.team.title')}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('about.team.subtitle')}</p>
            <div className="mt-8 grid gap-8 md:grid-cols-3 md:items-start">
              <article className="flex flex-col items-center rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-brand/20 bg-muted/20 shadow-lg">
                  <img src={teamMembers[0].image} alt={teamMembers[0].name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5 text-center">
                  <h4 className="font-display text-xl font-semibold text-foreground">{teamMembers[0].name}</h4>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-brand">{teamMembers[0].role}</p>
                </div>
              </article>
              <article className="flex flex-col items-center rounded-3xl border border-border bg-card p-6 shadow-soft md:translate-y-4">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-brand/20 bg-muted/20 shadow-lg">
                  <img src={teamMembers[1].image} alt={teamMembers[1].name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5 text-center">
                  <h4 className="font-display text-xl font-semibold text-foreground">{teamMembers[1].name}</h4>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-brand">{teamMembers[1].role}</p>
                </div>
              </article>
              <article className="flex flex-col items-center rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-brand/20 bg-muted/20 shadow-lg">
                  <img src={teamMembers[2].image} alt={teamMembers[2].name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5 text-center">
                  <h4 className="font-display text-xl font-semibold text-foreground">{teamMembers[2].name}</h4>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-brand">{teamMembers[2].role}</p>
                </div>
              </article>
            </div>
          </div>

          <div className="w-full">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">{t('about.values.title')}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {values.map((item) => (
                <div key={item.title} className="rounded-3xl border border-border bg-card p-6 text-left md:text-center">
                  <div className="text-3xl">{item.icon}</div>
                  <h4 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t('about.whyChooseUs.title')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">1200+</p>
                <p className="text-foreground/80">{t('about.stats.jobs')}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">1</p>
                <p className="text-foreground/80">{t('about.stats.companies')}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand mb-2">440+</p>
                <p className="text-foreground/80">{t('about.stats.readers')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
