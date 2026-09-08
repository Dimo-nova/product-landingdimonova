import styles from "./Marquee.module.css";

type Props = {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  speed?: number;
  direction?: "left" | "right";
  /**
   * How many times the children are repeated inside each half of the track. With only a
   * handful of items the loop's seam arrives every few seconds and the strip reads as a short
   * list restarting rather than an endless one; repeating the children widens each half so the
   * seam is pushed far off screen.
   */
  repeat?: number;
  /**
   * Stop the strip while the pointer is over it. Opt-in, and pointer only: there is no pause
   * button and no `:focus-within` stop. The owner wants the claim strip readable under the
   * cursor and the logo strip never still.
   */
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Duplicates its children (`repeat` copies per half, two halves) and translates the track by
 * -50%, so the loop is seamless. Only the very first copy is exposed to assistive tech: every
 * other copy is aria-hidden *and* `inert`, because aria-hidden alone only removes a subtree
 * from the accessibility tree, it does not stop a sighted keyboard user from tabbing into it,
 * which matters once children can be focusable (e.g. DifferentiatorBand's claim pills).
 *
 * There is no pause button and no `:focus-within` stop; `pauseOnHover` is the only way to
 * halt a strip, and only while the pointer is on it. The `prefers-reduced-motion` branch in
 * the stylesheet still replaces the animation with a plain horizontally-scrollable row, which
 * is what makes this safe for visitors who cannot tolerate movement.
 */
export default function Marquee({ children, speed = 40, direction = "left", repeat = 1, pauseOnHover = false, className }: Props) {
  const copies = Array.from({ length: Math.max(1, repeat) }, (_, i) => i);

  return (
    <div
      className={[styles.wrap, styles[direction], className].filter(Boolean).join(" ")}
      data-pause={pauseOnHover || undefined}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      <div className={styles.track}>
        {[0, 1].map((half) =>
          copies.map((copy) => {
            const first = half === 0 && copy === 0;
            return (
              <div
                key={`${half}-${copy}`}
                className={styles.group}
                {...(first ? {} : { "aria-hidden": "true" as const, inert: true })}
              >
                {children}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
