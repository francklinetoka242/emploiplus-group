import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Zap, TrendingUp, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

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
              Notre histoire
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
              Connecter les talents aux opportunités
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              EmploiPlus Group est une entreprise technologique pionnière qui transforme la façon dont les entreprises recrutent, communiquent et se développent numériquement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="grid gap-12 md:gap-16 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-xs uppercase tracking-widest font-bold text-brand mb-3">Qui sommes-nous</div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-6">
                L'expertise tech et recruitement au service de votre croissance
              </h2>
              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>
                  EmploiPlus Group combine expertises technologiques avancées, connaissance approfondie du marché de l'emploi et stratégie de communication digitale. Nous accompagnons les entreprises à chaque étape de leur transformation numérique.
                </p>
                <p>
                  Depuis notre création, nous avons aidé des centaines d'entreprises à recruter les meilleurs talents, optimiser leur présence digitale et développer des solutions technologiques innovantes.
                </p>
                <p>
                  Notre approche ? Écouter, comprendre et livrer des solutions sur mesure qui dépassent les attentes.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-brand">
                  <Link to="/contact">Nous contacter</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: TrendingUp, label: "Croissance", value: "+150%" },
                { icon: Users, label: "Talents connectés", value: "5000+" },
                { icon: Zap, label: "Projets réussis", value: "300+" },
                { icon: Target, label: "Taux de satisfaction", value: "98%" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="rounded-2xl bg-card border border-border p-6 text-center"
                  >
                    <div className="size-12 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand mx-auto mb-3">
                      <Icon className="size-5" />
                    </div>
                    <div className="font-display text-2xl font-bold text-brand">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* MISSION VISION VALUES */}
      <section className="py-20 md:py-28 bg-card/50 border-y border-border">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
              Notre engagement
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mission, vision et valeurs qui guident chaque décision chez EmploiPlus Group
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { 
                icon: Target, 
                title: "Mission", 
                text: "Connecter les talents aux meilleures opportunités et accompagner les entreprises dans leur transformation digitale avec des solutions innovantes et adaptées." 
              },
              { 
                icon: Eye, 
                title: "Vision", 
                text: "Devenir la plateforme de référence pour le recrutement, le contenu médias emploi et les services numériques en Afrique francophone et au-delà." 
              },
              { 
                icon: Heart, 
                title: "Valeurs", 
                text: "Qualité, transparence, impact social, proximité avec notre communauté et excellence dans chaque projet que nous réalisons." 
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-background border border-border p-8 hover:shadow-elev hover:border-brand/50 transition-all"
              >
                <div className="size-14 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand mb-5">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE AREAS */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
              Nos domaines d'expertise
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trois piliers qui structurent notre offre et notre impact
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Tech & Développement",
                description: "Solutions web, applications mobiles, plateformes SaaS et infrastructure cloud. Nous construisons la technologie qui propulse votre entreprise.",
                skills: ["Web Development", "Applications", "Cloud Architecture", "DevOps"]
              },
              {
                title: "Emploi & Recrutement",
                description: "Diffusion d'offres d'emploi, branding employeur et stratégie de recrutement. Nous connectons vos talents avec vos opportunités.",
                skills: ["Job Distribution", "Employer Branding", "Recruitment", "Talent Sourcing"]
              },
              {
                title: "Médias & Contenu",
                description: "Blog, articles de référence, stratégie éditoriale et contenu marketing. Nous amplifions votre voix dans l'écosystème tech.",
                skills: ["Content Strategy", "Editorial", "SEO & Growth", "Digital Marketing"]
              },
            ].map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-card border border-border p-8"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{area.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-xs font-medium text-brand">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="rounded-3xl gradient-brand p-12 md:p-16 text-center shadow-brand">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-foreground">
              Parlons de votre projet
            </h2>
            <p className="mt-4 text-brand-foreground/85 max-w-2xl mx-auto text-lg">
              Que vous ayez besoin de recruter, développer une solution technologique ou amplifier votre présence digitale, notre équipe est prête à vous accompagner.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90 font-semibold">
                <Link to="/contact">Démarrer une discussion</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/services">Voir nos services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
