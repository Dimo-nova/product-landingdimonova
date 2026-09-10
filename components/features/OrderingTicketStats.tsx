"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import styles from "./OrderingSections.module.css";

type Stat = { value: string; label: string };
type Props = { stats: Stat[] };

const COUNT_MS = 1100;

/** Splits "35%" / "35 %" into the number to count up to and whatever trails it. */
function splitValue(value: string): { target: number; suffix: string } | null {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return null;
  return { target: Number(match[1]), suffix: match[2] };
}

/**
 * Square's two published figures, counting up once when the section reaches the viewport.
 *
 * This is the one animation on these pages driven by hand from a rAF loop rather than through
 * `motion`'s `animate` prop, so `<MotionConfig reducedMotion="user">` cannot switch it off for
 * us: it needs its own `useReducedMotion()` guard, and under that setting the final figure is
 * simply rendered as-is with no counting at all.
 *
 * The counting digits are aria-hidden and paired with a visually hidden copy of the real value,
 * so assistive tech reads "35%" once instead of every intermediate number.
 */
export default function OrderingTicketStats({ stats }: Props) {
  const ref = useRef<HTMLDListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduced = useReducedMotion();
  // Starts *finished*, so a visitor with JavaScript off (or before hydration) reads the real
  // figure rather than a stuck "0%". The effect below rewinds it only when it is about to count.
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / COUNT_MS);
      // Same ease-out shape as the rest of the site's motion, without importing a curve solver.
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  return (
    <dl className={styles.stats} ref={ref}>
      {stats.map((stat) => {
        const parts = splitValue(stat.value);
        const shown = parts ? `${Math.round(parts.target * progress)}${parts.suffix}` : stat.value;
        return (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.statValue}>
              <span aria-hidden="true">{shown}</span>
              <span className="u-visually-hidden">{stat.value}</span>
            </dt>
            <dd className={styles.statLabel}>{stat.label}</dd>
          </div>
        );
      })}
    </dl>
  );
}
