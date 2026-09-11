// Generates public/assets/textures/rough-black.webp: the rough, stucco-like black the home
// page's "Dashboard + AI" panel is painted with (components/home/AiPanel.module.css).
//
// Procedural rather than a stock photograph, so there is nothing to license and the tile is
// seamless by construction: two layers of SVG fractal noise over the --ink token — a coarse one
// for the mottling of a rendered wall and a fine one for the grit — with `stitchTiles` so the
// edges meet. Rendered once with Playwright's Chromium and stored as a small WebP, because
// a live SVG filter as a CSS background would be re-rasterised on every paint.
//
// Usage: node scripts/generate-texture.mjs   (re-run after changing the parameters below)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/assets/textures/rough-black.webp");

const SIZE = 512;
const INK = "#0F0E0D"; // --ink, app/globals.css

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <!-- Coarse mottling: the plaster's own unevenness. -->
    <filter id="coarse" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="4" seed="11" stitchTiles="stitch" result="n"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0.9 0.9 0 -0.42"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0 0.03 0.09"/></feComponentTransfer>
    </filter>
    <!-- Fine grit: the specks that catch the light. -->
    <filter id="grit" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 1.4 1.4 0 -0.95"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0 0 0.03 0.13"/></feComponentTransfer>
    </filter>
    <!-- Medium pitting: darker pores. -->
    <filter id="pores" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="3" seed="27" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 1.2 1.2 0 -0.7"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0 0.08 0.32"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${INK}"/>
  <rect width="100%" height="100%" filter="url(#coarse)"/>
  <rect width="100%" height="100%" filter="url(#pores)"/>
  <rect width="100%" height="100%" filter="url(#grit)"/>
</svg>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  await sharp(png).webp({ quality: 72 }).toFile(OUT);
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
}
