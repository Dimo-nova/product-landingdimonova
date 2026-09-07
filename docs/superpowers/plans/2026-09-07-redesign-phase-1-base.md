# Redesign Phase 1 — Base (tokens, UI kit, header, footer, modals, banner, 404) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the new visual system and every site-wide shell piece (header with mega-menu, footer with giant wordmark, demo + video modals, locale banner, 404) so that the old inner pages already render inside the new shell and Phase 2 (home) only has to add sections.

**Architecture:** CSS Modules + design tokens in `app/globals.css`; `motion` (Framer Motion, `motion/react`) only inside `'use client'` islands; server components everywhere else. Site-wide overlays (modals, banner) are mounted once in `app/[locale]/layout.tsx` and opened through typed `window` CustomEvents from `lib/events.ts`. One data source (`lib/services.ts`) feeds the mega-menu and the footer (and, later, the home cards).

**Tech Stack:** Next.js 16.2 (App Router, SSG), React 19.2, TypeScript strict, next-intl 4.13 (`localePrefix: "as-needed"`, default `en`), `motion` ^12, `next/font/google` (Bricolage Grotesque + Instrument Sans), Playwright e2e (`npm run test:e2e`, port 3100) and Playwright unit runner (`npx playwright test -c playwright.unit.config.ts`).

Spec: `docs/superpowers/specs/2026-09-07-site-redesign-design.md` (§2, §3, §4, §6, §7, §8, §9, §10, §11, §12, §13, §15, §16 phase 1).

## Global Constraints

- Locales: `en`, `es`, `de`, `fr`, `pt`; default `en` served at `/`; `localePrefix: "as-needed"`. Always import `Link`, `useRouter`, `usePathname` from `@/lib/routing`, never from `next/navigation`.
- New copy is written in **EN and ES**. `de`, `fr`, `pt` receive the EN strings via `scripts/sync-messages.mjs` (Task 4). Never leave a key missing in any locale file (next-intl logs errors and e2e will fail).
- Tokens (verbatim from spec §3.1): `--brand:#FE5243`, `--brand-deep:#C93A2B`, `--brand-soft:#FFE9E5`, `--ink:#0F0E0D`, `--ink-2:#4A4744`, `--paper:#FFFFFF`, `--cream:#FAF7F2`, `--mist:#EDEAE4`, `--ok:#1DB36B`, `--radius-card:28px`, `--radius-panel:32px`, `--radius-pill:999px`, `--container:1280px`, `--gutter:clamp(16px,4vw,48px)`, `--ease-out:cubic-bezier(0.22,1,0.36,1)`, `--dur:0.6s`.
- Fonts: `--font-display` = Bricolage Grotesque (600–800), `--font-body` = Instrument Sans (400–600), via `next/font/google`, `display: "swap"`.
- Coral `#FE5243` never sits under text smaller than 18px semibold. Focus ring global: `outline: 3px solid var(--brand); outline-offset: 3px`.
- `prefers-reduced-motion`: `<MotionConfig reducedMotion="user">` wraps the app; CSS keyframes must be disabled under `@media (prefers-reduced-motion: reduce)`.
- No `dangerouslySetInnerHTML` in any new component. Rich strings use `t.rich`.
- Hardcoded contact details come from `@/lib/config` (`CONTACT`). Client dashboard URL: `https://menuadmin.dimonova.com`.
- Old inner pages (`components/sections/*`, `lib/style.ts`, `components/Hover.tsx`, `components/OpenWAButton.tsx`, `components/ContactForm.tsx`) stay untouched and must keep building. They keep using the legacy `.dim-*` classes in `globals.css`; do not delete those rules.
- Every new component: `PascalCase.tsx` + `PascalCase.module.css` side by side.
- Commit after every task. Message format: conventional commits, end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Windows dev machine, PowerShell 5.1: use `npx` commands as written; avoid `&&` in PowerShell (use `;`), or run in Git Bash.

---

## File map

| Path | Responsibility |
|---|---|
| `app/globals.css` | tokens, reset, base typography, focus ring, reduced-motion, **plus** the legacy `.dim-*` rules (kept verbatim at the bottom) |
| `lib/fonts.ts` | `next/font` instances, exports `fontVars` class string |
| `lib/events.ts` | `openDemo()`, `openVideo()`, event names + payload types, `useWindowEvent()` hook |
| `lib/services.ts` | `SERVICES` array (slug, href) — single source for mega-menu, footer, home cards |
| `lib/bannerCopy.ts` | banner prompt in the 5 locales |
| `components/icons/ServiceIcons.tsx` | 8 inline SVG icons keyed by slug |
| `components/ui/Container.tsx` | max-width wrapper |
| `components/ui/Button.tsx` | `solid` / `outline` / `ghost`, `md` / `lg`, renders `<a>`, `<Link>` or `<button>` |
| `components/ui/Reveal.tsx` | `motion.div` with the `reveal` variant |
| `components/ui/Modal.tsx` | shared dialog shell (overlay, focus trap, Esc, scroll-lock, `AnimatePresence`) |
| `components/ui/Annotated.tsx` | hand-drawn coral SVG annotation (`ellipse` / `strike`) drawn with `pathLength` |
| `components/layout/Providers.tsx` | client wrapper with `MotionConfig` |
| `components/layout/Header.tsx` | sticky bar, scroll compaction, desktop nav + CTAs |
| `components/layout/MegaMenu.tsx` | hover/keyboard mega panels (Products, Clients, Resources) |
| `components/layout/MobileNav.tsx` | hamburger + full-screen accordion panel |
| `components/layout/LangSwitcher.tsx` | restyled language dropdown (keeps `aria-label="Choose language"` and `data-lang`) |
| `components/layout/Footer.tsx` | 5 columns + giant wordmark |
| `components/layout/LocaleBanner.tsx` | "prefer your language?" bar |
| `components/DemoModal.tsx` | demo request form |
| `components/VideoModal.tsx` | video player dialog |
| `components/WhatsAppWidget.tsx` | restyled (behaviour unchanged) |
| `app/[locale]/layout.tsx` | mounts Providers, Header, Footer, LocaleBanner, DemoModal, VideoModal, WhatsAppWidget; applies font classes |
| `app/[locale]/not-found.tsx`, `app/[locale]/[...rest]/page.tsx` | localized 404 |
| `app/[locale]/legal/[slug]/page.tsx` | placeholder legal pages (privacy, cookies, terms) |
| `app/api/contact/route.ts` | accepts `locations`, `menuToday`, `source` |
| `scripts/sync-messages.mjs` | copies missing keys from `en.json` to the other locales |
| `messages/en.json`, `messages/es.json` | new keys: `nav.*`, `services.*`, `footer.*`, `modal.*`, `banner.*`, `notFound.*`, `legal.*` |
| `e2e/header.spec.ts`, `e2e/footer.spec.ts`, `e2e/demo-modal.spec.ts`, `e2e/video-modal.spec.ts`, `e2e/locale-banner.spec.ts`, `e2e/not-found.spec.ts`, `e2e/footer-wa.spec.ts` | tests |
| `lib/services.test.ts`, `lib/bannerCopy.test.ts` | unit tests (Playwright unit runner) |

Deleted at the end: `components/Header.tsx`, `components/Footer.tsx`, `components/MobileNav.tsx`, `components/LangSwitcher.tsx`, `components/NavLink.tsx` (old shell).

---

### Task 1: Dependencies, fonts, tokens

**Files:**
- Modify: `package.json` (add `motion`)
- Create: `lib/fonts.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx` (themeColor)
- Test: `e2e/tokens.spec.ts`

**Interfaces:**
- Produces: `fontVars: string` (class names to put on `<html>`), CSS custom properties listed in Global Constraints, base classes `.u-visually-hidden`.

- [ ] **Step 1: Install motion**

```bash
npm install motion@^12
```

Expected: `package.json` `dependencies` now contains `"motion": "^12.x"`.

- [ ] **Step 2: Write the failing e2e test**

Create `e2e/tokens.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("design tokens and fonts are applied on :root", async ({ page }) => {
  await page.goto("/");
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      brand: cs.getPropertyValue("--brand").trim(),
      ink: cs.getPropertyValue("--ink").trim(),
      display: cs.getPropertyValue("--font-display").trim(),
      body: cs.getPropertyValue("--font-body").trim(),
    };
  });
  expect(tokens.brand.toUpperCase()).toBe("#FE5243");
  expect(tokens.ink.toUpperCase()).toBe("#0F0E0D");
  expect(tokens.display).toMatch(/Bricolage/i);
  expect(tokens.body).toMatch(/Instrument/i);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx playwright test e2e/tokens.spec.ts`
Expected: FAIL — `--brand` is empty string.

- [ ] **Step 4: Create `lib/fonts.ts`**

```ts
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-instrument",
});

/** Class string to place on <html> so the CSS variables exist everywhere. */
export const fontVars = `${bricolage.variable} ${instrument.variable}`;
```

- [ ] **Step 5: Rewrite the top of `app/globals.css`**

Replace the first line (`@import url('https://fonts.googleapis.com/...')`) and the base rules (`*,*::before,*::after`, `body`, `a,button`, `button`, `input,textarea,select`) with the block below. **Keep everything from `.dim-page{...}` downwards exactly as it is** (legacy inner pages depend on it).

```css
/* ==== Design tokens (spec §3.1) ==== */
:root {
  --brand: #FE5243;
  --brand-deep: #C93A2B;
  --brand-soft: #FFE9E5;
  --ink: #0F0E0D;
  --ink-2: #4A4744;
  --paper: #FFFFFF;
  --cream: #FAF7F2;
  --mist: #EDEAE4;
  --ok: #1DB36B;

  --font-display: var(--font-bricolage), "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: var(--font-instrument), "Instrument Sans", system-ui, sans-serif;

  --text-h1: clamp(44px, 7vw, 88px);
  --text-h2: clamp(32px, 4.5vw, 56px);
  --text-h3: clamp(22px, 2.2vw, 28px);
  --text-lead: clamp(17px, 1.4vw, 20px);

  --radius-card: 28px;
  --radius-panel: 32px;
  --radius-pill: 999px;

  --container: 1280px;
  --gutter: clamp(16px, 4vw, 48px);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.6s;

  --shadow-hover: 0 20px 40px -20px rgba(15, 14, 13, .35);
  --header-h: 72px;
}

/* ==== Reset / base ==== */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a, button { color: inherit; text-decoration: none; font-family: inherit; }
button { border: none; background: none; padding: 0; cursor: pointer; }
input, textarea, select { font-family: inherit; color: inherit; }
img, video { max-width: 100%; height: auto; display: block; }
h1, h2, h3 { font-family: var(--font-display); letter-spacing: -0.02em; line-height: 1.02; margin: 0; }
h1 { font-size: var(--text-h1); font-weight: 800; }
h2 { font-size: var(--text-h2); font-weight: 700; }
h3 { font-size: var(--text-h3); font-weight: 700; }

:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; border-radius: 4px; }

.u-visually-hidden {
  position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
}

/* ==== Legacy (inner pages, removed in the inner-pages phase) ==== */
```

Note: the legacy `body{...background:#FAF6F0...}` rule is removed; the legacy pages inherit the new white background. That is expected for this phase.

- [ ] **Step 6: Apply the font classes on `<html>` and update themeColor**

`app/layout.tsx`: change `themeColor` to the new brand:

```ts
export const viewport: Viewport = { themeColor: "#FE5243" };
```

`app/[locale]/layout.tsx`: import `fontVars` and add it to `<html>`:

```tsx
import { fontVars } from "@/lib/fonts";
// ...
    <html lang={locale} className={fontVars}>
```

- [ ] **Step 7: Run the test**

Run: `npx playwright test e2e/tokens.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json lib/fonts.ts app/globals.css app/layout.tsx "app/[locale]/layout.tsx" e2e/tokens.spec.ts
git commit -m "feat(redesign): design tokens, self-hosted fonts, motion dependency"
```

---

### Task 2: `lib/events.ts`, `lib/services.ts`, `lib/bannerCopy.ts`, service icons

**Files:**
- Create: `lib/events.ts`, `lib/services.ts`, `lib/bannerCopy.ts`, `components/icons/ServiceIcons.tsx`
- Test: `lib/services.test.ts`, `lib/bannerCopy.test.ts`

