import { isLocale, type Locale, TMDB_LOCALE } from "./i18n/routing";

/**
 * API routes are locale-agnostic URLs, so the language comes from an explicit
 * ?locale= param, falling back to Accept-Language and finally English.
 */
export const resolveLocale = (
  request: Request,
  params: URLSearchParams,
): Locale => {
  const explicit = params.get("locale");
  if (explicit && isLocale(explicit)) return explicit;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (tag && isLocale(tag)) return tag;
  }
  return "en";
};

export const tmdbLanguage = (locale: Locale): string => TMDB_LOCALE[locale];

export const defaultRegion = (): string =>
  process.env.NEXT_PUBLIC_DEFAULT_REGION?.toUpperCase() || "UA";
