# Redesign Phase 2 — Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy home page with the nine redesigned sections from the spec, so the whole home renders on the new design system and the eight home-only legacy sections can be deleted.

**Architecture:** Server components compose the page; every animated part is a small `'use client'` island using `motion/react`. All copy lives in `messages/*.json`; the eight services come from `lib/services.ts`; review content comes from `data/reviews.json`, which ships empty so the section renders honest placeholders until real content arrives. Three new UI primitives (`Pill`, `Marquee`, `DeviceFrame`) join the phase-1 kit.

**Tech Stack:** Next.js 16.2 (App Router, SSG), React 19.2, TypeScript strict, next-intl 4.13, `motion` 12, Playwright.

Spec: `docs/superpowers/specs/2026-09-07-site-redesign-design.md` §5 (and §3 for tokens/motion). Read §5 before starting; this plan does not repeat its rationale.

## Global Constraints

- Branch `redesign/phase-2`, based on `main` at `70a258b`. Phase 1 is merged; do not re-do any of it.
- Locales `en, es, de, fr, pt`; default `en` at `/`. New copy is written in **EN and ES**; `de/fr/pt` get the English via `npm run sync:messages`. Never leave a key missing in any locale.
- Import `Link`, `useRouter`, `usePathname`, `routing` from `@/lib/routing`. Never `next/navigation` or `next/link`.
- `motion` from `motion/react`, only inside `'use client'` files. `<MotionConfig reducedMotion="user">` already wraps the app via `components/layout/Providers.tsx`. Any CSS keyframe animation must be disabled under `@media (prefers-reduced-motion: reduce)`.
- Every component: `Name.tsx` + `Name.module.css` beside it. Tokens only, no hard-coded colours. No inline styles except genuinely dynamic values. No `dangerouslySetInnerHTML` — rich strings use `t.rich`.
- Available from phase 1: `components/ui/{Container,Button,Reveal,Modal,Annotated}`, `components/icons/{ServiceIcons,FlagIcons}`, `lib/motion.ts` (`EASE_OUT, REVEAL_TRANSITION, reveal, revealDelayed, stagger, lift, bob, draw, viewportOnce`), `lib/events.ts` (`openDemo, openVideo, useWindowEvent, DEMO_OPEN, VIDEO_OPEN`), `lib/services.ts` (`SERVICES`, `ServiceSlug`), `lib/useFocusTrap.ts`, `lib/config.ts` (`CONTACT, ADMIN_URL, COMPANY, LEGAL_UPDATED`), `lib/html.ts` (`esc, safeUrl`).
- `Button` prop contract: `{ variant?: "solid"|"outline"|"ghost"; size?: "md"|"lg"; onDark?: boolean; className?; ariaLabel?; children }` plus **either** `{ href, external? }` **or** `{ onClick?, type?, disabled? }`. A link cannot take `onClick`.
- Solid buttons are white on `--brand` by the owner's explicit choice. Do not change `Button.module.css`.
- The reviews product does **not** gate reviews: low ratings are asked for a reason and then redirected to Google as well. No copy anywhere may imply otherwise.
- Accessibility: one `<h1>` per page (the hero owns it on the home); every image has an `alt`; every control has an accessible name; the skip link and `#main` already exist in the layout.
- `npx tsc --noEmit` clean. Before every e2e run kill anything stale on port 3100 (`netstat -ano | grep 3100`, `taskkill //PID <pid> //F`). A `next dev` server runs on port 3001; leave it alone.
- Commits: conventional, ending with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Windows: Bash tool (Git Bash), no `&&` in PowerShell, quote paths containing `[locale]`.

---

## File map

| Path | Responsibility |
|---|---|
| `components/ui/Pill.tsx` + `.module.css` | rounded label, `tone` light/dark/outline, optional `as` link |
| `components/ui/Marquee.tsx` + `.module.css` | infinite horizontal scroller, duplicated track, pauses on hover, direction prop |
| `components/ui/DeviceFrame.tsx` + `.module.css` | phone/tablet bezel wrapping an image |
| `components/home/EmailCta.tsx` + `.module.css` | email pill that opens the demo modal prefilled |
| `components/home/Hero.tsx` + `.module.css` | dark hero card, owns the `<h1>` |
| `components/home/HeroBgPhoto.tsx` + `.module.css` | variant B background |
| `components/home/HeroBgMock.tsx` + `.module.css` | variant C background |
| `components/home/HeroBackground.tsx` | client switch reading `?hero=c` |
| `components/home/LogoStrip.tsx` + `.module.css` | client logo marquee |
| `components/home/ServiceCards.tsx` + `.module.css` | the eight cards |
| `components/home/AiPanel.tsx` + `.module.css` | dark AI section shell |
| `components/home/AiDemo.tsx` + `.module.css` | the animated assistant mock |
| `components/home/BalamoShowcase.tsx` + `.module.css` | client case with floating pills |
| `components/home/DifferentiatorBand.tsx` + `.module.css` | two opposing marquees of expanding pills |
| `components/home/Reviews.tsx` + `.module.css` | draggable carousel of video and Google cards |
| `components/home/AiCompare.tsx` + `.module.css` | coral band with AI deep links |
| `components/home/FinalCta.tsx` + `.module.css` | closing call to action |
| `lib/aiPrompt.ts` | prompt builders and provider deep links |
| `data/reviews.json` | review content, ships empty |
| `public/assets/cases/balamo-phone.png` | already captured, 780×1688 |
| `public/assets/hero/` | variant B photo + `SOURCES.md` |
| `app/[locale]/page.tsx` | composes the nine sections |

Deleted in Task 10: `components/sections/{Hero,LogoStrip,FeaturesSummary,HowItWorks,Differentiator,PricingTeaser,HomeCta,SocialProof}.tsx` — verified home-only.

---

### Task 1: Primitives — Pill, Marquee, DeviceFrame

**Files:** Create `components/ui/Pill.tsx` + `.module.css`, `components/ui/Marquee.tsx` + `.module.css`, `components/ui/DeviceFrame.tsx` + `.module.css`. Test: temporary route `app/[locale]/kit2/page.tsx` + `e2e/kit2.spec.ts`, both deleted at the end of the task.

**Interfaces produced:**
- `Pill({ children, tone?: "light"|"dark"|"outline"|"brand", size?: "sm"|"md", href?, external?, className? })`
- `Marquee({ children, speed?: number /* seconds for one loop, default 40 */, direction?: "left"|"right", pauseOnHover?: boolean /* default true */, className? })` — client
- `DeviceFrame({ src, alt, kind?: "phone"|"tablet", priority?: boolean, className? })` — server-safe, renders `next/image`

- [ ] **Step 1: Write the failing e2e**

`app/[locale]/kit2/page.tsx`:

```tsx
import Pill from "@/components/ui/Pill";
import Marquee from "@/components/ui/Marquee";
import DeviceFrame from "@/components/ui/DeviceFrame";

export default function Kit2() {
  return (
    <main id="main" tabIndex={-1} style={{ padding: 40 }}>
      <h1>Kit 2</h1>
      <Pill>Plain pill</Pill>
      <Pill href="/pricing" tone="outline">Link pill</Pill>
      <div data-marquee>
        <Marquee speed={10}>
          <span>alpha</span><span>beta</span><span>gamma</span>
        </Marquee>
      </div>
      <DeviceFrame src="/assets/cases/balamo-phone.png" alt="Bálamo menu on a phone" kind="phone" />
    </main>
  );
}
```

