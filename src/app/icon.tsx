import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "#F6F2EA",
          paddingBottom: 78,
          border: "14px solid #EDE6D8",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", width: 18, height: 62, background: "#181614" }} />
          <div style={{ display: "flex", width: 74, height: 18, background: "#181614", marginTop: -40 }} />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: 300,
              height: 168,
              marginTop: 34,
              padding: "0 54px",
              borderTop: "18px solid #181614",
              borderLeft: "18px solid #181614",
              borderRight: "18px solid #181614",
              borderRadius: "168px 168px 0 0",
            }}
          >
            <div style={{ display: "flex", width: 18, height: 120, background: "#181614" }} />
            <div style={{ display: "flex", width: 18, height: 120, background: "#181614" }} />
          </div>
          <div style={{ display: "flex", width: 264, height: 18, background: "#181614", marginTop: 12 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
