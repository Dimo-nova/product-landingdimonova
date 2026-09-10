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
| Routing helpers | `lib/routing.ts` — calls `createNavigation(routing)` and re-exports `Link`, `redirect`, `useRouter`, `usePathname`, `getPathname` from `next-intl/navigation`. Always import these wrappers, not the `next/navigation` originals — `redirect` is what `app/[locale]/cases/page.tsx` uses to send `/cases` home while `CASES_PUBLISHED` is false. |
| SEO helpers | `lib/meta.ts` — `pageMetadata(locale, path, titleKey, descKey)` returns a `Metadata` object with canonical URL, `alternates.languages` (hreflang), and OpenGraph fields. |
| Image helper | `lib/imgSrc.ts` — `imgSrc(base, locale)` returns a locale-specific screenshot path (falls back to the `en` asset). |
| Home page | `components/home/` holds all nine redesigned home sections, composed by `app/[locale]/page.tsx` in this order: `Hero` (+ `HeroBgPhoto`, `HeroPlayPill`, `EmailCta`), `LogoStrip`, `ServiceCards`, `AiPanel` (+ `AiDemo`), `BalamoShowcase` (+ `BalamoPills`), `DifferentiatorBand`, `Reviews` (+ `ReviewsVideo`), `AiCompare`, `FinalCta`. |
| Inner pages | `components/page/` holds the shared kit (`PageHero`, `FeatureBlock`, `Card`/`CardGrid`, `Faq`, `PageCta`) that `features`, `pricing`, `cases`, `about` and `contact` build on, each with its own `page.module.css`. |
| Service pages | `components/features/` holds the `/features/[slug]` kit: `ServiceHero` (+ `ServiceHeroCta`), `SectionHead`, the three `HeroArt*` illustrations and the three `*Sections` bodies. |

### Route map

```
app/
  layout.tsx              # root layout (Viewport + global Metadata, no <html>)
  globals.css             # design tokens, reset, keyframes, media queries
  [locale]/
    layout.tsx            # sets <html lang>, wraps NextIntlClientProvider
    page.tsx              # home — composes components/home/*
    features/page.tsx       # index of the three services
    features/[slug]/page.tsx # one page per service (menu, ordering, reviews)
    pricing/page.tsx
    cases/page.tsx
    about/page.tsx
    contact/page.tsx
    not-found.tsx         # localized 404
    [...rest]/page.tsx    # catch-all that renders the localized 404 for unknown routes
    legal/[slug]/page.tsx # terms/privacy/cookies, full text in content/legal/
```

### Messages / translations

`messages/<locale>.json` holds all copy. Keys used by every page live at the
top level; page-specific keys are nested under the page name. Use
`getTranslations({ locale })` (server) or `useTranslations()` (client).

For arrays (feature lists, FAQ items) use `t.raw(key)` and cast to `string[]`.
For inline HTML tags (`<em>`, `<strong>`, a `<Link>`) use `t.rich(key, { tag: (chunks) => <Tag>{chunks}</Tag> })`
instead — see the styling rule below for why `dangerouslySetInnerHTML` is off the table.

### Page frame

`--container` (1512px) and `--gutter` (`clamp(16px, 2.2vw, 40px)`) in `app/globals.css` set the
page frame, and `components/ui/Container.tsx` is the only thing that should apply them. Those
numbers were measured off pos.toasttab.com, which the owner picked as the reference: a wide
container with small side padding, not a narrow column floating in whitespace. Don't narrow
them back without asking.

### Styling rule

The entire site is **CSS Modules plus design tokens** — there is no other styling layer. Components: `Name.tsx` + `Name.module.css`, tokens from `:root` (`--brand`, `--ink`, `--cream`, …), fonts via `lib/fonts.ts` (`--font-display` Bricolage Grotesque, `--font-body` Instrument Sans, `--font-instrument-serif` for display accents on the inner pages). Never add inline styles except for genuinely dynamic values (e.g. `Modal` `maxWidth`), nor `dangerouslySetInnerHTML`; rich strings use `t.rich`. No hard-coded hex/`rgba()` colours in `.module.css` — use a token, and add one to `app/globals.css` beside its neighbours if none fits yet.

`--on-dark-surface`/`-border`/`-text`/`-muted` are tuned for **near-black grounds** (`--ink`,
`--ink-raised`). `--on-brand-surface` exists separately because that same 10% white wash
barely registers on the already-saturated `--brand` coral — use `--on-brand-surface` for any
surface sitting directly on `--brand`, and the `--on-dark-*` set everywhere else.

### Site-wide overlays

`DemoModal`, `VideoModal`, `LocaleBanner`, `WhatsAppWidget` are mounted once in `app/[locale]/layout.tsx`. Open them from anywhere with `openDemo({ email?, source? })` / `openVideo({ src, title, poster?, orientation? })` from `lib/events.ts` (typed `window` CustomEvents `demo:open` / `video:open`). The legacy `dimonova:open-wa` event still opens the WhatsApp panel.

### Services registry

