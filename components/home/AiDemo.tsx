"use client";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "motion/react";
import styles from "./AiDemo.module.css";

type Row = [string, string, string];
type Phase = "typing" | "proposing" | "applied";

const TYPE_MS = 40;
const AFTER_TYPE_MS = 400;
const TICK_MS = 120;
const AFTER_TICKS_MS = 900;
const HOLD_MS = 2500;
/** How often a paused/hidden check retries before re-checking whether it can proceed. */
const PAUSE_RETRY_MS = 100;

/**
 * Animated mock of the dashboard assistant: types a prompt, proposes row-by-row changes,
 * "applies" them and toasts a confirmation, then cycles to the next tab. Entirely local —
 * no network calls. The hand-off to the next tab holds while the pointer is over the demo,
 * the demo has DOM focus (so a keyboard user reading a tab doesn't have it swapped out from
 * under them), or the tab is hidden, so a change already on screen is never swapped out
 * mid-read; the in-progress typing/reveal for the *current* tab always runs to completion.
 * The whole cycle — including the in-progress typing/reveal, not just the hand-off — is also
 * gated on the demo actually being on screen (`useInView`), so it doesn't keep re-rendering
 * every animation frame while scrolled out of view; it restarts the current tab from scratch
 * when scrolled back into view.
 */
