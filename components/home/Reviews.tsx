import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Pill from "@/components/ui/Pill";
import ReviewsVideo from "./ReviewsVideo";
import rawReviews from "@/data/reviews.json";
import { buildReviewRows, type GoogleReview, type ReviewRow, type ReviewsData } from "./reviews-types";
import styles from "./Reviews.module.css";

// Imported at build time (not fetched) so the section stays static; checked against the
// hand-written `ReviewsData` shape with `satisfies` rather than `as` so a typo in the data file
// becomes a type error instead of being silently coerced away.
const reviews = rawReviews satisfies ReviewsData;

/**
 * Reviews section: one full-width row per client video, alternating sides — the first row puts
 * the video on the left and that client's written review on the right, the second flips it, and
 * so on. The video is the dominant half of each row on purpose; it is the centrepiece of the
 * section.
 *
 * A row only shows a quote when the video declares the review's id (`reviewId`), never by array
 * position — see `buildReviewRows`. Written reviews no video claims are laid out in their own
 * titled band below the rows, deliberately separated: flush under the last row, a lone card
 * read as if the person had written it about the venue in that row. With neither videos nor
 * reviews the section falls back to the honest "coming soon" line rather than skeletons or
 * invented quotes.
 *
 * No card links out to Google: the section's one outbound link is the rating badge in the head.
 */
export default async function Reviews() {
  const t = await getTranslations();
  const { rows, unpaired } = buildReviewRows(reviews.videos, reviews.google);

  return (
    <section id="reviews" className={styles.section}>
      <Container>
        <Reveal className={styles.head}>
          <h2 className={styles.title}>{t("home.reviews.title")}</h2>
          {reviews.rating !== null && (
            <Pill tone="brand" href={reviews.profileUrl || undefined} external={Boolean(reviews.profileUrl)}>
              {t("home.reviews.badge", { rating: reviews.rating })}
            </Pill>
          )}
        </Reveal>

        {rows.length === 0 && unpaired.length === 0 ? (
          <p className={styles.pending}>{t("home.reviews.pending")}</p>
        ) : (
          <>
            {rows.map((row, i) => (
              <Row key={row.video.id} row={row} flipped={i % 2 === 1} starsLabel={starsLabelFor(t, row.review)} />
            ))}

            {unpaired.length > 0 && (
              <Reveal className={styles.extras}>
                <h3 className={styles.extrasTitle}>{t("home.reviews.moreTitle")}</h3>
                <div className={styles.extrasGrid}>
                  {unpaired.map((review) => (
                    <TextCard
                      key={review.id}
                      review={review}
                      starsLabel={starsLabelFor(t, review)}
                      className={styles.extraCard}
                    />
                  ))}
                </div>
              </Reveal>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

type Translate = Awaited<ReturnType<typeof getTranslations>>;

function starsLabelFor(t: Translate, review?: GoogleReview) {
  return t("home.reviews.stars", { rating: clampRating(review?.rating) });
}

function clampRating(rating?: number) {
  return Math.max(0, Math.min(5, rating ?? 5));
}

/**
 * One review row. The DOM order matches the visual order — on a flipped row the text really
 * does come first — so the reading order a screen reader or a narrow viewport gets is the one
 * on screen, and the halves simply stack in that order below 900px.
 */
function Row({ row, flipped, starsLabel }: { row: ReviewRow; flipped: boolean; starsLabel: string }) {
  const media = <ReviewsVideo video={row.video} />;
  const words = row.review ? (
    <TextCard review={row.review} starsLabel={starsLabel} />
  ) : (
    <VenueCard video={row.video} />
  );

  return (
    <Reveal className={styles.row}>
      {flipped ? words : media}
      {flipped ? media : words}
    </Reveal>
  );
}

/**
 * A written review: decorative (`aria-hidden`) filled/empty stars with a visually-hidden
 * "{rating} out of 5" equivalent for assistive tech, the reviewer's name, and the full text —
 * no clamp, no "read more", and no link out to Google.
 */
function TextCard({
  review,
  starsLabel,
  className,
}: {
  review: GoogleReview;
  starsLabel: string;
  className?: string;
}) {
  const rating = clampRating(review.rating);

  return (
    <div
      className={[styles.textCard, className].filter(Boolean).join(" ")}
      data-review-card="text"
      data-review-id={review.id}
    >
      <div className={styles.stars} aria-hidden="true">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <span className="u-visually-hidden">{starsLabel}</span>

      <p className={styles.text}>{review.text}</p>

      <div className={styles.byline}>
        <span className={styles.name}>{review.name}</span>
        {review.venue && <span className={styles.venue}>{review.venue}</span>}
      </div>
    </div>
  );
}

/**
 * The stand-in for the text half of a row whose client has not written a review: their name and
 * where they are, and nothing else. The moment the owner adds a `reviewId` to that video in
 * `data/reviews.json`, `buildReviewRows` hands the row a real review and `TextCard` replaces
 * this — no code change needed. Never put words here.
 */
function VenueCard({ video }: { video: ReviewRow["video"] }) {
  return (
    <div className={[styles.textCard, styles.venueCard].join(" ")} data-review-card="venue" data-review-id={video.id}>
      <span className={styles.name}>{video.name}</span>
      <span className={styles.venue}>{video.venue}</span>
    </div>
  );
}
