"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { lift, reveal, stagger, viewportOnce } from "@/lib/motion";

type Item = { key: string; node: ReactNode };

type Props = {
  items: Item[];
  className?: string;
  itemClassName?: string;
};

/**
 * A list whose items rise into place one after another the first time it scrolls into view, and
 * lift under the pointer.
 *
 * The cards themselves are server-rendered and handed in as `node`, so this island owns nothing
 * but the motion. `stagger` only offsets each child's start time — the per-item transition comes
 * from `reveal`'s own variant, and `lift.transition` applies to the hover state only, because a
 * variant's transition wins over the component-level one.
 *
 * Nothing here is driven from an event handler, so `<MotionConfig reducedMotion="user">` in
 * Providers.tsx is enough: it strips the y-offset and the hover lift for anyone who asks for
 * reduced motion.
 */
export default function StaggerGrid({ items, className, itemClassName }: Props) {
  return (
    <motion.ul
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {items.map(({ key, node }) => (
        <motion.li
          key={key}
          className={itemClassName}
          variants={reveal}
          whileHover={lift.whileHover}
          transition={lift.transition}
        >
          {node}
        </motion.li>
      ))}
    </motion.ul>
  );
}
