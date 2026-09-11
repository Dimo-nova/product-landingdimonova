import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import Eyebrow from "@/components/page/Eyebrow";
import FeatureBlock from "@/components/page/FeatureBlock";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import Faq from "@/components/page/Faq";
import Placeholder from "@/components/ui/Placeholder";
import AiDemo from "@/components/home/AiDemo";
import SectionHead from "./SectionHead";
import section from "./Section.module.css";
import styles from "./MenuSections.module.css";

type Lang = { label: string; dish: string };
type CardCopy = { title: string; body: string; placeholder?: string };
type FaqItem = { q: string; a: string };

// Roman numerals, matching the shape the features page's onboarding cards already used.
const NUMERALS = ["i.", "ii.", "iii."];

/**
 * The body of `/features/menu`: what diners see, the dashboard and its assistant, translations,
 * the three things bundled with it, and a short FAQ. This is the flagship page — it absorbed the
 * five services the owner folded into the digital menu, so each of them is a section here rather
 * than a product of its own.
 */
export default async function MenuSections() {
  const t = await getTranslations("features.pages.menu");
  const tAlt = await getTranslations("alt");

  const bullets = t.raw("s1.bullets") as string[];
  const steps = t.raw("s2.steps") as string[];
  const langs = t.raw("s3.langs") as Lang[];
  const cards = t.raw("s4.cards") as CardCopy[];
  const faq = t.raw("faq.items") as FaqItem[];

  return (
    <>
      {/* ---- What diners see: the real menu on a phone ---- */}
      <section className={section.section}>
        <Reveal>
          <FeatureBlock
            eyebrow={t("s1.eyebrow")}
            title={t("s1.title")}
            body={t("s1.body")}
            bullets={bullets}
            image="/assets/cases/balamo-phone-carta.webp"
            imageAlt={tAlt("balamoPhone")}
            side="right"
          />
        </Reveal>
      </section>

      {/* ---- Dashboard + AI. Reuses the home page's assistant mock: it is the same dashboard,
              and rebuilding a second animated copy of it would only let the two drift apart. ---- */}
      <Container>
        <section className={[section.dark, styles.aiSection].join(" ")}>
          <div className={styles.aiGrid}>
            <Reveal className={styles.aiCopy}>
              <Eyebrow tone="dark">{t("s2.eyebrow")}</Eyebrow>
              <h2 className={styles.aiTitle}>{t("s2.title")}</h2>
              <p className={styles.aiBody}>{t("s2.body")}</p>
              <ol className={styles.steps}>
                {steps.map((step, i) => (
                  <li key={step} className={styles.step}>
                    <span className={styles.stepNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={0.1} className={styles.aiDemoCol}>
              <AiDemo />
            </Reveal>
          </div>
        </section>
      </Container>

      {/* ---- Translations: one dish, six languages, moving past ---- */}
      <section className={[section.section, section.cream, styles.langSection].join(" ")}>
        <Container>
          <SectionHead eyebrow={t("s3.eyebrow")} title={t("s3.title")} body={t("s3.body")} />
        </Container>
        <Marquee speed={46} repeat={3} pauseOnHover className={styles.langMarquee}>
          {langs.map((lang) => (
            <div key={lang.label} className={styles.langChip}>
              <span className={styles.langLabel}>{lang.label}</span>
              <span className={styles.langDish}>{lang.dish}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ---- Multi-venue, daily menu, training and support. Each card reserves the space for
              the capture or photograph that will show it (see TODO.md). ---- */}
      <Container>
        <section className={section.section}>
          <SectionHead eyebrow={t("s4.eyebrow")} title={t("s4.title")} />
          <CardGrid columns={3}>
            {cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.06} className={styles.cell}>
                <Card
                  media={card.placeholder ? <Placeholder label={card.placeholder} /> : undefined}
                  icon={
                    <span className={styles.numeral} aria-hidden="true">
                      {NUMERALS[i]}
                    </span>
                  }
                  title={card.title}
                  body={card.body}
                />
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
