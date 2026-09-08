import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Annotated from "@/components/ui/Annotated";
import { Link } from "@/lib/routing";
import { ADMIN_URL, HERO_VIDEO_SRC } from "@/lib/config";
import EmailCta from "./EmailCta";
import HeroPlayPill from "./HeroPlayPill";
import HeroBackground from "./HeroBackground";
import styles from "./Hero.module.css";

/** Home hero: owns the page's only <h1>, the email CTA, and the (temporary) photo/mock background switch. */
export default async function Hero() {
  const t = await getTranslations();

  return (
    <Container>
      <section className={styles.section}>
        <HeroBackground photoAlt={t("alt.heroPhoto")} mockAlt={t("alt.heroMock")} />

        <div className={styles.content}>
          {HERO_VIDEO_SRC && (
            <div className={styles.pillRow}>
              <HeroPlayPill label={t("home.hero.playPill")} src={HERO_VIDEO_SRC} />
            </div>
          )}

          <h1 className={styles.title}>
            {t.rich("home.hero.title", { mark: (chunks) => <Annotated>{chunks}</Annotated> })}
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
      </section>
    </Container>
  );
}
