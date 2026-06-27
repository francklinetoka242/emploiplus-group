import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { useJobOfferBySlug } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";

function NotFoundPage() {
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

export function JobOfferDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const { job, loading } = useJobOfferBySlug(slug);

  if (loading) {
    return (
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <p className="text-muted-foreground">{t('jobs.loading')}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return <NotFoundPage />;
  }

  const title = job.meta_title || `${job.title} | ${job.company}`;
  const description = job.meta_description || job.description?.slice(0, 160) || t('jobs.page.description');
  const ogImage = job.og_image || job.cover_image || `${BASE_URL}/og-default.svg`;
  const canonical = `${BASE_URL}/jobs/${job.slug}`;
  const location = [job.location_city, job.location_country].filter(Boolean).join(', ') || t('jobs.location.remote');

  return (
    <>
      {usePageSEO({
        title,
        description,
        canonical,
        ogImage,
        ogType: 'article',
        publishedTime: job.publish_at || undefined,
        modifiedTime: job.updated_at || undefined,
        breadcrumbs: [
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('jobs.page.title'), url: `${BASE_URL}/jobs` },
          { name: job.title, url: canonical },
        ],
        structuredData: {
          '@type': 'JobPosting',
          title: job.title,
          description: job.description,
          datePosted: job.publish_at || undefined,
          validThrough: job.expires_at || undefined,
          employmentType: job.contract_type,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            sameAs: BASE_URL,
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location_city || undefined,
              addressCountry: job.location_country || undefined,
            },
          },
        },
      })}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="flex flex-col gap-3">
                <Link to="/jobs" className="text-sm text-brand hover:underline">← {t('jobs.backToList')}</Link>
                <h1 className="font-display text-4xl font-bold text-foreground">{job.title}</h1>
                <p className="text-sm text-muted-foreground">{job.company} · {location} · {t(`jobs.contract.${job.contract_type}`)}</p>
                <p className="mt-4 text-foreground/90 leading-relaxed">{description}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{t('jobs.detail.descriptionTitle')}</h2>
                <p className="mt-4 text-foreground/90 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
              {job.requirements ? (
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{t('jobs.detail.requirementsTitle')}</h3>
                  <p className="mt-4 text-foreground/90 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t('jobs.detail.overview')}</p>
              <div className="mt-6 space-y-3 text-sm text-foreground/90">
                <div><span className="font-semibold">{t('jobs.detail.company')} :</span> {job.company}</div>
                <div><span className="font-semibold">{t('jobs.detail.location')} :</span> {location}</div>
                <div><span className="font-semibold">{t('jobs.detail.contractType')} :</span> {t(`jobs.contract.${job.contract_type}`)}</div>
                {job.publish_at ? <div><span className="font-semibold">{t('jobs.detail.publishedAt')} :</span> {new Date(job.publish_at).toLocaleDateString()}</div> : null}
                {job.expires_at ? <div><span className="font-semibold">{t('jobs.detail.expiresAt')} :</span> {new Date(job.expires_at).toLocaleDateString()}</div> : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-4">
              <h3 className="font-display text-xl font-semibold text-foreground">{t('jobs.detail.applyTitle')}</h3>
              {job.application_email ? (
                <a href={`mailto:${job.application_email}`} className="inline-flex w-full items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">{t('jobs.detail.applyByEmail')}</a>
              ) : null}
              {job.application_whatsapp ? (
                <a href={`https://wa.me/${job.application_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/5">{t('jobs.detail.applyByWhatsapp')}</a>
              ) : null}
              {job.external_link ? (
                <a href={job.external_link} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/5">{t('jobs.detail.applyExternal')}</a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
