import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";

const canonical = `${BASE_URL}/services/solutions-entreprises-bpo`;

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
          <section className="p-10">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                Solutions Entreprises / BPO
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Un processus métier clair, puissant et parfaitement orchestré.</h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  Vos besoins sont traduits en un workflow précis, avec des points de contrôle, des connexions visuelles et une promesse de résultat opérationnel.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-8">
              <article className="border border-border/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Vous avez un besoin</p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Externalisation de Processus Métier (BPO - Business Process Outsourcing)</h2>
                <p className="mt-3 text-muted-foreground">
                  Libérez vos équipes : confiez-nous l'exécution de vos processus opérationnels.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Prise en charge intégrale de vos tâches récurrentes ou sous-traitées (Service client, prospection, saisie de données, modération, archivage et gestion administrative).
                </p>
              </article>

              <article className="border border-border/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Nous analysons</p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Délégation de Personnel & Mise à Disposition</h2>
                <p className="mt-3 text-muted-foreground">
                  Renforcez vos effectifs sur mesure sans alourdir votre masse salariale.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Mise à disposition rapide de personnel qualifié (hôtes d'accueil, agents administratifs, techniciens, commerciaux terrain). EmploiPlus gère le contrat et l'administratif RH.
                </p>
              </article>

              <article className="border border-border/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Nous déployons</p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Gestion de Projets & Équipes Déléguées</h2>
                <p className="mt-3 text-muted-foreground">
                  Une exécution clé en main pour vos projets stratégiques.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Déploiement et supervision directe d'équipes opérationnelles dédiées pour réaliser vos projets spécifiques sur le terrain ou à distance.
                </p>
              </article>

              <article className="border border-border/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Nous pilotons</p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Suivi opérationnel et amélioration continue</h2>
                <p className="mt-3 text-muted-foreground">
                  Un accompagnement permanent pour optimiser vos flux et garantir la performance de chaque mission.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Chaque action est mesurée, ajustée et restituée dans un pilotage transparent, pour des décisions rapides et un impact mesurable.
                </p>
              </article>

              <article className="border border-border/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-secondary/70">Vous gagnez du temps</p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Une organisation plus légère, plus sûre, plus réactive</h2>
                <p className="mt-3 text-muted-foreground">
                  Vos équipes peuvent se concentrer sur l’essentiel pendant qu’EmploiPlus coordonne les opérations.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Le résultat : des cycles raccourcis, des coûts contenus et une exécution fluide, sans surcharge interne.
                </p>
              </article>
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
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
