import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";

export function FAQPage() {
  const { t } = useI18n();

  return (
    <>
      <SEO
        title={t("faq.title")}
        description={t("faq.subtitle")}
        canonical={`${BASE_URL}/faq`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("faq.title"), url: `${BASE_URL}/faq` },
        ]}
      />

      <section className="container-page pb-20 md:pb-28">
        <div className="mx-auto max-w-5xl space-y-10">
          <header className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">
              FAQ
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground">
              {t("faq.title")}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {t("faq.subtitle")}
            </p>
          </header>

          <article className="space-y-8">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.services.title")}
              </h2>
              <p className="mt-4 text-foreground/90 leading-7">
                {t("faq.services.answer")}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.apply.title")}
              </h2>
              <p className="mt-4 text-foreground/90 leading-7">
                {t("faq.apply.answer")}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.createAccount.title")}
              </h2>
              <p className="mt-4 text-foreground/90 leading-7">
                {t("faq.createAccount.answer")}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.forgotPassword.title")}
              </h2>
              <p className="mt-4 text-foreground/90 leading-7">
                {t("faq.forgotPassword.answer")}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.more.title")}
              </h2>
              <div className="mt-4 space-y-4 text-foreground/90 leading-7">
                <p>{t("faq.more.answer1")}</p>
                <p>{t("faq.more.answer2")}</p>
                <p>{t("faq.more.answer3")}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("faq.stillNeedHelp.title")}
              </h2>
              <p className="mt-4 text-foreground/90 leading-7">
                {t("faq.stillNeedHelp.description")}
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
              >
                {t("faq.stillNeedHelp.button")}
              </Link>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
