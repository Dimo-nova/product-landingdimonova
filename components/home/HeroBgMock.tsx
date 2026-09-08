"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import DeviceFrame from "@/components/ui/DeviceFrame";
import styles from "./HeroBgMock.module.css";

const TILT_DEG = 6;
const CASCADE_STEP_MS = 400;
const CASCADE_LOOP_MS = 8000;

type Row = [string, string, string];

/**
 * Alternative hero background: a tilting phone mockup of the Bálamo menu, orbited by two
 * rotating rings, with a floating "AI applying a change" card. Compared against `HeroBgPhoto`
 * via `?hero=c`; delete the losing variant once the owner picks one (see HeroBackground.tsx).
 */
export default function HeroBgMock({ alt }: { alt: string }) {
  const t = useTranslations("home");
  const rows = (t.raw("ai.demo.rows") as Row[][])[0];
  const line = (t.raw("ai.demo.prompts") as string[])[0];

  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function runCascade() {
      setRevealed(0);
      timers = rows.map((_, i) =>
        setTimeout(() => setRevealed(i + 1), CASCADE_STEP_MS * (i + 1))
      );
    }
    runCascade();
    const loop = setInterval(runCascade, CASCADE_LOOP_MS);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, [rows]);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 20 });
  const pointerEnabled = useRef(true);
  // Motion's app-wide `reducedMotion="user"` config (see Providers.tsx) only intercepts the
  // `animate` prop; these two motion values are driven manually from a mousemove handler, so the
  // pointer-parallax tilt needs its own explicit check to stay off under prefers-reduced-motion.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => { pointerEnabled.current = mq.matches; };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!pointerEnabled.current || reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateYRaw.set(px * TILT_DEG * 2);
    rotateXRaw.set(-py * TILT_DEG * 2);
  }

  function onMouseLeave() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }

  return (
    <div className={styles.wrap} data-hero-bg="mock" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div className={styles.stage}>
        <motion.div
          className={[styles.ring, styles.ringSmall].join(" ")}
          aria-hidden="true"
          style={{ scaleY: 0.78 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 120, ease: "linear", repeat: Infinity }}
        />
        <motion.div
          className={[styles.ring, styles.ringLarge].join(" ")}
          aria-hidden="true"
          style={{ scaleY: 0.78 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 120, ease: "linear", repeat: Infinity }}
        />

        {/* Decorative duplicate of the AI demo's copy — hidden from assistive tech so it isn't
            read aloud a second time on this hero variant. */}
        <div className={styles.card} aria-hidden="true">
          <p className={styles.cardTitle}>{line}</p>
          {rows.map((row, i) => (
            <div key={row[0]} className={styles.cardRow}>
              <span className={styles.cardRowName}>{row[0]}</span>
              <span className={styles.cardPrices}>
                <span className={styles.oldPrice}>{row[1]}</span>
                <span className={styles.newPrice}>{row[2]}</span>
                {i < revealed && <span className={styles.tick} aria-hidden="true">✓</span>}
              </span>
            </div>
          ))}
        </div>

        <motion.div className={styles.phoneWrap} style={{ rotateX, rotateY }}>
          <DeviceFrame src="/assets/cases/balamo-phone.png" alt={alt} kind="phone" className={styles.phoneSize} />
        </motion.div>
      </div>
    </div>
  );
}
