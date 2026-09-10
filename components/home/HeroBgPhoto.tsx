import Image from "next/image";
import styles from "./HeroBgPhoto.module.css";

/** Hero background: the sourced dining-room photograph, held still, with a dark-to-light overlay so the content column stays readable. */
export default function HeroBgPhoto({ alt }: { alt: string }) {
  return (
    <div className={styles.wrap} data-hero-bg="photo">
      <Image
        src="/assets/hero/sarten_canva.png"
        alt={alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.overlayBottom} aria-hidden="true" />
    </div>
  );
}
