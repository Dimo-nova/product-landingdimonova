import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Pill from "@/components/ui/Pill";
import ReviewsCarousel from "./ReviewsCarousel";
import rawReviews from "@/data/reviews.json";
import { buildReviewCards, type ReviewsData } from "./reviews-types";
import styles from "./Reviews.module.css";

// `data/reviews.json` ships as `{ rating: null, profileUrl: "", videos: [], google: [] }` until
// the owner supplies real reviews and uploads the two video files. Imported at build time (not
// fetched) so the section stays static; asserted to the hand-written `ReviewsData` shape because
// TypeScript would otherwise infer `never[]` for the two empty arrays.
const reviews = rawReviews as ReviewsData;

/**
 * Reviews section: an honest empty state today (a single centred line, no fake cards or
 * skeletons) and a drag/arrow carousel the moment `data/reviews.json` is filled in. See
 * ReviewsCarousel for the interactive part.
 */
export default async function Reviews() {
  const t = await getTranslations();
  const cards = buildReviewCards(reviews.videos, reviews.google);

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

        {cards.length === 0 ? (
          <p className={styles.pending}>{t("home.reviews.pending")}</p>
        ) : (
          <ReviewsCarousel cards={cards} />
        )}
      </Container>
    </section>
  );
}