**Interfaces:**
- Produces:
  - `type ServiceSlug = "menu"|"ai"|"ordering"|"training"|"multi"|"reviews"|"daily"|"translate"`
  - `SERVICES: { slug: ServiceSlug; href: string }[]` (8 items, `href` = `/features#<slug>`)
  - `openDemo(p?: { email?: string; source?: string }): void`, `openVideo(p: { src: string; poster?: string; title: string; orientation?: "landscape"|"portrait" }): void`
  - `DEMO_OPEN = "demo:open"`, `VIDEO_OPEN = "video:open"`, `useWindowEvent<T>(name, handler)`
  - `BANNER_COPY: Record<Locale, string>`
  - `ServiceIcon({ slug, size? })` React component

- [ ] **Step 1: Write failing unit tests**

`lib/services.test.ts`:

```ts
import { test, expect } from "@playwright/test";
import { SERVICES } from "./services";

test("exposes exactly the 8 services in spec order", () => {
  expect(SERVICES.map((s) => s.slug)).toEqual([
    "menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate",
  ]);
});

test("every service links to its features anchor", () => {
  for (const s of SERVICES) expect(s.href).toBe(`/features#${s.slug}`);
});
```

`lib/bannerCopy.test.ts`:

```ts
import { test, expect } from "@playwright/test";
import { BANNER_COPY } from "./bannerCopy";
import { routing } from "./routing";

test("banner copy exists for every locale", () => {
  for (const l of routing.locales) expect(BANNER_COPY[l].length).toBeGreaterThan(5);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test -c playwright.unit.config.ts`
Expected: FAIL — cannot find module `./services` / `./bannerCopy`.

- [ ] **Step 3: Create `lib/services.ts`**

```ts
export type ServiceSlug =
  | "menu" | "ai" | "ordering" | "training" | "multi" | "reviews" | "daily" | "translate";

export type Service = { slug: ServiceSlug; href: string };

const SLUGS: ServiceSlug[] = [
  "menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate",
];

/** Single source of truth for the 8 services (mega-menu, footer, home cards). Copy lives in messages under `services.<slug>`. */
export const SERVICES: Service[] = SLUGS.map((slug) => ({ slug, href: `/features#${slug}` }));
```

- [ ] **Step 4: Create `lib/bannerCopy.ts`**

```ts
import type { routing } from "./routing";

type Locale = (typeof routing.locales)[number];

/** Prompt shown in the *preferred* language, so it is readable by the visitor. */
export const BANNER_COPY: Record<Locale, string> = {
  en: "Prefer to read this in English?",
  es: "¿Prefieres leerlo en español?",
  de: "Lieber auf Deutsch lesen?",
  fr: "Préférez-vous lire en français ?",
  pt: "Prefere ler em português?",
};
```

- [ ] **Step 5: Create `lib/events.ts`**

```ts
"use client";
import { useEffect } from "react";

export const DEMO_OPEN = "demo:open" as const;
export const VIDEO_OPEN = "video:open" as const;

export type DemoOpenPayload = { email?: string; source?: string };
export type VideoOpenPayload = {
  src: string;
  poster?: string;
  title: string;
  orientation?: "landscape" | "portrait";
};

export function openDemo(payload: DemoOpenPayload = {}) {
  window.dispatchEvent(new CustomEvent<DemoOpenPayload>(DEMO_OPEN, { detail: payload }));
}

export function openVideo(payload: VideoOpenPayload) {
  window.dispatchEvent(new CustomEvent<VideoOpenPayload>(VIDEO_OPEN, { detail: payload }));
}

/** Subscribe to a window CustomEvent for the lifetime of the component. */
export function useWindowEvent<T>(name: string, handler: (detail: T) => void) {
  useEffect(() => {
    const fn = (e: Event) => handler((e as CustomEvent<T>).detail);
    window.addEventListener(name, fn);
    return () => window.removeEventListener(name, fn);
  }, [name, handler]);
}
```

- [ ] **Step 6: Create `components/icons/ServiceIcons.tsx`**

```tsx
import type { ServiceSlug } from "@/lib/services";

const PATHS: Record<ServiceSlug, React.ReactNode> = {
  menu: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  ai: <><path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z" /><path d="M5 18l.9 2.1L8 21l-2.1.9L5 24" transform="translate(0 -3)" /></>,
  ordering: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  training: <><path d="M4 7l8-4 8 4-8 4z" /><path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
  multi: <><rect x="3" y="4" width="8" height="8" rx="1.5" /><rect x="13" y="4" width="8" height="8" rx="1.5" /><rect x="3" y="14" width="8" height="8" rx="1.5" /><rect x="13" y="14" width="8" height="8" rx="1.5" /></>,
  reviews: <><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></>,
  daily: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  translate: <><path d="M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8" /><path d="M6 9c1 2.5 3 4.5 6 6" /><path d="M13 20l4-9 4 9M14.5 17h5" /></>,
};

export function ServiceIcon({ slug, size = 24 }: { slug: ServiceSlug; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[slug]}
    </svg>
  );
}
```

- [ ] **Step 7: Run unit tests and typecheck**

Run: `npx playwright test -c playwright.unit.config.ts`
Expected: PASS (existing `style.test.ts` + 3 new tests).
Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add lib/events.ts lib/services.ts lib/bannerCopy.ts lib/services.test.ts lib/bannerCopy.test.ts components/icons/ServiceIcons.tsx
git commit -m "feat(redesign): events bus, services registry, banner copy, service icons"
```

---

### Task 3: UI kit — Container, Button, Reveal, Modal, Annotated, Providers

**Files:**
- Create: `components/ui/Container.tsx` + `.module.css`, `components/ui/Button.tsx` + `.module.css`, `components/ui/Reveal.tsx`, `components/ui/Modal.tsx` + `.module.css`, `components/ui/Annotated.tsx` + `.module.css`, `components/layout/Providers.tsx`, `lib/motion.ts`
- Test: `e2e/ui-kit.spec.ts` (uses a temporary dev-only route `app/[locale]/_kit/page.tsx` that is **deleted at the end of this task** — its only purpose is to exercise Modal/Button in isolation before the real consumers exist)

**Interfaces:**
- Produces:
  - `Container({ children, className?, as? })`
  - `Button({ variant?: "solid"|"outline"|"ghost"; size?: "md"|"lg"; href?: string; external?: boolean; onClick?; type?; children; className?; ariaLabel? })` — renders `Link` when `href` is internal, `<a target=_blank rel=noopener noreferrer>` when `external`, otherwise `<button>`.
  - `Reveal({ children, delay?, className?, as? })`
  - `Modal({ open, onClose, labelledBy, children, tone?: "light"|"dark", maxWidth?: string, returnFocusTo?: HTMLElement|null })`
  - `Annotated({ children, kind?: "ellipse"|"strike", delay? })`
  - `Providers({ children })` — `MotionConfig reducedMotion="user"`
  - `lib/motion.ts`: `reveal`, `stagger`, `lift`, `bob`, `draw` variants.

- [ ] **Step 1: Create `lib/motion.ts`**

```ts
import type { Variants, Transition } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const lift = {
  whileHover: { y: -4, boxShadow: "var(--shadow-hover)" },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.25, ease: EASE_OUT } as Transition,
};

export const bob = (delay = 0): { animate: Record<string, unknown>; transition: Transition } => ({
  animate: { y: [0, -6, 0] },
  transition: { duration: 5, ease: "easeInOut", repeat: Infinity, delay },
});

export const draw = (delay = 0.4) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { duration: 0.8, ease: EASE_OUT, delay }, opacity: { duration: 0.1, delay } },
});

export const viewportOnce = { once: true, margin: "-10%" } as const;
```

- [ ] **Step 2: Create `components/layout/Providers.tsx`**

```tsx
"use client";
import { MotionConfig } from "motion/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

- [ ] **Step 3: Create `Container`**

`components/ui/Container.module.css`:

```css
.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
}
```

`components/ui/Container.tsx`:

```tsx
import styles from "./Container.module.css";

type Props = { children: React.ReactNode; className?: string; as?: "div" | "section" | "nav" | "footer" };

export default function Container({ children, className, as: Tag = "div" }: Props) {
  return <Tag className={[styles.container, className].filter(Boolean).join(" ")}>{children}</Tag>;
}
```

- [ ] **Step 4: Create `Button`**

`components/ui/Button.module.css`:

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: var(--font-body); font-weight: 600; line-height: 1;
  border-radius: var(--radius-pill); border: 1.5px solid transparent;
  white-space: nowrap; cursor: pointer;
  transition: background var(--dur) var(--ease-out), color .2s, border-color .2s, transform .2s var(--ease-out), box-shadow .2s;
}
.btn:disabled { opacity: .55; cursor: not-allowed; }
.md { font-size: 14px; padding: 12px 18px; }
.lg { font-size: 16px; padding: 16px 24px; }

.solid { background: var(--brand); color: #fff; }
.solid:hover:not(:disabled) { background: var(--brand-deep); transform: translateY(-1px); }

.outline { background: transparent; color: var(--ink); border-color: var(--mist); }
.outline:hover:not(:disabled) { border-color: var(--ink); }
.onDark.outline { color: #fff; border-color: rgba(255,255,255,.35); }
.onDark.outline:hover:not(:disabled) { border-color: #fff; }

.ghost { background: transparent; color: var(--ink); padding-inline: 10px; }
.ghost:hover:not(:disabled) { background: var(--cream); }
.onDark.ghost { color: #fff; }
.onDark.ghost:hover:not(:disabled) { background: rgba(255,255,255,.1); }
```

`components/ui/Button.tsx`:

```tsx
import { Link } from "@/lib/routing";
import styles from "./Button.module.css";

type Common = {
  variant?: "solid" | "outline" | "ghost";
  size?: "md" | "lg";
  onDark?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};
type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & { href?: undefined; external?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };
export type ButtonProps = AsLink | AsButton;

export default function Button(props: ButtonProps) {
  const { variant = "solid", size = "md", onDark, className, children, ariaLabel } = props;
  const cls = [styles.btn, styles[variant], styles[size], onDark && styles.onDark, className]
    .filter(Boolean)
    .join(" ");

  if (props.href) {
    if (props.external) {
      return (
        <a className={cls} href={props.href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={props.href} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Create `Reveal`**

`components/ui/Reveal.tsx`:

```tsx
"use client";
import { motion } from "motion/react";
import { reveal, viewportOnce } from "@/lib/motion";

type Props = { children: React.ReactNode; delay?: number; className?: string };

export default function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 6: Create `Modal`**

`components/ui/Modal.module.css`:

```css
.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(15, 14, 13, .6);
  display: grid; place-items: center; padding: 16px;
}
.dialog {
  position: relative; width: 100%;
  background: var(--paper); color: var(--ink);
  border-radius: var(--radius-panel);
  box-shadow: 0 40px 80px -30px rgba(15,14,13,.6);
  max-height: calc(100vh - 32px); overflow: auto;
}
.dark { background: var(--ink); color: #fff; }
.close {
  position: absolute; top: 14px; right: 14px; z-index: 1;
  width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(15,14,13,.06); color: inherit; font-size: 20px; line-height: 1;
}
.dark .close { background: rgba(255,255,255,.12); }
.close:hover { background: var(--brand-soft); color: var(--brand-deep); }
```

`components/ui/Modal.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
  maxWidth?: string;
  closeLabel: string;
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, labelledBy, children, tone = "light", maxWidth = "560px", closeLabel }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element that is not the close button, else the dialog.
    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const initial = focusables().find((el) => !el.hasAttribute("data-modal-close")) ?? dialogRef.current;
    initial?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={[styles.dialog, tone === "dark" && styles.dark].filter(Boolean).join(" ")}
            style={{ maxWidth }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel} data-modal-close>
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 7: Create `Annotated`**

`components/ui/Annotated.module.css`:

```css
.wrap { position: relative; display: inline-block; white-space: nowrap; }
.svg { position: absolute; inset: -0.18em -0.25em; width: calc(100% + 0.5em); height: calc(100% + 0.36em); overflow: visible; pointer-events: none; }
.path { fill: none; stroke: var(--brand); stroke-width: 6; stroke-linecap: round; vector-effect: non-scaling-stroke; }
```

`components/ui/Annotated.tsx`:

```tsx
"use client";
import { motion } from "motion/react";
import { draw } from "@/lib/motion";
import styles from "./Annotated.module.css";

