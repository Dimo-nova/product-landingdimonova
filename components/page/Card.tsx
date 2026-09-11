import Image from "next/image";
import styles from "./Card.module.css";

type WithImage = { image: string; imageAlt: string };
type WithoutImage = { image?: never; imageAlt?: never };

/**
 * `image` and `imageAlt` are a discriminated union rather than two independent optional props:
 * passing one without the other is a type error, so a card can never end up with a screenshot
 * and no accessible description for it.
 */
type Props = (WithImage | WithoutImage) & {
  icon?: React.ReactNode;
  /** A visual that is not a plain screenshot — a Placeholder, a drawn QR — rendered in the
   * same slot an `image` would take. Ignored when `image` is set. */
  media?: React.ReactNode;
  title: string;
  body: string;
  footer?: React.ReactNode;
};

/** A single card for CardGrid: --paper surface, --mist border, lifts on hover/focus. */
export default function Card({ icon, image, imageAlt, media, title, body, footer }: Props) {
  return (
    <div className={styles.card}>
      {image && (
        <div className={styles.media}>
          <Image src={image} alt={imageAlt} fill sizes="(max-width: 640px) 100vw, 33vw" className={styles.image} />
        </div>
      )}
      {!image && media && <div className={styles.customMedia}>{media}</div>}
      {!image && icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
