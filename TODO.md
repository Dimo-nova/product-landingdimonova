# Dimonova site — TODO

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## 🎨 Redesign (spec: docs/superpowers/specs/2026-09-07-site-redesign-design.md)

- [x] Phase 1 — base: tokens, fonts, UI kit, header + mega-menu, footer + wordmark, demo/video modals, locale banner, 404, legal placeholders
- [x] Phase 2 — home (hero B + C variants, 8 service cards, AI panel, Bálamo showcase, differentiator band, reviews, AI compare, final CTA)
- [~] Phase 3 — reviews (videos + Google) and the founder story video are in; still missing: Bálamo's numbers, the service-card screenshots, and the choice between hero B and C
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
      on real case studies with written client permission; the About team section is likewise
      rebuilt but stays behind `TEAM_PUBLISHED` in `app/[locale]/about/page.tsx` — the owner
      hid it in commit 249fec2 and this phase's rebuild must not turn it back on until the
      owner decides who appears there, and whether the leftover
      `about.team.{name,role1,role2,role3,role4,portrait}` message keys are used or pruned; the
      About hero still has no founder video; the prices are unconfirmed; and the dead message
      keys the eight deleted home sections left behind (next bullet) still need pruning from
      all five locale files.
- [x] Phase 4 — dead message keys pruned from all five `messages/*.json`: the eight replaced
      home sections' keys (`home.hero.{eyebrow,title1,title2,body,avatars}`, `home.viz.*`,
      `home.feat.*`, `home.how.*`, `home.price.*`, `home.cta.*`, `home.proof.*`,
      `home.logos.{label,placeholder}`, `alt.hero`, `alt.servicio`), the differentiator band's
      unused copy (`home.diff.{eyebrow,body,p1-p4,card_*,pause,resume}`), `nav.mega.tutorials`,
      and the older stale set (`footer.{tagline,col_*,label_*,rights}`, `wa.disclaimer`,
      `banner.{change,close}`, `legal.*`, `about.team.{name,role3,role4,portrait}`).
- [ ] Phase 5 — `/admin` proxy to menuadmin (basePath + webhook-preserving rewrite)

### Phase 3 — content still missing

- [x] **Reviews — videos.** Calsot's and La Pulpería's clips were transcoded to 1080p H.264
      and uploaded to the `web-media` public bucket on the project's Supabase instance;
      `data/reviews.json` points at the public URLs and at local poster frames in
      `public/assets/reviews/`. The 200-350 MB source `.mov` files were moved out of the repo
      to `../_media-originals/REVIEWS CLIENTES/` — they are the only copies, so keep them.
- [x] **Reviews — Google.** Both reviews on Dimonova's Google Business profile (Restaurante
      Calsot and Antonio Hernández, 5.0 overall) are in `data/reviews.json`. There are only
      two today; the carousel grows on its own as more are added.
- [x] **Hero "how it started" video.** Calsot's owner telling the story, at
      `HERO_VIDEO_SRC`/`HERO_VIDEO_POSTER` in `lib/config.ts`. The pill renders again.
- [x] **About page hero video.** Wired into `PageHero`'s `children` slot on
      `app/[locale]/about/page.tsx`, behind the same `HERO_VIDEO_SRC` guard.
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

- [x] The **cases page** now carries the three real client case studies (Calsot, La Pulpería, Bálamo), written from the owner's own account of each project, and `CASES_PUBLISHED` is `true`. No photography of the venues exists yet; each case is presented on its logo instead.
- [ ] The **About team section** is likewise rebuilt but hidden behind `TEAM_PUBLISHED` in `app/[locale]/about/page.tsx` (the owner hid it in commit 249fec2), pending the owner's decision on who appears there and whether the leftover `about.team.{name,role1,role2,role3,role4,portrait}` message keys are used or should be pruned.
- [ ] **Written client permission.** The cases page and the logo strip name and show three real clients. Confirm each one has agreed in writing to being named and to their logo being used.
- [x] The home page's reviews section carries real content (see Phase 3 above); the old placeholder testimonial section no longer exists.
- [x] The home logo strip shows the three real client logos (Bálamo, La Pulpería, Calsot).
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

- [ ] **Moving strips have no pause control.** At the owner's explicit request the marquees no
      longer stop on hover, on focus, or via a button, which is a departure from WCAG 2.2.2
      (Level A) for content that moves for more than five seconds. The `prefers-reduced-motion`
      branch in `components/ui/Marquee.module.css` is the only remaining escape hatch. Revisit
      if accessibility conformance is ever claimed formally.
- [ ] **Accessibility pass:** verify keyboard/screen-reader behaviour, `aria-current` on active nav link, `aria-label` on icon-only buttons (WhatsApp FAB, mobile menu), `alt` text on images once added.
- [ ] Cross-browser / device QA (iOS Safari, Android Chrome).

## 🌱 Future / nice to have

- [ ] Add **analytics** (Vercel Analytics / Plausible).
- [ ] Connect a **custom domain** in Vercel.
- [ ] Cookie-consent banner if analytics/marketing cookies are added.
- [x] Escape user-supplied strings in the HTML email built in `app/api/contact/route.ts`.
- [x] Unused message keys pruned across all five locales (see the Phase 4 entry above).

---
See `CLAUDE.md` for architecture/dev notes and `README.md` for the human overview.
