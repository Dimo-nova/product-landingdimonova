import { CONTACT } from "./config";

/**
 * What the visitor was doing when they reached for WhatsApp. Each value has one sentence of
 * copy under `wa.msg.ctx.<context>` in messages/*.json, appended to the opener the chip chose
 * so the first message on the phone already says what the lead wants.
 *
 *  - `home` … `contact` come from the route (`waContextForPath`);
 *  - `service*` from the last service walkthrough opened on that page (`waContextForService`);
 *  - `formSent` / `formFailed` are passed explicitly by the contact form and the demo modal.
 */
export type WaContext =
  | "home"
  | "pricing"
  | "clients"
  | "about"
  | "contact"
  | "generic"
  | "serviceMenu"
  | "serviceOrdering"
  | "serviceReviews"
  | "formSent"
  | "formFailed";

/** The three chips in the panel; each has its own opener under `wa.msg.chip.<chip>`. */
export type WaChip = "restaurant" | "pub" | "cafe";

const PATH_CONTEXT: Record<string, WaContext> = {
  "/": "home",
  "/pricing": "pricing",
  "/clients": "clients",
  "/about": "about",
  "/contact": "contact",
};

/** `pathname` as next-intl's `usePathname` reports it — locale prefix already stripped. */
export function waContextForPath(pathname: string): WaContext {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PATH_CONTEXT[clean] ?? "generic";
}

const SERVICE_CONTEXT: Record<string, WaContext> = {
  menu: "serviceMenu",
  ordering: "serviceOrdering",
  reviews: "serviceReviews",
};

export function waContextForService(slug: string): WaContext | null {
  return SERVICE_CONTEXT[slug] ?? null;
}

/** Spanish visitors reach Pablo, everyone else Sergio — the split the widget has always made. */
export function waLink(locale: string, message: string): string {
  const base = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;
  return `${base}?text=${encodeURIComponent(message)}`;
}
