import { normalizeParams, windowCutoff } from "@lib/feedParams";
import { prisma } from "@lib/prisma";
import { Category } from "@lib/sources";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ITEMS = 60;

const VALID_CATEGORIES: ReadonlyArray<Category> = [
  "framework",
  "language",
  "browser",
  "tooling",
  "runtime",
  "platform",
  "community",
];

/**
 * Atom feed of the curated devpulse stream.
 *
 * Supports the same query params as the home page (?category, ?source,
 * ?window, ?q) so you can subscribe to a sliced feed — e.g.
 * `/feed.xml?category=browser&window=7d`.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    raw[k] = v;
  });
  const params = normalizeParams(raw);

  const where: {
    category?: string;
    source?: string;
    publishedAt?: { gte: Date };
    isPreRelease?: boolean;
    OR?: Array<{ title?: object; excerpt?: object }>;
  } = {
    // RSS-reader subscribers don't want canary noise by default. Pass
    // ?prereleases=1 to include them.
    isPreRelease:
      url.searchParams.get("prereleases") === "1" ? undefined : false,
  };
  if (
    params.category &&
    VALID_CATEGORIES.includes(params.category as Category)
  ) {
    where.category = params.category;
  }
  if (params.source) where.source = params.source;
  const cutoff = windowCutoff(params.window);
  if (cutoff) where.publishedAt = { gte: cutoff };
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { excerpt: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.newsItem.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: MAX_ITEMS,
  });

  const siteUrl = url.origin;
  const feedUrl = `${siteUrl}/feed.xml${url.search}`;
  const updated =
    items[0]?.publishedAt.toISOString() ?? new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>devpulse — frontend stack news</title>
  <subtitle>Releases, browser updates, and notes from the libraries I actually use.</subtitle>
  <id>${escapeXml(feedUrl)}</id>
  <link rel="self" type="application/atom+xml" href="${escapeXml(feedUrl)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(siteUrl)}"/>
  <updated>${updated}</updated>
${items.map((item) => renderEntry(item)).join("\n")}
</feed>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      // Aggressive CDN caching is our rate-limit substitute on the
      // Hobby tier (where Vercel Firewall's rate_limit action isn't
      // available). s-maxage=900 → edge serves the same response for
      // 15 minutes, so a bot hammering /feed.xml gets 1 function
      // invocation and 999 cheap CDN hits. Cron runs daily, so 15min
      // staleness on a freshly-updated feed is invisible to the user.
      // stale-while-revalidate keeps the response served for an hour
      // while the next fetch happens in the background.
      "cache-control":
        "public, s-maxage=900, max-age=300, stale-while-revalidate=3600",
    },
  });
}

function renderEntry(item: {
  url: string;
  title: string;
  excerpt: string | null;
  source: string;
  publishedAt: Date;
}): string {
  return `  <entry>
    <id>${escapeXml(item.url)}</id>
    <title>${escapeXml(item.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(item.url)}"/>
    <updated>${item.publishedAt.toISOString()}</updated>
    <published>${item.publishedAt.toISOString()}</published>
    <author><name>${escapeXml(item.source)}</name></author>
    ${item.excerpt ? `<summary type="text">${escapeXml(item.excerpt)}</summary>` : ""}
  </entry>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
