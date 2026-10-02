"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { GRADE_LABEL, projectedEarnings } from "@/lib/scoring";
import { AnimatedNumber, Check, Plus, ProtocolMark, gradeColor, spring } from "./primitives";
import { play } from "@/lib/sound";

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
    <ul className="overflow-hidden rounded-[28px] bg-surface p-1.5 shadow-card">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((o, i) => {
          const inCompare = compare.includes(o.id);
          return (
            <motion.li
              key={o.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1], delay: Math.min(i, 8) * 0.03 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={spring}
              className="relative"
            >
              {i > 0 && <span aria-hidden className="absolute top-0 right-5 left-[76px] h-px bg-[var(--hairline)]" />}
              <div className="row-hover group flex items-center gap-3 rounded-[22px] px-3.5 py-3.5 transition-colors duration-150">
                <button onClick={() => onOpen(o.id)} className="flex min-w-0 flex-1 items-center gap-3.5 text-left outline-none">
                  <ProtocolMark logo={o.protocol.logo} name={o.protocol.name} chain={o.chain} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-medium text-ink">
                      {o.protocol.name}
                      {o.poolMeta && <span className="font-normal text-ink-3"> · {o.poolMeta}</span>}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-ink-3">
                      <GradeDot grade={o.grade} />
                      <span className="truncate">
                        {o.chain} · {formatUsd(o.tvlUsd, true)}
                        {o.hasRewards && <span className="text-blue"> · incl. bonus</span>}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-[17px] font-semibold tracking-[-0.01em] text-ink tabular">
                      {formatPct(o.apy)}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-medium text-accent-ink tabular">
                      +<AnimatedNumber value={projectedEarnings(amount, o.apy)} format={(n) => formatUsd(n)} />/yr
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (!inCompare) play("pop");
                    onToggleCompare(o.id);
                  }}
                  aria-pressed={inCompare}
                  aria-label={inCompare ? `Remove ${o.protocol.name} from compare` : `Add ${o.protocol.name} to compare`}
                  title={inCompare ? "Remove from compare" : "Add to compare"}
                  className={`pressable grid size-8 shrink-0 place-items-center rounded-full transition-colors ${
                    inCompare ? "bg-ink text-canvas" : "bg-surface-2 text-ink-3 hover:text-ink"
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

function GradeDot({ grade, className = "" }: { grade: ScoredOpportunity["grade"]; className?: string }) {
  const { fg, bg } = gradeColor(grade);
  return (
    <span
      title={`Safety grade ${grade}: ${GRADE_LABEL[grade]}`}
      className={`inline-grid h-4 min-w-4 shrink-0 place-items-center rounded-full px-1 font-display text-[10px] font-semibold ${className}`}
      style={{ color: fg, background: bg }}
    >
      {grade}
    </span>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] bg-surface px-6 py-12 text-center shadow-card">
      <p className="label">No results</p>
      <p className="mt-2 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">
        No matches with these filters
      </p>
      <p className="mt-1 max-w-[360px] text-[14px] text-ink-3">
        Try another network, or choose “Go bigger” to see every option.
      </p>
      <button
        onClick={onReset}
        className="pressable mt-5 h-10 rounded-full bg-ink px-5 text-[14px] font-medium text-canvas"
      >
        Show everything
      </button>
    </div>
  );
}
