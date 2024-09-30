import { defaultLocale, languages } from '@i18n/settings';

export const i18n = {
  defaultLocale,
  locales: languages,
};

export type Locale = (typeof i18n)['locales'][number];
