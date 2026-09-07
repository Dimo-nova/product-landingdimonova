import styles from "./Container.module.css";

type Props = { children: React.ReactNode; className?: string; as?: "div" | "section" | "nav" | "footer" };

export default function Container({ children, className, as: Tag = "div" }: Props) {
  return <Tag className={[styles.container, className].filter(Boolean).join(" ")}>{children}</Tag>;
}
