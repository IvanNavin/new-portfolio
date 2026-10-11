import { NextResponse } from "next/server";

import { defaultRegion, resolveLocale, tmdbLanguage } from "@/lib/apiLocale";
import { getTitle } from "@/lib/tmdb/title";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) => {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") {
    return NextResponse.json(
      { error: 'type must be "movie" or "tv"' },
      { status: 400 },
    );
  }

  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "id must be numeric" }, { status: 400 });
  }

  const url = new URL(request.url);
  const locale = resolveLocale(request, url.searchParams);
  const region =
    url.searchParams.get("region")?.toUpperCase() || defaultRegion();

  const details = await getTitle(type, numericId, tmdbLanguage(locale), region);
  if (!details)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(details, {
    headers: {
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};
