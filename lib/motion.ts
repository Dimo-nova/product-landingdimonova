import type { Variants, Transition } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const REVEAL_TRANSITION: Transition = { duration: 0.6, ease: EASE_OUT };

export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};

/** `reveal` with an explicit delay baked into the variant (component-level `transition` cannot add it: a variant's own transition wins). */
export const revealDelayed = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...REVEAL_TRANSITION, delay } },
});

// Children must carry their own variant transition (as `reveal` does) — `staggerChildren`
// only offsets each child's start time, it does not supply a transition itself.
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const lift = {
  whileHover: { y: -4, boxShadow: "var(--shadow-hover)" },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.25, ease: EASE_OUT } as Transition,
};

export const bob = (delay = 0): { animate: Record<string, unknown>; transition: Transition } => ({
  animate: { y: [0, -6, 0] },
  transition: { duration: 5, ease: "easeInOut", repeat: Infinity, delay },
});

export const draw = (delay = 0.4) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { duration: 0.8, ease: EASE_OUT, delay }, opacity: { duration: 0.1, delay } },
});

export const viewportOnce = { once: true, margin: "-10%" } as const;
