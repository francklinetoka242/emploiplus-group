import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/animations";

export default function AnimatedHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2 initial="hidden" animate="visible" variants={fadeUp} className="text-3xl font-display font-semibold">
      {children}
    </motion.h2>
  );
}
