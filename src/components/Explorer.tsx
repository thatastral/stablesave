"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGroup } from "motion/react";
import type { Appetite, Asset, Opportunity, SortKey } from "@/lib/types";
import { formatPct } from "@/lib/format";
import { rank, scoreAll } from "@/lib/scoring";
import { roundTripFees } from "@/lib/fees";
import { Composer } from "./Composer";
import { Filters } from "./Filters";
import { EmptyState, OpportunityList } from "./OpportunityList";
import { DetailSheet } from "./DetailSheet";
import { CompareSheet, CompareTray, MAX_COMPARE } from "./Compare";
import { Welcome } from "./Welcome";
import { Watchlist } from "./Watch";

const PAGE = 12;

export interface ExplorerInit {
  amount: number;
  asset: Asset;
  appetite: Appetite;
  pool: string | null;
}

export function Explorer({
  opportunities,
  updatedAt,
  init,
}: {
  opportunities: Opportunity[];
  updatedAt: string;
  init: ExplorerInit;
}) {
  const [amount, setAmount] = useState(init.amount);
  const [asset, setAsset] = useState<Asset>(init.asset);
  const [appetite, setAppetite] = useState<Appetite>(init.appetite);
  const [sort, setSort] = useState<SortKey>("match");
  const [chains, setChains] = useState<string[]>([]);
  const [paging, setPaging] = useState({ key: "", n: PAGE });
  const [openId, setOpenId] = useState<string | null>(init.pool);
  const [sheetItemId, setSheetItemId] = useState<string | null>(init.pool);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Keep the URL shareable: "?amount=10000&asset=USDC&risk=balanced&pool=<id>".
  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams({ amount: String(amount), asset, risk: appetite });
      if (openId) q.set("pool", openId);
      window.history.replaceState(null, "", `?${q}`);
    }, 250);
    return () => clearTimeout(t);
  }, [amount, asset, appetite, openId]);

  // Round to the nearest $10 so ranking doesn't reshuffle on every keystroke.
  const feeAmount = Math.round(amount / 10) * 10;
  const scored = useMemo(
    () => scoreAll(opportunities, appetite, { amount: feeAmount, roundTrip: roundTripFees }),
    [opportunities, appetite, feeAmount],
  );
  const byId = useMemo(() => new Map(scored.map((o) => [o.id, o])), [scored]);

  const chainOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of scored) if (o.asset === asset) counts.set(o.chain, (counts.get(o.chain) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [scored, asset]);

  const ranked = useMemo(() => rank(scored, { appetite, sort, chains, asset }), [scored, appetite, sort, chains, asset]);
  // The headline pick should be one a beginner can act on: grade A/B unless they chose "Go bigger".
  // The hero answer depends only on amount, coin and risk; sorting or filtering
  // the list below must never change it.
  const top = useMemo(() => {
    const best = rank(scored, { appetite, sort: "match", chains: [], asset });
    return appetite === "adventurous" ? best[0] : (best.find((o) => o.grade === "A" || o.grade === "B") ?? best[0]);
  }, [scored, appetite, asset]);

  const stats = useMemo(() => {
    const pool = scored.filter((o) => o.asset === asset);
    return {
      pools: pool.length,
      chains: new Set(pool.map((o) => o.chain)).size,
      apps: new Set(pool.map((o) => o.protocol.slug)).size,
      bestSafe: Math.max(0, ...pool.filter((o) => o.grade === "A").map((o) => o.apy)),
    };
  }, [scored, asset]);

  // Paging resets whenever the result set meaningfully changes.
  const filterKey = `${asset}|${appetite}|${sort}|${chains.join()}`;
  const limit = paging.key === filterKey ? paging.n : PAGE;

  function open(id: string) {
    setSheetItemId(id);
    setOpenId(id);
  }
  function toggleCompare(id: string) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? [...c.slice(1), id] : [...c, id]));
  }
  function toggleChain(c: string) {
    setChains((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }

  const compareItems = compare.map((id) => byId.get(id)).filter(Boolean) as typeof scored;
  const sheetItem = sheetItemId ? byId.get(sheetItemId) ?? null : null;

  return (
    <>
      <Composer
        amount={amount}
        asset={asset}
        appetite={appetite}
        top={top}
        optionCount={ranked.length}
        onAmount={setAmount}
        onAsset={(a) => {
          setAsset(a);
          setChains([]);
        }}
        onAppetite={setAppetite}
        onOpenTop={() => top && open(top.id)}
      />

      <MarketLine {...stats} asset={asset} updatedAt={updatedAt} />

      <Watchlist current={byId} onOpen={open} />

      <section id="options" className="mx-auto mt-14 w-full max-w-[680px] scroll-mt-20 px-4 pb-40">
        <LayoutGroup>
          <div className="flex flex-col gap-4">
            <Filters
              sort={sort}
              onSort={setSort}
              chains={chainOptions}
              selected={chains}
              onToggleChain={toggleChain}
              onClearChains={() => setChains([])}
              count={ranked.length}
            />
            {ranked.length ? (
              <>
                <OpportunityList
                  items={ranked.slice(0, limit)}
                  amount={amount}
                  compare={compare}
                  onOpen={open}
                  onToggleCompare={toggleCompare}
                />
                {ranked.length > limit && (
                  <button
                    onClick={() => setPaging({ key: filterKey, n: limit + PAGE })}
                    className="pressable mx-auto h-10 rounded-full bg-surface px-5 font-display text-[14px] font-medium text-ink shadow-card"
                  >
                    Show {Math.min(PAGE, ranked.length - limit)} more
                  </button>
                )}
              </>
            ) : (
              <EmptyState
                onReset={() => {
                  setChains([]);
                  setAppetite("adventurous");
                }}
              />
            )}
          </div>
        </LayoutGroup>
      </section>

      <Welcome />
      <DetailSheet
        item={sheetItem}
        amount={amount}
        open={openId !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
      <CompareTray items={compareItems} onOpen={() => setCompareOpen(true)} onClear={() => setCompare([])} />
      <CompareSheet
        items={compareItems}
        amount={amount}
        open={compareOpen && compareItems.length > 1}
        onOpenChange={setCompareOpen}
        onRemove={(id) => setCompare((c) => c.filter((x) => x !== id))}
      />
    </>
  );
}

function MarketLine({
  pools,
  apps,
  bestSafe,
  asset,
  updatedAt,
}: {
  pools: number;
  chains: number;
  apps: number;
  bestSafe: number;
  asset: Asset;
  updatedAt: string;
}) {
  // One quiet line: the best safe rate, how much we compared, how fresh it is.
  return (
    <p
      className="mx-auto mt-8 w-full max-w-[680px] px-4 text-center text-[13px] text-ink-3"
      suppressHydrationWarning
    >
      Best grade-A {asset} today{" "}
      <span className="font-display font-semibold text-accent-ink tabular">{formatPct(bestSafe)}</span>
      <span className="mx-2" aria-hidden>
        ·
      </span>
      {pools} options across {apps} apps
      <span className="mx-2" aria-hidden>
        ·
      </span>
      updated {timeAgo(updatedAt)}
    </p>
  );
}

function timeAgo(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
