"use client";
import { motion } from "motion/react";
import { draw } from "@/lib/motion";
import styles from "./Annotated.module.css";

type Props = { children: React.ReactNode; kind?: "ellipse" | "strike"; delay?: number };

// Hand-drawn feel: a loop closed with a slight overshoot past its own start (the way a pen
// does), or a wobbly strike-through. viewBox is 200x60, preserveAspectRatio none stretches it
// to the word. The loop must end past `M` rather than short of it: an endpoint that stops
// before the start reads as an unfinished circle, not as a hand-drawn one.
const PATHS = {
  ellipse: "M 26 12 C 62 -2, 150 -3, 186 13 C 203 21, 197 45, 158 53 C 118 62, 48 60, 15 45 C -4 36, 1 17, 34 7",
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
