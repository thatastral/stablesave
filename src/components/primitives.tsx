"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import type { Asset, Grade } from "@/lib/types";
import { chainIcon } from "@/lib/format";
import { GRADE_LABEL } from "@/lib/scoring";

export const spring = { type: "spring", duration: 0.45, bounce: 0.18 } as const;

export function TokenIcon({ asset, size = 20 }: { asset: Asset; size?: number }) {
  const usdc = asset === "USDC";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <circle cx="16" cy="16" r="16" fill={usdc ? "#2775CA" : "#26A17B"} />
      {usdc ? (
        <>
          <path
            d="M20.4 18.3c0-2.3-1.4-3.1-4.2-3.4-2-.3-2.4-.8-2.4-1.7s.7-1.5 2-1.5c1.2 0 1.9.4 2.2 1.4.1.2.2.3.4.3h1c.3 0 .5-.2.5-.4v-.1c-.3-1.4-1.4-2.5-2.9-2.6V8.8c0-.3-.2-.5-.5-.5h-.9c-.3 0-.5.2-.6.5v1.5c-1.9.3-3.1 1.5-3.1 3.1 0 2.2 1.3 3 4.1 3.4 1.9.3 2.5.7 2.5 1.8s-1 1.8-2.2 1.8c-1.7 0-2.3-.7-2.5-1.7 0-.3-.3-.4-.5-.4h-1c-.3 0-.5.2-.5.5v.1c.3 1.6 1.3 2.7 3.3 3v1.5c0 .3.2.5.5.5h.9c.3 0 .5-.2.6-.5v-1.5c1.9-.3 3.2-1.6 3.2-3.3Z"
            fill="#fff"
          />
          <path
            d="M12.9 24.8c-4.8-1.7-7.3-7.1-5.5-11.9.9-2.6 3-4.6 5.5-5.5.3-.1.4-.3.4-.6v-.9c0-.2-.1-.4-.4-.5h-.2C7 7.1 3.7 13.3 5.5 19c1.1 3.4 3.7 6 7.1 7.1.3.1.5 0 .6-.3v-1c0-.2-.2-.4-.3-.5Zm6.4-19.4c-.3-.1-.5 0-.6.3v1c0 .3.2.5.4.6 4.8 1.7 7.3 7.1 5.5 11.9-.9 2.6-3 4.6-5.5 5.5-.3.1-.4.3-.4.6v.9c0 .2.1.4.4.5h.2c5.7-1.8 8.9-7.9 7.1-13.6-1.1-3.4-3.7-6-7.1-7.1Z"
            fill="#fff"
          />
        </>
      ) : (
        <path
          d="M17.9 17.4v0c-.1 0-.7.1-1.9.1-1 0-1.7 0-2-.1v0c-3.7-.2-6.5-.8-6.5-1.6s2.8-1.4 6.5-1.6v2.5c.3 0 .9.1 2 .1 1.3 0 1.8-.1 1.9-.1v-2.5c3.7.2 6.4.8 6.4 1.6s-2.7 1.4-6.4 1.6m0-3.4v-2.3h5.2V8.3H8.9v3.4h5.2V14c-4.2.2-7.4 1-7.4 2.1s3.2 1.9 7.4 2.1v7.3h3.8v-7.3c4.2-.2 7.3-1 7.3-2.1s-3.1-1.9-7.3-2.1"
          fill="#fff"
        />
      )}
    </svg>
  );
}

function FallbackMark({ name, size }: { name: string; size: number }) {
  return (
    <span
      className="grid place-items-center rounded-full bg-sunken font-display font-semibold text-ink-2"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.charAt(0)}
    </span>
  );
}

function SmartImg({ src, alt, size, className }: { src: string; alt: string; size: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackMark name={alt} size={size} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-full bg-sunken object-cover ${className ?? ""}`}
      style={{ width: size, height: size }}
    />
  );
}

export function ProtocolMark({
  logo,
  name,
  chain,
  size = 44,
}: {
  logo: string;
  name: string;
  chain?: string;
  size?: number;
}) {
  const badge = Math.round(size * 0.42);
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <SmartImg src={logo} alt={name} size={size} className="ring-1 ring-hairline" />
      {chain && (
        <span
          className="absolute -right-0.5 -bottom-0.5 rounded-full bg-surface p-[2px]"
          title={chain}
          style={{ width: badge + 4, height: badge + 4 }}
        >
          <SmartImg src={chainIcon(chain)} alt={chain} size={badge} />
        </span>
      )}
    </span>
  );
}

export function ChainIcon({ chain, size = 16 }: { chain: string; size?: number }) {
  return <SmartImg src={chainIcon(chain)} alt={chain} size={size} />;
}

const GRADE_STYLE: Record<Grade, { fg: string; bg: string }> = {
  A: { fg: "var(--grade-a)", bg: "var(--grade-a-soft)" },
  B: { fg: "var(--grade-b)", bg: "var(--grade-b-soft)" },
  C: { fg: "var(--grade-c)", bg: "var(--grade-c-soft)" },
  D: { fg: "var(--grade-d)", bg: "var(--grade-d-soft)" },
};

export function gradeColor(g: Grade) {
  return GRADE_STYLE[g];
}

export function GradeBadge({ grade, withLabel = false }: { grade: Grade; withLabel?: boolean }) {
  const s = GRADE_STYLE[grade];
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full pr-2.5 pl-[3px] text-[12px] font-medium"
      style={{ background: s.bg, color: s.fg }}
      title={GRADE_LABEL[grade]}
    >
      <span
        className="grid size-[18px] place-items-center rounded-full font-display text-[11px] font-semibold text-white"
        style={{ background: s.fg }}
      >
        {grade}
      </span>
      {withLabel ? GRADE_LABEL[grade] : "Grade"}
    </span>
  );
}

/** Springs between values so numbers feel physical instead of snapping. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useSpring(value, { stiffness: 170, damping: 26, mass: 0.7 });
  const text = useTransform(mv, format);
  useEffect(() => {
    if (reduce) mv.jump(value);
    else mv.set(value);
  }, [value, mv, reduce]);
  return <motion.span className={`tabular ${className ?? ""}`}>{text}</motion.span>;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  label,
}: {
  options: { key: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  label: string;
}) {
  const id = useId();
  const h = size === "sm" ? "h-7 text-[13px]" : "h-9 text-[14px]";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full bg-surface-2 p-1"
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.key)}
            className={`relative flex items-center gap-1.5 rounded-full px-2.5 font-display font-medium whitespace-nowrap transition-colors duration-150 sm:px-3.5 ${h} ${
              active ? "text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-full bg-surface shadow-card"
              />
            )}
            <span className="relative flex items-center gap-1.5">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.8 3 3.7v4c0 3.1 2.1 5.6 5 6.5 2.9-.9 5-3.4 5-6.5v-4L8 1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m5.8 8 1.6 1.6L10.4 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** True on viewports at least `minWidth` wide. False during SSR (mobile-first). */
export function useMinWidth(minWidth: number) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(`(min-width: ${minWidth}px)`).matches,
    () => false,
  );
}
