import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get("count") ?? 0) || 0;
  const mins = Number(searchParams.get("mins") ?? 1) || 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#fafaf7",
          color: "#111111",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#666666",
          }}
        >
          Eye Roll News
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 220, lineHeight: 1, fontWeight: 600 }}>
            {count.toLocaleString()}
          </div>
          <div style={{ fontSize: 36, color: "#666666" }}>
            eye rolls in {mins} {mins === 1 ? "minute" : "minutes"}
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#999999",
          }}
        >
          Roll your eyes at the news
        </div>
      </div>
    ),
    { width: 1200, height: 1200 },
  );
}
