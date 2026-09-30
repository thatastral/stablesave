"use client";

import { useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const display = amount ? amount.toLocaleString("en-US") : "";
  const hint = APPETITES.find((a) => a.key === appetite)!.hint;

  return (
    <section className="enter mx-auto flex w-full max-w-[640px] flex-col items-center px-4 pt-10 text-center sm:pt-14">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-2 shadow-card">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-50" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        Live rates · No wallet or sign-up needed
      </p>

      <h1 className="font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.02em] text-ink sm:text-[38px]">
        How much do you want to grow?
      </h1>

      {/* Amount. "$" shares the digits' font and baseline so the pair reads as one number. */}
      <label
        className="mt-4 flex cursor-text items-baseline justify-center font-display leading-none font-extrabold tracking-[-0.045em] text-ink"
        style={{ fontSize: "clamp(56px, 16vw, 92px)" }}
      >
        <span aria-hidden className={`mr-[0.04em] text-[0.72em] ${amount ? "text-ink" : "text-ink-3"}`}>
          $
        </span>
        <span className="relative inline-grid">
          {/* Invisible sizer lets the input grow with its content. */}
          <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre">
            {display || "0"}
          </span>
          <input
            ref={inputRef}
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

      <div className="mt-5 flex flex-col items-center gap-2">
        <Segmented<Asset>
          label="Which stablecoin"
          value={asset}
          onChange={onAsset}
          options={(["USDC", "USDT"] as const).map((a) => ({
            key: a,
            label: (
              <>
                <TokenIcon asset={a} size={18} /> {a}
              </>
            ),
          }))}
        />
        <p className="text-[13px] text-ink-3">
          Which <Term k="stablecoin">stablecoin</Term> do you have?
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onAmount(p)}
            className={`pressable h-8 rounded-full px-3.5 text-[13px] font-semibold ${
              amount === p ? "bg-ink text-canvas" : "bg-surface text-ink-2 shadow-card hover:text-ink"
            }`}
          >
            ${p >= 1000 ? `${p / 1000}k` : p}
          </button>
        ))}
      </div>

      <h2 className="mt-10 font-display text-[22px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-[26px]">
        How much risk are you okay with?
      </h2>

      <div className="mt-4 flex flex-col items-center gap-2.5">
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
    </section>
  );
}
