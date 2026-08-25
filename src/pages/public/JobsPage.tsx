import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleAlert,
  MapPin,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { ShareButtons } from "@/components/site/ShareButtons";
import { JobCard } from "@/features/jobs/components";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaginationNav } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { useJobs } from "@/features/jobs/hooks";
import {
  clearSearchHistory,
  deleteSavedJobSearch,
  deleteSearchHistoryItem,
  getSavedJobSearches,
  getSearchHistory,
  recordSearchHistory,
  saveJobSearch,
  updateSavedJobSearch,
} from "@/features/jobs/api";
import type { JobSearchCriteria, SavedJobSearch, SearchHistoryItem } from "@/features/jobs/types";
import {
  getSearchSuggestion,
  interpretNaturalLanguageSearch,
} from "@/features/jobs/search/naturalLanguageSearch";
import { isMobileApp } from "@/lib/isMobileApp";
import { centralAfricaCityGroups } from "@/data/locations";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidatePreferences as useCandidateJobPreferences } from "@/features/candidates/hooks/useCandidatePreferences";
import { getRecommendedJobs, type RecommendedJob } from "@/services/aiMatchingService";
import { hasAnalyzableCandidateCv, hasCandidateCv } from "@/features/candidates/api/cvApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function JobsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, roles } = useAuthContext();
  const { profile } = useCandidate();
  const isCandidateShell = Boolean(user && (roles.includes("candidate") || profile?.id));
  const canUseAdvancedFilters = Boolean(user);
  const { preferences } = useCandidateJobPreferences(profile?.id);
  const mobileApp = isMobileApp();
  const [searchInput, setSearchInput] = React.useState("");
  const [companyInput, setCompanyInput] = React.useState("");
  const [contractTypeInput, setContractTypeInput] = React.useState("");
  const [locationInput, setLocationInput] = React.useState("");
  const [domainInput, setDomainInput] = React.useState("");
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [advancedFiltersPromptOpen, setAdvancedFiltersPromptOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"date" | "relevance" | "salary-high" | "salary-low">(
    "date",
  );
  const [appliedFilters, setAppliedFilters] = React.useState<JobSearchCriteria>({
    status: "published" as const,
    limit: 100,
    query: "",
    company: "",
    location: "",
    contractType: "",
  });
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [loginPromptSlug, setLoginPromptSlug] = React.useState<string | null>(null);
  const [whatsappOpen, setWhatsappOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [recommendedJobs, setRecommendedJobs] = React.useState<RecommendedJob[]>([]);
  const [recommendedLoading, setRecommendedLoading] = React.useState(false);
  const [recommendedError, setRecommendedError] = React.useState<string | null>(null);
  const [recommendedPage, setRecommendedPage] = React.useState(1);
  const [hasMoreRecommendedJobs, setHasMoreRecommendedJobs] = React.useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<ReturnType<
    typeof interpretNaturalLanguageSearch
  > | null>(null);
  const [savedSearches, setSavedSearches] = React.useState<SavedJobSearch[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([]);
  const [searchesLoading, setSearchesLoading] = React.useState(false);
  const [nearbyOnly, setNearbyOnly] = React.useState(false);
  const [candidateToolsOpen, setCandidateToolsOpen] = React.useState(false);
  const recommendationContextRef = React.useRef<string | null>(null);
  const pageSize = 8;
  const recommendedPageSize = 3;

  const { offers, loading } = useJobs(appliedFilters);
  const searchSuggestions = React.useMemo(() => getSearchSuggestion(searchInput), [searchInput]);

  React.useEffect(() => {
    if (!isCandidateShell || !profile?.id) {
      setSavedSearches([]);
      setSearchHistory([]);
      return;
    }
    setSearchesLoading(true);
    void Promise.all([getSavedJobSearches(profile.id), getSearchHistory(profile.id)])
      .then(([saved, history]) => {
        setSavedSearches(saved);
        setSearchHistory(history);
      })
      .catch((error) => console.error("Impossible de charger les recherches candidat", error))
      .finally(() => setSearchesLoading(false));
  }, [isCandidateShell, profile?.id]);

  React.useEffect(() => {
    if (!isCandidateShell || !profile?.id) {
      recommendationContextRef.current = null;
      setRecommendedJobs([]);
      setRecommendedLoading(false);
      setRecommendedError(null);
      setHasMoreRecommendedJobs(false);
      return;
    }

    const candidateHasCv = hasCandidateCv(profile);
    if (!candidateHasCv || !hasAnalyzableCandidateCv(profile)) {
      recommendationContextRef.current = null;
      setRecommendedJobs([]);
      setRecommendedLoading(false);
      setRecommendedError(null);
      setHasMoreRecommendedJobs(false);
      return;
    }

    const recommendationContext = `${profile.id}:${profile.cv_text ?? ""}:${profile.embedding_vector ?? ""}`;
    if (recommendationContextRef.current !== recommendationContext) {
      recommendationContextRef.current = recommendationContext;
      if (recommendedPage !== 1) {
        setRecommendedPage(1);
        return;
      }
    }

    let mounted = true;
    setRecommendedLoading(true);
    setRecommendedError(null);

    void getRecommendedJobs(
      profile.id,
      0.0,
      recommendedPageSize,
      (recommendedPage - 1) * recommendedPageSize,
    )
      .then((jobs) => {
        if (!mounted) return;
        setRecommendedJobs(jobs);
        setHasMoreRecommendedJobs(jobs.length === recommendedPageSize);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error("[JobsPage] Unable to load recommended jobs", {
          candidateId: profile.id,
          error,
        });
        setRecommendedJobs([]);
        setHasMoreRecommendedJobs(false);
        setRecommendedError(
          error instanceof Error
            ? error.message
            : "Les recommandations sont momentanément indisponibles.",
        );
      })
      .finally(() => {
        if (mounted) setRecommendedLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isCandidateShell, profile?.id, profile?.cv_text, profile?.embedding_vector, recommendedPage]);

  const q = (appliedFilters.query ?? "").trim().toLowerCase();
  const companyFilter = (appliedFilters.company ?? "").trim().toLowerCase();
  const locationFilter = (appliedFilters.location ?? "").trim().toLowerCase();
  const availableDomains = React.useMemo(
    () =>
      Array.from(
        new Set(
          offers
            .flatMap((job) => (Array.isArray(job.tags) ? job.tags.filter(Boolean) : []))
            .map((tag) => String(tag).trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [offers],
  );

  const extractSalaryValue = (value?: string | null) => {
    if (!value) return null;
    const numbers = value.match(/\d[\d\s.,]*/g);
    if (!numbers || numbers.length === 0) return null;
    const numericValue = Number(
      numbers[0].replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, "."),
    );
    return Number.isFinite(numericValue) ? numericValue : null;
  };

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
    if (
      locationFilter &&
      ![job.location_city, job.location_country].join(" ").toLowerCase().includes(locationFilter)
    )
      return false;
    if (appliedFilters.contractType && job.contract_type !== appliedFilters.contractType)
      return false;
    if (domainInput) {
      const normalizedDomain = domainInput.toLowerCase();
      const matchesDomain = (job.tags || []).some(
        (tag) =>
          String(tag).trim().toLowerCase() === normalizedDomain ||
          String(tag).trim().toLowerCase().includes(normalizedDomain),
      );
      if (!matchesDomain) return false;
    }
    if (appliedFilters.salaryMin) {
      const minimumSalary = Number(appliedFilters.salaryMin);
      if (!Number.isFinite(minimumSalary)) return false;
      const salaryValue = extractSalaryValue(job.salary);
      if (salaryValue === null || salaryValue < minimumSalary) return false;
    }
    if (nearbyOnly && profile?.location_city) {
      const candidateCity = profile.location_city.trim().toLowerCase();
      const candidateCountry = profile.location_country?.trim().toLowerCase();
      const jobCity = (job.location_city ?? "").trim().toLowerCase();
      const jobCountry = (job.location_country ?? "").trim().toLowerCase();

      const isSameCity = jobCity && candidateCity && jobCity === candidateCity;
      const isSameCountry = !!candidateCountry && !!jobCountry && jobCountry === candidateCountry;
      const isRemoteFriendly =
        Array.isArray(preferences?.mobility_modes) &&
        preferences.mobility_modes.includes("remote") &&
        (!job.location_city && !job.location_country);

      const withinRadius =
        (preferences?.mobility_radius_km ?? 50) > 0 &&
        (isSameCity || isSameCountry || isRemoteFriendly);

      if (!withinRadius) return false;
    }
    return true;
  });

  const sortedOffers = React.useMemo(() => {
    const items = [...filteredOffers];
    const recommendedScores = new Map(
      recommendedJobs.map((job) => [job.id, typeof job.score === "number" ? job.score : 0]),
    );

    items.sort((left, right) => {
      switch (sortBy) {
        case "relevance": {
          const leftScore = recommendedScores.get(left.id) ?? 0;
          const rightScore = recommendedScores.get(right.id) ?? 0;
          if (leftScore !== rightScore) return rightScore - leftScore;
          break;
        }
        case "salary-high": {
          const leftSalary = extractSalaryValue(left.salary) ?? 0;
          const rightSalary = extractSalaryValue(right.salary) ?? 0;
          if (leftSalary !== rightSalary) return rightSalary - leftSalary;
          break;
        }
        case "salary-low": {
          const leftSalary = extractSalaryValue(left.salary) ?? 0;
          const rightSalary = extractSalaryValue(right.salary) ?? 0;
          if (leftSalary !== rightSalary) return leftSalary - rightSalary;
          break;
        }
        case "date":
        default: {
          const leftDate = new Date(left.publish_at ?? left.created_at ?? 0).getTime();
          const rightDate = new Date(right.publish_at ?? right.created_at ?? 0).getTime();
          if (leftDate !== rightDate) return rightDate - leftDate;
          break;
        }
      }

      return (right.publish_at ?? right.created_at ?? "").localeCompare(
        left.publish_at ?? left.created_at ?? "",
      );
    });

    return items;
  }, [filteredOffers, recommendedJobs, sortBy]);

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const parsed = interpretNaturalLanguageSearch(searchInput);
    const hasNaturalCriteria = parsed.detected.length > 0;
    const nextCriteria: JobSearchCriteria = {
      status: "published",
      limit: 100,
      query: hasNaturalCriteria ? parsed.criteria.query : searchInput.trim(),
      company: companyInput.trim(),
      location: locationInput.trim() || parsed.criteria.location || "",
      contractType: contractTypeInput || parsed.criteria.contractType || "",
      domain: domainInput || parsed.criteria.domain || "",
      salaryMin: parsed.criteria.salaryMin || "",
    };
    setInterpretation(
      hasNaturalCriteria ? { criteria: nextCriteria, detected: parsed.detected } : null,
    );
    setAppliedFilters({
      ...nextCriteria,
    });
    setSearchInput(nextCriteria.query ?? "");
    setLocationInput(nextCriteria.location ?? "");
    setContractTypeInput(nextCriteria.contractType ?? "");
    setDomainInput(nextCriteria.domain ?? "");
    setFiltersOpen(false);
    setPage(1);
    if (
      profile?.id &&
      (nextCriteria.query ||
        nextCriteria.location ||
        nextCriteria.contractType ||
        nextCriteria.domain)
    ) {
      void recordSearchHistory(profile.id, nextCriteria)
        .then((item) => setSearchHistory((current) => [item, ...current].slice(0, 10)))
        .catch((error) => console.error("Impossible d'enregistrer la recherche", error));
    }
  };

  const applyCriteria = (criteria: JobSearchCriteria) => {
    setSearchInput(criteria.query ?? "");
    setCompanyInput(criteria.company ?? "");
    setLocationInput(criteria.location ?? "");
    setContractTypeInput(criteria.contractType ?? "");
    setDomainInput(criteria.domain ?? "");
    setNearbyOnly(false);
    setAppliedFilters({ ...criteria, status: "published", limit: 100 });
    setPage(1);
  };

  const useCandidatePreferences = () => {
    if (!profile || !preferences) return;
    const criteria: JobSearchCriteria = {
      status: "published",
      limit: 100,
      query: profile.headline ?? "",
      location: profile.location_city ?? "",
      contractType: preferences.contract_types?.[0] as JobSearchCriteria["contractType"],
      domain: "",
      salaryMin: preferences.salary_min ? String(preferences.salary_min) : "",
    };
    applyCriteria(criteria);
  };

  const saveCurrentSearch = async () => {
    if (!profile?.id) return;
    const name = window.prompt("Nom de cette recherche", searchInput || "Ma recherche");
    if (!name?.trim()) return;
    try {
      const saved = await saveJobSearch(profile.id, name, {
        ...appliedFilters,
        domain: domainInput,
        salaryMin: appliedFilters.salaryMin,
      });
      setSavedSearches((current) => [saved, ...current]);
    } catch (error) {
      console.error("Impossible de sauvegarder la recherche", error);
    }
  };

  const toggleSavedSearch = async (saved: SavedJobSearch) => {
    try {
      const updated = await updateSavedJobSearch(saved.id, { is_active: !saved.is_active });
      setSavedSearches((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("Impossible de modifier la recherche sauvegardée", error);
    }
  };

  const editSavedSearch = async (saved: SavedJobSearch) => {
    const name = window.prompt("Nom de cette recherche", saved.name);
    if (!name?.trim() || name.trim() === saved.name) return;
    try {
      const updated = await updateSavedJobSearch(saved.id, { name: name.trim() });
      setSavedSearches((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("Impossible de modifier la recherche sauvegardée", error);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setCompanyInput("");
    setContractTypeInput("");
    setLocationInput("");
    setDomainInput("");
    setInterpretation(null);
    setNearbyOnly(false);
    setAppliedFilters({
      status: "published",
      limit: 100,
      query: "",
      company: "",
      location: "",
      contractType: "",
    });
    setFiltersOpen(false);
    setPage(1);
  };

  const clearSearchInput = () => {
    setSearchInput("");
    setInterpretation(null);
    setAppliedFilters((current) => ({ ...current, query: "" }));
    setPage(1);
  };

  const hasActiveSearchCriteria = Boolean(
    appliedFilters.query ||
      appliedFilters.company ||
      appliedFilters.location ||
      appliedFilters.contractType ||
      appliedFilters.domain ||
      appliedFilters.salaryMin ||
      nearbyOnly ||
      sortBy !== "date",
  );

  React.useEffect(() => {
    setPage(1);
  }, [
    q,
    companyFilter,
    locationFilter,
    appliedFilters.contractType,
    domainInput,
    sortBy,
  ]);

  React.useEffect(() => {
    if (!isCandidateShell || location.hash !== "#recommended-for-you" || recommendationsOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = document.getElementById("recommended-for-you");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setRecommendationsOpen(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isCandidateShell, location.hash, recommendationsOpen]);

  const totalPages = Math.max(1, Math.ceil(sortedOffers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedOffers = sortedOffers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const loginRedirectPath = loginPromptSlug ? `/jobs/${loginPromptSlug}` : "/jobs";

  const handleApplyClick = (slug: string) => {
    if (isLoading) return;
    if (user) {
      navigate(`/candidate/jobs/${slug}/apply`);
      return;
    }
    setLoginPromptSlug(slug);
  };

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
      <section className="container-page pb-32 md:pb-28">
        <div className="grid gap-8">
          <div className="flex flex-col gap-6 text-foreground/90 leading-relaxed">
            <div
              className="order-1 sticky z-40 isolate mt-0 mb-0 w-full self-start rounded-[1.25rem] bg-card/95 backdrop-blur-sm"
              style={{
                top: mobileApp || isCandidateShell ? 0 : 64,
              }}
            >
              <div className="flex flex-col overflow-hidden rounded-[1.25rem] border-0 bg-card shadow-none ring-0">
                <form
                  onSubmit={handleSearchSubmit}
                  className="order-1 flex flex-col gap-3 bg-card/95 p-3 sm:p-4"
                >
                  <label className="text-sm font-semibold text-foreground" htmlFor="job-search-input">
                    Rechercher un emploi
                  </label>
                  <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="job-search-input"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchSubmit();
                        }
                      }}
                      placeholder="Rechercher un emploi..."
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    {searchInput ? (
                      <button
                        type="button"
                        aria-label="Réinitialiser la recherche"
                        onClick={clearSearchInput}
                        className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                    {searchSuggestions.length > 0 ? (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card p-2 shadow-sm">
                        <p className="px-2 py-1 text-xs text-muted-foreground">
                          Suggestions métier
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setSearchInput(suggestion)}
                              className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:border-primary hover:text-primary"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    aria-label="Rechercher"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-primary/5"
                  >
                    <Search className="h-4 w-4" />
                  </button>

                  {!canUseAdvancedFilters ? (
                    <Select
                      value={locationInput}
                      onValueChange={setLocationInput}
                      open={locationOpen}
                      onOpenChange={setLocationOpen}
                    >
                      <SelectTrigger
                        aria-label="Rechercher par pays ou ville"
                        title="Rechercher par pays ou ville"
                        className="h-11 w-11 justify-center rounded-xl border-border bg-background p-0 text-foreground [&>span]:sr-only"
                      >
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {centralAfricaCityGroups.map((group) => (
                          <SelectGroup key={group.country}>
                            <SelectLabel>{group.country}</SelectLabel>
                            <SelectItem value={group.country}>{group.country}</SelectItem>
                            {group.cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {canUseAdvancedFilters ? (
                    <button
                      type="button"
                      aria-label="Afficher ou masquer les filtres"
                      title="Afficher ou masquer les filtres"
                      aria-expanded={filtersOpen}
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold transition hover:bg-primary/5 ${
                        filtersOpen
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                      <span>Filtres</span>
                    </button>
                  ) : (
                    <Popover
                      open={advancedFiltersPromptOpen}
                      onOpenChange={setAdvancedFiltersPromptOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          title="Connectez-vous pour avoir plus de filtres"
                          aria-label="Connectez-vous pour avoir plus de filtres"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
                        >
                          <CircleAlert className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="end" className="w-64 p-4">
                        <p className="text-sm font-semibold text-foreground">
                          Connectez-vous pour avoir plus de filtres.
                        </p>
                        <Button
                          asChild
                          size="sm"
                          className="mt-3 w-full rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                        >
                          <Link
                            to="/candidate/login"
                            onClick={() => setAdvancedFiltersPromptOpen(false)}
                          >
                            Se connecter
                          </Link>
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                  </div>
                </form>

                {isCandidateShell ? (
                  <button
                    type="button"
                    aria-expanded={candidateToolsOpen}
                    onClick={() => setCandidateToolsOpen((open) => !open)}
                    className="order-3 flex w-full items-center justify-between border-t border-border px-3 py-2.5 text-left text-sm font-semibold text-primary transition hover:bg-primary/5 sm:px-4"
                  >
                    <span>{candidateToolsOpen ? "Masquer les options candidat" : "Afficher les options candidat"}</span>
                    <span aria-hidden="true" className="text-lg leading-none">{candidateToolsOpen ? "−" : "+"}</span>
                  </button>
                ) : null}

                {isCandidateShell && candidateToolsOpen ? (
                  <div className="order-4 grid gap-3 border-t border-border bg-muted/20 px-3 py-3 sm:grid-cols-2 sm:px-4">
                    <button
                      type="button"
                      onClick={useCandidatePreferences}
                      disabled={!preferences}
                      className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-left text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="block">Utiliser mes préférences</span>
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        Appliquer vos critères enregistrés au formulaire.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!profile?.location_city) {
                          setLocationInput("");
                          setNearbyOnly(false);
                          return;
                        }
                        applyCriteria({ ...appliedFilters, location: profile.location_city });
                        setNearbyOnly(true);
                      }}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      <span className="block">Offres proches de moi{profile?.location_city ? ` (${profile.location_city})` : ""}</span>
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {profile?.location_city
                          ? "Basées sur votre ville et vos préférences de mobilité."
                          : "Ajoutez votre ville dans votre profil pour utiliser cette recherche."}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                      Réinitialiser la recherche
                    </button>
                  </div>
                ) : null}

                {canUseAdvancedFilters && interpretation ? (
                  <div className="order-5 border-t border-border bg-muted/30 px-3 py-3 sm:px-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Recherche comprise</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {interpretation.detected.map((item) => (
                            <span
                              key={`${item.label}-${item.value}`}
                              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              <strong className="text-foreground">{item.label} :</strong>{" "}
                              {item.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(true)}
                        className="text-left text-sm font-semibold text-primary hover:underline sm:text-right"
                      >
                        Modifier les critères
                      </button>
                    </div>
                  </div>
                ) : null}

                {canUseAdvancedFilters ? (
                  <div
                    className={`order-2 overflow-hidden border-t border-border bg-card transition-all duration-200 ${
                      filtersOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                  <div className="flex items-end gap-2 overflow-x-auto bg-card px-3 py-2.5 sm:px-4">
                    <div className="shrink-0">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Type de contrat
                      </label>
                      <select
                        value={contractTypeInput}
                        onChange={(e) => setContractTypeInput(e.target.value)}
                        className="h-9 w-[9.5rem] rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
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

                    <div className="shrink-0">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Localisation
                      </label>
                      <Select value={locationInput} onValueChange={setLocationInput}>
                        <SelectTrigger className="h-9 w-[9.5rem] rounded-lg border-border bg-background px-2.5 text-sm">
                          <SelectValue placeholder="Sélectionner une ville ou un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {centralAfricaCityGroups.map((group) => (
                            <SelectGroup key={group.country}>
                              <SelectLabel>{group.country}</SelectLabel>
                              <SelectItem value={group.country}>{group.country}</SelectItem>
                              {group.cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {availableDomains.length > 0 ? (
                      <div className="shrink-0">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Domaine
                        </label>
                        <select
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          className="h-9 w-[5.5rem] rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">Tous</option>
                          {availableDomains.map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <div className="shrink-0">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Trier par
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as "date" | "relevance" | "salary-high" | "salary-low",
                          )
                        }
                        className="h-9 w-[9rem] rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="date">Date de publication</option>
                        <option value="relevance">Pertinence</option>
                        <option value="salary-high">Salaire décroissant</option>
                        <option value="salary-low">Salaire croissant</option>
                      </select>
                    </div>

                    <div className="flex shrink-0 items-end justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        aria-label="Rechercher avec ces critères"
                        title="Rechercher avec ces critères"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-foreground transition hover:bg-brand/90"
                      >
                        <Search className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  </div>
                ) : null}
            </div>
                {isCandidateShell ? (
              <Sheet
                open={recommendationsOpen}
                onOpenChange={(open) => {
                  if (!open && location.hash === "#recommended-for-you") {
                    navigate(`${location.pathname}${location.search}`, { replace: true });
                  }
                  setRecommendationsOpen(open);
                }}
              >
                <SheetContent
                  side="right"
                  className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
                >
                  <SheetHeader className="border-b border-border px-5 py-5 pr-14 text-left sm:px-7">
                    <SheetTitle
                      id="recommended-for-you"
                      className="flex items-center gap-2 text-xl"
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recommandé pour vous
                    </SheetTitle>
                    <SheetDescription className="leading-6">
                      Ces offres correspondent le mieux à votre profil selon notre système de
                      compatibilité.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                    {recommendedLoading ? (
                      <div className="space-y-4" aria-label="Chargement des recommandations">
                        {[1, 2, 3].map((index) => (
                          <Skeleton key={index} className="h-36 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : recommendedError ? (
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                        <p>Impossible de charger vos recommandations pour le moment.</p>
                        <p className="mt-1">{recommendedError}</p>
                        <p className="mt-1">Vous pouvez continuer à consulter toutes les offres ci-dessous.</p>
                      </div>
                    ) : recommendedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {recommendedJobs.map((job, index) => {
                          const location =
                            [job.location_city, job.location_country].filter(Boolean).join(", ") ||
                            t("jobs.location.remote");
                          const previewText = (job.description || job.requirements || "")
                            .replace(/\s+/g, " ")
                            .trim();
                          const deadlineValue = job.deadline || job.expires_at || null;
                          const isExpired = Boolean(
                            deadlineValue && new Date(deadlineValue).getTime() < Date.now(),
                          );

                          return (
                            <JobCard
                              key={job.id}
                              job={job}
                              location={location}
                              previewText={previewText}
                              contractLabel={getContractLabel(job.contract_type)}
                              tags={(job.tags || []).filter(Boolean).slice(0, 3)}
                              deadlineValue={deadlineValue}
                              isExpired={isExpired}
                              t={t}
                              index={index}
                              hideRequirementsSection
                              variant="list"
                              matchScore={typeof job.score === "number" ? job.score : undefined}
                              onApplyClick={() => handleApplyClick(job.slug)}
                            />
                          );
                        })}
                        <PaginationNav
                          currentPage={recommendedPage}
                          totalPages={recommendedPage + (hasMoreRecommendedJobs ? 1 : 0)}
                          onPageChange={setRecommendedPage}
                          disabled={recommendedLoading}
                          className="justify-center border-t border-border/70 pt-4"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">
                        {profile?.id && !hasCandidateCv(profile)
                          ? "Ajoutez votre CV pour recevoir des recommandations adaptées à votre parcours."
                          : "Aucune recommandation pour le moment. Consultez les offres disponibles ou complétez votre profil."}
                        {profile?.id && !hasCandidateCv(profile) ? (
                          <Link
                            to="/candidate/profile"
                            className="mt-3 inline-flex font-semibold text-primary hover:underline"
                          >
                            Compléter mon profil
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}

            {isCandidateShell && candidateToolsOpen ? (
              <section className="order-4 pt-6" aria-label="Mes recherches">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Mes recherches</h2>
                    <p className="text-sm text-muted-foreground">Retrouvez vos critères sauvegardés et vos dernières recherches.</p>
                  </div>
                </div>
                {!searchesLoading && savedSearches.length === 0 && searchHistory.length === 0 ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">Aucune recherche sauvegardée ou récente.</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void saveCurrentSearch()}
                      disabled={!appliedFilters.query && !appliedFilters.location}
                    >
                      Sauvegarder la recherche
                    </Button>
                  </div>
                ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Recherches sauvegardées
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Relancez vos critères favoris.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void saveCurrentSearch()}
                      disabled={!appliedFilters.query && !appliedFilters.location}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {searchesLoading ? (
                      <p className="text-sm text-muted-foreground">Chargement...</p>
                    ) : savedSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune recherche sauvegardée.</p>
                    ) : (
                      savedSearches.map((saved) => (
                        <div
                          key={saved.id}
                          className="flex items-start justify-between gap-3 border-t border-border pt-3"
                        >
                          <button
                            type="button"
                            className="min-w-0 text-left"
                            onClick={() => applyCriteria(saved.criteria)}
                          >
                            <p className="truncate text-sm font-semibold text-foreground">
                              {saved.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {saved.criteria.query || "Tous les métiers"}
                              {saved.criteria.location ? ` · ${saved.criteria.location}` : ""}
                            </p>
                          </button>
                          <div className="flex shrink-0 gap-2 text-xs">
                            <button
                              type="button"
                              className="text-foreground hover:text-primary"
                              onClick={() => void editSavedSearch(saved)}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={() => void toggleSavedSearch(saved)}
                            >
                              {saved.is_active ? "Désactiver" : "Activer"}
                            </button>
                            <button
                              type="button"
                              className="text-destructive hover:underline"
                              onClick={() =>
                                void deleteSavedJobSearch(saved.id).then(() =>
                                  setSavedSearches((current) =>
                                    current.filter((item) => item.id !== saved.id),
                                  ),
                                )
                              }
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Recherches récentes
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Les 10 dernières recherches appliquées.
                      </p>
                    </div>
                    {searchHistory.length > 0 ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary hover:underline"
                        onClick={() =>
                          void clearSearchHistory(profile!.id).then(() => setSearchHistory([]))
                        }
                      >
                        Effacer
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-2">
                    {searchHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun historique.</p>
                    ) : (
                      searchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 border-t border-border pt-2"
                        >
                          <button
                            type="button"
                            className="truncate text-left text-sm text-foreground hover:text-primary"
                            onClick={() => applyCriteria(item.criteria)}
                          >
                            {item.criteria.query || "Recherche filtrée"}
                            {item.criteria.location ? ` · ${item.criteria.location}` : ""}
                          </button>
                          <button
                            type="button"
                            className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              void deleteSearchHistoryItem(item.id).then(() =>
                                setSearchHistory((current) =>
                                  current.filter((entry) => entry.id !== item.id),
                                ),
                              )
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </div>
                )}
              </section>
            ) : null}

            <div className="order-3 flex flex-col gap-3 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">Offres disponibles</h2>
                {hasActiveSearchCriteria ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sortedOffers.length} offre{sortedOffers.length > 1 ? "s" : ""} trouvée
                    {sortedOffers.length > 1 ? "s" : ""}
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">Tri : {sortBy === "date" ? "plus récentes" : sortBy === "relevance" ? "pertinence" : sortBy === "salary-high" ? "salaire décroissant" : "salaire croissant"}</p>
            </div>

            <div className={`order-3 ${mobileApp ? "mt-0 grid gap-3 pt-0" : "mt-0 grid gap-3 pt-0"}`}>
              {loading ? (
                [1, 2, 3].map((index) => (
                  <article
                    key={index}
                    className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-pulse"
                  />
                ))
              ) : sortedOffers.length > 0 ? (
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
                        hideRequirementsSection
                        variant="list"
                        onApplyClick={() => handleApplyClick(job.slug)}
                      />
                    );
                  })}
                  {totalPages > 1 ? (
                    <div className="mt-0 mb-0 rounded-2xl border border-border bg-card/80 px-4 py-2">
                      <PaginationNav
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        className="justify-center"
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
                  <div className="max-w-md space-y-3">
                    <p className="text-base font-semibold text-foreground">
                      Aucune offre ne correspond à ces critères.
                    </p>
                    <p className="text-sm leading-6">
                      Modifiez les filtres ou réinitialisez la recherche pour afficher de nouvelles
                      opportunités.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>
      <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {!isCandidateShell && whatsappOpen ? (
          <div
            role="dialog"
            aria-label="Accès rapide WhatsApp"
            className="w-[min(calc(100vw-2rem),24rem)] rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Accès rapide</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Visitez nos chaînes WhatsApp pour recevoir les dernières offres et mises à jour
                  emploi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Fermer l'accès rapide WhatsApp"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              <a
                href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1ea952]"
              >
                Chaîne Emploiplus-group
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-[#25D366]/20"
              >
                Chaîne Offres d'emploi (gratuit)
              </a>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          {isCandidateShell && !recommendationsOpen ? (
            <button
              type="button"
              onClick={() => setRecommendationsOpen(true)}
              aria-label="Voir mes recommandations"
              className="mr-16 inline-flex size-11 items-center justify-center rounded-full border border-primary/20 bg-card p-0 text-sm font-semibold text-foreground shadow-lg transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:mr-16 sm:size-auto sm:min-h-12 sm:justify-start sm:gap-2 sm:px-4 sm:py-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Recommandations</span>
              <span className="hidden text-primary sm:inline">Voir</span>
            </button>
          ) : null}

          {!isCandidateShell && (
            <button
              type="button"
              onClick={() => setWhatsappOpen((open) => !open)}
              aria-expanded={whatsappOpen}
              aria-label={whatsappOpen ? "Fermer les chaînes WhatsApp" : "Ouvrir les chaînes WhatsApp"}
              className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 hover:bg-[#1ea952] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
            >
              <MessageCircle className="size-7" />
            </button>
          )}
        </div>
      </div>
      <Dialog
        open={Boolean(loginPromptSlug)}
        onOpenChange={(open) => !open && setLoginPromptSlug(null)}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-6 sm:p-7">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl text-foreground">Connexion requise</DialogTitle>
            <DialogDescription className="pt-2 text-base leading-6 text-muted-foreground">
              Créez votre espace candidat pour postuler, conserver vos candidatures et gérer votre
              profil professionnel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 flex-col gap-2 sm:flex-row sm:justify-start sm:space-x-0">
            <Button
              asChild
              className="w-full rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
            >
              <Link
                to="/candidate/login"
                state={{ from: loginRedirectPath }}
                onClick={() => setLoginPromptSlug(null)}
              >
                Se connecter
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
              <Link
                to="/candidate/signup"
                state={{ from: loginRedirectPath }}
                onClick={() => setLoginPromptSlug(null)}
              >
                S'inscrire
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
