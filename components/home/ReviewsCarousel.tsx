"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, animate, type Transition } from "motion/react";
import { useTranslations } from "next-intl";
import { openVideo } from "@/lib/events";
import type { GoogleReview, ReviewCard, VideoReview } from "./reviews-types";
import styles from "./Reviews.module.css";

const SNAP: Transition = { type: "spring", stiffness: 320, damping: 34 };

/**
 * Drag/arrow carousel over the interleaved video + Google review cards. `dragConstraints` is
 * computed from the track's actual scroll width against the viewport's clientWidth (via refs,
 * measured on mount and on resize) rather than hard-coded, since card count and viewport width
 * both vary. The previous/next buttons and the drag handler share one `goTo(index)` that
 * animates the same motion value, so keyboard/pointer navigation and the dot row never fall out
 * of sync.
 */
export default function ReviewsCarousel({ cards }: { cards: ReviewCard[] }) {
  const t = useTranslations("home.reviews");
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const [index, setIndex] = useState(0);
  const [cardStep, setCardStep] = useState(0);
  const [leftBound, setLeftBound] = useState(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstCard = track?.firstElementChild as HTMLElement | null;
    if (!viewport || !track || !firstCard) return;
    const gapValue = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    setCardStep(firstCard.getBoundingClientRect().width + gapValue);
    setLeftBound(Math.min(0, viewport.clientWidth - track.scrollWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, cards.length]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, next));
      setIndex(clamped);
      animate(x, Math.max(leftBound, -clamped * cardStep), SNAP);
    },
    [cards.length, cardStep, leftBound, x],
  );

  const handleDragEnd = useCallback(() => {
    if (!cardStep) return;
    goTo(Math.round(-x.get() / cardStep));
  }, [cardStep, goTo, x]);

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport} ref={viewportRef}>
        <motion.div
          ref={trackRef}
          className={styles.track}
          drag="x"
          dragConstraints={{ left: leftBound, right: 0 }}
          dragElastic={0.08}
          style={{ x }}
          onDragEnd={handleDragEnd}
        >
          {cards.map((card) => (
            <div className={styles.slide} key={card.item.id}>
              {card.type === "video" ? (
                <VideoCard item={card.item} playLabel={t("playVideo", { name: card.item.name })} />
              ) : (
                <GoogleCard
                  item={card.item}
                  moreLabel={t("more")}
                  lessLabel={t("less")}
                  viewLabel={t("viewOnGoogle")}
                  starsLabel={t("stars", { rating: card.item.rating ?? 5 })}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          aria-label={t("prev")}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div className={styles.dots} aria-hidden="true">
          {cards.map((card, i) => (
            <span
              key={card.item.id}
              className={[styles.dot, i === index ? styles.dotActive : ""].filter(Boolean).join(" ")}
            />
          ))}
        </div>
        {/* The dots above are aria-hidden (they're purely decorative for sighted users); this
            gives assistive tech the equivalent position. No aria-live: the carousel only moves
            on deliberate prev/next/drag input, so there's no risk of an unsolicited
            announcement the way the AI demo's autoplaying toast would have. */}
        <span className="u-visually-hidden">{t("position", { current: index + 1, total: cards.length })}</span>

        <button
          type="button"
          className={styles.arrow}
          aria-label={t("next")}
          onClick={() => goTo(index + 1)}
          disabled={index === cards.length - 1}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Video review card: a 9:16 poster (never a mounted `<video>` — the shared modal owns
 * playback), a coral play button, and the name/venue over a bottom gradient. Clicking the play
 * button dispatches `openVideo`; `lib/events.ts`'s globally-mounted `VideoModal` handles the
 * rest.
 */
function VideoCard({ item, playLabel }: { item: VideoReview; playLabel: string }) {
  return (
    <div className={styles.videoCard} data-review-card>
      <Image
        src={item.poster}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 72vw, 300px"
        className={styles.poster}
      />
      <div className={styles.videoGradient} aria-hidden="true" />
      <button
        type="button"
        className={styles.playBtn}
        aria-label={playLabel}
        onClick={() =>
          openVideo({ src: item.src, poster: item.poster, title: item.name, orientation: "portrait" })
        }
      >
        <span aria-hidden="true">▶</span>
      </button>
      <div className={styles.videoCaption}>
        <span className={styles.videoName}>{item.name}</span>
        <span className={styles.videoVenue}>{item.venue}</span>
      </div>
    </div>
  );
}

/**
 * Google review card: initial-letter avatar, decorative (`aria-hidden`) filled/empty stars with
 * a visually-hidden "{rating} out of 5" equivalent for assistive tech, text clamped to four
 * lines with a more/less toggle that only appears once the text actually overflows, and an
 * outbound link to the review on Google. `item.rating` defaults to 5 (all reviews collected so
 * far have been 5-star) once real data supplies fewer.
 */
function GoogleCard({
  item,
  moreLabel,
  lessLabel,
  viewLabel,
  starsLabel,
}: {
  item: GoogleReview;
  moreLabel: string;
  lessLabel: string;
  viewLabel: string;
  starsLabel: string;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setCanExpand(el.scrollHeight - el.clientHeight > 1);
  }, [item.text]);

  const initial = item.name.trim().charAt(0).toUpperCase() || "?";
  const rating = Math.max(0, Math.min(5, item.rating ?? 5));

  return (
    <div className={styles.googleCard} data-review-card>
      <div className={styles.googleHead}>
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
        <div>
          <div className={styles.googleName}>{item.name}</div>
          <div className={styles.googleVenue}>{item.venue}</div>
        </div>
      </div>

      <div className={styles.stars} aria-hidden="true">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <span className="u-visually-hidden">{starsLabel}</span>

      <p
        ref={textRef}
        className={[styles.text, expanded ? styles.textExpanded : ""].filter(Boolean).join(" ")}
      >
        {item.text}
      </p>

      {canExpand && (
        <button type="button" className={styles.toggle} onClick={() => setExpanded((v) => !v)}>
          {expanded ? lessLabel : moreLabel}
        </button>
      )}

      <a className={styles.link} href={item.url} target="_blank" rel="noopener noreferrer">
        {viewLabel}
      </a>
    </div>
  );
}
