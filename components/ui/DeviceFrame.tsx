import Image from "next/image";
import styles from "./DeviceFrame.module.css";

type Props = {
  src: string;
  alt: string;
  kind?: "phone" | "tablet";
  priority?: boolean;
  className?: string;
};

/** Phone/tablet bezel around a screenshot. `alt` is required: these images carry meaning. */
export default function DeviceFrame({ src, alt, kind = "phone", priority, className }: Props) {
  const w = kind === "phone" ? 390 : 820;
  const h = kind === "phone" ? 844 : 1180;
  const sizes = kind === "tablet" ? "(max-width: 900px) 90vw, 820px" : "(max-width: 900px) 80vw, 390px";
  return (
    <div className={[styles.frame, kind === "tablet" && styles.tablet, className].filter(Boolean).join(" ")}>
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.screen}>
        <Image src={src} alt={alt} width={w} height={h} priority={priority} sizes={sizes} />
      </span>
    </div>
  );
}
