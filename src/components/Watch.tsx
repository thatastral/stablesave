"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Grade, Opportunity, ScoredOpportunity } from "@/lib/types";
import { formatPct, formatUsd } from "@/lib/format";
import { GRADE_LABEL, scoreAll } from "@/lib/scoring";
import { play } from "@/lib/sound";
import { ProtocolMark, gradeColor } from "./primitives";

/* ── Store: watched pools live in this browser only. No account needed. ── */

interface Snapshot {
  name: string;
  chain: string;
  logo: string;
  apy: number;
  tvl: number;
  grade: Grade;
  at: number;
  notified?: string; // signature of the last alert we sent, to avoid repeats
}
type Watched = Record<string, Snapshot>;

const KEY = "stablesave:watch";
const EMPTY: Watched = {};
const listeners = new Set<() => void>();
let cache: Watched | null = null;

function read(): Watched {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    cache = {};
  }
  return cache!;
}
function write(next: Watched) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export function useWatched() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

function snapshot(o: ScoredOpportunity): Snapshot {
  return {
    name: o.protocol.name,
    chain: o.chain,
    logo: o.protocol.logo,
    apy: o.apy,
    tvl: o.tvlUsd,
    grade: o.grade,
    at: Date.now(),
  };
}

/* ── What changed since you last looked ── */

type Level = "alert" | "note";
interface Change {
  level: Level;
  text: string;
}
const GRADE_RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3 };

function changesFor(s: Snapshot, now: ScoredOpportunity | undefined): Change[] {
  if (!now) return [{ level: "alert", text: "No longer listed. Check the app directly." }];
  const out: Change[] = [];
  const rel = s.apy > 0 ? (now.apy - s.apy) / s.apy : 0;
  if (Math.abs(now.apy - s.apy) >= 0.25 || Math.abs(rel) >= 0.1) {
    out.push({
      level: rel <= -0.2 ? "alert" : "note",
      text: `Rate ${now.apy > s.apy ? "up" : "down"} ${formatPct(s.apy)} → ${formatPct(now.apy)}`,
    });
  }
  if (now.grade !== s.grade) {
    const worse = GRADE_RANK[now.grade] > GRADE_RANK[s.grade];
    out.push({
      level: worse ? "alert" : "note",
      text: `Safety ${worse ? "dropped" : "improved"}: ${s.grade} → ${now.grade} (${GRADE_LABEL[now.grade]})`,
    });
  }
  const tvlDrop = s.tvl > 0 ? (s.tvl - now.tvlUsd) / s.tvl : 0;
  if (tvlDrop >= 0.25) {
    out.push({
      level: tvlDrop >= 0.3 ? "alert" : "note",
      text: `Money in pool down ${Math.round(tvlDrop * 100)}% (${formatUsd(s.tvl, true)} → ${formatUsd(now.tvlUsd, true)})`,
    });
  }
  return out;
}

/* ── Watch button (in the pool panel) ── */

export function WatchButton({ item }: { item: ScoredOpportunity }) {
  const watched = useWatched();
  const on = Boolean(watched[item.id]);
  return (
    <button
      onClick={() => {
        const next = { ...read() };
        if (on) delete next[item.id];
        else {
          next[item.id] = snapshot(item);
          play("pop");
        }
        write(next);
      }}
      aria-pressed={on}
      className={`pressable flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 font-display text-[13px] font-medium transition-colors ${
        on ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-ink-2 hover:text-ink"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 2.2c-2.2 0-3.8 1.7-3.8 3.9v2.4L3 10.6h10l-1.2-2.1V6.1C11.8 3.9 10.2 2.2 8 2.2ZM6.4 12.6a1.7 1.7 0 0 0 3.2 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={on ? "currentColor" : "none"}
        />
      </svg>
      {on ? "Watching" : "Watch"}
    </button>
  );
}

/* ── Watching strip + background checks while the tab is open ── */

const POLL_MS = 10 * 60_000;

export function Watchlist({
  current,
  onOpen,
}: {
  current: Map<string, ScoredOpportunity>;
  onOpen: (id: string) => void;
}) {
  const watched = useWatched();
  const ids = Object.keys(watched);

  const rows = useMemo(
    () => ids.map((id) => ({ id, s: watched[id], now: current.get(id), changes: changesFor(watched[id], current.get(id)) })),
    [ids, watched, current],
  );

  // While the tab is open, re-check every 10 minutes and send a browser alert for
  // important changes (only if the user turned alerts on).
  useEffect(() => {
    if (!ids.length) return;
    const t = setInterval(async () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      try {
        const res = await fetch("/api/opportunities");
        const { opportunities } = (await res.json()) as { opportunities: Opportunity[] };
        const byId = new Map(scoreAll(opportunities, "balanced").map((o) => [o.id, o]));
        const next = { ...read() };
        for (const id of Object.keys(next)) {
          const alerts = changesFor(next[id], byId.get(id)).filter((c) => c.level === "alert");
          const sig = alerts.map((a) => a.text).join("|");
          if (alerts.length && sig !== next[id].notified) {
            new Notification(`StableSave · ${next[id].name}`, { body: alerts.map((a) => a.text).join("\n"), icon: "/icon.svg" });
            next[id] = { ...next[id], notified: sig };
          }
        }
        write(next);
      } catch {}
    }, POLL_MS);
    return () => clearInterval(t);
  }, [ids.length]);

  if (!ids.length) return null;
  const alertsOn = typeof Notification !== "undefined" && Notification.permission === "granted";
  const canAsk = typeof Notification !== "undefined" && Notification.permission === "default";

  return (
    <section className="mx-auto mt-10 w-full max-w-[680px] px-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-display text-[17px] font-medium text-ink">
          Watching <span className="text-ink-3 tabular">{ids.length}</span>
        </p>
        <div className="flex items-center gap-2">
          {canAsk && (
            <button
              onClick={() => Notification.requestPermission().then(() => write({ ...read() }))}
              className="pressable h-8 rounded-full bg-surface px-3 font-display text-[12px] font-medium text-ink-2 shadow-card hover:text-ink"
            >
              Turn on alerts
            </button>
          )}
          {alertsOn && <span className="label">Alerts on while open</span>}
          <button
            onClick={() => {
              const next = { ...read() };
              for (const r of rows) if (r.now) next[r.id] = snapshot(r.now);
              write(next);
            }}
            className="pressable h-8 rounded-full bg-surface px-3 font-display text-[12px] font-medium text-ink-2 shadow-card hover:text-ink"
          >
            Mark all seen
          </button>
        </div>
      </div>
      <ul className="overflow-hidden rounded-[24px] bg-surface p-1.5 shadow-card">
        <AnimatePresence initial={false}>
          {rows.map(({ id, s, now, changes }) => (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <button
                onClick={() => now && onOpen(id)}
                className="row-hover flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition-colors"
              >
                <ProtocolMark logo={s.logo} name={s.name} chain={s.chain} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-display text-[14px] font-medium text-ink">{s.name}</span>
                    {now && (
                      <span className="font-display text-[14px] font-semibold text-ink tabular">{formatPct(now.apy)}</span>
                    )}
                  </span>
                  {changes.length ? (
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {changes.map((c) => (
                        <span
                          key={c.text}
                          className="rounded-full px-2 py-0.5 text-[12px] font-medium"
                          style={
                            c.level === "alert"
                              ? { background: gradeColor("D").bg, color: gradeColor("D").fg }
                              : { background: "var(--surface-2)", color: "var(--ink-2)" }
                          }
                        >
                          {c.text}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[12px] text-ink-3">No change since you started watching</span>
                  )}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
