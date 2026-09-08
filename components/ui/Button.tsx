import { Link } from "@/lib/routing";
import styles from "./Button.module.css";

type Common = {
  variant?: "solid" | "outline" | "ghost";
  size?: "md" | "lg" | "xl";
  onDark?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};
type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & { href?: undefined; external?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };
export type ButtonProps = AsLink | AsButton;

export default function Button(props: ButtonProps) {
  const { variant = "solid", size = "md", onDark, className, children, ariaLabel } = props;
  const cls = [styles.btn, styles[variant], styles[size], onDark && styles.onDark, className]
    .filter(Boolean)
    .join(" ");

  if (props.href) {
    if (props.external) {
      return (
        <a className={cls} href={props.href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={props.href} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
