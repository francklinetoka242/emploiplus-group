import React from "react";
import FloatingBackground from "@/components/FloatingBackground";
import AnimatedHeading from "@/components/AnimatedHeading";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, staggerContainer, staggerItem } from "@/lib/animations/animations";
import { ListChecks, Sparkles, FileText, Clock } from "lucide-react";

function FeatureCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={staggerItem} whileHover={{ y: -6 }} className="z-20 rounded-[20px] border border-border/80 bg-card p-6 shadow-soft transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-brand/10 text-brand">{icon}</div>
        <div>
          <div className="text-lg font-semibold text-foreground">{title}</div>
          <div className="mt-2 text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroServices() {
  return (
    <section className="relative overflow-hidden py-20">
      <FloatingBackground />
      <div className="container-page relative z-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-8 items-start">
          <motion.div variants={fadeLeft} className="space-y-6">
            <motion.span variants={fadeUp} className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">✨ Hub Candidat Intelligent</motion.span>
            <AnimatedHeading>Un parcours candidat intelligent, de la recherche à l'embauche</AnimatedHeading>
            <motion.p variants={fadeUp} className="mt-2 max-w-xl text-muted-foreground">Une expérience digitale conçue pour connecter les talents aux meilleures opportunités grâce à des outils intelligents.</motion.p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard icon={<ListChecks className="h-5 w-5" />} title="Matching intelligent">
                Votre profil est analysé pour identifier les offres qui correspondent réellement à vos compétences, expériences et objectifs professionnels.
              </FeatureCard>
              <FeatureCard icon={<Sparkles className="h-5 w-5" />} title="Offres recommandées">
                Découvrez automatiquement les opportunités les plus pertinentes grâce à une analyse intelligente de votre CV et des besoins des entreprises.
              </FeatureCard>
              <FeatureCard icon={<FileText className="h-5 w-5" />} title="Lettre de motivation personnalisée">
                Créez rapidement une lettre adaptée à chaque poste grâce à une génération basée sur votre profil et l'offre ciblée.
              </FeatureCard>
              <FeatureCard icon={<Clock className="h-5 w-5" />} title="Candidature express">
                Postulez directement depuis la plateforme en quelques clics et réduisez le temps nécessaire pour saisir une opportunité.
              </FeatureCard>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
