import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/page/Eyebrow";
import styles from "./Section.module.css";

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  /** "dark" repaints the text for an --ink ground and switches the eyebrow to --brand. */
  tone?: "light" | "dark";
  align?: "left" | "center";
};

/** Eyebrow + <h2> + optional lead paragraph, revealed on scroll. The repeating head of every feature-page section. */
export default function SectionHead({ eyebrow, title, body, tone = "light", align = "left" }: Props) {
  const classes = [styles.head, tone === "dark" && styles.onDark, align === "center" && styles.headCenter]
    .filter(Boolean)
    .join(" ");

  return (
    <Reveal className={classes}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}
    </Reveal>
  );
}
