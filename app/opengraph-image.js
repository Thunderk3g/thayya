import { ImageResponse } from "next/og";

// Social share card (Open Graph / Twitter). Rendered to PNG by next/og.
export const alt = "Thayya — Move. Rise. Shine.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background:
            "linear-gradient(115deg, #f66917 0%, #f04226 28%, #bd23a2 58%, #9f26a7 78%, #07aeae 100%)",
          color: "#fff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Thayya™
        </div>
        <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>
          Move. Rise. Shine.
        </div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.95, maxWidth: 900 }}>
          Movement rooted in Indian rhythms — find your beat, your people, your power.
        </div>
      </div>
    ),
    { ...size }
  );
}
