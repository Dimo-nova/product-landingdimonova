# CLAUDE.md

Guidance for Claude (and other agents) working in this repo.

## What this is

A **marketing site** for Dimonova — a done-for-you digital-menu service for
restaurants, pubs and cafés. It is built with **Next.js 16, TypeScript, App
Router, and SSG** (static site generation). All routes are statically rendered
at build time except the `[...rest]` catch-all that serves the localized 404
on demand.

**Open tasks live in [`TODO.md`](./TODO.md)** — check it before starting work and
keep it updated. Human-facing overview is in [`README.md`](./README.md).

## Architecture

| Layer | Detail |
|-------|--------|
| Framework | Next.js 16 — App Router, `generateStaticParams`, `generateMetadata` |
| Language | TypeScript (strict) |
| i18n | `next-intl` · 5 locales: `en`, `es`, `de`, `fr`, `pt` · `localePrefix: "as-needed"` (English at `/`, others at `/es/`, `/de/`, etc.) |
| Styling | The whole site runs on **CSS Modules** next to each component, with design tokens as CSS custom properties in `app/globals.css`, `motion` (`motion/react`) inside `'use client'` islands only, and `<MotionConfig reducedMotion="user">` in `components/layout/Providers.tsx`. No inline-style layer remains. |
| Routing helpers | `lib/routing.ts` — calls `createNavigation(routing)` and re-exports `Link`, `useRouter`, `usePathname`, `getPathname` from `next-intl/navigation`. Always import these wrappers, not the `next/navigation` originals. |
| SEO helpers | `lib/meta.ts` — `pageMetadata(locale, path, titleKey, descKey)` returns a `Metadata` object with canonical URL, `alternates.languages` (hreflang), and OpenGraph fields. |
| Image helper | `lib/imgSrc.ts` — `imgSrc(base, locale)` returns a locale-specific screenshot path (falls back to the `en` asset). |
| Home page | `components/home/` holds all nine redesigned home sections, composed by `app/[locale]/page.tsx` in this order: `Hero` (+ `HeroBackground`, `HeroBgPhoto`, `HeroBgMock`, `HeroPlayPill`, `EmailCta`), `LogoStrip`, `ServiceCards`, `AiPanel` (+ `AiDemo`), `BalamoShowcase` (+ `BalamoPills`), `DifferentiatorBand`, `Reviews` (+ `ReviewsCarousel`), `AiCompare`, `FinalCta`. |
| Inner pages | `components/page/` holds the shared kit (`PageHero`, `FeatureBlock`, `Card`/`CardGrid`, `Faq`, `Prose`, `PageCta`) that `features`, `pricing`, `cases`, `about` and `contact` build on, each with its own `page.module.css`. |

### Route map

```
app/
  layout.tsx              # root layout (Viewport + global Metadata, no <html>)
  globals.css             # design tokens, reset, keyframes, media queries
  [locale]/
    layout.tsx            # sets <html lang>, wraps NextIntlClientProvider
    page.tsx              # home — composes components/home/*
    features/page.tsx
    pricing/page.tsx
    cases/page.tsx
    about/page.tsx
    contact/page.tsx
    not-found.tsx         # localized 404
    [...rest]/page.tsx    # catch-all that renders the localized 404 for unknown routes
    legal/[slug]/page.tsx # placeholder terms/privacy/cookies pages
```

### Messages / translations

`messages/<locale>.json` holds all copy. Keys used by every page live at the
top level; page-specific keys are nested under the page name. Use
`getTranslations({ locale })` (server) or `useTranslations()` (client).

For HTML content (e.g. a paragraph with a `<br>`) use `t.raw(key)` and
`dangerouslySetInnerHTML`. For arrays (feature lists, FAQ items) use
`t.raw(key)` and cast to `string[]`.

### Styling rule

The entire site is **CSS Modules plus design tokens** — there is no other styling layer. Components: `Name.tsx` + `Name.module.css`, tokens from `:root` (`--brand`, `--ink`, `--cream`, …), fonts via `lib/fonts.ts` (`--font-display` Bricolage Grotesque, `--font-body` Instrument Sans, `--font-instrument-serif` for display accents on the inner pages). Never add inline styles except for genuinely dynamic values (e.g. `Modal` `maxWidth`), nor `dangerouslySetInnerHTML`; rich strings use `t.rich`. No hard-coded hex/`rgba()` colours in `.module.css` — use a token, and add one to `app/globals.css` beside its neighbours if none fits yet.

