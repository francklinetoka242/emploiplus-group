import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { usePublishedJobOffers } from "@/hooks/usePublishedOffers";

export function JobsPage() {
  const { t } = useI18n();
  const { offers, loading } = usePublishedJobOffers(12);
  const [query, setQuery] = React.useState("");
  const [companyQuery, setCompanyQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [contractType, setContractType] = React.useState("");

  const q = query.trim().toLowerCase();
  const companyFilter = companyQuery.trim().toLowerCase();
  const lq = locationQuery.trim().toLowerCase();
  const getContractLabel = (contractType?: string | null) => {
    if (!contractType) return null;
    const translated = t(`jobs.contract.${contractType}`);
    if (translated && translated !== `jobs.contract.${contractType}`) return translated;
    const fallbackMap: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Stage",
      freelance: "Freelance",
      consultance: "Consultance",
      temps_partiel: "Temps partiel",
      interim: "Intérim",
    };
    return fallbackMap[contractType] || contractType;
  };
  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fr-FR");
  };
  const filteredOffers = offers.filter((job) => {
    const hay = `${job.title || ""} ${job.company || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (companyFilter && !job.company?.toLowerCase().includes(companyFilter)) return false;
    if (lq) {
      const location = `${job.location_city || ""} ${job.location_country || ""}`.toLowerCase();
      if (!location.includes(lq)) return false;
    }
    if (contractType && job.contract_type !== contractType) return false;
    return true;
  });

  return (
    <>
      <SEO
        title={t('jobs.page.title')}
        description={t('jobs.page.description')}
        keywords="offres d'emploi, opportunités, recrutement, emploi Congo"
        canonical={`${BASE_URL}/jobs`}
        robots="index,follow"
        breadcrumbs={[
          { name: t('home.hero.title'), url: `${BASE_URL}/` },
          { name: t('jobs.page.title'), url: `${BASE_URL}/jobs` },
        ]}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            {/* Search form (enterprise style) */}
            <div className="rounded-3xl p-[1px] gradient-brand">
              <div className="rounded-3xl bg-card p-6 md:p-8">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{t('jobs.search.title')}</h3>
                <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 md:grid-cols-[1fr_1fr]">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.keywords')}</label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('jobs.search.keywords.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.company')}</label>
                    <input
                      value={companyQuery}
                      onChange={(e) => setCompanyQuery(e.target.value)}
                      placeholder={t('jobs.search.company.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.location')}</label>
                    <input
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder={t('jobs.search.location.placeholder')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">{t('jobs.search.contractType')}</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="">{t('jobs.search.all')}</option>
                      <option value="cdi">{t('jobs.search.type.cdi')}</option>
                      <option value="cdd">{t('jobs.search.type.cdd')}</option>
                      <option value="stage">{t('jobs.search.type.stage')}</option>
                      <option value="freelance">{t('jobs.search.type.freelance')}</option>
                      <option value="temps_partiel">{t('jobs.search.type.temps_partiel')}</option>
                      <option value="interim">{t('jobs.search.type.interim')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-2">
                    <button type="button" onClick={() => { setQuery(''); setCompanyQuery(''); setLocationQuery(''); setContractType(''); }} className="rounded-md px-4 py-2 border border-border text-sm text-foreground hover:bg-primary/5">{t('jobs.search.reset')}</button>
                    <button type="submit" className="rounded-md px-4 py-2 bg-brand text-brand-foreground font-semibold">{t('jobs.search.submit')}</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
                ))
              ) : filteredOffers.length > 0 ? (
                filteredOffers.map((job, i) => {
                  const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || t('jobs.location.remote');
                  const previewText = (job.description || job.requirements || "")
                    .replace(/\s+/g, " ")
                    .trim();
                  const contractLabel = getContractLabel(job.contract_type);
                  return (
                    <Link key={job.id} to={`/jobs/${job.slug}`} className="group">
                      <article className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elev transition-all fade-up group-hover:border-brand" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company}</div>
                        <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{location}</span>
                          {contractLabel ? <span className="rounded-full border border-border px-2 py-1 text-xs">{contractLabel}</span> : null}
                        </div>
                        {previewText ? <p className="mt-4 text-sm text-foreground/80 leading-relaxed line-clamp-3">{previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText}</p> : null}
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {job.salary ? <span className="rounded-full border border-border px-2 py-1">{t("admin.jobs.field.salary")}: {job.salary}</span> : null}
                          {job.deadline ? <span className="rounded-full border border-border px-2 py-1">{t("admin.jobs.field.deadline")}: {formatDate(job.deadline)}</span> : null}
                        </div>
                      </article>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t('jobs.none')}</div>
              )}
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft fade-up" style={{ animationDelay: '240ms' }}>
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{t('jobs.quickAccess.title')}</div>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              {t('jobs.quickAccess.description')}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                {t('jobs.quickAccess.channel1')}
              </a>
              <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-brand/50 text-sm font-semibold text-brand hover:bg-brand/60">
                {t('jobs.quickAccess.channel2')}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