`e2e/kit2.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("Pill renders as text or as a link", async ({ page }) => {
  await page.goto("/kit2");
  await expect(page.getByText("Plain pill")).toBeVisible();
  await expect(page.getByRole("link", { name: "Link pill" })).toHaveAttribute("href", "/pricing");
});

test("Marquee duplicates its track and hides the copy from assistive tech", async ({ page }) => {
  await page.goto("/kit2");
  const region = page.locator("[data-marquee]");
  await expect(region.getByText("alpha")).toHaveCount(2);
  const hidden = await region.evaluate((el) =>
    [...el.querySelectorAll("[aria-hidden='true']")].length
  );
  expect(hidden).toBeGreaterThan(0);
});

test("DeviceFrame renders the image with its alt text", async ({ page }) => {
  await page.goto("/kit2");
  const img = page.getByAltText("Bálamo menu on a phone");
  await expect(img).toBeVisible();
  const box = await img.boundingBox();
  expect(box!.height).toBeGreaterThan(box!.width);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/kit2.spec.ts`
Expected: FAIL — module not found for `@/components/ui/Pill`.

- [ ] **Step 3: Create `Pill`**

`components/ui/Pill.module.css`:

```css
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  border-radius: var(--radius-pill); border: 1px solid transparent;
  font-weight: 600; white-space: nowrap; line-height: 1;
}
.sm { font-size: 13px; padding: 8px 14px; }
.md { font-size: 15px; padding: 12px 20px; }

.light { background: var(--paper); color: var(--ink); border-color: var(--mist); box-shadow: 0 6px 20px -12px rgba(15,14,13,.4); }
.dark { background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.2); }
.outline { background: transparent; color: var(--ink); border-color: var(--mist); }
.brand { background: var(--brand-soft); color: var(--brand-deep); }

a.pill:hover { border-color: currentColor; }
```

`components/ui/Pill.tsx`:

```tsx
import { Link } from "@/lib/routing";
import styles from "./Pill.module.css";

type Props = {
  children: React.ReactNode;
  tone?: "light" | "dark" | "outline" | "brand";
  size?: "sm" | "md";
  href?: string;
  external?: boolean;
  className?: string;
};

export default function Pill({ children, tone = "light", size = "sm", href, external, className }: Props) {
  const cls = [styles.pill, styles[tone], styles[size], className].filter(Boolean).join(" ");
  if (href) {
    return external
      ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <Link className={cls} href={href}>{children}</Link>;
  }
  return <span className={cls}>{children}</span>;
}
```

- [ ] **Step 4: Create `Marquee`**

`components/ui/Marquee.module.css`:

```css
.wrap { overflow: hidden; width: 100%; }
.track { display: flex; width: max-content; will-change: transform; }
.group { display: flex; align-items: center; gap: var(--marquee-gap, 32px); padding-right: var(--marquee-gap, 32px); }
.left .track { animation: marquee-left var(--marquee-duration, 40s) linear infinite; }
.right .track { animation: marquee-right var(--marquee-duration, 40s) linear infinite; }
.wrap[data-pause="true"]:hover .track { animation-play-state: paused; }

@keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }

@media (prefers-reduced-motion: reduce) {
  .track { animation: none !important; }
  .wrap { overflow-x: auto; }
}
```

`components/ui/Marquee.tsx`:

```tsx
"use client";
import styles from "./Marquee.module.css";

type Props = {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Duplicates its children once and translates the track by -50%, so the loop is seamless.
 * The duplicate is aria-hidden: assistive tech reads the content once.
 */
export default function Marquee({ children, speed = 40, direction = "left", pauseOnHover = true, className }: Props) {
  return (
    <div
      className={[styles.wrap, styles[direction], className].filter(Boolean).join(" ")}
      data-pause={pauseOnHover}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      <div className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `DeviceFrame`**

`components/ui/DeviceFrame.module.css`:

```css
.frame {
  position: relative; background: #111; border-radius: 40px; padding: 10px;
  box-shadow: 0 40px 80px -40px rgba(15,14,13,.6), 0 0 0 1px rgba(255,255,255,.08) inset;
}
.tablet { border-radius: 28px; padding: 12px; }
.screen { position: relative; overflow: hidden; border-radius: 32px; display: block; }
.tablet .screen { border-radius: 18px; }
.screen img { display: block; width: 100%; height: auto; }
.notch {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  width: 38%; height: 22px; background: #111; border-radius: 0 0 14px 14px; z-index: 1;
}
.tablet .notch { display: none; }
```

`components/ui/DeviceFrame.tsx`:

```tsx
import Image from "next/image";
import styles from "./DeviceFrame.module.css";

type Props = {
  src: string;
  alt: string;
  kind?: "phone" | "tablet";
  priority?: boolean;
  className?: string;
};

