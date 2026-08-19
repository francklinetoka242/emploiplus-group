import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/site/ShareButtons";

type JobCardJob = {
  slug: string;
  application_email?: string | null;
  external_link?: string | null;
  salary?: string | null;
  title: string;
  company: string;
  requirements?: string | null;
};

export type JobCardProps = {
  job: JobCardJob;
  location: string;
  previewText: string;
  contractLabel: string | null;
  tags: string[];
  deadlineValue: string | null;
  isExpired: boolean;
  t?: (key: string) => string;
  index?: number;
  onApplyClick?: () => void;
  hideRequirementsSection?: boolean;
  matchScore?: number;
  variant?: "card" | "list";
};

export function JobCard({
  job,
  location,
  previewText,
  contractLabel,
  tags,
  deadlineValue,
  isExpired,
  t = (k: string) => k,
  index = 0,
  onApplyClick,
  hideRequirementsSection = false,
  matchScore,
  variant = "card",
}: JobCardProps) {
  const [isApplyOpen, setIsApplyOpen] = React.useState(false);
  const detailUrl = `/jobs/${job.slug}`;
  const applyOptions = [
    job.application_email
      ? { label: "Par email", href: `mailto:${job.application_email}`, icon: Mail }
      : null,
    job.external_link
      ? { label: "Via le lien", href: job.external_link, icon: ExternalLink }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Mail }>;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/jobs/${job.slug}` : undefined;
  const shareText = `Offre d'emploi : ${job.title} chez ${job.company}\n\n${previewText.slice(0, 220)}\n\nOffre partagée depuis https://emploiplus-group.com`;

  const handleApplyClick = () => {
    if (onApplyClick) {
      onApplyClick();
    } else {
      setIsApplyOpen((value) => !value);
    }
  };

  const isList = variant === "list";

  return (
    <article
      className={`relative flex h-full overflow-hidden border border-border/80 bg-card shadow-soft transition-all duration-300 hover:border-brand/30 hover:shadow-elev focus-within:border-brand/40 ${isList ? "flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5" : "flex-col rounded-2xl p-5"} ${isExpired ? "opacity-70 grayscale-[0.2]" : ""}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-brand" />
      <div className={`relative z-10 ${isList ? "min-w-0 flex-1" : ""}`}>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="size-4 shrink-0 text-brand" />
              <span className="truncate">{job.company || "Entreprise non renseignée"}</span>
            </div>
            <h3 className="mt-1 block line-clamp-2 text-lg font-bold leading-snug !text-foreground sm:text-xl">
              {job.title || "Offre d'emploi"}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {typeof matchScore === "number" ? (
            <span className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
              {Math.round(Math.max(0, Math.min(1, matchScore)) * 100)}% de match
            </span>
          ) : null}
          {contractLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-semibold uppercase text-brand">
              <BriefcaseBusiness className="size-3.5" />
              {contractLabel}
            </span>
          ) : null}
          </div>
        </div>

        {isList ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="size-4 shrink-0 text-brand" />
              <span className="truncate">{location}</span>
            </span>
            {job.salary ? (
              <span className="flex min-w-0 items-center gap-2">
                <BadgeDollarSign className="size-4 shrink-0 text-brand" />
                <span className="truncate">{job.salary}</span>
              </span>
            ) : null}
            {deadlineValue ? (
              <span className={`flex min-w-0 items-center gap-2 ${isExpired ? "text-destructive" : ""}`}>
                <CalendarDays className="size-4 shrink-0 text-brand" />
                {isExpired ? "Expirée le" : "Jusqu'au"} {new Date(deadlineValue).toLocaleDateString("fr-FR")}
              </span>
            ) : null}
          </div>
        ) : null}

        {previewText && isList ? (
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-foreground/75">
            {previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText}
          </p>
        ) : null}
      </div>

      {!isList ? <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-y border-border/60 py-3 text-sm text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-brand" />
          <span className="truncate">{location}</span>
        </div>
        {deadlineValue ? (
          <div
            className={`flex min-w-0 items-center gap-2 ${isExpired ? "text-destructive" : ""}`}
          >
            <CalendarDays className="size-4 shrink-0 text-brand" />
            <span className="truncate">
              {isExpired ? "Expirée le" : "Jusqu'au"} {new Date(deadlineValue).toLocaleDateString("fr-FR")}
            </span>
          </div>
        ) : null}
        {job.salary ? (
          <div className="flex min-w-0 items-center gap-2">
            <BadgeDollarSign className="size-4 shrink-0 text-brand" />
            <span className="truncate">{job.salary}</span>
          </div>
        ) : null}
      </div> : null}

      {previewText && !isList ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/75">
          {previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText}
        </p>
      ) : null}

      {!isList && !hideRequirementsSection && job.requirements ? (
        <div className="mt-3 border-l-2 border-brand/30 pl-3 text-sm leading-relaxed text-foreground/75">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Profil recherché</div>
          <p className="line-clamp-3 whitespace-pre-line">{job.requirements}</p>
        </div>
      ) : null}

      {tags.length > 0 && !isList ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Sparkles className="size-3" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className={`${isList ? "shrink-0" : "mt-auto border-t border-border/60 pt-4"} flex flex-wrap items-center gap-2`}>
        <Link
          to={detailUrl}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2"
          aria-label={`Voir plus : ${job.title}`}
        >
          Voir l'offre
          <ArrowUpRight className="size-4" />
        </Link>
        {applyOptions.length > 0 || onApplyClick ? (
          <div className="relative">
            <Button
              type="button"
              size="sm"
              className="h-10 rounded-xl bg-brand px-4 font-semibold text-brand-foreground shadow-sm hover:bg-brand/90"
              onClick={handleApplyClick}
            >
              Postuler
            </Button>
            {!onApplyClick && isApplyOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-border bg-card p-2 shadow-lg">
                {applyOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <a
                      key={option.label}
                      href={option.href}
                      target={option.href.startsWith("http") ? "_blank" : undefined}
                      rel={option.href.startsWith("http") ? "noreferrer" : undefined}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-background/80"
                    >
                      <Icon className="size-4 text-brand" />
                      <span>{option.label}</span>
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
        {shareUrl ? (
          <div className="ml-auto">
            <ShareButtons url={shareUrl} text={shareText} variant="compact" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default JobCard;
