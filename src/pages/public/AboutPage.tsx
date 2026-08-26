import React from "react";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, BriefcaseBusiness, Handshake, Plus, Settings2, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import francklinImage from "@/assets/about/team/francklin-etoka.webp";
import destineeImage from "@/assets/about/team/destinee-mouissou.webp";
import claudeImage from "@/assets/about/team/claude-omvoulet.webp";
import aboutImage from "@/assets/about/img-a-s-1.webp";
import aboutMotif from "@/assets/about/motif-about.webp";
import teamBackground from "@/assets/home/enterprise-team-03.webp";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations/animations";

export function AboutPage() {
  const { t } = useI18n();

  const values = [
    {
      icon: <Handshake className="h-7 w-7 text-brand" aria-hidden="true" />,
      title: t("about.values.item1.title"),
      description: t("about.values.item1.description"),
    },
    {
      icon: <Settings2 className="h-7 w-7 text-brand" aria-hidden="true" />,
      title: t("about.values.item2.title"),
      description: t("about.values.item2.description"),
    },
    {
      icon: <TrendingUp className="h-7 w-7 text-brand" aria-hidden="true" />,
      title: t("about.values.item3.title"),
      description: t("about.values.item3.description"),
    },
    {
      icon: <BriefcaseBusiness className="h-7 w-7 text-brand" aria-hidden="true" />,
      title: "Accompagnement",
      description:
        "Accompagner les talents dans leur développement professionnel et aider les organisations à renforcer leurs opérations, leur performance et leurs ressources humaines.",
    },
  ];

  const teamMembers = [
    {
      name: t("about.team.member1.name"),
      role: t("about.team.member1.role"),
      image: francklinImage,
    },
    {
      name: t("about.team.member2.name"),
      role: t("about.team.member2.role"),
      image: destineeImage,
    },
    {
      name: t("about.team.member3.name"),
      role: t("about.team.member3.role"),
      image: claudeImage,
    },
  ];

  return (
    <>
      <SEO
        title={t("about.title")}
        description={t("about.subtitle")}
        canonical={`${BASE_URL}/about`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("about.title"), url: `${BASE_URL}/about` },
        ]}
      />
      <motion.section 
        className="container-page py-[1.125rem] md:py-[1.625rem]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-14 text-center">
          <motion.div className="relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16" variants={staggerItem}>
            <div className="relative mx-auto aspect-square w-full max-w-lg lg:scale-110 lg:origin-center">
              <div className="absolute inset-[8%] overflow-hidden">
                <img src={aboutImage} alt="Équipe EmploiPlus Group au travail" className="h-full w-full object-cover" />
              </div>
              <img src={aboutMotif} alt="" aria-hidden="true" className="absolute left-0 top-0 size-28 object-contain md:size-32" />
            </div>

            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand">Qui sommes-nous</p>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
                Des personnes engagées pour des résultats concrets.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {t("about.mission.description")}
              </p>
              <div className="mt-8 grid gap-5">
                {values.slice(0, 2).map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">{item.icon}</div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div className="w-full" variants={staggerItem}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand">Nos engagements</p>
              <motion.h3 className="mt-3 font-display text-2xl font-extrabold text-foreground md:text-3xl" variants={fadeUp}>
                Une expertise pensée pour faire avancer vos projets
              </motion.h3>
            </div>
            <motion.div className="mt-8 grid gap-5 md:grid-cols-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              {values.map((item, index) => (
                <motion.div key={item.title} className={`min-h-52 rounded-2xl p-6 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 ${index === 0 ? "bg-gradient-to-br from-[#3B8DCE] via-brand to-brand-deep text-white" : "border border-border bg-card"}`} variants={staggerItem}>
                  <div className={`flex size-11 items-center justify-center rounded-xl ${index === 0 ? "bg-white/15 [&_svg]:text-white" : "bg-brand/10"}`}>{item.icon}</div>
                  <h4 className={`mt-6 font-display text-lg font-bold ${index === 0 ? "text-white" : "text-foreground"}`}>{item.title}</h4>
                  <p className={`mt-2 text-sm leading-relaxed ${index === 0 ? "text-white/80" : "text-muted-foreground"}`}>{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="w-full" variants={staggerItem}>
            <motion.h3 
              className="font-display text-2xl font-bold text-foreground"
              variants={fadeUp}
            >
              {t("about.team.title")}
            </motion.h3>
            <motion.p 
              className="mx-auto mt-3 max-w-2xl text-muted-foreground"
              variants={fadeUp}
            >
              {t("about.team.subtitle")}
            </motion.p>
            <motion.div 
              className="mx-auto mt-10 grid max-w-full gap-5 sm:grid-cols-2 md:max-w-[40rem] md:grid-cols-3 md:gap-6 md:items-start"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {teamMembers.map((member, index) => (
                <motion.article 
                  key={member.name}
                  className="group relative overflow-visible rounded-xl bg-muted/40 pb-4 shadow-sm transition-all duration-300 hover:shadow-lg"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  style={index === 0 ? { order: 2 } : index === 1 ? { order: 1, translateY: "0.75rem" } : { order: 3 }}
                >
                  <motion.div 
                    className="relative aspect-[0.95] w-full overflow-hidden rounded-xl bg-muted"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute inset-x-3 bottom-3 flex min-h-14 items-center justify-center rounded-lg bg-white px-4 py-3 text-center shadow-lg">
                      <div className="min-w-0">
                        <h4 className="truncate font-display text-base font-bold text-foreground">
                          {member.name}
                        </h4>
                        <p className="mt-1 truncate text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Voir le profil de ${member.name}`}
                      className="absolute bottom-2 left-2 flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                    >
                      <Plus className="size-4" />
                    </button>
                  </motion.div>
                  <div className="sr-only">
                    {member.name} - {member.role}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </motion.section>

      <motion.section
        className="relative isolate mt-12 overflow-hidden py-8 md:mt-16 md:py-12"
        style={{ backgroundImage: `url(${teamBackground})`, backgroundPosition: "center", backgroundSize: "cover" }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 -z-10 bg-brand-deep/85" />
        <div className="container-page mx-auto max-w-5xl text-center text-white">
          <h2 className="mx-auto max-w-3xl font-display text-2xl font-extrabold leading-tight md:text-4xl">
            Construisons ensemble des résultats qui font la différence
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-white/75 md:text-sm">
            {t("about.whyChooseUs.title")} avec une équipe engagée, des solutions adaptées et un accompagnement pensé pour vos projets.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-4">
            {[
              { value: "1200+", label: t("about.stats.jobs") },
              { value: "1", label: t("about.stats.companies") },
              { value: "500+", label: t("about.stats.readers") },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <p className="font-display text-3xl font-extrabold text-secondary md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  );
}
