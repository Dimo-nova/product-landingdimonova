import styles from "./Eyebrow.module.css";

type Props = {
  children: React.ReactNode;
  /** "p" (default) for a standalone label above a heading; "span" for an inline eyebrow next to a logo (e.g. BalamoShowcase). */
  as?: "p" | "span";
  className?: string;
  /**
   * "light" (default) for a white/cream ground — uses --brand-deep, which clears 4.5:1 there
   * (--brand itself is only ~3.2:1 and fails WCAG AA for text under 18px).
   * "dark" for a dark/--ink ground (e.g. the features page's onboarding band, or a dark panel
   * like AiPanel/BalamoShowcase's photo side) — --brand already clears ~5.9:1 against --ink, and
   * switching it to --brand-deep there would actually drop it to ~3.8:1, failing the same check.
   */
  tone?: "light" | "dark";
};

/**
 * Shared small-caps label used above section headings across the inner pages (features, pricing,
 * cases, about) and PageHero/FeatureBlock. Centralizes the color so the contrast fix applies in
 * one place instead of being duplicated (and re-broken) per page module.
 *
 * `data-eyebrow` is a stable hook for e2e contrast checks (see e2e/a11y.spec.ts) — CSS module
 * class names are build hashes, not something a test should depend on.
 */
export default function Eyebrow({ children, as = "p", className, tone = "light" }: Props) {
  const Tag = as;
  const toneClass = tone === "dark" ? styles.dark : styles.light;
  return (
    <Tag data-eyebrow className={[styles.eyebrow, toneClass, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
