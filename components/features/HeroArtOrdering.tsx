"use client";
import { motion } from "motion/react";
import { EASE_OUT, bob } from "@/lib/motion";
import styles from "./HeroArt.module.css";

// A 5x5 QR-ish grid. `1` is a filled module; the three corner finders are drawn separately.
const MODULES = [
  [0, 1, 0, 1, 1],
  [1, 1, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1],
];

/**
 * `/features/ordering`'s hero illustration: a QR code, a dashed line that draws itself across
 * to a printed ticket, and the ticket's own lines filling in. Decorative and text-free.
 *
 * All motion runs through `motion`'s `animate` props, so `<MotionConfig reducedMotion="user">`
 * turns it off for visitors who ask for that; nothing here is driven by hand.
 */
export default function HeroArtOrdering() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <span className={[styles.ring, styles.ringLarge].join(" ")} />

      <motion.svg className={styles.flowSvg} viewBox="0 0 360 220" focusable="false" {...bob(0.4)}>
        {/* QR panel */}
        <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
          <rect className={styles.flowPanel} x="10" y="46" width="128" height="128" rx="18" />
          <rect className={styles.flowBrand} x="30" y="66" width="22" height="22" rx="6" />
          <rect className={styles.flowBrand} x="96" y="66" width="22" height="22" rx="6" />
          <rect className={styles.flowBrand} x="30" y="132" width="22" height="22" rx="6" />
          {MODULES.map((line, row) =>
            line.map((on, col) =>
              on ? (
                <motion.rect
                  key={`${row}-${col}`}
                  className={styles.flowInk}
                  x={58 + col * 13}
                  y={94 + row * 13}
                  width="9"
                  height="9"
                  rx="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.3 + (row * 5 + col) * 0.02, ease: EASE_OUT }}
                />
              ) : null,
            ),
          )}
        </motion.g>

        {/* The dashed hop from the QR to the ticket. */}
        <motion.path
          className={styles.flowPath}
          d="M146 110 C 176 110, 176 74, 206 74"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 0.9, delay: 0.7, ease: EASE_OUT }, opacity: { duration: 0.1, delay: 0.7 } }}
        />
        <motion.path
          className={styles.flowArrow}
          d="M198 67 L206 74 L198 81"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.5, ease: EASE_OUT }}
        />

        {/* Ticket */}
        <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 1.1, ease: EASE_OUT }}>
          <rect className={styles.flowPanel} x="212" y="28" width="132" height="164" rx="14" />
          <rect className={styles.flowBrand} x="230" y="50" width="52" height="10" rx="5" />
          {[0, 1, 2, 3, 4].map((line) => (
            <motion.rect
              key={line}
              className={[styles.flowInk, styles.growFromLeft].join(" ")}
              x="230"
              y={78 + line * 20}
              width={line % 2 === 0 ? 96 : 70}
              height="8"
              rx="4"
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.35, delay: 1.4 + line * 0.09, ease: EASE_OUT }}
            />
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
}
