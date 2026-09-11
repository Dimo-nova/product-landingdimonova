import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/routing";
import { pageMetadata } from "@/lib/meta";
import { CASES_PUBLISHED } from "@/lib/config";
import Container from "@/components/ui/Container";
import Annotated from "@/components/ui/Annotated";
import Reveal from "@/components/ui/Reveal";
import PageHero from "@/components/page/PageHero";
import PageCta from "@/components/page/PageCta";
import ClientFilms from "@/components/clients/ClientFilms";
import WrittenWall from "@/components/clients/WrittenWall";
import rawReviews from "@/data/reviews.json";
import { buildReviewRows, type ReviewsData } from "@/components/home/reviews-types";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/clients", "seo.clients.title", "seo.clients.desc");
}

// Imported at build time (not fetched) so the page stays static, and checked against the
// hand-written `ReviewsData` shape with `satisfies` rather than `as`, so a typo in the data
// file becomes a type error instead of being silently coerced away.
const reviews = rawReviews satisfies ReviewsData;

// The <mark> in clients.title maps to the drawn coral loop, not to dangerouslySetInnerHTML.
const richTitle = { mark: (chunks: ReactNode) => <Annotated>{chunks}</Annotated> };

/**
 * /clients — every review a client has left us, in one page: the video ones as full-width rows,
 * the written Google ones as their own block.
 *
 * Everything factual here comes out of `data/reviews.json`; there is no copy on this page that
 * puts words in a client's mouth. A video whose client has not written a review shows their
 * venue and location instead of a quote, and if the data file is ever emptied the page falls
 * back to the honest "reviews coming soon" line rather than to skeletons.
 *
 * The client logo row the owner asked about is deliberately NOT here yet — he deferred it
 * ("en el futuro meteremos todos los logos en fila con wrap-content, pero de momento no los
 * incluyas"). The case studies stay on /cases; this page only links to them.
 */
export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const { rows, unpaired } = buildReviewRows(reviews.videos, reviews.google);
  const empty = rows.length === 0 && unpaired.length === 0;

  return (
    <main id="main" tabIndex={-1}>
      <PageHero
        eyebrow={t("clients.eyebrow")}
        title={t.rich("clients.title", richTitle)}
        intro={t("clients.intro")}
      />

      {empty ? (
        <Container>
          {/* Reuses the home section's line rather than inventing a second wording for the
              same state. */}
          <p className={styles.pending}>{t("home.reviews.pending")}</p>
        </Container>
      ) : (
        <>
          {rows.length > 0 && <ClientFilms rows={rows} />}
          {unpaired.length > 0 && (
            <WrittenWall reviews={unpaired} profileUrl={reviews.profileUrl} />
          )}
        </>
      )}

      {/* Reviews are what a client says; the case studies are what we did. They belong on
          /cases, so this only points at them — and only while that page is published. */}
      {CASES_PUBLISHED && (
        <Container>
          <Reveal>
            <section className={styles.casesBand}>
              <div className={styles.casesCopy}>
                <h2 className={styles.casesTitle}>{t("clients.cases.title")}</h2>
                <p className={styles.casesBody}>{t("clients.cases.body")}</p>
              </div>
              <Link className={styles.casesLink} href="/cases">
                {t("clients.cases.link")} <span aria-hidden="true">→</span>
              </Link>
            </section>
          </Reveal>
        </Container>
      )}

      <PageCta title={t("clients.cta.title")} cta={t("common.demo_arrow")} source="clients-cta" />
    </main>
  );
}
