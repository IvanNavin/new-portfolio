/**
 * FilterQuery -> TMDB /discover -> re-ranked, post-filtered page.
 *
 * Verified against the TMDB reference (Aug 2026):
 *   - `without_origin_country` / `without_original_language` do not exist on
 *     either discover endpoint, so those exclusions are ours to apply.
 *   - /discover/tv has no `with_cast`, `with_crew` or certification filter.
 *   - `without_genres`, `without_keywords`, `without_companies` and
 *     `without_watch_providers` do exist, so those exclusions go upstream.
 *   - `vote_count.lte` / `vote_average.lte` exist, so upper bounds go upstream.
 */
import {
  applyCountryFilter,
  applyPostFilters,
  emptyContext,
  needsCountryBackfill,
  needsPostFiltering,
  type PostFilterContext,
  sortCards,
} from "../filters/postFilter";
import {
  CERT_LADDER,
  type FilterQuery,
  type SetFacet,
} from "../filters/schema";
import type { DiscoverResponse, MediaType, TitleCard } from "../filters/types";
import {
  hasTmdbToken,
  mapLimit,
  REVALIDATE,
  tmdbFetch,
  TmdbParams,
  tolerant,
} from "./client";
import type {
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbPaged,
  TmdbPersonCredits,
  TmdbTvListItem,
} from "./dto";
import { fixtureDiscover } from "./fixtures";
import {
  type GenreVocabulary,
  MOVIE_GENRES,
  translateGenres,
  translationLosesFilter,
  vocabularyForType,
} from "./genres";
import { normalizeListItem } from "./normalize";

/** TMDB's page size is fixed at 20; every value in PAGE_SIZES is a multiple of it. */
const TMDB_PAGE_SIZE = 20;

/**
 * How many TMDB pages we pull as the candidate window when we re-rank locally.
 * 15 pages = 300 candidates = 15 HTTP calls — cheap, and deep enough that the
 * top of a re-ranked list is effectively exact.
 *
 * A constant on purpose. Sizing it by page depth made each page rank a
 * different set, so titles drifted between pages and the page count moved under
 * the user; sizing it by page size meant switching 20 -> 100 quietly changed
 * which films ranked where. One fixed window means one stable ranked list that
 * every page size slices identically.
 */
const WINDOW_PAGES = 15;

/** Ceiling on origin-country backfill calls (one request per title). */
const BACKFILL_CAP = 150;
const BACKFILL_CONCURRENCY = 12;

/**
 * Stage 1 has no Postgres index, so IMDb numbers simply do not exist yet.
 * Flipping this in Stage 2 is the only change the rating source needs.
 */
export const IMDB_INDEX_AVAILABLE = false;

const joinOr = (ids: readonly (number | string)[]) =>
  ids.length ? ids.join("|") : undefined;
const joinAnd = (ids: readonly (number | string)[]) =>
  ids.length ? ids.join(",") : undefined;

/** TMDB reads a comma as AND and a pipe as OR on every multi-value parameter. */
const joinSet = (facet: SetFacet<number | string>, values = facet.include) =>
  facet.mode === "all" ? joinAnd(values) : joinOr(values);

/**
 * TMDB cannot sort by our Bayesian score. The trick that makes the candidate
 * window nearly exact anyway: ask for `vote_average.desc` *while* enforcing
 * `vote_count.gte`. Raw average is only garbage without a vote floor; with one,
 * it surfaces precisely the titles that can top a Bayesian ranking.
 */
const toTmdbSort = (query: FilterQuery, mediaType: MediaType): string => {
  const dir = query.sort.dir;
  switch (query.sort.by) {
    case "score":
      return `vote_average.${dir}`;
    case "votes":
      return `vote_count.${dir}`;
    case "release":
      return mediaType === "tv"
        ? `first_air_date.${dir}`
        : `primary_release_date.${dir}`;
    case "title":
      return mediaType === "tv" ? `name.${dir}` : `title.${dir}`;
    case "revenue":
      // TV has no revenue field; popularity is the closest stand-in.
      return mediaType === "tv" ? `popularity.${dir}` : `revenue.${dir}`;
    case "runtime":
      // No runtime sort upstream — we sort locally, so just fetch a sane window.
      return "popularity.desc";
    case "popularity":
    default:
      return `popularity.${dir}`;
  }
};

