import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import { HERO_VIDEO_POSTER, HERO_VIDEO_SRC } from "@/lib/config";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import StoryHero from "@/components/about/StoryHero";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import Eyebrow from "@/components/page/Eyebrow";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/about", "seo.about.title", "seo.about.desc");
}

const PRINCIPLE_NUMERALS = { "1": "i.", "2": "ii.", "3": "iii." } as const;
const PRINCIPLE_NUMS = Object.keys(PRINCIPLE_NUMERALS) as (keyof typeof PRINCIPLE_NUMERALS)[];

/**
 * The team section was hidden by the owner in commit 249fec2 ("comment out AboutTeam section").
 * The markup below is rebuilt on the current design system and ready; flip this to true to
 * publish it. See TODO.md.
 */
const TEAM_PUBLISHED: boolean = false;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      {/* The first client's story video *is* the hero: the poster fills the panel with the page's
          copy over its corner, and a play button starts it in place, with sound and a mute
          toggle. Nothing is requested from Supabase until that press. Without the constant the
          plain PageHero stands in, so the page can never ship a player pointing at a file that
          isn't there. */}
      {HERO_VIDEO_SRC ? (
        <StoryHero
          title={t("about.title")}
          src={HERO_VIDEO_SRC}
          poster={HERO_VIDEO_POSTER}
          posterAlt={t("alt.storyVideo")}
        />
      ) : (
        <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} intro={t("about.intro")} />
      )}

      {/* "Why we exist" — prose beside a photograph of an owner at his bar (see
          public/assets/about/SOURCES.md). */}
      <section className={styles.whySection}>
        <Container>
          <div className={styles.whyGrid}>
            <div className={styles.whyContent}>
              <Eyebrow>{t("about.why.eyebrow")}</Eyebrow>
              <h2 className={styles.whyTitle}>{t("about.why.title")}</h2>
              <p className={styles.whyBody}>{t("about.why.p1")}</p>
              <p className={styles.whyBody}>{t("about.why.p2")}</p>
              <p className={styles.whyBody}>{t("about.why.p3")}</p>
            </div>
            <div className={styles.asidePhoto}>
              <Image
                src="/assets/about/owner-at-bar.webp"
                alt={t("alt.ownerPhoto")}
                fill
                sizes="(max-width: 900px) 92vw, 560px"
                className={styles.asidePhotoImage}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Principles — three Cards, same title/body + roman-numeral-icon shape as features.f4. */}
      <section className={styles.principlesSection}>
        <Container>
          <Eyebrow>{t("about.principles.eyebrow")}</Eyebrow>
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

      {/* Team — the two real headshots, mirroring the legacy section's two-card layout
          (see git show dd1f27b~1:components/sections/AboutTeam.tsx). Card's fixed title/body
          shape and 4:3 media box don't fit square headshots, so this reuses CardGrid purely
          for its responsive layout (same call as the cases venue grid) with custom item markup.

          Pablo and Sergio's names, "Co-owner" captions and alt text ("Pablo, co-owner" /
          "Sergio, co-owner") match the legacy section's copy — restyled, not rewritten. But the
          owner hid this section on the current page (commit 249fec2); it is NOT what visitors
          see today. Gated behind TEAM_PUBLISHED above until the owner decides to turn it back on.

          about.team.name/role1/role2/role3/role4/portrait are unused copy left over from an
          earlier four-person design; left as-is until the owner decides who else appears here
          (tracked in TODO.md). */}
      {TEAM_PUBLISHED && (
        <section className={styles.teamSection}>
          <Container>
            <Eyebrow>{t("about.team.eyebrow")}</Eyebrow>
            <h2 className={styles.teamTitle}>{t("about.team.title")}</h2>
            <div className={styles.teamGridWrap}>
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
              </CardGrid>
            </div>
          </Container>
        </section>
      )}

      <PageCta title={t("about.cta.title")} cta={t("common.demo_arrow")} source="about-cta" />
    </main>
  );
}
