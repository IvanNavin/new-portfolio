import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_URLS = 500;

/**
 * POST { urls: string[] } → returns NewsItem rows for those URLs, ordered
 * by publishedAt desc. Used by the /saved view, which keeps the list of
 * starred URLs in localStorage and asks the server to hydrate them.
 *
 * Capped at MAX_URLS to keep the IN-list bounded; in practice nobody
 * stars hundreds of items but the cap is cheaper than fighting bad input.
 */
export async function POST(req: NextRequest) {
  let urls: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.urls)) {
      urls = body.urls
        .filter((u: unknown): u is string => typeof u === "string")
        .slice(0, MAX_URLS);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  if (urls.length === 0) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const items = await prisma.newsItem.findMany({
    where: { url: { in: urls } },
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json({ ok: true, items });
}
