import Container from "@/components/ui/Container";
import styles from "./PageHero.module.css";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  /** Sits under the intro paragraph — extra hero content (e.g. a shape, a note) without owning its own <h1>. */
  children?: React.ReactNode;
};

/** Shared hero for the five inner pages: eyebrow, the page's one <h1>, and an intro paragraph. */
export default function PageHero({ eyebrow, title, intro, children }: Props) {
  return (
    <Container>
      <section className={styles.section}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.intro}>{intro}</p>
        {children && <div className={styles.extra}>{children}</div>}
      </section>
    </Container>
  );
}
