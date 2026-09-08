import styles from "./Faq.module.css";

type Item = { q: string; a: string };
type Props = { items: Item[] };

/**
 * Native <details>/<summary> FAQ list, so it opens and reads with no JavaScript at all. The
 * default disclosure triangle is hidden and replaced by a chevron icon that rotates on open —
 * decoration only, `<summary>` already carries the correct semantics and keyboard behaviour.
 */
export default function Faq({ items }: Props) {
  return (
    <div className={styles.list}>
      {items.map((item, i) => (
        <details key={`${i}-${item.q}`} className={styles.item}>
          <summary className={styles.summary}>
            <span>{item.q}</span>
            <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className={styles.answer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