type Props = { children: React.ReactNode; kind?: "ellipse" | "strike"; delay?: number };

// Hand-drawn feel: slightly open ellipse, or a wobbly strike-through. viewBox is 200x60, preserveAspectRatio none stretches it to the word.
const PATHS = {
  ellipse: "M 30 8 C 90 -4, 190 2, 194 26 C 198 50, 120 62, 60 56 C 12 52, -2 30, 24 14",
  strike: "M 4 34 C 60 26, 120 30, 196 24",
};

export default function Annotated({ children, kind = "ellipse", delay }: Props) {
  return (
    <span className={styles.wrap}>
      {children}
      <svg className={styles.svg} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
        <motion.path className={styles.path} d={PATHS[kind]} {...draw(delay)} />
      </svg>
    </span>
  );
}
```

- [ ] **Step 8: Temporary kit page + e2e**

Create `app/[locale]/_kit/page.tsx` (temporary — deleted in Step 11):

```tsx
"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Annotated from "@/components/ui/Annotated";

export default function KitPage() {
  const [open, setOpen] = useState(false);
  return (
    <main style={{ padding: 40 }}>
      <h1>Kit <Annotated>test</Annotated></h1>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Button href="/pricing" variant="outline">Pricing</Button>
      <Modal open={open} onClose={() => setOpen(false)} labelledBy="kit-title" closeLabel="Close">
        <div style={{ padding: 32 }}>
          <h2 id="kit-title">Kit modal</h2>
          <input aria-label="first" />
          <button type="button">last</button>
        </div>
      </Modal>
    </main>
  );
}
```

Create `e2e/ui-kit.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("modal opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
  await page.goto("/_kit");
  const trigger = page.getByRole("button", { name: "Open modal" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Kit modal" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("first")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "last" })).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Button renders a link for href", async ({ page }) => {
  await page.goto("/_kit");
  await expect(page.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
});
```

- [ ] **Step 9: Wire `Providers` into the locale layout** (needed so `motion` has its config)

`app/[locale]/layout.tsx` body becomes:

```tsx
import Providers from "@/components/layout/Providers";
// ...
      <body>
        <NextIntlClientProvider>
          <Providers>
            <Header />
            {children}
            <Footer />
            <WhatsAppWidget />
          </Providers>
        </NextIntlClientProvider>
      </body>
```

- [ ] **Step 10: Run e2e and typecheck**

Run: `npx tsc --noEmit` → no errors.
Run: `npx playwright test e2e/ui-kit.spec.ts` → PASS.

- [ ] **Step 11: Delete the temporary kit page, keep the spec pointing at a real consumer later**

Delete `app/[locale]/_kit/page.tsx` and `e2e/ui-kit.spec.ts` (Modal/Button are re-tested through `demo-modal.spec.ts` and `header.spec.ts` in later tasks). Run `npx tsc --noEmit` again.

- [ ] **Step 12: Commit**

```bash
git add lib/motion.ts components/ui components/layout/Providers.tsx "app/[locale]/layout.tsx"
git commit -m "feat(redesign): UI kit (Container, Button, Reveal, Modal, Annotated) and MotionConfig provider"
```

---

### Task 4: Messages (EN + ES) and the sync script

**Files:**
- Modify: `messages/en.json`, `messages/es.json`
- Create: `scripts/sync-messages.mjs`
- Modify: `package.json` (script `sync:messages`)
- Test: `scripts/sync-messages.test.mjs` run with `node --test`

**Interfaces:**
- Produces the keys below. Later tasks call `t("nav.products")`, `t("services.menu.title")`, etc. Keys must match exactly.

- [ ] **Step 1: Add keys to `messages/en.json`**

Merge into the existing objects (keep every existing key; `nav.demo` already exists as "Request a demo", keep it). Add:

```json
{
  "nav": {
    "products": "Products",
    "clients": "Clients",
    "resources": "Resources",
    "clientAccess": "Client login",
    "openMenu": "Open menu",
    "closeMenu": "Close menu",
    "language": "Choose language",
    "mega": {
      "productsTitle": "Everything we run for you",
      "clientsFeatured": "Bálamo Restaurante",
      "clientsFeaturedLine": "Their menu, their look, on the web and on the VIP tablets.",
      "clientsFeaturedCta": "See the case",
      "clientsAll": "All case studies",
      "clientsVideos": "Video reviews",
      "tutorials": "Tutorials",
      "faq": "FAQ",
      "aiCompare": "Compare with AI",
      "contact": "Contact"
    }
  },
  "services": {
    "menu": { "title": "Digital menu", "line": "On your site, in your style, to the pixel." },
    "ai": { "title": "Dashboard + AI", "line": "Change the whole menu in one sentence." },
    "ordering": { "title": "Ordering", "line": "Wired to your POS, printers and pay-at-table." },
    "training": { "title": "Training & support", "line": "Unlimited. With videos of the whole dashboard." },
    "multi": { "title": "Multi-venue", "line": "One dashboard. All your venues." },
    "reviews": { "title": "Smart reviews", "line": "Good ones go to Google. Bad ones come to you first." },
    "daily": { "title": "Daily menu", "line": "Change it every morning from your phone." },
    "translate": { "title": "AI translations", "line": "Whole menu, every language, one click." }
  },
  "footer": {
    "colProduct": "Product",
    "colCompany": "Company",
    "colResources": "Resources",
    "colLegal": "Legal",
    "colContact": "Contact",
    "privacy": "Privacy",
    "cookies": "Cookies",
    "terms": "Terms",
    "whatsappEs": "WhatsApp Spain",
    "whatsappIe": "WhatsApp Ireland",
    "madeIn": "Made in Dublin and Madrid",
    "copyright": "© {year} Dimonova. All rights reserved."
  },
  "modal": {
    "demo": {
      "title": "Book your demo",
      "lead": "We'll write to you today and run it whenever suits you.",
      "name": "Your name",
      "email": "Email",
      "venue": "Restaurant name",
      "phone": "Phone (optional)",
      "locations": "How many venues?",
      "locations1": "1",
      "locations2": "2–5",
      "locations6": "6+",
      "menuToday": "How is your menu today? (optional)",
      "menuPdf": "PDF / paper",
      "menuWeb": "On my website",
      "menuOther": "Another system",
      "submit": "Book demo",
      "sending": "Sending…",
      "successTitle": "Done. We'll write to you today.",
      "successBody": "Check your inbox (and spam, just in case).",
      "close": "Close",
      "errorTitle": "That didn't go through.",
      "errorBody": "Try again, or message us on WhatsApp.",
      "retry": "Try again",
      "whatsapp": "Open WhatsApp",
      "errRequired": "Required",
      "errEmail": "Enter a valid email"
    },
    "video": { "close": "Close video", "unavailable": "Can't play this right now.", "openDirect": "Open the video" }
  },
  "banner": { "change": "Switch", "close": "Dismiss" },
  "notFound": {
    "title": "This dish isn't on the menu.",
    "body": "We may have moved it, or it never existed. Try one of these.",
    "home": "Back to home",
    "products": "See products",
    "demo": "Book a demo",
    "menuHint": "Looking for a restaurant's menu? Menus live on each restaurant's own domain, not here."
  },
  "legal": {
    "privacy": { "title": "Privacy policy" },
    "cookies": { "title": "Cookie policy" },
    "terms": { "title": "Terms of service" },
    "placeholder": "This page is being written. Contact us at {email} if you need it now."
  }
}
```

- [ ] **Step 2: Add the same keys to `messages/es.json`**

```json
{
  "nav": {
    "products": "Productos",
    "clients": "Clientes",
    "resources": "Recursos",
    "clientAccess": "Acceso clientes",
    "openMenu": "Abrir menú",
    "closeMenu": "Cerrar menú",
    "language": "Elegir idioma",
    "mega": {
      "productsTitle": "Todo lo que gestionamos por ti",
      "clientsFeatured": "Bálamo Restaurante",
      "clientsFeaturedLine": "Su carta, su estética, en la web y en las tablets VIP.",
      "clientsFeaturedCta": "Ver el caso",
      "clientsAll": "Todos los casos",
      "clientsVideos": "Reseñas en vídeo",
      "tutorials": "Tutoriales",
      "faq": "Preguntas frecuentes",
      "aiCompare": "Compara con IA",
      "contact": "Contacto"
    }
  },
  "services": {
    "menu": { "title": "Carta digital", "line": "En tu web, con tu estética, al píxel." },
    "ai": { "title": "Panel + IA", "line": "Cambia toda la carta en una frase." },
    "ordering": { "title": "Comandero", "line": "Integrado con tu TPV, impresoras y pago en mesa." },
    "training": { "title": "Formación y soporte", "line": "Ilimitado. Con vídeos de todo el panel." },
    "multi": { "title": "Multirestaurante", "line": "Un panel. Todos tus locales." },
    "reviews": { "title": "Reseñas inteligentes", "line": "Las buenas a Google. Las malas, a ti primero." },
    "daily": { "title": "Menú del día", "line": "Cámbialo cada mañana desde el móvil." },
    "translate": { "title": "Traducciones con IA", "line": "Toda la carta, todos los idiomas, un clic." }
  },
  "footer": {
    "colProduct": "Producto",
    "colCompany": "Empresa",
    "colResources": "Recursos",
    "colLegal": "Legal",
    "colContact": "Contacto",
    "privacy": "Privacidad",
    "cookies": "Cookies",
    "terms": "Términos",
    "whatsappEs": "WhatsApp España",
    "whatsappIe": "WhatsApp Irlanda",
    "madeIn": "Hecho en Dublín y Madrid",
    "copyright": "© {year} Dimonova. Todos los derechos reservados."
  },
  "modal": {
    "demo": {
      "title": "Pide tu demo",
      "lead": "Te escribimos hoy y la hacemos cuando te venga bien.",
      "name": "Tu nombre",
      "email": "Email",
      "venue": "Nombre del restaurante",
      "phone": "Teléfono (opcional)",
      "locations": "¿Cuántos locales?",
      "locations1": "1",
      "locations2": "2–5",
      "locations6": "6+",
      "menuToday": "¿Cómo tienes la carta hoy? (opcional)",
      "menuPdf": "PDF / papel",
      "menuWeb": "En mi web",
      "menuOther": "Otro sistema",
      "submit": "Pedir demo",
      "sending": "Enviando…",
      "successTitle": "Hecho. Te escribimos hoy.",
      "successBody": "Revisa tu bandeja de entrada (y el spam, por si acaso).",
      "close": "Cerrar",
      "errorTitle": "No ha ido.",
      "errorBody": "Prueba otra vez o escríbenos por WhatsApp.",
      "retry": "Reintentar",
      "whatsapp": "Abrir WhatsApp",
      "errRequired": "Obligatorio",
      "errEmail": "Escribe un email válido"
    },
    "video": { "close": "Cerrar vídeo", "unavailable": "No se puede reproducir ahora.", "openDirect": "Abrir el vídeo" }
  },
  "banner": { "change": "Cambiar", "close": "Cerrar" },
  "notFound": {
    "title": "Este plato no está en la carta.",
    "body": "Puede que lo hayamos cambiado de sitio, o que nunca existiera. Pasa esto.",
    "home": "Volver al inicio",
    "products": "Ver productos",
    "demo": "Pedir demo",
    "menuHint": "¿Buscabas la carta de un restaurante? Las cartas viven en el dominio de cada restaurante, no aquí."
  },
  "legal": {
    "privacy": { "title": "Política de privacidad" },
    "cookies": { "title": "Política de cookies" },
    "terms": { "title": "Términos del servicio" },
    "placeholder": "Esta página se está redactando. Escríbenos a {email} si la necesitas ya."
  }
}
```

Do the merge with a one-off Node script rather than by hand (avoids JSON typos):

```bash
node -e "
const fs=require('fs');
const merge=(a,b)=>{for(const k of Object.keys(b)){a[k]=(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k]))?merge(a[k]??{},b[k]):b[k]}return a};
for(const [file,add] of [['messages/en.json','/tmp/add-en.json'],['messages/es.json','/tmp/add-es.json']]){
  const base=JSON.parse(fs.readFileSync(file,'utf8'));const extra=JSON.parse(fs.readFileSync(add,'utf8'));
  fs.writeFileSync(file,JSON.stringify(merge(base,extra),null,2)+'\n');
}"
```

(Write the two JSON blocks above to two temp files first and point the script at them; on this Windows machine use the session scratchpad directory, not `/tmp`.)

- [ ] **Step 3: Write the failing test for the sync script**

Create `scripts/sync-messages.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillMissing } from "./sync-messages.mjs";

