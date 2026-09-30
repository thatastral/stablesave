"use client";

import { useId, useMemo, useRef, useState } from "react";
import { formatPct } from "@/lib/format";

type Point = { t: number; apy: number };

const W = 520;
const H = 150;
const PAD_Y = 14;

/** Area chart with a scrubbable cursor, like a wallet price chart. */
export function ApyChart({ data, onScrub }: { data: Point[]; onScrub?: (p: Point | null) => void }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, xs, ys, min, max } = useMemo(() => {
    const vals = data.map((d) => d.apy);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const span = hi - lo || 1;
    const xs = data.map((_, i) => (i / (data.length - 1)) * W);
    const ys = data.map((d) => PAD_Y + (1 - (d.apy - lo) / span) * (H - PAD_Y * 2));
    // Smooth the line with a simple Catmull-Rom → Bézier conversion.
    let path = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i - 1] ?? xs[i], y0 = ys[i - 1] ?? ys[i];
      const x3 = xs[i + 2] ?? xs[i + 1], y3 = ys[i + 2] ?? ys[i + 1];
      const c1x = xs[i] + (xs[i + 1] - x0) / 6, c1y = ys[i] + (ys[i + 1] - y0) / 6;
      const c2x = xs[i + 1] - (x3 - xs[i]) / 6, c2y = ys[i + 1] - (y3 - ys[i]) / 6;
      path += ` C${c1x},${c1y} ${c2x},${c2y} ${xs[i + 1]},${ys[i + 1]}`;
    }
    return { path, area: `${path} L${W},${H} L0,${H} Z`, xs, ys, min: lo, max: hi };
  }, [data]);

  function move(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(data.length - 1, Math.round((x / W) * (data.length - 1))));
    setHover(i);
    onScrub?.(data[i]);
  }
  function leave() {
    setHover(null);
    onScrub?.(null);
  }

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[150px] w-full touch-none select-none"
        onPointerMove={(e) => move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
        onPointerLeave={leave}
        onPointerUp={(e) => e.pointerType !== "mouse" && leave()}
        role="img"
        aria-label={`APY history, ranging from ${formatPct(min)} to ${formatPct(max)}`}
      >
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#fill-${id})`} />
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="chart-draw"
        />
        {hover !== null && (
          <line
            x1={xs[hover]}
            x2={xs[hover]}
            y1={0}
            y2={H}
            stroke="var(--hairline-strong)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* Dot lives outside the stretched SVG so it stays perfectly round. */}
      {(() => {
        const i = hover ?? data.length - 1;
        return (
          <span
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
            style={{ left: `${(xs[i] / W) * 100}%`, top: `${(ys[i] / H) * 100}%` }}
          />
        );
      })()}
      <style>{`
        .chart-draw { stroke-dasharray: 1400; stroke-dashoffset: 1400; animation: draw 900ms var(--ease-out) 120ms forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) { .chart-draw { animation: none; stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
