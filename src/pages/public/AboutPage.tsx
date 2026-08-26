import React from "react";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Handshake, Settings2, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import francklinImage from "@/assets/about/team/francklin-etoka.webp";
import destineeImage from "@/assets/about/team/destinee-mouissou.webp";
import claudeImage from "@/assets/about/team/claude-omvoulet.webp";
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
        className="container-page py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 text-center">
          <motion.div className="max-w-3xl space-y-4" variants={staggerItem}>
            <motion.h2 
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
              variants={fadeUp}
            >
              {t("about.mission.title")}
            </motion.h2>
            <motion.p 
              className="text-lg text-foreground/90 leading-relaxed"
              variants={fadeUp}
            >
              {t("about.mission.description")}
            </motion.p>
          </motion.div>

          <motion.div className="w-full" variants={staggerItem}>
            <motion.h3 
              className="font-display text-2xl font-bold text-foreground mb-6"
              variants={fadeUp}
            >
              {t("about.values.title")}
            </motion.h3>
            <motion.div 
              className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {values.map((item) => (
                <motion.div
                  key={item.title}
                  className="group px-0 py-5 text-left transition-colors duration-300 hover:text-brand md:px-6 md:py-2 md:text-center"
                  variants={staggerItem}
                >
                  <motion.div 
                    className="flex justify-start md:justify-center"
                  >
                    {item.icon}
                  </motion.div>
                  <h4 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
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
              className="mt-8 grid gap-8 md:grid-cols-3 md:items-start"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {teamMembers.map((member, index) => (
                <motion.article 
                  key={member.name}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-secondary/30"
                  variants={staggerItem}
                  whileHover={{ y: -12 }}
                  style={index === 1 ? { translateY: "1rem" } : {}}
                >
                  <motion.div 
                    className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-brand/20 bg-muted/20 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  <div className="mt-5 text-center">
                    <h4 className="font-display text-xl font-semibold text-foreground">
                      {member.name}
                    </h4>
                    <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
                      {member.role}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </motion.section>

      <motion.section 
        className="container-page py-16 md:py-24"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="mx-auto max-w-5xl rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/8 via-card to-card p-8 md:p-16 shadow-sm"
          whileInView={{ boxShadow: "0 25px 50px rgba(232,169,0,0.08)" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <motion.h2 
              className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t("about.whyChooseUs.title")}
            </motion.h2>
            <motion.p
              className="mt-2 text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Nos résultats parlent pour nous
            </motion.p>
            <motion.div 
              className="mt-12 grid gap-8 md:gap-12 md:grid-cols-3 divide-x divide-secondary/10"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                {
                  value: "1200+",
                  label: t("about.stats.jobs"),
                  icon: <BarChart3 className="h-8 w-8 text-secondary md:h-10 md:w-10" />,
                },
                {
                  value: "1",
                  label: t("about.stats.companies"),
                  icon: <Handshake className="h-8 w-8 text-secondary md:h-10 md:w-10" />,
                },
                {
                  value: "455+",
                  label: t("about.stats.readers"),
                  icon: <BookOpen className="h-8 w-8 text-secondary md:h-10 md:w-10" />,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="flex flex-col items-center px-4 md:px-6"
                >
                  <motion.div
                    className="mb-4 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.p 
                    className="mb-3 font-display text-2xl font-extrabold text-secondary md:text-3xl"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <motion.p 
                    className="text-center text-sm font-semibold text-foreground md:text-base"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                  >
                    {stat.label}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}
