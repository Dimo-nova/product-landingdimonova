import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import InlineVideo from "@/components/ui/InlineVideo";
import Eyebrow from "@/components/page/Eyebrow";
import type { ReviewRow } from "@/components/home/reviews-types";
import QuoteCard, { clampRating } from "./QuoteCard";
import styles from "./ClientFilms.module.css";

/**
 * The video reviews, one full-width row each, alternating sides down the page.
 *
 * The rows come from `buildReviewRows`, so a row shows a written quote only when that video
 * declares the review's id — never by array position. A video whose client has not written
 * anything shows their name and where they are, and nothing else: no placeholder quote, no
 * invented words.
 *
 * Playback is `InlineVideo`: the local poster stays on screen until the visitor presses play,
 * and only then is a `<video>` mounted against the .mp4 on the project's Supabase bucket. That
 * is why the page loads with no third-party request at all.
 */
export default async function ClientFilms({ rows }: { rows: ReviewRow[] }) {
  const t = await getTranslations("clients");

  return (
    <section className={styles.section} data-section="films">
      <Container>
        <Reveal className={styles.head}>
          <Eyebrow>{t("films.eyebrow")}</Eyebrow>
          <h2 className={styles.title}>{t("films.title")}</h2>
          <p className={styles.note}>{t("films.note")}</p>
        </Reveal>

        <ol className={styles.list}>
          {rows.map(({ video, review }, i) => {
            // The DOM order matches the visual order on both sides, so the reading order a
            // screen reader gets is the one on screen and the halves stack in that order below
            // 900px — same call as the home section.
            const flipped = i % 2 === 1;

            const media = (
              <InlineVideo
                key="media"
                src={video.src}
                poster={video.poster}
                posterAlt={t("posterAlt", { name: video.name })}
                playLabel={t("playVideo", { name: video.name })}
                sizes="(max-width: 900px) 92vw, 780px"
                className={styles.video}
              />
            );

            const aside = (
              <div key="aside" className={styles.aside}>
                <span className={styles.index} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.name}>{video.name}</h3>
                <p className={styles.venue}>{video.venue}</p>
                {review && (
                  <QuoteCard
                    review={review}
                    starsLabel={t("stars", { rating: clampRating(review.rating) })}
                    byline={false}
                    className={styles.quote}
                  />
                )}
              </div>
            );

            return (
              <li key={video.id} className={styles.item} data-film={video.id}>
                <Reveal className={[styles.row, flipped ? styles.flipped : ""].filter(Boolean).join(" ")}>
                  {flipped ? aside : media}
                  {flipped ? media : aside}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
