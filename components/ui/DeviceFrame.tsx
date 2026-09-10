import Image from "next/image";
import styles from "./DeviceFrame.module.css";

type Props = {
  src: string;
  alt: string;
  kind?: "phone" | "tablet";
  /** Tablets only. Swaps the intrinsic size so the reserved box matches a landscape screenshot. */
  landscape?: boolean;
  priority?: boolean;
  className?: string;
};

/** Phone/tablet bezel around a screenshot. `alt` is required: these images carry meaning. */
export default function DeviceFrame({ src, alt, kind = "phone", landscape, priority, className }: Props) {
  // These are not hints. `.screen img` is `width: 100%; height: auto`, so the browser derives the
  // box's aspect ratio from the width/height attributes and keeps it even after the file loads:
  // getting them wrong renders a landscape screenshot in a portrait box. Tablet is 3:4, flipped
  // to 4:3 when `landscape` is set.
  const portraitW = kind === "phone" ? 390 : 820;
  const portraitH = kind === "phone" ? 844 : 1093;
  const w = landscape ? portraitH : portraitW;
  const h = landscape ? portraitW : portraitH;
  const sizes = kind === "tablet" ? "(max-width: 900px) 90vw, 560px" : "(max-width: 900px) 80vw, 390px";
  return (
    <div className={[styles.frame, kind === "tablet" && styles.tablet, className].filter(Boolean).join(" ")}>
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.screen}>
        <Image src={src} alt={alt} width={w} height={h} priority={priority} sizes={sizes} />
      </span>
    </div>
  );
}
