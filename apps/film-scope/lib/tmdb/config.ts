/**
 * Reference data that populates the filter controls. All of it changes at most
 * a few times a year, so it is cached for a week.
 */
import { hasTmdbToken, REVALIDATE, tmdbFetch, tolerant } from "./client";
import type { TmdbGenre } from "./dto";
import { MOVIE_GENRES, TV_GENRES } from "./genres";

export type Option = { value: string; label: string };
export type GenreOption = { id: number; name: string };

export type FilterConfig = {
  movieGenres: GenreOption[];
  tvGenres: GenreOption[];
  countries: Option[];
  languages: Option[];
  providers: { id: number; name: string; logoPath: string | null }[];
  certifications: string[];
  region: string;
};

/** Enough to keep every control usable when running on fixtures. */
const offlineGenres = (source: Record<string, number>): GenreOption[] =>
  Object.entries(source).map(([key, id]) => ({
    id,
    // camelCase key -> "Science Fiction"
    name: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim(),
  }));

const OFFLINE_COUNTRIES = [
  "US",
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "JP",
  "KR",
  "UA",
  "PL",
  "CA",
  "AU",
  "IN",
  "NO",
  "IR",
  "RU",
];

const OFFLINE_LANGUAGES = [
  "en",
  "uk",
  "ru",
  "fr",
  "de",
  "it",
  "es",
  "ja",
  "ko",
  "pl",
  "hi",
  "fa",
  "no",
];

/** TMDB's US ladder, least to most restrictive. */
export const US_CERTIFICATIONS = ["G", "PG", "PG-13", "R", "NC-17"];

export const getFilterConfig = async (
  locale: string,
  region: string,
): Promise<FilterConfig> => {
  if (!hasTmdbToken()) {
    return {
      movieGenres: offlineGenres(MOVIE_GENRES),
      tvGenres: offlineGenres(TV_GENRES),
      countries: OFFLINE_COUNTRIES.map((code) => ({
        value: code,
        label: code,
      })),
      languages: OFFLINE_LANGUAGES.map((code) => ({
        value: code,
        label: code,
      })),
      providers: [],
      certifications: US_CERTIFICATIONS,
      region,
    };
  }

  const [movie, tv, countries, languages, providers] = await Promise.all([
    tolerant(
      tmdbFetch<{ genres: TmdbGenre[] }>(
        "/genre/movie/list",
        { language: locale },
        REVALIDATE.config,
      ),
      { genres: [] },
    ),
    tolerant(
      tmdbFetch<{ genres: TmdbGenre[] }>(
        "/genre/tv/list",
        { language: locale },
        REVALIDATE.config,
      ),
      { genres: [] },
    ),
    tolerant(
      tmdbFetch<
        { iso_3166_1: string; native_name: string; english_name: string }[]
      >("/configuration/countries", { language: locale }, REVALIDATE.config),
      [],
    ),
    tolerant(
      tmdbFetch<{ iso_639_1: string; english_name: string; name: string }[]>(
        "/configuration/languages",
        {},
        REVALIDATE.config,
      ),
      [],
    ),
    tolerant(
      tmdbFetch<{
        results: {
          provider_id: number;
          provider_name: string;
          logo_path: string | null;
        }[];
      }>(
        "/watch/providers/movie",
        { language: locale, watch_region: region },
        REVALIDATE.config,
      ),
      { results: [] },
    ),
  ]);

  return {
    movieGenres: movie.genres,
    tvGenres: tv.genres,
    countries: countries
      .map((entry) => ({
        value: entry.iso_3166_1,
        label: entry.native_name || entry.english_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    languages: languages
      .map((entry) => ({
        value: entry.iso_639_1,
        label: entry.english_name || entry.name,
      }))
      .filter((entry) => entry.label)
      .sort((a, b) => a.label.localeCompare(b.label)),
    providers: providers.results
      .slice(0, 40)
      .map((entry) => ({
        id: entry.provider_id,
        name: entry.provider_name,
        logoPath: entry.logo_path,
      })),
    certifications: US_CERTIFICATIONS,
    region,
  };
};
