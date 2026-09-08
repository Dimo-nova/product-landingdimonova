# Redesign Phase 4 — Inner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the five remaining pages (features, pricing, cases, about, contact) onto the new design system, so the whole site runs on one set of components and the legacy styling machinery can be deleted.

**Scope discipline — read this first.** This is a **restyle, not a redesign**. Every page keeps its current structure, its current sections in their current order, and its current copy, read from the same message keys it reads today. What changes is the mechanism: inline style strings passed through `lib/style.ts`'s `s()` become CSS Modules with design tokens, and `components/Hover.tsx` gives way to real CSS `:hover` and `:focus-visible`. Do not add sections, do not rewrite copy, do not reorder anything. The owner has not reviewed a new information architecture for these pages, and inventing one would be work thrown away.

Two deliberate exceptions, both called out in their tasks: the contact form is rebuilt rather than restyled, because its 441 lines of inline styling cannot be mechanically converted and it must keep behaviour it only recently gained; and any place where the old markup is inaccessible gets fixed rather than faithfully reproduced.

**Architecture:** Six shared inner-page components absorb the patterns that repeat across the five pages. Each page then becomes a thin composition of them. Server components throughout, with client islands only where interaction demands one.

**Tech Stack:** Next.js 16.2 (App Router, SSG), React 19.2, TypeScript strict, next-intl 4.13, `motion` 12, Playwright.

## Global Constraints

- Branch from `main` after phase 2 merges. Phases 1 and 2 are done; do not re-do any of them.
- Copy comes from the existing message keys, unchanged. If a key's text is wrong, that is a content task for the owner, not this phase. The only new keys allowed are accessible names for controls that previously had none, and they go in EN and ES with `npm run sync:messages` filling the rest.
- Import `Link`, `useRouter`, `usePathname`, `routing` from `@/lib/routing`. Never `next/navigation` or `next/link`.
- `motion` from `motion/react`, only inside `'use client'` files. `<MotionConfig reducedMotion="user">` already wraps the app. CSS keyframes must additionally be disabled under `@media (prefers-reduced-motion: reduce)`.
- Every component: `Name.tsx` + `Name.module.css` beside it. **Design tokens only, no colour literals.** Run `grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(" components/**/*.module.css` before every commit; every match must reference a `var(--...)`.
- No `dangerouslySetInnerHTML`. Several legacy sections currently use `t.raw()` with embedded `<strong>` and `<span>` markup; convert those to `t.rich` with the tags mapped to components.
- No inline styles except genuinely dynamic values.
- One `<h1>` per page, owned by that page's hero. Every image has a real `alt`. Every control has an accessible name. Nothing smaller than 18px semibold sits on the coral background.
- Available from phases 1 and 2: `components/ui/{Container,Button,Reveal,Modal,Annotated,Pill,Marquee,DeviceFrame}`, `components/icons/{ServiceIcons,FlagIcons}`, `components/home/EmailCta`, `lib/motion.ts`, `lib/events.ts`, `lib/services.ts`, `lib/config.ts`, `lib/html.ts`, `lib/useFocusTrap.ts`, and the full token set including `--on-dark-*`, `--on-brand-surface`, `--shadow-*`, `--scrim-strong`, `--device-bezel`, `--ink-raised`.
- `npx tsc --noEmit` clean. Before every e2e run kill anything stale on port 3100 (`netstat -ano | grep 3100`, `taskkill //PID <pid> //F`).
- Commits: conventional, ending with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Windows: Bash tool (Git Bash), no `&&` in PowerShell, quote paths containing `[locale]`.

---

## The repeating patterns

Surveyed across the twenty legacy sections, five shapes account for nearly all of them:

| Shape | Used by |
|---|---|
| eyebrow, `h1`, intro paragraph | `AboutHero`, `CasesHero`, `ContactHero`, `FeaturesHero`, `PricingHero` |
| closing call-to-action band | `AboutCta`, `CasesCta`, `FeaturesCta` |
| grid of small cards | `AboutPrinciples`, `AboutTeam`, `AboutWhy`, `CasesGrid`, `PricingIncluded` |
| two-column block, prose and bullets beside an image | `FeaturesHero` body, `FeaturesDashboard`, `FeaturesAnalytics`, `FeaturesOnboarding` |
| question and answer list | `PricingFaq` |

`CasesFeatured`, `PricingShape` and `PricingStrip` are one-offs and get built inline on their pages.

## File map