const buildParams = (
  query: FilterQuery,
  mediaType: MediaType,
  locale: string,
): TmdbParams => {
  const isTv = mediaType === "tv";
  // The picked ids are already in the vocabulary of the selected type, so this
  // only translates when the two genuinely differ (type "both" -> the TV side).
  const from = vocabularyForType(query.type);
  const to = isTv ? "tv" : "movie";
  const genreInclude = [...translateGenres(query.genres.include, from, to)];
  const genreExclude = [...translateGenres(query.genres.exclude, from, to)];

  // `with_genres` takes one separator for the whole list, so animation can only
  // ride along when the list is already AND-ed (or empty). Otherwise it stays
  // for the post-filter, which reads genre_ids straight off the payload.
  const canFoldAnimation =
    genreInclude.length === 0 || query.genres.mode === "all";
  if (query.animation === "only" && canFoldAnimation)
    genreInclude.push(MOVIE_GENRES.animation);
  // Exclusion is its own parameter and is always OR-ed, so it always folds.
  if (query.animation === "without") genreExclude.push(MOVIE_GENRES.animation);

  const includeMode: FilterQuery["genres"]["mode"] =
    query.animation === "only" && canFoldAnimation ? "all" : query.genres.mode;

  const params: TmdbParams = {
    language: locale,
    include_adult: false,
    sort_by: toTmdbSort(query, mediaType),

    "vote_count.gte": Math.max(query.rating.votes.min, 1),
    "vote_count.lte": query.rating.votes.max,
    // Only meaningful for the TMDB source; other sources are bounded locally.
    "vote_average.gte":
      query.rating.source === "tmdb" ? query.rating.value.min : undefined,
    "vote_average.lte":
      query.rating.source === "tmdb" ? query.rating.value.max : undefined,

    with_genres: joinSet({ ...query.genres, mode: includeMode }, genreInclude),
    without_genres: joinOr(genreExclude),
    with_keywords: joinSet(query.keywords),
    without_keywords: joinOr(query.keywords.exclude),
    with_companies: joinSet(query.companies),
    without_companies: joinOr(query.companies.exclude),

    // OR only upstream; an "all" country match falls through to our post-filter.
    with_origin_country: joinOr(query.countries.include),

    "with_runtime.gte": query.runtime.min,
    "with_runtime.lte": query.runtime.max,
  };

  // with_original_language takes a single code; multi-select falls through to
  // our post-filter instead.
  if (query.languages.include.length === 1) {
    params.with_original_language = query.languages.include[0];
  }

  if (query.year.min) {
    params[isTv ? "first_air_date.gte" : "primary_release_date.gte"] =
      `${query.year.min}-01-01`;
  }
  if (query.year.max) {
    params[isTv ? "first_air_date.lte" : "primary_release_date.lte"] =
      `${query.year.max}-12-31`;
  }

  if (query.providers.include.length || query.providers.exclude.length) {
    params.watch_region = query.providers.region;
    params.with_watch_providers = joinSet(query.providers as SetFacet<number>);
    params.without_watch_providers = joinOr(query.providers.exclude);
  }
  if (query.providers.monetization.length) {
    params.watch_region = query.providers.region;
    params.with_watch_monetization_types = joinOr(query.providers.monetization);
  }

  if (isTv) {
    // /discover/tv supports neither cast/crew nor certification — the first is
    // handled in resolvePeople(), the second is simply unavailable there.
    if (query.tvStatus.length) params.with_status = joinOr(query.tvStatus);
    if (query.tvTypes.length) params.with_type = joinOr(query.tvTypes);
    return params;
  }

  params.with_cast = joinSet(query.cast);
  params.with_crew = joinSet(query.crew);

  if (query.certification.min || query.certification.max) {
    params.certification_country = query.certification.region;
    if (query.certification.min)
      params["certification.gte"] = query.certification.min;
    if (query.certification.max)
      params["certification.lte"] = query.certification.max;
  }

  return params;
};

