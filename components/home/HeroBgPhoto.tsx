import styles from "./HeroBgPhoto.module.css";

/**
 * Hero background: a still photograph behind the copy, with a different photograph on phones.
 *
 * This is art direction, not a responsive size, so it is a plain `<picture>` rather than
 * `next/image`: the two breakpoints show *different pictures* (a dining room during service on
 * desktop, a pan on the fire on a phone), and `next/image` has no way to express that. Two
 * `<Image>`s hidden with `display: none` would not do it either, because a hidden `<img>` still
 * downloads its file, so every visitor would pay for both. A `<source media>` makes the browser's
 * preload scanner fetch exactly one, early, which is what an LCP image needs.
 *
 * `fetchPriority="high"` replaces what `priority` used to emit. Both files are pre-encoded WebP
 * (see SOURCES.md), so there is nothing for the image optimiser to do that is worth the download
 * of a file the device will never show.
 *
 * One `<picture>` means one `alt`, so the copy behind `alt.heroPhoto` has to be true of both
 * photographs; it describes a restaurant at work rather than either specific scene.
 */
export default function HeroBgPhoto({ alt }: { alt: string }) {
  return (
    <div className={styles.wrap} data-hero-bg="photo">
      <picture>
        <source media="(max-width: 900px)" srcSet="/assets/hero/hero-mobile.webp" width={1920} height={1080} />
        <img className={styles.img} src="/assets/hero/hero.webp" alt={alt} fetchPriority="high" decoding="async" />
      </picture>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.overlayBottom} aria-hidden="true" />
    </div>
  );
}
