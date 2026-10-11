/** Autocomplete + id→name resolution for the async facets (people, keywords, companies). */
import { hasTmdbToken, REVALIDATE, tmdbFetch, tolerant } from "./client";
import type { TmdbPaged, TmdbPerson } from "./dto";
import { fixturePeople, fixturePersonNames } from "./fixtures";

/** One shape for every async facet so the UI has a single control. */
export type FacetOption = {
  id: number;
  name: string;
  /** Small grey line under the name: department, origin country, title count. */
  hint?: string;
  imagePath?: string | null;
};

export const FACET_KINDS = ["person", "keyword", "company"] as const;
export type FacetKind = (typeof FACET_KINDS)[number];

const emptyPage = { page: 1, results: [], total_pages: 0, total_results: 0 };

const searchPeople = async (
  query: string,
  locale: string,
): Promise<FacetOption[]> => {
  const response = await tolerant(
    tmdbFetch<TmdbPaged<TmdbPerson>>(
      "/search/person",
      { query, language: locale, include_adult: false },
      REVALIDATE.search,
    ),
    emptyPage as TmdbPaged<TmdbPerson>,
  );

  return response.results.slice(0, 12).map((person) => ({
    id: person.id,
    name: person.name,
    hint: person.known_for_department ?? undefined,
    imagePath: person.profile_path,
  }));
};

const searchKeywords = async (query: string): Promise<FacetOption[]> => {
  const response = await tolerant(
    tmdbFetch<TmdbPaged<{ id: number; name: string }>>(
      "/search/keyword",
      { query },
      REVALIDATE.search,
    ),
    emptyPage as TmdbPaged<{ id: number; name: string }>,
  );
  return response.results
    .slice(0, 12)
    .map((entry) => ({ id: entry.id, name: entry.name }));
};

type TmdbCompany = {
  id: number;
  name: string;
  origin_country?: string;
  logo_path?: string | null;
};

const searchCompanies = async (query: string): Promise<FacetOption[]> => {
  const response = await tolerant(
    tmdbFetch<TmdbPaged<TmdbCompany>>(
      "/search/company",
      { query },
      REVALIDATE.search,
    ),
    emptyPage as TmdbPaged<TmdbCompany>,
  );
  return response.results.slice(0, 12).map((entry) => ({
    id: entry.id,
    name: entry.name,
    hint: entry.origin_country || undefined,
    imagePath: entry.logo_path ?? null,
  }));
};

export const searchFacet = async (
  kind: FacetKind,
  term: string,
  locale: string,
): Promise<FacetOption[]> => {
  const query = term.trim();
  if (query.length < 2) return [];
  if (!hasTmdbToken()) return kind === "person" ? fixturePeople(query) : [];

  if (kind === "keyword") return searchKeywords(query);
  if (kind === "company") return searchCompanies(query);
  return searchPeople(query, locale);
};

const DETAIL_PATH: Record<FacetKind, string> = {
  person: "/person",
  keyword: "/keyword",
  company: "/company",
};

/**
 * Turns bare ids back into names. A shared link carries only ids to stay short,
 * so whoever opens it still needs to read "Christopher Nolan", not "#525".
 */
export const resolveFacet = async (
  kind: FacetKind,
  ids: readonly number[],
  locale: string,
): Promise<FacetOption[]> => {
  const wanted = ids.slice(0, 30);
  if (!wanted.length) return [];
  if (!hasTmdbToken())
    return kind === "person" ? fixturePersonNames(wanted) : [];

  const results = await Promise.all(
    wanted.map((id) =>
      tolerant(
        tmdbFetch<{
          id: number;
          name: string;
          known_for_department?: string;
          profile_path?: string | null;
        }>(
          `${DETAIL_PATH[kind]}/${id}`,
          kind === "person" ? { language: locale } : {},
          REVALIDATE.person,
        ),
        null as { id: number; name: string } | null,
      ),
    ),
  );

  return results
    .filter((entry): entry is { id: number; name: string } => Boolean(entry))
    .map((entry) => ({ id: entry.id, name: entry.name }));
};
