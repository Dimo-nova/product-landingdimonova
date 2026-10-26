import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import { Link } from "@/lib/routing";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import Eyebrow from "@/components/page/Eyebrow";
import PageCta from "@/components/page/PageCta";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/whatsapp", "seo.whatsapp.title", "seo.whatsapp.desc");
}

// Maps the <em> tag embedded in whatsapp.title (messages/*.json) to the same accent /pricing uses.
const richTitle = {
  em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>,
};

const DOES_KEYS = ["i1", "i2", "i3", "i4"] as const;
const STEP_NUMS = ["1", "2", "3"] as const;

/**
 * The WhatsApp lead-capture service, published so Meta can verify Dimonova as a WhatsApp Tech
 * Provider: the form asks for a public page showing the service and who provides it (the
 * provider's name, tax ID, address and email are the footer's business line).
 *
 * Deliberately left out of the header, the mega menu and the mobile nav — the site still sells
 * the digital menu, and this page is temporary until the menu moves to its own domain. The only
 * way in from the home page is the footer's product column, which is what the reviewer needs.
 *
 * Every sentence describes something the service really does; no prices, figures or client
 * names, and nothing about it is gated: the page is in the sitemap and carries no noindex.
 */
export default async function WhatsAppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("whatsapp.eyebrow")} title={t.rich("whatsapp.title", richTitle)} intro={t("whatsapp.intro")} />

      <section className={styles.section}>
        <Container>
          <Eyebrow>{t("whatsapp.does.eyebrow")}</Eyebrow>
          <h2 className={styles.sectionTitle}>{t("whatsapp.does.title")}</h2>
          <CardGrid columns={4}>
            {DOES_KEYS.map((k) => (
              <Card key={k} title={t(`whatsapp.does.${k}_title`)} body={t(`whatsapp.does.${k}_body`)} />
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* Same numeral-icon Card shape as the about page's principles, with plain digits: these
          are steps in order, not a list of values. */}
      <section className={styles.section}>
        <Container>
          <Eyebrow>{t("whatsapp.how.eyebrow")}</Eyebrow>
          <h2 className={styles.sectionTitle}>{t("whatsapp.how.title")}</h2>
          <CardGrid columns={3}>
            {STEP_NUMS.map((n) => (
              <Card
                key={n}
                icon={<span className={styles.numeral}>{n}</span>}
                title={t(`whatsapp.how.s${n}_title`)}
                body={t(`whatsapp.how.s${n}_body`)}
              />
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* What happens to the WhatsApp data, pointing at the matching section of the privacy
          policy (content/legal/<locale>/privacy.ts, section id "whatsapp"). */}
      <section className={styles.section}>
        <Container>
          <div className={styles.dataPanel}>
            <div className={styles.dataHead}>
              <Eyebrow tone="dark">{t("whatsapp.data.eyebrow")}</Eyebrow>
              <h2 className={styles.dataTitle}>{t("whatsapp.data.title")}</h2>
            </div>
            <div className={styles.dataBody}>
              <p>{t("whatsapp.data.body")}</p>
              <Link href="/legal/privacy#whatsapp" className={styles.dataLink}>
                {t("whatsapp.data.link")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Links to /contact rather than opening the demo modal: that modal books a digital-menu
          demo, which is not what this page is about. */}
      <PageCta
        title={t("whatsapp.cta.title")}
        body={t("whatsapp.cta.body")}
        cta={t("whatsapp.cta.button")}
        href="/contact"
      />
    </main>
  );
}
