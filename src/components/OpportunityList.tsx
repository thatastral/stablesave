"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { projectedEarnings } from "@/lib/scoring";
import { AnimatedNumber, Check, Chevron, GradeBadge, Plus, ProtocolMark, spring } from "./primitives";

export function TopPick({
  item,
  amount,
  onOpen,
}: {
  item: ScoredOpportunity;
  amount: number;
  onOpen: () => void;
}) {
  const yearly = projectedEarnings(amount, item.apy);
  return (
    <motion.button
      layout
      transition={spring}
      onClick={onOpen}
      className="pressable group relative w-full overflow-hidden rounded-[32px] bg-surface p-6 text-left shadow-card sm:p-7"
    >
      {/* Soft glow, purely decorative. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-bold tracking-wide text-accent-ink uppercase">
          ★ Top pick for you
        </span>
        <GradeBadge grade={item.grade} withLabel />
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[14px] font-medium text-ink-3">In a year, you could earn about</p>
          <p className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em] text-ink sm:text-[52px]">
            <AnimatedNumber value={yearly} format={(n) => formatUsd(n)} />
            <span className="ml-1.5 text-[20px] font-bold tracking-normal text-ink-3">/yr</span>
          </p>
          <p className="mt-2 text-[14px] text-ink-2">
            That’s about <AnimatedNumber value={yearly / 12} format={(n) => formatUsd(n)} className="font-semibold text-ink" />{" "}
            a month, at a <span className="font-semibold text-accent-ink">{formatPct(item.apy)}</span> yearly rate
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-3 rounded-[20px] bg-surface-2 p-3 pr-4">
        <ProtocolMark logo={item.protocol.logo} name={item.protocol.name} chain={item.chain} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink">
            {item.protocol.name}
            {item.poolMeta && <span className="font-normal text-ink-3"> · {item.poolMeta}</span>}
          </p>
          <p className="truncate text-[13px] text-ink-3">
            On {item.chain} · {formatUsd(item.tvlUsd, true)} deposited by others
          </p>
        </div>
        <Chevron className="text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

export function OpportunityList({
  items,
  amount,
  compare,
  onOpen,
  onToggleCompare,
}: {
  items: ScoredOpportunity[];
  amount: number;
  compare: string[];
  onOpen: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-[28px] bg-surface shadow-card">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((o, i) => {
          const inCompare = compare.includes(o.id);
          return (
            <motion.li
              key={o.id}
              layout="position"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              transition={spring}
              className="relative"
            >
              {i > 0 && <span aria-hidden className="absolute top-0 right-5 left-[76px] h-px bg-hairline" />}
              <div className="row-hover flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 sm:px-5">
                <button
                  onClick={() => onOpen(o.id)}
                  className="flex min-w-0 flex-1 items-center gap-3.5 text-left outline-none"
                >
                  <ProtocolMark logo={o.protocol.logo} name={o.protocol.name} chain={o.chain} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">
                      {o.protocol.name}
                      {o.poolMeta && <span className="font-normal text-ink-3"> · {o.poolMeta}</span>}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-3">
                      <GradeDot grade={o.grade} />
                      <span className="truncate">
                        {o.chain} · {formatUsd(o.tvlUsd, true)}
                        {o.hasRewards && <span className="text-blue"> · incl. bonus</span>}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-[18px] font-extrabold tracking-[-0.01em] text-ink tabular">
                      {formatPct(o.apy)}
                    </p>
                    <p className="text-[13px] font-medium text-accent-ink tabular">
                      +<AnimatedNumber value={projectedEarnings(amount, o.apy)} format={(n) => formatUsd(n)} />
                      /yr
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onToggleCompare(o.id)}
                  aria-pressed={inCompare}
                  aria-label={inCompare ? `Remove ${o.protocol.name} from compare` : `Add ${o.protocol.name} to compare`}
                  className={`pressable grid size-8 shrink-0 place-items-center rounded-full ${
                    inCompare ? "bg-ink text-canvas" : "bg-sunken text-ink-3 hover:text-ink"
                  }`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={inCompare ? "on" : "off"}
                      initial={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
                      transition={{ duration: 0.15 }}
                    >
                      {inCompare ? <Check /> : <Plus />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function GradeDot({ grade }: { grade: ScoredOpportunity["grade"] }) {
  const color = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)", D: "var(--grade-d)" }[grade];
  return (
    <span
      title={`Safety grade ${grade}`}
      className="inline-flex h-[18px] shrink-0 items-center rounded-full px-1.5 font-display text-[11px] font-extrabold"
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {grade}
    </span>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] bg-surface px-6 py-14 text-center shadow-card">
      <div className="grid size-14 place-items-center rounded-full bg-sunken text-[26px]">🔍</div>
      <p className="mt-4 font-display text-[20px] font-extrabold text-ink">No matches with these filters</p>
      <p className="mt-1 max-w-[300px] text-[14px] text-ink-3">
        Try another network, or choose “Go bigger” to see every option.
      </p>
      <button onClick={onReset} className="pressable mt-5 h-10 rounded-full bg-ink px-5 text-[14px] font-semibold text-canvas">
        Show everything
      </button>
    </div>
  );
}
