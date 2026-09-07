"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import { revealDelayed, viewportOnce } from "@/lib/motion";

type Props = { children: React.ReactNode; delay?: number; className?: string };

export default function Reveal({ children, delay = 0, className }: Props) {
  const variants = useMemo(() => revealDelayed(delay), [delay]);
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}
