"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

/**
 * Jargon with a built-in explanation. Hover (desktop) or tap (touch) reveals a
 * plain-English definition that scales in from the trigger.
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
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const entry = GLOSSARY[k];
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      setAbove(window.innerHeight - r.bottom < 200);
      // Centre on the trigger, but keep 12px clear of the viewport edges.
      const left = Math.min(Math.max(12, r.left + r.width / 2 - 130), window.innerWidth - 272);
      setOffset(left - r.left);
    }
    setOpen(true);
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
        setOpen(false);
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (open) setOpen(false);
          else show();
        }}
        className={
          icon
            ? "grid size-[18px] place-items-center rounded-full bg-sunken text-[11px] font-bold text-ink-3 transition-colors hover:text-ink"
            : "cursor-help underline decoration-ink-3/40 decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:decoration-ink-3"
        }
      >
        {icon ? "?" : children ?? entry.term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96, y: above ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{ left: offset, transformOrigin: `${-offset + 9}px ${above ? "100%" : "0%"}` }}
            className={`absolute z-50 block w-[260px] rounded-[18px] bg-ink p-3.5 text-left text-[13px] leading-relaxed font-normal tracking-normal normal-case text-canvas shadow-float ${
              above ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <span className="mb-0.5 block font-semibold">{entry.term}</span>
            <span className="opacity-80">{entry.body}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