/** Phone/tablet bezel around a screenshot. `alt` is required: these images carry meaning. */
export default function DeviceFrame({ src, alt, kind = "phone", priority, className }: Props) {
  const w = kind === "phone" ? 390 : 820;
  const h = kind === "phone" ? 844 : 1180;
  return (
    <div className={[styles.frame, kind === "tablet" && styles.tablet, className].filter(Boolean).join(" ")}>
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.screen}>
        <Image src={src} alt={alt} width={w} height={h} priority={priority} sizes="(max-width: 900px) 80vw, 390px" />
      </span>
    </div>
  );
}
```

- [ ] **Step 6: Run the tests**

Run: `npx playwright test e2e/kit2.spec.ts` → PASS.
Run: `npx tsc --noEmit` → clean.

- [ ] **Step 7: Delete the temporary route and spec**

`git rm -r "app/[locale]/kit2" e2e/kit2.spec.ts`. Delete `.next` if `tsc` complains about the removed route, then re-run `npx tsc --noEmit`.

- [ ] **Step 8: Commit**

```bash
git add components/ui
git commit -m "feat(home): Pill, Marquee and DeviceFrame primitives"
```

---

### Task 2: All home copy, review data and the AI prompt

**Files:** Modify `messages/en.json`, `messages/es.json` (then sync). Create `data/reviews.json`, `lib/aiPrompt.ts`, `lib/aiPrompt.test.ts`.

**Interfaces produced:** every `home.*` and `alt.hero*` message key the later tasks consume; `PROVIDERS`, `buildProviderUrl`, `AI_PROVIDER_IDS` from `lib/aiPrompt.ts`; the shape of `data/reviews.json`.

- [ ] **Step 1: Add the copy to `messages/en.json`**

Merge this block in (keep every existing key; use a merge script like the one in the phase-1 plan rather than editing by hand):

```json
{
  "home": {
    "hero": {
      "playPill": "How Dimonova started",
      "title": "We take care of it. You <mark>grow</mark>.",
      "lead": "Digital menu, ordering and reviews made to measure, built and looked after 24/7 by a team of geeks you can trust. No templates. Ready to scale.",
      "emailPlaceholder": "Your email",
      "cta": "Book a demo",
      "legal": "We only use your email to get in touch. <link>Privacy</link>.",
      "clientLink": "Already a client? Go to the dashboard",
      "emailInvalid": "Enter a valid email"
    },
    "logos": { "title": "Trusted by" },
    "services": {
      "title": "Everything your restaurant needs. And someone to run it.",
      "lead": "Eight things we build, connect and keep running for you."
    },
    "ai": {
      "eyebrow": "Dashboard + AI",
      "title": "Tell the menu what you want. Done.",
      "body": "Your team makes changes in bulk in seconds and you approve them. Nothing is written to your menu until someone says yes.",
      "steps": ["Write it", "Check the change", "Apply"],
      "cta": "See how it works",
      "demo": {
        "tabs": ["Bulk changes", "Translations", "Descriptions"],
        "prompts": [
          "Put all the wines up by 5%",
          "Translate the menu into German",
          "Write the description for the grilled octopus"
        ],
        "rows": [
          [["Rioja Reserva", "18.00 €", "18.90 €"], ["Albariño", "16.00 €", "16.80 €"], ["Ribera del Duero", "21.00 €", "22.05 €"], ["Cava Brut", "14.00 €", "14.70 €"]],
          [["Pulpo a la brasa", "—", "Gegrillter Oktopus"], ["Croquetas de jamón", "—", "Schinkenkroketten"], ["Tarta de queso", "—", "Käsekuchen"], ["Vermut de la casa", "—", "Hausgemachter Wermut"]],
          [["Grilled octopus", "No description", "Galician octopus, grilled over embers, potato cream and smoked paprika."]]
        ],
        "proposed": "Proposed changes",
        "apply": "Apply selected",
        "toast": "{count} dishes updated"
      }
    },
    "balamo": {
      "eyebrow": "Case: Bálamo Restaurante",
      "title": "Bálamo didn't want a menu. They wanted theirs.",
      "body": "Their menu lives on their own site and on the tablets in the VIP area, in their exact typography and colours. Every week the sommelier's wine selection goes up as a promotion. Reviews come back tagged by waiter and by area. It talks to the software they already use for the cellar. And support has no ticket limit.",
      "cta": "See the case",
      "pills": ["Reviews", "VIP tablets", "Wine of the week", "Cellar integration", "Unlimited support"],
      "stats": [
        { "value": "—", "label": "dishes managed" },
        { "value": "—", "label": "languages" },
        { "value": "—", "label": "average time to change a dish" }
      ]
    },
    "diff": {
      "title": "What nobody else does.",
      "lead": "The parts a template cannot give you, and a support queue will not do for you.",
      "items": [
        { "title": "Pixel-perfect styling", "body": "Your fonts, your colours, your spacing. Not a theme with your logo dropped in." },
        { "title": "Events and promotions", "body": "Set them up once and they appear and disappear on their own." },
        { "title": "Support with no question limit", "body": "Ask as often as you need. Nobody is counting." },
        { "title": "Training at your venue", "body": "We come in and teach the team on their own devices." },
        { "title": "Integration with your software", "body": "POS, printers, cellar, reservations. We connect what you already use." },
        { "title": "Multi-venue", "body": "One dashboard, every location, per-venue permissions." },
        { "title": "No templates", "body": "Every menu is built for one restaurant. Yours." },
        { "title": "Same-day changes", "body": "Tell us in the morning, it is live for the evening service." },
        { "title": "Tablets, QR or web", "body": "The menu goes wherever your guests look." },
        { "title": "Someone on the other end", "body": "A person who knows your venue, not a chatbot." }
      ]
    },
    "reviews": {
      "title": "Their words, not ours.",
      "badge": "{rating} on Google",
      "pending": "Reviews coming soon.",
      "more": "Read more",
      "less": "Show less",
      "viewOnGoogle": "See it on Google",
      "playVideo": "Play the review from {name}",
      "prev": "Previous review",
      "next": "Next review"
    },
    "aiCompare": {
      "title": "Ask someone who doesn't work here.",
      "lead": "Open the question in the AI you already use. We do not touch the answer.",
      "copy": "Copy the question",
      "copied": "Copied",
      "prompt": "I run a restaurant with about 20 tables and I am considering hiring Dimonova (dimonova.com). It is a done-for-you service: they build the digital menu inside my own website in my exact branding rather than from a template, they keep it updated, they train my team with videos and in person, and support has no limit on the number of questions. It includes a dashboard with an AI assistant for bulk changes and translations, ordering wired to my POS and kitchen printers with pay-at-table, a review system that asks unhappy diners what went wrong before sending everyone on to Google and tags each review by waiter and area, a daily set menu, promotions and events, and multi-venue management from one dashboard. Compare that with a self-service QR menu builder based on templates. Tell me honestly which kind of restaurant this managed service is worth the money for and which kind it is not, and what I should ask them before signing."
    },
    "finalCta": {
      "title": "We take care of it. You grow.",
      "lead": "Tell us your email and we will show you what your menu would look like.",
      "whatsapp": "or message us on WhatsApp"
    }
  },
  "alt": {
    "heroMock": "The Bálamo digital menu open on a phone, showing dish photographs and the restaurant's own branding.",
    "heroPhoto": "A dining room during service, seen from behind the pass.",
    "balamoPhone": "Bálamo's digital menu on a phone: their logo, welcome section and dish photography.",
    "serviceCard": "{title} shown inside the Dimonova dashboard."
  }
}
```

- [ ] **Step 2: Add the Spanish copy to `messages/es.json`**

```json
{
  "home": {
    "hero": {
      "playPill": "Cómo empezó Dimonova",
      "title": "Nosotros nos ocupamos. Tú <mark>creces</mark>.",
      "lead": "Carta digital, comandero y reseñas a medida de tu restaurante, montados y cuidados 24/7 por un equipo de frikis de confianza. Sin plantillas. Listo para escalar.",
      "emailPlaceholder": "Tu email",
      "cta": "Pedir demo",
      "legal": "Solo usamos tu email para contactarte. <link>Privacidad</link>.",
      "clientLink": "¿Ya eres cliente? Acceder al panel",
      "emailInvalid": "Escribe un email válido"
    },
    "logos": { "title": "Confían en nosotros" },
    "services": {
      "title": "Todo lo que necesita tu restaurante. Y alguien que lo gestione.",
      "lead": "Ocho cosas que montamos, conectamos y mantenemos por ti."
    },
    "ai": {
      "eyebrow": "Panel + IA",
      "title": "Dile a la carta lo que quieres. Ya está.",
      "body": "Tu equipo hace cambios en bloque en segundos y tú los apruebas. No se escribe nada en tu carta hasta que alguien dice que sí.",
      "steps": ["Escríbelo", "Revisa el cambio", "Aplica"],
      "cta": "Ver cómo funciona",
      "demo": {
        "tabs": ["Cambios en bloque", "Traducciones", "Descripciones"],
        "prompts": [
          "Sube un 5 % todos los vinos",
          "Traduce la carta al alemán",
          "Escribe la descripción del pulpo a la brasa"
        ],
        "rows": [
          [["Rioja Reserva", "18,00 €", "18,90 €"], ["Albariño", "16,00 €", "16,80 €"], ["Ribera del Duero", "21,00 €", "22,05 €"], ["Cava Brut", "14,00 €", "14,70 €"]],
          [["Pulpo a la brasa", "—", "Gegrillter Oktopus"], ["Croquetas de jamón", "—", "Schinkenkroketten"], ["Tarta de queso", "—", "Käsekuchen"], ["Vermut de la casa", "—", "Hausgemachter Wermut"]],
          [["Pulpo a la brasa", "Sin descripción", "Pulpo gallego a la brasa sobre crema de patata y pimentón ahumado."]]
        ],
        "proposed": "Cambios propuestos",
        "apply": "Aplicar seleccionados",
        "toast": "{count} platos actualizados"
      }
    },
    "balamo": {
      "eyebrow": "Caso: Bálamo Restaurante",
      "title": "Bálamo no quería una carta. Quería la suya.",
      "body": "Su carta vive en su propia web y en las tablets de la zona VIP, con su tipografía y sus colores exactos. Cada semana sube la selección del sumiller como promoción. Las reseñas vuelven etiquetadas por camarero y por zona. Se entiende con el software que ya usan para la bodega. Y el soporte no tiene límite de consultas.",
      "cta": "Ver el caso",
      "pills": ["Reseñas", "Tablets VIP", "Vinos de la semana", "Integración bodega", "Soporte ilimitado"],
      "stats": [
        { "value": "—", "label": "platos gestionados" },
        { "value": "—", "label": "idiomas" },
        { "value": "—", "label": "tiempo medio para cambiar un plato" }
      ]
    },
    "diff": {
      "title": "Lo que nadie más hace.",
      "lead": "Lo que una plantilla no te puede dar y una cola de soporte no te va a hacer.",
      "items": [
        { "title": "Personalización al píxel", "body": "Tus tipografías, tus colores, tus espacios. No una plantilla con tu logo encima." },
        { "title": "Eventos y promociones", "body": "Los configuras una vez y aparecen y desaparecen solos." },
        { "title": "Soporte sin límite de consultas", "body": "Pregunta las veces que necesites. Nadie lleva la cuenta." },
        { "title": "Formación en tu local", "body": "Vamos y formamos al equipo en sus propios dispositivos." },
        { "title": "Integración con tu software", "body": "TPV, impresoras, bodega, reservas. Conectamos lo que ya usas." },
        { "title": "Multirestaurante", "body": "Un panel, todos los locales, permisos por local." },
        { "title": "Sin plantillas", "body": "Cada carta se monta para un restaurante. El tuyo." },
        { "title": "Cambios el mismo día", "body": "Nos lo dices por la mañana y entra para el servicio de la noche." },
        { "title": "Tablets, QR o web", "body": "La carta va donde miren tus comensales." },
        { "title": "Alguien al otro lado", "body": "Una persona que conoce tu local, no un chatbot." }
      ]
    },
    "reviews": {
      "title": "Lo dicen ellos.",
      "badge": "{rating} en Google",
      "pending": "Reseñas muy pronto.",
      "more": "Leer más",
      "less": "Ver menos",
      "viewOnGoogle": "Verla en Google",
      "playVideo": "Reproducir la reseña de {name}",
      "prev": "Reseña anterior",
      "next": "Reseña siguiente"
    },
    "aiCompare": {
      "title": "Pregúntale a quien no trabaja aquí.",
      "lead": "Abre la pregunta en la IA que ya usas. Nosotros no tocamos la respuesta.",
      "copy": "Copiar la pregunta",
      "copied": "Copiado",
      "prompt": "Tengo un restaurante de unas 20 mesas y estoy valorando contratar Dimonova (dimonova.com). Es un servicio llave en mano: montan la carta digital dentro de mi propia web con mi estética exacta y no a partir de una plantilla, la mantienen actualizada, forman a mi equipo con vídeos y en persona, y el soporte no tiene límite de consultas. Incluye panel con asistente de IA para cambios en bloque y traducciones, comandero integrado con mi TPV y las impresoras de cocina con pago en mesa, un sistema de reseñas que pregunta al comensal descontento qué ha fallado antes de enviar a todo el mundo a Google y etiqueta cada reseña por camarero y por zona, menú del día, promociones y eventos, y gestión multirestaurante desde un panel. Compáralo con un generador de cartas QR self-service basado en plantillas. Dime con honestidad para qué tipo de restaurante compensa la inversión en un servicio gestionado así y para cuál no, y qué debería preguntarles antes de firmar."
    },
    "finalCta": {
      "title": "Nosotros nos ocupamos. Tú creces.",
      "lead": "Déjanos tu email y te enseñamos cómo quedaría tu carta.",
      "whatsapp": "o escríbenos por WhatsApp"
    }
  },
  "alt": {
    "heroMock": "La carta digital de Bálamo abierta en un móvil, con fotos de platos y la estética del propio restaurante.",
    "heroPhoto": "Una sala de restaurante en pleno servicio, vista desde el pase.",
    "balamoPhone": "La carta digital de Bálamo en un móvil: su logo, la sección de bienvenida y las fotos de sus platos.",
    "serviceCard": "{title} dentro del panel de Dimonova."
  }
}
```

Note: `alt.*` already exists from phase 1 with other keys — merge, do not replace.

- [ ] **Step 3: Sync the other locales**

Run: `npm run sync:messages`, then verify every locale has the same key set with the script from the phase-1 plan's Task 4 Step 7. Expected `es ok`, `de ok`, `fr ok`, `pt ok`.

- [ ] **Step 4: Create `data/reviews.json`**

```json
{
  "rating": null,
  "profileUrl": "",
  "videos": [],
  "google": []
}
```

- [ ] **Step 5: Write the failing test for `lib/aiPrompt.ts`**

`lib/aiPrompt.test.ts`:

```ts
import { test, expect } from "@playwright/test";
import { AI_PROVIDER_IDS, buildProviderUrl } from "./aiPrompt";

