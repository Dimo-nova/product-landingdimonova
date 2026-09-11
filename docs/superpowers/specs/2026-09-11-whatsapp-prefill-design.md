# WhatsApp widget: pre-filled message per flow

**Date:** 2026-09-11 · **Status:** approved by the owner, implementing.

## Goal

Every link out of the floating WhatsApp panel (`components/WhatsAppWidget.tsx`) — the three
venue chips and the "Continue" button — and the WhatsApp fallbacks in the demo/contact forms
open `wa.me` with a `?text=` pre-filled from **what the visitor chose** and **where they came
from**, so the first message on Pablo's/Sergio's phone already says what the lead wants.

## Message shape

Two independent sentences, so any combination reads well in every locale:

```
<opener> <context>
```

- **Opener** — the chip the visitor pressed: "Hola, llevo un restaurante." / "…un pub." /
  "…una cafetería.". The "Continue" button (no chip) uses the plain "Hola.".
- **Context** — one sentence, resolved by priority:
  1. **Explicit** — the `dimonova:open-wa` event now carries `{ context }`.
     `formSent` (the WhatsApp button on the contact form's success state): "Acabo de enviaros
     el formulario de demo.". `formFailed` (the direct WhatsApp links on the error state of
     `DemoModal` and `ContactForm`): "He intentado enviaros el formulario y ha fallado.".
  2. **Last service modal opened on this page** (`service:open` slug): `serviceMenu` /
     `serviceOrdering` / `serviceReviews` — "Me interesa la carta digital." / "…las comandas
     por QR." / "…el sistema de reseñas.". Forgotten when the route changes.
  3. **Route** (`usePathname` from `lib/routing.ts`, locale-less): `/` → `home`, `/pricing`,
     `/clients`, `/about`, `/contact`; anything else → `generic`.

Copy lives under `wa.msg.*` in `messages/*.json` (`hello`, `chip.<restaurant|pub|cafe>`,
`ctx.<context>`), written in EN and ES, synced to de/fr/pt.

## Code

- `lib/wa.ts` — pure helpers: `WaContext` union, `waContextForPath(pathname)`,
  `waContextForService(slug)`, `waLink(locale, message)` (`CONTACT.whatsappES` for `es`,
  `CONTACT.whatsappIE` otherwise, `?text=` URL-encoded). Unit-tested in `lib/wa.test.ts`.
- `lib/events.ts` — `WA_OPEN = "dimonova:open-wa"`, `WaOpenPayload = { context?: WaContext }`,
  `openWa(payload?)`. `ChatWaButton` and `ContactForm` dispatch through it instead of raw
  `CustomEvent`s.
- `WhatsAppWidget` — keeps `explicit` (from the event, cleared when the launcher is pressed),
  `serviceSlug` (from `service:open`, cleared on pathname change), resolves the context in the
  order above and builds one `href` per chip plus one for "Continue".
- `DemoModal` / `ContactForm` error states — `waLink(locale, hello + formFailed)`.

## Tests

- Unit: path → context mapping, service slug → context, `waLink` encoding and number per locale.
- e2e (`e2e/footer-wa.spec.ts`): on `/pricing` a chip's `href` carries the pricing sentence;
  opening the ordering walkthrough then the widget carries the ordering sentence; the "Continue"
  link carries the plain opener; the contact form's success WhatsApp button carries `formSent`.
