import { ImageResponse } from "next/og";
import { blogs } from "#velite";
import { SITE_URL } from "@/lib/site";
// Removed explicit edge runtime to allow standard static optimization elsewhere.
// If edge performance is required for OG images, re-add: export const runtime = "edge";

export const revalidate = 86400;

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const blog = blogs.find((b) => b.slug === params.slug);
  const title = blog?.title || "Divij Ganjoo";
  const siteHost = SITE_URL.replace(/^https?:\/\//, "");
  const res = new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 64,
        background: "linear-gradient(120deg,#0f0c29,#302b63,#24243e)",
        color: "white",
        fontSize: 56,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 32 }}>{siteHost}</div>
      <div style={{ fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
    </div>,
    { width: 1200, height: 630 }
  );

  res.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  );
  return res;
}
