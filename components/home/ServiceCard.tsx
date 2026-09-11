"use client";
import type { ServiceSlug } from "@/lib/services";
import { openService } from "@/lib/events";
import { ServiceArt } from "./ServiceArt";
import styles from "./ServiceCards.module.css";

type Props = {
  slug: ServiceSlug;
  title: string;
  line: string;
  /** What the service includes, shown as short bullets under the line. */
  bullets: string[];
  /** Label of the card's button, e.g. "See how it gets set up". */
  cta: string;
};

/**
 * One service card: the drawn scene on the coral gradient, the service's name, its one-line
 * pitch and what it includes. The whole card opens the service walkthrough (ServiceModal); the
 * button at its foot is the control assistive tech and the keyboard use, and the card's own
 * click just forwards to it. There is no page behind the card any more — the service pages are
 * unpublished (FEATURES_PUBLISHED in lib/config.ts) and everything lives on the home page.
 */
export default function ServiceCard({ slug, title, line, bullets, cta }: Props) {
  const open = () => openService({ slug });
  return (
    <article className={styles.card} data-service-card={slug} onClick={open}>
      {/* aria-hidden so it doesn't get read out ahead of the heading, which already names it. */}
      <div className={styles.media} aria-hidden="true">
        <ServiceArt slug={slug} />
      </div>
      <div className={styles.body}>
        <h3>{title}</h3>
        <p data-card-body>{line}</p>
        <ul className={styles.bullets}>
          {bullets.map((item) => (
            <li key={item} className={styles.bullet}>
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={styles.cta}
          // The card's own onClick already opens it; stop the event so the button doesn't open it twice.
          onClick={(e) => { e.stopPropagation(); open(); }}
        >
          {cta} <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
