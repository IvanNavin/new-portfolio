import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "uk", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

/** locale -> the language tag TMDB expects. */
export const TMDB_LOCALE: Record<Locale, string> = {
  en: "en-US",
  uk: "uk-UA",
  ru: "ru-RU",
};

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  // English lives at "/", the others at "/uk" and "/ru".
  localePrefix: "as-needed",
  // First visit follows the browser's Accept-Language, then the cookie sticks.
  localeDetection: true,
});

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);
