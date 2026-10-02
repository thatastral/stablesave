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
          <g transform="translate(17.6 9.6) rotate(-16)">
            <rect x="-7.6" y="-1.15" width="15.2" height="4.6" rx="2.3" fill="#BFEBD5" />
            <rect x="-7.6" y="-2.6" width="15.2" height="4.6" rx="2.3" fill="#FFFFFF" />
          </g>
          <g transform="translate(16 16.2) rotate(20)">
            <rect x="-7.6" y="-1.15" width="15.2" height="4.6" rx="2.3" fill="#9FDDBF" />
            <rect x="-7.6" y="-2.6" width="15.2" height="4.6" rx="2.3" fill="#D6F7E6" />
          </g>
          <g transform="translate(14.4 22.8) rotate(-16)">
            <rect x="-7.6" y="-1.15" width="15.2" height="4.6" rx="2.3" fill="#BFEBD5" />
            <rect x="-7.6" y="-2.6" width="15.2" height="4.6" rx="2.3" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
