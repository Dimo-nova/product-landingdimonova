import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/page/Eyebrow";
import type { GoogleReview } from "@/components/home/reviews-types";
import QuoteCard, { clampRating } from "./QuoteCard";
import StaggerGrid from "./StaggerGrid";
import styles from "./WrittenWall.module.css";

/**
 * The written reviews that no film row already carries.
 *
 * Only the unclaimed ones reach this block: a review a video declares as its own is printed
 * beside that video above, and repeating it here would read as two separate people saying the
 * same thing. When the last unclaimed review is paired to a video in `data/reviews.json`, the
 * caller stops rendering this section and nothing else has to change.
 *
 * No card links out. The section's single outbound link sits at the end, pointing at the Google
 * profile the reviews live on.
 */
export default async function WrittenWall({
  reviews,
  profileUrl,
}: {
  reviews: GoogleReview[];
  profileUrl: string;
}) {
  const t = await getTranslations("clients");

  return (
    <section className={styles.section} data-section="written">
      <Container>
        <Reveal className={styles.head}>
          <Eyebrow>{t("written.eyebrow")}</Eyebrow>
          <h2 className={styles.title}>{t("written.title")}</h2>
        </Reveal>

        <StaggerGrid
          className={styles.grid}
          itemClassName={styles.item}
          items={reviews.map((review) => ({
            key: review.id,
            node: (
              <QuoteCard
                review={review}
                starsLabel={t("stars", { rating: clampRating(review.rating) })}
                className={styles.plate}
              />
            ),
          }))}
        />

        {profileUrl && (
          <Reveal className={styles.footer}>
            <a className={styles.link} href={profileUrl} target="_blank" rel="noopener noreferrer">
              {t("written.link")} <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
