# Dimonova website

The marketing website for **Dimonova** — done-for-you digital menus for
restaurants, pubs and cafés. We build, style, host and run the menu; the venue
just changes a dish in a couple of taps.

Six pages — **Home, Features, Pricing, Case studies, About,** and **Contact** —
with a contact/demo-request form and a WhatsApp chat widget. Available in five
languages: English, Spanish, German, French, and Portuguese.

## Run locally

```bash
npm install
npm run dev        # starts on http://localhost:3100
npm run sync:messages  # copy missing keys from en.json to the other locales
```

## Publish

Hosted on **Vercel**. To publish:

```bash
vercel            # creates a private preview link
vercel --prod     # publishes to the live site
```

(Needs the Vercel CLI: `npm i -g vercel && vercel login`.)

## What still needs doing before launch

There's a checklist in **[`TODO.md`](./TODO.md)**. Main items:

- **Real content** — case studies, testimonials, team members, venue logos, and placeholder images need swapping for real content
- **Translated copy** — SEO titles/descriptions and body copy are currently English in all locales; translations needed for es/de/fr/pt
- **Contact form backend** — currently shows a success message but doesn't send anywhere yet
- **`og:image`** — social share image not yet set

## Tech

Next.js 16, TypeScript, App Router, SSG. `next-intl` for i18n (5 locales,
English at root `/`, others at `/{locale}/`). Inline styles via a small
`s(css)` helper that parses CSS strings into React style objects.

The original static HTML/CSS/JS site lives in `archive/` as source of truth
for markup and content. Developer notes are in **[`CLAUDE.md`](./CLAUDE.md)**.
