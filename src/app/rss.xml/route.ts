import { blogs, projects } from "#velite";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const site = SITE_URL;
  const items = [
    ...blogs.map((b) => ({
      title: b.title,
      link: site + b.url,
      date: b.date,
      description: b.description,
    })),
    ...projects.map((p) => ({
      title: p.title,
      link: site + p.url,
      date: p.date || new Date().toISOString(),
      description: p.description,
    })),
  ];
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>Divij Ganjoo</title>\n<link>${site}</link>\n<description>Portfolio feed</description>\n${items
    .map(
      (i) =>
        `<item><title><![CDATA[${i.title}]]></title><link>${i.link}</link><pubDate>${new Date(i.date).toUTCString()}</pubDate><description><![CDATA[${
          i.description || ""
        }]]></description></item>`
    )
    .join("\n")}\n</channel>\n</rss>`;
  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
