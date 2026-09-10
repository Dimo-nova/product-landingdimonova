"use client";
import { motion } from "motion/react";
import { EASE_OUT, bob } from "@/lib/motion";
import styles from "./HeroArt.module.css";

const STAR = "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";
const STARS = [0, 1, 2, 3, 4];

/**
 * `/features/reviews`'s hero illustration: five stars filling one after another, then the note
 * the rating produces sliding in under them. Decorative and text-free — the two actual paths a
 * rating can take are spelled out in words further down the page.
 *
 * One-shot, and driven entirely through `motion`'s `animate` props, so
 * `<MotionConfig reducedMotion="user">` disables it under `prefers-reduced-motion` without any
 * guard of its own. The cycling demo that needs one lives in ReviewsFlow.
 */
export default function HeroArtReviews() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <span className={[styles.ring, styles.ringSmall].join(" ")} />
      <span className={[styles.ring, styles.ringLarge].join(" ")} />

      <motion.div className={styles.starCard} {...bob(0.6)}>
        <div className={styles.starRow}>
          {STARS.map((star) => (
            <svg key={star} className={styles.star} viewBox="0 0 24 24" focusable="false">
              <path className={styles.starShape} d={STAR} />
              <motion.path
                className={styles.starFill}
                d={STAR}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.25 + star * 0.13, ease: EASE_OUT }}
              />
            </svg>
          ))}
        </div>

        <motion.div
          className={styles.noteCard}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05, ease: EASE_OUT }}
        >
          <div className={styles.noteChips}>
            <span className={styles.noteChip} />
            <span className={styles.noteChip} />
            <span className={styles.noteChip} />
          </div>
          <span className={styles.noteLine} />
          <span className={styles.noteLine} />
        </motion.div>
      </motion.div>
    </div>
  );
}
