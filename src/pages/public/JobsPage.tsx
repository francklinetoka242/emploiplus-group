import React from "react";
import { Link } from "react-router-dom";
import { BadgeDollarSign, BriefcaseBusiness, Building2, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ShareButtons } from "@/components/site/ShareButtons";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { usePublishedJobOffers } from "@/hooks/usePublishedOffers";

export function JobsPage() {
  const { t } = useI18n();
  const { offers, loading } = usePublishedJobOffers(100);
  const [query, setQuery] = React.useState("");
  const [companyQuery, setCompanyQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [contractType, setContractType] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

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

  React.useEffect(() => {
    setPage(1);
  }, [q, companyFilter, lq, contractType]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedOffers = filteredOffers.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <SEO
        title={t("jobs.page.title")}
        description={t("jobs.page.description")}
        keywords="offres d'emploi, opportunités, recrutement, emploi Congo"
        canonical={`${BASE_URL}/jobs`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("jobs.page.title"), url: `${BASE_URL}/jobs` },
        ]}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <div className="rounded-3xl p-[1px] gradient-brand">
              <div className="rounded-3xl bg-card p-6 md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-display text-lg font-bold text-foreground">{t("jobs.search.title")}</h3>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/5"
                    >
                      {filtersOpen ? "Masquer les filtres" : "Afficher les filtres"}
                    </button>
                  </div>
                  {filtersOpen && (
                    <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">{t("jobs.search.keywords")}</label>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={t("jobs.search.keywords.placeholder")}
                          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">{t("jobs.search.company")}</label>
                        <input
                          value={companyQuery}
                          onChange={(e) => setCompanyQuery(e.target.value)}
                          placeholder={t("jobs.search.company.placeholder")}
                          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">{t("jobs.search.location")}</label>
                        <input
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          placeholder={t("jobs.search.location.placeholder")}
                          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">{t("jobs.search.contractType")}</label>
                        <select
                          value={contractType}
                          onChange={(e) => setContractType(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">{t("jobs.search.all")}</option>
                          <option value="cdi">{t("jobs.search.type.cdi")}</option>
                          <option value="cdd">{t("jobs.search.type.cdd")}</option>
                          <option value="stage">{t("jobs.search.type.stage")}</option>
                          <option value="freelance">{t("jobs.search.type.freelance")}</option>
                          <option value="temps_partiel">{t("jobs.search.type.temps_partiel")}</option>
                          <option value="interim">{t("jobs.search.type.interim")}</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-2">
                        <button type="button" onClick={() => { setQuery(""); setCompanyQuery(""); setLocationQuery(""); setContractType(""); }} className="rounded-md px-4 py-2 border border-border text-sm text-foreground hover:bg-primary/5">{t("jobs.search.reset")}</button>
                        <button type="submit" className="rounded-md px-4 py-2 bg-brand text-brand-foreground font-semibold">{t("jobs.search.submit")}</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article key={index} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse" />
                ))
              ) : filteredOffers.length > 0 ? (
                <>
                  {paginatedOffers.map((job, i) => {
                  const location = [job.location_city, job.location_country].filter(Boolean).join(", ") || t("jobs.location.remote");
                  const previewText = (job.description || job.requirements || "")
                    .replace(/\s+/g, " ")
                    .trim();
                  const contractLabel = getContractLabel(job.contract_type);
                  const tags = (job.tags || []).filter(Boolean).slice(0, 3);
                  const deadlineValue = job.deadline || job.expires_at || null;
                  const isExpired = Boolean(deadlineValue && new Date(deadlineValue).getTime() < Date.now());
                  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/jobs/${job.slug}` : `${BASE_URL}/jobs/${job.slug}`;
                  const shareText = `Offre d'emploi : ${job.title} chez ${job.company}\n\n${previewText.slice(0, 220)}\n\nOffre partagée depuis https://emploiplus-group.com`;
                  return (
                    <article key={job.id} className={`relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev group-hover:border-brand/60 ${isExpired ? "opacity-70 grayscale-[0.2]" : ""}`} style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand via-brand/70 to-transparent" />
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand/80">
                            <Building2 className="size-3.5" />
                            <span>{job.company}</span>
                          </div>
                          <h3 className="mt-3 font-display text-xl font-bold text-foreground">{job.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {contractLabel ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                              <BriefcaseBusiness className="size-3.5" />
                              {contractLabel}
                            </span>
                          ) : null}
                          <ShareButtons
                            url={shareUrl}
                            text={shareText}
                            shareData={{
                              company: job.company,
                              title: job.title,
                              contractType: contractLabel,
                              location,
                              salary: job.salary,
                              description: previewText,
                              deadline: deadlineValue ? formatDate(deadlineValue) || undefined : undefined,
                              email: job.application_email || undefined,
                            }}
                            variant="compact"
                            className="shrink-0"
                          />
                        </div>
                      </div>

                      <Link to={`/jobs/${job.slug}`} className="block">
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80">
                            <MapPin className="size-4 shrink-0 text-brand" />
                            <span>{location}</span>
                          </div>
                          {job.salary ? (
                            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80">
                              <BadgeDollarSign className="size-4 shrink-0 text-brand" />
                              <span>{job.salary}</span>
                            </div>
                          ) : null}
                          {deadlineValue ? (
                            <div className={`flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80 ${isExpired ? "text-muted-foreground" : ""} sm:col-span-2`}>
                              <CalendarDays className="size-4 shrink-0 text-brand" />
                              <span>{t("admin.jobs.field.deadline")}: {formatDate(deadlineValue)}{isExpired ? " • Expirée" : ""}</span>
                            </div>
                          ) : null}
                        </div>

                        {previewText ? (
                          <p className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-foreground/80 leading-relaxed">
                            {previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText}
                          </p>
                        ) : null}

                        {tags.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground">
                                <Sparkles className="size-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </Link>
                    </article>
                  );
                  })}
                  {totalPages > 1 ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Page {safePage} sur {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPage((value) => Math.max(1, value - 1))}
                          disabled={safePage === 1}
                          className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Précédent
                        </button>
                        <button
                          type="button"
                          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                          disabled={safePage === totalPages}
                          className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">{t("jobs.none")}</div>
              )}
            </div>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-8 shadow-soft fade-up" style={{ animationDelay: "240ms" }}>
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{t("jobs.quickAccess.title")}</div>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              {t("jobs.quickAccess.description")}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea952]">
                {t("jobs.quickAccess.channel1")}
              </a>
              <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea952]">
                {t("jobs.quickAccess.channel2")}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
