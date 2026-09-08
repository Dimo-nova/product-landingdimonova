# Dimonova site — TODO

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## 🎨 Redesign (spec: docs/superpowers/specs/2026-09-07-site-redesign-design.md)

- [x] Phase 1 — base: tokens, fonts, UI kit, header + mega-menu, footer + wordmark, demo/video modals, locale banner, 404, legal placeholders
- [x] Phase 2 — home (hero B + C variants, 8 service cards, AI panel, Bálamo showcase, differentiator band, reviews, AI compare, final CTA)
- [ ] Phase 3 — content still missing (see below); pick hero B or C
- [x] Phase 4 — inner pages (features, pricing, cases, about, contact) restyled onto the new
      design system; `lib/style.ts`, `components/Hover.tsx`, `components/sections/*`, the
      legacy `.dim-*` CSS, and the legacy Instrument Serif `@import`/`.dim-legacy` are all
      deleted. Task 8 closed the phase with an accessibility sweep across all six pages —
      `/`, `/features`, `/pricing`, `/about`, `/contact`, `/legal/privacy` — checking one
      `<h1>`, `alt` on every `<img>`, an accessible name on every `<button>`/`<a>`, and no
      horizontal overflow at a 390px viewport (`e2e/a11y.spec.ts`); all six passed, no fixes
      needed. It also fixed a flaky AI-demo toast assertion (`e2e/home-sections.spec.ts`) and
      added a 4 MB guard on the contact form's menu-file upload, client and server
      (`lib/config.ts` `MAX_UPLOAD_BYTES`, `app/api/contact/route.ts`,
      `components/contact/ContactForm.tsx`). Content gaps this phase surfaced, each tracked
      in detail below: the cases page is rebuilt but stays behind `CASES_PUBLISHED`, waiting
      on real case studies with written client permission; the About hero still has no
      founder video; the prices are unconfirmed; `about.team.{name,role1,role2,role3,role4,portrait}`
      are unused copy left over from an earlier four-person team design; and the dead message
      keys the eight deleted home sections left behind (next bullet) still need pruning from
      all five locale files.
- [ ] Phase 4 — the eight home sections deleted when phase 2 replaced them left dead message
      keys behind in all five `messages/*.json` files: `home.hero.{eyebrow,title1,title2,body,avatars}`,
      `home.viz.*`, `home.feat.*`, `home.how.*`, `home.price.*`, `home.cta.*`, `home.proof.*`,
      `home.logos.{label,placeholder}`, `alt.hero`, `alt.servicio`. Prune them once the inner
      pages are restyled and nothing else references them.
- [ ] Phase 5 — `/admin` proxy to menuadmin (basePath + webhook-preserving rewrite)

### Phase 3 — content still missing

- [ ] **Reviews — videos.** Upload the two review videos to the Supabase `tutorials`-style
      public storage bucket, then add their public URLs (plus poster images) as entries in
      `data/reviews.json`'s `videos` array (`{ id, name, venue, src, poster }`).
- [ ] **Reviews — Google.** Get 4–6 real Google reviews and the current profile rating from
      the owner, and add them to `data/reviews.json` (`rating`, `profileUrl`, and the
      `google` array of `{ name, text, url, date }`). Until this and the item above land,
      `components/home/Reviews.tsx` correctly renders the "coming soon" empty state — don't
      fill this file with placeholder/fake content to make the section look finished.
- [ ] **Hero "how it started" video.** `components/home/HeroPlayPill.tsx` opens
      `/assets/videos/how-it-started.mp4`, which does not exist yet. Get the video from the
      owner (same one destined for the About page) and add it at that path, or update the
      path if it lands somewhere else.
- [ ] **About page hero video.** The design spec puts the same "how it started" client video
      (above) in `app/[locale]/about/page.tsx`'s hero. Phase 4 Task 5 rebuilt the page without
      a player/poster/play button for it — a broken or dead-end control would repeat the
      defect the home page had to remove this phase. Once the video lands, wire it into
      `PageHero`'s `children` slot there.
