import { projectedEarnings } from "./scoring";

/**
 * Rough network-fee estimates (USD per transaction) for a typical lending
 * deposit. Deliberately conservative and clearly labelled as estimates in the
 * UI; a live gas feed can replace this table later without touching callers.
 */
const TX_COST_USD: Record<string, number> = {
  Ethereum: 4,
  Tron: 1.5,
  BSC: 0.1,
  Avalanche: 0.08,
  Polygon: 0.03,
  Arbitrum: 0.05,
  Base: 0.03,
  "OP Mainnet": 0.03,
  Mantle: 0.05,
  Ink: 0.03,
  Monad: 0.02,
  Plasma: 0.02,
  Solana: 0.01,
  Sui: 0.02,
  Aptos: 0.01,
  Near: 0.01,
  TON: 0.05,
  Stellar: 0.01,
};
const DEFAULT_TX_COST = 0.1;

/** Approve + deposit + withdraw. */
const TXS_PER_ROUND_TRIP = 3;

export function roundTripFees(chain: string) {
  return (TX_COST_USD[chain] ?? DEFAULT_TX_COST) * TXS_PER_ROUND_TRIP;
}

export interface NetEarnings {
  gross: number;
  fees: number;
  net: number;
  /** Days of interest needed to cover the fees. Infinity if it never does. */
  breakEvenDays: number;
  /** Fees eat a meaningful share (25%+) of a year's interest. */
  costly: boolean;
}

export function netEarnings(amount: number, apy: number, chain: string, days = 365): NetEarnings {
  const gross = projectedEarnings(amount, apy, days);
  const fees = roundTripFees(chain);
  const perDay = projectedEarnings(amount, apy, 365) / 365;
  return {
    gross,
    fees,
    net: gross - fees,
    breakEvenDays: perDay > 0 ? fees / perDay : Infinity,
    costly: gross > 0 && fees / projectedEarnings(amount, apy, 365) >= 0.25,
  };
}
