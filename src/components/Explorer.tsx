"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGroup } from "motion/react";
import type { Appetite, Asset, Opportunity, SortKey } from "@/lib/types";
import { formatPct } from "@/lib/format";
import { projectedEarnings, rank, scoreAll } from "@/lib/scoring";
import { Composer } from "./Composer";
import { Filters } from "./Filters";
import { EmptyState, OpportunityList, TopPick } from "./OpportunityList";
import { DetailSheet } from "./DetailSheet";
import { CompareSheet, CompareTray, MAX_COMPARE } from "./Compare";
import { Welcome } from "./Welcome";

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

  const scored = useMemo(() => scoreAll(opportunities, appetite), [opportunities, appetite]);
  const byId = useMemo(() => new Map(scored.map((o) => [o.id, o])), [scored]);

  const chainOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of scored) if (o.asset === asset) counts.set(o.chain, (counts.get(o.chain) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [scored, asset]);

  const ranked = useMemo(() => rank(scored, { appetite, sort, chains, asset }), [scored, appetite, sort, chains, asset]);
  const [top, ...rest] = ranked;

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
        onAmount={setAmount}
        onAsset={(a) => {
          setAsset(a);
          setChains([]);
        }}
        onAppetite={setAppetite}
      />

      <div className="mx-auto mt-10 w-full max-w-[640px] px-4 pb-40">
        <MarketStrip {...stats} asset={asset} updatedAt={updatedAt} />

        <LayoutGroup>
          <div className="mt-6 flex flex-col gap-6">
            {top ? (
              <>
                {sort === "match" && chains.length === 0 ? (
                  <TopPick item={top} amount={amount} onOpen={() => open(top.id)} />
                ) : null}
                <Filters
                  sort={sort}
                  onSort={setSort}
                  chains={chainOptions}
                  selected={chains}
                  onToggleChain={toggleChain}
                  onClearChains={() => setChains([])}
                  count={ranked.length}
                />
                <OpportunityList
                  items={(sort === "match" && chains.length === 0 ? rest : ranked).slice(0, limit)}
                  amount={amount}
                  compare={compare}
                  onOpen={open}
                  onToggleCompare={toggleCompare}
                />
                {ranked.length > limit + 1 && (
                  <button
                    onClick={() => setPaging({ key: filterKey, n: limit + PAGE })}
                    className="pressable mx-auto h-11 rounded-full bg-surface px-5 text-[14px] font-semibold text-ink shadow-card"
                  >
                    Show more
                  </button>
                )}
              </>
            ) : (
              <>
                <Filters
                  sort={sort}
                  onSort={setSort}
                  chains={chainOptions}
                  selected={chains}
                  onToggleChain={toggleChain}
                  onClearChains={() => setChains([])}
                  count={0}
                />
                <EmptyState
                  onReset={() => {
                    setChains([]);
                    setAppetite("adventurous");
                  }}
                />
              </>
            )}
          </div>
        </LayoutGroup>
      </div>

      <Welcome example={top ? { amount, yearly: projectedEarnings(amount, top.apy) } : null} />
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

function MarketStrip({
  pools,
  chains,
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
  const items = [
    { label: "Best grade-A rate", value: formatPct(bestSafe) },
    { label: "Options compared", value: String(pools) },
    { label: "DeFi apps", value: String(apps) },
    { label: "Networks", value: String(chains) },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-surface px-4 py-3 shadow-card">
            <p className="truncate text-[12px] font-medium text-ink-3">{s.label}</p>
            <p className="mt-0.5 font-display text-[20px] font-extrabold text-ink tabular">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-center text-[12px] text-ink-3" suppressHydrationWarning>
        Yearly rates for {asset} from DeFiLlama · updated {timeAgo(updatedAt)}
      </p>
    </div>
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
