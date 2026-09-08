import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import DiffMarquees from "./DiffMarquees";
import styles from "./DifferentiatorBand.module.css";

type DiffItem = { title: string; body: string };

/**
 * "What nobody else does" band: two opposing marquees of claim pills. The first five items
 * scroll left, the last five scroll right. Each pill shows its title and its one-line body at
 * all times; nothing is revealed on hover, because the strip never stops moving.
 */
export default async function DifferentiatorBand() {
  const t = await getTranslations();
  const items = t.raw("home.diff.items") as DiffItem[];
  const left = items.slice(0, 5);
  const right = items.slice(5, 10);

  return (
    <section data-diff className={styles.section}>
      <Container>
        <Reveal className={styles.head}>
          <h2 className={styles.heading}>{t("home.diff.title")}</h2>
          <p className={styles.lead}>{t("home.diff.lead")}</p>
        </Reveal>
      </Container>

      <DiffMarquees left={left} right={right} />
    </section>
  );
}
