import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { jobService } from "@/features/jobs/api";
import type { JobOffer } from "@/features/jobs/types";
import { ShareButtons } from "@/components/site/ShareButtons";
import { analyzeCandidateForJob, type AiAnalysisResult } from "@/services/groqAnalysisService";
import { findSimilarJobs } from "@/services/similarJobsService";
import { useCandidate } from "@/hooks/useCandidate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCandidateSavedOffers,
  saveJobOffer,
  unsaveJobOffer,
} from "@/features/candidates/api/savedOffersApi";

function NotFoundPage() {
  return (
    <>
      <SEO
        title={"Page non trouvée - 404"}
        description={"La page que vous recherchez n'existe pas ou a été supprimée."}
        canonical={`${BASE_URL}/404`}
        robots="noindex,nofollow"
      />
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">Page introuvable.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
          >
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
  const { profile } = useCandidate();
  const [job, setJob] = React.useState<JobOffer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const [analysis, setAnalysis] = React.useState<AiAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [copiedLetter, setCopiedLetter] = React.useState(false);
  const [savedOfferId, setSavedOfferId] = React.useState<string | null>(null);
  const [savedOfferState, setSavedOfferState] = React.useState(false);
  const [savingSavedOffer, setSavingSavedOffer] = React.useState(false);
  const [savedOfferError, setSavedOfferError] = React.useState<string | null>(null);
  const [similarJobs, setSimilarJobs] = React.useState<JobOffer[]>([]);
  const [similarJobsLoading, setSimilarJobsLoading] = React.useState(false);
  const [similarJobsError, setSimilarJobsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadOffer = async () => {
      setLoading(true);
      const foundJob = await jobService.getOfferBySlug(slug);
      if (!mounted) return;
      setJob(foundJob);
      setLoading(false);
    };

    void loadOffer();
    return () => {
      mounted = false;
    };
  }, [slug]);

  React.useEffect(() => {
    if (!profile?.id || !job?.id) {
      setSavedOfferId(null);
      setSavedOfferState(false);
      return;
    }

    let mounted = true;
    const loadSavedStatus = async () => {
      try {
        const rows = await getCandidateSavedOffers(profile.id);
        if (!mounted) return;
        const match = rows.find((row) => {
          const savedJobOfferId = String(
            (row as { job_offer_id?: string | null }).job_offer_id ?? "",
          );
          return savedJobOfferId === job.id;
        });

        setSavedOfferId((match as { id?: string } | undefined)?.id ?? null);
        setSavedOfferState(Boolean(match));
      } catch {
        if (mounted) {
          setSavedOfferId(null);
          setSavedOfferState(false);
        }
      }
    };

    void loadSavedStatus();
    return () => {
      mounted = false;
    };
  }, [profile?.id, job?.id]);

  const isExpired = Boolean(
    job && (job.status === "expired" || (job.deadline && new Date(job.deadline).getTime() < Date.now())),
  );

  React.useEffect(() => {
    if (!job?.id) {
      setSimilarJobs([]);
      setSimilarJobsError(null);
      return;
    }

    let mounted = true;
    const loadSimilarJobs = async () => {
      setSimilarJobsLoading(true);
      setSimilarJobsError(null);
      try {
        const matches = await findSimilarJobs(job, { limit: 3 });
        if (!mounted) return;
        setSimilarJobs(matches);
      } catch (error) {
        if (!mounted) return;
        setSimilarJobs([]);
        setSimilarJobsError(
          error instanceof Error ? error.message : "Impossible de charger des offres similaires.",
        );
      } finally {
        if (mounted) {
          setSimilarJobsLoading(false);
        }
      }
    };

    void loadSimilarJobs();
    return () => {
      mounted = false;
    };
  }, [job?.id, job?.title, job?.company, job?.description, job?.requirements, job?.location_city, job?.location_country, job?.contract_type, isExpired]);

  const canonical = slug ? `${BASE_URL}/jobs/${slug}` : `${BASE_URL}/jobs`;
  const title = job
    ? job.meta_title || `${job.title} | ${job.company}`
    : "Offre d'emploi | EmploiPlus Group";
  const description = job
    ? job.meta_description || job.description?.slice(0, 160) || t("jobs.page.description")
    : t("jobs.loading");
  const ogImage = job
    ? job.og_image || job.cover_image || `${BASE_URL}/og-default.svg`
    : `${BASE_URL}/og-default.svg`;

  const getLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
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

  const cleanText = (value?: string | null) => {
    if (!value) return "";
    return value
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const location = job
    ? [job.location_city, job.location_country].filter(Boolean).join(", ") ||
      t("jobs.location.remote")
    : t("jobs.location.remote");

  const locationLocality = job?.location_city?.trim() || "Brazzaville";

  const normalizeEmploymentType = (contractType?: string | null) => {
    const raw = (contractType || "").toLowerCase();
    switch (raw) {
      case "cdi":
        return "FULL_TIME";
      case "cdd":
      case "consultance":
      case "freelance":
      case "prestation_de_services":
      case "interim":
        return "CONTRACTOR";
      case "temps_partiel":
      case "part_time":
        return "PART_TIME";
      case "stage":
        return "INTERN";
      default:
        return "FULL_TIME";
    }
  };

  const employmentType = job ? normalizeEmploymentType(job.contract_type) : undefined;

  const salaryValue = job
    ? (() => {
        if (!job.salary) return undefined;
        const match = `${job.salary}`.match(/(\d[\d\s.,]*)/);
        if (!match) return undefined;
        const numericValue = Number(match[1].replace(/[^\d.]/g, ""));
        return Number.isFinite(numericValue) ? numericValue : undefined;
      })()
    : undefined;

  const validThrough = job
    ? job.expires_at ||
      job.deadline ||
      (() => {
        const baseDate = new Date(job.publish_at || job.created_at || new Date().toISOString());
        baseDate.setDate(baseDate.getDate() + 60);
        return baseDate.toISOString();
      })()
    : undefined;

  const seoStructuredData = job
    ? {
        "@type": "JobPosting",
        title: job.title,
        description: cleanText(job.description || job.meta_description || ""),
        datePosted: job.publish_at || job.created_at || undefined,
        validThrough,
        employmentType,
        hiringOrganization: {
          "@type": "Organization",
          name: job.company || "EmploiPlus Group",
          sameAs: BASE_URL,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location_city?.trim() || "Brazzaville",
            addressCountry: "CG",
          },
        },
        baseSalary:
          salaryValue != null
            ? {
                "@type": "MonetaryAmount",
                currency: "XAF",
                value: {
                  "@type": "QuantitativeValue",
                  value: salaryValue,
                  unitText: "MONTH",
                },
              }
            : undefined,
      }
    : undefined;

  const applyTitle = getLabel("jobs.detail.applyTitle", "Postuler");
  const applyDescription = getLabel(
    "jobs.detail.applyDescription",
    "Choisissez le canal qui vous convient pour transmettre votre candidature.",
  );
  const applyByEmailLabel = getLabel("jobs.detail.applyByEmail", "Envoyer par email");
  const applyByWhatsappLabel = getLabel("jobs.detail.applyByWhatsapp", "Contacter via WhatsApp");
  const applyExternalLabel = getLabel("jobs.detail.applyExternal", "Postuler sur le site");

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fr-FR");
  };

  const tags = (job?.tags || []).filter(Boolean);
  const requirementItems = (job?.requirements || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const applyOptions = [
    job?.application_email
      ? {
          label: applyByEmailLabel,
          href: `mailto:${job.application_email}`,
          icon: Send,
        }
      : null,
    job?.external_link
      ? {
          label: applyExternalLabel,
          href: job.external_link,
          icon: ExternalLink,
        }
      : null,
    job?.application_whatsapp
      ? {
          label: applyByWhatsappLabel,
          href: `https://wa.me/${job.application_whatsapp.replace(/\D/g, "")}`,
          icon: MessageSquare,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Send }>;

  // Navigate to the candidate apply flow (same behavior as the jobs listing)
  const handleApplyClick = () => {
    if (!job?.slug) return;
    if (isExpired) {
      return;
    }
    const applyPath = `/candidate/jobs/${job.slug}/apply`;
    if (profile?.id) {
      navigate(applyPath);
      return;
    }
    navigate("/candidate/login", {
      state: {
        from: applyPath,
        notification:
          "Créez votre espace candidat pour postuler, conserver vos candidatures et gérer votre profil professionnel.",
      },
    });
  };

  const handleToggleSavedOffer = async () => {
    if (!job?.id) return;

    if (!profile?.id) {
      navigate("/candidate/login", {
        state: {
          from: `/jobs/${job.slug}`,
          notification:
            "Connectez-vous pour enregistrer cette offre et retrouver vos favoris plus tard.",
        },
      });
      return;
    }

    setSavingSavedOffer(true);
    setSavedOfferError(null);

    try {
      if (savedOfferState && savedOfferId) {
        await unsaveJobOffer(savedOfferId);
        setSavedOfferId(null);
        setSavedOfferState(false);
        return;
      }

      const saved = await saveJobOffer(profile.id, job.id);
      const nextSavedOfferId =
        typeof (saved as { id?: string } | null)?.id === "string"
          ? (saved as { id: string }).id
          : null;
      setSavedOfferId(nextSavedOfferId);
      setSavedOfferState(true);
    } catch (error) {
      setSavedOfferError(
        error instanceof Error ? error.message : "Impossible d'enregistrer cette offre.",
      );
    } finally {
      setSavingSavedOffer(false);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!job?.id || !profile?.id) {
      setAnalysisError("Vous devez être connecté pour lancer l’analyse IA.");
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setCopiedLetter(false);

    try {
      const result = await analyzeCandidateForJob(profile.id, job.id);
      setAnalysis(result);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Une erreur est survenue pendant l’analyse.",
      );
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCopyLetter = async () => {
    if (!analysis?.cover_letter_draft) return;

    try {
      await navigator.clipboard.writeText(analysis.cover_letter_draft);
      setCopiedLetter(true);
      window.setTimeout(() => setCopiedLetter(false), 1800);
    } catch {
      setAnalysisError("Impossible de copier la lettre automatiquement.");
    }
  };

  if (loading) {
    return (
      <>
        <SEO
          title={title}
          description={description}
          canonical={canonical}
          robots="index,follow"
          ogImage={ogImage}
          ogType="article"
          publishedTime={job?.publish_at || undefined}
          modifiedTime={job?.updated_at || undefined}
          structuredData={seoStructuredData}
        />
        <section className="container-page pb-20 md:pb-28">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="min-w-0 space-y-6">
              <div className="overflow-hidden border-b border-border/70 bg-gradient-to-br from-background via-card to-primary/5 p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Skeleton className="h-5 w-36 rounded-full" />
                    <Skeleton className="h-10 w-28 rounded-full" />
                  </div>

                  <div className="space-y-4">
                    <Skeleton className="h-8 w-40 rounded-full" />
                    <Skeleton className="h-10 w-3/4 rounded-xl" />
                    <Skeleton className="h-5 w-56 rounded-xl" />
                    <Skeleton className="h-5 w-full rounded-xl" />
                    <Skeleton className="h-5 w-full rounded-xl" />
                    <Skeleton className="h-5 w-2/3 rounded-xl" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="border-b border-border/70 bg-card/40 p-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="mt-3 h-4 w-full rounded-md" />
                    <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />
                  </div>
                ))}
              </div>

              <div className="border-t border-border/70 bg-card/40 p-8">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-56 rounded-xl" />
                    <Skeleton className="h-4 w-40 rounded-xl" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-5 w-full rounded-xl" />
                  <Skeleton className="h-5 w-full rounded-xl" />
                  <Skeleton className="h-5 w-5/6 rounded-xl" />
                  <Skeleton className="h-5 w-full rounded-xl" />
                  <Skeleton className="h-5 w-2/3 rounded-xl" />
                </div>
              </div>

              <div className="border-t border-border/70 bg-card/40 p-8">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-52 rounded-xl" />
                    <Skeleton className="h-4 w-40 rounded-xl" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>

            <aside className="min-w-0 space-y-6">
              <div className="rounded-xl border border-border/70 bg-card p-7">
                <Skeleton className="h-7 w-32 rounded-xl" />
                <Skeleton className="mt-3 h-4 w-full rounded-xl" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-xl" />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-7">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-52 rounded-xl" />
                    <Skeleton className="h-4 w-40 rounded-xl" />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </>
    );
  }

  if (!job) {
    return <NotFoundPage />;
  }

  const overviewItems = [
    {
      icon: Building2,
      label: getLabel("jobs.detail.company", "Entreprise"),
      value: job.company,
    },
    {
      icon: MapPin,
      label: getLabel("jobs.detail.location", "Localisation"),
      value: location,
    },
    {
      icon: BriefcaseBusiness,
      label: getLabel("jobs.detail.contractType", "Type de contrat"),
      value: getContractLabel(job.contract_type),
    },
    {
      icon: DollarSign,
      label: t("admin.jobs.field.salary"),
      value: job.salary || getLabel("jobs.detail.notSpecified", "À préciser"),
    },
    {
      icon: CalendarDays,
      label: getLabel("jobs.detail.publishedAt", "Publié le"),
      value: formatDate(job.publish_at) || getLabel("jobs.detail.notSpecified", "À préciser"),
    },
    {
      icon: Clock3,
      label: getLabel("jobs.detail.deadline", "Date limite"),
      value: formatDate(job.deadline) || getLabel("jobs.detail.notSpecified", "À préciser"),
    },
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        robots="index,follow"
        ogImage={ogImage}
        ogType={"article"}
        publishedTime={job.publish_at || undefined}
        modifiedTime={job.updated_at || undefined}
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("jobs.page.title"), url: `${BASE_URL}/jobs` },
          { name: job.title, url: canonical },
        ]}
        structuredData={seoStructuredData}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden border-b border-border/70 bg-gradient-to-br from-background via-card to-primary/5 p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    {getLabel("jobs.backToList", "Retour à la liste")}
                  </Link>
                  <ShareButtons
                    url={canonical}
                    text={job.title}
                    variant="compact"
                    shareData={{
                      title: job.title,
                      company: job.company,
                      contractType: getContractLabel(job.contract_type),
                      location,
                      salary: job.salary,
                      description: job.description,
                      deadline: formatDate(job.deadline),
                      email: job.application_email,
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
                    <Sparkles className="size-4" />
                    {getContractLabel(job.contract_type) ||
                      getLabel("jobs.detail.opportunity", "Opportunité")}
                  </div>
                  <div className="space-y-3">
                    <h1 className="break-words font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {job.title}
                    </h1>
                    <p className="break-words text-base text-muted-foreground">
                      {job.company} · {location}
                    </p>
                  </div>
                  <p className="max-w-3xl text-base leading-8 text-foreground/90">{description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-sm text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {overviewItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="border-b border-border/70 bg-card/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-brand" />
                    {label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border/70 bg-card/40 p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand/10 p-2.5 text-brand">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {getLabel("jobs.detail.descriptionTitle", "Description du poste")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ce que vous découvrirez en rejoignant l’équipe.
                  </p>
                </div>
              </div>
              <p className="mt-6 whitespace-pre-line text-base leading-8 text-foreground/90">
                {job.description}
              </p>
            </div>

            {job.requirements ? (
              <div className="border-t border-border/70 bg-card/40 p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand/10 p-2.5 text-brand">
                    <BadgeCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {getLabel("jobs.detail.requirementsTitle", "Profil recherché")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Les compétences et qualités attendues.
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {requirementItems.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 text-sm leading-7 text-foreground/90"
                    >
                      <span className="mt-2 size-2 rounded-full bg-brand" />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {isExpired ? (
              <div className="border-t border-border/70 bg-card/40 p-8">
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Voici des offres similaires actuellement disponibles.
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Retrouvez des opportunités proches de cette mission et de ce secteur.
                </p>
                {similarJobsLoading ? (
                  <div className="mt-5 space-y-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : similarJobsError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {similarJobsError}
                  </div>
                ) : similarJobs.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {similarJobs.map((similarJob) => (
                      <Link
                        key={similarJob.id}
                        to={`/jobs/${similarJob.slug}`}
                        className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-brand/30 hover:bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{similarJob.title}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{similarJob.company}</div>
                          </div>
                          <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-1 text-[11px] font-semibold uppercase text-brand">
                            {getContractLabel(similarJob.contract_type)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {similarJob.location_city ? <span>{similarJob.location_city}</span> : null}
                          {similarJob.salary ? <span>{similarJob.salary}</span> : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    Aucune alternative active n'est actuellement disponible pour ce poste.
                  </div>
                )}
              </div>
            ) : similarJobs.length > 0 ? (
              <div className="border-t border-border/70 bg-card/40 p-8">
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Vous pourriez également être intéressé
                </h3>
                <div className="mt-5 space-y-3">
                  {similarJobs.map((similarJob) => (
                    <Link
                      key={similarJob.id}
                      to={`/jobs/${similarJob.slug}`}
                      className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-brand/30 hover:bg-primary/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{similarJob.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{similarJob.company}</div>
                        </div>
                        <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-1 text-[11px] font-semibold uppercase text-brand">
                          {getContractLabel(similarJob.contract_type)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {similarJob.location_city ? <span>{similarJob.location_city}</span> : null}
                        {similarJob.salary ? <span>{similarJob.salary}</span> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-6">
            <div className="rounded-xl border border-border/70 bg-card p-7">
              <h3 className="font-display text-xl font-semibold text-foreground">{applyTitle}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{applyDescription}</p>
              {isExpired ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Cette offre n'est plus disponible.
                </div>
              ) : null}
              <div className="mt-6 space-y-3">
                {applyOptions.length > 0 ? (
                  <div>
                    <button
                      type="button"
                      onClick={handleApplyClick}
                      disabled={isExpired}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="size-4" />
                      {isExpired ? "Offre expirée" : applyTitle}
                    </button>
                  </div>
                ) : null}

                {profile?.id ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => void handleToggleSavedOffer()}
                      disabled={savingSavedOffer}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savedOfferState ? (
                        <BookmarkCheck className="size-4 text-primary" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                      {savingSavedOffer
                        ? "Traitement..."
                        : savedOfferState
                          ? "Offre enregistrée"
                          : "Enregistrer l'offre"}
                    </button>
                    {savedOfferError ? (
                      <p className="mt-2 text-xs text-red-600">{savedOfferError}</p>
                    ) : null}
                  </div>
                ) : null}

                {!job.application_email && !job.application_whatsapp && !job.external_link ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    Veuillez retrouver l'adresse mail de cette entreprise en bas dans la description
                  </div>
                ) : null}
              </div>
            </div>

            {/* IA Evaluation: show disabled state for anonymous visitors */}
            {!profile?.id ? (
              <div className="rounded-xl border border-border/70 bg-background/60 p-7 text-center text-muted-foreground">
                <div className="flex items-center gap-3 justify-center">
                  <div className="rounded-2xl bg-brand/10 p-2.5 text-brand">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-muted-foreground">
                      Évaluation IA de votre candidature
                    </h3>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Connectez-vous pour utiliser cette fonctionnalité gratuitement
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link
                    to="/candidate/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/5"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/candidate/signup"
                    className="inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-card p-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand/10 p-2.5 text-brand">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Évaluation IA de votre candidature
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez une lecture instantanée de votre compatibilité avec cette offre.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAnalyzeClick}
                  disabled={analysisLoading || !profile?.id}
                  className="mt-5 w-full rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {analysisLoading ? "Analyse en cours…" : "Lancer l’analyse de ma compatibilité"}
                </Button>

                {analysisLoading ? (
                  <div className="mt-5 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                ) : null}

                {analysisError ? (
                  <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                    {analysisError}
                  </div>
                ) : null}

                {analysis ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Score de compatibilité
                        </span>
                        <span className="text-2xl font-bold text-secondary">
                          {analysis.match_score}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-border">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-secondary/70 to-secondary"
                          style={{ width: `${Math.max(4, Math.min(100, analysis.match_score))}%` }}
                        />
                      </div>
                      {analysis.experienceVerified ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {analysis.experienceVerified}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                        <h4 className="text-sm font-semibold text-emerald-700">Points forts</h4>
                        <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                          {analysis.strengths.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 size-2 rounded-full bg-emerald-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                        <h4 className="text-sm font-semibold text-orange-700">
                          Axes d’amélioration
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm text-orange-800">
                          {analysis.gaps.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 size-2 rounded-full bg-orange-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          Brouillon de lettre de motivation
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLetter}
                        >
                          {copiedLetter ? "Copié !" : "Copier la lettre"}
                        </Button>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                        {analysis.cover_letter_draft}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="border-t border-border/70 pt-7">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Informations utiles
              </h3>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl bg-background/70 p-3">
                  <Building2 className="mt-0.5 size-4 text-brand" />
                  <span>
                    Une description claire pour aider les candidats à se projeter rapidement dans le
                    poste.
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-background/70 p-3">
                  <MapPin className="mt-0.5 size-4 text-brand" />
                  <span>
                    Les informations de localisation et de type de contrat sont regroupées pour un
                    repérage rapide.
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-background/70 p-3">
                  <Send className="mt-0.5 size-4 text-brand" />
                  <span>Les boutons de candidature vous mènent directement vers le bon canal.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
