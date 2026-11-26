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
          background: "#F6F2EA",
          padding: "72px 80px",
          border: "16px solid #EDE6D8",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, color: "#8A5A2B" }}>
            HERÁLDICA GANADERA · FORJA DIGITAL
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 96, letterSpacing: 10, color: "#181614", lineHeight: 1 }}>
            MI HIERRO
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 38, color: "#8A5A2B", letterSpacing: 2 }}>
            Tu hierro, tu marca, tu legado
          </div>
          <div style={{ display: "flex", width: 240, height: 2, background: "#DFD6C7", marginTop: 42 }} />
          <div style={{ display: "flex", marginTop: 30, fontSize: 22, letterSpacing: 5, color: "#5A534A" }}>
            GRATIS · 3 PROPUESTAS · VECTOR FORJABLE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 290 }}>
          <div style={{ display: "flex", width: 12, height: 44, background: "#181614" }} />
          <div style={{ display: "flex", width: 50, height: 12, background: "#181614", marginTop: -28 }} />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: 250,
              height: 140,
              marginTop: 26,
              padding: "0 44px",
              borderTop: "12px solid #181614",
              borderLeft: "12px solid #181614",
              borderRight: "12px solid #181614",
              borderRadius: "140px 140px 0 0",
            }}
          >
            <div style={{ display: "flex", width: 12, height: 100, background: "#181614" }} />
            <div style={{ display: "flex", width: 12, height: 100, background: "#181614" }} />
          </div>
          <div style={{ display: "flex", width: 214, height: 12, background: "#181614", marginTop: 10 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
