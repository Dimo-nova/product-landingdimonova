import styles from "./CardGrid.module.css";

const COLUMN_CLASS = { 2: "cols2", 3: "cols3", 4: "cols4" } as const;

type Props = {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
};

/** Responsive grid of Card children: 2/3/4 tracks down to 2 below 1000px and a single column below 640px. */
export default function CardGrid({ columns = 3, children }: Props) {
  return <div className={[styles.grid, styles[COLUMN_CLASS[columns]]].join(" ")}>{children}</div>;
}