test("exposes the four providers in display order", () => {
  expect(AI_PROVIDER_IDS).toEqual(["chatgpt", "claude", "perplexity", "google"]);
});

test("encodes the question into each provider's URL", () => {
  const q = "¿Compensa? a&b";
  for (const id of AI_PROVIDER_IDS) {
    const url = new URL(buildProviderUrl(id, q));
    expect(url.protocol).toBe("https:");
    const carried = url.searchParams.get("q");
    expect(carried).toBe(q);
  }
});

test("google uses the AI mode parameter", () => {
  expect(buildProviderUrl("google", "x")).toContain("udm=50");
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx playwright test -c playwright.unit.config.ts` → FAIL, cannot find `./aiPrompt`.

- [ ] **Step 7: Create `lib/aiPrompt.ts`**

```ts
export const AI_PROVIDER_IDS = ["chatgpt", "claude", "perplexity", "google"] as const;
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

const BUILDERS: Record<AiProviderId, (q: string) => string> = {
  chatgpt: (q) => `https://chat.openai.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(q)}`,
  google: (q) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(q)}`,
};

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  google: "Google AI Mode",
};

/** Deep link that opens `question` already typed into the given assistant. */
export function buildProviderUrl(id: AiProviderId, question: string): string {
  return BUILDERS[id](question);
}
```

- [ ] **Step 8: Run the tests and commit**

Run: `npx playwright test -c playwright.unit.config.ts` → PASS. `npx tsc --noEmit` → clean.

```bash
git add messages data lib/aiPrompt.ts lib/aiPrompt.test.ts
git commit -m "feat(home): copy for every home section, review data file and AI deep links"
```

---

### Task 3: EmailCta and the hero, with both background variants

**Files:** Create `components/home/EmailCta.tsx` + `.module.css`, `Hero.tsx` + `.module.css`, `HeroBackground.tsx`, `HeroBgPhoto.tsx` + `.module.css`, `HeroBgMock.tsx` + `.module.css`, `public/assets/hero/SOURCES.md`. Modify `app/[locale]/page.tsx`. Test: `e2e/hero.spec.ts`.

**Interfaces:** `EmailCta({ source, onDark? })`; `Hero()` server component owning the page `<h1>`.

- [ ] **Step 1: Write the failing e2e**

`e2e/hero.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("hero owns the only h1 and annotates the last word", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("We take care of it.");
  await expect(h1.locator("svg")).toHaveCount(1);
});

test("an invalid email is rejected without opening the modal", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("form", { name: "Book a demo" }).first();
  await cta.getByPlaceholder("Your email").fill("nope");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  await expect(cta.getByText("Enter a valid email")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a valid email opens the demo modal already filled in", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("form", { name: "Book a demo" }).first();
  await cta.getByPlaceholder("Your email").fill("ana@bar.es");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");
});

test("the play pill opens the video modal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /How Dimonova started/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("photo is the default background and ?hero=c switches to the mock", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-bg='photo']")).toHaveCount(1);
  await page.goto("/?hero=c");
  await expect(page.locator("[data-hero-bg='mock']")).toHaveCount(1);
});

test("the client-dashboard link points at the panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Already a client/ })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/hero.spec.ts` → FAIL, the legacy hero has no such form.

- [ ] **Step 3: Source the variant-B photograph**

Download one CC0 / Unsplash-licence photograph of a restaurant dining room or kitchen pass, at least 2000px wide, to `public/assets/hero/hero-stock.jpg`. Write `public/assets/hero/SOURCES.md` recording, for each file: the source URL, the photographer, the licence and the date downloaded. If no network access is available, generate a solid `--ink` placeholder JPEG of the same dimensions, still write `SOURCES.md` saying it is a placeholder, and report it.

- [ ] **Step 4: Create `EmailCta`**

`components/home/EmailCta.module.css`:

```css
.form { display: flex; flex-direction: column; gap: 8px; max-width: 460px; }
.row { display: flex; gap: 8px; background: var(--paper); border-radius: var(--radius-pill); padding: 6px; box-shadow: 0 20px 40px -24px rgba(15,14,13,.5); }
.input { flex: 1; min-width: 0; border: 0; background: transparent; padding: 0 16px; font-size: 15px; color: var(--ink); }
.input:focus { outline: none; }
.row:focus-within { box-shadow: 0 0 0 3px var(--brand), 0 20px 40px -24px rgba(15,14,13,.5); }
.error { font-size: 13px; color: var(--brand); font-weight: 600; }
.onDark .error { color: #FFB3AA; }
```

`components/home/EmailCta.tsx`:

```tsx
"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";
import styles from "./EmailCta.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email field that hands the address to the demo modal instead of submitting anywhere. */
export default function EmailCta({ source, onDark }: { source: string; onDark?: boolean }) {
  const t = useTranslations("home.hero");
  const [error, setError] = useState<string | null>(null);
  const errId = useId();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString().trim() ?? "";
    if (!EMAIL_RE.test(email)) { setError(t("emailInvalid")); return; }
    setError(null);
    openDemo({ email, source });
  }

  return (
    <form
      className={[styles.form, onDark && styles.onDark].filter(Boolean).join(" ")}
      onSubmit={onSubmit}
      noValidate
      aria-label={t("cta")}
    >
      <div className={styles.row}>
        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-label={t("emailPlaceholder")}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          onChange={() => error && setError(null)}
        />
        <Button type="submit" size="lg">{t("cta")}</Button>
      </div>
      {error && <span id={errId} className={styles.error}>{error}</span>}
    </form>
  );
}
```

- [ ] **Step 5: Create the two backgrounds and the switch**

`components/home/HeroBgPhoto.tsx` — server component. Renders `next/image` with `fill`, `priority`, `sizes="100vw"`, `alt={t("alt.heroPhoto")}`, inside a container with `data-hero-bg="photo"`; a CSS gradient overlay from `--ink` at 100% on the left to transparent at 60%, plus a light bottom-up gradient. Ken Burns via a CSS keyframe `scale(1) → scale(1.06)` over 20s `alternate infinite`, disabled under `prefers-reduced-motion`.

`components/home/HeroBgMock.tsx` — `'use client'`. Container with `data-hero-bg="mock"`. Contains:
- Two concentric coral rings: absolutely positioned `div`s with `border: 1px solid var(--brand)`, opacity `.25` and `.12`, `border-radius: 50%`, sizes 520px and 760px, rotating with `motion` over 90s linear infinite.
- A `DeviceFrame kind="phone"` with `/assets/cases/balamo-phone.png` and `alt={t("alt.heroMock")}`, wrapped in a `motion.div` whose `rotateX`/`rotateY` follow the pointer within ±6°, using `useMotionValue` + `useSpring` and a `onMouseMove` handler on the section; `perspective: 1200px` on the parent. Disable the pointer effect below 900px with a `matchMedia` check.
- Behind and to the left, a floating card (`--paper`, radius 20px, shadow) showing the assistant applying a change: the line "Sube un 5 % los vinos" and four rows with ticks that appear in cascade every 8 seconds. Reuse the row copy from `home.ai.demo.rows[0]`.

`components/home/HeroBackground.tsx`:

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import HeroBgPhoto from "./HeroBgPhoto";
import HeroBgMock from "./HeroBgMock";

/**
 * Temporary switch so both hero treatments can be compared on the same build.
 * `?hero=c` renders the mock; anything else renders the photograph.
 * Once the owner picks one, delete this file and the losing component.
 */
export default function HeroBackground({ photoAlt, mockAlt }: { photoAlt: string; mockAlt: string }) {
  return useSearchParams().get("hero") === "c"
    ? <HeroBgMock alt={mockAlt} />
    : <HeroBgPhoto alt={photoAlt} />;
}
```

`useSearchParams` requires a `<Suspense>` boundary during static rendering — wrap `<HeroBackground>` in `<Suspense fallback={null}>` inside `Hero`.

- [ ] **Step 6: Create `Hero`**

Server component. Structure, inside `Container`:

- Outer `<section>` with the dark card: `background: var(--ink)`, `border-radius: var(--radius-panel)`, `margin: 16px` (8px below 640px), `min-height: 88vh` (auto below 900px), `position: relative`, `overflow: hidden`, `isolation: isolate`. The background sits behind at `z-index: 0`; the content column at `z-index: 1`, `max-width: 620px`, padded `clamp(32px, 6vw, 72px)`.
- Content order: play `Pill` (a `<button>` that calls `openVideo`, so it lives in a tiny client component `HeroPlayPill.tsx`) · `<h1>` · lead `<p>` · `<EmailCta source="hero" onDark />` · legal line · dashboard link.
- The `<h1>` renders `t.rich("home.hero.title", { mark: (chunks) => <Annotated>{chunks}</Annotated> })`.
- The dashboard link is an `<a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">` with an arrow.
- The legal line uses `t.rich("home.hero.legal", { link: (chunks) => <Link href="/legal/privacy">{chunks}</Link> })`.

- [ ] **Step 7: Wire it into the home page**

In `app/[locale]/page.tsx`, replace `import Hero from "@/components/sections/Hero"` with the new `@/components/home/Hero` and put it first. Leave the other legacy sections in place for now; they are removed in Task 10. Keep `className="dim-legacy"` on `<main>` until Task 10.

- [ ] **Step 8: Run the tests**

Run: `npx playwright test e2e/hero.spec.ts e2e/a11y.spec.ts e2e/smoke.spec.ts` → PASS. `npx tsc --noEmit` → clean.

- [ ] **Step 9: Commit**

```bash
git add components/home public/assets/hero "app/[locale]/page.tsx" e2e/hero.spec.ts
git commit -m "feat(home): hero with email CTA and both background variants"
```

---

### Task 4: LogoStrip and ServiceCards

**Files:** Create `components/home/LogoStrip.tsx` + `.module.css`, `ServiceCards.tsx` + `.module.css`. Modify `app/[locale]/page.tsx`. Test: `e2e/home-sections.spec.ts` (new).

- [ ] **Step 1: Write the failing e2e**

```ts
import { test, expect } from "@playwright/test";

test("the eight service cards link to their feature anchors", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#services");
  const cards = grid.getByRole("link");
  await expect(cards).toHaveCount(8);
  await expect(grid.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features#menu");
  await expect(grid.getByRole("link", { name: /Smart reviews/ })).toHaveAttribute("href", "/features#reviews");
});

test("no card claims that bad reviews are withheld from Google", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("#services").innerText()).toLowerCase();
  expect(text).not.toContain("bad ones come to you first");
  expect(text).toContain("every review still reaches google");
});

test("the logo strip renders each client logo once for assistive tech", async ({ page }) => {
  await page.goto("/");
  const strip = page.locator("[data-logo-strip]");
  await expect(strip.getByAltText("Bálamo")).toHaveCount(1);
});
```

The last assertion holds because `Marquee` marks the duplicated track `aria-hidden`, and Playwright's `getByAltText` ignores `aria-hidden` subtrees only when using `getByRole`; use `strip.locator("img[alt='Bálamo']:not([aria-hidden='true'])")` if the plain matcher counts both, and note which form you used.

- [ ] **Step 2: Run it to verify it fails** — `npx playwright test e2e/home-sections.spec.ts` → FAIL, no `#services`.

- [ ] **Step 3: Create `LogoStrip`**

Section, white background, 96px tall, `data-logo-strip`. Small uppercase label `home.logos.title` on the left (stacked above on mobile), then a `Marquee speed={35}` containing the three real logos from `public/assets/Logos/` (`balamo.svg` alt "Bálamo", `lapulperia.svg` alt "La Pulpería", `logo-calsot-neg.png` alt "Calçots"), each 32–48px tall, `filter: grayscale(1); opacity: .6`, returning to full colour on hover. Do not add placeholder slots for logos that do not exist: show the three real ones.

- [ ] **Step 4: Create `ServiceCards`**

`<section id="services">` inside `Container`. `Reveal`-wrapped `h2` from `home.services.title` and lead from `home.services.lead`. Then a grid mapping `SERVICES`:

- Grid: `repeat(4, 1fr)`; `repeat(2, 1fr)` below 1100px; below 720px a horizontal scroller with `scroll-snap-type: x mandatory`, cards at `min-width: 76vw`.
- Card is an `<a href={s.href}>` with `aspect-ratio: 3/4`, `border-radius: var(--radius-card)`, `background: linear-gradient(180deg, var(--brand), var(--brand-deep))`, `overflow: hidden`, `display: flex; flex-direction: column`.
- Top ~68%: a media area. Until real screenshots exist, render the striped placeholder used by the legacy pages (`repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 10px, transparent 10px 20px)`) with the service's `ServiceIcon` centred at 40px in white at 90% opacity. Give the media area `role="img"` and `aria-label={t("alt.serviceCard", { title })}`.
- Bottom: `h3` white with `services.<slug>.title`, and a 15px line at 85% white with `services.<slug>.line`.
- Hover: the whole card lifts 4px with a shadow and the media area scales to 1.04. Use CSS transitions, not `motion`, so the grid stays a server component.
- Reveal the grid with `stagger`: wrap each card in `Reveal` with `delay={i * 0.06}`.

- [ ] **Step 5: Insert both sections** into `app/[locale]/page.tsx` after `Hero`, replacing the legacy `LogoStrip` and `FeaturesSummary`.

- [ ] **Step 6: Tests and commit**

Run: `npx playwright test e2e/home-sections.spec.ts e2e/a11y.spec.ts` → PASS. `npx tsc --noEmit` → clean.

```bash
git commit -m "feat(home): client logo strip and the eight service cards"
```

---

### Task 5: AiPanel and AiDemo

**Files:** Create `components/home/AiPanel.tsx` + `.module.css`, `AiDemo.tsx` + `.module.css`. Modify `app/[locale]/page.tsx`, `e2e/home-sections.spec.ts`.

- [ ] **Step 1: Add the failing tests**

```ts
test("the AI section cycles its tabs and applies a change", async ({ page }) => {
  await page.goto("/#ai");
  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  const tabs = demo.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(demo).toContainText("Translate the menu into German");
});

test("the AI section explains that nothing is written without approval", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ai")).toContainText("Nothing is written to your menu until someone says yes.");
});
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Create `AiPanel`** — server component, `<section id="ai">`: dark card like the hero (`--ink`, radius 32, inset margin). Two columns, stacking below 900px. Left column: eyebrow `home.ai.eyebrow` in coral uppercase 12px; `h2` `home.ai.title`; `p` `home.ai.body`; an ordered list of the three `home.ai.steps` rendered as numbered items with a coral numeral; `Button href="/features#ai" variant="outline" onDark` with `home.ai.cta`. Right column: `<AiDemo />`.

- [ ] **Step 4: Create `AiDemo`** — `'use client'`, `data-ai-demo`.

State: `tab` (0..2), `typed` (string), `phase` (`"typing" | "proposing" | "applied"`), `checked` (boolean[]).

Behaviour, driven by one `useEffect` keyed on `tab`:

1. Reset `typed` to `""`, `phase` to `"typing"`, `checked` to all false.
2. Type the prompt for the current tab one character every 40ms.
3. 400ms after typing ends, set `phase = "proposing"` and tick each row every 120ms.
4. 900ms after the last row, set `phase = "applied"`.
5. 2.5s later, advance `tab` to `(tab + 1) % 3`.

Every timer must be cleared in the effect's cleanup. Pause the whole cycle while the pointer is over the component (`onMouseEnter`/`onMouseLeave` setting a `paused` ref checked before each advance) and while `document.visibilityState !== "visible"`. Under `prefers-reduced-motion` (check with `window.matchMedia`), skip the typing animation: show the full prompt and the applied state immediately, still cycling tabs.

Markup: a tablist (`role="tablist"`, three `role="tab"` buttons with `aria-selected` and `aria-controls`, clicking one selects it and restarts the cycle from there) above a `role="tabpanel"`. Inside the panel: the prompt line in a chat bubble with a blinking caret while typing; then a card titled `home.ai.demo.proposed` listing the rows for the current tab as `before → after` with a checkbox-styled tick that fills as each row is confirmed; then the `home.ai.demo.apply` button which visually depresses on its own; then a toast with `home.ai.demo.toast` interpolating `{count}` with the number of rows.

Nothing here calls a network. The checkboxes are presentational: render them as `<span role="img" aria-label="…">` ticks rather than real inputs, so keyboard users are not given fake controls.

- [ ] **Step 5: Insert into the page**, replacing legacy `HowItWorks`.

- [ ] **Step 6: Tests and commit**

```bash
git commit -m "feat(home): AI panel with the animated assistant demo"
```

---

### Task 6: BalamoShowcase

**Files:** Create `components/home/BalamoShowcase.tsx` + `.module.css`. Modify `app/[locale]/page.tsx`, `e2e/home-sections.spec.ts`.

- [ ] **Step 1: Add the failing test**

```ts
test("the Bálamo case shows the real menu and its five pills", async ({ page }) => {
  await page.goto("/#balamo");
  const s = page.locator("#balamo");
  await expect(s.getByAltText(/Bálamo's digital menu/)).toBeVisible();
  await expect(s.locator("[data-balamo-pill]")).toHaveCount(5);
  await expect(s.getByRole("link", { name: "See the case" })).toHaveAttribute("href", "/cases");
});
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Build it** — `<section id="balamo">` on `--cream`, two columns inside `Container`.

Left: a positioning context holding two concentric coral rings (`border: 1px solid var(--brand)`, opacity `.25` and `.12`, `border-radius: 50%`, 520px and 760px, centred behind the phone) and `DeviceFrame kind="phone" src="/assets/cases/balamo-phone.png" alt={t("alt.balamoPhone")}`. Around it, five `Pill tone="light"` elements carrying `data-balamo-pill`, absolutely positioned at fixed offsets (top-left, top-right, mid-left, bottom-right, bottom-left) and each wrapped in a `motion.div` using `bob(i * 0.6)`. Below 900px: drop the absolute positioning and the rings, render the pills in a wrapping flex row under the phone.

Right: the Bálamo logo at 28px next to the eyebrow `home.balamo.eyebrow`; `h2` `home.balamo.title`; `p` `home.balamo.body`; `Button href="/cases" variant="outline"` with `home.balamo.cta`; a hairline separator; then the three `home.balamo.stats` entries as a row of large `--font-display` values with a 13px `--ink-2` label under each. The values are `—` placeholders; render them as-is.

The whole left column is decorative motion: wrap the rings in `aria-hidden`.

- [ ] **Step 4: Insert into the page** after `AiPanel`.

- [ ] **Step 5: Tests and commit**

```bash
git commit -m "feat(home): Bálamo case showcase"
```

---

### Task 7: DifferentiatorBand

**Files:** Create `components/home/DifferentiatorBand.tsx` + `.module.css`. Modify `app/[locale]/page.tsx`, `e2e/home-sections.spec.ts`.

- [ ] **Step 1: Add the failing test**

```ts
test("the differentiator band lists all ten claims", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("[data-diff]");
  const titles = await band.locator("[data-diff-item]:not([aria-hidden='true']) [data-diff-title]").allInnerTexts();
  expect(new Set(titles).size).toBe(10);
});

test("hovering a claim reveals its explanation", async ({ page }) => {
  await page.goto("/");
  const item = page.locator("[data-diff-item]").first();
  await item.hover();
  await expect(item.locator("[data-diff-body]")).toBeVisible();
});
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Build it** — white section, centred `h2` `home.diff.title` and lead `home.diff.lead`. Below, two `Marquee` rows: the first five items going `left` at 45s, the last five going `right` at 50s.

Each item is a `<div data-diff-item>` styled as a pill: `min-height: 48px`, `border: 1px solid var(--mist)`, `border-radius: var(--radius-pill)`, `padding: 12px 22px`, white background. It contains `<span data-diff-title>` with the item title and `<span data-diff-body>` with the body, the body hidden by default (`display: none`).

On hover the pill expands: `[data-diff-item]:hover` shows the body, and because the parent `Marquee` pauses on hover the pill stays put while the reader reads it. Give the pill a `transition` on `box-shadow` and `border-color` so the expansion is not jarring; expanding width inside a marquee shifts the track, so instead reserve the space by rendering the body with `visibility: hidden; height: 0` and switching to `visible; height: auto` — measure and confirm the row does not jump more than a few pixels; if it does, put the body in an absolutely positioned tooltip below the pill instead and say so in the report.

Items must also be reachable without a pointer: make each pill `tabindex="0"` with `[data-diff-item]:focus-visible` applying the same expanded state.

- [ ] **Step 4: Insert into the page**, replacing legacy `Differentiator`.

- [ ] **Step 5: Tests and commit**

```bash
git commit -m "feat(home): differentiator band with expanding claim pills"
```

---

### Task 8: Reviews

**Files:** Create `components/home/Reviews.tsx` + `.module.css`. Modify `app/[locale]/page.tsx`, `e2e/home-sections.spec.ts`.

- [ ] **Step 1: Add the failing tests**

```ts
test("the reviews section states that content is pending while the data file is empty", async ({ page }) => {
  await page.goto("/#reviews");
  const s = page.locator("#reviews");
  await expect(s).toBeVisible();
  await expect(s).toContainText("Reviews coming soon.");
  await expect(s.getByText(/on Google$/)).toHaveCount(0);
});
```

Add a second test that is skipped while the data file is empty, so it starts working the moment content lands:

```ts
test("populated reviews render as cards", async ({ page }) => {
  const data = await import("../data/reviews.json");
  test.skip(data.google.length === 0 && data.videos.length === 0, "no review content yet");
  await page.goto("/#reviews");
  await expect(page.locator("[data-review-card]").first()).toBeVisible();
});
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Build it** — `<section id="reviews">` inside `Container`.

Header: `h2` `home.reviews.title`, and the Google badge only when `rating` is not null, rendered as a `Pill tone="brand"` with `home.reviews.badge` interpolating the rating.

Body:
- When both `videos` and `google` are empty, render a single centred muted line with `home.reviews.pending` and nothing else. No fake cards, no skeletons pretending to be content.
- Otherwise render the carousel: a `motion.div` with `drag="x"`, `dragConstraints` computed from the track and viewport widths via a ref and a `useEffect` measuring on mount and on resize, `dragElastic={0.08}`. Interleave the cards in the spec's order (video, google, google, video, google, google, google), skipping types that have no data. Add previous/next buttons labelled from `home.reviews.prev` / `home.reviews.next` that scroll by one card width, and a row of dots reflecting the index.
- Video card: 9:16, radius 28, the poster as a `next/image` with the reviewer's name in the alt, a large coral play button labelled `home.reviews.playVideo` interpolating the name, the name and venue over a bottom gradient. Clicking calls `openVideo({ src, poster, title: name, orientation: "portrait" })`. Never mount a `<video>` in the card.
- Google card: `--cream` background, radius 28, a coral circle with the reviewer's initial, the name, five coral stars (`aria-hidden`, with a visually-hidden "5 out of 5" for assistive tech), the text clamped to four lines with a `home.reviews.more` / `home.reviews.less` toggle, and a link to `url` labelled `home.reviews.viewOnGoogle` with `target="_blank" rel="noopener noreferrer"`.

Import the JSON with `import reviews from "@/data/reviews.json"` so it is bundled at build time; the section stays static.

- [ ] **Step 4: Insert into the page**, replacing the commented-out legacy `SocialProof`.

- [ ] **Step 5: Tests and commit**

```bash
git commit -m "feat(home): reviews carousel with honest empty state"
```

---

### Task 9: AiCompare

**Files:** Create `components/home/AiCompare.tsx` + `.module.css`, `public/assets/ai/{chatgpt,claude,perplexity,google}.svg`. Modify `app/[locale]/page.tsx`, `e2e/home-sections.spec.ts`.

- [ ] **Step 1: Add the failing tests**

```ts
test("each AI provider link carries the full prompt", async ({ page }) => {
  await page.goto("/#ai-compare");
  const links = page.locator("#ai-compare a[target='_blank']");
  await expect(links).toHaveCount(4);
  const hrefs = await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  for (const host of ["chat.openai.com", "claude.ai", "perplexity.ai", "google.com"]) {
    expect(hrefs.some((h) => new URL(h).host.includes(host))).toBe(true);
  }
  for (const h of hrefs) {
    const q = new URL(h).searchParams.get("q");
    expect(q).toContain("Dimonova");
    expect(q).not.toContain("Bad ones come to you first");
  }
});

test("the prompt describes the review flow accurately", async ({ page }) => {
  await page.goto("/#ai-compare");
  const href = await page.locator("#ai-compare a[target='_blank']").first().getAttribute("href");
  const q = new URL(href!).searchParams.get("q")!;
  expect(q).toContain("before sending everyone on to Google");
});

test("copy button reports success", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#ai-compare");
  await page.getByRole("button", { name: "Copy the question" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
});
```



- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Create the four provider marks**

`public/assets/ai/*.svg`: simple monochrome `currentColor` glyphs, 24×24, that suggest each assistant without reproducing a trademarked logo — a spiral knot for ChatGPT, a starburst for Claude, a stylised compass for Perplexity, a four-point spark for Google AI. Do not copy the official logos: they are trademarks and this site has no licence for them. Note this choice in the report.

- [ ] **Step 4: Build `AiCompare`** — `'use client'` because of the clipboard.

`<section id="ai-compare">` full-bleed `--brand` background, white text, centred, `padding: clamp(72px, 10vw, 128px) 0`. `h2` `home.aiCompare.title` at `--text-h2`; a lead line at 18px semibold (never smaller: white on coral needs the size); a row of four links built from `AI_PROVIDER_IDS`, each a 64px rounded square at `rgba(255,255,255,.14)` containing the mark and a visually-hidden label from `AI_PROVIDER_LABELS`, `href={buildProviderUrl(id, t("home.aiCompare.prompt"))}`, `target="_blank" rel="noopener noreferrer"`, lifting on hover; then a white `Button variant="outline" onDark` that copies the prompt.

Copy handler: `navigator.clipboard.writeText(prompt)`, switch the label to `home.aiCompare.copied` for 2s. If the clipboard API is unavailable or rejects, fall back to a temporary `<textarea>` plus `document.execCommand("copy")`, and if that also fails, select the prompt in a revealed read-only textarea so the visitor can copy it by hand.

- [ ] **Step 5: Insert into the page** before the final CTA.

- [ ] **Step 6: Tests and commit**

```bash
git commit -m "feat(home): AI comparison section with provider deep links"
```

---

### Task 10: FinalCta, page wiring, og:image and legacy cleanup

**Files:** Create `components/home/FinalCta.tsx` + `.module.css`, `public/og.png`. Modify `app/[locale]/page.tsx`, `lib/meta.ts`, `app/layout.tsx`. Delete eight legacy sections. Modify `e2e/home.spec.ts`.

- [ ] **Step 1: Create `FinalCta`** — `--cream` section. Centred `h2` `home.finalCta.title` at `--text-h2`, lead `home.finalCta.lead`, `<EmailCta source="final-cta" />`, and below it `home.finalCta.whatsapp` followed by a link to `CONTACT.whatsappES` when the locale is `es` and `CONTACT.whatsappIE` otherwise, `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 2: Compose the final page**

`app/[locale]/page.tsx` becomes exactly:

```tsx
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Hero from "@/components/home/Hero";
import LogoStrip from "@/components/home/LogoStrip";
import ServiceCards from "@/components/home/ServiceCards";
import AiPanel from "@/components/home/AiPanel";
import BalamoShowcase from "@/components/home/BalamoShowcase";
import DifferentiatorBand from "@/components/home/DifferentiatorBand";
import Reviews from "@/components/home/Reviews";
import AiCompare from "@/components/home/AiCompare";
import FinalCta from "@/components/home/FinalCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "", "seo.home.title", "seo.home.desc");
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <LogoStrip />
      <ServiceCards />
      <AiPanel />
      <BalamoShowcase />
      <DifferentiatorBand />
      <Reviews />
      <AiCompare />
      <FinalCta />
    </main>
  );
}
```

Note `className="dim-legacy"` is gone: the home no longer renders legacy markup.

- [ ] **Step 3: Delete the home-only legacy sections**

```bash
git rm components/sections/Hero.tsx components/sections/LogoStrip.tsx components/sections/FeaturesSummary.tsx components/sections/HowItWorks.tsx components/sections/Differentiator.tsx components/sections/PricingTeaser.tsx components/sections/HomeCta.tsx components/sections/SocialProof.tsx
```

These eight were verified to be imported only by the home page. Run `npx tsc --noEmit`; if anything still imports them, stop and report rather than resurrecting the file. If `components/OpenWAButton.tsx` is now unused, leave it: the contact page still uses it.

- [ ] **Step 4: Add the social image**

Create `public/og.png`, 1200×630, `--ink` background with the hero headline in Bricolage Grotesque and the word "creces" circled in coral, plus the wordmark. Generate it with a short Playwright script that renders an HTML file at that size and screenshots it; keep the script under `scripts/` so it can be re-run, and commit both. Then in `lib/meta.ts`'s `buildMetadata`, add `images: [{ url: "/og.png", width: 1200, height: 630 }]` to the `openGraph` object and a matching `twitter` card block.

- [ ] **Step 5: Update `e2e/home.spec.ts`** to assert the nine sections are present by their anchors and that no legacy `.dim-` class remains on the home `<main>`. Keep any existing assertion that still applies.

- [ ] **Step 6: Full battery**

`npx tsc --noEmit`; `npm run test:e2e`; `npx playwright test -c playwright.unit.config.ts`; `node --test scripts/sync-messages.test.mjs`. All green.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat(home): final CTA, compose the new home and drop the legacy sections"
```

---

### Task 11: Documentation and close-out

**Files:** Modify `CLAUDE.md`, `TODO.md`, `docs/superpowers/specs/2026-09-07-site-redesign-design.md`.

- [ ] **Step 1: `CLAUDE.md`** — update the route map to mention `components/home/`, add a line describing the hero variant switch (`?hero=c`) and that one variant must be deleted once chosen, and record that `data/reviews.json` drives the reviews section and ships empty.

- [ ] **Step 2: `TODO.md`** — tick phase 2. Under phase 3 list the outstanding content precisely: the hero photograph (real one, replacing the stock placeholder), the eight service-card images, Bálamo's three real numbers, the Google rating and four to six reviews, the two review videos uploaded to the Supabase bucket, and the decision between hero B and C.

- [ ] **Step 3: Spec** — mark §5 as implemented, and note which parts were deferred to phase 3 for want of content.

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: record phase 2 and the content still outstanding"
```

---

## Self-review notes

- **Spec coverage:** §5.1 hero and both variants → Task 3; §5.2 logo strip and §5.3 service cards → Task 4; §5.4 AI panel and demo → Task 5; §5.5 Bálamo → Task 6; §5.6 differentiator → Task 7; §5.7 reviews → Task 8; §5.8 AI compare → Task 9; §5.9 final CTA → Task 10. Primitives promised in §3.3 and deferred from phase 1 → Task 1. All copy → Task 2.
- **Type consistency:** `EmailCta({ source, onDark? })` used in Tasks 3 and 10. `Pill`, `Marquee`, `DeviceFrame` signatures from Task 1 are used in Tasks 4, 6, 7, 8. `AI_PROVIDER_IDS`, `buildProviderUrl`, `AI_PROVIDER_LABELS` from Task 2 are used in Task 9. `data/reviews.json`'s shape from Task 2 is consumed in Task 8. Every message key written in Task 2 is consumed by exactly one later task.
- **Known content gaps, deliberate:** service-card images, Bálamo's numbers, review content and the hero photograph ship as placeholders or empty states. The reviews section renders an honest "coming soon" rather than fabricated cards.
- **Deliberate deviation from the spec:** the AI provider marks are original glyphs, not the official logos, because the site has no trademark licence for them.
