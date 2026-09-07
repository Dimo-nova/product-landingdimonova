import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/routing";
import { CONTACT } from "@/lib/config";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";

const SLUGS = ["privacy", "cookies", "terms"] as const;
type Slug = (typeof SLUGS)[number];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) return {};
  return pageMetadata(locale, `/legal/${slug}`, `legal.${slug}.title`, "seo.home.desc");
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <main>
      <Container>
        <div style={{ padding: "80px 0 120px", maxWidth: 720 }}>
          <h1>{t(`${slug as Slug}.title`)}</h1>
          <p style={{ marginTop: 24, color: "var(--ink-2)", fontSize: "var(--text-lead)" }}>
            {t("placeholder", { email: CONTACT.email })}
          </p>
        </div>
      </Container>
    </main>
  );
}