| Path | Responsibility |
|---|---|
| `components/page/PageHero.tsx` + `.module.css` | eyebrow, `h1`, intro; optional trailing slot |
| `components/page/PageCta.tsx` + `.module.css` | closing band with the demo button and WhatsApp link |
| `components/page/CardGrid.tsx` + `.module.css` | responsive grid; `Card` subcomponent with optional icon, image, title, body |
| `components/page/FeatureBlock.tsx` + `.module.css` | two-column prose-and-image block, image side switchable |
| `components/page/Faq.tsx` + `.module.css` | `<details>`-based list, open one at a time not required |
| `components/page/Prose.tsx` + `.module.css` | measure-constrained rich text used by the legal pages and here |
| `components/contact/ContactForm.tsx` + `.module.css` | rebuilt form |
| `app/[locale]/{features,pricing,cases,about,contact}/page.tsx` | thin compositions |

Deleted in Task 7: `lib/style.ts`, `lib/style.test.ts`, `components/Hover.tsx`, `components/OpenWAButton.tsx`, the old `components/ContactForm.tsx`, all twenty files under `components/sections/`, and the legacy `.dim-*` block at the bottom of `app/globals.css`.

---

### Task 1: The six shared page components

**Files:** Create the six components listed above under `components/page/`. Test: temporary route `app/[locale]/kit3/page.tsx` and `e2e/kit3.spec.ts`, both deleted at the end of the task.

**Interfaces produced:**
- `PageHero({ eyebrow, title, intro, children? })` — server; renders `<h1>`; `children` sits under the intro.
- `PageCta({ title, body, cta, source })` — server shell with a client button; `source` is passed to `openDemo`.
- `CardGrid({ columns?: 2 | 3 | 4, children })` and `Card({ icon?, image?, imageAlt?, title, body, footer? })`.
- `FeatureBlock({ eyebrow, title, body, bullets, image, imageAlt, side?: "left" | "right" })` — `bullets` is a list of rich strings rendered with `t.rich` by the caller, so `FeatureBlock` takes `React.ReactNode[]`.
- `Faq({ items })` where `items` is `{ q: string; a: string }[]`.
- `Prose({ children, className? })`.

- [ ] **Step 1: Write the temporary route and failing spec**

The route mounts one of each component with fixed sample props. The spec asserts: `PageHero` renders exactly one `h1`; `PageCta`'s button opens the demo modal; `CardGrid` with `columns={3}` renders a grid whose computed `grid-template-columns` has three tracks above 1000px and one below 640px; `Card` renders its image with the given alt; `FeatureBlock` reverses its column order when `side="right"`; `Faq` renders `<details>` elements that open on click and on Enter.

- [ ] **Step 2: Run it to verify it fails.**

- [ ] **Step 3: Build the six components.**

Style notes, all using tokens: `PageHero` gets generous top padding under the sticky header, the eyebrow in `--brand` uppercase 12px with letter-spacing, the `h1` at `--text-h1` capped smaller than the home hero's since these pages are denser, and the intro at `--text-lead` in `--ink-2` with a `65ch` measure. `PageCta` sits on `--cream` with a rounded panel. `Card` uses `--paper` with a `--mist` border, radius `--radius-card`, and lifts on hover with `--shadow-soft`. `FeatureBlock` is a two-column grid that stacks below 900px, with the image in a `DeviceFrame` when it is a screenshot. `Faq` uses native `<details>`/`<summary>` so it works without JavaScript, with the marker replaced by a rotating chevron.

- [ ] **Step 4: Green, delete the temporary route and spec, `npx tsc --noEmit`, commit.**

```bash
git commit -m "feat(pages): shared hero, CTA, card grid, feature block and FAQ components"
```

---

### Task 2: Features page

**Files:** Rewrite `app/[locale]/features/page.tsx`. Test: `e2e/pages.spec.ts` gains features-specific assertions.

The page currently renders `FeaturesHero`, `FeaturesDashboard`, `FeaturesAnalytics`, `FeaturesOnboarding`, `FeaturesCta`. Keep that order and every message key each of them reads: `features.eyebrow`, `features.title`, `features.intro`, `features.f1` through `features.f4`, `features.cta`, and the `alt.*` keys for the three screenshots.

- [ ] **Step 1: Read each legacy section and write down the keys it reads and the anchor ids it carries.** The home's service cards link to `/features#menu`, `#ai`, `#ordering`, `#training`, `#multi`, `#reviews`, `#daily`, `#translate`, and the header's resources menu links to `/features#training`. Those eight anchors must exist on this page after the rewrite, even if several of them land on the same block for now — put each anchor on the most relevant heading and record in the report which block each one points at. A link from the home that scrolls nowhere is a defect.

