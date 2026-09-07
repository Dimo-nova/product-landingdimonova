"use client";
import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function focusables(root: HTMLElement | null): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
}

/**
 * While `active`: moves focus into `ref` (to `initial()` or the first focusable), wraps Tab/Shift+Tab
 * inside it, and restores focus to the previously focused element on deactivation.
 * Escape handling and scroll-lock stay with the caller.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, initial?: () => HTMLElement | null | undefined) {
  useEffect(() => {
    if (!active) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    const target = initial?.() ?? focusables(ref.current)[0] ?? ref.current;
    target?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables(ref.current);
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      const activeEl = document.activeElement;
      const inside = ref.current?.contains(activeEl);
      if (e.shiftKey && (activeEl === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (activeEl === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); restoreTo?.focus?.(); };
    // `initial` is intentionally read once on activation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}