test("copies only missing keys, deeply, without touching existing ones", () => {
  const en = { a: "A", nested: { x: "X", y: "Y" }, arr: ["1"] };
  const de = { a: "Ä", nested: { x: "Ẍ" } };
  const { result, added } = fillMissing(en, de);
  assert.deepEqual(result, { a: "Ä", nested: { x: "Ẍ", y: "Y" }, arr: ["1"] });
  assert.deepEqual(added, ["nested.y", "arr"]);
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `node --test scripts/sync-messages.test.mjs`
Expected: FAIL — cannot find `./sync-messages.mjs`.

- [ ] **Step 5: Create `scripts/sync-messages.mjs`**

```js
// Copies keys that exist in messages/en.json but are missing in the other locales.
// Usage: node scripts/sync-messages.mjs   (run after adding EN/ES copy)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export function fillMissing(source, target, prefix = "", added = []) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (!(key in result)) {
      result[key] = source[key];
      added.push(full);
    } else if (isObj(source[key]) && isObj(result[key])) {
      result[key] = fillMissing(source[key], result[key], full, added).result;
    }
  }
  return { result, added };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../messages");
  const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
  for (const locale of ["es", "de", "fr", "pt"]) {
    const file = path.join(dir, `${locale}.json`);
    const current = JSON.parse(fs.readFileSync(file, "utf8"));
    const { result, added } = fillMissing(en, current);
    fs.writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
    console.log(`${locale}: +${added.length}${added.length ? " → " + added.join(", ") : ""}`);
  }
}
```

Add to `package.json` scripts: `"sync:messages": "node scripts/sync-messages.mjs"`.

- [ ] **Step 6: Run the test, then the script**

Run: `node --test scripts/sync-messages.test.mjs` → PASS.
Run: `npm run sync:messages` → prints `es: +0`, `de: +N`, `fr: +N`, `pt: +N` (N = number of new keys).

- [ ] **Step 7: Verify all locales have identical key sets**

```bash
node -e "
const fs=require('fs');const keys=(o,p='')=>Object.keys(o).flatMap(k=>typeof o[k]==='object'&&!Array.isArray(o[k])?keys(o[k],p+k+'.'):[p+k]);
const en=new Set(keys(JSON.parse(fs.readFileSync('messages/en.json'))));
for(const l of ['es','de','fr','pt']){const s=new Set(keys(JSON.parse(fs.readFileSync('messages/'+l+'.json'))));const miss=[...en].filter(k=>!s.has(k));console.log(l,miss.length?miss:'ok')}"
```

Expected: `es ok`, `de ok`, `fr ok`, `pt ok`.

- [ ] **Step 8: Commit**

```bash
git add messages scripts/sync-messages.mjs scripts/sync-messages.test.mjs package.json
git commit -m "feat(redesign): shell copy (EN/ES) and message sync script"
```

---

### Task 5: Header, MegaMenu, MobileNav, LangSwitcher

**Files:**
- Create: `components/layout/Header.tsx` + `.module.css`, `components/layout/MegaMenu.tsx` + `.module.css`, `components/layout/MobileNav.tsx` + `.module.css`, `components/layout/LangSwitcher.tsx` + `.module.css`
- Modify: `app/[locale]/layout.tsx` (import from `@/components/layout/Header`)
- Delete: `components/Header.tsx`, `components/MobileNav.tsx`, `components/LangSwitcher.tsx`, `components/NavLink.tsx`
- Test: `e2e/header.spec.ts` (rewrite)

**Interfaces:**
- Consumes: `SERVICES`, `ServiceIcon`, `Button`, `Container`, `openDemo`, messages `nav.*`, `services.*`.
- Produces: `<header data-scrolled>` with `nav[aria-label="Main"]`; mega buttons `button[aria-expanded][aria-controls="mega-<key>"]`; panels `#mega-products`, `#mega-clients`, `#mega-resources`; mobile toggle `button[aria-label=nav.openMenu]`; LangSwitcher keeps `button[aria-label="Choose language"|"Elegir idioma"]` + option `button[data-lang]`.

- [ ] **Step 1: Rewrite `e2e/header.spec.ts` (failing)**

```ts
import { test, expect } from "@playwright/test";

test.describe("desktop header", () => {
  test("mega menu opens on hover and lists the 8 services", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("button", { name: "Products" });
    await products.hover();
    const panel = page.locator("#mega-products");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(8);
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features#menu");
    await expect(products).toHaveAttribute("aria-expanded", "true");
  });

  test("mega menu opens with keyboard and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const clients = page.getByRole("button", { name: "Clients" });
    await clients.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mega-clients")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mega-clients")).toBeHidden();
    await expect(clients).toBeFocused();
  });

  test("direct links and CTAs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    await expect(page.getByRole("link", { name: "Client login" })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
    await page.getByRole("banner").getByRole("button", { name: "Request a demo" }).click();
    await expect(page.getByRole("dialog", { name: "Book your demo" })).toBeVisible();
  });

  test("compacts on scroll", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("language switch changes URL locale", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[aria-label="Choose language"]').click();
    await page.locator("[data-lang='es']").first().click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 480, height: 900 } });

  test("hamburger opens a panel with accordions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Products" }).click();
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toBeVisible();
    await panel.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL("/pricing");
  });
});
```

(The demo-dialog assertion passes only after Task 7; run the rest now and re-run the whole file after Task 7.)

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test e2e/header.spec.ts`
Expected: FAIL — no button named "Products".

- [ ] **Step 3: Create `LangSwitcher`**

`components/layout/LangSwitcher.module.css`:

```css
.wrap { position: relative; }
.trigger {
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 12px; border-radius: var(--radius-pill);
  border: 1.5px solid var(--mist); font-size: 13px; font-weight: 600;
}
.trigger:hover { border-color: var(--ink); }
.menu {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 70;
  min-width: 190px; padding: 6px; background: var(--paper);
  border: 1px solid var(--mist); border-radius: 16px;
  box-shadow: 0 20px 40px -24px rgba(15,14,13,.3);
}
.item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; font-size: 14px; text-align: left;
}
.item:hover { background: var(--cream); }
.item[aria-current="true"] { color: var(--brand-deep); font-weight: 600; }
.code { width: 24px; font-weight: 600; font-size: 12px; letter-spacing: .04em; }
```

`components/layout/LangSwitcher.tsx`:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, routing } from "@/lib/routing";
import styles from "./LangSwitcher.module.css";

const LABELS: Record<string, string> = { en: "English", es: "Español", de: "Deutsch", fr: "Français", pt: "Português" };

export default function LangSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function pick(code: string) {
    setOpen(false);
    router.replace(pathname, { locale: code });
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">🌐</span>
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {routing.locales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              data-lang={code}
              aria-current={code === locale}
              className={styles.item}
              onClick={() => pick(code)}
            >
              <span className={styles.code}>{code.toUpperCase()}</span>
              <span>{LABELS[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Note: `routing` must be exported from `@/lib/routing` — it already is (`export const routing = defineRouting(...)`).

- [ ] **Step 4: Create `MegaMenu`**

`components/layout/MegaMenu.module.css`:

```css
.nav { display: flex; align-items: center; gap: 4px; }
.item {
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 14px; border-radius: var(--radius-pill);
  font-size: 14px; font-weight: 600; color: var(--ink);
}
.item:hover, .item[aria-expanded="true"], .item[aria-current="page"] { background: var(--cream); }
.chev { width: 10px; height: 10px; transition: transform .2s; }
.item[aria-expanded="true"] .chev { transform: rotate(180deg); }

.panel {
  position: absolute; left: 0; right: 0; top: 100%; z-index: 60;
  background: var(--paper); border-radius: 0 0 24px 24px;
  box-shadow: 0 30px 60px -30px rgba(15,14,13,.35);
  border-top: 1px solid var(--mist);
}
.inner { padding: 28px var(--gutter) 32px; }
.title { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-2); margin: 0 0 18px; }

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.card {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 14px; border-radius: 16px; color: var(--ink);
  transition: background .2s;
}
.card:hover { background: var(--cream); }
.icon {
  flex: none; width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; background: var(--brand-soft); color: var(--brand-deep);
}
.cardTitle { font-weight: 600; font-size: 15px; margin: 0 0 2px; }
.cardLine { font-size: 13px; color: var(--ink-2); margin: 0; line-height: 1.4; }

.clients { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
.featured {
  display: block; padding: 20px; border-radius: 20px; background: var(--ink); color: #fff;
}
.featured h3 { font-size: 22px; margin-bottom: 6px; }
.featured p { color: rgba(255,255,255,.75); margin: 0 0 14px; font-size: 14px; }
.featuredCta { font-weight: 600; color: var(--brand); }
.list { display: flex; flex-direction: column; gap: 4px; }
.list a { padding: 12px 14px; border-radius: 12px; font-weight: 600; font-size: 15px; color: var(--ink); }
.list a:hover { background: var(--cream); }
```

`components/layout/MegaMenu.tsx`:

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/lib/routing";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/icons/ServiceIcons";
import styles from "./MegaMenu.module.css";

type Key = "products" | "clients" | "resources";
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

function Chevron() {
  return (
    <svg className={styles.chev} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  );
}

export default function MegaMenu() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState<Key | null>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const buttons = useRef<Partial<Record<Key, HTMLButtonElement | null>>>({});

  const clearTimers = () => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); };
  const scheduleOpen = (key: Key) => { clearTimers(); openTimer.current = window.setTimeout(() => setOpen(key), OPEN_DELAY); };
  const scheduleClose = () => { clearTimers(); closeTimer.current = window.setTimeout(() => setOpen(null), CLOSE_DELAY); };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const close = useCallback((restoreTo?: Key) => {
    clearTimers();
    setOpen(null);
    if (restoreTo) buttons.current[restoreTo]?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(open); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => clearTimers(), []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const trigger = (key: Key, label: string) => (
    <button
      type="button"
      ref={(el) => { buttons.current[key] = el; }}
      className={styles.item}
      aria-expanded={open === key}
      aria-controls={`mega-${key}`}
      onMouseEnter={() => scheduleOpen(key)}
      onMouseLeave={scheduleClose}
      onClick={() => (open === key ? close(key) : (clearTimers(), setOpen(key)))}
    >
      {label}
      <Chevron />
    </button>
  );

  const link = (href: string, label: string) => (
    <Link href={href} className={styles.item} aria-current={isActive(href) ? "page" : undefined} onMouseEnter={scheduleClose}>
      {label}
    </Link>
  );

  return (
    <>
      <nav className={styles.nav} aria-label="Main">
        {trigger("products", t("nav.products"))}
        {link("/pricing", t("nav.pricing"))}
        {trigger("clients", t("nav.clients"))}
        {trigger("resources", t("nav.resources"))}
        {link("/about", t("nav.about"))}
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            id={`mega-${open}`}
            className={styles.panel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className={styles.inner}>
              {open === "products" && (
                <>
                  <p className={styles.title}>{t("nav.mega.productsTitle")}</p>
                  <div className={styles.grid}>
                    {SERVICES.map((s) => (
                      <Link key={s.slug} href={s.href} className={styles.card} onClick={() => close()}>
                        <span className={styles.icon}><ServiceIcon slug={s.slug} size={22} /></span>
                        <span>
                          <p className={styles.cardTitle}>{t(`services.${s.slug}.title`)}</p>
                          <p className={styles.cardLine}>{t(`services.${s.slug}.line`)}</p>
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {open === "clients" && (
                <div className={styles.clients}>
                  <Link href="/cases" className={styles.featured} onClick={() => close()}>
                    <h3>{t("nav.mega.clientsFeatured")}</h3>
                    <p>{t("nav.mega.clientsFeaturedLine")}</p>
                    <span className={styles.featuredCta}>{t("nav.mega.clientsFeaturedCta")} →</span>
                  </Link>
                  <div className={styles.list}>
                    <Link href="/cases" onClick={() => close()}>{t("nav.mega.clientsAll")}</Link>
                    <Link href="/#reviews" onClick={() => close()}>{t("nav.mega.clientsVideos")}</Link>
                  </div>
                </div>
              )}
              {open === "resources" && (
                <div className={styles.list} style={{ maxWidth: 360 }}>
                  <Link href="/features#training" onClick={() => close()}>{t("nav.mega.tutorials")}</Link>
                  <Link href="/pricing#faq" onClick={() => close()}>{t("nav.mega.faq")}</Link>
                  <Link href="/#ai-compare" onClick={() => close()}>{t("nav.mega.aiCompare")}</Link>
                  <Link href="/contact" onClick={() => close()}>{t("nav.mega.contact")}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 5: Create `MobileNav`**

`components/layout/MobileNav.module.css`:

```css
.toggle {
  display: none; width: 44px; height: 44px; border-radius: 12px;
  border: 1.5px solid var(--mist); place-items: center;
}
.bars { display: flex; flex-direction: column; gap: 5px; }
.bars span { width: 18px; height: 2px; background: var(--ink); border-radius: 2px; }

.panel {
  position: fixed; inset: 0; z-index: 90; background: var(--paper);
  display: flex; flex-direction: column; overflow: auto;
}
.top { display: flex; align-items: center; justify-content: space-between; padding: 14px var(--gutter); border-bottom: 1px solid var(--mist); }
.close { width: 44px; height: 44px; border-radius: 12px; border: 1.5px solid var(--mist); font-size: 22px; }
.body { padding: 8px var(--gutter) 24px; flex: 1; }
.row { border-bottom: 1px solid var(--mist); }
.rowBtn, .rowLink {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 18px 4px; font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--ink); text-align: left;
}
.sub { display: flex; flex-direction: column; padding: 0 4px 12px; gap: 2px; }
.sub a { padding: 10px 8px; border-radius: 10px; font-size: 16px; font-weight: 500; color: var(--ink); }
.sub a:hover { background: var(--cream); }
.ctas { display: flex; flex-direction: column; gap: 10px; padding: 16px var(--gutter) 24px; border-top: 1px solid var(--mist); }
.chev { transition: transform .2s; }
.open .chev { transform: rotate(180deg); }

