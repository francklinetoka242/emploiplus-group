import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/animations";

export default function CTASection({ primaryHref, primaryLabel, secondaryHref, secondaryLabel }: { primaryHref: string; primaryLabel: string; secondaryHref?: string; secondaryLabel?: string; }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap gap-3">
      <a href={primaryHref} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">{primaryLabel}</a>
      {secondaryHref && secondaryLabel && (
        <a href={secondaryHref} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold">{secondaryLabel}</a>
      )}
    </motion.div>
  );
}
