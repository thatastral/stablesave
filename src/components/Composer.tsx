"use client";

import type { Appetite, Asset } from "@/lib/types";
import { APPETITES } from "@/lib/scoring";
import { Segmented, TokenIcon } from "./primitives";
import { Term } from "./Term";

const PRESETS = [100, 1_000, 10_000, 50_000];
const MAX = 1_000_000_000;

export function Composer({
  amount,
  asset,
  appetite,
  onAmount,
  onAsset,
  onAppetite,
}: {
  amount: number;
  asset: Asset;
  appetite: Appetite;
  onAmount: (n: number) => void;
  onAsset: (a: Asset) => void;
  onAppetite: (a: Appetite) => void;
}) {
  const display = amount ? amount.toLocaleString("en-US") : "";
  const hint = APPETITES.find((a) => a.key === appetite)!.hint;

  return (
    <section className="enter flex flex-col">
      <p className="label flex items-center gap-2">
        <span className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative size-1.5 rounded-full bg-accent" />
        </span>
        Live rates · No wallet or sign-up needed
      </p>

      <h1 className="mt-4 max-w-[520px] font-display text-[34px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink sm:text-[46px]">
        How much do you want to grow?
      </h1>

      <div className="mt-7 rounded-[14px] border border-line bg-surface shadow-card">
        {/* Amount field: "$" and digits share font and baseline so they read as one number. */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="amount" className="label">
              Amount
            </label>
            <span className="text-[12px] text-ink-3">
              Which <Term k="stablecoin">stablecoin</Term> do you have?
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <label
              htmlFor="amount"
              className="flex shrink-0 cursor-text items-baseline font-display leading-none font-semibold tracking-[-0.04em] text-ink"
              style={{ fontSize: "clamp(44px, 11vw, 60px)" }}
            >
              <span aria-hidden className={`mr-[0.04em] text-[0.7em] ${amount ? "text-ink" : "text-ink-3"}`}>
                $
              </span>
              <span className="relative inline-grid">
                {/* Invisible sizer lets the input grow with its content. */}
                <span aria-hidden className="tabular invisible col-start-1 row-start-1 whitespace-pre">
                  {display || "0"}
                </span>
                <input
                  id="amount"
                  aria-label="Amount in US dollars"
                  inputMode="numeric"
                  size={1}
                  autoComplete="off"
                  value={display}
                  placeholder="0"
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^\d]/g, ""));
                    onAmount(Math.min(n, MAX));
                  }}
                  className="tabular col-start-1 row-start-1 w-full min-w-0 bg-transparent text-left caret-accent outline-none placeholder:text-ink-3"
                />
              </span>
            </label>
            <Segmented<Asset>
              label="Which stablecoin"
              value={asset}
              onChange={onAsset}
              options={(["USDC", "USDT"] as const).map((a) => ({
                key: a,
                label: (
                  <>
                    <TokenIcon asset={a} size={16} /> {a}
                  </>
                ),
              }))}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => onAmount(p)}
                aria-pressed={amount === p}
                className={`pressable h-7 rounded-[7px] border px-2.5 font-mono text-[12px] ${
                  amount === p
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink"
                }`}
              >
                ${p >= 1000 ? `${p / 1000}k` : p}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-5 pt-4 pb-5">
          <h2 className="text-[15px] font-semibold text-ink">How much risk are you okay with?</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Segmented<Appetite>
              label="Risk comfort"
              value={appetite}
              onChange={onAppetite}
              options={APPETITES.map((a) => ({ key: a.key, label: a.label }))}
            />
            <p key={appetite} className="enter text-[13px] text-ink-3">
              {hint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
