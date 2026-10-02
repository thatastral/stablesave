import { ImageResponse } from "next/og";
import { LOGO_COINS, LOGO_VIEWBOX } from "@/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Full-bleed square: iOS applies its own rounded mask.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#00AD61",
        }}
      >
        <svg width="180" height="180" viewBox={LOGO_VIEWBOX}>
          {LOGO_COINS.map((d) => (
            <path key={d} d={d} fill="#fff" />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
