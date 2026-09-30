import type { Appetite, Grade, Opportunity, RiskFactor, ScoredOpportunity, SortKey } from "./types";
import { formatUsd } from "./format";

/**
 * Transparent safety score. Each factor is 0–100 (higher = safer) and the
 * weighted mean becomes the grade. Weights are shown to users on /methodology.
 */
export const WEIGHTS: Record<RiskFactor["key"], number> = {
  protocol: 0.3,
  liquidity: 0.25,
  stability: 0.2,
  incentives: 0.15,
  track: 0.1,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

// Maps a USD value onto 0–100 on a log scale between `lo` and `hi`.
const logScale = (v: number, lo: number, hi: number) =>
  clamp(((Math.log10(Math.max(v, 1)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * 100);

export function scoreFactors(o: Opportunity): RiskFactor[] {
  const liquidity = logScale(o.tvlUsd, 1e6, 1e9);

  const auditPts = Math.min(o.protocol.audits, 2) * 20;
  const protoTvlPts = logScale(o.protocol.tvlUsd, 1e7, 1e10) * 0.45;
  const agePts = o.protocol.listedAt
    ? clamp(((Date.now() / 1000 - o.protocol.listedAt) / (86400 * 365 * 3)) * 15, 0, 15)
    : 0;
  const protocol = clamp(auditPts + protoTvlPts + agePts);

  // sigma is DeFiLlama's APY std-dev; drift compares today to the 30d mean.
  const drift = Math.abs(o.apy - o.apyMean30d) / Math.max(o.apyMean30d, 1);
  const stability = clamp(100 - o.sigma * 120 - drift * 80);

  const rewardShare = o.apy > 0 ? o.apyReward / o.apy : 0;
  const incentives = clamp(100 - rewardShare * 100);

  const track = clamp((o.daysLive / 730) * 100);

  return [
    {
      key: "protocol",
      label: "How established the app is",
      score: protocol,
      weight: WEIGHTS.protocol,
      detail: `${o.protocol.audits ? `${o.protocol.audits} security review${o.protocol.audits === 1 ? "" : "s"} (audits)` : "No security reviews (audits) listed"} · ${formatUsd(o.protocol.tvlUsd, true)} trusted to it in total`,
    },
    {
      key: "liquidity",
      label: "Size of the pool",
      score: liquidity,
      weight: WEIGHTS.liquidity,
      detail: `${formatUsd(o.tvlUsd, true)} deposited by others. Bigger usually means easier to withdraw.`,
    },
    {
      key: "stability",
      label: "How steady the rate is",
      score: stability,
      weight: WEIGHTS.stability,
      detail: `Averaged ${o.apyMean30d.toFixed(2)}% over the last 30 days, ${o.apy.toFixed(2)}% today`,
    },
    {
      key: "incentives",
      label: "Real interest vs. bonuses",
      score: incentives,
      weight: WEIGHTS.incentives,
      detail:
        rewardShare > 0
          ? `${Math.round(rewardShare * 100)}% of the rate is temporary bonus tokens`
          : "All of it is real interest, no temporary bonuses",
    },
    {
      key: "track",
      label: "Time running",
      score: track,
      weight: WEIGHTS.track,
      detail: `Paying interest for ${o.daysLive.toLocaleString()} days`,
    },
  ];
}

export function gradeFor(safety: number): Grade {
  if (safety >= 75) return "A";
  if (safety >= 60) return "B";
  if (safety >= 45) return "C";
  return "D";
}

export const GRADE_LABEL: Record<Grade, string> = {
  A: "Safer",
  B: "Fairly safe",
  C: "Riskier",
  D: "Risky",
};

export const APPETITES: { key: Appetite; label: string; hint: string }[] = [
  { key: "conservative", label: "Play it safe", hint: "Only well-established options, graded A or B." },
  { key: "balanced", label: "Balanced", hint: "A good mix of safety and a better rate." },
  { key: "adventurous", label: "Go bigger", hint: "Shows everything. Higher rates come with higher risk." },
];

const MIN_SAFETY: Record<Appetite, number> = { conservative: 60, balanced: 45, adventurous: 0 };
// How much safety matters relative to yield in the match score.
const SAFETY_EXPONENT: Record<Appetite, number> = { conservative: 3, balanced: 1.5, adventurous: 1 };

export function scoreAll(list: Opportunity[], appetite: Appetite): ScoredOpportunity[] {
  return list.map((o) => {
    const factors = scoreFactors(o);
    const safety = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
    // ln(1 + APY) gives diminishing returns, so a 60% APY can't bulldoze a
    // well-grounded 6%: extra yield has to be earned with extra safety.
    const match = Math.log1p(o.apy) * Math.pow(safety / 100, SAFETY_EXPONENT[appetite]);
    return { ...o, factors, safety, grade: gradeFor(safety), match };
  });
}

export function rank(
  list: ScoredOpportunity[],
  { appetite, sort, chains, asset }: { appetite: Appetite; sort: SortKey; chains: string[]; asset: string },
) {
  const filtered = list.filter(
    (o) =>
      o.asset === asset &&
      o.safety >= MIN_SAFETY[appetite] &&
      (chains.length === 0 || chains.includes(o.chain)),
  );
  const by: Record<SortKey, (o: ScoredOpportunity) => number> = {
    match: (o) => o.match,
    apy: (o) => o.apy,
    tvl: (o) => o.tvlUsd,
    safety: (o) => o.safety,
  };
  return filtered.sort((a, b) => by[sort](b) - by[sort](a));
}

export function projectedEarnings(amount: number, apy: number, days = 365) {
  // APY already reflects compounding, so pro-rate on the effective annual rate.
  return amount * (Math.pow(1 + apy / 100, days / 365) - 1);
}