/**
 * Resolves person-based constraints with one call per person instead of one
 * per candidate: we pull each person's filmography and turn it into an id set.
 */
const resolvePeople = async (
  query: FilterQuery,
  mediaTypes: readonly MediaType[],
): Promise<PostFilterContext> => {
  const context = emptyContext();

  const filmography = async (personId: number): Promise<number[]> => {
    const ids: number[] = [];
    for (const mediaType of mediaTypes) {
      const path = mediaType === "tv" ? "tv_credits" : "movie_credits";
      const credits = await tolerant(
        tmdbFetch<TmdbPersonCredits>(
          `/person/${personId}/${path}`,
          {},
          REVALIDATE.person,
        ),
        {},
      );
      for (const entry of credits.cast ?? []) ids.push(entry.id);
      for (const entry of credits.crew ?? []) ids.push(entry.id);
    }
    return ids;
  };

  const excluded = [...query.cast.exclude, ...query.crew.exclude];
  if (excluded.length) {
    const lists = await mapLimit(excluded, 4, filmography);
    for (const ids of lists)
      for (const id of ids) context.excludedTitleIds.add(id);
  }

  // Include-side people only need client-side resolution for TV, where TMDB
  // has neither with_cast nor with_crew. Movies got them as query params.
  const required = [...query.cast.include, ...query.crew.include];
  if (required.length && query.type === "tv") {
    const lists = await mapLimit(required, 4, async (personId) => {
      const credits = await tolerant(
        tmdbFetch<TmdbPersonCredits>(
          `/person/${personId}/tv_credits`,
          {},
          REVALIDATE.person,
        ),
        {},
      );
      return [...(credits.cast ?? []), ...(credits.crew ?? [])].map(
        (entry) => entry.id,
      );
    });
    const mode = query.cast.mode;
    context.requiredTitleIds =
      mode === "all" && lists.length > 1
        ? new Set(
            lists[0].filter((id) => lists.every((list) => list.includes(id))),
          )
        : new Set(lists.flat());
  }

  return context;
};

const fetchWindow = async (
  query: FilterQuery,
  mediaType: MediaType,
  locale: string,
  pages: number,
  firstPage = 1,
): Promise<{
  items: TitleCard[];
  totalResults: number;
  totalPages: number;
}> => {
  const params = buildParams(query, mediaType, locale);
  const path = mediaType === "tv" ? "/discover/tv" : "/discover/movie";
  const pageNumbers = Array.from(
    { length: pages },
    (_, index) => firstPage + index,
  );

  const responses = await mapLimit(pageNumbers, 5, (page) =>
    tolerant(
      tmdbFetch<TmdbPaged<TmdbMovieListItem | TmdbTvListItem>>(
        path,
        { ...params, page },
        REVALIDATE.discover,
      ),
      { page, results: [], total_pages: 0, total_results: 0 },
    ),
  );

  const head = responses[0];
  return {
    items: responses.flatMap((response) =>
      response.results.map((item) => normalizeListItem(item, mediaType)),
    ),
    totalResults: head?.total_results ?? 0,
    totalPages: head?.total_pages ?? 0,
  };
};

/**
 * Movie list payloads carry no origin_country, so the only way to honour a
 * country filter is one details call per title. Runs last, on survivors only,
 * and is capped — the Stage 2 index removes this entirely.
 */
const backfillCountries = async (
  cards: TitleCard[],
  locale: string,
): Promise<TitleCard[]> => {
  const targets = cards.slice(0, BACKFILL_CAP);

  const filled = await mapLimit(targets, BACKFILL_CONCURRENCY, async (card) => {
    if (card.mediaType === "tv" || card.originCountries.length) return card;

    const details = await tolerant(
      tmdbFetch<TmdbMovieDetails>(
        `/movie/${card.id}`,
        { language: locale },
        REVALIDATE.title,
      ),
      null as TmdbMovieDetails | null,
    );
    if (!details) return card;

    const countries = details.origin_country?.length
      ? details.origin_country
      : (details.production_countries ?? []).map((entry) => entry.iso_3166_1);

    return {
      ...card,
      originCountries: countries,
      runtime: details.runtime ?? card.runtime,
    };
  });

  return [...filled, ...cards.slice(BACKFILL_CAP)];
};

