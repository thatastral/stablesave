"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Appetite, Asset, ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { APPETITES, GRADE_LABEL, projectedEarnings } from "@/lib/scoring";
import { AnimatedNumber, Chevron, ProtocolMark, Segmented, TokenIcon, gradeColor } from "./primitives";
import { play } from "@/lib/sound";

const PRESETS = [100, 1_000, 10_000, 50_000];
const MAX = 1_000_000_000;
const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * The hero: "You have → You could earn", built like a swap widget. The answer
 * appears in the lower panel as you type, so the page answers its own question.
 */
export function Composer({
  amount,
  asset,
  appetite,
  top,
  optionCount,
  onAmount,
  onAsset,
  onAppetite,
  onOpenTop,
}: {
  amount: number;
  asset: Asset;
  appetite: Appetite;
  top: ScoredOpportunity | undefined;
  optionCount: number;
  onAmount: (n: number) => void;
  onAsset: (a: Asset) => void;
  onAppetite: (a: Appetite) => void;
  onOpenTop: () => void;
}) {
  const display = amount ? amount.toLocaleString("en-US") : "";
  const hint = APPETITES.find((a) => a.key === appetite)!.hint;
  const yearly = top ? projectedEarnings(amount, top.apy) : 0;

  // A soft chime when the answer changes to a different pick (not on first load).
  const lastTop = useRef(top?.id);
  useEffect(() => {
    if (top?.id && lastTop.current && top.id !== lastTop.current) play("chime");
    lastTop.current = top?.id;
  }, [top?.id]);

  return (
    <section className="mx-auto flex w-full max-w-[520px] flex-col items-center px-4 pt-12 text-center sm:pt-16">
      {/* Entrances use CSS so content is visible before JS hydrates. */}
      <p className="enter label flex items-center gap-2">
        <span className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative size-1.5 rounded-full bg-accent" />
        </span>
        Live rates · No wallet or sign-up
      </p>

      <h1
        style={{ animationDelay: "60ms" }}
        className="enter mt-4 font-display text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-[50px]"
      >
        How much do you want to grow?
      </h1>

      <div
        style={{ animationDelay: "120ms" }}
        className="enter mt-9 w-full rounded-[30px] bg-surface p-2.5 text-left shadow-soft"
      >
        {/* You have */}
        <div className="rounded-[22px] bg-surface-2 px-5 pt-4 pb-4 transition-shadow duration-200 focus-within:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--accent)_45%,transparent)]">
          <div className="flex items-center justify-between">
            <label htmlFor="amount" className="text-[13px] font-medium text-ink-3">
              You have
            </label>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="amount"
              className="flex min-w-0 flex-1 cursor-text items-baseline overflow-hidden font-display leading-none font-semibold tracking-[-0.03em] text-ink"
              style={{ fontSize: "clamp(40px, 11vw, 54px)" }}
            >
              <span aria-hidden className={`mr-[0.03em] text-[0.62em] ${amount ? "text-ink-2" : "text-ink-3"}`}>
                $
              </span>
              <input
                id="amount"
                aria-label="Amount in US dollars"
                inputMode="numeric"
                autoComplete="off"
                value={display}
                placeholder="0"
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^\d]/g, ""));
                  play("tick");
                  onAmount(Math.min(n, MAX));
                }}
                className="tabular w-full min-w-0 bg-transparent caret-accent outline-none placeholder:text-ink-3"
              />
            </label>
            <TokenSelect asset={asset} onChange={onAsset} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => onAmount(p)}
                aria-pressed={amount === p}
                className={`pressable h-7 rounded-full px-3 font-display text-[12px] font-medium tabular transition-colors duration-150 ${
                  amount === p ? "bg-ink text-canvas" : "bg-surface text-ink-2 shadow-card hover:text-ink"
                }`}
              >
                ${p >= 1000 ? `${p / 1000}k` : p}
              </button>
            ))}
          </div>
        </div>

        {/* Seam between the two panels, like a swap widget. */}
        <div className="relative z-10 -my-[13px] flex justify-center" aria-hidden>
          <motion.span
            key={asset}
            initial={{ rotate: -90, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
            className="grid size-[34px] place-items-center rounded-full border-[4px] border-surface bg-surface-2 text-ink-2"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10m0 0 4-4m-4 4L4 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </div>

        {/* You could earn */}
        <button
          onClick={onOpenTop}
          disabled={!top}
          className="group w-full rounded-[22px] bg-[color-mix(in_srgb,var(--accent-soft)_55%,var(--surface-2))] px-5 pt-4 pb-4 text-left transition-colors duration-200 hover:bg-accent-soft disabled:cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-3">You could earn in a year</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p
              className="min-w-0 truncate font-display leading-none font-semibold tracking-[-0.03em] text-accent-ink"
              style={{ fontSize: "clamp(40px, 11vw, 54px)" }}
            >
              {top ? (
                <>
                  +<AnimatedNumber value={yearly} format={(n) => formatUsd(n)} />
                </>
              ) : (
                <span className="text-ink-3">—</span>
              )}
            </p>
            <AnimatePresence mode="popLayout" initial={false}>
              {top && (
                <motion.span
                  key={top.id}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-surface pr-3 pl-1.5 shadow-card"
                >
                  <ProtocolMark logo={top.protocol.logo} name={top.protocol.name} chain={top.chain} size={24} />
                  <span className="max-w-[120px] truncate text-[14px] font-semibold text-ink">{top.protocol.name}</span>
                  <Chevron size={13} className="text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {top && (
            <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-3">
              <span>
                at <span className="font-semibold text-ink tabular">{formatPct(top.apy)}</span> a year
              </span>
              <GradeInline grade={top.grade} />
            </p>
          )}
        </button>

        {/* Risk */}
        <div className="px-3 pt-5 pb-2.5">
          <span className="text-[13px] font-medium text-ink-2">How much risk are you okay with?</span>
          <div className="mt-2.5 [&>div]:flex [&>div]:w-full [&>div>button]:flex-1 [&>div>button]:justify-center">
            <Segmented<Appetite>
              label="Risk comfort"
              sound
              value={appetite}
              onChange={onAppetite}
              options={APPETITES.map((a) => ({ key: a.key, label: a.label }))}
            />
          </div>
          <p key={appetite} className="enter mt-2 text-[12px] text-ink-3">
            {hint}
          </p>
        </div>
      </div>

      <a
        href="#options"
        style={{ animationDelay: "240ms" }}
        className="enter mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
      >
        See all {optionCount} options that fit you
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 3v10m0 0 4-4m-4 4L4 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}

function GradeInline({ grade }: { grade: ScoredOpportunity["grade"] }) {
  const { fg, bg } = gradeColor(grade);
  return (
    <span
      className="inline-flex h-[22px] items-center gap-1 rounded-full pr-2 pl-[3px] text-[12px] font-medium"
      style={{ background: bg, color: fg }}
    >
      <span className="grid size-4 place-items-center rounded-full font-display text-[10px] font-semibold text-white" style={{ background: fg }}>
        {grade}
      </span>
      {GRADE_LABEL[grade]}
    </span>
  );
}

/** Token pill with a small, origin-aware menu (opens from the pill). */
function TokenSelect({ asset, onChange }: { asset: Asset; onChange: (a: Asset) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Stablecoin: ${asset}`}
        className="pressable flex h-10 items-center gap-1.5 rounded-full bg-surface pr-2.5 pl-1.5 font-display text-[15px] font-medium text-ink shadow-card"
      >
        <TokenIcon asset={asset} size={22} />
        {asset}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2, ease: EASE }} className="text-ink-3">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Choose a stablecoin"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute top-full right-0 z-30 mt-2 w-[220px] rounded-[20px] bg-surface p-1.5 shadow-float"
          >
            {(["USDC", "USDT"] as const).map((a) => (
              <li key={a}>
                <button
                  role="option"
                  aria-selected={a === asset}
                  onClick={() => {
                    play("select");
                    onChange(a);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <TokenIcon asset={a} size={26} />
                  <span className="flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{a}</span>
                    <span className="block text-[12px] text-ink-3">{a === "USDC" ? "USD Coin by Circle" : "Tether USD"}</span>
                  </span>
                  {a === asset && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent" aria-hidden>
                      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
