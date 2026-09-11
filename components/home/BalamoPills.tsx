import type { ReactNode } from "react";
import styles from "./BalamoShowcase.module.css";

/**
 * The five things the Bálamo case is about, as small tags scattered round the devices. Each one
 * carries an icon and a place in the scene; the label comes from `home.balamo.pills`, whose
 * order — review incentives, made-to-measure design, wines of the week, cellar integration,
 * unlimited support — is the same in every locale and is what the two lists below index into.
 * Reorder that array and the icons go with the wrong words, so don't.
 *
 * Static, by the owner's instruction: they used to bob on a loop. Placement lives in the
 * stylesheet (`.tagReviews` … `.tagSupport`), so this stays a server component.
 */
const TAGS = [
  { className: styles.tagReviews, icon: <IconStar /> },
  { className: styles.tagDesign, icon: <IconSwatch /> },
  { className: styles.tagWines, icon: <IconWine /> },
  { className: styles.tagCellar, icon: <IconLink /> },
  { className: styles.tagSupport, icon: <IconChat /> },
] as const;

export default function BalamoPills({ labels }: { labels: string[] }) {
  return (
    <div className={styles.tags}>
      {labels.map((label, i) => {
        const tag = TAGS[i % TAGS.length];
        return (
          <span key={label} data-balamo-pill className={[styles.tag, tag.className].join(" ")}>
            <span className={styles.tagIcon} aria-hidden="true">
              {tag.icon}
            </span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

/* 24px stroke icons in `currentColor`, which `.tagIcon` sets to coral. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {children}
    </svg>
  );
}

function IconStar() {
  return (
    <Icon>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function IconSwatch() {
  return (
    <Icon>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v10a3.5 3.5 0 1 1-7 0z" />
      <path d="M11 8.8l2.6-2.6a1.5 1.5 0 0 1 2.1 0l2.8 2.8a1.5 1.5 0 0 1 0 2.1L11 18.6" />
      <path d="M13.2 20h5.3a1.5 1.5 0 0 0 1.5-1.5v-4a1.5 1.5 0 0 0-1.5-1.5h-.6" />
      <circle cx="7.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function IconWine() {
  return (
    <Icon>
      <path d="M7 3h10l-.6 6.2A4.4 4.4 0 0 1 12 13a4.4 4.4 0 0 1-4.4-3.8z" />
      <path d="M7.5 8h9" />
      <path d="M12 13v7M8.5 20h7" />
    </Icon>
  );
}

function IconLink() {
  return (
    <Icon>
      <path d="M10 14a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </Icon>
  );
}

function IconChat() {
  return (
    <Icon>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.4 3.4V16H6.5A2.5 2.5 0 0 1 4 13.5z" />
      <path d="M8.5 9h7M8.5 12.5h4.5" />
    </Icon>
  );
}