- [ ] **Step 2: Write the failing assertions** in `e2e/pages.spec.ts`: the page has one `h1`; all eight anchors resolve to an element; each of the three screenshots has a non-empty `alt`; the closing CTA opens the demo modal.

- [ ] **Step 3: Rebuild the page** from `PageHero`, three `FeatureBlock`s and `PageCta`, plus the onboarding cards as a `CardGrid`. Convert every `t.raw` to `t.rich`.

- [ ] **Step 4: Green, `npx tsc --noEmit`, commit.**

---

### Task 3: Pricing page

**Files:** Rewrite `app/[locale]/pricing/page.tsx`. Test: `e2e/pages.spec.ts`.

Sections in order: `PricingHero`, `PricingShape`, `PricingStrip`, `PricingIncluded`, `PricingFaq`. Keys: `pricing.eyebrow`, `pricing.title`, `pricing.intro`, `pricing.shape`, `pricing.strip`, `pricing.included`, `pricing.faq`.

- [ ] **Step 1:** The header's resources menu links to `/pricing#faq`; that anchor must exist. Add the failing assertion for it plus one `h1` and the FAQ opening on click.
- [ ] **Step 2:** Rebuild with `PageHero`, a two-card price layout built inline, `CardGrid` for what is included, and `Faq`.
- [ ] **Step 3:** The prices are content the owner has flagged as unconfirmed. Render them exactly as the keys say; do not adjust a number.
- [ ] **Step 4: Green, commit.**

---

### Task 4: Cases page

**Files:** Rewrite `app/[locale]/cases/page.tsx`. Test: `e2e/pages.spec.ts`.

Sections: `CasesHero`, `CasesFeatured`, `CasesGrid`, `CasesCta`. Keys: `cases.eyebrow`, `cases.title`, `cases.intro`, `cases.note`, `cases.featured`, `cases.grid`, `cases.cta`.

- [ ] **Step 1:** This page's content is almost entirely placeholder: `cases.note` says so, and the grid cards carry invented venue names. **Keep them and keep the note visible.** Do not replace placeholder venues with the three real clients; that is a content decision the owner must make with real permission in hand. Add an assertion that `cases.note` renders, so the disclaimer cannot be lost in a later refactor.
- [ ] **Step 2:** The home and the header both link here (`/cases`), and the Bálamo showcase's "see the case" button lands on this page with no Bálamo case on it. Note that in the report as a content gap for `TODO.md`; do not fabricate the case.
- [ ] **Step 3:** Rebuild with `PageHero`, an inline featured block, `CardGrid` and `PageCta`.
- [ ] **Step 4: Green, commit.**

---

### Task 5: About page

**Files:** Rewrite `app/[locale]/about/page.tsx`. Test: `e2e/pages.spec.ts`.

Sections: `AboutHero`, `AboutWhy`, `AboutPrinciples`, `AboutTeam`, `AboutCta`. Keys: `about.eyebrow`, `about.title`, `about.intro`, `about.why`, `about.principles`, `about.team`, `about.cta`.

- [ ] **Step 1:** The team section shows two real headshots, `pablo_headshot.jpeg` and `sergio_headshot.jpg`, whose alt text was improved in phase 1 to a name and role. Preserve that. Two further team cards are placeholders; keep them as placeholders.
- [ ] **Step 2:** The spec calls for the first client's video to live in this page's hero. That video does not exist yet, so leave a clearly marked gap rather than a broken player, and add it to `TODO.md`.
- [ ] **Step 3:** Rebuild, green, commit.

---

### Task 6: Contact page and the rebuilt form

