import { blogs, projects } from "#velite";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const site = SITE_URL;
  const urls = [site, ...blogs.map((b) => site + b.url), ...projects.map((p) => site + p.url)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `<url><loc>${u}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
    .join("\n")}\n</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
