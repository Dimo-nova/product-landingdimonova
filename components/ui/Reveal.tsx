"use client";
import { motion } from "motion/react";
import { reveal, viewportOnce } from "@/lib/motion";

type Props = { children: React.ReactNode; delay?: number; className?: string };

export default function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
