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
  return (
    <div className={[styles.frame, kind === "tablet" && styles.tablet, className].filter(Boolean).join(" ")}>
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.screen}>
        <Image src={src} alt={alt} width={w} height={h} priority={priority} sizes="(max-width: 900px) 80vw, 390px" />
      </span>
    </div>
  );
}
