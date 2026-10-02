"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

const W = 260; // tooltip width
const GAP = 8; // distance from the trigger
const EDGE = 12; // keep this far from the viewport edges

type Pos = { left: number; top: number; above: boolean; originX: number };

/**
 * Jargon with a built-in explanation. Hover (desktop) or tap (touch) reveals a
 * plain-English definition that scales in from the trigger.
 *
 * The tooltip is portalled to <body> with fixed positioning, so scroll areas
 * and rounded `overflow: hidden` containers (sheets, cards) can never clip it.
 */
export function Term({
  k,
  children,
  icon = false,
}: {
  k: GlossaryKey;
  children?: React.ReactNode;
  icon?: boolean;
}) {
  const [pos, setPos] = useState<Pos | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const entry = GLOSSARY[k];
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const open = pos !== null;

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setPos(null);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    // Follow the trigger as its container scrolls (focus can nudge scroll on
    // click); close only once the trigger has left the screen.
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || r.bottom < 0 || r.top > window.innerHeight) setPos(null);
        else show();
      });
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const above = window.innerHeight - r.bottom < 200;
    // Centre on the trigger, clamped to the viewport.
    const left = Math.min(Math.max(EDGE, r.left + r.width / 2 - W / 2), window.innerWidth - W - EDGE);
    setPos({
      left,
      top: above ? r.top - GAP : r.bottom + GAP,
      above,
      originX: Math.min(Math.max(16, r.left + r.width / 2 - left), W - 16),
    });
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hoverTimer.current = setTimeout(show, 250);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(hoverTimer.current);
        setPos(null);
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (open) setPos(null);
          else show();
        }}
        className={
          icon
            ? "grid size-[18px] place-items-center rounded-full bg-sunken text-[11px] font-bold text-ink-3 transition-colors hover:text-ink"
            : "cursor-help underline decoration-ink-3/40 decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:decoration-ink-3"
        }
      >
        {icon ? "?" : (children ?? entry.term)}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {pos && (
              <motion.span
                id={id}
                role="tooltip"
                initial={{ opacity: 0, scale: 0.96, y: pos.above ? 4 : -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: W,
                  translate: pos.above ? "0 -100%" : undefined,
                  transformOrigin: `${pos.originX}px ${pos.above ? "100%" : "0%"}`,
                }}
                className="pointer-events-none fixed z-[70] block rounded-[18px] bg-ink p-3.5 text-left text-[13px] leading-relaxed font-normal tracking-normal normal-case text-canvas shadow-float"
              >
                <span className="mb-0.5 block font-semibold">{entry.term}</span>
                <span className="opacity-80">{entry.body}</span>
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  );
}
