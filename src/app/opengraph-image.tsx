import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getOpportunityFeed } from "@/lib/server/yields";
import { GRADE_LABEL, projectedEarnings, rank, scoreAll } from "@/lib/scoring";
import { chainIcon } from "@/lib/format";
import type { Grade, ScoredOpportunity } from "@/lib/types";

export const alt = "StableSave: compare USDC and USDT savings rates across DeFi, with clear safety grades.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Always reflects live rates.
export const dynamic = "force-dynamic";

// Dark palette, matching the app's dark theme tokens.
const CANVAS = "#0c0c0c";
const SURFACE = "#141414";
const SURFACE_2 = "#1a1a1a";
const INK = "#f5f5f3";
const INK_2 = "#a9a9a5";
const INK_3 = "#6e6e6b";
const ACCENT = "#2bd488";
const GRADE: Record<Grade, [string, string]> = {
  A: ["#2bd488", "rgba(43,212,136,0.14)"],
  B: ["#6b9bff", "rgba(107,155,255,0.15)"],
  C: ["#f5a524", "rgba(245,165,36,0.15)"],
  D: ["#ff6369", "rgba(255,99,105,0.15)"],
};

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Logos are served as WebP, which the renderer can't draw, so convert to PNG. */
async function logo(url: string, px: number): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(px * 2, px * 2, { fit: "cover" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const font = (f: string) => readFile(join(process.cwd(), "assets", f));
  const [rubik, rubikMedium, mono, regular, medium, feed] = await Promise.all([
    font("Rubik-SemiBold.ttf"),
    font("Rubik-Medium.ttf"),
    font("GeistMono-Regular.ttf"),
    font("Inter-Regular.ttf"),
    font("Inter-Medium.ttf"),
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
    .slice(0, 4);

  const rows = await Promise.all(
    picks.map(async (o) => ({
      o,
      logo: await logo(o.protocol.logo, 38),
      chain: await logo(chainIcon(o.chain), 16),
    })),
  );
  const top = picks[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: CANVAS,
          fontFamily: "Inter",
          color: INK,
          padding: "52px 64px 56px",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mark size={34} />
            <div style={{ display: "flex", fontFamily: "Rubik", fontSize: 28, letterSpacing: -0.8 }}>StableSave</div>
          </div>
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 16, color: INK_3, letterSpacing: 0.5 }}>
            stablesave.vercel.app
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 44, gap: 56 }}>
          {/* Message */}
          <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
            <Label color={ACCENT}>Stablecoin savings, compared</Label>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontFamily: "Rubik",
                fontSize: 64,
                lineHeight: 1.03,
                letterSpacing: -1.4,
              }}
            >
              Find where your stablecoins earn the most.
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 24, lineHeight: 1.45, color: INK_2 }}>
              Live USDC and USDT rates across DeFi, each with a plain-English A–D safety grade.
            </div>
            <div style={{ display: "flex", marginTop: "auto" }}>
              <Label>No wallet · No sign-up · Free</Label>
            </div>
          </div>

          {/* Ledger */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignSelf: "flex-start",
              borderRadius: 28,
              background: SURFACE,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "13px 20px",
                background: SURFACE_2,
              }}
            >
              <div style={{ display: "flex", flex: 1 }}>
                <Label>Option</Label>
              </div>
              <div style={{ display: "flex", width: 96, justifyContent: "flex-end" }}>
                <Label>Rate</Label>
              </div>
              <div style={{ display: "flex", width: 124, justifyContent: "flex-end" }}>
                <Label>Safety</Label>
              </div>
            </div>

            {rows.map(({ o, logo, chain }, i) => (
              <Row key={o.id} o={o} logo={logo} chain={chain} first={i === 0} />
            ))}

            {top && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 20px",
                  background: SURFACE_2,
                }}
              >
                <div style={{ display: "flex", fontSize: 16, color: INK_3 }}>
                  {usd(amount)} USDC in {top.protocol.name}, for a year
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <div
                    style={{ display: "flex", fontFamily: "Rubik", fontSize: 24, color: ACCENT, letterSpacing: -0.6 }}
                  >
                    +{usd(projectedEarnings(amount, top.apy))}
                  </div>
                  <div style={{ display: "flex", fontSize: 15, color: INK_3 }}>/yr</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Rubik", data: rubik, weight: 600, style: "normal" },
        { name: "Rubik", data: rubikMedium, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}

function Row({
  o,
  logo,
  chain,
  first,
}: {
  o: ScoredOpportunity;
  logo: string | null;
  chain: string | null;
  first: boolean;
}) {
  const [fg, bg] = GRADE[o.grade];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        borderTop: first ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 14 }}>
        <div style={{ display: "flex", position: "relative", width: 38, height: 38 }}>
          {logo ? (
            <img src={logo} width={38} height={38} style={{ borderRadius: 999 }} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                width: 38,
                height: 38,
                borderRadius: 999,
                background: SURFACE_2,
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Rubik",
                fontSize: 17,
                color: INK_2,
              }}
            >
              {o.protocol.name.charAt(0)}
            </div>
          )}
          {chain && (
            <div
              style={{
                display: "flex",
                position: "absolute",
                right: -4,
                bottom: -4,
                padding: 2,
                borderRadius: 999,
                background: SURFACE,
              }}
            >
              <img src={chain} width={16} height={16} style={{ borderRadius: 999 }} alt="" />
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Rubik", fontSize: 20, letterSpacing: -0.3 }}>
            {o.protocol.name}
          </div>
          <div style={{ display: "flex", fontSize: 15, color: INK_3, marginTop: 2 }}>{o.chain}</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 96,
          justifyContent: "flex-end",
          fontFamily: "Rubik",
          fontSize: 22,
          letterSpacing: -0.4,
        }}
      >
        {o.apy.toFixed(2)}%
      </div>
      <div style={{ display: "flex", width: 124, justifyContent: "flex-end" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px 3px 3px",
            borderRadius: 999,
            background: bg,
            color: fg,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: 999,
              background: fg,
              color: CANVAS,
              fontFamily: "Geist Mono",
              fontSize: 12,
            }}
          >
            {o.grade}
          </div>
          {GRADE_LABEL[o.grade]}
        </div>
      </div>
    </div>
  );
}

function Label({ children, color = INK_3 }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Geist Mono",
        fontSize: 14,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#0FA968" />
      <rect x="6.5" y="19.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".55" />
      <rect x="10" y="13.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".78" />
      <rect x="13.5" y="7.5" width="12" height="5" rx="2.5" fill="#fff" />
    </svg>
  );
}
