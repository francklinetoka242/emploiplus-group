import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
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
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { useJobOfferBySlug } from "@/hooks/usePublishedOffers";
import { ShareButtons } from "@/components/site/ShareButtons";

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
  const { job, loading } = useJobOfferBySlug(slug);

  if (loading) {
    return (
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <p className="text-muted-foreground">{t("jobs.loading")}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return <NotFoundPage />;
  }

  const title = job.meta_title || `${job.title} | ${job.company}`;
  const description =
    job.meta_description || job.description?.slice(0, 160) || t("jobs.page.description");
  const ogImage = job.og_image || job.cover_image || `${BASE_URL}/og-default.svg`;
  const canonical = `${BASE_URL}/jobs/${job.slug}`;
  const location =
    [job.location_city, job.location_country].filter(Boolean).join(", ") ||
    t("jobs.location.remote");
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
  const getLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };
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
  const tags = (job.tags || []).filter(Boolean);
  const requirementItems = (job.requirements || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
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
        structuredData={{
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: job.publish_at || undefined,
          validThrough: job.expires_at || undefined,
          employmentType: job.contract_type,
          hiringOrganization: {
            "@type": "Organization",
            name: job.company,
            sameAs: BASE_URL,
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location_city || undefined,
              addressCountry: job.location_country || undefined,
            },
          },
        }}
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-border/70 bg-gradient-to-br from-background via-card to-primary/5 p-8 shadow-soft">
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
                    <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {job.title}
                    </h1>
                    <p className="text-base text-muted-foreground">
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
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-brand" />
                    {label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-border/70 bg-card p-8 shadow-soft">
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
              <div className="rounded-[28px] border border-border/70 bg-card p-8 shadow-soft">
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
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-border/70 bg-card p-7 shadow-soft">
              <h3 className="font-display text-xl font-semibold text-foreground">{applyTitle}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{applyDescription}</p>
              <div className="mt-6 space-y-3">
                {job.application_email ? (
                  <a
                    href={`mailto:${job.application_email}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
                  >
                    <Send className="size-4" />
                    {applyByEmailLabel}
                  </a>
                ) : null}
                {job.application_whatsapp ? (
                  <a
                    href={`https://wa.me/${job.application_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/5"
                  >
                    <MessageSquare className="size-4" />
                    {applyByWhatsappLabel}
                  </a>
                ) : null}
                {job.external_link ? (
                  <a
                    href={job.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/5"
                  >
                    <ExternalLink className="size-4" />
                    {applyExternalLabel}
                  </a>
                ) : null}
                {!job.application_email && !job.application_whatsapp && !job.external_link ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    Veuillez retrouver l'adresse mail de cette entreprise en bas dans la description
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-card p-7 shadow-soft">
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
