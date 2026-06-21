export const LANGUAGES = ["en", "ua", "ru", "de"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";
export const DEFAULT_NS = "common";
export const I18N_COOKIE = "i18next";
