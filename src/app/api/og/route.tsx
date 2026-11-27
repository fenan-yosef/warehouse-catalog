import { ImageResponse } from "next/og";
import { LOGO_RED, LOGO_SHAPES } from "@/components/logo";
import { getSettings } from "@/lib/queries";

/**
 * Branded 1200×630 share card for Telegram, WhatsApp, Facebook and search results.
 * Latin text only: the built-in font has no Ethiopic glyphs.
 */
export async function GET() {
  const s = await getSettings();
  const pts = (p: readonly number[]) => p.join(",");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#111111",
          color: "#ffffff",
          padding: 72,
          alignItems: "center",
          gap: 64,
          borderTop: "14px solid #e00000",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 300,
            height: 300,
            borderRadius: 40,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="240" height="202" viewBox="150 200 590 496">
            {LOGO_SHAPES.red.map((p, i) => (
              <polygon key={`r${i}`} points={pts(p)} fill={LOGO_RED} />
            ))}
            {LOGO_SHAPES.dark.map((p, i) => (
              <polygon key={`d${i}`} points={pts(p)} fill="#1c1c1c" />
            ))}
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1 }}>{s.businessName}</div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#d4d4d4" }}>{s.tagline}</div>
          <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
            {["Pipes", "Fittings", "Sanitary", "Wholesale & retail"].map((tag) => (
              <div
                key={tag}
                style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "#e00000", fontSize: 24 }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, fontSize: 28, color: "#a3a3a3" }}>Ashewa Meda · Addis Ababa · Ethiopia</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
