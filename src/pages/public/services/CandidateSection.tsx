import React from "react";
import { Link } from "react-router-dom";
import { Clock, FileText, ListChecks, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, staggerContainer, staggerItem } from "@/lib/animations/animations";
import { useJobs } from "@/features/jobs/hooks/useJobs";

const contractLabels: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance",
  internship: "Stage",
};

export default function CandidateSection() {
  const { offers, loading } = useJobs({ limit: 2, status: "published" });
  const recommendedOffer = offers[0];
  const newOpportunity = offers[1] ?? offers[0];

  const formatOfferDetails = (job: any) => {
    const location = [job.location_city, job.location_country].filter(Boolean).join(" • ");
    const contract = job.contract_type ? contractLabels[job.contract_type] ?? job.contract_type : null;
    return [location, contract].filter(Boolean).join(" • ");
  };

  return (
    <section className="container-page pt-0 pb-20">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-10 items-center">
        <motion.div variants={fadeLeft} className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <motion.div variants={staggerItem} className="rounded-[28px] border border-border/80 bg-white/95 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                <ListChecks className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold text-foreground">Matching intelligent</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Votre profil est analysé pour identifier les offres qui correspondent réellement à vos compétences, expériences et objectifs professionnels.
              </p>
            </motion.div>
            <motion.div variants={staggerItem} className="rounded-[28px] border border-border/80 bg-white/95 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold text-foreground">Offres recommandées</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Découvrez automatiquement les opportunités les plus pertinentes grâce à une analyse intelligente de votre CV et des besoins des entreprises.
              </p>
            </motion.div>
            <motion.div variants={staggerItem} className="rounded-[28px] border border-border/80 bg-white/95 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold text-foreground">Lettre de motivation personnalisée</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Créez rapidement une lettre adaptée à chaque poste grâce à une génération basée sur votre profil et l'offre ciblée.
              </p>
            </motion.div>
            <motion.div variants={staggerItem} className="rounded-[28px] border border-border/80 bg-white/95 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold text-foreground">Candidature express en 1min</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Postulez directement depuis la plateforme en quelques clics et réduisez le temps nécessaire pour saisir une opportunité.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right column removed per request */}
      </motion.div>
    </section>
  );
}
