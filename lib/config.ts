export const CONTACT = {
  email: "pablo@dimonova.com",
  phoneIE: "+353 085 268 0856",
  phoneES: "+34 622 040 285",
  /** `tel:` href form of `phoneES` — kept alongside it so components never hand-format a `tel:` link. */
  telES: "tel:+34622040285",
  /** `tel:` href form of `phoneIE` — kept alongside it so components never hand-format a `tel:` link. */
  telIE: "tel:+353852680856",
  whatsappES: "https://wa.me/34622040285", // Pablo
  whatsappIE: "https://wa.me/353852680856", // Sergio
} as const;

/** Client dashboard (panel-admin). Linked from the header, mobile nav and footer. */
export const ADMIN_URL = "https://menuadmin.dimonova.com";

/** Public read-only media bucket on the project's own Supabase instance. Videos are served from
 * here rather than from `public/` so a 15-30 MB file never enters the git history or the Vercel
 * bundle. Nothing is fetched from it on page load: the posters are local assets and the video
 * itself is only requested once a visitor presses play. */
const MEDIA_BASE = "https://dfulbdzlkaubgdksalnp.supabase.co/storage/v1/object/public/web-media/reviews";

/**
 * The hero's "how it started" story video: the first client, Calsot, telling how it began.
 * `HeroPlayPill` only renders when this is non-null, since a prominent play pill that opens a
 * 404 fallback is worse than no pill at all.
 */
export const HERO_VIDEO_SRC: string | null = `${MEDIA_BASE}/calsot-historia.mp4`;

/** Poster frame for HERO_VIDEO_SRC. Local, so it costs no third-party request on page load. */
export const HERO_VIDEO_POSTER = "/assets/reviews/calsot-historia-poster.jpg";

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

/**
 * Max size for the "current menu" file the contact form attaches to the lead notification
 * email (`app/api/contact/route.ts`). Checked on both the client (`ContactForm.tsx`, so the
 * error shows instantly and nothing uploads) and the server (defense in depth — a request
 * built by hand skips the client check). Kept well under two other ceilings that would
 * otherwise produce an unbranded failure instead of this one: Vercel serverless functions cap
 * the request body around 4.5 MB, and Resend caps a single attachment's size too.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Whether `/cases` is published. Kept here rather than declared locally on the page so
 * `app/sitemap.ts` can gate its `/cases` entry, the footer can gate its link and the specs can
 * gate their assertions on the same flag.
 *
 * The page is written and holds the three real client case studies (Calsot, La Pulpería,
 * Bálamo). The owner took it back down; flip this to `true` to publish it again, and nothing
 * else needs touching.
 */
export const CASES_PUBLISHED: boolean = false;

/**
 * Whether `/features` and the three `/features/<slug>` service pages are published. The owner
 * moved everything the service pages said onto the home page: each service card there opens a
 * walkthrough modal (components/home/ServiceModal.tsx) instead of linking to a page. While this
 * is false the routes redirect home, the sitemap omits them, and the header, mobile nav and
 * footer open the modal in place of the link. The pages themselves stay in the repo; flip this
 * to `true` to publish them again.
 */
export const FEATURES_PUBLISHED: boolean = false;
