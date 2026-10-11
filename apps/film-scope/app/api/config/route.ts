import { NextResponse } from "next/server";

import { defaultRegion, resolveLocale, tmdbLanguage } from "@/lib/apiLocale";
import { getFilterConfig } from "@/lib/tmdb/config";

/** Reference data for the filter controls: genres, countries, languages, providers. */
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const locale = resolveLocale(request, url.searchParams);
  const region =
    url.searchParams.get("region")?.toUpperCase() || defaultRegion();

  const config = await getFilterConfig(tmdbLanguage(locale), region);
  return NextResponse.json(config, {
    headers: {
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};
