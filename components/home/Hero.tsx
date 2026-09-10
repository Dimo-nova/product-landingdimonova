import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Annotated from "@/components/ui/Annotated";
import { Link } from "@/lib/routing";
import { ADMIN_URL, HERO_VIDEO_POSTER, HERO_VIDEO_SRC } from "@/lib/config";
import EmailCta from "./EmailCta";
import HeroPlayPill from "./HeroPlayPill";
import HeroBgPhoto from "./HeroBgPhoto";
import styles from "./Hero.module.css";

/** Home hero: owns the page's only <h1>, the email CTA and the photographic background. */
export default async function Hero() {
  const t = await getTranslations();

  return (
    <Container>
      <section className={styles.section}>
        <div className={styles.content}>
          {HERO_VIDEO_SRC && (
            <div className={styles.pillRow}>
              <HeroPlayPill label={t("home.hero.playPill")} src={HERO_VIDEO_SRC} poster={HERO_VIDEO_POSTER} />
            </div>
          )}

          <h1 className={styles.title}>
            {t.rich("home.hero.title", {
              mark: (chunks) => <Annotated>{chunks}</Annotated>,
              // Only the Spanish headline uses <line>: "Nosotros nos ocupamos." and "Tú creces."
              // must never share a line, and a hard break in the copy is the only way to say
              // that per language. Locales whose string omits the tag are unaffected, so the
              // English headline keeps wrapping wherever the width puts it.
              line: (chunks) => <span className={styles.titleLine}>{chunks}</span>,
            })}
          </h1>

          <p className={styles.lead}>{t("home.hero.lead")}</p>

          <div className={styles.cta}>
            <EmailCta source="hero" onDark />
          </div>

          <p className={styles.legal}>
            {t.rich("home.hero.legal", { link: (chunks) => <Link href="/legal/privacy">{chunks}</Link> })}
          </p>

          <a className={styles.dashboardLink} href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            {t("home.hero.clientLink")} <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* After the copy in the DOM, not before it. On desktop this is absolutely positioned so
            the order is irrelevant, but below 900px the card becomes a plain column and the
            photograph sits under the text with nothing on top of it, which is the order a
            screen reader and a narrow screen should both get. */}
        <HeroBgPhoto alt={t("alt.heroPhoto")} />
      </section>
    </Container>
  );
}
