"use client";
import { motion } from "motion/react";
import { bob, reveal, stagger } from "@/lib/motion";
import styles from "./HeroArt.module.css";

const ROWS = [0, 1, 2, 3];

/**
 * `/features/menu`'s hero illustration: a stylised menu card whose rows deal themselves in,
 * floating inside two coral rings. Decorative and text-free — the real menu screenshot appears
 * further down the page, in the section that actually talks about what diners see.
 *
 * Every animation here runs through `motion`'s `animate`/`variants` props, which the app-wide
 * `<MotionConfig reducedMotion="user">` (components/layout/Providers.tsx) disables under
 * `prefers-reduced-motion`. Nothing is driven by hand, so no extra guard is needed.
 */
export default function HeroArtMenu() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <span className={[styles.ring, styles.ringSmall].join(" ")} />
      <span className={[styles.ring, styles.ringLarge].join(" ")} />

      <motion.div className={styles.menuCard} {...bob(0.2)}>
        <motion.div variants={stagger} initial="hidden" animate="show">
          <div className={styles.menuTabs}>
            <motion.span className={styles.menuTab} variants={reveal} />
            <motion.span className={styles.menuTab} variants={reveal} />
            <motion.span className={styles.menuTab} variants={reveal} />
          </div>

          {ROWS.map((row) => (
            <motion.div key={row} className={styles.menuRow} variants={reveal}>
              <span className={styles.menuThumb} />
              <span className={styles.menuLines}>
                <span className={styles.menuLine} />
                <span className={styles.menuLine} />
              </span>
              <span className={styles.menuPrice} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