@media (max-width: 959px) { .toggle { display: grid; } }
```

`components/layout/MobileNav.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/lib/routing";
import { SERVICES } from "@/lib/services";
import { openDemo } from "@/lib/events";
import Button from "@/components/ui/Button";
import LangSwitcher from "./LangSwitcher";
import styles from "./MobileNav.module.css";

type Key = "products" | "clients" | "resources";

export default function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Key | null>("products");

  // Close when the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const acc = (key: Key, label: string, children: React.ReactNode) => (
    <div className={[styles.row, section === key && styles.open].filter(Boolean).join(" ")}>
      <button type="button" className={styles.rowBtn} aria-expanded={section === key} onClick={() => setSection(section === key ? null : key)}>
        {label}
        <svg className={styles.chev} width="14" height="14" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 3.5l3 3 3-3" /></svg>
      </button>
      {section === key && <div className={styles.sub}>{children}</div>}
    </div>
  );

  return (
    <>
      <button type="button" className={styles.toggle} aria-label={t("nav.openMenu")} aria-expanded={open} onClick={() => setOpen(true)}>
        <span className={styles.bars}><span /><span /><span /></span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.top}>
              <img src="/assets/logo_horizontal.svg" alt="Dimonova" height={40} width={100} />
              <button type="button" className={styles.close} aria-label={t("nav.closeMenu")} onClick={() => setOpen(false)}>×</button>
            </div>
            <div className={styles.body}>
              {acc("products", t("nav.products"),
                SERVICES.map((s) => <Link key={s.slug} href={s.href}>{t(`services.${s.slug}.title`)}</Link>))}
              <div className={styles.row}><Link className={styles.rowLink} href="/pricing">{t("nav.pricing")}</Link></div>
              {acc("clients", t("nav.clients"), (
                <>
                  <Link href="/cases">{t("nav.mega.clientsFeatured")}</Link>
                  <Link href="/cases">{t("nav.mega.clientsAll")}</Link>
                  <Link href="/#reviews">{t("nav.mega.clientsVideos")}</Link>
                </>
              ))}
              {acc("resources", t("nav.resources"), (
                <>
                  <Link href="/features#training">{t("nav.mega.tutorials")}</Link>
                  <Link href="/pricing#faq">{t("nav.mega.faq")}</Link>
                  <Link href="/#ai-compare">{t("nav.mega.aiCompare")}</Link>
                  <Link href="/contact">{t("nav.mega.contact")}</Link>
                </>
              ))}
              <div className={styles.row}><Link className={styles.rowLink} href="/about">{t("nav.about")}</Link></div>
            </div>
            <div className={styles.ctas}>
              <Button size="lg" onClick={() => { setOpen(false); openDemo({ source: "header" }); }}>{t("nav.demo")}</Button>
              <Button size="lg" variant="outline" href="https://menuadmin.dimonova.com" external>{t("nav.clientAccess")}</Button>
              <LangSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 6: Create `Header`**

`components/layout/Header.module.css`:

```css
.header {
  position: sticky; top: 0; z-index: 80;
  background: var(--paper);
  border-radius: 0 0 24px 24px;
  transition: box-shadow .25s, height .25s var(--ease-out);
}
.header[data-scrolled="true"] { box-shadow: 0 10px 30px -20px rgba(15,14,13,.35); }
.bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  height: var(--header-h); transition: height .25s var(--ease-out);
}
.header[data-scrolled="true"] .bar { height: 56px; }
.logo { display: flex; align-items: center; }
.logo img { height: 40px; width: auto; transition: height .25s var(--ease-out); }
.header[data-scrolled="true"] .logo img { height: 32px; }
.center { display: flex; }
.right { display: flex; align-items: center; gap: 8px; }
@media (max-width: 959px) {
  .center, .right { display: none; }
}
```

`components/layout/Header.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/routing";
import { openDemo } from "@/lib/events";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MegaMenu from "./MegaMenu";
import MobileNav from "./MobileNav";
import LangSwitcher from "./LangSwitcher";
import styles from "./Header.module.css";

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <Container>
        <div className={styles.bar}>
          <Link href="/" className={styles.logo} aria-label="Dimonova">
            <img src="/assets/logo_horizontal.svg" alt="Dimonova" width={100} height={40} />
          </Link>
          <div className={styles.center}>
            <MegaMenu />
          </div>
          <div className={styles.right}>
            <LangSwitcher />
            <Button variant="outline" href="https://menuadmin.dimonova.com" external>{t("clientAccess")}</Button>
            <Button onClick={() => openDemo({ source: "header" })}>{t("demo")}</Button>
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
```

Note: the header is `position: sticky` and the mega panel is `position: absolute; top: 100%` relative to the header — add `position: relative` is implicit for sticky, so panels align under the bar and span the full header width.

- [ ] **Step 7: Swap imports in the layout and delete the old shell**

`app/[locale]/layout.tsx`: `import Header from "@/components/layout/Header";`

Delete `components/Header.tsx`, `components/MobileNav.tsx`, `components/LangSwitcher.tsx`, `components/NavLink.tsx`. Run `npx tsc --noEmit` — if anything else imported `NavLink`, fix it (grep confirmed only the old shell did).

- [ ] **Step 8: Run tests**

Run: `npx playwright test e2e/header.spec.ts`
Expected: all PASS except "direct links and CTAs" (dialog assertion; passes after Task 7). Run `npx playwright test e2e/smoke.spec.ts e2e/pages.spec.ts` to confirm the inner pages still render.

- [ ] **Step 9: Commit**

```bash
git add components/layout "app/[locale]/layout.tsx" e2e/header.spec.ts
git rm components/Header.tsx components/MobileNav.tsx components/LangSwitcher.tsx components/NavLink.tsx
git commit -m "feat(redesign): header with hover mega-menu, mobile accordion nav, restyled language switcher"
```

---

### Task 6: Footer with giant wordmark + placeholder legal pages

**Files:**
- Create: `components/layout/Footer.tsx` + `.module.css`, `app/[locale]/legal/[slug]/page.tsx`
- Modify: `app/[locale]/layout.tsx` (import), `app/sitemap.ts` (add legal routes)
- Delete: `components/Footer.tsx`
- Test: `e2e/footer.spec.ts` (new), `e2e/footer-wa.spec.ts` (trim)

**Interfaces:**
- Consumes: `SERVICES`, `CONTACT`, `Container`, `Reveal`, `LangSwitcher`, messages `footer.*`, `services.*`, `nav.*`, `legal.*`.
- Produces: `<footer>` with `nav[aria-label="Footer"]`, wordmark `[data-wordmark]`, legal routes `/legal/privacy`, `/legal/cookies`, `/legal/terms`.

- [ ] **Step 1: Write failing tests**

Create `e2e/footer.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("footer has 5 columns, service links, legal links and the wordmark", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("heading", { level: 2 })).toHaveCount(5);
  await expect(footer.getByRole("link", { name: "Digital menu" })).toHaveAttribute("href", "/features#menu");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/legal/privacy");
  await expect(footer.getByRole("link", { name: "WhatsApp Spain" })).toHaveAttribute("href", /wa\.me\/34/);
  await expect(footer.locator("[data-wordmark]")).toHaveText("DIMONOVA");
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Dimonova`);
});

test("legal placeholder pages render in both locales", async ({ page }) => {
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy policy");
  await page.goto("/es/legal/cookies");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de cookies");
});
```

Edit `e2e/footer-wa.spec.ts`: delete the tests `"footer renders tagline"` and `"header WhatsApp button opens widget"` (tagline and header WA button no longer exist). Keep `"whatsapp widget toggles open"`.

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test e2e/footer.spec.ts` → FAIL (headings count 0).

- [ ] **Step 3: Create the Footer**

`components/layout/Footer.module.css`:

```css
.footer { background: var(--ink); color: rgba(255,255,255,.72); overflow: hidden; }
.top { padding: 72px 0 40px; }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 32px; }
.col h2 { font-family: var(--font-body); font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.5); margin: 0 0 16px; }
.col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.col a { color: rgba(255,255,255,.85); font-size: 14px; }
.col a:hover { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
.lang { margin-top: 16px; }
.lang :global(button) { color: #fff; border-color: rgba(255,255,255,.3); }
.rule { border: 0; border-top: 1px solid rgba(255,255,255,.12); margin: 40px 0 20px; }
.meta { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12px; color: rgba(255,255,255,.5); }
.wordmark {
  display: block; margin: 24px 0 -0.16em; padding: 0;
  font-family: var(--font-display); font-weight: 800; line-height: .8;
  font-size: clamp(64px, 18vw, 320px); letter-spacing: -0.04em;
  color: rgba(255,255,255,.95); text-align: center; user-select: none;
}
@media (max-width: 959px) { .grid { grid-template-columns: repeat(2, 1fr); } }
```

