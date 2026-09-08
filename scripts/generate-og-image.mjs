// Generates public/og.png (1200x630) for social-share previews: --ink background, the home
// hero headline in Bricolage Grotesque with the last word circled in coral (same ellipse path
// as components/ui/Annotated.tsx), and the Dimonova wordmark. The headline text is read from
// messages/en.json at run time rather than retyped, so it never drifts from the real copy.
//
// Usage: node scripts/generate-og-image.mjs   (re-run any time the headline wording changes)
//
// Renders a standalone HTML file with Playwright's Chromium and screenshots it at the exact
// output size — no dev server required.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;

// Same ellipse path as components/ui/Annotated.tsx ("kind: ellipse") — a hand-drawn feel,
// slightly open circle. viewBox is 200x60, stretched over the annotated word.
const ELLIPSE_PATH =
  "M 30 8 C 90 -4, 190 2, 194 26 C 198 50, 120 62, 60 56 C 12 52, -2 30, 24 14";

function readHeadline() {
  const messages = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf8"));
  const raw = messages.home.hero.title; // e.g. "We take care of it. You <mark>grow</mark>."
  const match = raw.match(/^(.*)<mark>(.*)<\/mark>(.*)$/s);
  if (!match) {
    throw new Error(`Could not find a <mark>...</mark> word in home.hero.title: ${raw}`);
  }
  const [, before, word, after] = match;
  return { before, word, after };
}

function buildHtml({ before, word, after }) {
  const wordmarkUrl = pathToFileURL(path.join(ROOT, "public/assets/logo_horizontal.svg")).href;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0f0e0d;
    overflow: hidden;
  }
  body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding: 72px 96px;
    font-family: "Bricolage Grotesque", system-ui, sans-serif;
  }
  .wordmark {
    height: 44px;
    width: auto;
  }
  .headline-wrap {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .headline {
    font-size: 68px;
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #fff;
    max-width: 980px;
  }
  .word-wrap {
    position: relative;
    display: inline-block;
    white-space: nowrap;
  }
  .word-wrap svg {
    position: absolute;
    inset: -0.18em -0.25em;
    width: calc(100% + 0.5em);
    height: calc(100% + 0.36em);
    overflow: visible;
  }
  .word-wrap path {
    fill: none;
    stroke: #fe5243;
    stroke-width: 7;
    stroke-linecap: round;
  }
</style>
</head>
<body>
  <img class="wordmark" src="${wordmarkUrl}" alt="">
  <div class="headline-wrap">
    <div class="headline">${before}<span class="word-wrap">${word}<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="${ELLIPSE_PATH}" /></svg></span>${after}</div>
  </div>
</body>
</html>`;
}

async function main() {
  const headline = readHeadline();
  const html = buildHtml(headline);

  const tmpHtmlPath = path.join(ROOT, "scripts/.og-image.tmp.html");
  fs.writeFileSync(tmpHtmlPath, html, "utf8");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(tmpHtmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    // Belt-and-braces: make sure the 800-weight face actually rasterized before the shot.
    await page.waitForFunction(() => document.fonts.check('800 68px "Bricolage Grotesque"'));
    const outPath = path.join(ROOT, "public/og.png");
    await page.screenshot({ path: outPath });
    console.log(`Wrote ${outPath} (${WIDTH}x${HEIGHT})`);
  } finally {
    await browser.close();
    fs.unlinkSync(tmpHtmlPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
