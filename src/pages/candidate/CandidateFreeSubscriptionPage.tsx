import {
  ArrowLeft,
  Bookmark,
  Check,
  Cpu,
  FileText,
  GitCompareArrows,
  Mail,
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
    <div className="mx-auto w-full max-w-6xl pb-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 text-sm font-medium">
        <Link to="/candidate/subscription">
          <ArrowLeft className="h-4 w-4" />
          Retour aux abonnements
        </Link>
      </Button>

      <main className="mt-6 space-y-8">
        <section className="border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Forfait gratuit
            </span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Accès de base
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                0 FCFA
              </h1>
              <p className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
                Jusqu’à 3 recommandations
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Les offres affichées dépendent des correspondances réellement disponibles avec votre
                profil.
              </p>
            </div>

            <div className="border-l border-border pl-0 lg:pl-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                En bref
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="border border-border bg-background p-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-secondary">3</span>
                    <span className="pb-1 text-sm text-muted-foreground">recommandations</span>
                  </div>
                </div>
                <div className="border border-border bg-background p-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-primary">4</span>
                    <span className="pb-1 text-sm text-muted-foreground">offres enregistrées</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Ce que ce forfait comprend</h2>
            </div>

            <div className="space-y-3">
              {generativeFeatures.map(({ label, description, icon: Icon }) => (
                <div key={label} className="flex gap-4 border-t border-border py-4 first:border-t-0 first:pt-0">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{label}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-background p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Le point essentiel
            </p>
            <div className="mt-5 border-l border-primary/30 pl-4">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Score</p>
              <p className="mt-3 text-4xl font-black tracking-tight text-foreground">Identique</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Le forfait ne modifie pas votre score. Il détermine uniquement le nombre de
                correspondances auxquelles vous pouvez accéder.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <GitCompareArrows className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Les limites de ce forfait</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {featureGroups.map(({ title, value, subtitle, icon: Icon }) => (
              <div key={title} className="border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {title}
                  </p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight text-foreground">{value}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">Comparatif rapide</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Identique pour tous
            </span>
          </div>

          <div className="mt-5 overflow-hidden border border-border">
            <div className="grid grid-cols-3 border-b border-border bg-background text-sm font-medium text-muted-foreground">
              <div className="px-4 py-3">Forfait</div>
              <div className="px-4 py-3">Recommandations</div>
              <div className="px-4 py-3">Offres enregistrées</div>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <div className="border-r border-border px-4 py-3 text-foreground">Gratuit</div>
              <div className="border-r border-border px-4 py-3 text-muted-foreground">3</div>
              <div className="px-4 py-3 text-muted-foreground">4</div>
            </div>
            <div className="grid grid-cols-3 bg-primary/5 text-sm">
              <div className="border-r border-border px-4 py-3 font-semibold text-foreground">Premium</div>
              <div className="border-r border-border px-4 py-3 text-muted-foreground">7</div>
              <div className="px-4 py-3 text-muted-foreground">7</div>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <div className="border-r border-border px-4 py-3 font-semibold text-foreground">Premium+</div>
              <div className="border-r border-border px-4 py-3 text-muted-foreground">Toutes</div>
              <div className="px-4 py-3 text-muted-foreground">10</div>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 text-center">
          <Button type="button" variant="default" size="lg" className="min-w-[220px]">
            Continuer avec le forfait gratuit
          </Button>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Le score de compatibilité est calculé de la même manière quel que soit le forfait.
          </p>
        </div>
      </main>
    </div>
  );
}
