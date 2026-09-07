import Image from "next/image";
import styles from "./HeroBgPhoto.module.css";

/** Default hero background: the sourced dining-room photograph, with a Ken Burns drift and a dark-to-light overlay so the content column stays readable. */
export default function HeroBgPhoto({ alt }: { alt: string }) {
  return (
    <div className={styles.wrap} data-hero-bg="photo">
      <Image
        src="/assets/hero/hero-stock.jpg"
        alt={alt}
        fill
        priority
        sizes="100vw"
        className={styles.img}
        style={{ objectFit: "cover" }}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.overlayBottom} aria-hidden="true" />
    </div>
  );
}
