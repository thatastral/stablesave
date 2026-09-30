"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { formatUsd } from "@/lib/format";
import { TokenIcon, spring } from "./primitives";

const SEEN_KEY = "stablesave:welcome-v1";
const OPEN_EVENT = "stablesave:welcome";

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
      className="pressable flex h-9 items-center gap-1.5 rounded-full bg-surface pr-3.5 pl-2 text-ink-2 shadow-card hover:text-ink"
    >
      <span className="grid size-5 place-items-center rounded-full bg-accent-soft text-[11px] font-extrabold text-accent-ink">
        ?
      </span>
      How it works
    </button>
  );
}

const STEPS = [
  {
    icon: "💵",
    title: "Tell us how much you have",
    body: "Type an amount of USDC or USDT. These are crypto dollars, each always worth about $1.",
  },
  {
    icon: "🔎",
    title: "We compare savings options for you",
    body: "We check interest rates and safety across dozens of DeFi apps and put the best fits first.",
  },
  {
    icon: "🔐",
    title: "Deposit on the official app",
    body: "Pick one and we take you straight to it. You deposit there. We never touch your money.",
  },
];

export function Welcome({ example }: { example: { amount: number; yearly: number } | null }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    // Wait for the page to settle so the sheet rises over real content.
    const t = setTimeout(() => !readSeen() && setOpen(true), 500);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  function onOpenChange(o: boolean) {
    setOpen(o);
    if (!o) {
      markSeen();
      setMore(false);
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[32px] bg-surface outline-none sm:bottom-6 sm:rounded-[32px] sm:after:hidden"
        >
          <div className="no-scrollbar overflow-y-auto">
            <Illustration example={example} />

            <div className="px-6 pt-6 pb-2">
              <Drawer.Title className="font-display text-[28px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink">
                Put your idle crypto dollars to work
              </Drawer.Title>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                Stablecoins can earn interest, a bit like a savings account. StableSave shows you where, how much, and
                how risky it is, in plain English.
              </p>

              <ol className="mt-6 flex flex-col gap-4">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={s.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.15 + i * 0.06 }}
                    className="flex gap-3.5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-surface-2 text-[20px]">
                      {s.icon}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{s.title}</span>
                      <span className="block text-[14px] leading-snug text-ink-3">{s.body}</span>
                    </span>
                  </motion.li>
                ))}
              </ol>

              <button
                onClick={() => setMore((m) => !m)}
                aria-expanded={more}
                className="mt-6 flex w-full items-center justify-between rounded-[18px] bg-surface-2 px-4 py-3 text-left text-[14px] font-semibold text-ink"
              >
                Is this safe?
                <motion.span animate={{ rotate: more ? 45 : 0 }} transition={spring} className="text-[18px] text-ink-3">
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {more && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-1 pt-3 text-[14px] leading-relaxed text-ink-2">
                      Browsing here is completely safe: no wallet, no sign-up, nothing to sign. Depositing is where the
                      risk is. DeFi apps aren’t banks, so there’s no deposit insurance. That’s why every option gets an{" "}
                      <b className="text-ink">A–D safety grade</b>. If you’re new, start with A or B and a small amount.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="shrink-0 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            <button
              onClick={() => onOpenChange(false)}
              className="pressable h-14 w-full rounded-full bg-ink text-[16px] font-semibold text-canvas"
            >
              Show me my options
            </button>
            <p className="mt-3 text-center text-[12px] text-ink-3">Free · No wallet needed · No sign-up</p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Soft wash with floating coins and an earnings chip. */
function Illustration({ example }: { example: { amount: number; yearly: number } | null }) {
  const bars = [0.35, 0.48, 0.44, 0.6, 0.72, 0.86];
  return (
    <div
      className="relative h-[190px] overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 20% 0%, var(--accent-soft), transparent 60%), radial-gradient(90% 90% at 100% 30%, var(--blue-soft), transparent 60%), var(--surface-2)",
      }}
    >
      {/* Growth bars */}
      <div className="absolute inset-x-10 bottom-0 flex h-[120px] items-end gap-2.5">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-t-[10px]"
            style={{
              height: `${h * 100}%`,
              transformOrigin: "bottom",
              background: `color-mix(in srgb, var(--accent) ${20 + i * 12}%, transparent)`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...spring, delay: 0.1 + i * 0.05 }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-7 left-8"
        initial={{ opacity: 0, y: 10, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -8 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <span className="block rounded-full shadow-float">
          <TokenIcon asset="USDC" size={52} />
        </span>
      </motion.div>
      <motion.div
        className="absolute top-14 left-[92px]"
        initial={{ opacity: 0, y: 10, rotate: 14 }}
        animate={{ opacity: 1, y: 0, rotate: 10 }}
        transition={{ ...spring, delay: 0.28 }}
      >
        <span className="block rounded-full shadow-float">
          <TokenIcon asset="USDT" size={40} />
        </span>
      </motion.div>

      {example && example.amount > 0 && (
      <motion.div
        className="absolute top-8 right-7 rounded-[18px] bg-surface px-3.5 py-2.5 shadow-float"
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...spring, delay: 0.4 }}
      >
        <p className="text-[11px] font-medium text-ink-3">{formatUsd(example.amount)} could earn</p>
        <p className="font-display text-[20px] leading-tight font-extrabold text-accent-ink">
          +{formatUsd(example.yearly)}/yr
        </p>
      </motion.div>
      )}
    </div>
  );
}
