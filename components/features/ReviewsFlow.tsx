"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import styles from "./ReviewsSections.module.css";

type Props = {
  ratingLabel: string;
  /** The three things a low rating is tagged with, in the order the demo ticks them on. */
  chips: string[];
  destination: string;
};

const STAR = "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";
const STARS = [1, 2, 3, 4, 5];

/** The two ratings the demo alternates between: a happy one that goes straight on, and a low one that is asked why first. */
const RUNS = [5, 2] as const;

const STAR_MS = 190;
const AFTER_STARS_MS = 500;
const CHIP_MS = 420;
const AFTER_CHIPS_MS = 500;
const HOLD_MS = 2600;

/**
 * The review flow, playing itself: stars fill to a rating, a low rating is asked for a reason and
 * tagged to a waiter and an area, and then *every* rating is sent on to Google. Both runs end at
 * the same destination, which is the point the section is making.
 *
 * Hand-driven from timers rather than through `motion`'s `animate` prop, so
 * `<MotionConfig reducedMotion="user">` cannot switch it off: it carries its own
 * `useReducedMotion()` guard and, under that setting, simply renders the finished low-rating
 * state without ever cycling. It also suspends while scrolled out of view.
 *
 * There is deliberately no `aria-live` here. The demo loops for as long as the page is open, and
 * a live region announcing "reason, waiter, area, Google" every few seconds from wherever the
 * visitor happens to be reading is worse than no announcement at all — the same call
 * components/home/AiDemo.tsx makes. Everything the demo shows is also stated in plain prose in
 * the two path descriptions beside it, so nothing is only available as animation.
 */
export default function ReviewsFlow({ ratingLabel, chips, destination }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const reduced = useReducedMotion();

  const [run, setRun] = useState(0);
  // Initial state is the finished low-rating run, so the section shows real content with
  // JavaScript off and before hydration (same approach as components/home/AiDemo.tsx).
  const [stars, setStars] = useState<number>(RUNS[1]);
  const [ticked, setTicked] = useState(chips.length);
  const [arrived, setArrived] = useState(true);

  useEffect(() => {
    if (!inView) return;

    const rating = RUNS[run % RUNS.length];
    const needsReason = rating <= 3;

    if (reduced) {
      setStars(rating);
      setTicked(needsReason ? chips.length : 0);
      setArrived(true);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (delay: number, action: () => void) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) action();
        }, delay),
      );
    };

    setStars(0);
    setTicked(0);
    setArrived(false);

    const advance = () => setRun((prev) => prev + 1);

    const arrive = () => {
      setArrived(true);
      wait(HOLD_MS, advance);
    };

    const tickChip = (i: number) => {
      if (i >= chips.length) {
        wait(AFTER_CHIPS_MS, arrive);
        return;
      }
      wait(CHIP_MS, () => {
        setTicked(i + 1);
        tickChip(i + 1);
      });
    };

    const fillStar = (i: number) => {
      if (i >= rating) {
        wait(AFTER_STARS_MS, () => (needsReason ? tickChip(0) : arrive()));
        return;
      }
      wait(STAR_MS, () => {
        setStars(i + 1);
        fillStar(i + 1);
      });
    };

    fillStar(0);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [run, inView, reduced, chips.length]);

  const rating = RUNS[run % RUNS.length];
  const showReason = rating <= 3;

  return (
    <div ref={ref} className={styles.demo} data-reviews-flow>
      <p className={styles.demoLabel}>{ratingLabel}</p>

      {/* The stars are a graphic of the rating the demo is currently playing. Both paths are
          spelled out in prose beside this card, so labelling five separate star glyphs would
          only add noise. */}
      <div className={styles.demoStars} aria-hidden="true">
        {STARS.map((star) => (
          <svg
            key={star}
            className={[styles.demoStar, star <= stars && styles.demoStarOn].filter(Boolean).join(" ")}
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path d={STAR} />
          </svg>
        ))}
      </div>

      <ul className={[styles.demoChips, showReason && styles.demoChipsOn].filter(Boolean).join(" ")}>
        {chips.map((chip, i) => (
          <li key={chip} className={[styles.demoChip, showReason && i < ticked && styles.demoChipOn].filter(Boolean).join(" ")}>
            <span className={styles.demoTick} aria-hidden="true">
              ✓
            </span>
            {chip}
          </li>
        ))}
      </ul>

      <p className={[styles.demoDest, arrived && styles.demoDestOn].filter(Boolean).join(" ")}>
        <span className={styles.demoArrow} aria-hidden="true">
          →
        </span>
        {destination}
      </p>
    </div>
  );
}
