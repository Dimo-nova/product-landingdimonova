"use client";
import { motion } from "motion/react";
import Pill from "@/components/ui/Pill";
import { bob } from "@/lib/motion";
import styles from "./BalamoShowcase.module.css";

const POSITIONS = ["topLeft", "topRight", "midLeft", "bottomRight", "bottomLeft"] as const;

/**
 * The five labelled pills floating around the Bálamo phone. Split out as its own client
 * component (like AiPanel/AiDemo) so the bob loop's "use client" boundary stays as small as
 * possible; BalamoShowcase itself renders server-side.
 *
 * Positioning and animation are deliberately on separate elements: the outer `pillSlot` div
 * carries the fixed offset (plus, for `midLeft`, a `transform: translateY(-50%)` to centre
 * it), while the inner `motion.div` owns the bob loop. Motion writes its own `transform`
 * inline style once animated, which would silently clobber a CSS `transform` set on the same
 * node — keeping them on different elements avoids that fight.
 */
export default function BalamoPills({ labels }: { labels: string[] }) {
  return (
    <div className={styles.pills}>
      {labels.map((label, i) => {
        const { animate, transition } = bob(i * 0.6);
        const position = POSITIONS[i % POSITIONS.length];
        return (
          <div key={label} className={[styles.pillSlot, styles[position]].join(" ")}>
            <motion.div animate={animate} transition={transition}>
              <span data-balamo-pill>
                <Pill tone="light">{label}</Pill>
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
