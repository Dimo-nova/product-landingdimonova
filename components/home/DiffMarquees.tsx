import type { ReactNode } from "react";
import Marquee from "@/components/ui/Marquee";
import styles from "./DifferentiatorBand.module.css";

type DiffItem = { title: string; body: string };

/**
 * One claim card: a coral glyph, the claim, and its one-line explanation. Title and body are
 * both always visible rather than revealed on hover: the hover state stops the strip so a claim
 * can be read, it does not have to also uncover the text. Static text means the card needs no
 * focus handling, no `role` and no `aria-label` reconstructing what it says.
 */
function ClaimPill({ item, icon }: { item: DiffItem; icon: ReactNode }) {
  return (
    <div className={styles.pill} data-diff-item>
      <span className={styles.claimIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.claimText}>
        <span className={styles.claimTitle} data-diff-title>
          {item.title}
        </span>
        <span className={styles.claimBody} data-diff-body>
          {item.body}
        </span>
      </span>
    </div>
  );
}

/**
 * The differentiator band's two opposing rows of claim cards. The ten glyphs are indexed by the
 * order of `home.diff.items` — pixel-perfect design, events, unlimited support, on-site training,
 * integrations, multi-venue, no templates, same-day changes, tablets/QR/web, a real person —
 * which is the same in every locale. Reorder that array and the glyphs go with the wrong claims.
 */
export default function DiffMarquees({ left, right }: { left: DiffItem[]; right: DiffItem[] }) {
  return (
    <div className={styles.rows}>
      <Marquee speed={70} direction="left" repeat={3} pauseOnHover className={styles.marquee}>
        {left.map((item, i) => (
          <ClaimPill key={item.title} item={item} icon={ICONS[i % ICONS.length]} />
        ))}
      </Marquee>
      <Marquee speed={78} direction="right" repeat={3} pauseOnHover className={styles.marquee}>
        {right.map((item, i) => (
          <ClaimPill key={item.title} item={item} icon={ICONS[(i + left.length) % ICONS.length]} />
        ))}
      </Marquee>
    </div>
  );
}

/* 24px stroke glyphs in `currentColor`, which `.claimIcon` sets to coral. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {children}
    </svg>
  );
}

const ICONS: ReactNode[] = [
  /* Pixel-perfect design: a swatch and a brush. */
  <Icon key="design">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v10a3.5 3.5 0 1 1-7 0z" />
    <path d="M11 8.8l2.6-2.6a1.5 1.5 0 0 1 2.1 0l2.8 2.8a1.5 1.5 0 0 1 0 2.1L11 18.6" />
    <path d="M13.2 20h5.3a1.5 1.5 0 0 0 1.5-1.5v-4a1.5 1.5 0 0 0-1.5-1.5h-.6" />
  </Icon>,
  /* Events and promotions: a calendar with a spark. */
  <Icon key="events">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    <path d="M12 12.2l.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2.1-.3z" fill="currentColor" stroke="none" />
  </Icon>,
  /* Unlimited support: a chat bubble with an infinity. */
  <Icon key="support">
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.4 3.4V16H6.5A2.5 2.5 0 0 1 4 13.5z" />
    <path d="M9 10c-1.4-1.6-3.5-.2-2.4 1.3 1 1.4 2.4-.3 2.4-.3s1.4-1.7 2.4-.3c1.1 1.5-1 2.9-2.4 1.3" />
    <path d="M12 10c1.4-1.6 3.5-.2 2.4 1.3-1 1.4-2.4-.3-2.4-.3" />
  </Icon>,
  /* Training on site: a mortarboard. */
  <Icon key="training">
    <path d="M3 9.5l9-4 9 4-9 4z" />
    <path d="M7 11.3V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3.7" />
    <path d="M21 9.5v5" />
  </Icon>,
  /* Integration with your software: a plug. */
  <Icon key="integration">
    <path d="M9 3v4M15 3v4" />
    <path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z" />
    <path d="M12 16v5" />
  </Icon>,
  /* Multi-venue: two storefronts. */
  <Icon key="multi">
    <path d="M3.5 10.5l1.2-4h6.6l1.2 4" />
    <path d="M4.5 10.5v9h7v-9" />
    <path d="M12.5 10.5l1.2-4h5.6l1.2 4" />
    <path d="M13.5 10.5v9h6v-9" />
    <path d="M7 19.5v-4h2v4M16 19.5v-4h1.5v4" />
  </Icon>,
  /* No templates: stacked layers with a strike. */
  <Icon key="notemplates">
    <path d="M12 4l8 4.5-8 4.5-8-4.5z" />
    <path d="M4 13l8 4.5 8-4.5" />
    <path d="M4 4l16 16" />
  </Icon>,
  /* Same-day changes: a clock with a bolt. */
  <Icon key="sameday">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>,
  /* Tablets, QR or web: a tablet and a phone. */
  <Icon key="devices">
    <rect x="3" y="4" width="13" height="16" rx="2" />
    <rect x="14" y="9" width="7" height="11" rx="1.8" />
    <path d="M9.5 17.5h.01" />
  </Icon>,
  /* Someone on the other side: a person. */
  <Icon key="person">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icon>,
];
