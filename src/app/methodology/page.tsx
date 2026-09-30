import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Chrome";
import { WEIGHTS } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "How we rate safety",
  description: "The transparent methodology behind StableSave’s safety grades and rankings.",
};

const FACTORS = [
  {
    key: "protocol",
    title: "How established the app is",
    body: "Listed audits, total value the protocol secures across all its markets, and how long it has been live. Battle-tested protocols with independent audits score highest.",
  },
  {
    key: "liquidity",
    title: "Size of the pool",
    body: "How much is deposited in this exact pool, on a log scale from $1M to $1B. Deeper pools are harder to drain and easier to exit.",
  },
  {
    key: "stability",
    title: "How steady the rate is",
    body: "Volatility of the APY over time and how far today’s rate is from its 30-day average. Spiky yields are often temporary.",
  },
  {
    key: "incentives",
    title: "Real interest vs. bonuses",
    body: "The share of APY paid in reward tokens rather than real borrowing demand. Incentives end and reward tokens can drop in value.",
  },
  {
    key: "track",
    title: "Time running",
    body: "Days of continuous yield history for this pool, up to two years.",
  },
] as const;

const GRADES = [
  { g: "A", range: "75–100", label: "Safer", color: "var(--grade-a)", bg: "var(--grade-a-soft)" },
  { g: "B", range: "60–74", label: "Fairly safe", color: "var(--grade-b)", bg: "var(--grade-b-soft)" },
  { g: "C", range: "45–59", label: "Riskier", color: "var(--grade-c)", bg: "var(--grade-c-soft)" },
  { g: "D", range: "0–44", label: "Risky", color: "var(--grade-d)", bg: "var(--grade-d-soft)" },
];

export default function Methodology() {
  return (
    <>
      <Header />
      <main className="enter mx-auto w-full max-w-[640px] flex-1 px-4 pt-10 pb-24 sm:pt-16">
        <p className="text-[13px] font-semibold tracking-wide text-accent-ink uppercase">Methodology</p>
        <h1 className="mt-2 font-display text-[36px] leading-[1.05] font-extrabold tracking-[-0.02em] text-ink sm:text-[44px]">
          A higher APY isn’t always a better deal.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Every opportunity gets a safety score from 0 to 100, built from five public signals. We show every factor and
          its weight, so you can disagree with us.
        </p>

        <section className="mt-10 overflow-hidden rounded-[28px] bg-surface shadow-card">
          {FACTORS.map((f, i) => (
            <div key={f.key} className={`flex gap-4 p-5 ${i ? "border-t border-hairline" : ""}`}>
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-[15px] font-extrabold text-accent-ink tabular">
                {Math.round(WEIGHTS[f.key] * 100)}%
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-ink">{f.title}</h2>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-3">{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">Grades</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <div key={g.g} className="rounded-[22px] p-4" style={{ background: g.bg }}>
              <p className="font-display text-[32px] leading-none font-extrabold" style={{ color: g.color }}>
                {g.g}
              </p>
              <p className="mt-2 text-[14px] font-semibold text-ink">{g.label}</p>
              <p className="text-[13px] text-ink-3 tabular">Score {g.range}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">Best match</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          “Best for you” balances the rate against safety, based on your choice. <b className="text-ink">Play it safe</b>{" "}
          only shows grades A–B and cares most about safety. <b className="text-ink">Balanced</b> shows C and above.{" "}
          <b className="text-ink">Go bigger</b> shows everything and leans towards higher rates. Extra rate always has to
          be earned with extra safety: a 60% rate can’t jump ahead of a solid 6% on yield alone.
        </p>

        <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">What we never do</h2>
        <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
          {[
            "Ask you to connect a wallet or sign anything",
            "Hold, route or touch your funds",
            "Take payment from protocols to change rankings",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-[18px] bg-surface px-4 py-3 shadow-card">
              <span className="grid size-6 place-items-center rounded-full bg-sunken text-[12px] text-ink-3">✕</span>
              {t}
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="pressable mt-10 inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-canvas"
        >
          Find my best option
        </Link>
      </main>
      <Footer />
    </>
  );
}
