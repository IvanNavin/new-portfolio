import { NextResponse } from "next/server";

import { resolveLocale, tmdbLanguage } from "@/lib/apiLocale";
import {
  FACET_KINDS,
  type FacetKind,
  resolveFacet,
  searchFacet,
} from "@/lib/tmdb/search";

/**
 * Autocomplete and id -> name resolution for the async facets.
 *
 *   /api/search?kind=person&q=nolan     -> search
 *   /api/search?kind=company&ids=41,420 -> resolve names for a shared link
 */
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const locale = resolveLocale(request, url.searchParams);

  const raw = url.searchParams.get("kind") ?? "person";
  if (!FACET_KINDS.includes(raw as FacetKind)) {
    return NextResponse.json(
      { error: `kind must be one of ${FACET_KINDS.join(", ")}` },
      { status: 400 },
    );
  }
  const kind = raw as FacetKind;

  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter(Number.isFinite);

  const results = ids.length
    ? await resolveFacet(kind, ids, tmdbLanguage(locale))
    : await searchFacet(
        kind,
        url.searchParams.get("q") ?? "",
        tmdbLanguage(locale),
      );

  return NextResponse.json(
    { results },
    { headers: { "cache-control": "public, s-maxage=3600" } },
  );
};