`components/layout/Footer.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/routing";
import { CONTACT } from "@/lib/config";
import { SERVICES } from "@/lib/services";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import LangSwitcher from "./LangSwitcher";
import styles from "./Footer.module.css";

export default async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <nav className={styles.grid} aria-label="Footer">
            <div className={styles.col}>
              <h2>{t("footer.colProduct")}</h2>
              <ul>
                {SERVICES.map((s) => (
                  <li key={s.slug}><Link href={s.href}>{t(`services.${s.slug}.title`)}</Link></li>
                ))}
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colCompany")}</h2>
              <ul>
                <li><Link href="/about">{t("nav.about")}</Link></li>
                <li><Link href="/cases">{t("nav.clients")}</Link></li>
                <li><Link href="/pricing">{t("nav.pricing")}</Link></li>
                <li><Link href="/contact">{t("nav.contact")}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colResources")}</h2>
              <ul>
                <li><Link href="/features#training">{t("nav.mega.tutorials")}</Link></li>
                <li><Link href="/pricing#faq">{t("nav.mega.faq")}</Link></li>
                <li><Link href="/#ai-compare">{t("nav.mega.aiCompare")}</Link></li>
                <li><a href="https://menuadmin.dimonova.com" target="_blank" rel="noopener noreferrer">{t("nav.clientAccess")}</a></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colLegal")}</h2>
              <ul>
                <li><Link href="/legal/privacy">{t("footer.privacy")}</Link></li>
                <li><Link href="/legal/cookies">{t("footer.cookies")}</Link></li>
                <li><Link href="/legal/terms">{t("footer.terms")}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colContact")}</h2>
              <ul>
                <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><a href={CONTACT.whatsappES} target="_blank" rel="noopener noreferrer">{t("footer.whatsappEs")}</a></li>
                <li><a href={CONTACT.whatsappIE} target="_blank" rel="noopener noreferrer">{t("footer.whatsappIe")}</a></li>
              </ul>
              <div className={styles.lang}><LangSwitcher /></div>
            </div>
          </nav>
          <hr className={styles.rule} />
          <div className={styles.meta}>
            <span>{t("footer.copyright", { year })}</span>
            <span>{t("footer.madeIn")}</span>
          </div>
        </div>
        <Reveal>
          <div className={styles.wordmark} data-wordmark aria-hidden="true">DIMONOVA</div>
        </Reveal>
      </Container>
    </footer>
  );
}
```

Note (deviation from spec §6, recorded on purpose): the wordmark is rendered as display-font text, not an SVG, because the current `logo_horizontal.svg` is a traced bitmap with filters and is not clean lettering. Phase 3 (content) can swap in a proper SVG if one is produced; the `[data-wordmark]` hook stays.

- [ ] **Step 4: Legal placeholder route**

Create `app/[locale]/legal/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/routing";
import { CONTACT } from "@/lib/config";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";

const SLUGS = ["privacy", "cookies", "terms"] as const;
type Slug = (typeof SLUGS)[number];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) return {};
  return pageMetadata(locale, `/legal/${slug}`, `legal.${slug}.title`, "seo.home.desc");
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <main>
      <Container>
        <div style={{ padding: "80px 0 120px", maxWidth: 720 }}>
          <h1>{t(`${slug as Slug}.title`)}</h1>
          <p style={{ marginTop: 24, color: "var(--ink-2)", fontSize: "var(--text-lead)" }}>
            {t("placeholder", { email: CONTACT.email })}
          </p>
        </div>
      </Container>
    </main>
  );
}
```

Add the three paths to the `PAGES` array in `app/sitemap.ts`:

```ts
  { path: "/legal/privacy", priority: 0.3 },
  { path: "/legal/cookies", priority: 0.3 },
  { path: "/legal/terms", priority: 0.3 },
```

- [ ] **Step 5: Swap the layout import and delete the old footer**

`app/[locale]/layout.tsx`: `import Footer from "@/components/layout/Footer";` then `git rm components/Footer.tsx`. `OpenWAButton.tsx` stays (used by legacy home sections).

- [ ] **Step 6: Run tests**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test e2e/footer.spec.ts e2e/footer-wa.spec.ts e2e/seo.spec.ts` → PASS.

- [ ] **Step 7: Commit**

```bash
git add components/layout/Footer.tsx components/layout/Footer.module.css "app/[locale]/legal" app/sitemap.ts "app/[locale]/layout.tsx" e2e/footer.spec.ts e2e/footer-wa.spec.ts
git rm components/Footer.tsx
git commit -m "feat(redesign): footer with giant wordmark, placeholder legal pages"
```

---

### Task 7: DemoModal + API extension

**Files:**
- Create: `components/DemoModal.tsx` + `.module.css`
- Modify: `app/api/contact/route.ts`, `app/[locale]/layout.tsx`
- Test: `e2e/demo-modal.spec.ts`

**Interfaces:**
- Consumes: `Modal`, `Button`, `useWindowEvent`, `DEMO_OPEN`, `DemoOpenPayload`, `CONTACT`, messages `modal.demo.*`.
- Produces: dialog `role=dialog` named by `modal.demo.title`; form fields `name`, `email`, `venue`, `phone`, `locations` (radio), `menuToday` (radio), hidden `locale`, `source`, `vtype=restaurant`; API accepts `locations`, `menuToday`, `source`.

- [ ] **Step 1: Write failing e2e**

Create `e2e/demo-modal.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const open = (page: import("@playwright/test").Page, detail: Record<string, string> = {}) =>
  page.evaluate((d) => window.dispatchEvent(new CustomEvent("demo:open", { detail: d })), detail);

test("opens with prefilled email and focuses the name field", async ({ page }) => {
  await page.goto("/");
  await open(page, { email: "ana@bar.es", source: "hero" });
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");
  await expect(dialog.getByLabel("Your name")).toBeFocused();
});

test("validates required fields inline", async ({ page }) => {
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Required")).toHaveCount(3);
  await dialog.getByLabel("Email").fill("nope");
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Enter a valid email")).toBeVisible();
});

