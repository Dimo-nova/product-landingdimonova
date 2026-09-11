import styles from "./Placeholder.module.css";

type Props = {
  /** What will go here, e.g. "Foto: formación en el local". Shown on the block, so the owner
   * can see exactly which capture or photograph is still missing. */
  label: string;
  /** CSS aspect ratio of the reserved box, e.g. "4 / 3". */
  ratio?: string;
  className?: string;
};

/**
 * A striped block standing in for an image that does not exist yet — a screenshot of the
 * dashboard, a photograph of a printer, a QR on a sunbed. It reserves the space at the final
 * proportion and says what belongs there, so the layout is judged with the image's footprint in
 * place and nobody mistakes the gap for a design choice.
 *
 * `role="img"` with the label as its name: the note is content (it tells a screen-reader user
 * the same thing a sighted visitor reads), not decoration. Replace with a real `<Image>` and
 * remove the entry from TODO.md when the asset lands.
 */
export default function Placeholder({ label, ratio = "4 / 3", className }: Props) {
  return (
    <div
      className={[styles.block, className].filter(Boolean).join(" ")}
      // The ratio is the one genuinely per-instance value here, which is the exception the
      // styling rule allows for inline styles.
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label}
      data-placeholder
    >
      <span className={styles.label}>{label}</span>
    </div>
  );
}
