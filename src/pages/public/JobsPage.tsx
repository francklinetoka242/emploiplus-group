import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
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
  const { offers, loading } = useJobs(appliedFilters);
  const [searchInput, setSearchInput] = React.useState("");
  const [companyInput, setCompanyInput] = React.useState("");
  const [contractTypeInput, setContractTypeInput] = React.useState("");
  const [appliedFilters, setAppliedFilters] = React.useState({
    status: "published" as const,
    limit: 100,
    query: "",
    company: "",
    contractType: "",
  });
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const q = appliedFilters.query.trim().toLowerCase();
  const companyFilter = appliedFilters.company.trim().toLowerCase();
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
    if (appliedFilters.contractType && job.contract_type !== appliedFilters.contractType) return false;
    return true;
  });

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    setAppliedFilters({
      status: "published",
      limit: 100,
      query: searchInput.trim(),
      company: companyInput.trim(),
      contractType: contractTypeInput,
    });
    setFiltersOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setCompanyInput("");
    setContractTypeInput("");
    setAppliedFilters({ status: "published", limit: 100, query: "", company: "", contractType: "" });
    setFiltersOpen(false);
    setPage(1);
  };

  React.useEffect(() => {
    setPage(1);
  }, [q, companyFilter, appliedFilters.contractType]);

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
            <div className="sticky top-20 z-40 mb-4 w-full border-0 bg-white" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm ring-1 ring-black/5" style={{ backgroundColor: "#FFFFFF" }}>
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-white p-3 sm:p-4" style={{ backgroundColor: "#FFFFFF" }}>
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchSubmit();
                        }
                      }}
                      placeholder="Rechercher un emploi..."
                      className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    aria-label="Rechercher"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-foreground transition hover:bg-primary/5"
                  >
                    <Search className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Afficher ou masquer les filtres"
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-foreground transition hover:bg-primary/5"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </form>

                <div
                  className={`overflow-hidden border-t border-border bg-white transition-all duration-200 ${
                    filtersOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div className="grid gap-3 bg-white p-3 sm:p-4" style={{ backgroundColor: "#FFFFFF" }}>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Type de contrat
                      </label>
                      <select
                        value={contractTypeInput}
                        onChange={(e) => setContractTypeInput(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="">Tous</option>
                        <option value="cdi">CDI</option>
                        <option value="cdd">CDD</option>
                        <option value="stage">Stage</option>
                        <option value="freelance">Freelance</option>
                        <option value="prestation_de_services">Prestation de services</option>
                        <option value="temps_partiel">Temps partiel</option>
                        <option value="interim">Intérim</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Entreprise
                      </label>
                      <input
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        placeholder="Nom de l'entreprise"
                        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Réinitialiser
                      </button>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Rechercher
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 grid gap-4 pt-2">
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
