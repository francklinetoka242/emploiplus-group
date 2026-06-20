import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — EmploiPlus Group" },
      { name: "description", content: "EmploiPlus Group : entreprise technologique, média emploi et plateforme de services numériques." },
      { property: "og:title", content: "À propos — EmploiPlus Group" },
      { property: "og:description", content: "Tech Company · Job Media · Digital Services Platform." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-brand">EmploiPlus Group</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold">{t("about.title")}</h1>
        <p className="mt-4 text-muted-foreground text-lg">{t("about.subtitle")}</p>
        <div className="mt-8 space-y-5 text-foreground/90 leading-relaxed">
          <p>
            EmploiPlus Group est une entreprise technologique qui combine <strong>services numériques</strong>, <strong>diffusion d'opportunités professionnelles</strong> et <strong>contenu média</strong>.
            Notre mission : connecter les entreprises aux meilleurs talents et accompagner les organisations dans leur transformation digitale.
          </p>
          <p>
            Notre plateforme diffuse chaque semaine des dizaines d'offres d'emploi, publie des articles de référence sur l'emploi et la tech,
            et propose un ensemble de services pour faire grandir votre marque.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          { icon: Target, title: "Mission", text: "Connecter les talents aux opportunités et accompagner la croissance digitale des entreprises." },
          { icon: Eye, title: "Vision", text: "Devenir la référence Tech + Job Media en Afrique francophone et au-delà." },
          { icon: Heart, title: "Valeurs", text: "Qualité, transparence, impact et proximité avec notre communauté." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-card border border-border p-6">
            <div className="size-11 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand mb-4">
              <Icon className="size-5" />
            </div>
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
