"use client";
import { motion } from "motion/react";
import { bob, reveal, stagger, viewportOnce } from "@/lib/motion";
import styles from "./OrderingSections.module.css";

type Props = { moments: string[] };

/**
 * The four things a guest actually thinks before deciding not to order another round, drawn as
 * speech bubbles that drift in and then float. The floating loop is `motion`'s `animate` prop,
 * which `<MotionConfig reducedMotion="user">` switches off under `prefers-reduced-motion`; the
 * reveal is a scroll-triggered variant, which the same config also flattens.
 *
 * Bubbles carry real, translated text (not decoration), so nothing here is aria-hidden.
 */
export default function OrderingMoments({ moments }: Props) {
  return (
    <motion.ul
      className={styles.moments}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {moments.map((moment, i) => (
        <motion.li key={moment} className={styles.momentCell} variants={reveal}>
          <motion.p className={styles.moment} {...bob(i * 0.45)}>
            {moment}
          </motion.p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
