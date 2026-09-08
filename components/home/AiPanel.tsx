import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/page/Eyebrow";
import AiDemo from "./AiDemo";
import styles from "./AiPanel.module.css";

/** Dark "Dashboard + AI" section: the pitch on the left, the animated assistant mock on the right. */
export default async function AiPanel() {
  const t = await getTranslations();
  const steps = t.raw("home.ai.steps") as string[];

  return (
    <Container>
      <section id="ai" className={styles.section}>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            {/* tone="dark": .section here is a dark --ink band, not a light page ground — see
                Eyebrow's doc comment for why --brand (not --brand-deep) is correct here. */}
            <Eyebrow tone="dark">{t("home.ai.eyebrow")}</Eyebrow>
            <h2 className={styles.title}>{t("home.ai.title")}</h2>
            <p className={styles.body}>{t("home.ai.body")}</p>

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

            <Button href="/features#ai" variant="outline" onDark>
              {t("home.ai.cta")}
            </Button>
          </Reveal>

          <Reveal delay={0.1} className={styles.demoCol}>
            <AiDemo />
          </Reveal>
        </div>
      </section>
    </Container>
  );
}
