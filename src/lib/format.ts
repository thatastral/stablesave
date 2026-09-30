export function formatUsd(n: number, compact = false) {
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: n >= 1e9 ? 2 : 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
    minimumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

export const formatPct = (n: number, d = 2) => `${n.toFixed(d)}%`;

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const CHAIN_ICON: Record<string, string> = {
  "OP Mainnet": "optimism",
  BSC: "binance",
  "Hyperliquid L1": "hyperliquid",
  "Plume Mainnet": "plume",
  "Robinhood Chain": "robinhood",
};

export function chainIcon(chain: string) {
  const slug = CHAIN_ICON[chain] ?? chain.toLowerCase().replace(/\s+/g, "-");
  return `https://icons.llamao.fi/icons/chains/rsz_${slug}.jpg`;
}
