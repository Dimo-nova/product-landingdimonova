import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import Faq from "@/components/page/Faq";
import Placeholder from "@/components/ui/Placeholder";
import SectionHead from "./SectionHead";
import ReviewsFlow from "./ReviewsFlow";
import section from "./Section.module.css";
import styles from "./ReviewsSections.module.css";

type CardCopy = { title: string; body: string; placeholder?: string };
type FaqItem = { q: string; a: string };

/**
 * The body of `/features/reviews`: the flow both ratings take, an explicit statement that this is
 * not review gating, what a tagged reason actually tells you, and a short FAQ.
 *
 * The description of the flow is authoritative and must not drift: every rating reaches Google.
 * A low one is asked for a reason and tagged to a waiter or an area *before* being sent on. This
 * page must never describe the product as filtering, holding back or hiding a review.
 */
export default async function ReviewsSections() {
  const t = await getTranslations("features.pages.reviews");

  const does = t.raw("s2.does") as string[];
  const doesNot = t.raw("s2.doesNot") as string[];
  const cards = t.raw("s3.cards") as CardCopy[];
  const faq = t.raw("faq.items") as FaqItem[];

  return (
    <>
      {/* ---- Both paths, one destination ---- */}
      <Container>
        <section className={section.section}>
          <SectionHead eyebrow={t("s1.eyebrow")} title={t("s1.title")} body={t("s1.body")} />
          <div className={styles.flowGrid}>
            <Reveal className={styles.paths}>
              <div className={styles.path}>
                <h3 className={styles.pathTitle}>{t("s1.highTitle")}</h3>
                <p className={styles.pathBody}>{t("s1.highBody")}</p>
              </div>
              <div className={[styles.path, styles.pathLow].join(" ")}>
                <h3 className={styles.pathTitle}>{t("s1.lowTitle")}</h3>
                <p className={styles.pathBody}>{t("s1.lowBody")}</p>
              </div>
              <p className={styles.pathNote}>{t("s1.note")}</p>
            </Reveal>

            <Reveal delay={0.1} className={styles.demoCol}>
              <ReviewsFlow
                ratingLabel={t("s1.demo.ratingLabel")}
                chips={t.raw("s1.demo.chips") as string[]}
                destination={t("s1.demo.destination")}
              />
            </Reveal>
          </div>
        </section>
      </Container>

      {/* ---- The line this product must never be described as crossing ---- */}
      <section className={[section.section, section.cream].join(" ")}>
        <Container>
          <SectionHead eyebrow={t("s2.eyebrow")} title={t("s2.title")} body={t("s2.body")} />
          <div className={styles.ledger}>
            <Reveal className={styles.ledgerCol}>
              <h3 className={styles.ledgerTitle}>{t("s2.doesTitle")}</h3>
              <ul className={styles.ledgerList}>
                {does.map((item) => (
                  <li key={item} className={styles.ledgerItem}>
                    <span className={[styles.mark, styles.markYes].join(" ")} aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08} className={[styles.ledgerCol, styles.ledgerColNo].join(" ")}>
              <h3 className={styles.ledgerTitle}>{t("s2.doesNotTitle")}</h3>
              <ul className={styles.ledgerList}>
                {doesNot.map((item) => (
                  <li key={item} className={styles.ledgerItem}>
                    <span className={[styles.mark, styles.markNo].join(" ")} aria-hidden="true">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---- What a tagged reason gives you. Each card reserves the space for the dashboard
              capture that will show that view (see TODO.md). ---- */}
      <Container>
        <section className={section.section}>
          <SectionHead eyebrow={t("s3.eyebrow")} title={t("s3.title")} />
          <CardGrid columns={3}>
            {cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.06} className={styles.cell}>
                <Card media={card.placeholder ? <Placeholder label={card.placeholder} /> : undefined} title={card.title} body={card.body} />
              </Reveal>
            ))}
          </CardGrid>
        </section>
      </Container>

      {/* ---- FAQ ---- */}
      <Container>
        <section className={[section.section, styles.faqSection].join(" ")}>
          <SectionHead eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
          <Faq items={faq} />
        </section>
      </Container>
    </>
  );
}
