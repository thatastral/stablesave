"use client";

import type { SortKey } from "@/lib/types";
import { ChainIcon, Segmented } from "./primitives";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "match", label: "Best for you" },
  { key: "apy", label: "Highest rate" },
  { key: "safety", label: "Safest" },
  { key: "tvl", label: "Most popular" },
];

export function Filters({
  sort,
  onSort,
  chains,
  selected,
  onToggleChain,
  onClearChains,
  count,
}: {
  sort: SortKey;
  onSort: (s: SortKey) => void;
  chains: { name: string; count: number }[];
  selected: string[];
  onToggleChain: (c: string) => void;
  onClearChains: () => void;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-ink">
          All options <span className="ml-1 font-mono text-[12px] font-normal text-ink-3 tabular">{count}</span>
        </p>
        <div className="no-scrollbar -mr-4 overflow-x-auto pr-4 sm:mr-0 sm:pr-0">
          <Segmented<SortKey> label="Sort by" size="sm" value={sort} onChange={onSort} options={SORTS} />
        </div>
      </div>

      <div className="no-scrollbar fade-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <ChainChip active={selected.length === 0} onClick={onClearChains}>
          All networks
        </ChainChip>
        {chains.map((c) => (
          <ChainChip key={c.name} active={selected.includes(c.name)} onClick={() => onToggleChain(c.name)}>
            <ChainIcon chain={c.name} size={16} />
            {c.name}
            <span className="font-mono text-[11px] tabular opacity-50">{c.count}</span>
          </ChainChip>
        ))}
      </div>
    </div>
  );
}

function ChainChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`pressable flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border pr-3 pl-2 text-[13px] font-medium whitespace-nowrap first:pl-3 ${
        active ? "border-ink bg-ink text-canvas" : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
