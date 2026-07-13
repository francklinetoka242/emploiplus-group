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

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elev fade-up ${isExpired ? "opacity-70 grayscale-[0.2]" : ""}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand via-brand/70 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand/80">
            <Building2 className="size-3.5" />
            <span>{job.company}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-foreground">{job.title}</h3>
        </div>
        {contractLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <BriefcaseBusiness className="size-3.5" />
            {contractLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex min-w-[0] flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80">
          <MapPin className="size-4 shrink-0 text-brand" />
          <span className="truncate">{location}</span>
        </div>
        {deadlineValue ? (
          <div
            className={`flex min-w-[0] flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80 ${isExpired ? "text-muted-foreground" : ""}`}
          >
            <CalendarDays className="size-4 shrink-0 text-brand" />
            <span className="truncate">
              Date limite : {new Date(deadlineValue).toLocaleDateString("fr-FR")}
              {isExpired ? " • Expirée" : ""}
            </span>
          </div>
        ) : null}
        {job.salary ? (
          <div className="flex w-full items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground/80">
            <BadgeDollarSign className="size-4 shrink-0 text-brand" />
            <span>{job.salary}</span>
          </div>
        ) : null}
      </div>

      {previewText ? (
        <p className="mt-3 rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-foreground/80 leading-relaxed">
          {previewText.length > 180 ? `${previewText.slice(0, 177)}...` : previewText}
        </p>
      ) : null}

      {tags.length > 0 ? (
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

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button asChild size="sm" className="h-9 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90">
          <Link to={detailUrl}>Voir plus</Link>
        </Button>
        {applyOptions.length > 0 || onApplyClick ? (
          <div className="relative">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-full border border-brand/20 bg-background/80 px-4 text-foreground hover:bg-primary/5"
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
          <div>
            <ShareButtons url={shareUrl} text={shareText} variant="compact" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default JobCard;
