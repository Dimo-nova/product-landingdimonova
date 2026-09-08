import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/routing";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import CardGrid from "@/components/page/CardGrid";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

/**
 * The case studies are hidden until real ones exist. The page below is fully built on the
 * current design system; every venue in it is an invented placeholder, which is why commit
 * 514d840 ("hide testimonial and cases until reviews ready") made this route redirect home.
 * To publish it, delete the redirect in the component body and this comment. See TODO.md.
 */
const CASES_PUBLISHED: boolean = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/cases", "seo.cases.title", "seo.cases.desc");
}

// Maps the <em> tag embedded in cases.title to a real component instead of dangerouslySetInnerHTML.
const richTitle = {
  em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>,
};

// Maps the <strong> tag embedded in cases.note to a real component instead of dangerouslySetInnerHTML.
const richNote = {
  strong: (chunks: ReactNode) => <strong className={styles.noteStrong}>{chunks}</strong>,
};

// This page's content is almost entirely placeholder: cases.note (rendered below, inside the
// hero) is the visible disclaimer that says so. Keep it visible and keep every venue below as an
// invented placeholder — do not substitute the three real clients (Bálamo, La Pulpería, Calçots)
// for them. Naming a real client needs that client's written permission, which the owner is
// tracking separately; see TODO.md.
const GRID_TYPES = ["type_restaurant", "type_pub", "type_cafe", "type_restaurant", "type_pub", "type_cafe"] as const;

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!CASES_PUBLISHED) redirect({ href: "/", locale });
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("cases.eyebrow")} title={t.rich("cases.title", richTitle)} intro={t("cases.intro")}>
        <p className={styles.note}>{t.rich("cases.note", richNote)}</p>
      </PageHero>

      {/* Featured case — a one-off two-column panel (content + photo placeholder), not reused
          elsewhere, per the plan's "inline featured block" instruction. */}
      <section className={styles.featuredSection}>
        <Container>
          <div className={styles.featuredPanel}>
            <div className={styles.featuredContent}>
              <div>
                <p className={styles.eyebrow}>{t("cases.featured.eyebrow")}</p>
                <p className={styles.quote}>{t("cases.featured.quote")}</p>
                <p className={styles.body}>{t("cases.featured.body")}</p>
              </div>
              <div className={styles.person}>
                <div className={styles.avatar} aria-hidden="true" />
                <div>
                  <p className={styles.personName}>{t("cases.featured.client")}</p>
                  <p className={styles.personRole}>{t("cases.featured.role")}</p>
                </div>
              </div>
            </div>
            <div className={styles.featuredPhoto}>
              <span className={styles.photoBadge}>{t("cases.featured.photo_badge")}</span>
              <span className={styles.photoPill}>{t("cases.featured.photo_pill")}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Grid of placeholder venues. Reuses CardGrid purely for its responsive-grid behaviour —
          each item pairs a photo placeholder with a two-column stats footer, a shape Card's
          title/body/footer signature doesn't fit, so the items are built inline (same call as
          PricingIncluded in Task 3). */}
      <section className={styles.gridSection}>
        <Container>
          <CardGrid columns={3}>
            {GRID_TYPES.map((type, i) => (
              // eslint-disable-next-line react/no-array-index-key -- all six cards render identical placeholder copy, no stable identity to key on
              <div key={i} className={styles.venueCard}>
                <div className={styles.venuePhoto}>
                  <span className={styles.photoBadge}>{t("cases.grid.photo")}</span>
                </div>
                <div className={styles.venueBody}>
                  <p className={styles.venueType}>{t(`cases.grid.${type}`)}</p>
                  <p className={styles.venueName}>{t("cases.grid.venue")}</p>
                  <p className={styles.venueSummary}>{t("cases.grid.summary")}</p>
                  <div className={styles.stats}>
                    <div>
                      <p className={styles.statLabel}>{t("cases.grid.live_since")}</p>
                      <p className={styles.statValue}>{t("cases.grid.live_value")}</p>
                    </div>
                    <div>
                      <p className={styles.statLabel}>{t("cases.grid.result")}</p>
                      <p className={styles.statResult}>{t("cases.grid.result_value")}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardGrid>
        </Container>
      </section>

      <PageCta title={t("cases.cta.title")} cta={t("common.demo_arrow")} source="cases-cta" />
    </main>
  );
}
