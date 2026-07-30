import { Variants } from "framer-motion";

export const hoverLift: Variants = {
  hover: { y: -8, scale: 1.02, boxShadow: "0 24px 40px rgba(2,6,23,0.12)", transition: { duration: 0.18 } },
};

export const hoverIcon: Variants = {
  hover: { rotate: 6, scale: 1.08, transition: { duration: 0.18 } },
};

export const pulse: Variants = {
  visible: { scale: [1, 1.03, 1], transition: { duration: 1.6, repeat: Infinity } },
};

export default {};
