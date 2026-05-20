import { ImageResponse } from "next/og";
import { projects } from "@/lib/data";
import { PROJECT_PAGES } from "@/lib/project-pages";

export const alt = "Portfolio project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.artifact === slug);
  const deep = PROJECT_PAGES[slug];

  const name = p?.name ?? "Project";
  const tagline = p?.tagline ?? "";
  const year = p?.year ?? "2026";
  const idx = p?.index ?? "—";
  const headline = deep?.benchmarks?.[0];

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
            right: -140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(96, 165, 250, 0.32)",
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
          <span style={{ color: "#fafafa" }}>Parth</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>Work · No. {idx}</span>
          <span style={{ marginLeft: "auto" }}>{year}</span>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#71717a",
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Live demo · runs in your browser
          </div>
          <div
            style={{
              fontSize: 128,
              fontWeight: 600,
              letterSpacing: -4,
              lineHeight: 0.95,
              color: "#fafafa",
              display: "flex",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#d4d4d8",
              fontStyle: "italic",
              marginTop: 4,
              display: "flex",
            }}
          >
            {tagline}
          </div>

          {headline && (
            <div
              style={{
                marginTop: 30,
                display: "flex",
                alignItems: "baseline",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: "#60a5fa",
                  letterSpacing: -1,
                }}
              >
                {headline.label}
              </span>
              <span style={{ color: "#a1a1aa", fontSize: 28 }}>
                {headline.value}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
