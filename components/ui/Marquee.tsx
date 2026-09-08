"use client";
import styles from "./Marquee.module.css";

type Props = {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  /** Externally-controlled pause (e.g. a visible pause button), independent of hover/focus. */
  paused?: boolean;
  className?: string;
};

/**
 * Duplicates its children once and translates the track by -50%, so the loop is seamless.
 * The duplicate is aria-hidden: assistive tech reads the content once. It is also `inert`:
 * aria-hidden alone only removes a subtree from the accessibility tree, it does not stop a
 * sighted keyboard user from tabbing into it — which matters once children can be focusable
 * (e.g. DifferentiatorBand's claim pills). `inert` additionally makes the whole duplicate
 * unfocusable and unclickable, so Tab only ever visits the real, announced copy.
 */
export default function Marquee({ children, speed = 40, direction = "left", pauseOnHover = true, paused = false, className }: Props) {
  return (
    <div
      className={[styles.wrap, styles[direction], className].filter(Boolean).join(" ")}
      data-pause={pauseOnHover}
      data-force-pause={paused}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      <div className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true" inert>{children}</div>
      </div>
    </div>
  );
}