- [ ] **About page team roles.** The team section deliberately shows just the two real
      founders, Pablo and Sergio, mirroring the legacy page — it should not have grown two
      placeholder cards during the Phase 4 restyle. `about.team.role1`/`role2` (all five
      locales) read like they were meant as Pablo's and Sergio's captions ("Founder & build
      lead" / "Design & styling", matching the "why" copy's designer/developer framing)
      instead of the hardcoded "Co-owner" both cards currently show. `about.team.name`,
      `role3`, `role4` and `portrait` are leftover copy from an earlier four-person design
      that no longer has cards to render them. Worth a copy decision: either wire
      `role1`/`role2` into Pablo/Sergio's cards, or prune all six of these unused keys if
      they're stale.
- [ ] **Bálamo's real numbers.** Replace the three `"—"` placeholders in
      `home.balamo.stats` (`messages/en.json` and `messages/es.json`, then
      `npm run sync:messages`) with the real dishes-managed / languages / average
      change-time figures for the Bálamo case.
- [ ] **Service card screenshots.** `components/home/ServiceCards.tsx` currently renders the
      striped `repeating-linear-gradient` placeholder for all eight cards. Replace it with
      real screenshots/illustrations per service (the eight slugs in `lib/services.ts`:
      `menu, ai, ordering, training, multi, reviews, daily, translate`), sized for the
      `DeviceFrame`/card media area.
- [ ] **Pick hero B or C.** Compare `/?hero=` (photo, default) and `/?hero=c` (mock) with the
      owner, then delete the losing variant and the temporary switch — see the "Home hero —
      two background variants" section in `CLAUDE.md` for exactly which files that means
      (`HeroBgPhoto`/`HeroBgMock` + `.module.css`, `HeroBackground.tsx`, and possibly
      `public/assets/hero/`).
- [ ] **Hero photograph.** The current variant-B background is a real but generic CC0 pub
      interior (`public/assets/hero/hero-stock.jpg`, sourced in
      `public/assets/hero/SOURCES.md`) — not a Dimonova venue. Get a better photograph (ideally
      a real client's dining room/kitchen pass) if this one isn't right for launch.

## ✅ Completed — Next.js port

- [x] Archive old static HTML/CSS/JS site into `archive/`
- [x] Bootstrap Next.js 16, TypeScript, App Router project
- [x] Port `globals.css` (keyframes, media queries, `.dim-*` classes)
- [x] Implement `lib/style.ts` (`s()` inline-CSS parser)
- [x] Set up `next-intl` with 5 locales (en, es, de, fr, pt), `as-needed` prefix
- [x] Scaffold all six routes under `app/[locale]/`
- [x] Port header + mobile nav (scroll behaviour, active link, hamburger)
- [x] Port footer + WhatsApp widget (toggle, close-on-outside-click)
- [x] Port home page (all sections)
- [x] Port features, pricing, cases, about pages
- [x] Port contact page (form validation, success state, venue pills)
- [x] SEO: `generateMetadata`, hreflang alternates, sitemap, robots, favicons, `themeColor`
- [x] Playwright e2e suite (all six routes, i18n, interactive widgets, form)
- [x] Deploy cleanup (`.vercelignore`, remove `.nojekyll`)

## 📝 Before launch — content (replace placeholders)

- [ ] Replace placeholder **case studies** (featured + 6 grid cards) with real venues, quotes, photos and results.
- [ ] The **cases page** is rebuilt but hidden behind `CASES_PUBLISHED` in `app/[locale]/cases/page.tsx`, waiting on real case studies with written client permission.
- [ ] The header's **Clients menu**, the **footer** and the home page's **Bálamo showcase** all link to `/cases`, which currently redirects home, so those links lead nowhere useful today.
- [ ] The Bálamo showcase's **"see the case"** button will need an actual Bálamo case study before it means anything.
- [ ] Replace the home-page **testimonial** ("Placeholder testimonial…") and client name/role.
- [ ] Replace the 6 **"venue logo"** placeholders in the home logo strip.
- [ ] Swap all striped **placeholder image blocks** (`repeating-linear-gradient`) for real photos/screenshots: hero phone/dashboard, product shot, analytics, case-study photos, team portraits.
- [ ] Confirm / update **pricing** numbers — currently "From €600" one-time and "From €45/mo".
- [ ] Confirm **contact details**: `hello@dimonova.com`, `+353 (0)1 555 0199`, opening hours. Update everywhere (header, footer, contact page).
- [ ] **Translate SEO copy** — `meta.title.*` and `meta.description.*` keys in `messages/es.json`, `messages/de.json`, `messages/fr.json`, `messages/pt.json` are currently in English. Provide native-language translations.
- [ ] **Translate all page copy** — body text in non-English `messages/*.json` files is currently English. Provide proper translations for each locale.

## 🔌 Before launch — functional

- [x] **Wire up the contact form.** It posts to `/api/contact`, which creates a Notion lead and sends an email notification via Resend.
- [x] **Make the WhatsApp widget real.** Point "Continue to WhatsApp" at `https://wa.me/<number>` with the real number.
- [x] Add real **legal pages** — Privacy, Terms and Cookies are written in full (`content/legal/`) and linked from the footer. `COMPANY` identity fields in `lib/config.ts` are still `«PENDIENTE»` placeholders — fill them with the real registered company data before deploy (see `.superpowers/sdd/legal-report.md`).
- [ ] Add an **`og:image`** for social sharing previews.

## 🔎 Before launch — quality

- [ ] **Accessibility pass:** verify keyboard/screen-reader behaviour, `aria-current` on active nav link, `aria-label` on icon-only buttons (WhatsApp FAB, mobile menu), `alt` text on images once added.
- [ ] Cross-browser / device QA (iOS Safari, Android Chrome).

## 🌱 Future / nice to have

- [ ] Add **analytics** (Vercel Analytics / Plausible).
- [ ] Connect a **custom domain** in Vercel.
- [ ] Cookie-consent banner if analytics/marketing cookies are added.
- [x] Escape user-supplied strings in the HTML email built in `app/api/contact/route.ts`.
- [ ] Prune unused message keys (`footer.tagline`, `footer.col_*`, `footer.label_*`, `footer.rights`, `wa.disclaimer`, `banner.change`, `banner.close`) when the inner pages are redesigned. Also unused since the legal page switched to `content/legal/`: `legal.privacy.title`, `legal.cookies.title`, `legal.terms.title`, `legal.placeholder`.

---
See `CLAUDE.md` for architecture/dev notes and `README.md` for the human overview.
