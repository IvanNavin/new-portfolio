import { NextResponse } from "next/server";

import { resolveLocale, tmdbLanguage } from "@/lib/apiLocale";
import { parseFilterQuery } from "@/lib/filters/schema";
import { discover } from "@/lib/tmdb/discover";

/**
 * The one endpoint everything goes through — the site today, the browser
 * extension later. The TMDB token stays server-side; callers only ever see our
 * normalized shapes.
 */
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const locale = resolveLocale(request, url.searchParams);
  const query = parseFilterQuery(url.searchParams);

  try {
    const response = await discover(query, tmdbLanguage(locale));
    return NextResponse.json(response, {
      headers: {
        "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
};
