/**
 * Offline mode.
 *
 * With no TMDB_ACCESS_TOKEN the app serves a small hand-authored catalog and
 * runs every filter locally, so the entire product — presets, exclusions,
 * Bayesian ranking, the detail page — is exercisable before the token exists.
 *
 * The data is INVENTED. Titles, ratings, vote counts and people are
 * placeholders with synthetic ids (9xxxxx / 8xxxxx); nothing here is a real
 * TMDB record and none of it should ever be presented as a real rating. The UI
 * shows a permanent demo banner while this path is active.
 */
import {
  applyCountryFilter,
  applyPostFilters,
  emptyContext,
  sortCards,
} from "../filters/postFilter";
import {
  CERT_LADDER,
  type FilterQuery,
  type SetFacet,
} from "../filters/schema";
import type {
  DiscoverResponse,
  MediaType,
  TitleCard,
  TitleDetails,
} from "../filters/types";
import catalog from "./__fixtures__/catalog.json";
import { MOVIE_GENRES, toTvGenres, TV_GENRES } from "./genres";

type FixtureTitle = (typeof catalog.titles)[number];

const CERT_ORDER: readonly string[] = CERT_LADDER;

/** Offline the TMDB genre-list endpoints are unavailable, so names come from the map. */
const GENRE_NAMES: Record<number, string> = Object.fromEntries(
  [...Object.entries(MOVIE_GENRES), ...Object.entries(TV_GENRES)].map(
    ([key, id]) => [
      id,
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim(),
    ],
  ),
);

const toCard = (entry: FixtureTitle): TitleCard => ({
  id: entry.id,
  mediaType: entry.mediaType as MediaType,
  title: entry.title,
  originalTitle: entry.originalTitle,
  overview: entry.overview,
  posterPath: null,
  backdropPath: null,
  releaseDate: entry.releaseDate,
  year: entry.year,
  genreIds: entry.genreIds,
  originCountries: entry.originCountries,
  originalLanguage: entry.originalLanguage,
  runtime: entry.runtime,
  popularity: entry.popularity,
  ratings: {
    tmdb: { value: entry.voteAverage, votes: entry.voteCount },
    imdb: null,
  },
  score: 0,
});

/** Same include/exclude/mode semantics the real post-filter uses. */
const matchesSet = <T>(values: readonly T[], facet: SetFacet<T>): boolean => {
  if (facet.exclude.some((item) => values.includes(item))) return false;
  if (!facet.include.length) return true;
  return facet.mode === "all"
    ? facet.include.every((item) => values.includes(item))
    : facet.include.some((item) => values.includes(item));
};

const matchesAnimation = (entry: FixtureTitle, query: FilterQuery): boolean => {
  if (query.animation === "any") return true;
  const isAnimated = entry.genreIds.includes(MOVIE_GENRES.animation);
  return query.animation === "only" ? isAnimated : !isAnimated;
};

const matchesGenres = (entry: FixtureTitle, query: FilterQuery): boolean => {
  const isTv = entry.mediaType === "tv";
  return matchesSet(entry.genreIds, {
    include: isTv ? toTvGenres(query.genres.include) : query.genres.include,
    exclude: isTv ? toTvGenres(query.genres.exclude) : query.genres.exclude,
    mode: query.genres.mode,
  });
};

const matchesCertification = (
  entry: FixtureTitle,
  query: FilterQuery,
): boolean => {
  const { min, max } = query.certification;
  if (!min && !max) return true;
  // TMDB itself cannot filter TV by certification, so neither do we.
  if (entry.mediaType === "tv") return true;
  const actual = CERT_ORDER.indexOf(entry.certification ?? "");
  if (actual === -1) return true;
  if (min && actual < CERT_ORDER.indexOf(min)) return false;
  if (max && actual > CERT_ORDER.indexOf(max)) return false;
  return true;
};

/** The fixtures only carry cast, so crew constraints are reported as unmatched. */
const matchesPeople = (entry: FixtureTitle, query: FilterQuery): boolean => {
  const ids: number[] = entry.castIds ?? [];
  return matchesSet(ids, query.cast) && matchesSet(ids, query.crew);
};

export const fixtureDiscover = (query: FilterQuery): DiscoverResponse => {
  const wantedTypes: MediaType[] =
    query.type === "both" ? ["movie", "tv"] : [query.type as MediaType];

  const candidates = (catalog.titles as FixtureTitle[])
    .filter((entry) => wantedTypes.includes(entry.mediaType as MediaType))
    .filter((entry) => matchesGenres(entry, query))
    .filter((entry) => matchesAnimation(entry, query))
    .filter((entry) => matchesCertification(entry, query))
    .filter((entry) => matchesPeople(entry, query))
    .map(toCard);

  // Reuse the real post-filter + ranking path so offline behaviour matches
  // production instead of drifting into a separate code path.
  const filtered = applyCountryFilter(
    applyPostFilters(candidates, query, emptyContext()),
    query.countries,
  );

  const sorted = sortCards(filtered, query.sort);
  const start = (query.page - 1) * query.perPage;

  return {
    results: sorted.slice(start, start + query.perPage),
    page: query.page,
    totalPages: Math.max(1, Math.ceil(sorted.length / query.perPage)),
    totalResults: sorted.length,
    approximate: false,
    scanned: candidates.length,
    ratingSource: query.rating.source === "imdb" ? "tmdb" : query.rating.source,
    source: "fixtures",
  };
};

export const fixtureTitle = (id: number): TitleDetails | null => {
  const entry = (catalog.titles as FixtureTitle[]).find(
    (item) => item.id === id,
  );
  if (!entry) return null;

  const card = toCard(entry);
  const sameGenre = (catalog.titles as FixtureTitle[])
    .filter(
      (item) =>
        item.id !== entry.id &&
        item.genreIds.some((g) => entry.genreIds.includes(g)),
    )
    .slice(0, 8)
    .map(toCard);

  return {
    ...card,
    tagline: "",
    status: "Released",
    imdbId: null,
    homepage: null,
    genres: entry.genreIds.map((genreId) => ({
      id: genreId,
      name: GENRE_NAMES[genreId] ?? String(genreId),
    })),
    productionCompanies: [],
    productionCountries: entry.originCountries.map((code) => ({
      code,
      name: code,
    })),
    spokenLanguages: [
      { code: entry.originalLanguage, name: entry.originalLanguage },
    ],
    budget: null,
    revenue: null,
    certification: entry.certification ?? null,
    seasons: entry.mediaType === "tv" ? 3 : null,
    episodes: entry.mediaType === "tv" ? 24 : null,
    cast: (entry.cast ?? []).map((name, index) => ({
      id: entry.castIds?.[index] ?? index,
      name,
      profilePath: null,
      role: "Demo role",
      order: index,
    })),
    crew: [],
    keywords: [],
    videos: [],
    providers: { region: "UA", link: null, items: [] },
    similar: sameGenre,
    collection: null,
    overviewFallback: false,
  };
};

export const fixturePeople = (term: string) => {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  return catalog.people
    .filter((person) => person.name.toLowerCase().includes(needle))
    .slice(0, 10)
    .map((person) => ({ id: person.id, name: person.name, imagePath: null }));
};

export const fixturePersonNames = (ids: readonly number[]) =>
  catalog.people
    .filter((person) => ids.includes(person.id))
    .map((person) => ({ id: person.id, name: person.name, imagePath: null }));

export const FIXTURE_NOTE = catalog._note;
