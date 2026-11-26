import { ImageResponse } from "next/og";

export const alt = "MI HIERRO · Tu hierro, tu marca, tu legado";
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
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0C0B0A",
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(200, 155, 99, 0.22), rgba(12, 11, 10, 0) 58%)",
          padding: "72px 80px",
          border: "16px solid #151311",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 8, color: "#C89B63" }}>
            HERÁLDICA GANADERA · FORJA DIGITAL
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 96, letterSpacing: 14, color: "#F2E9DA", lineHeight: 1 }}>
            MI HIERRO
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 38, color: "#C89B63", letterSpacing: 2 }}>
            Tu hierro, tu marca, tu legado
          </div>
          <div style={{ display: "flex", width: 240, height: 2, background: "#2B2622", marginTop: 42 }} />
          <div style={{ display: "flex", marginTop: 30, fontSize: 22, letterSpacing: 5, color: "#A2968A" }}>
            GRATIS · 3 PROPUESTAS · VECTOR FORJABLE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 290 }}>
          <div style={{ display: "flex", width: 12, height: 44, background: "#C89B63" }} />
          <div style={{ display: "flex", width: 50, height: 12, background: "#C89B63", marginTop: -28 }} />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: 250,
              height: 140,
              marginTop: 26,
              padding: "0 44px",
              borderTop: "12px solid #C89B63",
              borderLeft: "12px solid #C89B63",
              borderRight: "12px solid #C89B63",
              borderRadius: "140px 140px 0 0",
            }}
          >
            <div style={{ display: "flex", width: 12, height: 100, background: "#C89B63" }} />
            <div style={{ display: "flex", width: 12, height: 100, background: "#C89B63" }} />
          </div>
          <div style={{ display: "flex", width: 214, height: 12, background: "#C89B63", marginTop: 10 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
