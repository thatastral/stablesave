"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { GRADE_LABEL, projectedEarnings } from "@/lib/scoring";
import { AnimatedNumber, Check, Chevron, GradeBadge, Plus, ProtocolMark, gradeColor, spring } from "./primitives";

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
      className="group relative grid w-full overflow-hidden rounded-[14px] border border-line bg-surface text-left shadow-card transition-colors duration-150 hover:border-[var(--hairline-strong)] md:grid-cols-[1.1fr_1fr]"
    >
      {/* Accent rule marks the recommendation without decoration. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-accent" />

      <div className="px-6 pt-5 pb-6">
        <div className="flex items-center gap-2">
          <span className="label text-accent-ink!">Top pick for you</span>
        </div>
        <p className="mt-4 text-[14px] text-ink-3">In a year, you could earn about</p>
        <p className="mt-1 font-display text-[48px] leading-none font-semibold tracking-[-0.04em] text-ink">
          <AnimatedNumber value={yearly} format={(n) => formatUsd(n)} />
          <span className="ml-1.5 text-[18px] font-medium tracking-normal text-ink-3">/yr</span>
        </p>
        <p className="mt-3 text-[14px] text-ink-2">
          That’s about{" "}
          <AnimatedNumber value={yearly / 12} format={(n) => formatUsd(n)} className="font-semibold text-ink" /> a month,
          at a <span className="font-semibold text-accent-ink">{formatPct(item.apy)}</span> yearly rate
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-line bg-surface-2 px-6 py-5 md:border-t-0 md:border-l">
        <div className="flex items-center gap-3">
          <ProtocolMark logo={item.protocol.logo} name={item.protocol.name} chain={item.chain} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">{item.protocol.name}</p>
            <p className="truncate text-[13px] text-ink-3">{item.poolMeta ?? item.symbol}</p>
          </div>
          <GradeBadge grade={item.grade} withLabel />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <dt className="text-ink-3">Network</dt>
          <dd className="text-right font-medium text-ink">{item.chain}</dd>
          <dt className="text-ink-3">Deposited by others</dt>
          <dd className="tabular text-right font-medium text-ink">{formatUsd(item.tvlUsd, true)}</dd>
        </dl>
        <span className="flex items-center gap-1 text-[13px] font-medium text-ink">
          See details
          <Chevron size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
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
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface shadow-card">
      {/* Column headers: desktop only, mobile rows carry their own labels. */}
      <div className="label hidden grid-cols-[minmax(0,1fr)_96px_120px_120px_40px] items-center gap-4 border-b border-line bg-surface-2 px-5 py-2.5 md:grid">
        <span>Option</span>
        <span className="text-right">Yearly rate</span>
        <span className="text-right">You’d earn / yr</span>
        <span>Safety</span>
        <span className="sr-only">Compare</span>
      </div>
      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((o, i) => {
            const inCompare = compare.includes(o.id);
            return (
              <motion.li
                key={o.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={spring}
                className={`relative ${i > 0 ? "border-t border-line" : ""}`}
              >
                <div className="row-hover flex items-center gap-3 px-4 py-3 transition-colors duration-150 md:grid md:grid-cols-[minmax(0,1fr)_96px_120px_120px_40px] md:gap-4 md:px-5">
                  <button
                    onClick={() => onOpen(o.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none md:col-span-4 md:grid md:grid-cols-subgrid md:items-center"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <ProtocolMark logo={o.protocol.logo} name={o.protocol.name} chain={o.chain} size={36} />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-ink">
                          {o.protocol.name}
                          {o.poolMeta && <span className="font-normal text-ink-3"> · {o.poolMeta}</span>}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-ink-3">
                          <GradeDot grade={o.grade} className="md:hidden" />
                          {o.chain} · {formatUsd(o.tvlUsd, true)}
                          {o.hasRewards && <span className="text-blue"> · incl. bonus</span>}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right md:contents">
                      <span className="block font-display text-[16px] font-semibold tracking-[-0.01em] text-ink tabular md:text-right">
                        {formatPct(o.apy)}
                      </span>
                      <span className="block text-[12px] font-medium text-accent-ink tabular md:text-right md:text-[14px]">
                        +<AnimatedNumber value={projectedEarnings(amount, o.apy)} format={(n) => formatUsd(n)} />
                        <span className="md:hidden">/yr</span>
                      </span>
                    </span>
                    <span className="hidden md:block">
                      <GradeBadge grade={o.grade} withLabel />
                    </span>
                  </button>
                  <button
                    onClick={() => onToggleCompare(o.id)}
                    aria-pressed={inCompare}
                    aria-label={inCompare ? `Remove ${o.protocol.name} from compare` : `Add ${o.protocol.name} to compare`}
                    title={inCompare ? "Remove from compare" : "Add to compare"}
                    className={`pressable grid size-8 shrink-0 place-items-center rounded-[8px] border ${
                      inCompare ? "border-ink bg-ink text-canvas" : "border-line text-ink-3 hover:text-ink"
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
    </div>
  );
}

function GradeDot({ grade, className = "" }: { grade: ScoredOpportunity["grade"]; className?: string }) {
  const { fg, bg } = gradeColor(grade);
  return (
    <span
      title={`Safety grade ${grade}: ${GRADE_LABEL[grade]}`}
      className={`inline-grid h-4 min-w-4 shrink-0 place-items-center rounded-[4px] px-1 font-mono text-[10px] font-medium ${className}`}
      style={{ color: fg, background: bg }}
    >
      {grade}
    </span>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-start rounded-[14px] border border-line bg-surface px-6 py-10">
      <p className="label">No results</p>
      <p className="mt-2 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">
        No matches with these filters
      </p>
      <p className="mt-1 max-w-[360px] text-[14px] text-ink-3">
        Try another network, or choose “Go bigger” to see every option.
      </p>
      <button
        onClick={onReset}
        className="pressable mt-5 h-9 rounded-[10px] bg-ink px-4 text-[14px] font-medium text-canvas"
      >
        Show everything
      </button>
    </div>
  );
}
