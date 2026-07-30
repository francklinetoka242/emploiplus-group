import React from "react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations/animations";

export default function StatsCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-lg bg-white/5 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}
