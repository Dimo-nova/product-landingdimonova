import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/about", "seo.about.title", "seo.about.desc");
}

const PRINCIPLE_NUMERALS = { "1": "i.", "2": "ii.", "3": "iii." } as const;
const PRINCIPLE_NUMS = Object.keys(PRINCIPLE_NUMERALS) as (keyof typeof PRINCIPLE_NUMERALS)[];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      {/*
       * The design spec puts the first client's video in this hero — the same clip
       * components/home/HeroPlayPill.tsx wants at /assets/videos/how-it-started.mp4, which
       * doesn't exist yet (tracked in TODO.md). Shipping a player/poster/play button pointing
       * at a file that isn't there is the exact dead end the home page had to remove this
       * phase, so the hero renders without one until the video is supplied.
       */}
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} intro={t("about.intro")} />

      {/* "Why we exist" — prose beside a pull-quote panel. A one-off shape: FeatureBlock's
          image prop expects a screenshot path, not a quote, so this is built inline the same
          way PricingShape/CasesFeatured were. */}
      <section className={styles.whySection}>
        <Container>
          <div className={styles.whyGrid}>
            <div className={styles.whyContent}>
              <p className={styles.eyebrow}>{t("about.why.eyebrow")}</p>
              <h2 className={styles.whyTitle}>{t("about.why.title")}</h2>
              <p className={styles.whyBody}>{t("about.why.p1")}</p>
              <p className={styles.whyBody}>{t("about.why.p2")}</p>
              <p className={styles.whyBody}>{t("about.why.p3")}</p>
            </div>
            <div className={styles.asidePanel}>
              <p className={styles.asideLabel}>{t("about.why.aside_label")}</p>
              <p className={styles.asideQuote}>{t("about.why.aside_quote")}</p>
              <p className={styles.asideSign}>{t("about.why.aside_sign")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Principles — three Cards, same title/body + roman-numeral-icon shape as features.f4. */}
      <section className={styles.principlesSection}>
        <Container>
          <p className={styles.eyebrow}>{t("about.principles.eyebrow")}</p>
          <h2 className={styles.principlesTitle}>{t("about.principles.title")}</h2>
          <CardGrid columns={3}>
            {PRINCIPLE_NUMS.map((n) => (
              <Card
                key={n}
                icon={
                  <span className={styles.numeral} aria-hidden="true">
                    {PRINCIPLE_NUMERALS[n]}
                  </span>
                }
                title={t(`about.principles.p${n}_title`)}
                body={t(`about.principles.p${n}_body`)}
              />
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* Team — two real headshots plus two placeholder cards. Card's fixed title/body shape
          and 4:3 media box don't fit square headshots + a photo-pending placeholder, so this
          reuses CardGrid purely for its responsive layout (same call as the cases venue grid)
          with custom item markup.

          Pablo and Sergio's names, "Co-owner" captions and alt text ("Pablo, co-owner" /
          "Sergio, co-owner") are unchanged from the current page — restyled, not rewritten.
          The two placeholder cards are new (per this task's brief) and source their copy from
          about.team.name/role3/role4, translated in all five locales already. about.team.role1
          and role2 also exist and read like they could have been meant for Pablo/Sergio's
          captions instead of "Co-owner", but swapping in copy the current page doesn't show
          isn't something this task's brief authorizes, so they're left unused — flagged in the
          task report and TODO.md as a content decision for the owner. */}
      <section className={styles.teamSection}>
        <Container>
          <p className={styles.eyebrow}>{t("about.team.eyebrow")}</p>
          <h2 className={styles.teamTitle}>{t("about.team.title")}</h2>
          <CardGrid columns={2}>
            <div className={styles.teamCard}>
              <div className={styles.photo}>
                <Image
                  src="/assets/pablo_headshot.jpeg"
                  alt="Pablo, co-owner"
                  fill
                  sizes="(max-width: 640px) 50vw, 260px"
                  className={styles.photoImage}
                />
              </div>
              <p className={styles.teamName}>Pablo</p>
              <p className={styles.teamRole}>Co-owner</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.photo}>
                <Image
                  src="/assets/sergio_headshot.jpg"
                  alt="Sergio, co-owner"
                  fill
                  sizes="(max-width: 640px) 50vw, 260px"
                  className={styles.photoImage}
                />
              </div>
              <p className={styles.teamName}>Sergio</p>
              <p className={styles.teamRole}>Co-owner</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoBadge}>{t("about.team.portrait")}</span>
              </div>
              <p className={styles.teamName}>{t("about.team.name")}</p>
              <p className={styles.teamRole}>{t("about.team.role3")}</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoBadge}>{t("about.team.portrait")}</span>
              </div>
              <p className={styles.teamName}>{t("about.team.name")}</p>
              <p className={styles.teamRole}>{t("about.team.role4")}</p>
            </div>
          </CardGrid>
        </Container>
      </section>

      <PageCta title={t("about.cta.title")} cta={t("common.demo_arrow")} source="about-cta" />
    </main>
  );
}
