import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { ShareButtons } from "@/components/site/ShareButtons";
import { JobCard } from "@/features/jobs/components";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { useJobs } from "@/features/jobs/hooks";

export function JobsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { offers, loading } = useJobs({ status: "published", limit: 100 });
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
      prestation_de_services: "Prestation de services",
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
    const hay =
      `${job.title || ""} ${job.company || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
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
            <div
              className="self-start w-full"
              style={{ position: "sticky", top: 0, zIndex: 30, alignSelf: "flex-start" }}
            >
              <div className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-lg shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {t("jobs.search.title")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/5"
                  >
                    {filtersOpen ? "Masquer les filtres" : "Afficher les filtres"}
                  </button>
                </div>
                {filtersOpen && (
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]"
                  >
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">
                        {t("jobs.search.keywords")}
                      </label>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("jobs.search.keywords.placeholder")}
                        className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">
                        {t("jobs.search.company")}
                      </label>
                      <input
                        value={companyQuery}
                        onChange={(e) => setCompanyQuery(e.target.value)}
                        placeholder={t("jobs.search.company.placeholder")}
                        className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">
                        {t("jobs.search.location")}
                      </label>
                      <input
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder={t("jobs.search.location.placeholder")}
                        className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">
                        {t("jobs.search.contractType")}
                      </label>
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
                        <option value="prestation_de_services">{t("jobs.search.type.prestation_de_services")}</option>
                        <option value="temps_partiel">{t("jobs.search.type.temps_partiel")}</option>
                        <option value="interim">{t("jobs.search.type.interim")}</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setCompanyQuery("");
                          setLocationQuery("");
                          setContractType("");
                        }}
                        className="rounded-md px-4 py-2 border border-border text-sm text-foreground hover:bg-primary/5"
                      >
                        {t("jobs.search.reset")}
                      </button>
                      <button
                        type="submit"
                        className="rounded-md px-4 py-2 bg-brand text-brand-foreground font-semibold"
                      >
                        {t("jobs.search.submit")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article
                    key={index}
                    className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse"
                  />
                ))
              ) : filteredOffers.length > 0 ? (
                <>
                  {paginatedOffers.map((job, i) => {
                    const location =
                      [job.location_city, job.location_country].filter(Boolean).join(", ") ||
                      t("jobs.location.remote");
                    const previewText = (job.description || job.requirements || "")
                      .replace(/\s+/g, " ")
                      .trim();
                    const contractLabel = getContractLabel(job.contract_type);
                    const tags = (job.tags || []).filter(Boolean).slice(0, 3);
                    const deadlineValue = job.deadline || null;
                    const isExpired = Boolean(
                      deadlineValue && new Date(deadlineValue).getTime() < Date.now(),
                    );
                    const shareUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/jobs/${job.slug}`
                        : `${BASE_URL}/jobs/${job.slug}`;
                    const shareText = `Offre d'emploi : ${job.title} chez ${job.company}\n\n${previewText.slice(0, 220)}\n\nOffre partagée depuis https://emploiplus-group.com`;
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        location={location}
                        previewText={previewText}
                        contractLabel={contractLabel}
                        tags={tags}
                        deadlineValue={deadlineValue}
                        isExpired={isExpired}
                        t={t}
                        index={i}
                        onApplyClick={() => navigate(`/candidate/jobs/${job.slug}/apply`)}
                      />
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
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
                  {t("jobs.none")}
                </div>
              )}
            </div>
          </div>
          <aside
            className="rounded-3xl border border-border bg-card p-8 shadow-soft fade-up self-start lg:sticky lg:top-24 lg:z-20"
            style={{ animationDelay: "240ms" }}
          >
            <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              {t("jobs.quickAccess.title")}
            </div>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              {t("jobs.quickAccess.description")}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea952]"
              >
                {t("jobs.quickAccess.channel1")}
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea952]"
              >
                {t("jobs.quickAccess.channel2")}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
