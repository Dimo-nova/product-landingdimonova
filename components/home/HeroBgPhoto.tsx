import Image from "next/image";
import styles from "./HeroBgPhoto.module.css";

/** Hero background: the sourced dining-room photograph, held still, with a dark-to-light overlay so the content column stays readable. */
export default function HeroBgPhoto({ alt }: { alt: string }) {
  return (
    <div className={styles.wrap} data-hero-bg="photo">
      {/* `sizes` is not 100vw: the card is the 1512px container minus its gutters and its own
          16px margins, so 100vw made the browser fetch a wider file than it ever paints. This is
          the LCP image, so that matters. */}
      <Image
        src="/assets/hero/hero.webp"
        alt={alt}
        fill
        priority
        sizes="(min-width: 1592px) 1400px, 100vw"
        className={styles.img}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.overlayBottom} aria-hidden="true" />
    </div>
  );
}
