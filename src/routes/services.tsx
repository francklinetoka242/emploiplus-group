import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Building2, Globe2, Rocket, Sparkles, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — EmploiPlus Group" },
      { name: "description", content: "Solutions tech, diffusion d'offres d'emploi et contenu média par EmploiPlus Group." },
      { property: "og:title", content: "Services — EmploiPlus Group" },
      { property: "og:description", content: "Solutions tech, diffusion d'offres d'emploi et contenu média." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const fallback = [
  { icon: Briefcase, title: "Diffusion d'offres d'emploi", description: "Publiez vos offres, atteignez les meilleurs candidats et laissez-nous aider votre entreprise à recruter les profils idéaux." },
  { icon: Rocket, title: "Développement web & applications", description: "Sites, plateformes SaaS, applications métier — conçus pour performer." },
  { icon: Sparkles, title: "Contenu média & blog", description: "Rédaction d'articles, stratégie éditoriale et publication régulière." },
  { icon: Building2, title: "Branding employeur", description: "Mettez en valeur votre marque pour attirer et fidéliser les talents." },
  { icon: Globe2, title: "Stratégie digitale & SEO", description: "Plan d'action complet pour développer votre présence en ligne." },
  { icon: Zap, title: "Conseil & accompagnement", description: "Audit, conseil et formation pour réussir votre transformation digitale." },
];

function ServicesPage() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["services-page"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });
  const items = data && data.length > 0 ? data : fallback;
  
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-brand/5 via-transparent to-accent/5 border-b border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-xs font-medium text-brand mb-6">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              Nos services
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Solutions complètes pour votre croissance digitale
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              De la diffusion d'offres d'emploi au développement web, en passant par le contenu média et le conseil stratégique, EmploiPlus Group vous accompagne dans chaque étape de votre transformation numérique.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/jobs">Consulter les offres</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
              Une gamme de services sur mesure
            </h2>
            <p className="mt-4 text-muted-foreground">
              Chaque service est conçu pour répondre à vos besoins spécifiques et propulser votre entreprise vers le succès.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s: any, i: number) => {
              const Icon = (s as any).icon ?? fallback[i % fallback.length].icon;
              return (
                <motion.article
                  key={s.id ?? s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                  className="group rounded-2xl bg-card border border-border p-8 hover:shadow-elev hover:border-brand/50 transition-all"
                >
                  {s.image ? (
                    <div className="aspect-[16/9] rounded-lg overflow-hidden mb-6 bg-muted">
                      <img src={s.image} alt={s.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ) : (
                    <div className="size-14 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="size-6" />
                    </div>
                  )}
                  {s.category && <div className="text-[10px] uppercase tracking-widest font-bold text-brand mb-2">{s.category}</div>}
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-brand transition-colors">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>En savoir plus</span>
                    <ArrowRight className="size-4" />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 md:py-28 bg-card/50 border-y border-border">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-12">
              Pourquoi nous choisir ?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                "Expertise reconnue en tech et médias emploi",
                "Équipe dédiée et accompagnement personnalisé",
                "Solutions modulables adaptées à votre budget",
                "Résultats mesurables et rapports détaillés",
                "Plateforme sécurisée et performante",
                "Support client réactif et professionnel",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex gap-3 items-start"
                >
                  <CheckCircle2 className="size-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="rounded-3xl gradient-brand p-12 md:p-16 text-center shadow-brand">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-foreground">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="mt-4 text-brand-foreground/85 max-w-2xl mx-auto text-lg">
              Parlons de vos objectifs et découvrez comment EmploiPlus Group peut vous aider à les atteindre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90 font-semibold">
                <Link to="/contact">Commencer maintenant</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/jobs">Voir les offres d'emploi</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
