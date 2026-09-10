import type { ServiceSlug } from "@/lib/services";
import styles from "./ServiceArt.module.css";

/**
 * The illustration on each home service card, one per service.
 *
 * Drawn rather than photographed, for three reasons: there is no product photography for these
 * three things yet, the cards sit on a coral gradient that no screenshot survives, and an SVG
 * costs no request, stays sharp at any density and carries no text to translate.
 *
 * Every one is `aria-hidden`: the card's own heading and line already say what the service is, so
 * a description here would only make a screen reader say it twice. They are deliberately still —
 * the card already lifts and scales its media on hover, and three looping animations side by side
 * in a row would fight each other.
 *
 * The shared vocabulary: a 120x100 viewBox, `currentColor` inherited from `.media` (so the whole
 * set recolours with the card), 2px strokes with round joins, and the same three opacity steps
 * for foreground, surface and hint.
 */
export function ServiceArt({ slug }: { slug: ServiceSlug }) {
  return (
    <svg className={styles.art} viewBox="0 0 120 100" fill="none" aria-hidden="true" focusable="false">
      {ART[slug]}
    </svg>
  );
}

/** A dish row: thumbnail, two lines of copy, a price. Used three times by the menu drawing. */
function MenuRow({ y }: { y: number }) {
  return (
    <>
      <rect x="30" y={y} width="12" height="12" rx="3" className={styles.solid} />
      <rect x="47" y={y + 1} width="26" height="3" rx="1.5" className={styles.solid} />
      <rect x="47" y={y + 7} width="16" height="3" rx="1.5" className={styles.hint} />
      <rect x="80" y={y + 3} width="12" height="6" rx="3" className={styles.accent} />
    </>
  );
}

const ART: Record<ServiceSlug, React.ReactNode> = {
  /* Digital menu: the menu itself as a sheet of dishes, with a second sheet behind it for the
     other venues and the other languages that the same dashboard drives. */
  menu: (
    <>
      <rect x="18" y="14" width="84" height="76" rx="10" className={styles.ghost} />
      <rect x="22" y="10" width="84" height="76" rx="10" className={styles.surface} />
      <rect x="30" y="18" width="30" height="5" rx="2.5" className={styles.solid} />
      <rect x="66" y="18" width="14" height="5" rx="2.5" className={styles.hint} />
      <rect x="84" y="18" width="14" height="5" rx="2.5" className={styles.hint} />
      <MenuRow y={31} />
      <MenuRow y={50} />
      <MenuRow y={69} />
    </>
  ),

  /* Order at the table: the QR the diner scans on the left, the printer in the kitchen on the
     right, and the ticket coming out of it. Left to right, in the order it happens. The ticket is
     drawn before the printer so the printer's own body covers its lower half and it reads as
     emerging from the slot rather than sitting in front of the machine. */
  ordering: (
    <>
      <rect x="8" y="28" width="42" height="42" rx="8" className={styles.surface} />
      <rect x="15" y="35" width="10" height="10" rx="2" className={styles.solid} />
      <rect x="33" y="35" width="10" height="10" rx="2" className={styles.solid} />
      <rect x="15" y="53" width="10" height="10" rx="2" className={styles.solid} />
      <rect x="33" y="53" width="4.5" height="4.5" rx="1" className={styles.solid} />
      <rect x="38.5" y="58.5" width="4.5" height="4.5" rx="1" className={styles.solid} />

      <path d="M56 49h10m0 0-4-4m4 4-4 4" className={styles.stroke} />

      <rect x="80" y="26" width="22" height="24" rx="2" className={styles.accent} />
      <rect x="84" y="31" width="14" height="3" rx="1.5" className={styles.onAccent} />
      <rect x="84" y="37" width="9" height="3" rx="1.5" className={styles.onAccent} />

      <rect x="72" y="46" width="38" height="26" rx="6" className={styles.surface} />
      <rect x="78" y="52" width="26" height="3" rx="1.5" className={styles.hint} />
      <circle cx="102" cy="65" r="2.5" className={styles.solid} />
    </>
  ),

  /* Review system: the rating a diner leaves, and the tag it comes back with. The fifth star is
     the one still being chosen, which is the moment the product acts on. */
  reviews: (
    <>
      <rect x="14" y="20" width="92" height="60" rx="10" className={styles.surface} />
      <Star x={28} y={38} filled />
      <Star x={44} y={38} filled />
      <Star x={60} y={38} filled />
      <Star x={76} y={38} filled />
      <Star x={92} y={38} />
      <rect x="26" y="55" width="44" height="4" rx="2" className={styles.hint} />
      <rect x="26" y="65" width="30" height="9" rx="4.5" className={styles.accent} />
      <rect x="60" y="65" width="22" height="9" rx="4.5" className={styles.ghost} />
    </>
  ),
};

/**
 * One star, either filled or left as an outline for the rating still being given. The path is a
 * five-point star centred on the origin and moved into place with `transform`, so the geometry
 * stays readable instead of being recomputed into absolute coordinates at every call site.
 */
const STAR = "M0 -9 2.6 -2.8 9.2 -2.2 4.2 2.2 5.7 8.6 0 5.2 -5.7 8.6 -4.2 2.2 -9.2 -2.2 -2.6 -2.8Z";

function Star({ x, y, filled }: { x: number; y: number; filled?: boolean }) {
  // Scaled to 0.8 so five of them fit inside the panel with margin at either end.
  return <path transform={`translate(${x} ${y}) scale(0.8)`} d={STAR} className={filled ? styles.solid : styles.stroke} />;
}
