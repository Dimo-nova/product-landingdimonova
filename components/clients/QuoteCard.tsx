import type { GoogleReview } from "@/components/home/reviews-types";
import styles from "./QuoteCard.module.css";

/** All reviews so far are 5-star, and `rating` is optional in the data, so an absent one means 5. */
export function clampRating(rating?: number) {
  return Math.max(0, Math.min(5, rating ?? 5));
}

type Props = {
  review: GoogleReview;
  /** Visually-hidden equivalent of the decorative star row, e.g. "5 out of 5". */
  starsLabel: string;
  /**
   * Whether to print the reviewer's name under the quote. False inside a film row, where the
   * heading above the quote already names the venue and repeating it reads as a stutter.
   */
  byline?: boolean;
  className?: string;
};

/**
 * One written review, rendered verbatim: stars, the full text with no clamp and no "read more",
 * and (optionally) the reviewer's name. There is no link out to Google on the card itself —
 * each section carries a single link to the profile instead, the same call the home page makes.
 */
export default function QuoteCard({ review, starsLabel, byline = true, className }: Props) {
  const rating = clampRating(review.rating);

  return (
    <figure
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-review-card="text"
      data-review-id={review.id}
    >
      <div className={styles.stars} aria-hidden="true">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <span className="u-visually-hidden">{starsLabel}</span>

      <blockquote className={styles.quote}>
        <p className={styles.text}>{review.text}</p>
      </blockquote>

      {byline && (
        <figcaption className={styles.byline}>
          <span className={styles.name}>{review.name}</span>
          {review.venue && <span className={styles.venue}>{review.venue}</span>}
        </figcaption>
      )}
    </figure>
  );
}