**Files:** Create `components/contact/ContactForm.tsx` + `.module.css`. Rewrite `app/[locale]/contact/page.tsx`. Test: `e2e/contact.spec.ts` (rewrite against the new markup, keeping every existing assertion's intent).

This is the largest task. The existing form is 441 lines of inline styling and it recently gained behaviour that must not regress.

**Behaviour that must survive, verified against the current file before you start:**
- Fields: name, email, venue name, venue type (a pill group), phone, current menu URL, a file upload accepting PDF and Excel, and a free-text message.
- The privacy-consent checkbox added in phase 1: required, unticked by default, its label linking to `/legal/privacy` via `t.rich`, with an inline error when unticked. The server also rejects a submission without it, so do not weaken the client side into optional.
- Client validation with inline messages, `aria-invalid` and `aria-describedby`.
- Posts `FormData` to `/api/contact`. Success and error states, with the WhatsApp fallback on failure.
- A "send another" control that resets the form.
- The venue-type pills must be a real radio group, keyboard operable, with the selected state exposed to assistive technology. The legacy version used buttons with a background colour as the only selected indicator; that is a defect to fix, not to reproduce.

- [ ] **Step 1: Inventory the current form.** Read `components/ContactForm.tsx` end to end and write the field list, every message key, every validation rule and every state transition into the report before writing any new code. The rebuild must match that inventory.
- [ ] **Step 2: Rewrite `e2e/contact.spec.ts`** against the intended new markup. Every assertion in the current file must have a counterpart. Add: the pills are a radio group and arrow keys move between them; the consent checkbox blocks submission when unticked; a 500 response shows the WhatsApp fallback.
- [ ] **Step 3: Run it red.**
- [ ] **Step 4: Build the form** as a client component with a CSS module. Reuse `Button` and the field styling from `components/DemoModal.module.css` where it fits, extracting shared field styles into `components/ui/Field.module.css` if the duplication is more than a few rules.
- [ ] **Step 5: Rebuild the page** with `PageHero` and the form beside the contact details from `lib/config.ts`.
- [ ] **Step 6: Green, plus `npx playwright test e2e/demo-modal.spec.ts` to confirm the shared API route still serves both forms. Commit.**

---

### Task 7: Delete the legacy layer

**Files:** Delete `lib/style.ts`, `lib/style.test.ts`, `components/Hover.tsx`, `components/OpenWAButton.tsx`, `components/ContactForm.tsx`, all of `components/sections/`. Modify `app/globals.css`, `CLAUDE.md`.

- [ ] **Step 1: Prove nothing imports them.** Run `grep -rn "lib/style\|components/Hover\|OpenWAButton\|components/sections\|components/ContactForm" app components lib e2e scripts`. The only hits should be the files being deleted. If anything else appears, stop and report.
- [ ] **Step 2: Delete them with `git rm`.**
- [ ] **Step 3: Remove the legacy CSS.** Everything below the `/* ==== Legacy … ==== */ ` marker in `app/globals.css` goes, including the `.dim-*` rules, the legacy keyframes and the `.dim-legacy` class. Also remove the self-hosted Instrument Serif face from `lib/fonts.ts` and its `--font-instrument-serif` variable if nothing references the family any more — check first, since the legal pages may not use it.
- [ ] **Step 4: `npx tsc --noEmit`, then the full `npm run test:e2e`.** A missed reference will surface here.
- [ ] **Step 5: Update `CLAUDE.md`** to delete the legacy styling section entirely and state that the whole site now runs on CSS Modules and tokens.
- [ ] **Step 6: Commit.**

```bash
git commit -m "refactor: delete the legacy inline-style layer"
```

---

### Task 8: Full suite, accessibility sweep and docs

- [ ] **Step 1: Extend `e2e/a11y.spec.ts`** to run its existing checks — one `h1`, every image has an alt, every control has an accessible name — across all six pages rather than the current subset.
- [ ] **Step 2: Add a horizontal-overflow check at 390px for all six pages.**
- [ ] **Step 3: Run everything:** `npx tsc --noEmit`, `npm run test:e2e`, `npx playwright test -c playwright.unit.config.ts`, `node --test scripts/sync-messages.test.mjs`.
- [ ] **Step 4: Update `TODO.md`:** tick phase 4, and record the content gaps this phase surfaced — the missing Bálamo case study, the missing About video, the placeholder case-study venues, the unconfirmed prices.
- [ ] **Step 5: Update the spec** to mark the inner pages done and note that they were restyled rather than redesigned, so a future information-architecture pass is still open.
- [ ] **Step 6: Commit.**

---

## Self-review notes

- **Scope:** every task restyles existing content. The only rewrite is the contact form, and its task starts by inventorying the current behaviour so nothing is lost.
- **Anchors:** Task 2 explicitly protects the eight `/features#…` links the home page depends on, and Task 3 protects `/pricing#faq`. These are the easiest thing to break in a rewrite and the hardest to notice.
- **Type consistency:** the six components' signatures are fixed in Task 1 and consumed unchanged in Tasks 2 to 6. `Card`'s `image`/`imageAlt` pair is always used together; a card with an image and no alt should be a type error, so model them as a discriminated union rather than two optional props.
- **Deliberate gaps:** the Bálamo case study, the About video and the real case-study venues stay missing rather than being invented, and Task 8 records them.
