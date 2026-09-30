# StableSave

**Find where your stablecoins earn the most.** StableSave compares USDC and USDT savings rates across DeFi, grades each option A–D for safety, and explains everything in plain English. No wallet, no sign-up, no custody: when you pick an option, we send you straight to that pool on the official app.

## Features

- **One question, one answer.** Enter an amount, pick USDC or USDT, choose how much risk you're comfortable with.
- **Transparent safety grades.** Five weighted, public signals (app track record, pool size, rate stability, real interest vs. bonus tokens, time running). See `/methodology`.
- **Deep links to the exact pool**, plus a step-by-step "how to deposit safely" guide.
- **Real rate history**, earnings projections, side-by-side compare, shareable URLs (`?amount=…&asset=…&risk=…&pool=…`).
- **Beginner-first copy** with tap-to-explain jargon, a first-visit welcome card, light/dark mode.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Motion · Vaul · data from [DeFiLlama](https://defillama.com/yields).

## Architecture

| Path | What it does |
| --- | --- |
| `src/lib/server/yields.ts` | Aggregation service: fetches DeFiLlama pools + protocols, normalises USDC/USDT opportunities, in-memory stale-while-revalidate cache (10 min list, 30 min per pool), falls back to the bundled snapshot if upstream fails. |
| `src/app/api/opportunities` | Normalised opportunity feed (CDN-cached). |
| `src/app/api/pools/[id]` | Pool deep link + APY history. |
| `src/lib/scoring.ts` | Safety score, grades and "best for you" ranking. |
| `src/data/opportunities.json` | Fallback snapshot. Refresh with `node scripts/build-fixture.mjs`. |
| `src/app/opengraph-image.tsx` | Social card rendered from live rates. |

## Develop

```bash
npm install
npm run dev
```

Optional: set `NEXT_PUBLIC_SITE_URL` to your custom domain so social cards and the sitemap use it. On Vercel the production URL is detected automatically.

## Disclaimer

StableSave is a discovery tool, not financial advice. DeFi carries real risk, including total loss. Always verify on the official app before depositing.

---

Built with ♥ for the stable community.
