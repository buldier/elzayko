"use client";

/** Last-resort boundary for failures in the root layout. Renders its own document. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f2ec", color: "#1d1b18", fontFamily: "Georgia, serif" }}>
        <title>Something went wrong — Elzayko</title>
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontStyle: "italic", fontSize: 28, margin: 0 }}>Elzayko.</p>
          <h1 style={{ fontWeight: 400, fontSize: 36, margin: "40px 0 12px" }}>Something went wrong.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#675f56", margin: "0 0 28px" }}>Please try again in a moment.</p>
          <button
            onClick={() => retry()}
            style={{ fontFamily: "system-ui, sans-serif", background: "#1d1b18", color: "#f6f2ec", border: 0, padding: "12px 22px", borderRadius: 4, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
