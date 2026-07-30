import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations/animations";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="container-page mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid gap-8 lg:grid-cols-2 items-center">
          <motion.div variants={fadeUp} className="space-y-6">
            <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Services</span>
            <h1 className="text-4xl font-display font-bold">Des services pour trouver, préparer et réussir.</h1>
            <p className="text-lg text-muted-foreground max-w-xl">EmploiPlus Group accompagne les candidats et les entreprises avec une plateforme intelligente, des recommandations IA et un accompagnement humain de A à Z.</p>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button asChild size="default" className="bg-brand text-brand-foreground">
                <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer">Rejoindre notre chaîne WhatsApp</a>
              </Button>
              <Button asChild variant="outline" size="default">
                <a href="https://www.emploiplus-group.com/jobs" target="_blank" rel="noreferrer">Découvrir les offres</a>
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div>
                <div className="text-2xl font-semibold">2K+</div>
                <div className="text-sm text-muted-foreground">candidats accompagnés/an</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">95%</div>
                <div className="text-sm text-muted-foreground">satisfaction</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            <div className="relative rounded-3xl bg-gradient-to-br from-brand to-accent p-8 shadow-2xl">
              <div className="h-56 w-full rounded-lg bg-white/10" />
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-[18px]" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
