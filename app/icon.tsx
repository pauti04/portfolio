import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#60a5fa",
          color: "#09090b",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