export default function AiDemo() {
  const t = useTranslations("home.ai.demo");
  const tabs = t.raw("tabs") as string[];
  const prompts = t.raw("prompts") as string[];
  const allRows = t.raw("rows") as Row[][];

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "-100px" });

  // Snapshot the translated data in a ref so the cycle effect below can depend on `tab`
  // alone — `prompts`/`allRows` are fresh array references every render (t.raw() doesn't
  // memoize), and including them in the dependency array would restart the cycle on every
  // unrelated re-render (mirrors the onCloseRef pattern in components/ui/Modal.tsx).
  const dataRef = useRef({ prompts, allRows });
  dataRef.current = { prompts, allRows };

  const [tab, setTab] = useState(0);
  // Initial state renders the *finished* first tab so the section shows real content with
  // JavaScript disabled (no-JS/no-hydration users never see the "typing" reset the effect
  // below performs on mount).
  const [typed, setTyped] = useState<string>(() => prompts[0] ?? "");
  const [phase, setPhase] = useState<Phase>("applied");
  const [checked, setChecked] = useState<boolean[]>(() => new Array((allRows[0] ?? []).length).fill(true));

  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Off-screen, suspend the whole cycle rather than let it keep typing/ticking/re-rendering
    // unseen: bail before scheduling anything. Coming back into view re-runs this effect (via
    // the `inView` dependency below) and restarts the current tab from scratch.
    if (!inView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const { prompts: currentPrompts, allRows: currentAllRows } = dataRef.current;
    const rows = currentAllRows[tab] ?? [];
    const prompt = currentPrompts[tab] ?? "";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setChecked(new Array(rows.length).fill(false));

    // Plain scheduler for the in-progress animation (typing a char, ticking a row, the short
    // pauses between phases): only `cancelled` gates it, so a tab just selected by a real
    // click — which under Playwright (and plenty of real trackpads) leaves the pointer resting
    // over the tablist — still types and reveals immediately instead of freezing forever.
    const wait = (delay: number, action: () => void) => {
      timers.push(setTimeout(() => { if (!cancelled) action(); }, delay));
    };

    // Gated scheduler used only for the automatic hand-off to the next tab: this is the
    // "cycle" the brief means when it says pointer-hover / a hidden tab pauses it — reading the
    // current, already-typed proposal shouldn't have it snatched away and reset mid-read.
    const waitGated = (delay: number, action: () => void) => {
      const attempt = () => {
        if (cancelled) return;
        if (hoveredRef.current || focusedRef.current || document.visibilityState !== "visible") {
          timers.push(setTimeout(attempt, PAUSE_RETRY_MS));
          return;
        }
        action();
      };
      timers.push(setTimeout(attempt, delay));
    };

    const advanceTab = () => {
      if (cancelled) return;
      const next = (tab + 1) % 3;
      setTab(next);
    };

    const applyPhase = () => {
      if (cancelled) return;
      setPhase("applied");
      waitGated(HOLD_MS, advanceTab);
    };

    const tickRow = (i: number) => {
      if (i >= rows.length) {
        wait(AFTER_TICKS_MS, applyPhase);
        return;
      }
      wait(TICK_MS, () => {
        if (cancelled) return;
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        tickRow(i + 1);
      });
    };

    const startProposing = () => {
      if (cancelled) return;
      setPhase("proposing");
      tickRow(0);
    };

    if (reduced) {
      setTyped(prompt);
      setPhase("applied");
      setChecked(new Array(rows.length).fill(true));
      waitGated(HOLD_MS, advanceTab);
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    setTyped("");
    setPhase("typing");

    const typeNext = (i: number) => {
      if (cancelled) return;
      setTyped(prompt.slice(0, i));
      if (i < prompt.length) {
        wait(TYPE_MS, () => typeNext(i + 1));
      } else {
        wait(AFTER_TYPE_MS, startProposing);
      }
    };
    if (prompt.length === 0) {
      wait(AFTER_TYPE_MS, startProposing);
    } else {
      wait(TYPE_MS, () => typeNext(1));
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [tab, inView]);

  const rows = allRows[tab] ?? [];

  const focusTab = (i: number) => {
    setTab(i);
    tabRefs.current[i]?.focus();
  };

  // Automatic-activation roving tabindex: moving DOM focus onto a tab (arrow keys, a click,
  // or focus arriving some other way) selects it too, so a tab can never hold focus while a
  // *different* tab's panel is showing — which is what the read-then-hold pause below relies
  // on to know which panel someone is actually reading.
  const handleTabFocus = (i: number) => {
    if (i !== tab) setTab(i);
  };

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const count = tabs.length;
    let target: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        target = (tab + 1) % count;
        break;
      case "ArrowLeft":
        target = (tab - 1 + count) % count;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    focusTab(target);
  };

  const handleBlurCapture = (e: FocusEvent<HTMLDivElement>) => {
    // A blur that merely moves focus between the tabs (or into the panel) is not focus
    // leaving the component — only clear the flag once it has genuinely gone elsewhere.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      focusedRef.current = false;
    }
  };

  return (
    <div
      ref={rootRef}
      className={styles.demo}
      data-ai-demo
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      onFocusCapture={() => { focusedRef.current = true; }}
      onBlurCapture={handleBlurCapture}
    >
      <div className={styles.tablist} role="tablist" aria-label={t("tablist")}>
        {tabs.map((label, i) => (
          <button
            key={label}
            ref={(el) => { tabRefs.current[i] = el; }}
            type="button"
            role="tab"
            id={`ai-demo-tab-${i}`}
            aria-selected={i === tab}
            aria-controls="ai-demo-panel"
            tabIndex={i === tab ? 0 : -1}
            className={[styles.tab, i === tab && styles.tabActive].filter(Boolean).join(" ")}
            onClick={() => setTab(i)}
            onKeyDown={handleTabKeyDown}
            onFocus={() => handleTabFocus(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="ai-demo-panel" role="tabpanel" aria-labelledby={`ai-demo-tab-${tab}`} className={styles.panel}>
        <div className={styles.bubble}>
          <span>{typed}</span>
          {phase === "typing" && <span className={styles.caret} aria-hidden="true" />}
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>{t("proposed")}</p>
          <ul className={styles.rows}>
            {rows.map((row, i) => (
              <li key={row[0]} className={styles.row}>
                <span
                  role="img"
                  aria-label={`${row[0]}: ${checked[i] ? "applied" : "pending"}`}
                  className={[styles.tick, checked[i] && styles.tickOn].filter(Boolean).join(" ")}
                >
                  {checked[i] ? "✓" : ""}
                </span>
                <span className={styles.rowLabel}>{row[0]}</span>
                <span className={styles.rowChange}>
                  <span className={styles.rowBefore}>{row[1]}</span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                  <span className={styles.rowAfter}>{row[2]}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className={[styles.apply, phase === "applied" && styles.applyPressed].filter(Boolean).join(" ")} aria-hidden="true">
            {t("apply")}
          </div>
        </div>

        {/*
          No role="status"/aria-live here: the demo autoplays and cycles forever, and an
          unsolicited live region announcing "N dishes updated" every few seconds for the
          whole session — no matter where the visitor is on the page — is worse than no
          announcement at all. The toast is purely decorative for screen-reader users; the
          tab's selected state and panel content (both already exposed via the tablist below)
          remain reachable on demand.
        */}
        <div className={[styles.toast, phase === "applied" && styles.toastShow].filter(Boolean).join(" ")}>
          {phase === "applied" ? t("toast", { count: rows.length }) : ""}
        </div>
      </div>
    </div>
  );
}
