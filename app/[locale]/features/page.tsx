import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import { imgSrc } from "@/lib/imgSrc";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import FeatureBlock from "@/components/page/FeatureBlock";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import Eyebrow from "@/components/page/Eyebrow";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/features", "seo.features.title", "seo.features.desc");
}

// Maps the <strong>/<span> tags embedded in the f1-f3 bullet copy (messages/*.json) to real
// components instead of dangerouslySetInnerHTML.
const richBullet = {
  strong: (chunks: ReactNode) => <strong className={styles.strong}>{chunks}</strong>,
  span: (chunks: ReactNode) => <span className={styles.venueUrl}>{chunks}</span>,
};

export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("features.eyebrow")} title={t("features.title")} intro={t("features.intro")} />

      {/* Block A — the digital menu. Best-fit anchors: menu (primary), ordering (secondary). */}
      <span id="menu" className={styles.anchor} />
      <span id="ordering" className={styles.anchor} />
      <FeatureBlock
        eyebrow={t("features.f1.eyebrow")}
        title={t("features.f1.title")}
        body={t("features.f1.body")}
        bullets={[
          t.rich("features.f1.p1", richBullet),
          t.rich("features.f1.p2", richBullet),
          t.rich("features.f1.p3", richBullet),
          t.rich("features.f1.p4", richBullet),
        ]}
        image={imgSrc("features", locale)}
        imageAlt={t("alt.features")}
        side="right"
      />

      {/* Block B — the dashboard. Best-fit anchors: ai (primary), multi, daily, translate. */}
      <span id="ai" className={styles.anchor} />
      <span id="multi" className={styles.anchor} />
      <span id="daily" className={styles.anchor} />
      <span id="translate" className={styles.anchor} />
      <FeatureBlock
        eyebrow={t("features.f2.eyebrow")}
        title={t("features.f2.title")}
        body={t("features.f2.body")}
        bullets={[
          t.rich("features.f2.p1", richBullet),
          t.rich("features.f2.p2", richBullet),
          t.rich("features.f2.p3", richBullet),
          t.rich("features.f2.p4", richBullet),
        ]}
        image={imgSrc("dishes", locale)}
        imageAlt={t("alt.dishes")}
        side="left"
        frame="none"
      />

      {/* Block C — analytics. Best-fit anchor: reviews. */}
      <span id="reviews" className={styles.anchor} />
      <FeatureBlock
        eyebrow={t("features.f3.eyebrow")}
        title={t("features.f3.title")}
        body={t("features.f3.body")}
        bullets={[
          t.rich("features.f3.p1", richBullet),
          t.rich("features.f3.p2", richBullet),
          t.rich("features.f3.p3", richBullet),
        ]}
        image={imgSrc("manager_data", locale)}
        imageAlt={t("alt.managerData")}
        side="right"
        frame="none"
      />

      {/* Block D — done-for-you onboarding. Best-fit anchor: training (exact match: c4 is team training).
          The anchor is a zero-height `.anchor` span immediately before the section, same mechanism as
          the other seven anchors above — not an id on the heading itself, which has no
          scroll-margin-top and would land under the sticky header. */}
      <span id="training" className={styles.anchor} />
      <section className={styles.onboarding}>
        <Container>
          <div className={styles.onboardingHead}>
            {/* tone="dark": this block sits inside .onboarding's dark --ink band, not the page's
                light ground — see Eyebrow's doc comment for why --brand (not --brand-deep) is
                correct here. */}
            <Eyebrow tone="dark">{t("features.f4.eyebrow")}</Eyebrow>
            <h2 className={styles.onboardingTitle}>{t("features.f4.title")}</h2>
          </div>
          <CardGrid columns={4}>
            <Card
              icon={
                <span className={styles.numeral} aria-hidden="true">
                  i.
                </span>
              }
              title={t("features.f4.c1_title")}
              body={t("features.f4.c1_body")}
            />
            <Card
              icon={
                <span className={styles.numeral} aria-hidden="true">
                  ii.
                </span>
              }
              title={t("features.f4.c2_title")}
              body={t("features.f4.c2_body")}
            />
            <Card
              icon={
                <span className={styles.numeral} aria-hidden="true">
                  iii.
                </span>
              }
              title={t("features.f4.c3_title")}
              body={t("features.f4.c3_body")}
            />
            <Card
              icon={
                <span className={styles.numeral} aria-hidden="true">
                  iv.
                </span>
              }
              title={t("features.f4.c4_title")}
              body={t("features.f4.c4_body")}
            />
          </CardGrid>
        </Container>
      </section>

      <PageCta title={t("features.cta.title")} body={t("features.cta.body")} cta={t("common.demo_arrow")} source="features-cta" />
    </main>
  );
}
