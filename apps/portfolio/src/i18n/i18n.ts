import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  DEFAULT_NS,
  I18N_COOKIE,
  LANGUAGES,
} from "./settings";

/**
 * Client-only i18next for the SPA. Unlike the old Next app, the locale is NOT
 * in the URL (the cube router owns bare paths like /about) — it's detected from
 * cookie → navigator and persisted to a cookie, switchable at runtime later.
 * Locale JSON is code-split and lazy-loaded via Vite's dynamic glob import.
 */
void i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    supportedLngs: LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: DEFAULT_NS,
    fallbackNS: DEFAULT_NS,
    ns: DEFAULT_NS,
    detection: {
      order: ["cookie", "navigator", "htmlTag"],
      lookupCookie: I18N_COOKIE,
      caches: ["cookie"],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18next;
