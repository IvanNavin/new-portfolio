/**
 * TMDB uses two disjoint genre vocabularies — /genre/movie/list and
 * /genre/tv/list. The ids overlap numerically but not semantically (18 is
 * Drama in both, 16 is Animation in both, yet Action is 28 for film and 10759
 * for TV, and Sci-Fi splits into 878 vs 10765). Mixing them silently returns
 * nonsense, so `type: 'both'` has to translate ids per side.
 */
export const MOVIE_GENRES = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scienceFiction: 878,
  tvMovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
} as const;

export const TV_GENRES = {
  actionAdventure: 10759,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  news: 10763,
  reality: 10764,
  sciFiFantasy: 10765,
  soap: 10766,
  talk: 10767,
  warPolitics: 10768,
  western: 37,
} as const;

/** Movie genre id -> closest TV genre id. Unmapped ids are dropped for TV. */
const MOVIE_TO_TV: Record<number, number> = {
  [MOVIE_GENRES.action]: TV_GENRES.actionAdventure,
  [MOVIE_GENRES.adventure]: TV_GENRES.actionAdventure,
  [MOVIE_GENRES.animation]: TV_GENRES.animation,
  [MOVIE_GENRES.comedy]: TV_GENRES.comedy,
  [MOVIE_GENRES.crime]: TV_GENRES.crime,
  [MOVIE_GENRES.documentary]: TV_GENRES.documentary,
  [MOVIE_GENRES.drama]: TV_GENRES.drama,
  [MOVIE_GENRES.family]: TV_GENRES.family,
  [MOVIE_GENRES.fantasy]: TV_GENRES.sciFiFantasy,
  [MOVIE_GENRES.scienceFiction]: TV_GENRES.sciFiFantasy,
  [MOVIE_GENRES.mystery]: TV_GENRES.mystery,
  [MOVIE_GENRES.war]: TV_GENRES.warPolitics,
  [MOVIE_GENRES.western]: TV_GENRES.western,
};

const TV_TO_MOVIE: Record<number, number> = {
  [TV_GENRES.actionAdventure]: MOVIE_GENRES.action,
  [TV_GENRES.sciFiFantasy]: MOVIE_GENRES.scienceFiction,
  [TV_GENRES.warPolitics]: MOVIE_GENRES.war,
  [TV_GENRES.kids]: MOVIE_GENRES.family,
};

const SHARED = new Set<number>([
  MOVIE_GENRES.animation,
  MOVIE_GENRES.comedy,
  MOVIE_GENRES.crime,
  MOVIE_GENRES.documentary,
  MOVIE_GENRES.drama,
  MOVIE_GENRES.family,
  MOVIE_GENRES.mystery,
  MOVIE_GENRES.western,
]);

const translate = (
  ids: readonly number[],
  table: Record<number, number>,
): number[] => {
  const out = new Set<number>();
  for (const id of ids) {
    if (SHARED.has(id)) out.add(id);
    else if (table[id] !== undefined) out.add(table[id]);
  }
  return [...out];
};

/** Genre ids expressed in the TV vocabulary. */
export const toTvGenres = (ids: readonly number[]): number[] =>
  translate(ids, MOVIE_TO_TV);

/** Genre ids expressed in the movie vocabulary. */
export const toMovieGenres = (ids: readonly number[]): number[] =>
  translate(ids, TV_TO_MOVIE);

export type GenreVocabulary = "movie" | "tv";

/**
 * Which vocabulary the ids in `query.genres` are already written in.
 *
 * The picker offers the TV genre list while the type is "tv" and the movie list
 * otherwise, so the stored ids follow the selected type. Translating without
 * checking this is what silently erased the filter: `toTvGenres([10765])` finds
 * no *movie* genre 10765, drops it, and TMDB then receives no `with_genres` at
 * all — which reads as "no genre filter" rather than "no matches".
 */
export const vocabularyForType = (type: string): GenreVocabulary =>
  type === "tv" ? "tv" : "movie";

/** No-ops when the vocabularies already agree; only cross-vocabulary calls translate. */
export const translateGenres = (
  ids: readonly number[],
  from: GenreVocabulary,
  to: GenreVocabulary,
): number[] => {
  if (from === to) return [...ids];
  return to === "tv" ? toTvGenres(ids) : toMovieGenres(ids);
};

/**
 * True when translating would throw the whole selection away — e.g. asking for
 * Horror (a movie-only genre) on the TV side. The caller must then return no
 * results for that media type instead of quietly returning everything.
 */
export const translationLosesFilter = (
  ids: readonly number[],
  from: GenreVocabulary,
  to: GenreVocabulary,
): boolean => ids.length > 0 && translateGenres(ids, from, to).length === 0;

/**
 * Rewrites a stored genre selection when the user switches between films and
 * shows. The two vocabularies are disjoint, so ids picked under one are
 * meaningless under the other — "Science Fiction" (878) has to become
 * "Sci-Fi & Fantasy" (10765) on the way to TV, and back on the way out.
 * Without this, switching type would silently keep dead ids.
 */
export const retargetGenres = <
  T extends { include: number[]; exclude: number[] },
>(
  facet: T,
  fromType: string,
  toType: string,
): T => {
  const from = vocabularyForType(fromType);
  const to = vocabularyForType(toType);
  if (from === to) return facet;
  return {
    ...facet,
    include: translateGenres(facet.include, from, to),
    exclude: translateGenres(facet.exclude, from, to),
  };
};
