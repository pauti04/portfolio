import { byNewest } from "@/lib/writing";

const SITE_URL = "https://pauti04.dev";
const AUTHOR = "Parth (pauti04)";
const EMAIL = "nikunjbhadwa123@gmail.com";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = byNewest();
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}${p.href}`;
      const pub = new Date(p.date + "T00:00:00Z").toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.summary)}</description>
      <pubDate>${pub}</pubDate>
      <author>${EMAIL} (${esc(AUTHOR)})</author>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const lastBuild = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Parth — Writing</title>
    <link>${SITE_URL}/writing</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Working notes from Parth — systems, networking, and ML infrastructure.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
