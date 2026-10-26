import { getTranslations, getLocale } from "next-intl/server";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { CONTACT } from "@/lib/config";
import PageCtaButton from "./PageCtaButton";
import styles from "./PageCta.module.css";

/**
 * `body` is optional: `cases.cta` (and `about.cta`) carry only a title in the current copy —
 * no body sentence exists to read, and per CLAUDE.md's content rule this task doesn't invent one.
 *
 * Either `source` (the button opens the demo modal, tagged with it) or `href` (the button is a
 * plain link): the demo modal books a digital-menu demo, so a page about something else, like
 * /whatsapp, links to /contact instead.
 */
type Props = { title: string; body?: string; cta: string } & (
  | { source: string; href?: never }
  | { href: string; source?: never }
);

/**
 * Shared closing call-to-action band (features/about/cases): a server shell holding a rounded
 * --cream panel, with a small client button that opens the demo modal and a locale-routed
 * WhatsApp fallback, matching the pattern already used by the home page's FinalCta.
 */
export default async function PageCta(props: Props) {
  const { title, body, cta } = props;
  const t = await getTranslations("common");
  const locale = await getLocale();
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  return (
    <Container>
      <section className={styles.section}>
        <div className={styles.panel}>
          <h2 className={[styles.title, !body && styles.titleOnly].filter(Boolean).join(" ")}>{title}</h2>
          {body && <p className={styles.body}>{body}</p>}
          <div className={styles.actions}>
            {props.href !== undefined ? (
              <Button href={props.href} size="lg">
                {cta}
              </Button>
            ) : (
              <PageCtaButton source={props.source}>{cta}</PageCtaButton>
            )}
            <a className={styles.wa} href={waUrl} target="_blank" rel="noopener noreferrer">
              {t("chat_wa")}
            </a>
          </div>
        </div>
      </section>
    </Container>
  );
}
