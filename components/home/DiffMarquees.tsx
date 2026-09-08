"use client";
import { useState } from "react";
import Marquee from "@/components/ui/Marquee";
import styles from "./DifferentiatorBand.module.css";

type DiffItem = { title: string; body: string };

/**
 * One claim pill. Non-interactive (it does nothing on activation) but focusable, so it carries
 * `role="group"` rather than `button`/`link`. The accessible name is the title + body joined
 * into one string via `aria-label`: that keeps the explanation reachable to assistive tech at
 * all times, independent of the CSS hover/focus-visible state that shows it to sighted users
 * (a screen reader has no "hover"). The visible `data-diff-body` span is then redundant for
 * AT and marked `aria-hidden` to avoid it being read out a second time.
 */
function ClaimPill({ item }: { item: DiffItem }) {
  return (
    <div className={styles.pill} data-diff-item tabIndex={0} role="group" aria-label={`${item.title}. ${item.body}`}>
      <span className={styles.claimTitle} data-diff-title>
        {item.title}
      </span>
      <span className={styles.claimBody} data-diff-body aria-hidden="true">
        {item.body}
      </span>
    </div>
  );
}

/**
 * Owns the play/pause state for the differentiator band's two marquees and renders the
 * visible toggle button. Moving content that runs longer than five seconds needs a pause
 * mechanism that isn't pointer-only: `Marquee` itself already pauses on hover and (via
 * `:focus-within`) when a claim pill is focused, but touch users have neither, hence this
 * explicit button. `paused` is forwarded straight to both `Marquee`s, which apply it via a
 * `data-force-pause` attribute independent of hover/focus.
 */
export default function DiffMarquees({
  left,
  right,
  pauseLabel,
  resumeLabel,
}: {
  left: DiffItem[];
  right: DiffItem[];
  pauseLabel: string;
  resumeLabel: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className={styles.pauseRow}>
        <button
          type="button"
          className={styles.pauseBtn}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? resumeLabel : pauseLabel}
        </button>
      </div>

      <div className={styles.rows}>
        <Marquee speed={45} direction="left" className={styles.marquee} paused={paused}>
          {left.map((item) => (
            <ClaimPill key={item.title} item={item} />
          ))}
        </Marquee>
        <Marquee speed={50} direction="right" className={styles.marquee} paused={paused}>
          {right.map((item) => (
            <ClaimPill key={item.title} item={item} />
          ))}
        </Marquee>
      </div>
    </>
  );
}
