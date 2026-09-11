import type { ReactNode } from "react";
import type { ServiceSlug } from "@/lib/services";
import styles from "./ServiceArt.module.css";

/**
 * The illustration on each home service card, one per service.
 *
 * Drawn scenes with real screens inside them. The phones on the menu and ordering cards show
 * actual client menus (Bálamo's and Le Club's, captured at phone size) and the reviews phone a
 * designed rating screen (see `public/assets/services/SOURCES.md` for all three); everything
 * around them is SVG, which costs no request, stays sharp at any density and carries no text to
 * translate.
 *
 * Every card is the same scene told three ways: the diner's **screen** (a dark phone, the same
 * `--ink-raised` panel the service-page heroes use) and the piece of **paper** the service turns
 * it into — a dish card and the language chips, the ticket in the kitchen, the review that reaches
 * Google. The paper is what the restaurant actually gets, so it is the layer that lifts on hover.
 *
 * Every one is `aria-hidden`: the card's own heading and line already say what the service is, so
 * a description here would only make a screen reader say it twice. They are still apart from that
 * hover lift — the card already scales its media, and three looping animations side by side in a
 * row would fight each other.
 *
 * Shared vocabulary: a 300x272 viewBox (the media box's own proportion, so the drawing fills it
 * edge to edge and the phone can run off the bottom into the card's body), `currentColor`
 * inherited from `.media` for the white line-work, tokens for everything else. Gradient stops,
 * shadow colours and every fill come from the stylesheet, so there is no palette in this file.
 */
