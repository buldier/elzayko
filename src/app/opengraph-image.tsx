import { ImageResponse } from "next/og";

export const alt = "Elzayko — photography and moving image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card (detail pages override it with the work itself). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1d1b18", color: "#f6f2ec", padding: 80, fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#d8cbb8", fontFamily: "sans-serif" }}>Photography &amp; moving image</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontStyle: "italic", lineHeight: 1 }}>Elzayko.</div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#c9bdad" }}>Light, held still.</div>
        </div>
      </div>
    ),
    size,
  );
}
