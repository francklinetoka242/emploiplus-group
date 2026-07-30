import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, slideUp } from "@/lib/animations/animations";
import { B2B_SERVICES } from "./data";

export default function EnterpriseWorkflowSection() {
  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="container-page mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="space-y-8">
          <motion.h3 variants={fadeUp} className="text-2xl font-semibold">Solutions Entreprises</motion.h3>

          <div className="relative mt-6 grid gap-6 lg:grid-cols-3">
            {B2B_SERVICES.map((s, i) => (
              <motion.div key={s.title} variants={slideUp} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
                <div className="text-sm uppercase text-muted-foreground/70">{s.title}</div>
                <h4 className="mt-2 text-lg font-semibold">{s.tagline}</h4>
                <p className="mt-3 text-sm text-muted-foreground/80">{s.details}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