`--on-dark-surface`/`-border`/`-text`/`-muted` are tuned for **near-black grounds** (`--ink`,
`--ink-raised`). `--on-brand-surface` exists separately because that same 10% white wash
barely registers on the already-saturated `--brand` coral — use `--on-brand-surface` for any
surface sitting directly on `--brand`, and the `--on-dark-*` set everywhere else.

### Site-wide overlays

`DemoModal`, `VideoModal`, `LocaleBanner`, `WhatsAppWidget` are mounted once in `app/[locale]/layout.tsx`. Open them from anywhere with `openDemo({ email?, source? })` / `openVideo({ src, title, poster?, orientation? })` from `lib/events.ts` (typed `window` CustomEvents `demo:open` / `video:open`). The legacy `dimonova:open-wa` event still opens the WhatsApp panel.

### Services registry

`lib/services.ts` is the single list of the 8 services (slugs `menu, ai, ordering, training, multi, reviews, daily, translate`). Copy lives in `messages/*.json` under `services.<slug>.{title,line}`. Mega-menu, footer and (phase 2) home cards read from it.

### Home hero — two background variants (temporary)

The hero ships **two** background treatments so the owner can compare them on the same
build, plus a temporary switch:

- **Variant B — photo:** `components/home/HeroBgPhoto.tsx` + `.module.css`. Real CC0 photo
  at `public/assets/hero/hero-stock.jpg` (source recorded in `public/assets/hero/SOURCES.md`),
  Ken Burns zoom, `--ink` gradient overlay. **This is the current default.**
- **Variant C — mock:** `components/home/HeroBgMock.tsx` + `.module.css`. No photo — a
  `DeviceFrame` phone mock with pointer-driven 3D tilt plus a floating "applying a change"
  card.
- **Switch:** `components/home/HeroBackground.tsx` (`'use client'`) renders the photo
  unconditionally on the server and on first client render, then reads `?hero=c` from
  `window.location.search` in an effect after mount and swaps in the mock if it matches — so
  the default photo still ships in the static HTML with its `priority` preload intact, rather
  than sitting behind a `useSearchParams` + `<Suspense>` boundary. Default (no query param, or
  anything other than `c`) renders the photo.

This switch is **not** meant to ship long-term. Once the owner picks a variant:

- Photo (B) wins → delete `components/home/HeroBgMock.tsx` + `.module.css`.
- Mock (C) wins → delete `components/home/HeroBgPhoto.tsx` + `.module.css` and
  `public/assets/hero/hero-stock.jpg` + `SOURCES.md`.
- Either way: delete `components/home/HeroBackground.tsx` and the `?hero=c` switch, and
  have `Hero.tsx` render the winning background component directly. Tracked in `TODO.md`
  phase 3.

### Reviews data

`data/reviews.json` drives `components/home/Reviews.tsx` and ships **empty on purpose**:

```json
{ "rating": null, "profileUrl": "", "videos": [], "google": [] }
```

With `videos` and `google` both empty, the section renders the honest
`home.reviews.pending` copy ("Reviews coming soon.") instead of fabricated placeholder
cards. Do not add fake reviews to make the section "look done" — fill this file with real
content (see `TODO.md` phase 3) and the carousel renders itself. `e2e/home-sections.spec.ts`'s
`populated reviews render as cards` test is `test.skip`'d for exactly this reason — see
Testing below.

### OG image

`public/og.png` (1200×630, social-share preview) is **generated, not hand-made**, by
`scripts/generate-og-image.mjs`. It reads the hero headline straight from
`messages/en.json`, renders it with Playwright's Chromium (no dev server needed) using the
same coral annotation as `components/ui/Annotated.tsx`, and writes the PNG. It has no npm
script wired up — run it directly:

```bash
node scripts/generate-og-image.mjs
```

**Re-run this any time `home.hero.title` in `messages/en.json` changes**, or `og.png` will
show stale copy.

### Messages workflow

Write new keys in `messages/en.json` and `messages/es.json`, then run `npm run sync:messages` to copy the missing keys into `de`, `fr`, `pt` (they intentionally carry English until translated).

