import React from "react";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, staggerContainer, staggerItem } from "@/lib/animations/animations";

export default function CandidateDiscoverySection() {
  return (
    <section className="py-20">
      <div className="container-page mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={staggerContainer} className="grid gap-8 lg:grid-cols-2 items-start">
          <motion.div variants={fadeLeft} className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">IA • Matching</span>
            <h2 className="text-3xl font-semibold">Nous vous aidons à trouver les meilleures opportunités.</h2>
            <p className="text-muted-foreground max-w-xl">Les offres sont publiées en continu et notre moteur de recommandation analyse votre profil pour vous proposer des opportunités pertinentes. Rejoignez notre chaîne WhatsApp pour recevoir les nouvelles offres en temps réel.</p>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs">✓</span><span>Recommandations personnalisées</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs">✓</span><span>Accès aux offres sur le site</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs">✓</span><span>Notifications WhatsApp en temps réel</span></li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground" href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" target="_blank" rel="noreferrer">Rejoindre notre chaîne WhatsApp</a>
              <a className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold" href="https://www.emploiplus-group.com/jobs" target="_blank" rel="noreferrer">Découvrir les offres</a>
            </div>
          </motion.div>

          <motion.div variants={fadeRight} className="relative">
            <motion.div variants={staggerItem} className="relative h-[420px] w-full max-w-lg">
              <motion.div variants={staggerItem} className="absolute -left-6 -top-6 w-64 rounded-2xl bg-white p-4 shadow-lg transform rotate-1">
                <div className="text-xs text-secondary font-semibold">Nouvelle offre</div>
                <h3 className="mt-2 text-lg font-semibold">Product Manager</h3>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground"><div className="inline-flex items-center gap-2"><span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary text-xs">CDI</span> Paris</div><div className="font-semibold">87%</div></div>
              </motion.div>

              <motion.div variants={staggerItem} className="absolute left-6 top-12 w-72 rounded-2xl bg-white p-4 shadow-2xl transform -rotate-1">
                <div className="text-xs text-secondary font-semibold">Recommandé</div>
                <h3 className="mt-2 text-lg font-semibold">Développeur Frontend</h3>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground"><div className="inline-flex items-center gap-2"><span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary text-xs">Freelance</span> Lyon</div><div className="font-semibold">74%</div></div>
              </motion.div>

              <motion.div variants={staggerItem} className="absolute mt-40 h-56 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-[0_18px_60px_-20px_rgba(2,6,23,0.12)]">
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-slate-200" /><div><div className="text-sm font-semibold">Matching intelligent</div><div className="text-xs text-muted-foreground">Suggestions basées sur votre profil</div></div></div><div className="text-sm font-semibold text-secondary">IA • Recommandations</div></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
