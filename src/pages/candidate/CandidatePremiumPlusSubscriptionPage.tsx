import {
  ArrowLeft,
  BellRing,
  Bookmark,
  Check,
  FileText,
  GitCompareArrows,
  Mail,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const generativeFeatures = [
  {
    label: "Analyse CV ↔ offre",
    description:
      "Votre parcours est comparé aux missions et aux compétences recherchées pour vous aider à voir si le poste vous correspond.",
    icon: FileText,
  },
  {
    label: "Score de compatibilité",
    description:
      "Un score synthétique vous donne un premier repère sur la proximité entre votre profil et l’offre choisie.",
    icon: GitCompareArrows,
  },
  {
    label: "Forces et points à renforcer",
    description:
      "Vous identifiez rapidement les atouts de votre candidature et les compétences qui méritent une attention particulière.",
    icon: Check,
  },
  {
    label: "Résumé personnalisé",
    description:
      "Une lecture simple de votre profil met en évidence les éléments les plus importants pour le poste.",
    icon: Sparkles,
  },
  {
    label: "Lettre de motivation",
    description:
      "Une première lettre est préparée à partir de votre profil et de l’offre. Vous pouvez ensuite la relire et l’adapter.",
    icon: Mail,
  },
];

const premiumPlusBenefits = [
  "Toutes les recommandations correspondant réellement à votre profil.",
  "Jusqu’à 10 offres enregistrées pour garder les opportunités les plus pertinentes sous la main.",
  "Alertes par e-mail à venir : recevez des alertes lorsque de nouvelles offres présentent une forte correspondance avec votre profil.",
  "Filtres par niveau de compatibilité à venir : affinez l’affichage selon le niveau de correspondance.",
  "Un accès complet aux correspondances réellement disponibles dans votre profil.",
];

const featureGroups = [
  {
    title: "Recommandations",
    value: "Toutes",
    subtitle: "Toutes les recommandations disponibles",
    icon: Sparkles,
  },
  {
    title: "Offres enregistrées",
    value: "10",
    subtitle: "Gardez jusqu’à 10 offres préférées à portée de main.",
    icon: Bookmark,
  },
  {
    title: "Outils de suivi",
    value: "À venir",
    subtitle: "Alertes par e-mail et filtres de compatibilité bientôt disponibles.",
    icon: BellRing,
  },
];

export function CandidatePremiumPlusSubscriptionPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 text-sm font-medium">
        <Link to="/candidate/subscription">
          <ArrowLeft className="h-4 w-4" />
          Retour aux abonnements
        </Link>
      </Button>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <CrownIcon />
              </div>
              <span className="inline-flex rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
                Premium+
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Le plus complet
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                1 050 FCFA / mois
              </h1>
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground sm:text-2xl">
                Pour accéder à l’ensemble des opportunités correspondant à votre profil.
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Consultez toutes les offres pour lesquelles une correspondance avec votre profil est
                réellement disponible.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              Accès complet
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-foreground">Toutes</span>
            </div>
            <div className="mt-4 h-px w-full bg-secondary/40" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Le score reste calculé de la même manière pour tous les candidats. Premium+ élargit
              uniquement l’accès aux correspondances disponibles.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Ce que ce forfait inclut</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featureGroups.map(({ title, value, subtitle, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {title}
                </p>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight text-foreground">{value}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Ce que vous pouvez faire avec ce forfait
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generativeFeatures.map(({ label, description, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <GitCompareArrows className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Ce qui change avec Premium+</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recommandations
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Toutes les recommandations correspondant réellement à votre profil.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Score
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Votre score reste toujours le même. Premium+ vous donne accès à davantage de
                correspondances, il n’augmente pas artificiellement votre score.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Ce que Premium+ vous apporte en plus
          </p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {premiumPlusBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Comparatif des forfaits</h2>
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            Premium+
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-medium text-muted-foreground">Gratuit</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Recommandations</span>: 3
              </p>
              <p>
                <span className="font-semibold text-foreground">Offres enregistrées</span>: 4
              </p>
              <p>
                <span className="font-semibold text-foreground">Alertes e-mail</span>: —
              </p>
              <p>
                <span className="font-semibold text-foreground">Filtres compatibilité</span>: —
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-medium text-muted-foreground">Premium</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Recommandations</span>: 7
              </p>
              <p>
                <span className="font-semibold text-foreground">Offres enregistrées</span>: 7
              </p>
              <p>
                <span className="font-semibold text-foreground">Alertes e-mail</span>: —
              </p>
              <p>
                <span className="font-semibold text-foreground">Filtres compatibilité</span>: —
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
            <p className="text-sm font-medium text-secondary">Premium+</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Recommandations</span>: Toutes
              </p>
              <p>
                <span className="font-semibold text-foreground">Offres enregistrées</span>: 10
              </p>
              <p>
                <span className="font-semibold text-foreground">Alertes e-mail</span>: ✓ à venir
              </p>
              <p>
                <span className="font-semibold text-foreground">Filtres compatibilité</span>: ✓ à
                venir
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center justify-center gap-2 pt-2 text-center">
        <Button type="button" variant="secondary" size="lg" className="min-w-[220px]" disabled>
          Bientôt disponible
        </Button>
        <p className="text-sm text-muted-foreground">
          Le paiement et l’activation de ce forfait seront disponibles prochainement.
        </p>
      </div>
    </div>
  );
}

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 19h18l-1-10-5 3-4-8-4 8-5-3-1 10Z" />
      <path d="M7 19v1M17 19v1" />
    </svg>
  );
}
