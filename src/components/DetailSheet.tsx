"use client";

import { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { motion } from "motion/react";
import type { ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd, hostname } from "@/lib/format";
import { GRADE_LABEL, projectedEarnings } from "@/lib/scoring";
import { fetchPoolDetail, type PoolDetail } from "@/lib/data";
import { ApyChart } from "./ApyChart";
import { netEarnings } from "@/lib/fees";
import { WatchButton } from "./Watch";
import { Panel } from "./Panel";
import { AnimatedNumber, ArrowUpRight, ProtocolMark, Segmented, ShieldIcon, TokenIcon, gradeColor, spring } from "./primitives";
import { Term } from "./Term";

type Range = "30" | "90";
const HORIZONS = [
  { days: 30, label: "1 month" },
  { days: 182, label: "6 months" },
  { days: 365, label: "1 year" },
];

export function DetailSheet({
  item,
  amount,
  open,
  onOpenChange,
}: {
  item: ScoredOpportunity | null;
  amount: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Panel open={open} onOpenChange={onOpenChange} width={500}>
      {item && <SheetBody key={item.id} item={item} amount={amount} />}
    </Panel>
  );
}

type DetailState = { status: "loading" } | { status: "ready"; data: PoolDetail } | { status: "error" };

function usePoolDetail(id: string) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  useEffect(() => {
    const ctrl = new AbortController();
    fetchPoolDetail(id, ctrl.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        console.warn(e);
        setState({ status: "error" });
      });
    return () => ctrl.abort();
  }, [id]);
  return state;
}

