import { notFound } from "next/navigation";
import { getFormatter, setRequestLocale } from "next-intl/server";
import { routing, Link } from "@/lib/routing";
import { buildMetadata } from "@/lib/meta";
import { LEGAL_UPDATED } from "@/lib/config";
import { LEGAL_SLUGS, getLegalDoc, type LegalSlug } from "@/content/legal";
import Container from "@/components/ui/Container";
import styles from "./LegalPage.module.css";

export const dynamicParams = false;

const NAV_LABELS: Record<LegalSlug, { es: string; en: string }> = {
  privacy: { es: "Privacidad", en: "Privacy" },
  terms: { es: "Términos", en: "Terms" },
  cookies: { es: "Cookies", en: "Cookies" },
};

function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as string[]).includes(slug);
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) return {};
  const doc = getLegalDoc(locale, slug);
  return buildMetadata(locale, `/legal/${slug}`, doc.title, doc.description);
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  setRequestLocale(locale);

  const doc = getLegalDoc(locale, slug);
  const format = await getFormatter({ locale });
  const lastUpdated = format.dateTime(new Date(LEGAL_UPDATED), { dateStyle: "long" });
  const isEs = locale === "es";
  const otherSlugs = LEGAL_SLUGS.filter((s) => s !== slug);

  return (
    <main id="main" tabIndex={-1}>
      <Container>
        <div className={styles.page}>
          <nav className={styles.docNav} aria-label={isEs ? "Otros documentos legales" : "Other legal documents"}>
            {otherSlugs.map((s) => (
              <Link key={s} href={`/legal/${s}`}>
                {isEs ? NAV_LABELS[s].es : NAV_LABELS[s].en}
              </Link>
            ))}
          </nav>
          <h1>{doc.title}</h1>
          <p className={styles.updated}>
            {isEs ? "Última actualización: " : "Last updated: "}
            {lastUpdated}
          </p>
          <p className={styles.intro}>{doc.intro}</p>
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.blocks.map((block, i) => {
                if (block.kind === "p") return <p key={i}>{block.text}</p>;
                if (block.kind === "list")
                  return (
                    <ul key={i}>
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                return (
                  <div key={i} className={styles.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          {block.head.map((h, j) => (
                            <th key={j}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td key={c}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
