import {
  ArrowLeft,
  BellRing,
  Bookmark,
  Check,
  Cpu,
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

const matchingPoints = [
  "Rapprochement entre votre profil et les offres pour repérer les meilleures correspondances.",
  "Une recommandation de poste qui s’appuie sur votre parcours et sur les missions recherchées.",
  "Le matching sert à orienter votre lecture, il ne remplace pas votre jugement.",
];

const featureGroups = [
  {
    title: "Recommandations",
    value: "3",
    subtitle: "Jusqu’à 3 recommandations",
    icon: Sparkles,
  },
  {
    title: "Offres enregistrées",
    value: "4",
    subtitle: "Gardez jusqu’à 4 offres préférées à portée de main.",
    icon: Bookmark,
  },
  {
    title: "Outils de suivi",
    value: "—",
    subtitle: "Suivi simple de vos offres sélectionnées.",
    icon: Check,
  },
];

export function CandidateFreeSubscriptionPage() {
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="inline-flex rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Forfait Gratuit
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Accès de base
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                0 FCFA
              </h1>
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground sm:text-2xl">
                Jusqu’à 3 recommandations
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Les offres affichées dépendent des correspondances réellement disponibles avec votre
                profil.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              Valeur clé
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-foreground">3</span>
              <span className="pb-1 text-sm font-medium text-muted-foreground">
                recommandations
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-secondary/40" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Le score de compatibilité est calculé de la même manière pour tous les forfaits.
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
            Les outils intelligents disponibles
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

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <GitCompareArrows className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Matching algorithmique</h2>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            Le matching ne génère pas de texte. Il sert à identifier les offres présentant le
            meilleur niveau de proximité avec votre profil.
          </div>

          <ul className="space-y-3 text-sm text-muted-foreground">
            {matchingPoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Vos recommandations
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-black leading-none tracking-tight text-secondary">
              3
            </span>
            <span className="pb-2 text-sm font-medium text-muted-foreground">recommandations</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Vous voyez jusqu’à 3 offres parmi les correspondances réellement disponibles avec votre
            profil.
          </p>
          <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-foreground">
            Le score ne change pas selon votre forfait. Seul le nombre de recommandations visibles
            est différent.
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Comparatif des forfaits</h2>
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Identique
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

          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
            <p className="text-sm font-medium text-secondary">Premium</p>
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

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Premium+</p>
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
