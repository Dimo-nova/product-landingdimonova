import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/page/Eyebrow";
import CardGrid from "@/components/page/CardGrid";
import Card from "@/components/page/Card";
import DeviceFrame from "@/components/ui/DeviceFrame";
import Placeholder from "@/components/ui/Placeholder";
import { Qr } from "@/components/home/ServiceArt";
import SectionHead from "./SectionHead";
import OrderingMoments from "./OrderingMoments";
import OrderingFlow from "./OrderingFlow";
import OrderingTicketStats from "./OrderingTicketStats";
import section from "./Section.module.css";
import styles from "./OrderingSections.module.css";

type Step = { title: string; body: string; placeholder?: string };
type Stat = { value: string; label: string };
type CardCopy = { title: string; body: string; placeholder?: string };

/**
 * Square's own published write-up of the figures quoted in the "average ticket" section. It is
 * linked in the visible copy, and the copy attributes the numbers to Square by name: they are
 * Square's measurements across Square's customers, never presented as Dimonova's own.
 */
const SQUARE_SOURCE =
  "https://squareup.com/us/en/the-bottom-line/reaching-customers/qr-code-ordering-system-ticket-size";

/** The body of `/features/ordering`: why guests stop ordering, the three steps, the published ticket figures, and where it pays off first. */
export default async function OrderingSections() {
  const t = await getTranslations("features.pages.ordering");
  const tAlt = await getTranslations("alt");

  const moments = t.raw("s1.moments") as string[];
  const steps = t.raw("s2.steps") as Step[];
  const stats = t.raw("s3.stats") as Stat[];
  const cards = t.raw("s4.cards") as CardCopy[];

  return (
    <>
      {/* ---- The four thoughts that kill a round ---- */}
      <section className={[section.section, section.cream].join(" ")}>
        <Container>
          <SectionHead eyebrow={t("s1.eyebrow")} title={t("s1.title")} body={t("s1.body")} />
          <OrderingMoments moments={moments} />
          <Reveal delay={0.15}>
            <p className={styles.momentsClose}>{t("s1.close")}</p>
          </Reveal>
        </Container>
      </section>

      {/* ---- Scan, order, print. Each step carries what the guest and the kitchen actually see:
              the real QR for Le Club's menu, Le Club's menu with a dish in the cart, and — until
              the photograph exists — the space for the ticket coming out of the printer. ---- */}
      <Container>
        <section className={section.section}>
          <SectionHead eyebrow={t("s2.eyebrow")} title={t("s2.title")} />
          <OrderingFlow
            steps={steps}
            visuals={[
              <div key="scan" className={[styles.stepVisual, styles.stepVisualQr].join(" ")} aria-hidden="true">
                <svg viewBox="0 0 120 90" className={styles.stepQr} focusable="false">
                  <rect x="30" y="7" width="60" height="76" rx="6" className={styles.stepQrPaper} />
                  <Qr x={36} y={13} size={48} />
                  <rect x="46" y="67" width="28" height="4" rx="2" className={styles.stepQrLine} />
                  <rect x="51" y="75" width="18" height="4" rx="2" className={styles.stepQrPill} />
                </svg>
              </div>,
              <div key="order" className={[styles.stepVisual, styles.stepVisualPhone].join(" ")}>
                <DeviceFrame kind="phone" compact src="/assets/services/ordering-leclub.webp" alt={tAlt("leclubPhone")} />
              </div>,
              <Placeholder key="print" label={steps[2]?.placeholder ?? ""} className={styles.stepVisual} />,
            ]}
          />
        </section>
      </Container>

      {/* ---- Square's published figures. Attributed in the copy and linked out; never ours. ---- */}
      <Container>
        <section className={[section.dark, styles.statSection].join(" ")}>
          <div className={styles.statGrid}>
            <Reveal className={styles.statCopy}>
              {/* tone="dark": this sits on the --ink panel, where --brand clears AA and --brand-deep would not. */}
              <Eyebrow tone="dark">{t("s3.eyebrow")}</Eyebrow>
              <h2 className={styles.statTitle}>{t("s3.title")}</h2>
              <p className={styles.statBody}>{t("s3.body")}</p>
              <a className={styles.statSource} href={SQUARE_SOURCE} target="_blank" rel="noopener noreferrer">
                {t("s3.source")} <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
            <Reveal delay={0.1} className={styles.statCol}>
              <OrderingTicketStats stats={stats} />
            </Reveal>
          </div>
        </section>
      </Container>

      {/* ---- Hotels and beach clubs ---- */}
      <Container>
        <section className={section.section}>
          <SectionHead eyebrow={t("s4.eyebrow")} title={t("s4.title")} body={t("s4.body")} />
          <CardGrid columns={3}>
            {cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.06} className={styles.cell}>
                <Card media={card.placeholder ? <Placeholder label={card.placeholder} /> : undefined} title={card.title} body={card.body} />
              </Reveal>
            ))}
          </CardGrid>
        </section>
      </Container>
    </>
  );
}
