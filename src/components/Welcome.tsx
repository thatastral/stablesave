"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { play } from "@/lib/sound";

const SEEN_KEY = "stablesave:welcome-v1";
const OPEN_EVENT = "stablesave:welcome";
const EASE = [0.23, 1, 0.32, 1] as const;

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // Storage blocked: don't nag on every load.
  }
}
function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

export function HelpButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="pressable flex h-9 items-center gap-1.5 rounded-full bg-surface pr-3.5 pl-3 font-display text-[13px] font-medium text-ink-2 shadow-card hover:text-ink"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.4 6.3a1.7 1.7 0 0 1 3.2.7c0 1.1-1.6 1.4-1.6 2.4M8 11.4v.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      How it works
    </button>
  );
}

const STEPS = [
  {
    title: "Tell us how much you have",
    body: "USDC or USDT, crypto dollars worth $1 each.",
  },
  {
    title: "We compare savings options for you",
    body: "Rates and safety across dozens of DeFi apps.",
  },
  {
    title: "Deposit on the official app",
    body: "We send you straight there. We never touch your money.",
  },
];

export function Welcome() {
  const [open, setOpen] = useState(false);
  // Portals need document.body, so render nothing on the server.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const primary = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Wait for the page to settle so the dialog lands over real content.
    const t = setTimeout(() => !readSeen() && setOpen(true), 500);
    const onOpen = () => {
      play("open");
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    play("close");
    setOpen(false);
    markSeen();
  }

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--canvas)_35%,rgba(0,0,0,0.25))] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
            className="relative w-full max-w-[420px] rounded-t-[30px] bg-surface p-6 pb-[max(env(safe-area-inset-bottom),24px)] shadow-float sm:rounded-[30px]"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[14px] bg-accent-soft">
                <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
                  <rect x="6.5" y="19.5" width="12" height="5" rx="2.5" fill="var(--accent)" fillOpacity=".45" />
                  <rect x="10" y="13.5" width="12" height="5" rx="2.5" fill="var(--accent)" fillOpacity=".7" />
                  <rect x="13.5" y="7.5" width="12" height="5" rx="2.5" fill="var(--accent)" />
                </svg>
              </span>
              <span className="label">Welcome to StableSave</span>
            </div>

            <h2
              id="welcome-title"
              className="mt-5 font-display text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] text-ink"
            >
              Put your idle crypto dollars to work
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              Stablecoins can earn interest, like a savings account. We show you where, how much, and how risky.
            </p>

            <ol className="mt-5 flex flex-col gap-3">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.12 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-[12px] font-semibold text-ink-2">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{s.title}</span>
                    <span className="block text-[13px] leading-snug text-ink-3">{s.body}</span>
                  </span>
                </motion.li>
              ))}
            </ol>

            {/* Reassurance is always visible, not hidden behind a toggle. */}
            <p className="mt-5 flex gap-2.5 rounded-[18px] bg-surface-2 px-4 py-3 text-[13px] leading-snug text-ink-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px shrink-0 text-accent" aria-hidden>
                <path d="M8 1.8 3 3.7v4c0 3.1 2.1 5.6 5 6.5 2.9-.9 5-3.4 5-6.5v-4L8 1.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m5.8 8 1.6 1.6L10.4 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                Browsing is completely safe. DeFi isn’t a bank, so every option gets an{" "}
                <b className="font-semibold text-ink">A–D safety grade</b>. New? Start with A or B.
              </span>
            </p>

            <button
              ref={primary}
              onClick={close}
              className="pressable mt-6 h-13 w-full rounded-full bg-ink font-display text-[16px] font-medium text-canvas"
            >
              Show me my options
            </button>
            <p className="label mt-3 text-center">Free · No wallet · No sign-up</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