test("submits to /api/contact and shows success", async ({ page }) => {
  let posted: Record<string, string> = {};
  await page.route("**/api/contact", async (route) => {
    const body = route.request().postDataBuffer()?.toString("utf8") ?? "";
    // multipart: just assert the field names are present
    posted = Object.fromEntries(["name", "email", "venue", "locations", "menuToday", "source", "vtype", "locale"].map((k) => [k, body.includes(`name="${k}"`) ? "yes" : "no"]));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/");
  await open(page, { source: "header" });
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByLabel("Your name").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Restaurant name").fill("Bar Ana");
  await dialog.getByLabel("2–5").check();
  await dialog.getByLabel("On my website").check();
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Done. We'll write to you today.")).toBeVisible();
  expect(posted).toEqual({ name: "yes", email: "yes", venue: "yes", locations: "yes", menuToday: "yes", source: "yes", vtype: "yes", locale: "yes" });
});

test("shows the error state with WhatsApp fallback on 500", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.goto("/es");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Pide tu demo" });
  await dialog.getByLabel("Tu nombre").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Nombre del restaurante").fill("Bar Ana");
  await dialog.getByRole("button", { name: "Pedir demo" }).click();
  await expect(dialog.getByText("No ha ido.")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Abrir WhatsApp" })).toHaveAttribute("href", /wa\.me\/34/);
  await dialog.getByRole("button", { name: "Reintentar" }).click();
  await expect(dialog.getByLabel("Tu nombre")).toHaveValue("Ana");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test e2e/demo-modal.spec.ts` → FAIL (no dialog).

- [ ] **Step 3: Create `DemoModal`**

`components/DemoModal.module.css`:

```css
.body { padding: 40px 36px 36px; }
.title { font-size: 32px; margin-bottom: 6px; }
.lead { color: var(--ink-2); margin: 0 0 24px; }
.form { display: grid; gap: 16px; }
.field { display: grid; gap: 6px; }
.label { font-size: 13px; font-weight: 600; }
.input {
  height: 48px; padding: 0 14px; border-radius: 14px; border: 1.5px solid var(--mist);
  background: var(--cream); font-size: 15px;
}
.input:focus { outline: none; border-color: var(--ink); background: #fff; }
.input[aria-invalid="true"] { border-color: var(--brand); }
.err { font-size: 12px; color: var(--brand-deep); }
.pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { position: relative; }
.pill input { position: absolute; inset: 0; opacity: 0; }
.pill span {
  display: inline-flex; align-items: center; height: 40px; padding: 0 16px;
  border-radius: var(--radius-pill); border: 1.5px solid var(--mist); font-size: 14px; font-weight: 600;
}
.pill input:checked + span { background: var(--ink); color: #fff; border-color: var(--ink); }
.pill input:focus-visible + span { outline: 3px solid var(--brand); outline-offset: 3px; }
.actions { margin-top: 8px; display: grid; }
.state { text-align: center; padding: 24px 0 8px; }
.tick { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: var(--ok); color: #fff; display: grid; place-items: center; font-size: 30px; }
.stateActions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
@media (max-width: 560px) { .body { padding: 32px 20px 24px; } .title { font-size: 26px; } }
```

`components/DemoModal.tsx`:

```tsx
"use client";
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { DEMO_OPEN, useWindowEvent, type DemoOpenPayload } from "@/lib/events";
import { CONTACT } from "@/lib/config";
import styles from "./DemoModal.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "venue", string>>;

export default function DemoModal() {
  const t = useTranslations("modal.demo");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  useWindowEvent<DemoOpenPayload>(DEMO_OPEN, useCallback((d) => {
    setEmail(d?.email ?? "");
    setSource(d?.source ?? "");
    setStatus("idle");
    setErrors({});
    setOpen(true);
  }, []));

  const close = useCallback(() => setOpen(false), []);
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  function validate(fd: FormData): Errors {
    const e: Errors = {};
    if (!String(fd.get("name") ?? "").trim()) e.name = t("errRequired");
    const em = String(fd.get("email") ?? "").trim();
    if (!em) e.email = t("errRequired");
    else if (!EMAIL_RE.test(em)) e.email = t("errEmail");
    if (!String(fd.get("venue") ?? "").trim()) e.venue = t("errRequired");
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const err = (k: keyof Errors) => (errors[k] ? <span id={`demo-${k}-err`} className={styles.err}>{errors[k]}</span> : null);

  return (
    <Modal open={open} onClose={close} labelledBy="demo-title" closeLabel={t("close")}>
      <div className={styles.body}>
        {status === "success" ? (
          <div className={styles.state} role="status">
            <motion.div className={styles.tick} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>✓</motion.div>
            <h2 id="demo-title" className={styles.title}>{t("successTitle")}</h2>
            <p className={styles.lead}>{t("successBody")}</p>
            <div className={styles.stateActions}><Button onClick={close}>{t("close")}</Button></div>
          </div>
        ) : status === "error" ? (
          <div className={styles.state} role="alert">
            <h2 id="demo-title" className={styles.title}>{t("errorTitle")}</h2>
            <p className={styles.lead}>{t("errorBody")}</p>
            <div className={styles.stateActions}>
              <Button onClick={() => setStatus("idle")}>{t("retry")}</Button>
              <Button variant="outline" href={waUrl} external>{t("whatsapp")}</Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="demo-title" className={styles.title}>{t("title")}</h2>
            <p className={styles.lead}>{t("lead")}</p>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="vtype" value="restaurant" />

              {/* Name is first so it receives initial focus; email is prefilled when it came from the hero. */}
              <Field id="name" label={t("name")} error={err("name")} invalid={!!errors.name} disabled={status === "sending"} />
              <Field id="email" type="email" label={t("email")} defaultValue={email} error={err("email")} invalid={!!errors.email} disabled={status === "sending"} />
              <Field id="venue" label={t("venue")} error={err("venue")} invalid={!!errors.venue} disabled={status === "sending"} />
              <Field id="phone" type="tel" label={t("phone")} disabled={status === "sending"} />

              <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={styles.label}>{t("locations")}</legend>
                <div className={styles.pills}>
                  {[["1", t("locations1")], ["2-5", t("locations2")], ["6+", t("locations6")]].map(([v, l], i) => (
                    <label key={v} className={styles.pill}>
                      <input type="radio" name="locations" value={v} defaultChecked={i === 0} disabled={status === "sending"} />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={styles.label}>{t("menuToday")}</legend>
                <div className={styles.pills}>
                  {[["pdf", t("menuPdf")], ["web", t("menuWeb")], ["other-system", t("menuOther")]].map(([v, l]) => (
                    <label key={v} className={styles.pill}>
                      <input type="radio" name="menuToday" value={v} disabled={status === "sending"} />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={styles.actions}>
                <Button type="submit" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? t("sending") : t("submit")}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}

function Field({ id, label, type = "text", defaultValue, error, invalid, disabled }: {
  id: "name" | "email" | "venue" | "phone"; label: string; type?: string; defaultValue?: string;
  error?: React.ReactNode; invalid?: boolean; disabled?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={`demo-${id}`} className={styles.label}>{label}</label>
      <input
        id={`demo-${id}`}
        name={id}
        type={type}
        className={styles.input}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `demo-${id}-err` : undefined}
        autoComplete={id === "email" ? "email" : id === "phone" ? "tel" : id === "name" ? "name" : "organization"}
      />
      {error}
    </div>
  );
}
```

Focus rule: `Modal` focuses the first focusable element that is not the close button. Hidden inputs are not focusable, so the **name** input always receives initial focus, which satisfies the spec ("focus on name when email is prefilled"). The `key` on the form is not needed because the modal unmounts on close (`AnimatePresence`), so `defaultValue` re-reads `email` on every open.

- [ ] **Step 4: Extend the API**

In `app/api/contact/route.ts`, after `const menuFile = ...` add:

```ts
  const locations = (fd.get("locations") as string)?.trim() ?? "";
  const menuToday = (fd.get("menuToday") as string)?.trim() ?? "";
  const source = (fd.get("source") as string)?.trim() ?? "";

  const extraLines = [
    locations ? `Locales: ${locations}` : "",
    menuToday ? `Carta hoy: ${menuToday}` : "",
    source ? `Origen: ${source}` : "",
    fileNote ? `Archivo adjunto: ${fileNote}` : "",
  ].filter(Boolean);
  const notionMessage = [message, ...extraLines].filter(Boolean).join("\n");
```

(Move this block **below** the `fileNote` computation.) Then in the Notion `properties` object, replace the two conflicting `Mensaje` spreads:

```ts
        ...(message ? { Mensaje: { rich_text: [{ text: { content: message } }] } } : {}),
        // ...
        ...(fileNote ? { Mensaje: { rich_text: [{ text: { content: (message ? message + "\n\n" : "") + `Archivo adjunto: ${fileNote}` } }] } } : {}),
```

with a single:

```ts
        ...(notionMessage ? { Mensaje: { rich_text: [{ text: { content: notionMessage } }] } } : {}),
```

And in the email HTML table, before the `Idioma` row, add:

```ts
          ${locations ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Locales</td><td>${locations}</td></tr>` : ""}
          ${menuToday ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Carta hoy</td><td>${menuToday}</td></tr>` : ""}
          ${source ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Origen</td><td>${source}</td></tr>` : ""}
```

- [ ] **Step 5: Mount in the layout**

`app/[locale]/layout.tsx`: `import DemoModal from "@/components/DemoModal";` and render `<DemoModal />` inside `<Providers>` after `<WhatsAppWidget />`.

- [ ] **Step 6: Run tests**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test e2e/demo-modal.spec.ts e2e/header.spec.ts e2e/contact.spec.ts` → PASS (header "direct links and CTAs" now passes; contact page still posts fine).

- [ ] **Step 7: Commit**

```bash
git add components/DemoModal.tsx components/DemoModal.module.css app/api/contact/route.ts "app/[locale]/layout.tsx" e2e/demo-modal.spec.ts
git commit -m "feat(redesign): demo request modal wired to /api/contact with locations, menuToday and source"
```

---

### Task 8: VideoModal

**Files:**
- Create: `components/VideoModal.tsx` + `.module.css`
- Modify: `app/[locale]/layout.tsx`
- Test: `e2e/video-modal.spec.ts`

**Interfaces:**
- Consumes: `Modal`, `useWindowEvent`, `VIDEO_OPEN`, `VideoOpenPayload`, messages `modal.video.*`.
- Produces: dialog labelled by the payload `title`; `<video>` exists only while open.

- [ ] **Step 1: Write failing e2e**

`e2e/video-modal.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("video element mounts only while the modal is open", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("video:open", { detail: { src: "/assets/nonexistent.mp4", title: "Test clip", orientation: "portrait" } }))
  );
  const dialog = page.getByRole("dialog", { name: "Test clip" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("video")).toHaveCount(1);
  await expect(dialog.locator("video")).toHaveAttribute("src", "/assets/nonexistent.mp4");
  await page.keyboard.press("Escape");
  await expect(page.locator("video")).toHaveCount(0);
});
```

- [ ] **Step 2: Run to verify failure** — `npx playwright test e2e/video-modal.spec.ts` → FAIL.

- [ ] **Step 3: Create `VideoModal`**

`components/VideoModal.module.css`:

```css
.frame { background: #000; border-radius: var(--radius-panel); overflow: hidden; }
.video { display: block; width: 100%; height: auto; max-height: calc(100vh - 32px); background: #000; }
.fallback { padding: 40px; text-align: center; color: #fff; }
.fallback a { color: var(--brand); font-weight: 600; }
```

`components/VideoModal.tsx`:

```tsx
"use client";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import { VIDEO_OPEN, useWindowEvent, type VideoOpenPayload } from "@/lib/events";
import styles from "./VideoModal.module.css";

export default function VideoModal() {
  const t = useTranslations("modal.video");
  const [video, setVideo] = useState<VideoOpenPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useWindowEvent<VideoOpenPayload>(VIDEO_OPEN, useCallback((d) => { setFailed(false); setVideo(d); }, []));
  const close = useCallback(() => setVideo(null), []);

  const portrait = video?.orientation === "portrait";
  const maxWidth = portrait ? "min(92vw, calc((100vh - 32px) * 9 / 16))" : "min(92vw, calc((100vh - 32px) * 16 / 9))";

  return (
    <Modal open={!!video} onClose={close} labelledBy="video-title" tone="dark" maxWidth={maxWidth} closeLabel={t("close")}>
      {video && (
        <div className={styles.frame}>
          <h2 id="video-title" className="u-visually-hidden">{video.title}</h2>
          {failed ? (
            <p className={styles.fallback}>
              {t("unavailable")} <a href={video.src} target="_blank" rel="noopener noreferrer">{t("openDirect")}</a>
            </p>
          ) : (
            <video
              className={styles.video}
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              onError={() => setFailed(true)}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 4: Mount in the layout** — add `<VideoModal />` next to `<DemoModal />`.

- [ ] **Step 5: Run** — `npx playwright test e2e/video-modal.spec.ts` → PASS. (`onError` fires for the nonexistent file after the dialog is visible; the assertions run before the fallback replaces the `<video>`. If flaky, assert `video` **or** fallback text — but the `src` assertion right after visibility is stable in practice.)

- [ ] **Step 6: Commit**

```bash
git add components/VideoModal.tsx components/VideoModal.module.css "app/[locale]/layout.tsx" e2e/video-modal.spec.ts
git commit -m "feat(redesign): video modal opened by video:open event"
```

---

### Task 9: LocaleBanner

**Files:**
- Create: `components/layout/LocaleBanner.tsx` + `.module.css`
- Modify: `app/[locale]/layout.tsx`
- Test: `e2e/locale-banner.spec.ts`

**Interfaces:**
- Consumes: `BANNER_COPY`, `routing.locales`, `useRouter`/`usePathname` from `@/lib/routing`, messages `banner.*`.
- Produces: `[role="status"][data-locale-banner]`; cookie `dim-lang-dismissed=1`.

- [ ] **Step 1: Write failing e2e**

`e2e/locale-banner.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("locale banner", () => {
  test.use({ locale: "es-ES" });

  test("shows when browser language differs and switches locale", async ({ page, context }) => {
    // Force EN despite an es-ES browser (simulates a shared /en link).
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" }]);
    await page.goto("/");
    const banner = page.locator("[data-locale-banner]");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("¿Prefieres leerlo en español?");
    await banner.getByRole("button", { name: "Cambiar" }).click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
  });

  test("dismiss sets a cookie and the banner stays hidden", async ({ page, context }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" }]);
    await page.goto("/");
    await page.locator("[data-locale-banner]").getByRole("button", { name: "Cerrar" }).click();
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "dim-lang-dismissed")?.value).toBe("1");
    await page.reload();
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
  });
});

test("no banner when browser language matches", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
});
```

- [ ] **Step 2: Run to verify failure** → FAIL (locator count 0).

- [ ] **Step 3: Create the banner**

`components/layout/LocaleBanner.module.css`:

```css
.bar {
  display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
  min-height: 44px; padding: 8px var(--gutter);
  background: var(--brand-soft); color: var(--ink); font-size: 14px; font-weight: 500;
}
.change {
  height: 30px; padding: 0 12px; border-radius: var(--radius-pill);
  background: var(--ink); color: #fff; font-weight: 600; font-size: 13px;
}
.close { width: 30px; height: 30px; border-radius: 50%; font-size: 18px; line-height: 1; }
.close:hover { background: rgba(15,14,13,.08); }
```

`components/layout/LocaleBanner.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { routing, usePathname, useRouter } from "@/lib/routing";
import { BANNER_COPY } from "@/lib/bannerCopy";
import styles from "./LocaleBanner.module.css";

type Locale = (typeof routing.locales)[number];
const COOKIE = "dim-lang-dismissed";

function hasCookie(name: string) {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
}

export default function LocaleBanner() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [preferred, setPreferred] = useState<Locale | null>(null);

  useEffect(() => {
    if (hasCookie(COOKIE)) return;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const match = langs
      .map((l) => l.slice(0, 2).toLowerCase())
      .find((l): l is Locale => (routing.locales as readonly string[]).includes(l));
    if (match && match !== locale) setPreferred(match);
  }, [locale]);

  if (!preferred) return null;

  const dismiss = () => {
    document.cookie = `${COOKIE}=1; max-age=7776000; path=/; samesite=lax`;
    setPreferred(null);
  };

  return (
    <motion.div
      className={styles.bar}
      role="status"
      data-locale-banner
      initial={{ y: -44, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span lang={preferred}>{BANNER_COPY[preferred]}</span>
      <button type="button" className={styles.change} lang={preferred} onClick={() => router.replace(pathname, { locale: preferred })}>
        {BANNER_LABELS[preferred].change}
      </button>
      <button type="button" className={styles.close} aria-label={BANNER_LABELS[preferred].close} onClick={dismiss}>×</button>
    </motion.div>
  );
}

// Button labels must also be in the *preferred* language (the visitor may not read the current one).
const BANNER_LABELS: Record<Locale, { change: string; close: string }> = {
  en: { change: "Switch", close: "Dismiss" },
  es: { change: "Cambiar", close: "Cerrar" },
  de: { change: "Wechseln", close: "Schließen" },
  fr: { change: "Changer", close: "Fermer" },
  pt: { change: "Mudar", close: "Fechar" },
};
```

The `banner.change` / `banner.close` message keys are not read by this component (labels must be in the *preferred* locale, so they are inlined in `BANNER_LABELS`); the keys stay in `messages/*` as documentation only.

- [ ] **Step 4: Mount it** in `app/[locale]/layout.tsx` **above** `<Header />` inside `<Providers>`.

- [ ] **Step 5: Run** — `npx playwright test e2e/locale-banner.spec.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add components/layout/LocaleBanner.tsx components/layout/LocaleBanner.module.css "app/[locale]/layout.tsx" e2e/locale-banner.spec.ts
git commit -m "feat(redesign): non-blocking preferred-language banner"
```

---

### Task 10: Localized 404

**Files:**
- Create: `app/[locale]/not-found.tsx` + `NotFound.module.css`, `app/[locale]/[...rest]/page.tsx`
- Test: `e2e/not-found.spec.ts`

**Interfaces:**
- Consumes: `Annotated`, `Button`, `Container`, `openDemo`, messages `notFound.*`.

- [ ] **Step 1: Write failing e2e**

`e2e/not-found.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("unknown EN route renders the localized 404 inside the shell", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This dish isn't on the menu.");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

test("unknown ES route renders Spanish 404 and the demo button opens the modal", async ({ page }) => {
  const res = await page.goto("/es/esto-no-existe");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este plato no está en la carta.");
  await page.getByRole("button", { name: "Pedir demo" }).click();
  await expect(page.getByRole("dialog", { name: "Pide tu demo" })).toBeVisible();
});
```

- [ ] **Step 2: Run to verify failure** → FAIL (Next default 404, no h1 text).

- [ ] **Step 3: Create the catch-all**

`app/[locale]/[...rest]/page.tsx`:

```tsx
import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound();
}
```

- [ ] **Step 4: Create `not-found.tsx`**

`app/[locale]/NotFound.module.css`:

```css
.wrap { background: var(--cream); }
.inner { min-height: 70vh; display: grid; place-items: center; text-align: center; padding: 80px 0; }
.code { font-family: var(--font-display); font-weight: 800; font-size: clamp(96px, 20vw, 220px); line-height: .9; letter-spacing: -0.05em; margin-bottom: 16px; }
.title { margin-bottom: 12px; }
.body { color: var(--ink-2); font-size: var(--text-lead); max-width: 520px; margin: 0 auto 28px; }
.actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.hint { margin-top: 40px; font-size: 13px; color: var(--ink-2); max-width: 520px; }
```

`app/[locale]/not-found.tsx`:

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Annotated from "@/components/ui/Annotated";
import NotFoundActions from "./NotFoundActions";
import styles from "./NotFound.module.css";

export const metadata: Metadata = { title: "404 · Dimonova", robots: { index: false, follow: false } };

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className={styles.wrap}>
      <Container>
        <div className={styles.inner}>
          <div>
            <div className={styles.code} aria-hidden="true"><Annotated kind="strike" delay={0.3}>404</Annotated></div>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.body}>{t("body")}</p>
            <NotFoundActions home={t("home")} products={t("products")} demo={t("demo")} />
            <p className={styles.hint}>{t("menuHint")}</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
```

`app/[locale]/NotFoundActions.tsx` (client, because of `openDemo`):

```tsx
"use client";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";
import styles from "./NotFound.module.css";

export default function NotFoundActions({ home, products, demo }: { home: string; products: string; demo: string }) {
  return (
    <div className={styles.actions}>
      <Button href="/">{home}</Button>
      <Button href="/features" variant="outline">{products}</Button>
      <Button variant="ghost" onClick={() => openDemo({ source: "404" })}>{demo}</Button>
    </div>
  );
}
```

- [ ] **Step 5: Run** — `npx playwright test e2e/not-found.spec.ts` → PASS. Also `npx playwright test e2e/smoke.spec.ts e2e/pages.spec.ts` to confirm real routes are unaffected by the catch-all.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/not-found.tsx" "app/[locale]/NotFound.module.css" "app/[locale]/NotFoundActions.tsx" "app/[locale]/[...rest]" e2e/not-found.spec.ts
git commit -m "feat(redesign): localized 404 with catch-all route"
```

---

### Task 11: WhatsApp widget restyle

**Files:**
- Modify: `components/WhatsAppWidget.tsx` (rewrite), Create: `components/WhatsAppWidget.module.css`
- Test: `e2e/footer-wa.spec.ts` (already covers toggle)

**Interfaces:**
- Keeps: listens to `dimonova:open-wa` (used by `OpenWAButton` and `ContactForm` on legacy pages); launcher `button[aria-label="WhatsApp"]`; panel text `wa.name`.

- [ ] **Step 1: Confirm the existing test still describes the behaviour**

`e2e/footer-wa.spec.ts` → `"whatsapp widget toggles open"` clicks the launcher and expects the panel with `wa.name`. Keep it as the spec.

- [ ] **Step 2: Rewrite the widget**

`components/WhatsAppWidget.module.css`:

```css
.root { position: fixed; right: 20px; bottom: 20px; z-index: 75; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; pointer-events: none; }
.panel { pointer-events: auto; width: 320px; max-width: calc(100vw - 40px); background: var(--paper); border-radius: 24px; border: 1px solid var(--mist); box-shadow: 0 30px 60px -30px rgba(15,14,13,.5); overflow: hidden; }
.head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: var(--ink); color: #fff; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--brand); display: grid; place-items: center; font-weight: 700; }
.name { font-weight: 600; font-size: 14px; }
.status { font-size: 12px; color: rgba(255,255,255,.65); }
.headClose { margin-left: auto; color: #fff; font-size: 20px; padding: 4px 8px; }
.chat { padding: 18px; background: var(--cream); }
.bubble { background: #fff; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 14px; max-width: 250px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.chips { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.chip { background: #fff; border: 1px solid var(--mist); border-radius: var(--radius-pill); padding: 9px 14px; font-size: 13px; font-weight: 500; }
.chip:hover { border-color: var(--ink); }
.foot { padding: 14px 18px; border-top: 1px solid var(--mist); }
.go { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 44px; border-radius: var(--radius-pill); background: #25D366; color: #fff; font-weight: 600; font-size: 14px; }
.go:hover { background: #1FB755; }
.launcher { pointer-events: auto; width: 60px; height: 60px; border-radius: 50%; background: #25D366; color: #fff; display: grid; place-items: center; box-shadow: 0 12px 24px -8px rgba(37,211,102,.5); transition: transform .2s var(--ease-out); }
.launcher:hover { transform: scale(1.05); }
```

`components/WhatsAppWidget.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { CONTACT } from "@/lib/config";
import styles from "./WhatsAppWidget.module.css";

const WA_PATH = "M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z";

export default function WhatsAppWidget() {
  const t = useTranslations("wa");
  const locale = useLocale();
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("dimonova:open-wa", handler);
    return () => window.removeEventListener("dimonova:open-wa", handler);
  }, []);

  return (
    <div className={styles.root}>
      <AnimatePresence>
        {open && (
          <motion.div className={styles.panel} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .2 }}>
            <div className={styles.head}>
              <div className={styles.avatar} aria-hidden="true">D</div>
              <div>
                <div className={styles.name}>{t("name")}</div>
                <div className={styles.status}>{t("status")}</div>
              </div>
              <button type="button" className={styles.headClose} onClick={() => setOpen(false)} aria-label="Close WhatsApp">×</button>
            </div>
            <div className={styles.chat}>
              <div className={styles.bubble}>{t("greeting")}</div>
              <div className={styles.chips}>
                {(["chip_restaurant", "chip_pub", "chip_cafe"] as const).map((k) => (
                  <a key={k} className={styles.chip} href={waUrl} target="_blank" rel="noopener noreferrer">{t(k)}</a>
                ))}
              </div>
            </div>
            <div className={styles.foot}>
              <a className={styles.go} href={waUrl} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
                {t("continue")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className={styles.launcher} onClick={() => setOpen((v) => !v)} aria-label="WhatsApp" aria-expanded={open}>
        {open ? <span style={{ fontSize: 26, lineHeight: 1 }}>×</span> : (
          <svg width="30" height="30" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
        )}
      </button>
    </div>
  );
}
```

The `wa.disclaimer` ("prototype, won't actually open") is intentionally dropped — the link is real now. Leave the key in messages (harmless) or remove it from all 5 files; either is fine.

- [ ] **Step 3: Run** — `npx tsc --noEmit`; `npx playwright test e2e/footer-wa.spec.ts e2e/contact.spec.ts` → PASS.

- [ ] **Step 4: Commit**

```bash
git add components/WhatsAppWidget.tsx components/WhatsAppWidget.module.css
git commit -m "refactor(redesign): restyle WhatsApp widget with design tokens"
```

---

### Task 12: Full suite, docs, TODO

**Files:**
- Modify: `CLAUDE.md`, `TODO.md`, `README.md` (one line on `npm run sync:messages`)
- Test: entire e2e + unit suites

- [ ] **Step 1: Run everything**

Run: `npx tsc --noEmit` → clean.
Run: `npx playwright test -c playwright.unit.config.ts` → PASS.
Run: `npm run test:e2e` → PASS (all files). Fix any regression in legacy specs (`home.spec.ts`, `pages.spec.ts`, `seo.spec.ts`, `contact.spec.ts`) by adjusting **selectors only** if they depended on the old header/footer markup; page content is unchanged.

- [ ] **Step 2: Update `CLAUDE.md`**

Replace the *Styling* row of the Architecture table and the *Inline-style rule* section with:

```markdown
| Styling | **New shell + home (2026-09 redesign):** CSS Modules next to each component, design tokens as CSS custom properties in `app/globals.css`, `motion` (`motion/react`) inside `'use client'` islands only, `<MotionConfig reducedMotion="user">` in `components/layout/Providers.tsx`. **Legacy inner pages** (`components/sections/*`) still use inline styles via `lib/style.ts` `s()` + `components/Hover.tsx` until they are redesigned; the `.dim-*` rules at the bottom of `globals.css` exist only for them. |
```

```markdown
### Styling rule

New components: `Name.tsx` + `Name.module.css`, tokens from `:root` (`--brand`, `--ink`, `--cream`, …), fonts via `lib/fonts.ts` (`--font-display` Bricolage Grotesque, `--font-body` Instrument Sans). Never add inline styles or `dangerouslySetInnerHTML` to new code; rich strings use `t.rich`.

Legacy: `archive/` and `s()` are only for the not-yet-redesigned inner pages. Do not port new markup from the archive.

### Site-wide overlays

`DemoModal`, `VideoModal`, `LocaleBanner`, `WhatsAppWidget` are mounted once in `app/[locale]/layout.tsx`. Open them from anywhere with `openDemo({ email?, source? })` / `openVideo({ src, title, poster?, orientation? })` from `lib/events.ts` (typed `window` CustomEvents `demo:open` / `video:open`). The legacy `dimonova:open-wa` event still opens the WhatsApp panel.

### Services registry

`lib/services.ts` is the single list of the 8 services (slugs `menu, ai, ordering, training, multi, reviews, daily, translate`). Copy lives in `messages/*.json` under `services.<slug>.{title,line}`. Mega-menu, footer and (phase 2) home cards read from it.

### Messages workflow

Write new keys in `messages/en.json` and `messages/es.json`, then run `npm run sync:messages` to copy the missing keys into `de`, `fr`, `pt` (they intentionally carry English until translated).
```

Also update the *Route map* to add `not-found.tsx`, `[...rest]/page.tsx`, `legal/[slug]/page.tsx`, and the *WhatsApp widget state* paragraph to point at `components/WhatsAppWidget.tsx` (it is unchanged in behaviour).

- [ ] **Step 3: Update `TODO.md`**

Add a section at the top:

```markdown
## 🎨 Redesign (spec: docs/superpowers/specs/2026-09-07-site-redesign-design.md)

- [x] Phase 1 — base: tokens, fonts, UI kit, header + mega-menu, footer + wordmark, demo/video modals, locale banner, 404, legal placeholders
- [ ] Phase 2 — home (hero B + C variants, 8 service cards, AI panel, Bálamo showcase, differentiator band, reviews, AI compare, final CTA)
- [ ] Phase 3 — content: stock hero photo, service screenshots, Bálamo phone capture, reviews JSON, videos to Supabase bucket, real numbers, OG image; pick hero B or C
- [ ] Phase 4 — inner pages on the new system; delete `lib/style.ts`, `components/Hover.tsx`, `components/sections/*`, legacy `.dim-*` CSS
- [ ] Phase 5 — `/admin` proxy to menuadmin (basePath + webhook-preserving rewrite)
```

Mark the old item *"Make the WhatsApp widget real"* as done and *"Add real legal pages"* as `[~]` (placeholders exist, texts pending).

- [ ] **Step 4: README** — under Commands add `npm run sync:messages  # copy missing keys from en.json to the other locales`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md TODO.md README.md
git commit -m "docs: document redesign phase 1 conventions and roadmap"
```

---

## Self-review notes

- **Spec coverage (phase 1 items):** §2 stack ✔ (T1, T3); §3 tokens/motion/UI ✔ (T1, T3) — `Pill`, `Marquee`, `DeviceFrame` deferred to phase 2 where they are first used (YAGNI); §4 header/mega/mobile ✔ (T5); §6 footer ✔ (T6, wordmark as text — deviation recorded); §7 modals + API ✔ (T7, T8); §8 banner ✔ (T9); §9 404 ✔ (T10); §10 messages + sync ✔ (T4); §11 files ✔; §12 error handling for modal/video ✔; §13 focus ring, contrast, aria ✔; §15 specs header/demo-modal/locale-banner/footer/not-found ✔ (hero/home-sections specs belong to phase 2); §16 phase 1 ✔; legal placeholders ✔ (T6).
- **Type consistency:** `openDemo`/`openVideo`/`useWindowEvent`/`DEMO_OPEN`/`VIDEO_OPEN` (T2) used in T5, T7, T8, T10 with the same signatures. `SERVICES[].slug/href` (T2) used in T5, T6. `Modal` props `{open,onClose,labelledBy,children,tone,maxWidth,closeLabel}` (T3) used identically in T7, T8. `Button` props (T3) used in T5–T10. `BANNER_COPY` (T2) used in T9. Message keys (T4) match every `t()` call in T5–T11.
- **Known follow-ups (not blockers):** `wa.disclaimer` key unused; `banner.change`/`banner.close` keys unused (labels are inlined per preferred locale); both can be pruned in phase 4.
