import styles from "./Prose.module.css";

type Props = { children: React.ReactNode; className?: string };

/** Measure-constrained rich text block, shared by the legal pages and any inner-page copy that needs it. */
export default function Prose({ children, className }: Props) {
  return <div className={[styles.prose, className].filter(Boolean).join(" ")}>{children}</div>;
}
