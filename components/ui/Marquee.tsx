"use client";
import styles from "./Marquee.module.css";

type Props = {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Duplicates its children once and translates the track by -50%, so the loop is seamless.
 * The duplicate is aria-hidden: assistive tech reads the content once.
 */
export default function Marquee({ children, speed = 40, direction = "left", pauseOnHover = true, className }: Props) {
  return (
    <div
      className={[styles.wrap, styles[direction], className].filter(Boolean).join(" ")}
      data-pause={pauseOnHover}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      <div className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
