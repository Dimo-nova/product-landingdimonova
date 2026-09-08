import type { MetadataRoute } from "next";
import { routing } from "@/lib/routing";
import { CASES_PUBLISHED } from "@/lib/config";

const BASE = "https://dimonova.com";
const PAGES = [
  { path: "", priority: 1.0 },
  { path: "/features", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  // Gated on the same flag as the page itself (see lib/config.ts and
  // app/[locale]/cases/page.tsx): while CASES_PUBLISHED is false /cases redirects home, and
  // listing it here would just point crawlers at "/" again.
  ...(CASES_PUBLISHED ? [{ path: "/cases", priority: 0.7 }] : []),
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/legal/privacy", priority: 0.3 },
  { path: "/legal/cookies", priority: 0.3 },
  { path: "/legal/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const { path, priority } of PAGES) {
    for (const locale of routing.locales) {
      const url = locale === routing.defaultLocale
        ? `${BASE}${path || "/"}`
        : `${BASE}/${locale}${path || ""}`;
      entries.push({ url, changeFrequency: "monthly", priority });
    }
  }
  return entries;
}
