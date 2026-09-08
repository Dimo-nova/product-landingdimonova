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
| Styling | **New shell + home (2026-09 redesign):** CSS Modules next to each component, design tokens as CSS custom properties in `app/globals.css`, `motion` (`motion/react`) inside `'use client'` islands only, `<MotionConfig reducedMotion="user">` in `components/layout/Providers.tsx`. **Legacy inner pages** (`components/sections/*`) still use inline styles via `lib/style.ts` `s()` + `components/Hover.tsx` until they are redesigned; the `.dim-*` rules at the bottom of `globals.css` exist only for them. |
| Hover/focus | `components/Hover.tsx` — a client component that applies extra inline styles on `mouseenter`/`focus` and restores them on leave/blur (mirrors the `data-hover`/`data-focus` pattern from the old `app.js`). |
| Routing helpers | `lib/routing.ts` — calls `createNavigation(routing)` and re-exports `Link`, `useRouter`, `usePathname`, `getPathname` from `next-intl/navigation`. Always import these wrappers, not the `next/navigation` originals. |
| SEO helpers | `lib/meta.ts` — `pageMetadata(locale, path, titleKey, descKey)` returns a `Metadata` object with canonical URL, `alternates.languages` (hreflang), and OpenGraph fields. |
| Image helper | `lib/imgSrc.ts` — `imgSrc(base, locale)` returns a locale-specific screenshot path (falls back to the `en` asset). |
| Home page | `components/home/` holds all nine redesigned home sections, composed by `app/[locale]/page.tsx` in this order: `Hero` (+ `HeroBackground`, `HeroBgPhoto`, `HeroBgMock`, `HeroPlayPill`, `EmailCta`), `LogoStrip`, `ServiceCards`, `AiPanel` (+ `AiDemo`), `BalamoShowcase` (+ `BalamoPills`), `DifferentiatorBand`, `Reviews` (+ `ReviewsCarousel`), `AiCompare`, `FinalCta`. `components/sections/` now holds **only** the not-yet-redesigned inner pages (about, cases, contact, features, pricing) — that's phase 4. |

### Route map

```
app/
  layout.tsx              # root layout (Viewport + global Metadata, no <html>)
  globals.css             # keyframes, media queries, .dim-* classes
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

New components: `Name.tsx` + `Name.module.css`, tokens from `:root` (`--brand`, `--ink`, `--cream`, …), fonts via `lib/fonts.ts` (`--font-display` Bricolage Grotesque, `--font-body` Instrument Sans). Never add inline styles to new code except for genuinely dynamic values (e.g. `Modal` `maxWidth`) or one-off layout on placeholder pages, nor `dangerouslySetInnerHTML`; rich strings use `t.rich`. No hard-coded hex/`rgba()` colours in `.module.css` — use a token, and add one to `app/globals.css` beside its neighbours if none fits yet.

`--on-dark-surface`/`-border`/`-text`/`-muted` are tuned for **near-black grounds** (`--ink`,
`--ink-raised`). `--on-brand-surface` exists separately because that same 10% white wash
barely registers on the already-saturated `--brand` coral — use `--on-brand-surface` for any
surface sitting directly on `--brand`, and the `--on-dark-*` set everywhere else.

Legacy: `archive/` and `s()` are only for the not-yet-redesigned inner pages. Do not port new markup from the archive.

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
- **Switch:** `components/home/HeroBackground.tsx` (`'use client'`, reads `?hero=c` via
  `useSearchParams`) renders whichever variant is asked for; `Hero.tsx` wraps it in
  `<Suspense>`. Default (no query param, or anything other than `c`) renders the photo.

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
content (see `TODO.md` phase 3) and the carousel renders itself.

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

`archive/` holds the original static HTML/CSS/JS site. It is the **source of
truth** for markup, inline styles, exact copy, animation values, and
scroll-header colours. When you need to verify a pixel-level detail, read the
archive:

- `archive/_design_source.html` — original Claude Design export
- `archive/app.js` — original state machine (scroll colours, pill styles, email regex, etc.)
- `archive/index.html` / `archive/styles.css` — built output

`archive/` is excluded from the Vercel deploy.

## Commands

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build (static export)
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

Unit tests (Playwright `expect`, no browser) live next to the modules they
cover and run separately: `npx playwright test -c playwright.unit.config.ts`.

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
