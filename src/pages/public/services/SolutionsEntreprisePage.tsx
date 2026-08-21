import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BriefcaseBusiness,
  FolderKanban,
  ShieldCheck,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";

const canonical = `${BASE_URL}/services/solutions-entreprises-bpo`;

const processSteps = [
  {
    label: "01",
    eyebrow: "Vous avez un besoin",
    title: "Externalisation de processus métier",
    description: "Libérez vos équipes en nous confiant l'exécution de vos processus opérationnels.",
    detail: "Service client, prospection, saisie de données, modération, archivage et gestion administrative.",
    icon: BriefcaseBusiness,
  },
  {
    label: "02",
    eyebrow: "Nous analysons",
    title: "Délégation de personnel",
    description: "Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.",
    detail: "Mise à disposition rapide de personnel qualifié, avec gestion du contrat et de l'administratif RH.",
    icon: Users,
  },
  {
    label: "03",
    eyebrow: "Nous déployons",
    title: "Gestion de projets et équipes",
    description: "Bénéficiez d'une exécution clé en main pour vos projets stratégiques.",
    detail: "Déploiement et supervision d'équipes dédiées sur le terrain ou à distance.",
    icon: FolderKanban,
  },
  {
    label: "04",
    eyebrow: "Nous pilotons",
    title: "Suivi opérationnel",
    description: "Optimisez vos flux avec un accompagnement permanent et mesurable.",
    detail: "Chaque action est mesurée, ajustée et restituée pour permettre des décisions rapides.",
    icon: BarChart3,
  },
  {
    label: "05",
    eyebrow: "Vous gagnez du temps",
    title: "Une organisation plus légère",
    description: "Concentrez vos équipes sur l'essentiel pendant qu'EmploiPlus coordonne les opérations.",
    detail: "Des cycles raccourcis, des coûts contenus et une exécution fluide, sans surcharge interne.",
    icon: ShieldCheck,
  },
];

export default function SolutionsEntreprisePage() {
  return (
    <>
      <SEO
        title="Solutions Entreprises / BPO"
        description="Un processus métier clair, puissant et parfaitement orchestré, pour externaliser vos opérations et renforcer vos performances RH."
        canonical={canonical}
        robots="index,follow"
      />

      <main className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <section className="relative overflow-hidden px-4 pb-10 pt-0 sm:px-8 lg:px-10">
            <div className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary slide-in-left slide-delay-1">
                Solutions Entreprises / BPO
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground slide-in-right slide-delay-2">Un processus métier clair, puissant et parfaitement orchestré.</h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground slide-in-up slide-delay-3">
                  Vos besoins sont traduits en un workflow précis, avec des points de contrôle, des connexions visuelles et une promesse de résultat opérationnel.
                </p>
              </div>
              </div>

              <div className="border-l-2 border-secondary/30 pl-5 slide-in-up slide-delay-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Votre bénéfice</p>
                <p className="mt-3 text-xl font-semibold leading-8 text-foreground">Une équipe opérationnelle qui avance avec vous.</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Un interlocuteur, des indicateurs clairs et une exécution suivie.</p>
              </div>
            </div>

            <div className="relative mt-12 border-t border-border/80">
              {processSteps.map(({ label, eyebrow, title, description, detail, icon: Icon }, index) => (
                <article
                  key={title}
                  className="group grid gap-5 border-b border-border/80 py-7 transition-colors duration-300 hover:border-secondary/60 slide-in-up md:grid-cols-[72px_190px_minmax(0,1fr)] md:items-start"
                  style={{ animationDelay: `${index * 100 + 120}ms` }}
                >
                  <div className="flex items-center gap-3 md:block">
                    <span className="text-3xl font-light tracking-tight text-secondary/70 transition-colors duration-300 group-hover:text-secondary">{label}</span>
                    <span className="block h-px w-8 bg-secondary/40 md:mt-3" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                    <div>
                      <h2 className="flex items-start gap-3 text-2xl font-semibold leading-tight text-foreground">
                        <Icon className="mt-0.5 h-6 w-6 shrink-0 text-secondary transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                        {title}
                      </h2>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
                    </div>
                    <p className="border-l border-border pl-5 text-sm leading-7 text-muted-foreground lg:pt-1">{detail}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 border-y border-secondary/30 py-8 slide-in-up slide-delay-7 sm:py-10">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center lg:gap-12">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Parlons de votre activité</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Prêt à optimiser vos opérations dès maintenant ?
                  </h3>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                    Expliquez-nous votre besoin, vos contraintes et vos priorités. Notre équipe vous répond avec une proposition adaptée à votre réalité.
                  </p>
                </div>
                <div className="lg:border-l lg:border-border lg:pl-8">
                  <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Link to="/contact">Nous contacter</Link>
                  </Button>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">Un premier échange pour cadrer le besoin, sans engagement.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
            >
              Retour aux services
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
