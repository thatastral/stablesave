import { ImageResponse } from "next/og";

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
        <svg width="180" height="180" viewBox="0 0 32 32">
          <rect x="4.25" y="6.95" width="22.1" height="5" rx="2.5" fill="#FFFFFF" transform="rotate(-8 15.3 9.45)" />
          <rect x="4.70" y="13.35" width="22.8" height="5" rx="2.5" fill="#FFFFFF" />
          <rect x="5.80" y="19.80" width="22" height="5" rx="2.5" fill="#FFFFFF" transform="rotate(-8 16.8 22.3)" />
        </svg>
      </div>
    ),
    size,
  );
}
