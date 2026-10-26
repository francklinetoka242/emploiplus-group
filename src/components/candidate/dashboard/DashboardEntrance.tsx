import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useEcoMode } from "@/contexts/EcoModeContext";

interface DashboardEntranceProps {
  children: ReactNode;
  delay?: number;
}

export function DashboardEntrance({ children, delay = 0 }: DashboardEntranceProps) {
  const reduceMotion = useReducedMotion();
  const { isEcoMode } = useEcoMode();
  const animate = !reduceMotion && !isEcoMode;

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.22, delay } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
