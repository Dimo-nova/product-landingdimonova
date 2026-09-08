import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/routing";
import { pageMetadata } from "@/lib/meta";
import { CASES_PUBLISHED } from "@/lib/config";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import Eyebrow from "@/components/page/Eyebrow";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/cases", "seo.cases.title", "seo.cases.desc");
}

// Maps the <em> tag embedded in cases.title to a real component instead of dangerouslySetInnerHTML.
const richTitle = {
  em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>,
};

/**
 * The three real clients, in the order the owner supplied them. Copy lives in
 * `messages/*.json` under `cases.items.<slug>` — nothing on this page is invented, so if a
 * fact isn't in those strings it doesn't belong here (no view counts, no dates, no quotes).
 *
 * `logo` points at the same files the home page's LogoStrip uses. Despite its "-neg" name,
 * logo-calsot-neg.png is dark ink (#1D1D1D) on transparent, exactly like the two SVGs, so all
 * three sit on the same light --cream plate.
 */
const CASES = [
  { slug: "calsot", logo: "/assets/Logos/logo-calsot-neg.png" },
  { slug: "pulperia", logo: "/assets/Logos/lapulperia.svg" },
  { slug: "balamo", logo: "/assets/Logos/balamo.svg" },
] as const;

/** Every case reads the same way: what they had, what we built, what they have now. */
const STEPS = ["before", "work", "result"] as const;

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // See CASES_PUBLISHED's doc comment in lib/config.ts. The flag is true now that real cases
  // exist, but the gate stays: it is the one switch that pulls the page (and its sitemap entry)
  // if the owner ever needs to take it down.
  if (!CASES_PUBLISHED) redirect({ href: "/", locale });
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("cases.eyebrow")} title={t.rich("cases.title", richTitle)} intro={t("cases.intro")} />

      <section className={styles.section}>
        <Container>
          <ol className={styles.list}>
            {CASES.map(({ slug, logo }) => (
              <li key={slug} className={styles.case}>
                <div className={styles.aside}>
                  <div className={styles.logoPlate}>
                    {/* alt="": the venue name sits in the <h2> immediately after, so real alt
                        text here would just announce the name twice. Same call as
                        BalamoShowcase's logo on the home page. */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- next/image would need dangerouslyAllowSVG for two of the three logos; LogoStrip and BalamoShowcase use plain <img> for the same files. */}
                    <img src={logo} alt="" className={styles.logo} />
                  </div>
                  <Eyebrow className={styles.type}>{t(`cases.items.${slug}.type`)}</Eyebrow>
                  <h2 className={styles.name}>{t(`cases.items.${slug}.name`)}</h2>
                  <ul className={styles.tags}>
                    {(t.raw(`cases.items.${slug}.tags`) as string[]).map((tag) => (
                      <li key={tag} className={styles.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.steps}>
                  {STEPS.map((step) => (
                    <div key={step} className={styles.step}>
                      <h3 className={styles.stepLabel}>{t(`cases.steps.${step}`)}</h3>
                      <p className={styles.stepBody}>{t(`cases.items.${slug}.${step}`)}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <PageCta title={t("cases.cta.title")} cta={t("common.demo_arrow")} source="cases-cta" />
    </main>
  );
}
