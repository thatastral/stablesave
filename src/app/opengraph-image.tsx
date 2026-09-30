import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getOpportunityFeed } from "@/lib/server/yields";
import { projectedEarnings, rank, scoreAll, GRADE_LABEL } from "@/lib/scoring";
import type { Grade } from "@/lib/types";

export const alt = "StableSave: compare USDC and USDT savings rates across DeFi, with clear safety grades.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Always reflects live rates.
export const dynamic = "force-dynamic";

const INK = "#111111";
const INK_2 = "#5d5d5b";
const INK_3 = "#9a9a96";
const ACCENT = "#0fa968";
const ACCENT_INK = "#067047";
const GRADE: Record<Grade, [string, string]> = {
  A: ["#0fa968", "#e3f6ec"],
  B: ["#3a7bfd", "#e8f0ff"],
  C: ["#e08a00", "#fdf1dc"],
  D: ["#e5484d", "#fde7e7"],
};

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

export default async function Image() {
  const [display, bold, body, feed] = await Promise.all([
    readFile(join(process.cwd(), "assets/Nunito-ExtraBold.ttf")),
    readFile(join(process.cwd(), "assets/Nunito-Bold.ttf")),
    readFile(join(process.cwd(), "assets/Inter-Medium.ttf")),
    getOpportunityFeed(),
  ]);

  // Real picks for $10,000 USDC. The public card only features grade A–B options.
  const amount = 10_000;
  const picks = rank(scoreAll(feed.opportunities, "conservative"), {
    appetite: "conservative",
    sort: "match",
    chains: [],
    asset: "USDC",
  })
    .filter((o, i, a) => a.findIndex((x) => x.protocol.slug === o.protocol.slug) === i)
    .slice(0, 3);
  const top = picks[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f4f1",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Soft washes */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: -200,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(15,169,104,0.16), rgba(15,169,104,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            right: -160,
            width: 820,
            height: 820,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(58,123,253,0.13), rgba(58,123,253,0) 70%)",
          }}
        />

        {/* Left: message */}
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 0 64px 72px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mark size={52} />
            <div style={{ display: "flex", fontFamily: "Nunito", fontWeight: 800, fontSize: 36, color: INK, letterSpacing: -0.5 }}>
              Stable<span style={{ color: ACCENT_INK }}>Save</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 58,
              fontFamily: "Nunito",
              fontWeight: 800,
              fontSize: 72,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: INK,
            }}
          >
            Find where your stablecoins earn the most.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 27, lineHeight: 1.4, color: INK_2 }}>
            Compare USDC & USDT savings rates across DeFi, with clear A–D safety grades.
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
            {["No wallet needed", "No sign-up", "Free"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "#ffffff",
                  boxShadow: "0 8px 24px -10px rgba(17,17,17,0.18)",
                  fontSize: 22,
                  color: INK,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 999, background: ACCENT }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right: product card */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 64 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 440,
              padding: 30,
              borderRadius: 40,
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(17,17,17,0.04), 0 40px 80px -24px rgba(17,17,17,0.22)",
              transform: "rotate(2deg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  padding: "7px 14px",
                  borderRadius: 999,
                  background: "#e3f6ec",
                  color: ACCENT_INK,
                  fontFamily: "Nunito",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: 1,
                }}
              >
                ★ TOP PICK FOR YOU
              </div>
              {top && <GradePill grade={top.grade} label />}
            </div>

            <div style={{ display: "flex", marginTop: 26, fontSize: 20, color: INK_3 }}>
              In a year, {usd(amount)} could earn
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontFamily: "Nunito",
                fontWeight: 800,
                fontSize: 76,
                letterSpacing: -2.5,
                color: INK,
                lineHeight: 1.05,
              }}
            >
              +{usd(top ? projectedEarnings(amount, top.apy) : 514)}
              <span style={{ fontSize: 28, color: INK_3, marginLeft: 8, letterSpacing: 0 }}>/yr</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 22, gap: 10 }}>
              {picks.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: 22,
                    background: "#f7f7f5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: `hsl(${hue(o.protocol.name)} 70% 92%)`,
                      color: `hsl(${hue(o.protocol.name)} 55% 35%)`,
                      fontFamily: "Nunito",
                      fontWeight: 800,
                      fontSize: 20,
                    }}
                  >
                    {o.protocol.name.charAt(0)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", fontFamily: "Nunito", fontWeight: 700, fontSize: 21, color: INK }}>
                      {o.protocol.name}
                    </div>
                    <div style={{ display: "flex", fontSize: 16, color: INK_3 }}>{o.chain}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ display: "flex", fontFamily: "Nunito", fontWeight: 800, fontSize: 22, color: INK }}>
                      {o.apy.toFixed(2)}%
                    </div>
                    <GradePill grade={o.grade} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nunito", data: display, weight: 800, style: "normal" },
        { name: "Nunito", data: bold, weight: 700, style: "normal" },
        { name: "Inter", data: body, weight: 500, style: "normal" },
      ],
    },
  );
}

function GradePill({ grade, label = false }: { grade: Grade; label?: boolean }) {
  const [fg, bg] = GRADE[grade];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: label ? "5px 12px 5px 5px" : "3px 9px 3px 3px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: "Nunito",
        fontWeight: 800,
        fontSize: label ? 16 : 13,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: label ? 22 : 17,
          height: label ? 22 : 17,
          borderRadius: 999,
          background: fg,
          color: "#fff",
        }}
      >
        {grade}
      </div>
      {label ? GRADE_LABEL[grade] : "Grade"}
    </div>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FD98E" />
          <stop offset="1" stopColor="#079A5C" />
        </linearGradient>
      </defs>
      <path d="M16 0c11.3 0 16 4.7 16 16s-4.7 16-16 16S0 27.3 0 16 4.7 0 16 0Z" fill="url(#g)" />
      <rect x="6.5" y="19.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".55" />
      <rect x="10" y="13.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".78" />
      <rect x="13.5" y="7.5" width="12" height="5" rx="2.5" fill="#fff" />
    </svg>
  );
}
