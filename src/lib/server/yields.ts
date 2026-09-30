import snapshot from "@/data/opportunities.json";
import type { Asset, Opportunity } from "../types";

/**
 * Aggregation service. Pulls DeFiLlama's pool + protocol feeds, normalises the
 * USDC/USDT opportunities, and caches them in memory with stale-while-revalidate.
 *
 * The upstream payloads are far larger than Next's 2MB fetch-cache limit, so we
 * cache the small normalised result ourselves instead of the raw responses.
 */

const POOLS_URL = "https://yields.llama.fi/pools";
const PROTOCOLS_URL = "https://api.llama.fi/protocols";
const ENRICHED_URL = "https://yields.llama.fi/poolsEnriched?pool=";
const CHART_URL = "https://yields.llama.fi/chart/";

const LIST_TTL = 10 * 60_000;
const POOL_TTL = 30 * 60_000;
const TIMEOUT = 15_000;

const ASSETS: Record<string, Asset> = { USDC: "USDC", USDT: "USDT", USDT0: "USDT" };
const MIN_TVL = 1_000_000;

export interface OpportunityFeed {
  updatedAt: string;
  source: "live" | "snapshot";
  opportunities: Opportunity[];
}

export interface PoolDetail {
  id: string;
  url: string | null;
  history: { t: number; apy: number; tvl: number }[];
}

type Entry<T> = { value: T; at: number };

// Survives hot reloads in dev and warm invocations in production.
const g = globalThis as unknown as {
  __ssFeed?: Entry<OpportunityFeed>;
  __ssFeedInflight?: Promise<OpportunityFeed>;
  __ssPools?: Map<string, Entry<PoolDetail>>;
};
g.__ssPools ??= new Map();

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

/* ─── List ────────────────────────────────────────────────────────────────── */

export async function getOpportunityFeed(): Promise<OpportunityFeed> {
  const cached = g.__ssFeed;
  const fresh = cached && Date.now() - cached.at < LIST_TTL;
  if (fresh) return cached.value;

  const refresh = (g.__ssFeedInflight ??= loadFeed().finally(() => (g.__ssFeedInflight = undefined)));

  // Serve stale data instantly and refresh in the background.
  if (cached) {
    refresh.catch(() => {});
    return cached.value;
  }
  try {
    return await refresh;
  } catch (err) {
    console.error("[yields] live fetch failed, serving snapshot", err);
    return { ...(snapshot as Omit<OpportunityFeed, "source">), source: "snapshot" };
  }
}

async function loadFeed(): Promise<OpportunityFeed> {
  const [pools, protocols] = await Promise.all([
    getJson<{ data: RawPool[] }>(POOLS_URL),
    getJson<RawProtocol[]>(PROTOCOLS_URL),
  ]);
  const opportunities = normalise(pools.data, protocols);
  if (opportunities.length < 20) throw new Error(`Suspiciously few pools (${opportunities.length})`);
  const value: OpportunityFeed = { updatedAt: new Date().toISOString(), source: "live", opportunities };
  g.__ssFeed = { value, at: Date.now() };
  return value;
}

export function normalise(pools: RawPool[], protocols: RawProtocol[]): Opportunity[] {
  const bySlug = new Map(protocols.map((p) => [p.slug, p]));
  const out: Opportunity[] = [];
  for (const p of pools) {
    const asset = ASSETS[p.symbol];
    if (!asset || p.tvlUsd < MIN_TVL || p.apy == null || p.outlier) continue;
    const proto = bySlug.get(p.project);
    // Without an official URL we can't send people to the protocol, so skip.
    if (!proto?.url) continue;
    out.push({
      id: p.pool,
      asset,
      symbol: p.symbol,
      chain: p.chain,
      poolMeta: p.poolMeta ?? null,
      apy: round(p.apy),
      apyBase: round(p.apyBase ?? 0),
      apyReward: round(p.apyReward ?? 0),
      apyMean30d: round(p.apyMean30d ?? p.apy),
      apyChange7d: round(p.apyPct7D ?? 0),
      tvlUsd: Math.round(p.tvlUsd),
      sigma: round(p.sigma ?? 0, 4),
      daysLive: p.count ?? 0,
      hasRewards: Boolean(p.rewardTokens?.length) && (p.apyReward ?? 0) > 0,
      prediction: p.predictions?.predictedClass ?? null,
      protocol: {
        slug: p.project,
        name: proto.name,
        url: proto.url,
        logo: proto.logo ?? `https://icons.llamao.fi/icons/protocols/${p.project}`,
        category: proto.category ?? "Yield",
        audits: Number(proto.audits ?? 0),
        tvlUsd: Math.round(proto.tvl ?? 0),
        listedAt: proto.listedAt ?? null,
        twitter: proto.twitter ?? null,
      },
    });
  }
  return out;
}

/* ─── Single pool ─────────────────────────────────────────────────────────── */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isPoolId = (id: string) => UUID.test(id);

export async function getPoolDetail(id: string): Promise<PoolDetail> {
  const cached = g.__ssPools!.get(id);
  if (cached && Date.now() - cached.at < POOL_TTL) return cached.value;

  const [enriched, chart] = await Promise.allSettled([
    getJson<{ data: { url?: string }[] }>(ENRICHED_URL + id),
    getJson<{ data: { timestamp: string; apy: number | null; tvlUsd: number }[] }>(CHART_URL + id),
  ]);

  const url = enriched.status === "fulfilled" ? safeUrl(enriched.value.data?.[0]?.url) : null;
  const history =
    chart.status === "fulfilled"
      ? chart.value.data
          .filter((d) => d.apy != null)
          .slice(-120)
          .map((d) => ({ t: Date.parse(d.timestamp), apy: round(d.apy!), tvl: Math.round(d.tvlUsd) }))
      : [];

  if (enriched.status === "rejected" && chart.status === "rejected") {
    if (cached) return cached.value;
    throw new Error("Pool detail unavailable");
  }

  const value = { id, url, history };
  g.__ssPools!.set(id, { value, at: Date.now() });
  // Keep the cache bounded.
  if (g.__ssPools!.size > 500) g.__ssPools!.delete(g.__ssPools!.keys().next().value!);
  return value;
}

/** Only allow http(s) links through to the UI. */
function safeUrl(u: string | undefined) {
  if (!u) return null;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function round(n: number, d = 3) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

/* ─── Upstream shapes (only the fields we read) ───────────────────────────── */

interface RawPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  apyMean30d: number | null;
  apyPct7D: number | null;
  rewardTokens: string[] | null;
  poolMeta: string | null;
  sigma: number | null;
  count: number | null;
  outlier: boolean;
  predictions?: { predictedClass: string | null };
}

interface RawProtocol {
  slug: string;
  name: string;
  url?: string;
  logo?: string;
  category?: string;
  audits?: string | number;
  tvl?: number;
  listedAt?: number;
  twitter?: string;
}
