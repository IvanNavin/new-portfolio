/** Raw TMDB payload shapes, narrowed to the fields we actually read. */

export type TmdbMovieListItem = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genre_ids?: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  /** Present on details, absent from list payloads — see discover backfill. */
  origin_country?: string[];
  runtime?: number | null;
};

export type TmdbTvListItem = {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  genre_ids?: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  episode_run_time?: number[];
};

export type TmdbListItem = TmdbMovieListItem | TmdbTvListItem;

export type TmdbPaged<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbGenre = { id: number; name: string };

export type TmdbCastMember = {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  order?: number;
};

export type TmdbCrewMember = {
  id: number;
  name: string;
  profile_path: string | null;
  job?: string;
  department?: string;
};

export type TmdbCredits = { cast?: TmdbCastMember[]; crew?: TmdbCrewMember[] };

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
  iso_639_1: string;
};

export type TmdbProviderEntry = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

export type TmdbProviderRegion = {
  link?: string;
  flatrate?: TmdbProviderEntry[];
  free?: TmdbProviderEntry[];
  ads?: TmdbProviderEntry[];
  rent?: TmdbProviderEntry[];
  buy?: TmdbProviderEntry[];
};

export type TmdbReleaseDates = {
  results?: {
    iso_3166_1: string;
    release_dates?: { certification?: string; type?: number }[];
  }[];
};

export type TmdbContentRatings = {
  results?: { iso_3166_1: string; rating?: string }[];
};

export type TmdbMovieDetails = TmdbMovieListItem & {
  tagline?: string;
  status?: string;
  imdb_id?: string | null;
  homepage?: string | null;
  genres?: TmdbGenre[];
  runtime?: number | null;
  budget?: number;
  revenue?: number;
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: {
    iso_639_1: string;
    english_name?: string;
    name?: string;
  }[];
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
  } | null;
  credits?: TmdbCredits;
  keywords?: { keywords?: TmdbGenre[] };
  videos?: { results?: TmdbVideo[] };
  recommendations?: TmdbPaged<TmdbMovieListItem>;
  release_dates?: TmdbReleaseDates;
  "watch/providers"?: { results?: Record<string, TmdbProviderRegion> };
};

export type TmdbTvDetails = TmdbTvListItem & {
  tagline?: string;
  status?: string;
  homepage?: string | null;
  genres?: TmdbGenre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: {
    iso_639_1: string;
    english_name?: string;
    name?: string;
  }[];
  credits?: TmdbCredits;
  keywords?: { results?: TmdbGenre[] };
  videos?: { results?: TmdbVideo[] };
  recommendations?: TmdbPaged<TmdbTvListItem>;
  content_ratings?: TmdbContentRatings;
  external_ids?: { imdb_id?: string | null };
  "watch/providers"?: { results?: Record<string, TmdbProviderRegion> };
};

export type TmdbPersonCredits = {
  cast?: { id: number }[];
  crew?: { id: number }[];
};

export type TmdbPerson = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  biography?: string;
  birthday?: string | null;
  place_of_birth?: string | null;
};
