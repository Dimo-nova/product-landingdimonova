export const CONTACT = {
  email: "pablo@dimonova.com",
  phoneIE: "+353 085 268 0856",
  phoneES: "+34 622 040 285",
  whatsappES: "https://wa.me/34622040285", // Pablo
  whatsappIE: "https://wa.me/353852680856", // Sergio
} as const;

/** Client dashboard (panel-admin). Linked from the header, mobile nav and footer. */
export const ADMIN_URL = "https://menuadmin.dimonova.com";

/**
 * The hero's "how it started" story video. `null` until the founder's video is uploaded and
 * its path set here — `HeroPlayPill` only renders when this is non-null, since a prominent
 * play pill that opens a 404 fallback is worse than no pill at all.
 */
export const HERO_VIDEO_SRC: string | null = null;

/**
 * Legal identity of the operator, published as required by art. 10 LSSI-CE and GDPR art. 13.
 * Sole trader: there are no company-registry details, so `registry` is intentionally empty
 * and the legal documents omit that sentence when it is.
 */
export const COMPANY = {
  tradingName: "Dimonova",
  legalName: "Pablo López Busto",
  legalForm: "empresario individual (autónomo)",
  taxId: "48205194T",
  address: "Calle San Vicente 9, 1.º A, 28220 Majadahonda, Madrid, España",
  registry: "",
  jurisdiction: "España, con sumisión a los juzgados y tribunales de Madrid",
  email: CONTACT.email,
} as const;

/** Last review date of the legal documents (ISO). Bump when you change their content. */
export const LEGAL_UPDATED = "2026-09-07";
