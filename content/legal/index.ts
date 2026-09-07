import type { LegalDoc, LegalSlug } from "./types";
import { privacy as privacyEn } from "./en/privacy";
import { terms as termsEn } from "./en/terms";
import { cookies as cookiesEn } from "./en/cookies";
import { privacy as privacyEs } from "./es/privacy";
import { terms as termsEs } from "./es/terms";
import { cookies as cookiesEs } from "./es/cookies";

export type { LegalSlug, LegalDoc, LegalSection, Block } from "./types";

export const LEGAL_SLUGS: LegalSlug[] = ["privacy", "terms", "cookies"];

const EN: Record<LegalSlug, LegalDoc> = {
  privacy: privacyEn,
  terms: termsEn,
  cookies: cookiesEn,
};

const ES: Record<LegalSlug, LegalDoc> = {
  privacy: privacyEs,
  terms: termsEs,
  cookies: cookiesEs,
};

/** Spanish is the primary market; English is the fallback for every other locale. */
export function getLegalDoc(locale: string, slug: LegalSlug): LegalDoc {
  return locale === "es" ? ES[slug] : EN[slug];
}
