# Dimonova site — TODO

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## 🎨 Redesign (spec: docs/superpowers/specs/2026-09-07-site-redesign-design.md)

- [x] Phase 1 — base: tokens, fonts, UI kit, header + mega-menu, footer + wordmark, demo/video modals, locale banner, 404, legal placeholders
- [ ] Phase 2 — home (hero B + C variants, 8 service cards, AI panel, Bálamo showcase, differentiator band, reviews, AI compare, final CTA)
- [ ] Phase 3 — content: stock hero photo, service screenshots, Bálamo phone capture, reviews JSON, videos to Supabase bucket, real numbers, OG image; pick hero B or C
- [ ] Phase 4 — inner pages on the new system; delete `lib/style.ts`, `components/Hover.tsx`, `components/sections/*`, legacy `.dim-*` CSS
- [ ] Phase 5 — `/admin` proxy to menuadmin (basePath + webhook-preserving rewrite)

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
- [ ] Replace the home-page **testimonial** ("Placeholder testimonial…") and client name/role.
- [ ] Replace the **team** section (4 "Name placeholder" cards) with real names, roles and portraits — About page.
- [ ] Replace the 6 **"venue logo"** placeholders in the home logo strip.
- [ ] Swap all striped **placeholder image blocks** (`repeating-linear-gradient`) for real photos/screenshots: hero phone/dashboard, product shot, analytics, case-study photos, team portraits.
- [ ] Confirm / update **pricing** numbers — currently "From €600" one-time and "From €45/mo".
- [ ] Confirm **contact details**: `hello@dimonova.com`, `+353 (0)1 555 0199`, opening hours. Update everywhere (header, footer, contact page).
- [ ] **Translate SEO copy** — `meta.title.*` and `meta.description.*` keys in `messages/es.json`, `messages/de.json`, `messages/fr.json`, `messages/pt.json` are currently in English. Provide native-language translations.
- [ ] **Translate all page copy** — body text in non-English `messages/*.json` files is currently English. Provide proper translations for each locale.

## 🔌 Before launch — functional

- [ ] **Wire up the contact form.** It currently validates and shows a success state but sends nothing. Post to a form service (e.g. Formspree, Vercel serverless function + email provider).
- [x] **Make the WhatsApp widget real.** Point "Continue to WhatsApp" at `https://wa.me/<number>` with the real number.
- [~] Add real **legal pages** — placeholder pages exist at `/legal/[slug]` and are linked from the footer; real Terms / Privacy / Cookies texts are pending.
- [ ] Add an **`og:image`** for social sharing previews.

## 🔎 Before launch — quality

- [ ] **Accessibility pass:** verify keyboard/screen-reader behaviour, `aria-current` on active nav link, `aria-label` on icon-only buttons (WhatsApp FAB, mobile menu), `alt` text on images once added.
- [ ] Cross-browser / device QA (iOS Safari, Android Chrome).

## 🌱 Future / nice to have

- [ ] Add **analytics** (Vercel Analytics / Plausible).
- [ ] Connect a **custom domain** in Vercel.
- [ ] Cookie-consent banner if analytics/marketing cookies are added.
- [ ] Escape user-supplied strings in the HTML email built in `app/api/contact/route.ts`.
- [ ] Prune unused message keys (`footer.tagline`, `footer.col_*`, `footer.label_*`, `footer.rights`, `wa.disclaimer`, `banner.change`, `banner.close`) when the inner pages are redesigned.

---
See `CLAUDE.md` for architecture/dev notes and `README.md` for the human overview.
