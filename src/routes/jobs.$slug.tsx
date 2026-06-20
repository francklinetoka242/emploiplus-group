import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Mail, MapPin, MessageCircle, ExternalLink, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { ShareButtons } from "@/components/site/ShareButtons";
import { formatDate } from "@/lib/utils-ext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("job_offers")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return { job: data };
  },
  head: ({ params, loaderData }) => {
    const j = loaderData?.job;
    const title = j ? `${j.title} — ${j.company}` : "Offre — EmploiPlus Group";
    const description = j?.description?.slice(0, 160) ?? "Offre publiée sur EmploiPlus Group";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/jobs/${params.slug}` },
        ...(j?.cover_image ? [{ property: "og:image", content: j.cover_image }, { name: "twitter:image", content: j.cover_image }] : []),
      ],
      links: [{ rel: "canonical", href: `/jobs/${params.slug}` }],
      scripts: j ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: j.title,
          description: j.description,
          datePosted: j.created_at,
          validThrough: j.expires_at,
          employmentType: j.contract_type,
          hiringOrganization: { "@type": "Organization", name: j.company, logo: j.company_logo ?? undefined },
          jobLocation: (j.location_city || j.location_country) ? {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: j.location_city, addressCountry: j.location_country },
          } : undefined,
        }),
      }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Offre introuvable</h1>
      <p className="mt-2 text-muted-foreground">Cette offre n'existe plus ou a été archivée.</p>
      <Button asChild className="mt-6"><Link to="/jobs">Voir toutes les offres</Link></Button>
    </div>
  ),
  errorComponent: () => (
    <div className="container-page py-24 text-center">
      <p className="text-muted-foreground">Erreur de chargement.</p>
    </div>
  ),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { job } = Route.useLoaderData();
  const { t, locale } = useI18n();

  const { data: similar } = useQuery({
    queryKey: ["similar-jobs", job.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_offers")
        .select("id, slug, title, company, contract_type")
        .eq("status", "published")
        .neq("id", job.id)
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const pageUrl = typeof window !== "undefined" ? window.location.href : `/jobs/${job.slug}`;

  return (
    <article className="container-page py-10 md:py-14">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("nav.jobs")}
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10 mt-6">
        <div>
          {job.cover_image && (
            <div className="aspect-[16/8] rounded-2xl overflow-hidden mb-8 bg-muted">
              <img src={job.cover_image} alt={job.title} className="size-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company} className="size-12 rounded-lg object-cover border border-border" />
            ) : (
              <div className="size-12 rounded-lg gradient-brand grid place-items-center text-brand-foreground">
                <Briefcase className="size-5" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium">{job.company}</div>
              {(job.location_city || job.location_country) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {[job.location_city, job.location_country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">{job.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {job.contract_type && (
              <span className="px-2.5 py-1 rounded-full bg-accent text-[--brand-deep] font-semibold uppercase tracking-wide">
                {job.contract_type}
              </span>
            )}
            <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {formatDate(job.created_at, locale)}</span>
          </div>

          <div className="mt-8 prose prose-slate max-w-none">
            <div className="whitespace-pre-line text-foreground/90 leading-relaxed">{job.description}</div>
            {job.requirements && (
              <>
                <h2 className="font-display text-xl font-bold mt-8">{t("jobs.detail.requirements")}</h2>
                <div className="whitespace-pre-line text-foreground/90 leading-relaxed">{job.requirements}</div>
              </>
            )}
          </div>

          <div className="mt-10 rounded-2xl bg-secondary/50 border border-border p-6">
            <h2 className="font-display text-lg font-bold mb-4">{t("jobs.detail.howToApply")}</h2>
            <div className="flex flex-wrap gap-3">
              {job.application_email && (
                <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
                  <a href={`mailto:${job.application_email}?subject=${encodeURIComponent("Candidature: " + job.title)}`}>
                    <Mail className="mr-1.5 size-4" /> {t("jobs.detail.applyEmail")}
                  </a>
                </Button>
              )}
              {job.application_whatsapp && (
                <Button asChild className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  <a href={`https://wa.me/${job.application_whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour, je postule pour " + job.title)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-1.5 size-4" /> {t("jobs.detail.applyWhatsapp")}
                  </a>
                </Button>
              )}
              {job.external_link && (
                <Button asChild variant="outline">
                  <a href={job.external_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 size-4" /> {t("jobs.detail.applyExternal")}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold mb-3">{t("cta.share")}</div>
            <ShareButtons url={pageUrl} text={`${t("jobs.share.text")}: ${job.title} — ${job.company}`} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Autres offres</h3>
            <div className="space-y-3">
              {(similar ?? []).map((s) => (
                <Link key={s.id} to="/jobs/$slug" params={{ slug: s.slug }} className="block group">
                  <div className="text-sm font-semibold group-hover:text-brand transition-colors line-clamp-2">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.company}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
