import { ImageResponse } from "next/og";

export const alt = "Parth — Systems and ML, measured.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #09090b 0%, #0d0f17 60%, #0a0a0c 100%)",
          padding: "70px 80px",
          color: "#fafafa",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(96, 165, 250, 0.35)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.22)",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "#a1a1aa",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#60a5fa",
              color: "#09090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: "#fafafa" }}>pauti04</span>
            <span style={{ color: "#3f3f46" }}>·</span>
            <span>Portfolio · 2026</span>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 110,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1,
              color: "#fafafa",
              display: "flex",
            }}
          >
            Systems and ML,
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1,
              color: "#60a5fa",
              display: "flex",
            }}
          >
            measured.
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 36,
              fontSize: 24,
              color: "#d4d4d8",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 600, color: "#fafafa" }}>
                220k/s
              </span>
              <span style={{ color: "#71717a", fontSize: 18 }}>order throughput</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 600, color: "#fafafa" }}>
                500×
              </span>
              <span style={{ color: "#71717a", fontSize: 18 }}>rpki speedup</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 600, color: "#fafafa" }}>
                6
              </span>
              <span style={{ color: "#71717a", fontSize: 18 }}>live demos</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
