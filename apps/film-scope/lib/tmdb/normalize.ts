/** TMDB payloads -> our own domain shapes. Nothing downstream sees a TMDB field name. */
import type { MediaType, Ratings, TitleCard } from "../filters/types";
import type { TmdbListItem, TmdbMovieListItem, TmdbTvListItem } from "./dto";

const isTv = (item: TmdbListItem): item is TmdbTvListItem =>
  (item as TmdbTvListItem).name !== undefined;

const yearOf = (date: string | undefined): number | null => {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
};

export const toRatings = (voteAverage: number, voteCount: number): Ratings => ({
  tmdb: voteCount > 0 ? { value: voteAverage, votes: voteCount } : null,
  // Filled in by the Postgres index in Stage 2.
  imdb: null,
});

export const normalizeListItem = (
  item: TmdbListItem,
  mediaType?: MediaType,
): TitleCard => {
  const tv = mediaType === "tv" || (mediaType === undefined && isTv(item));

  if (tv) {
    const show = item as TmdbTvListItem;
    return {
      id: show.id,
      mediaType: "tv",
      title: show.name,
      originalTitle: show.original_name,
      overview: show.overview ?? "",
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      releaseDate: show.first_air_date || null,
      year: yearOf(show.first_air_date),
      genreIds: show.genre_ids ?? [],
      originCountries: show.origin_country ?? [],
      originalLanguage: show.original_language,
      runtime: show.episode_run_time?.[0] ?? null,
      popularity: show.popularity ?? 0,
      ratings: toRatings(show.vote_average, show.vote_count),
      score: 0,
    };
  }

  const movie = item as TmdbMovieListItem;
  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview ?? "",
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date || null,
    year: yearOf(movie.release_date),
    genreIds: movie.genre_ids ?? [],
    originCountries: movie.origin_country ?? [],
    originalLanguage: movie.original_language,
    runtime: movie.runtime ?? null,
    popularity: movie.popularity ?? 0,
    ratings: toRatings(movie.vote_average, movie.vote_count),
    score: 0,
  };
};
