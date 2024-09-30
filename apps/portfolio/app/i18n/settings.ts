export const defaultLocale = 'en';
export const languages = ['en', 'de', 'ua', 'ru'];
export const defaultNS = 'translation';
export const i18nCookieName = 'i18next';

export function getOptions(lng = defaultLocale, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng: defaultLocale,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    defaultLocale,
    ns,
  };
}
