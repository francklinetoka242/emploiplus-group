import React from "react";
import { motion } from "framer-motion";
import AnimatedHeading from "@/components/AnimatedHeading";
import { fadeUp, staggerContainer, staggerItem, zoomIn } from "@/lib/animations/animations";
import cvImage from "@/assets/services/conception-cv-professionnel-axee-concept-recrutement-developpement-carriere_981640-71397.jpg";
import coachingImage from "@/assets/services/entraineur-affaires-noir-donnant-presentation-.jpg";
import successImage from "@/assets/services/directeur-souriant-tenant-document-important-colleg.jpg";
import trainingImage from "@/assets/services/reconnaitre-contributions-impactantes-individus-noi.jpg";

const steps = [
  { title: "Préparer", desc: "Conception & Refonte CV / Lettre de Motivation" },
  { title: "Optimiser", desc: "Orientation Professionnelle & Coaching" },
  { title: "Se perfectionner", desc: "Formations & Renforcement de Compétences" },
  { title: "Réussir", desc: "Décrocher votre prochain emploi" },
];

export default function CandidateJourney() {
  return (
    <section className="container-page py-20">
      <AnimatedHeading>Un parcours humain, étape par étape</AnimatedHeading>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-8 space-y-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            variants={staggerItem}
            className={
              "flex flex-col gap-6 " +
              (i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse")
            }
          >
            <div className="w-full lg:w-1/3">
              <div className="rounded-lg bg-white/5 p-6">
                <div className="text-xl font-semibold">{s.title}</div>
                <div className="mt-2 text-muted-foreground">{s.desc}</div>
              </div>
            </div>
            <div className="flex-1">
              {i === 0 || i === 1 || i === 2 || i === 3 ? (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  whileHover={{ y: -8, scale: 1.02 }}
                  viewport={{ once: true, amount: 0.35 }}
                  variants={zoomIn}
                  className="relative overflow-hidden rounded-lg"
                >
                  <img
                    src={
                      i === 0
                        ? cvImage
                        : i === 1
                        ? coachingImage
                        : i === 2
                        ? trainingImage
                        : successImage
                    }
                    alt={
                      i === 0
                        ? "Conception CV professionnel"
                        : i === 1
                        ? "Orientation professionnelle et coaching"
                        : i === 2
                        ? "Formations et renforcement de compétences"
                        : "Décrocher votre prochain emploi"
                    }
                    className="h-44 w-full object-cover object-top"
                    style={{
                      WebkitMaskImage: "linear-gradient(to top, transparent, black)",
                      maskImage: "linear-gradient(to top, transparent, black)",
                    }}
                  />
                </motion.div>
              ) : (
                <div className="h-32 rounded-lg bg-gradient-to-b from-brand/10 to-accent/5" />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