`lib/services.ts` is the single list of the three things Dimonova sells (slugs `menu, ordering, reviews`). It used to hold eight; the owner folded `ai`, `multi`, `daily`, `training` and `translate` into the digital menu, which is what they always were — sub-features, not products. One-line copy lives in `messages/*.json` under `services.<slug>.{title,line}`. The mega-menu, the mobile nav, the footer, the home cards, `app/sitemap.ts` and the `/features/[slug]` routes all read from it, so adding a fourth service is a one-line change plus its copy.

### The three service pages

`app/[locale]/features/[slug]/page.tsx` is one route with `generateStaticParams` over `SERVICES`
and `dynamicParams = false`, so the only URLs that exist are `/features/menu`, `/features/ordering`
and `/features/reviews`; anything else 404s. `/features` itself is now just a **short index** of
those three, reading the list from `lib/services.ts` — the four-block tour that used to live there
(`features.f1`–`f4`) is gone, and so are the eight `#menu`/`#ai`/… scroll anchors it carried.

The route shares a shell — `ServiceHero` (dark panel, the page's one `<h1>`, the demo CTA) and the
closing `PageCta` — but each slug brings its **own hero illustration** (`HeroArtMenu`,
`HeroArtOrdering`, `HeroArtReviews`), its own background wash (`tone`) and its own sections
(`MenuSections`, `OrderingSections`, `ReviewsSections`). Copy is nested under
`features.pages.<slug>.*` in `messages/*.json`. Keep it that way: three pages sharing one component
with three sets of strings would read as a template, which is exactly what the owner asked us not
to ship.

Every `HeroArt*` and every reveal runs through `motion`'s `animate`/`variants` props, so the
app-wide `<MotionConfig reducedMotion="user">` turns them off on its own. Two components are driven
by hand from timers and therefore carry their **own `useReducedMotion()` guard** —
`OrderingTicketStats` (the count-up) and `ReviewsFlow` (the self-playing rating demo). Both also
render their *finished* state as initial state, so the content is real with JavaScript off. If you
add another hand-driven animation here, it needs the same guard.

**Two things on these pages are not free copy.**

1. `/features/ordering`'s average-ticket figures are **Square's**, not ours: Square reports a 35%
   increase in sales in the first 30 days after implementing QR self-serve ordering, and 42% higher
   average tickets where open tabs are enabled. The copy attributes them to Square by name and
   `OrderingSections.tsx` links the source. Never restate them as Dimonova's own measurement, and
   never print a bare unattributed percentage.
2. `/features/reviews` describes a flow where **every rating reaches Google**. A low one is asked
   for a reason and tagged to a waiter or an area *before* being forwarded — that is the whole
   product. It is not review gating and must never be described as filtering, hiding or holding
   back a review. `e2e/pages.spec.ts` locks both halves of that promise in English and Spanish.

### Home hero background

The hero's background is `components/home/HeroBgPhoto.tsx` + `.module.css`: a **still**
photograph with an `--ink` gradient overlay. It used to drift with a Ken Burns zoom; the owner
asked for a static background, so there is no animation left to disable there.

The file it points at is `public/assets/hero/hero.webp`, which has **no recorded licence** —
see `public/assets/hero/SOURCES.md` and `TODO.md`. The documented CC0 `hero-stock.jpg` is still
in the repo as the fallback. `e2e/hero.spec.ts` deliberately matches the folder rather than a
file name so swapping the photograph does not turn the suite red.

The hero is sized to fit the first screen: `.section`'s `min-height` is
`calc(100svh - var(--header-h) - 32px)` (the viewport minus the sticky header and the card's own
margins), the block padding scales with viewport height, and `.title` caps its font size against
`vh` as well as `vw` so the three-line Spanish headline still fits a short laptop screen. If you
add anything to the hero column, re-measure at 1280×720 before assuming it still fits.

The phone-mock alternative (`HeroBgMock`) and the `?hero=c` switch (`HeroBackground`) that
existed so the two could be compared are **deleted**: the owner picked the photograph. Do not
reintroduce a query-param variant switch. `e2e/hero.spec.ts` asserts that `?hero=c` still
renders the photograph and no mock, so a revival fails the suite.

### Headlines that must break in a specific place

`home.hero.title` is rendered with `t.rich`, and two tags are available: `<mark>` wraps the
annotated word (`components/ui/Annotated.tsx`), and `<line>` forces its contents onto their own
line. Only the Spanish string uses `<line>` today, because "Nosotros nos ocupamos." and "Tú
creces." must never share a line; every other locale omits the tag and wraps naturally. Add
`<line>` to a locale's string when that language needs the same break, and to no others.

### Reviews data

`data/reviews.json` drives `components/home/Reviews.tsx`. It holds real content: the two client
video reviews (Calsot and La Pulpería), the two Google reviews on Dimonova's own Google
Business profile, and `rating: 5`.

The section is a stack of full-width rows, one per video, alternating sides: the video and its
client's written review, video-left for the first row and video-right for the second. There is
no carousel and no outbound link on a card; the only link to Google is the section's rating
badge.

**A row shows a quote only when the video declares which review is its own**, via the optional
`reviewId` on the video entry pointing at a `google[]` entry's `id`. Never pair by array
position: the two arrays are not parallel, and `google[]` contains a reviewer whose venue is
not recorded anywhere, so position-pairing would put words in a real person's mouth. A video
with no `reviewId` (or one naming a missing id) falls back to showing the venue's name and
location; Google reviews not claimed by any video render as plain cards after the rows. To add
La Pulpería's written review later, edit `data/reviews.json` alone: append the review with an
id, then set that id as the video's `reviewId`.

The **videos are not in this repo**. The source `.mov` files were 200-350 MB each; they were
transcoded to 1080p H.264 and uploaded to the `web-media` public bucket on the project's own
Supabase instance (`reviews/*.mp4`), and `data/reviews.json` points at the public URLs. The
**posters are local** (`public/assets/reviews/*.jpg`), on purpose: nothing is fetched from
Supabase when a page loads, only when a visitor presses play, which is the whole job of
`components/home/ReviewsVideo.tsx`. Keep it that way, or `e2e/tokens.spec.ts`'s "no
third-party font requests" test (which fails on *any* non-localhost request during load) will
start failing, and the cookie policy's third-party statement will stop being true.

Add a new video by transcoding it, uploading it to that bucket, saving a local poster frame,
and adding an entry to the `videos` array. Do not add reviews that were not actually written or
recorded by a client.

### Moving strips (Marquee)

`components/ui/Marquee.tsx` has exactly one way to stop: `pauseOnHover`, which halts the strip
while the pointer is over it. There is no pause button and no `:focus-within` stop, by the
owner's explicit instruction. `DifferentiatorBand`'s two claim rows opt in; `LogoStrip` does
not and never stops. The `prefers-reduced-motion: reduce` branch in the stylesheet drops the
animation entirely and turns the strip into an ordinary horizontal scroller; that branch is
what keeps this acceptable, so do not remove it.

The claim pills show their explanation at all times rather than on hover: the hover state's job
is to hold the strip still so a claim can be read, not to also uncover the text.

Pass `repeat` when a strip has only a handful of children (`LogoStrip` uses 6, the
differentiator rows use 3) so the loop's seam is pushed off screen and the list reads as
endless. Only the first copy is exposed to assistive tech; every other copy is `aria-hidden`
and `inert`.

### The "ask an AI" section

`components/home/AiCompare.tsx` links the visitor's question out to four assistants. Each one
is shown with its **own official mark**, downloaded from that provider's own site;
`public/assets/ai/SOURCES.md` records every URL, the single edit made to the OpenAI file, and
the trademark-permission question that is still open. Do not redraw, recolour or restyle these
marks; the white disc behind them in `AiCompare.module.css` exists so they sit on a neutral
ground without being altered. `lib/aiPrompt.ts` holds the ids, labels, logo paths and deep
links. Gemini is the one provider with no documented parameter for pre-filling its composer,
which is why the section also offers a copy button.

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
- The home hero (`e2e/hero.spec.ts`), including a guard that the deleted `?hero=c` mock
  variant has not come back — see "Home hero background" above
- The rest of the home page's sections (`e2e/home-sections.spec.ts`) — service cards, logo
  strip, AI demo, Bálamo showcase, differentiator band, reviews, AI-compare. One test there,
  `populated reviews render as cards`, guards the section now that `data/reviews.json` carries
  real content (see "Reviews data" above)
- An accessibility sweep (`e2e/a11y.spec.ts`) across every real page — `/`, `/features`, the three
  `/features/<slug>` service pages, `/pricing`, `/about`, `/contact`, and `/legal/privacy` as the
  representative legal page —
  each checked for exactly one `<h1>`, an `alt` attribute on every `<img>`, an accessible name
  on every `<button>`/`<a>`, and no horizontal overflow (`scrollWidth` vs `innerWidth`, ±1px)
  at a 390px viewport. `/cases` is deliberately excluded: it redirects home while
  `CASES_PUBLISHED` is false, so there's nothing of its own to check — see the comment in the
  spec before adding it back.

Unit tests (Playwright `expect`, no browser) live next to the modules they cover — except
when the covered module can't live under `lib/` itself, in which case the spec still sits in
`lib/` and imports it by relative path (e.g. `lib/reviewCards.test.ts` covers
`buildReviewRows` in `components/home/reviews-types.ts`) — and run separately:
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

- **Do not** hand-edit files under `archive/` — they are a historical record only (see "Archive" above).
- **Do not** use `next/navigation` directly — use the wrappers in `lib/routing.ts`.
- Content marked "placeholder" is intentional. Don't invent real names, quotes,
  metrics, or photos — leave placeholders until real content is supplied (tracked in `TODO.md`).
- Translated SEO copy (`meta.title.*`, `meta.description.*`) in `messages/` is
  currently in English for all locales — proper translations are a follow-up task.

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
