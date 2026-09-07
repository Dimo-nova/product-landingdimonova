import { Link } from "@/lib/routing";
import styles from "./Pill.module.css";

type Props = {
  children: React.ReactNode;
  tone?: "light" | "dark" | "outline" | "brand";
  size?: "sm" | "md";
  href?: string;
  external?: boolean;
  className?: string;
};

export default function Pill({ children, tone = "light", size = "sm", href, external, className }: Props) {
  const cls = [styles.pill, styles[tone], styles[size], className].filter(Boolean).join(" ");
  if (href) {
    return external
      ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <Link className={cls} href={href}>{children}</Link>;
  }
  return <span className={cls}>{children}</span>;
}
