"use client";

import { AnimatePresence, motion } from "motion/react";
import { Drawer } from "vaul";
import type { ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd, hostname } from "@/lib/format";
import { GRADE_LABEL, projectedEarnings } from "@/lib/scoring";
import { ArrowUpRight, GradeBadge, ProtocolMark, spring } from "./primitives";

export const MAX_COMPARE = 3;

/** Floating pill that springs up once something is queued for comparison. */
export function CompareTray({
  items,
  onOpen,
  onClear,
}: {
  items: ScoredOpportunity[];
  onOpen: () => void;
  onClear: () => void;
}) {
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96, transition: { duration: 0.18 } }}
          transition={spring}
          className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),20px)] z-30 flex justify-center px-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-ink p-1.5 pl-2 text-canvas shadow-float">
            <div className="flex -space-x-2">
              <AnimatePresence initial={false}>
                {items.map((o) => (
                  <motion.span
                    key={o.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={spring}
                    className="rounded-full ring-2 ring-ink"
                  >
                    <ProtocolMark logo={o.protocol.logo} name={o.protocol.name} size={30} />
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <button onClick={onClear} className="pressable px-2 text-[13px] font-medium opacity-60 hover:opacity-100">
              Clear
            </button>
            <button
              onClick={onOpen}
              disabled={items.length < 2}
              className="pressable h-10 rounded-full bg-canvas px-4 text-[14px] font-semibold text-ink disabled:opacity-50"
            >
              {items.length < 2 ? "Pick one more" : `Compare ${items.length}`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CompareSheet({
  items,
  amount,
  open,
  onOpenChange,
  onRemove,
}: {
  items: ScoredOpportunity[];
  amount: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const best = (fn: (o: ScoredOpportunity) => number) => {
    const max = Math.max(...items.map(fn));
    return (o: ScoredOpportunity) => fn(o) === max && items.length > 1;
  };
  const bestApy = best((o) => o.apy);
  const bestSafety = best((o) => o.safety);
  const bestTvl = best((o) => o.tvlUsd);

  const rows: { label: string; render: (o: ScoredOpportunity) => React.ReactNode; win?: (o: ScoredOpportunity) => boolean }[] = [
    { label: "Yearly rate", render: (o) => formatPct(o.apy), win: bestApy },
    { label: "Earn in a year", render: (o) => `+${formatUsd(projectedEarnings(amount, o.apy))}`, win: bestApy },
    { label: "Safety score", render: (o) => `${o.safety}/100`, win: bestSafety },
    { label: "Risk level", render: (o) => GRADE_LABEL[o.grade] },
    { label: "Money in pool", render: (o) => formatUsd(o.tvlUsd, true), win: bestTvl },
    { label: "From bonuses", render: (o) => (o.apy ? `${Math.round((o.apyReward / o.apy) * 100)}%` : "0%") },
    { label: "Network", render: (o) => o.chain },
    { label: "Type of app", render: (o) => o.protocol.category },
  ];

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] w-full max-w-[760px] flex-col rounded-t-[32px] bg-surface outline-none sm:bottom-3 sm:rounded-[32px] sm:after:hidden"
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full" style={{ background: "var(--hairline-strong)" }} />
          <div className="no-scrollbar overflow-y-auto px-5 pt-4 pb-6 sm:px-6">
            <Drawer.Title className="font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">
              Side by side
            </Drawer.Title>
            <p className="text-[14px] text-ink-3">Based on {formatUsd(amount)}. The best in each row is highlighted in green.</p>

            <div className="no-scrollbar -mx-5 mt-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <table className="w-full min-w-[520px] border-separate border-spacing-0 text-[14px]">
                <thead>
                  <tr>
                    <th className="w-[112px]" />
                    {items.map((o) => (
                      <th key={o.id} className="px-1.5 pb-4 text-left align-top font-normal">
                        <div className="flex flex-col gap-2 rounded-[20px] bg-surface-2 p-3">
                          <div className="flex items-center justify-between">
                            <ProtocolMark logo={o.protocol.logo} name={o.protocol.name} chain={o.chain} size={36} />
                            <button
                              onClick={() => onRemove(o.id)}
                              aria-label={`Remove ${o.protocol.name}`}
                              className="pressable grid size-7 place-items-center rounded-full bg-sunken text-ink-3 hover:text-ink"
                            >
                              ×
                            </button>
                          </div>
                          <p className="truncate font-semibold text-ink">{o.protocol.name}</p>
                          <GradeBadge grade={o.grade} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className="border-t border-hairline py-3 pr-2 text-ink-3">{r.label}</td>
                      {items.map((o) => {
                        const win = r.win?.(o);
                        return (
                          <td key={o.id} className="border-t border-hairline px-1.5 py-3">
                            <span
                              className={`tabular inline-flex rounded-full px-2 py-0.5 font-semibold ${
                                win ? "bg-accent-soft text-accent-ink" : "text-ink"
                              }`}
                            >
                              {r.render(o)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td />
                    {items.map((o) => (
                      <td key={o.id} className="px-1.5 pt-4">
                        <a
                          href={o.protocol.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pressable flex h-11 items-center justify-center gap-1.5 rounded-full bg-ink px-3 text-[13px] font-semibold whitespace-nowrap text-canvas"
                        >
                          {hostname(o.protocol.url)} <ArrowUpRight size={14} />
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