/**
 * False when the picked genres vanish on translation to this media type, which
 * would otherwise send TMDB no `with_genres` and quietly return everything.
 */
const canExpressGenres = (
  query: FilterQuery,
  mediaType: MediaType,
): boolean => {
  const from = vocabularyForType(query.type);
  const to: GenreVocabulary = mediaType === "tv" ? "tv" : "movie";
  return !translationLosesFilter(query.genres.include, from, to);
};

/** True when TMDB can answer the query directly, page-for-page, with no re-ranking. */
const canPassThrough = (query: FilterQuery): boolean =>
  query.type !== "both" &&
  query.sort.by !== "score" &&
  query.sort.by !== "runtime" &&
  !needsPostFiltering(query) &&
  !needsCountryBackfill(query);

export const discover = async (
  query: FilterQuery,
  locale: string,
): Promise<DiscoverResponse> => {
  if (!hasTmdbToken()) return fixtureDiscover(query);

  // Asking to sort by IMDb before the index exists would rank everything at
  // zero; fall back to TMDB and tell the caller what actually happened.
  const effectiveSource =
    query.rating.source === "imdb" && !IMDB_INDEX_AVAILABLE
      ? "tmdb"
      : query.rating.source;
  const effective: FilterQuery = {
    ...query,
    rating: { ...query.rating, source: effectiveSource },
  };

  const requestedTypes: MediaType[] =
    effective.type === "both" ? ["movie", "tv"] : [effective.type as MediaType];
  const mediaTypes = requestedTypes.filter((mediaType) =>
    canExpressGenres(effective, mediaType),
  );

  // Every side was dropped, so the genre selection has no equivalent at all
  // (e.g. Horror, which TMDB has for films but not for shows). Returning the
  // unfiltered catalog here would be a lie; the honest answer is nothing.
  if (!mediaTypes.length) {
    return {
      results: [],
      page: effective.page,
      totalPages: 1,
      totalResults: 0,
      approximate: false,
      scanned: 0,
      ratingSource: effectiveSource,
      source: "tmdb",
    };
  }

  const context = await resolvePeople(effective, mediaTypes);

  if (canPassThrough(effective)) {
    // One of our pages is an exact run of upstream pages, so paging stays
    // page-for-page with TMDB — no sampling, no re-ranking.
    const upstreamPerPage = effective.perPage / TMDB_PAGE_SIZE;
    const firstUpstreamPage = (effective.page - 1) * upstreamPerPage + 1;

    const { items, totalResults } = await fetchWindow(
      effective,
      mediaTypes[0],
      locale,
      upstreamPerPage,
      firstUpstreamPage,
    );

    return {
      results: applyPostFilters(items, effective, context),
      page: effective.page,
      // TMDB refuses page numbers past 500, which caps how deep we can go.
      totalPages: Math.min(
        Math.ceil(totalResults / effective.perPage),
        Math.floor(500 / upstreamPerPage),
      ),
      totalResults,
      approximate: false,
      scanned: items.length,
      ratingSource: effectiveSource,
      source: "tmdb",
    };
  }

  const windows = await Promise.all(
    mediaTypes.map((mediaType) =>
      fetchWindow(effective, mediaType, locale, WINDOW_PAGES),
    ),
  );
  const candidates = windows.flatMap((window) => window.items);

  let survivors = applyPostFilters(candidates, effective, context);

  if (needsCountryBackfill(effective)) {
    survivors = applyCountryFilter(
      await backfillCountries(survivors, locale),
      effective.countries,
    );
  }

  const sorted = sortCards(survivors, effective.sort);
  const start = (effective.page - 1) * effective.perPage;

  return {
    results: sorted.slice(start, start + effective.perPage),
    page: effective.page,
    totalPages: Math.max(1, Math.ceil(sorted.length / effective.perPage)),
    totalResults: sorted.length,
    // Ordering is exact within the sampled window, not across all of TMDB.
    approximate: true,
    scanned: candidates.length,
    ratingSource: effectiveSource,
    source: "tmdb",
  };
};

export const CERTIFICATIONS = CERT_LADDER;