export function ServiceArt({ slug }: { slug: ServiceSlug }) {
  return (
    <svg className={styles.art} viewBox="0 0 300 272" fill="none" aria-hidden="true" focusable="false">
      <Defs slug={slug} />
      <circle cx="150" cy="150" r="124" className={styles.halo} />
      {ART[slug]}
    </svg>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Shared parts
 * ------------------------------------------------------------------------------------------- */

/** Ids are prefixed per slug because all three drawings share one document. */
const id = (slug: ServiceSlug, name: string) => `svc-${slug}-${name}`;

function Defs({ slug }: { slug: ServiceSlug }) {
  return (
    <defs>
      {/* A diagonal sheen across the phone's glass. */}
      <linearGradient id={id(slug, "glare")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" className={styles.stopGlareStart} />
        <stop offset="0.55" className={styles.stopGlareEnd} />
      </linearGradient>
      {/* The phone's screen, for clipping a screenshot to its rounded corners. */}
      <clipPath id={id(slug, "screen")}>
        <rect width={PHONE.w - PHONE.bezel * 2} height={PHONE.h - PHONE.bezel * 2} rx={PHONE.r - PHONE.bezel} />
      </clipPath>
      <filter id={id(slug, "shadow")} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" className={styles.shadow} />
      </filter>
      <filter id={id(slug, "shadowSoft")} x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" className={styles.shadowSoft} />
      </filter>
    </defs>
  );
}

const PHONE = { w: 128, h: 250, r: 24, bezel: 6 } as const;

/**
 * The diner's phone. `shot` is a screenshot cut to the screen's own 116:238 proportion, so it
 * fills the glass with nothing cropped; children are drawn over it in screen coordinates (origin
 * at the screen's top-left, 116 wide). Placed with `x`/`y`/`rotate`; on the menu and reviews
 * cards it runs off the bottom of the media box on purpose, tucked behind the card's body.
 * The "reviews" mock is cut so its button stays above that crop.
 */
function Phone({ slug, x, y, rotate, shot, children }: { slug: ServiceSlug; x: number; y: number; rotate: number; shot?: string; children?: ReactNode }) {
  const sw = PHONE.w - PHONE.bezel * 2;
  const sh = PHONE.h - PHONE.bezel * 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect width={PHONE.w} height={PHONE.h} rx={PHONE.r} className={styles.device} filter={`url(#${id(slug, "shadow")})`} />
      <rect x={PHONE.bezel} y={PHONE.bezel} width={sw} height={sh} rx={PHONE.r - PHONE.bezel} className={styles.screen} />
      <g transform={`translate(${PHONE.bezel} ${PHONE.bezel})`}>
        {shot && <image href={shot} width={sw} height={sh} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id(slug, "screen")})`} />}
        {children}
        <rect x={sw / 2 - 14} y="6" width="28" height="6" rx="3" className={styles.island} />
        <rect width={sw} height={sh} rx={PHONE.r - PHONE.bezel} fill={`url(#${id(slug, "glare")})`} />
      </g>
    </g>
  );
}

/**
 * One star, filled or left as an outline for the rating still being given. The path is a
 * five-point star centred on the origin and moved into place with `transform`, so the geometry
 * stays readable instead of being recomputed into absolute coordinates at every call site.
 */
const STAR = "M0 -9 2.6 -2.8 9.2 -2.2 4.2 2.2 5.7 8.6 0 5.2 -5.7 8.6 -4.2 2.2 -9.2 -2.2 -2.6 -2.8Z";

function Star({ x, y, scale = 1, className }: { x: number; y: number; scale?: number; className: string }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d={STAR} className={className} />;
}

function Check({ x, y, r, className }: { x: number; y: number; r: number; className: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} className={className} />
      <path d={`M${-r * 0.42} 0.5 l${r * 0.3} ${r * 0.3} l${r * 0.55} ${-r * 0.6}`} className={styles.checkMark} />
    </g>
  );
}

/**
 * A real QR code: version 2 (25x25), error correction L, encoding
 * `https://carta.leclubtenerife.com`, the same menu shown on the phone next to it. Generated
 * once with the `qrcode` npm package and pasted here as rows, so the card ships no encoder and
 * the code still scans if anyone points a camera at a large enough print of it.
 */
const QR_MODULES = [
  "1111111011010100101111111",
  "1000001001010000101000001",
  "1011101010011101101011101",
  "1011101010111111001011101",
  "1011101011000001101011101",
  "1000001001001110001000001",
  "1111111010101010101111111",
  "0000000000111000100000000",
  "1111001011000010110011101",
  "0100000000010000100100010",
  "0010011110110110010100000",
  "1110000000011100010101100",
  "1011001101001110011010111",
  "0011000100001001101110001",
  "0110101011101110100010110",
  "1001000101001000100110001",
  "0001111011100101111111111",
  "0000000011111100100010101",
  "1111111001101010101010111",
  "1000001001100000100010010",
  "1011101001001010111111000",
  "1011101010110100011011100",
  "1011101011111100001010110",
  "1000001010101100010010100",
  "1111111010001110001111111",
];

export function Qr({ x, y, size }: { x: number; y: number; size: number }) {
  const n = QR_MODULES.length;
  const m = size / n;
  // Horizontal runs of modules are merged into one path, so the browser fills a few dozen bars as
  // a single shape with no hairline seams between neighbouring squares at fractional scales.
  let d = "";
  QR_MODULES.forEach((row, ry) => {
    let rx = 0;
    while (rx < n) {
      if (row[rx] !== "1") {
        rx += 1;
        continue;
      }
      let run = rx;
      while (run < n && row[run] === "1") run += 1;
      d += `M${rx * m} ${ry * m}h${(run - rx) * m}v${m}h${-(run - rx) * m}z`;
      rx = run;
    }
  });
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} className={styles.qr} shapeRendering="crispEdges" />
    </g>
  );
}

/* ---------------------------------------------------------------------------------------------
 * The three scenes
 * ------------------------------------------------------------------------------------------- */

