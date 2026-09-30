export type Asset = "USDC" | "USDT";
export type Appetite = "conservative" | "balanced" | "adventurous";
export type SortKey = "match" | "apy" | "tvl" | "safety";
export type Grade = "A" | "B" | "C" | "D";

export interface Protocol {
  slug: string;
  name: string;
  url: string;
  logo: string;
  category: string;
  audits: number;
  tvlUsd: number;
  listedAt: number | null;
  twitter: string | null;
}

export interface Opportunity {
  id: string;
  asset: Asset;
  symbol: string;
  chain: string;
  poolMeta: string | null;
  apy: number;
  apyBase: number;
  apyReward: number;
  apyMean30d: number;
  apyChange7d: number;
  tvlUsd: number;
  sigma: number;
  daysLive: number;
  hasRewards: boolean;
  prediction: string | null;
  protocol: Protocol;
}

export interface RiskFactor {
  key: "liquidity" | "protocol" | "stability" | "incentives" | "track";
  label: string;
  score: number; // 0–100, higher is safer
  weight: number;
  detail: string;
}

export interface ScoredOpportunity extends Opportunity {
  safety: number; // 0–100
  grade: Grade;
  factors: RiskFactor[];
  match: number;
}
