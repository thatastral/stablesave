"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { formatUsd } from "@/lib/format";
import { TokenIcon } from "./primitives";

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
      className="pressable flex h-8 items-center gap-1.5 rounded-[8px] border border-line bg-surface px-2.5 text-[13px] font-medium text-ink-2 hover:text-ink"
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
    body: "Type an amount of USDC or USDT. These are crypto dollars, each always worth about $1.",
  },
  {
    title: "We compare savings options for you",
    body: "We check interest rates and safety across dozens of DeFi apps and put the best fits first.",
  },
  {
    title: "Deposit on the official app",
    body: "Pick one and we take you straight to it. You deposit there. We never touch your money.",
  },
];

export function Welcome({ example }: { example: { amount: number; yearly: number } | null }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
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
    const onOpen = () => setOpen(true);
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
    setOpen(false);
    setMore(false);
    markSeen();
  }

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative flex max-h-[92dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[18px] border border-line bg-surface shadow-float sm:rounded-[14px]"
          >
            <div className="no-scrollbar overflow-y-auto">
              <Preview example={example} />

              <div className="px-6 pt-6 pb-2">
                <h2
                  id="welcome-title"
                  className="font-display text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-ink"
                >
                  Put your idle crypto dollars to work
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  Stablecoins can earn interest, a bit like a savings account. StableSave shows you where, how much,
                  and how risky it is, in plain English.
                </p>

                <ol className="mt-6 overflow-hidden rounded-[10px] border border-line">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className={`flex gap-3.5 px-4 py-3.5 ${i ? "border-t border-line" : ""}`}>
                      <span className="mt-0.5 font-mono text-[12px] text-accent-ink tabular">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold text-ink">{s.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{s.body}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <button
                  onClick={() => setMore((m) => !m)}
                  aria-expanded={more}
                  className="mt-3 flex w-full items-center justify-between py-2 text-left text-[14px] font-medium text-ink"
                >
                  Is this safe?
                  <motion.svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    animate={{ rotate: more ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="text-ink-3"
                    aria-hidden
                  >
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {more && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-2 text-[14px] leading-relaxed text-ink-2">
                        Browsing here is completely safe: no wallet, no sign-up, nothing to sign. Depositing is where
                        the risk is. DeFi apps aren’t banks, so there’s no deposit insurance. That’s why every option
                        gets an <b className="text-ink">A–D safety grade</b>. If you’re new, start with A or B and a
                        small amount.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="shrink-0 border-t border-line px-6 pt-4 pb-[max(env(safe-area-inset-bottom),20px)]">
              <button
                ref={primary}
                onClick={close}
                className="pressable h-12 w-full rounded-[10px] bg-ink text-[15px] font-medium text-canvas"
              >
                Show me my options
              </button>
              <p className="label mt-3 text-center">Free · No wallet needed · No sign-up</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** A small "statement" showing the core idea: dollars in, interest out. */
function Preview({ example }: { example: { amount: number; yearly: number } | null }) {
  const amount = example?.amount || 10_000;
  const yearly = example?.yearly ?? 0;
  return (
    <div
      className="relative border-b border-line px-6 py-6"
      style={{
        backgroundColor: "var(--surface-2)",
        backgroundImage: "radial-gradient(var(--line) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      <div className="rounded-[10px] border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-[13px] text-ink-2">
            <TokenIcon asset="USDC" size={18} />
            You deposit
          </span>
          <span className="font-display text-[16px] font-semibold text-ink tabular">{formatUsd(amount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-line px-4 py-3">
          <span className="text-[13px] text-ink-2">Interest in a year</span>
          <span className="font-display text-[16px] font-semibold text-accent-ink tabular">
            {yearly > 0 ? `+${formatUsd(yearly)}` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-2.5">
          <span className="label">Safety</span>
          <span
            className="inline-flex h-5 items-center gap-1 rounded-[5px] pr-1.5 pl-[2px] text-[11px] font-medium"
            style={{ background: "var(--grade-a-soft)", color: "var(--grade-a)" }}
          >
            <span
              className="grid size-4 place-items-center rounded-[3px] font-mono text-[10px] text-white"
              style={{ background: "var(--grade-a)" }}
            >
              A
            </span>
            Safer
          </span>
        </div>
      </div>
    </div>
  );
}
