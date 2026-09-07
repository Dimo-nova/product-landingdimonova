"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
  maxWidth?: string;
  closeLabel: string;
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, labelledBy, children, tone = "light", maxWidth = "560px", closeLabel }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Hold the latest onClose in a ref so the trap effect below can depend on
  // `open` alone. Keying it on `onClose` too would re-run the effect on every
  // parent re-render that passes a new inline closure (e.g. `onClose={() =>
  // setOpen(false)}`), which restores focus to the opener and re-focuses the
  // first control mid-open — yanking focus out of whatever the user is typing in.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    // Initial focus skips the close button so the first *content* control is focused;
    // the close button stays inside the Tab cycle (it is first in DOM order).
    const initial = focusables().find((el) => !el.hasAttribute("data-modal-close")) ?? dialogRef.current;
    initial?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={[styles.dialog, tone === "dark" && styles.dark].filter(Boolean).join(" ")}
            style={{ maxWidth }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel} data-modal-close>
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
