// Generates public/assets/services/reviews-mock.webp: the screen inside the phone on the home
// page's "review system" service card (components/home/ServiceArt.tsx).
//
// The other two cards show real client menus captured at phone size (see
// public/assets/services/SOURCES.md). There is no review screen worth capturing yet, so this
// one is designed here: a fictional venue, a rating already given, the reason the product asks
// for, and the waiter and area the review is already tagged with — the link the diner opened
// carries both, so nothing is selected here, only shown. The venue, the name and the comment
// are invented; nothing here is a real person or a real review.
//
// Usage: node scripts/generate-reviews-mock.mjs   (re-run after editing the markup below)
//
// Renders a standalone HTML page with Playwright's Chromium at a 390x800 phone viewport, 2x,
// then resizes to the width ServiceArt.tsx expects (464px) and encodes WebP. The 390:800 frame
// is the phone screen's own 116:238 proportion, so nothing gets cropped when it is placed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/assets/services/reviews-mock.webp");

const WIDTH = 390;
const HEIGHT = 800;
const OUT_WIDTH = 464;

// Same colours as the design tokens in app/globals.css.
const INK = "#0F0E0D";
const INK_RAISED = "#201D1A";
const BRAND = "#FE5243";
const PAPER = "#FFFFFF";
const OK = "#1DB36B";

const STAR = "M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3l-6.1 3.4 1.5-6.7L2.3 9.4l6.8-.7z";

const star = (filled) =>
  `<svg viewBox="0 0 24 24" width="50" height="50" aria-hidden="true">
    <path d="${STAR}" fill="${filled ? BRAND : "none"}" stroke="${filled ? BRAND : "rgba(255,255,255,.55)"}" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;

function buildHtml() {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Instrument+Sans:wght@500;600;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: ${INK};
    color: ${PAPER};
    font-family: "Instrument Sans", system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    padding: 22px 22px 28px;
    gap: 22px;
  }
  .top {
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    align-items: center;
    text-align: center;
    padding-top: 14px;
  }
  .back { width: 32px; height: 32px; display: grid; place-items: center; color: rgba(255,255,255,.7); }
  .venue { font-family: "Instrument Serif", serif; font-style: italic; font-size: 24px; letter-spacing: .01em; }
  .where { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; letter-spacing: .04em; text-transform: uppercase; }
  h1 {
    font-family: "Bricolage Grotesque", system-ui, sans-serif;
    font-weight: 700;
    font-size: 30px;
    line-height: 1.05;
    letter-spacing: -.02em;
    margin-top: 6px;
  }
  .stars { display: flex; justify-content: space-between; padding: 0 6px; }
  .stars svg { display: block; }
  .rating { font-size: 14px; color: rgba(255,255,255,.62); text-align: center; margin-top: -8px; }
  .rating b { color: ${PAPER}; font-weight: 600; }
  .label { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 9px; }
  .field {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 16px;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.4;
    min-height: 96px;
  }
  .caret { display: inline-block; width: 2px; height: 17px; background: ${BRAND}; vertical-align: -3px; margin-left: 2px; }
  .served {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.16);
  }
  .avatar {
    flex: none;
    width: 44px; height: 44px; border-radius: 50%;
    display: grid; place-items: center;
    background: ${BRAND}; color: ${PAPER};
    font-size: 15px; font-weight: 700; letter-spacing: .02em;
  }
  .served .who { font-size: 15px; font-weight: 600; line-height: 1.3; }
  .served .who b { font-weight: 700; }
  .served .zone { font-size: 13px; color: rgba(255,255,255,.6); margin-top: 2px; }
  .cta {
    margin-top: 6px;
    height: 56px; border-radius: 999px;
    background: ${BRAND}; color: ${PAPER};
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-size: 17px; font-weight: 700; letter-spacing: -.01em;
  }
  .cta .g {
    width: 26px; height: 26px; border-radius: 50%; background: ${PAPER};
    display: grid; place-items: center;
  }
</style>
</head>
<body>
  <div class="top">
    <span class="back"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></span>
    <div>
      <div class="venue">La Marea</div>
      <div class="where">Reseña de tu visita</div>
    </div>
    <span></span>
  </div>

  <h1>¿Qué tal la cena?</h1>

  <div class="stars">${star(true)}${star(true)}${star(true)}${star(true)}${star(false)}</div>
  <div class="rating"><b>4 de 5</b> · Bien, con algo que mejorar</div>

  <div>
    <div class="label">¿Qué podríamos mejorar?</div>
    <div class="field">La carne llegó un poco fría. El resto, perfecto.<span class="caret"></span></div>
  </div>

  <div class="served">
    <span class="avatar">MA</span>
    <div>
      <div class="who">Te ha atendido <b>Marta</b></div>
      <div class="zone">Terraza · Mesa 12</div>
    </div>
  </div>

  <div class="cta">
    <span class="g"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${OK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
    Publicar en Google
  </div>
</body>
</html>`;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
  await page.setContent(buildHtml(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize({ width: OUT_WIDTH }).webp({ quality: 82 }).toFile(OUT);
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
}
