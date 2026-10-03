// Builds a static snapshot of USDC/USDT opportunities from DeFiLlama.
// Frontend-only stage: the app reads src/data/opportunities.json. The backend
// will later replace this with a live, cached aggregation service.
//
// Usage: node scripts/build-fixture.mjs
import { writeFile } from "node:fs/promises";

const ASSETS = { USDC: "USDC", USDT: "USDT", USDT0: "USDT" };
const MIN_TVL = 1_000_000;

const [pools, protocols] = await Promise.all([
  fetch("https://yields.llama.fi/pools", { signal: AbortSignal.timeout(90_000) }).then((r) => r.json()),
  fetch("https://api.llama.fi/protocols", { signal: AbortSignal.timeout(90_000) }).then((r) => r.json()),
]);

const bySlug = new Map(protocols.map((p) => [p.slug, p]));

const opportunities = pools.data
  .filter((p) => ASSETS[p.symbol] && p.tvlUsd >= MIN_TVL && p.apy != null && !p.outlier)
  .map((p) => {
    const proto = bySlug.get(p.project);
    return {
      id: p.pool,
      asset: ASSETS[p.symbol],
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
        name: proto?.name ?? titleCase(p.project),
        url: proto?.url ?? null,
        logo: proto?.logo ?? `https://icons.llamao.fi/icons/protocols/${p.project}`,
        category: proto?.category ?? "Yield",
        audits: Number(proto?.audits ?? 0),
        tvlUsd: Math.round(proto?.tvl ?? 0),
        listedAt: proto?.listedAt ?? null,
        twitter: proto?.twitter ?? null,
      },
    };
  })
  // Pools without an official URL can't satisfy "take me to the protocol".
  .filter((o) => o.protocol.url);

// Never overwrite a good snapshot with a broken or partial response.
if (opportunities.length < 20) throw new Error(`Only ${opportunities.length} opportunities; keeping the existing snapshot`);

await writeFile(
  new URL("../src/data/opportunities.json", import.meta.url),
  JSON.stringify({ updatedAt: new Date().toISOString(), opportunities }, null, 0),
);
console.log(`Wrote ${opportunities.length} opportunities`);

function round(n, d = 3) {
  return Math.round(n * 10 ** d) / 10 ** d;
}
function titleCase(s) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
