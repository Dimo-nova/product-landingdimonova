"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE_OUT, reveal, stagger, viewportOnce } from "@/lib/motion";
import styles from "./OrderingSections.module.css";

type Step = { title: string; body: string };
/** `visuals[i]` sits under step i's number: what that step looks like in the real world. */
type Props = { steps: Step[]; visuals?: ReactNode[] };

/**
 * The three-step scan / order / print diagram. The dashed rule behind the steps draws itself
 * across as the section scrolls into view, and the numbered discs land one after another.
 *
 * The rule is decorative: it repeats the left-to-right order the numbered headings already
 * state, so it is aria-hidden and the steps stay a plain ordered list underneath.
 */
export default function OrderingFlow({ steps, visuals = [] }: Props) {
  return (
    <div className={styles.flow}>
      <svg className={styles.flowRule} viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <motion.path
          className={styles.flowRulePath}
          d="M4 4 H 996"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        />
      </svg>

      <motion.ol
        className={styles.steps}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
        {steps.map((step, i) => (
          <motion.li key={step.title} className={styles.step} variants={reveal}>
            <span className={styles.stepNum} aria-hidden="true">
              {i + 1}
            </span>
            {visuals[i]}
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
