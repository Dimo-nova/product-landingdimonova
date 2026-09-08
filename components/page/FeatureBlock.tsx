import Image from "next/image";
import Container from "@/components/ui/Container";
import DeviceFrame from "@/components/ui/DeviceFrame";
import styles from "./FeatureBlock.module.css";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  /** Pre-rendered rich strings (the caller resolves these with `t.rich`), not raw translation keys. */
  bullets: React.ReactNode[];
  image: string;
  imageAlt: string;
  /** Which side the screenshot sits on at desktop width. Reading order in the DOM is always content-then-image. */
  side?: "left" | "right";
  /**
   * "phone" (default, matches the original contract) wraps the screenshot in DeviceFrame's
   * bezel — right for a portrait phone capture. "none" renders a plain `next/image` with the
   * card radius and a soft shadow instead: a landscape desktop screenshot squeezed into a
   * phone bezel looks broken.
   */
  frame?: "phone" | "none";
};

/** Two-column prose-and-screenshot block (the features page's repeating shape). Stacks below 900px. */
export default function FeatureBlock({ eyebrow, title, body, bullets, image, imageAlt, side = "left", frame = "phone" }: Props) {
  return (
    <Container>
      <div className={[styles.grid, side === "right" && styles.imageRight].filter(Boolean).join(" ")}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          {bullets.length > 0 && (
            <ul className={styles.bullets}>
              {bullets.map((bullet, i) => (
                // eslint-disable-next-line react/no-array-index-key -- bullets are opaque ReactNode, no stable identity to key on
                <li key={i} className={styles.bullet}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.media}>
          {frame === "none" ? (
            <div className={styles.plainMedia}>
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 900px) 90vw, 560px" className={styles.plainImage} />
            </div>
          ) : (
            <DeviceFrame src={image} alt={imageAlt} />
          )}
        </div>
      </div>
    </Container>
  );
}
