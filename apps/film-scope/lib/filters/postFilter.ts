/**
 * Everything TMDB's /discover cannot express, applied to the candidate window
 * on our side.
 *
 * TMDB has no `without_origin_country`, no original-language exclusion, no
 * "not starring X", and no way to carve a band out of the middle of a range.
 * Those are exactly the filters this product exists for, so they live here.
 * Stage 2 replaces this whole file with SQL.
 */
import {
  type GenreVocabulary,
  MOVIE_GENRES,
  translateGenres,
  vocabularyForType,
} from "../tmdb/genres";
import {
  type Band,
  type FilterQuery,
  inBands,
  type MatchMode,
  type SetFacet,
} from "./schema";
import { computeScore, rawRating } from "./score";
import type { TitleCard } from "./types";

export type PostFilterContext = {
  /**
   * Union of the filmographies of everyone in `cast.exclude` / `crew.exclude`,
   * resolved with one request per person — far cheaper than fetching credits
   * for every candidate.
   */
  excludedTitleIds: Set<number>;
  /**
   * Set only when a cast/crew *include* had to be resolved client-side because
   * /discover/tv supports neither. null = no such constraint.
   */
  requiredTitleIds: Set<number> | null;
};

export const emptyContext = (): PostFilterContext => ({
  excludedTitleIds: new Set(),
  requiredTitleIds: null,
});

/** Generic set-facet test over a title's own values. */
const matchesSet = <T>(values: readonly T[], facet: SetFacet<T>): boolean => {
  if (facet.exclude.some((item) => values.includes(item))) return false;
  if (!facet.include.length) return true;
  return facet.mode === "all"
    ? facet.include.every((item) => values.includes(item))
    : facet.include.some((item) => values.includes(item));
};

/** Range test: inside min/max and outside every excluded band. */
const inRange = (
  value: number | null,
  range: { min?: number; max?: number; exclude: Band[] },
): boolean => {
  // Unknown value: keep it rather than silently hiding the title.
  if (value === null) return true;
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  if (range.exclude.length && inBands(value, range.exclude)) return false;
  return true;
};

/**
 * Genre membership, re-checked against the payload.
 *
 * `with_genres` upstream should already guarantee this, so normally it is a
 * no-op. It exists as a backstop: a genre filter that fails to reach TMDB comes
 * back as the unfiltered catalog, which looks like working software. Checking
 * locally turns that failure mode into zero results instead of wrong ones.
 * `genre_ids` ships with every list payload, so it costs nothing.
 */
const matchesGenres = (card: TitleCard, query: FilterQuery): boolean => {
  const { genres, type } = query;
  if (!genres.include.length && !genres.exclude.length) return true;

  const from = vocabularyForType(type);
  const to: GenreVocabulary = card.mediaType === "tv" ? "tv" : "movie";

  return matchesSet(card.genreIds, {
    include: translateGenres(genres.include, from, to),
    exclude: translateGenres(genres.exclude, from, to),
    mode: genres.mode,
  });
};

/** Rescores every card for the chosen source, then drops what TMDB let through. */
export const applyPostFilters = (
  cards: TitleCard[],
  query: FilterQuery,
  context: PostFilterContext = emptyContext(),
): TitleCard[] => {
  const { languages, rating, year, runtime, animation } = query;

  return cards
    .map((card) => ({
      ...card,
      score: computeScore(card.ratings, rating.source, rating.votes.min),
    }))
    .filter((card) => {
      if (context.excludedTitleIds.has(card.id)) return false;
      if (context.requiredTitleIds && !context.requiredTitleIds.has(card.id))
        return false;

      // genre_ids and original_language are in every list payload, so both of
      // these are exact and free.
      if (animation !== "any") {
        const isAnimated = card.genreIds.includes(MOVIE_GENRES.animation);
        if (animation === "only" && !isAnimated) return false;
        if (animation === "without" && isAnimated) return false;
      }

      if (!matchesGenres(card, query)) return false;
      if (!matchesSet([card.originalLanguage], languages)) return false;

      if (!inRange(card.year, year)) return false;
      if (!inRange(card.runtime, runtime)) return false;

      // TMDB's vote_count / vote_average bounds only know about TMDB's own
      // numbers, so re-apply them for the source the user actually picked.
      const raw = rawRating(card.ratings, rating.source);
      if (!raw) return false;
      if (!inRange(raw.votes, rating.votes)) return false;
      if (!inRange(raw.value, rating.value)) return false;

      return true;
    });
};

/**
 * Origin country is applied separately: TMDB omits the field from movie list
 * payloads, so the discover pipeline backfills it with extra requests and only
 * wants to pay for that on titles that survived every cheaper filter.
 */
export const applyCountryFilter = (
  cards: TitleCard[],
  countries: SetFacet<string>,
): TitleCard[] => {
  if (!countries.include.length && !countries.exclude.length) return cards;

  return cards.filter((card) => {
    // Unknown origin (backfill failed or was capped) — keep rather than hide.
    if (!card.originCountries.length) return true;
    return matchesSet(card.originCountries, countries);
  });
};

const compare = (
  a: TitleCard,
  b: TitleCard,
  field: FilterQuery["sort"]["by"],
): number => {
  switch (field) {
    case "score":
      return a.score - b.score;
    case "votes": {
      const av = a.ratings.imdb?.votes ?? a.ratings.tmdb?.votes ?? 0;
      const bv = b.ratings.imdb?.votes ?? b.ratings.tmdb?.votes ?? 0;
      return av - bv;
    }
    case "release":
      return (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "");
    case "runtime":
      return (a.runtime ?? 0) - (b.runtime ?? 0);
    case "title":
      return a.title.localeCompare(b.title);
    case "popularity":
    case "revenue":
      return a.popularity - b.popularity;
    default:
      return 0;
  }
};

export const sortCards = (
  cards: TitleCard[],
  sort: FilterQuery["sort"],
): TitleCard[] => {
  const direction = sort.dir === "asc" ? 1 : -1;
  return [...cards].sort((a, b) => {
    const primary = compare(a, b, sort.by) * direction;
    // Stable, deterministic tie-break so pagination never repeats or drops a
    // title between requests.
    return primary !== 0 ? primary : a.id - b.id;
  });
};

const hasBands = (range: { exclude: Band[] }) => range.exclude.length > 0;

/** True when the query needs filtering or ordering TMDB cannot do server-side. */
export const needsPostFiltering = (query: FilterQuery): boolean =>
  // 'without' folds cleanly into without_genres; 'only' may not, so treat it
  // as needing our pass whenever other genres are OR-ed together.
  (query.animation === "only" &&
    query.genres.include.length > 0 &&
    query.genres.mode === "any") ||
  query.countries.exclude.length > 0 ||
  query.countries.mode === "all" ||
  query.languages.exclude.length > 0 ||
  query.languages.include.length > 1 ||
  query.cast.exclude.length > 0 ||
  query.crew.exclude.length > 0 ||
  query.rating.source !== "tmdb" ||
  hasBands(query.year) ||
  hasBands(query.runtime) ||
  hasBands(query.rating.value) ||
  hasBands(query.rating.votes);

/** True when we must backfill origin countries (absent from TMDB movie lists). */
export const needsCountryBackfill = (query: FilterQuery): boolean =>
  query.countries.exclude.length > 0 ||
  (query.countries.include.length > 0 && query.countries.mode === "all");

export type { MatchMode };