### WhatsApp widget state

The WA panel state is managed by `components/WhatsAppWidget.tsx`, mounted once in `app/[locale]/layout.tsx`. It toggles on the FAB click, on the legacy `dimonova:open-wa` window event, and on the "Continue" button. The "Continue" button links to `https://wa.me/<number>`.

## Archive

`archive/` holds the original static HTML/CSS/JS site. It is a **historical
record only** — the site's original design, copy and behaviour, kept for
reference. It is not a styling source any more: every page has been rebuilt
on CSS Modules and design tokens, so nothing should be ported from the
archive's markup or inline styles.

- `archive/_design_source.html` — original Claude Design export
- `archive/app.js` — original state machine (scroll colours, pill styles, email regex, etc.)
- `archive/index.html` / `archive/styles.css` — built output

`archive/` is excluded from the Vercel deploy.

## Commands

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build (SSG — next.config.ts sets no `output: "export"`)
npm run test:e2e       # Playwright e2e on port 3100 (starts the server automatically)
npm run sync:messages  # copy missing keys from en.json to the other locales
```

`.env.local` needs `RESEND_API_KEY`, `NOTION_TOKEN`, `NOTION_LEADS_DB_ID`
(dummy values are enough for a local build) because `app/api/contact/route.ts`
instantiates those clients at module scope.

## Testing

Playwright e2e lives in `e2e/`. Run with `npm run test:e2e`. The suite covers:

- All routes in English and one locale (ES)
- Header scroll behaviour, mega-menu, mobile nav, WhatsApp widget, locale banner, 404
- Venue pill selection (contact page)
- Full contact-form validation flow
- Demo modal and video modal (open/close, focus trap, error fallback)
- The home hero (`e2e/hero.spec.ts`), including the `?hero=c` query param that switches the
  hero background from the photo (default) to the phone-mock variant — see "Home hero — two
  background variants" above
- The rest of the home page's sections (`e2e/home-sections.spec.ts`) — service cards, logo
  strip, AI demo, Bálamo showcase, differentiator band, reviews, AI-compare. One test there,
  `populated reviews render as cards`, is `test.skip`'d while `data/reviews.json` ships empty
  and enables itself automatically once real review content is added (see "Reviews data"
  above)

Unit tests (Playwright `expect`, no browser) live next to the modules they cover — except
when the covered module can't live under `lib/` itself, in which case the spec still sits in
`lib/` and imports it by relative path (e.g. `lib/reviewCards.test.ts` covers
`components/home/reviews-types.ts`) — and run separately:
`npx playwright test -c playwright.unit.config.ts`.

The message-sync script has its own Node test runner spec:
`node --test scripts/sync-messages.test.mjs`.

**Add a spec when you add behaviour.**

## SEO / metadata

- `app/layout.tsx` exports `viewport: Viewport` (`themeColor`) and base `metadata`.
- Each page's `generateMetadata` calls `pageMetadata(locale, "/path", titleKey, descKey)`.
- `sitemap.ts` and `robots.ts` live under `app/`.
- Favicons live in `public/` (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`).

## Conventions / gotchas

- **Do not** hand-edit files under `archive/` — they are the historical source of truth only.
- **Do not** use `next/navigation` directly — use the wrappers in `lib/routing.ts`.
- Content marked "placeholder" is intentional. Don't invent real names, quotes,
  metrics, or photos — leave placeholders until real content is supplied (tracked in `TODO.md`).
- Translated SEO copy (`meta.title.*`, `meta.description.*`) in `messages/` is
  currently in English for all locales — proper translations are a follow-up task.

### `t.raw()` and `dangerouslySetInnerHTML`

Several components render translation keys with embedded HTML via
`dangerouslySetInnerHTML={{ __html: t.raw("key") }}`. These keys contain
trusted markup (`<strong>`, `<em>`, `<span>`) copied from the original design.
Never put user-supplied data into a `t.raw()` key.

### Contact details

Hardcoded contact details (email, phone numbers, WhatsApp URL) live in
`lib/config.ts` and are imported from `@/lib/config`. Do not inline them in
components.

## Deploy

Static export via Vercel (zero-config):

```bash
vercel             # preview
vercel --prod      # production
```
