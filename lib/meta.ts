import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "./routing";

const BASE = "https://dimonova.com";

function canonicalPath(locale: string, path: string): string {
  return locale === routing.defaultLocale
    ? path || "/"
    : `/${locale}${path}`;
}

export function buildMetadata(
  locale: string,
  path: string, // e.g. "" for home, "/features"
  title: string,
  description: string,
): Metadata {
  const canonical = `${BASE}${canonicalPath(locale, path)}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${BASE}${canonicalPath(l, path)}`;
  }
  // x-default points to the English canonical
  languages["x-default"] = `${BASE}${canonicalPath(routing.defaultLocale, path)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export async function pageMetadata(
  locale: string,
  path: string, // e.g. "" for home, "/features"
  titleKey: string,
  descKey: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t(titleKey);
  const description = t(descKey);

  return buildMetadata(locale, path, title, description);
}