const ART: Record<ServiceSlug, ReactNode> = {
  /* Digital menu. The phone shows Bálamo's actual menu: the dishes, their photographs and their
     prices, as a diner sees them. Over it float the two things the dashboard adds without anyone
     retyping the menu — the dish opened as its own preview (photograph, name, price, the text),
     and the language chips for the diners who don't read the house language. */
  menu: (
    <>
      <Phone slug="menu" x={50} y={30} rotate={-5} shot="/assets/services/menu-balamo.webp" />

      {/* Language chips: a globe, a flag dot. The dashboard translates, the chip is the proof. */}
      <g transform="translate(196 42) rotate(6)">
        <g className={styles.float}>
          <rect width="62" height="22" rx="11" className={styles.paper} filter="url(#svc-menu-shadowSoft)" />
          <circle cx="13" cy="11" r="5.5" className={styles.glyph} />
          <ellipse cx="13" cy="11" rx="2.4" ry="5.5" className={styles.glyph} />
          <path d="M7.5 11h11M8.6 8.2h8.8M8.6 13.8h8.8" className={styles.glyphThin} />
          <rect x="24" y="8.5" width="28" height="5" rx="2.5" className={styles.paperLine} />
        </g>
      </g>
      <g transform="translate(214 70) rotate(6)">
        <g className={[styles.float, styles.floatLate].join(" ")}>
          <rect width="54" height="22" rx="11" className={styles.paper} filter="url(#svc-menu-shadowSoft)" />
          <circle cx="12" cy="11" r="5" className={styles.brandDeep} />
          <rect x="22" y="8.5" width="24" height="5" rx="2.5" className={styles.paperLine} />
        </g>
      </g>

      {/* The dish preview: Bálamo's own detail sheet for one dish, on a paper mount. */}
      <g transform="translate(174 110) rotate(6)">
        <g className={styles.float}>
          <rect width="118" height="119" rx="14" className={styles.paper} filter="url(#svc-menu-shadow)" />
          <clipPath id="svc-menu-preview">
            <rect x="4" y="4" width="110" height="111" rx="11" />
          </clipPath>
          <image href="/assets/services/menu-balamo-dish.webp" x="4" y="4" width="110" height="111" preserveAspectRatio="xMidYMin slice" clipPath="url(#svc-menu-preview)" />
        </g>
      </g>
    </>
  ),

  /* Order at the table. Left to right, in the order it happens: the code on the table (a real
     one, for the same menu), Le Club's actual menu on the diner's phone with a dish already in
     the cart, the dashed path the order takes out of that cart bar, and the ticket coming out of
     the kitchen printer. This phone is the one that stays whole: the cart bar sits at the bottom
     of the screen and the arrow has to leave from it. The ticket is drawn before the printer so
     the printer's body covers its lower half and it reads as emerging from the slot. */
  ordering: (
    <>
      <g transform="translate(6 150) rotate(-8)">
        <g className={[styles.float, styles.floatLate].join(" ")}>
          <rect width="78" height="100" rx="10" className={styles.paper} filter="url(#svc-ordering-shadowSoft)" />
          <Qr x={13} y={11} size={52} />
          <rect x="18" y="74" width="42" height="5" rx="2.5" className={styles.paperLine} />
          <rect x="26" y="84" width="26" height="6" rx="3" className={styles.brand} />
        </g>
      </g>

      <Phone slug="ordering" x={52} y={12} rotate={-4} shot="/assets/services/ordering-leclub.webp" />

      {/* Out of the cart bar, over the counter, into the printer. Drawn before the printer so the
          line disappears under its body: the order goes in. */}
      <path d="M196 224c22 6 40-2 48-30" className={styles.dash} />
      <path d="M238 202l6-10 6 10" className={styles.strokeArrow} />

      <g transform="translate(200 118)">
        <g className={styles.float}>
          <rect x="18" y="-76" width="62" height="114" rx="4" className={styles.paper} filter="url(#svc-ordering-shadow)" />
          <rect x="26" y="-66" width="28" height="6" rx="3" className={styles.paperLineStrong} />
          <rect x="58" y="-68" width="14" height="10" rx="3" className={styles.brand} />
          <rect x="62" y="-65" width="2" height="4" rx="1" className={styles.paper} />
          <rect x="66" y="-65" width="2" height="4" rx="1" className={styles.paper} />
          <path d="M26 -54h46" className={styles.paperDash} />
          {[-46, -36, -26].map((y, i) => (
            <g key={y} transform={`translate(0 ${y})`}>
              <rect x="26" y="0" width="5" height="5" rx="1" className={styles.qr} />
              <rect x="35" y="0.5" width={[30, 22, 26][i]} height="4" rx="2" className={styles.paperLine} />
            </g>
          ))}
          <path d="M26 -14h46" className={styles.paperDash} />
          <rect x="26" y="-8" width="20" height="4" rx="2" className={styles.paperLine} />
          <rect x="56" y="-9" width="16" height="6" rx="3" className={styles.paperLineStrong} />
          <Check x={80} y={-74} r={9} className={styles.ok} />
        </g>
        <rect width="96" height="68" rx="12" className={styles.device} filter="url(#svc-ordering-shadow)" />
        <rect x="12" y="10" width="72" height="5" rx="2.5" className={styles.screen} />
        <rect x="12" y="26" width="68" height="32" rx="8" className={styles.deviceTray} />
        <circle cx="82" cy="50" r="3" className={styles.ok} />
        <rect x="20" y="38" width="28" height="4" rx="2" className={styles.lineFaint} />
      </g>
    </>
  ),

  /* Review system. The phone shows the moment the product acts on — a rating given, the reason
     and the waiter/area tags a low one is asked for before it goes on. That screen is designed,
     not captured (scripts/generate-reviews-mock.mjs): a fictional venue and invented names. The
     paper card is the review itself, tag and all, published on Google. Every rating reaches
     Google; the tag is what the restaurant gets to know first. */
  reviews: (
    <>
      <Phone slug="reviews" x={44} y={28} rotate={-5} shot="/assets/services/reviews-mock.webp" />

      <path d="M178 96c22-8 32 4 44 26" className={styles.dash} />
      <path d="M212 118l10 6-2-12" className={styles.strokeArrow} />

      {/* The review as it lands: five stars, the tag it carries, the words, and a mark that it
          is published rather than held. */}
      <g transform="translate(160 122) rotate(5)">
        <g className={styles.float}>
          <rect width="124" height="118" rx="14" className={styles.paper} filter="url(#svc-reviews-shadow)" />
          <circle cx="20" cy="22" r="10" className={styles.brandSoft} />
          <circle cx="20" cy="19" r="3.5" className={styles.brandDeep} />
          <path d="M13 29a7 5 0 0 1 14 0" className={styles.brandDeep} />
          <rect x="36" y="14" width="48" height="6" rx="3" className={styles.paperLineStrong} />
          <rect x="36" y="25" width="30" height="4" rx="2" className={styles.paperLine} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} x={17 + i * 15} y={48} scale={0.62} className={styles.brand} />
          ))}
          <rect x="94" y="41" width="20" height="14" rx="7" className={styles.brandSoft} />
          <circle cx="101" cy="48" r="3" className={styles.brandDeep} />
          <rect x="106" y="46.5" width="5" height="3" rx="1.5" className={styles.brandDeep} />
          <rect x="10" y="64" width="102" height="5" rx="2.5" className={styles.paperLine} />
          <rect x="10" y="74" width="88" height="5" rx="2.5" className={styles.paperLine} />
          <rect x="10" y="84" width="58" height="5" rx="2.5" className={styles.paperLine} />
          <Check x={19} y={103} r={7} className={styles.ok} />
          <rect x="32" y="100" width="40" height="5" rx="2.5" className={styles.paperLineStrong} />
        </g>
      </g>
    </>
  ),
};
