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
          background: "#0FA968",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32">
          <rect x="6.5" y="19.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".55" />
          <rect x="10" y="13.5" width="12" height="5" rx="2.5" fill="#fff" fillOpacity=".78" />
          <rect x="13.5" y="7.5" width="12" height="5" rx="2.5" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
