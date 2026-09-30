import type { Opportunity } from "./types";

export type PoolHistoryPoint = { t: number; apy: number; tvl?: number };

export interface PoolDetail {
  id: string;
  url: string | null;
  history: PoolHistoryPoint[];
}

/** Client-side fetch for a single pool's deep link and real APY history. */
export async function fetchPoolDetail(id: string, signal?: AbortSignal): Promise<PoolDetail> {
  const res = await fetch(`/api/pools/${id}`, { signal });
  if (!res.ok) throw new Error(`Pool ${id}: ${res.status}`);
  return res.json();
}

export type { Opportunity };