function SheetBody({ item, amount }: { item: ScoredOpportunity; amount: number }) {
  const [range, setRange] = useState<Range>("30");
  const [scrub, setScrub] = useState<{ t: number; apy: number } | null>(null);
  const detail = usePoolDetail(item.id);

  const history = useMemo(() => {
    if (detail.status !== "ready") return [];
    // Anchor the window to the latest data point rather than the wall clock.
    const all = detail.data.history;
    const cutoff = (all.at(-1)?.t ?? 0) - Number(range) * 86400000;
    return all.filter((p) => p.t >= cutoff);
  }, [detail, range]);

  // Prefer the pool's own page; fall back to the protocol's homepage.
  const poolUrl = detail.status === "ready" ? detail.data.url : null;
  const href = poolUrl ?? item.protocol.url;
  const site = hostname(href);
  const exact = Boolean(poolUrl);

  const shown = scrub?.apy ?? item.apy;
  const rewardShare = item.apy > 0 ? item.apyReward / item.apy : 0;
  const g = gradeColor(item.grade);

  return (
    <>
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-4 md:px-6 md:pt-6">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <ProtocolMark logo={item.protocol.logo} name={item.protocol.name} chain={item.chain} size={52} />
          <div className="min-w-0 flex-1">
            <Drawer.Title className="truncate font-display text-[22px] leading-tight font-semibold tracking-[-0.01em] text-ink">
              {item.protocol.name}
            </Drawer.Title>
            <p className="truncate text-[14px] text-ink-3">
              {item.poolMeta ? `${item.poolMeta} · ` : ""}
              {item.symbol} on the {item.chain} network
            </p>
          </div>
          <div className="md:mr-11">
            <WatchButton item={item} />
          </div>
        </div>

        {/* Rate + chart */}
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink-3">
                {scrub ? "Yearly rate on" : "Yearly rate today"} <Term k="apy" icon />
              </p>
              <p className="mt-1 font-display text-[44px] leading-none font-semibold tracking-[-0.03em] text-ink">
                <AnimatedNumber value={shown} format={(n) => formatPct(n)} />
              </p>
              <p className="mt-1.5 h-5 text-[13px] text-ink-3">
                {scrub ? (
                  new Date(scrub.t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                ) : (
                  <span className={item.apyChange7d >= 0 ? "text-accent-ink" : "text-[var(--grade-d)]"}>
                    {item.apyChange7d >= 0 ? "▲ Up" : "▼ Down"} {Math.abs(item.apyChange7d).toFixed(2)}% this week
                  </span>
                )}
              </p>
            </div>
            <Segmented<Range>
              label="Chart range"
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { key: "30", label: "1M" },
                { key: "90", label: "3M" },
              ]}
            />
          </div>
          <div className="-mx-1 mt-4 h-[150px]">
            {detail.status === "loading" && <div className="h-full animate-pulse rounded-[10px] bg-surface-2" />}
            {detail.status === "ready" && history.length > 1 && (
              <ApyChart key={range} data={history} onScrub={setScrub} />
            )}
            {(detail.status === "error" || (detail.status === "ready" && history.length < 2)) && (
              <div className="grid h-full place-items-center rounded-[10px] bg-surface-2 text-[13px] text-ink-3">
                Rate history isn’t available right now
              </div>
            )}
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Rates change daily. Drag across the chart to see past rates.</p>
        </div>

        {/* Earnings projection */}
        <Section title={`What ${formatUsd(amount)} could earn`}>
          <div className="grid grid-cols-3 gap-2">
            {HORIZONS.map((h) => (
              <div key={h.days} className="rounded-[18px] bg-surface-2 px-3 py-3">
                <p className="text-[12px] font-medium text-ink-3">In {h.label}</p>
                <p className="mt-0.5 font-display text-[18px] font-semibold text-accent-ink tabular">
                  +<AnimatedNumber value={projectedEarnings(amount, item.apy, h.days)} format={(n) => formatUsd(n)} />
                </p>
              </div>
            ))}
          </div>
          <FeesNote amount={amount} item={item} />
          <p className="mt-2 text-[12px] text-ink-3">An estimate if today’s rate stayed the same. It usually won’t.</p>
        </Section>

        {/* Where the yield comes from */}
        <Section title="Where the interest comes from">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-sunken">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ ...spring, delay: 0.1 }}
              style={{ width: `${(1 - rewardShare) * 100}%`, transformOrigin: "left" }}
              className="bg-accent"
            />
            {rewardShare > 0 && (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ ...spring, delay: 0.18 }}
                style={{ width: `${rewardShare * 100}%`, transformOrigin: "left" }}
                className="bg-blue"
              />
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2.5 text-[14px]">
            <Legend
              color="var(--accent)"
              label="Real interest"
              hint="Paid by people borrowing from the pool"
              value={formatPct(item.apyBase)}
            />
            {rewardShare > 0 && (
              <Legend
                color="var(--blue)"
                label={<Term k="bonus">Bonus tokens</Term>}
                hint="Temporary, and their value can drop"
                value={formatPct(item.apyReward)}
              />
            )}
          </div>
        </Section>

        {/* Risk */}
        <Section title="How risky is it?">
          <div className="flex items-center gap-4 rounded-[10px] p-4" style={{ background: g.bg }}>
            <ScoreRing score={item.safety} color={g.fg} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-display text-[18px] font-semibold" style={{ color: g.fg }}>
                Grade {item.grade}: {GRADE_LABEL[item.grade]} <Term k="grade" icon />
              </p>
              <p className="text-[13px] text-ink-2">{gradeSummary(item.grade)}</p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-3.5">
            {item.factors.map((f, i) => (
              <li key={f.key}>
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="font-semibold text-ink">{f.label}</span>
                  <span className="tabular text-[13px] font-semibold text-ink-3">{Math.round(f.score)}/100</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${f.score}%`, transformOrigin: "left", background: barColor(f.score) }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ ...spring, delay: 0.08 + i * 0.04 }}
                  />
                </div>
                <p className="mt-1 text-[12px] text-ink-3">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Deposit guide */}
        <Section title="How to deposit safely">
          <ol className="flex flex-col gap-2">
            <Step n={1}>
              Open <b className="text-ink">{site}</b> with the button below. Check the address bar matches before you do
              anything.
            </Step>
            <Step n={2}>
              Connect your wallet on their site. Make sure it’s on the <b className="text-ink">{item.chain}</b>{" "}
              <Term k="network">network</Term>.
            </Step>
            <Step n={3}>
              {exact ? "Find" : "Look for"} the{" "}
              <b className="inline-flex items-center gap-1 align-middle text-ink">
                <TokenIcon asset={item.asset} size={14} /> {item.poolMeta ?? item.symbol}
              </b>{" "}
              {exact ? "pool and deposit." : "pool, usually under “Earn”, “Lend” or “Supply”, and deposit."}
            </Step>
            <Step n={4}>New to this? Try a small amount first, then add more once you’re comfortable.</Step>
          </ol>
          <p className="mt-3 rounded-[10px] bg-surface-2 p-3 text-[12px] leading-relaxed text-ink-3">
            DeFi apps aren’t banks, so there’s no deposit insurance. Bugs, hacks, or a stablecoin losing its $1 value
            could mean losing money. Only deposit what you can afford to lose.
          </p>
        </Section>

        {/* Facts */}
        <Section title="Quick facts">
          <dl className="overflow-hidden rounded-[20px] bg-surface-2 px-1">
            <Fact label={<Term k="deposits">Money in pool</Term>} value={formatUsd(item.tvlUsd, true)} />
            <Fact label="Trusted to the app" value={formatUsd(item.protocol.tvlUsd, true)} />
            <Fact label="Type of app" value={item.protocol.category} />
            <Fact label="Security reviews" value={item.protocol.audits ? String(item.protocol.audits) : "None listed"} />
            <Fact label="Average rate (30 days)" value={formatPct(item.apyMean30d)} />
            <Fact label="Running for" value={`${item.daysLive.toLocaleString()} days`} />
          </dl>
        </Section>
      </div>

      {/* Sticky CTA: the whole product funnels to this one action. */}
      <div className="shrink-0 bg-surface px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] md:rounded-b-[28px] md:px-6">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-busy={detail.status === "loading"}
          className="pressable flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink font-display text-[16px] font-medium text-canvas"
        >
          {exact ? "Go to this pool on" : "Open"} {site} <ArrowUpRight />
        </a>
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-3">
          <ShieldIcon size={13} /> You’ll deposit on {site}. StableSave never touches your money.
        </p>
      </div>
    </>
  );
}

/** What network fees do to the earnings: plain numbers, no jargon. */
function FeesNote({ amount, item }: { amount: number; item: ScoredOpportunity }) {
  const e = netEarnings(amount, item.apy, item.chain);
  const days = Math.ceil(e.breakEvenDays);
  return (
    <div className="mt-3 overflow-hidden rounded-[18px] bg-surface-2 px-1 text-[13px]">
      <div className="flex items-baseline justify-between px-3.5 py-2.5">
        <span className="text-ink-3">Network fees to get in and out ({item.chain}, est.)</span>
        <span className="font-medium text-ink tabular">−{formatUsd(e.fees)}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-[var(--hairline)] px-3.5 py-2.5">
        <span className="font-medium text-ink">You’d keep in a year</span>
        <span className="font-display font-semibold text-accent-ink tabular">+{formatUsd(Math.max(0, e.net))}</span>
      </div>
      <p className={`border-t border-[var(--hairline)] px-3.5 py-2.5 ${e.costly ? "text-[var(--grade-c)]" : "text-ink-3"}`}>
        {Number.isFinite(e.breakEvenDays)
          ? days <= 1
            ? "Fees are covered within a day."
            : `Your first ${days} days of interest cover the fees.`
          : "At this amount the interest never covers the fees."}
        {e.costly && " Try a cheaper network like Base or Arbitrum, or a larger amount."}
      </p>
    </div>
  );
}

function gradeSummary(g: ScoredOpportunity["grade"]) {
  return {
    A: "One of the more established options. A good place to start.",
    B: "Solid, with a few more things to keep an eye on.",
    C: "Higher risk. Read the details below before depositing.",
    D: "High risk. Only for money you’re fully prepared to lose.",
  }[g];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h3 className="mb-3 font-display text-[17px] font-medium text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-[18px] bg-surface-2 p-3 text-[14px] leading-snug text-ink-2">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface font-display text-[12px] font-semibold text-ink-2 shadow-card">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function Legend({
  color,
  label,
  hint,
  value,
}: {
  color: string;
  label: React.ReactNode;
  hint: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-[13px] text-ink-3">{hint}</span>
      </span>
      <span className="tabular font-semibold text-ink">{value}</span>
    </div>
  );
}

function Fact({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hairline)] px-3.5 py-3 last:border-b-0">
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="truncate text-[14px] font-medium text-ink tabular">{value}</dd>
    </div>
  );
}

function barColor(score: number) {
  if (score >= 75) return "var(--grade-a)";
  if (score >= 60) return "var(--grade-b)";
  if (score >= 45) return "var(--grade-c)";
  return "var(--grade-d)";
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeOpacity="0.15" strokeWidth="5" />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ ...spring, duration: 0.8, delay: 0.1 }}
        />
      </svg>
      <span className="font-display text-[17px] font-semibold tabular" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
