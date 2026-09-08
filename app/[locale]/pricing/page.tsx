import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageHero from "@/components/page/PageHero";
import CardGrid from "@/components/page/CardGrid";
import Eyebrow from "@/components/page/Eyebrow";
import Faq from "@/components/page/Faq";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/pricing", "seo.pricing.title", "seo.pricing.desc");
}

// Maps the <em> tag embedded in pricing.title (messages/*.json) to a real component instead of
// dangerouslySetInnerHTML.
const richTitle = {
  em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>,
};

const INCLUDED_KEYS = ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9"] as const;
const SHAPE_KEYS = ["i1", "i2", "i3", "i4", "i5"] as const;
const FAQ_NUMS = ["1", "2", "3", "4", "5"] as const;

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const faqItems = FAQ_NUMS.map((n) => ({ q: t(`pricing.faq.q${n}`), a: t(`pricing.faq.a${n}`) }));

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("pricing.eyebrow")} title={t.rich("pricing.title", richTitle)} intro={t("pricing.intro")} />

      {/* "What's always included" — same content as legacy PricingIncluded, laid out with the
          shared CardGrid rather than individual bordered Cards: each item is a one-line
          checkmark + sentence, not a title/body pair, so it matches the original grid-of-rows
          shape more closely than forcing every item into Card's title+body signature. */}
      <section className={styles.includedSection}>
        <Container>
          <div className={styles.panel}>
            <Eyebrow>{t("pricing.included.eyebrow")}</Eyebrow>
            <h2 className={styles.panelTitle}>{t("pricing.included.title")}</h2>
            <CardGrid columns={2}>
              {INCLUDED_KEYS.map((k) => (
                <div key={k} className={styles.includedItem}>
                  <span className={styles.check} aria-hidden="true">
                    ✓
                  </span>
                  <span>{t(`pricing.included.${k}`)}</span>
                </div>
              ))}
            </CardGrid>
          </div>
        </Container>
      </section>

      {/* "What shapes your quote" + "ready to talk numbers" — legacy PricingShape and
          PricingStrip, one-off panels built inline as a two-card layout per the plan (they
          aren't reused anywhere else, so they don't get a shared component). */}
      <section className={styles.quoteSection}>
        <Container>
          <div className={styles.quoteGrid}>
            <div className={styles.shapeCard}>
              <p className={styles.eyebrowMuted}>{t("pricing.shape.eyebrow")}</p>
              <p className={styles.shapeIntro}>{t("pricing.shape.intro")}</p>
              <ul className={styles.chipList}>
                {SHAPE_KEYS.map((k) => (
                  <li key={k} className={styles.chip}>
                    {t(`pricing.shape.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.stripCard}>
              <div>
                <p className={styles.stripTitle}>{t("pricing.strip.title")}</p>
                <p className={styles.stripBody}>{t("pricing.strip.body")}</p>
              </div>
              <Button href="/contact" size="xl">
                {t("pricing.strip.cta")}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="faq" className={styles.faqSection}>
        <Container>
          <div className={styles.faqInner}>
            <h2 className={styles.faqTitle}>{t("pricing.faq.title")}</h2>
            <Faq items={faqItems} />
          </div>
        </Container>
      </section>
    </main>
  );
}
