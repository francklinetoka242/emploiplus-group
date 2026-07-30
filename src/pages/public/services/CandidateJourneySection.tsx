import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from "@/lib/animations/animations";
import { CANDIDATE_SERVICES } from "./data";

export default function CandidateJourneySection() {
  return (
    <section className="py-16">
      <div className="container-page mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="space-y-8">
          <motion.h3 variants={fadeUp} className="text-2xl font-semibold">Construire un parcours professionnel solide</motion.h3>

          <div className="grid gap-6">
            {CANDIDATE_SERVICES.map((s, i) => (
              <motion.article key={s.title} variants={i % 2 === 0 ? fadeLeft : fadeRight} className={`group relative overflow-hidden rounded-2xl border p-6 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/10 text-secondary font-bold">{i + 1}</div>
                  <div>
                    <div className="text-sm uppercase text-muted-foreground">Étape</div>
                    <h4 className="mt-1 text-lg font-semibold">{s.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
