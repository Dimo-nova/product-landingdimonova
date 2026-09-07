"use client";
import { motion } from "motion/react";
import { draw } from "@/lib/motion";
import styles from "./Annotated.module.css";

type Props = { children: React.ReactNode; kind?: "ellipse" | "strike"; delay?: number };

// Hand-drawn feel: slightly open ellipse, or a wobbly strike-through. viewBox is 200x60, preserveAspectRatio none stretches it to the word.
const PATHS = {
  ellipse: "M 30 8 C 90 -4, 190 2, 194 26 C 198 50, 120 62, 60 56 C 12 52, -2 30, 24 14",
  strike: "M 4 34 C 60 26, 120 30, 196 24",
};

export default function Annotated({ children, kind = "ellipse", delay }: Props) {
  return (
    <span className={styles.wrap}>
      {children}
      <svg className={styles.svg} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
        <motion.path className={styles.path} d={PATHS[kind]} {...draw(delay)} />
      </svg>
    </span>
  );
}
