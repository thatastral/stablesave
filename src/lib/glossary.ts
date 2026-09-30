/** Plain-English definitions shown behind every piece of jargon in the UI. */
export const GLOSSARY = {
  apy: {
    term: "APY",
    body: "Annual Percentage Yield: how much your money grows in a year, including interest on your interest. 5% APY on $1,000 is about $50 a year.",
  },
  stablecoin: {
    term: "Stablecoin",
    body: "A crypto dollar. USDC and USDT are designed to always be worth $1, so your balance doesn’t swing like Bitcoin.",
  },
  pool: {
    term: "Pool",
    body: "A shared pot of money on a DeFi app. People deposit into it, borrowers pay interest, and that interest is shared with depositors.",
  },
  network: {
    term: "Network",
    body: "The blockchain your coins live on, like Ethereum or Base. You must deposit on the same network your USDC or USDT is on.",
  },
  deposits: {
    term: "Money in pool",
    body: "The total amount everyone has deposited. Bigger pools are usually more established and easier to withdraw from.",
  },
  bonus: {
    term: "Bonus tokens",
    body: "Extra rewards paid in the app’s own token to attract deposits. They can end at any time and their value can drop.",
  },
  grade: {
    term: "Safety grade",
    body: "Our A–D rating based on public data: how established the app is, pool size, how steady the rate is, and more. It lowers risk, it can’t remove it.",
  },
  defi: {
    term: "DeFi",
    body: "Decentralised finance: apps that run on blockchains instead of banks. You stay in control of your money, but there’s no bank or government guarantee.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
