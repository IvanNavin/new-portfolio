import { defaultLocale, i18nCookieName } from '@i18n/settings';
import { Locale } from '@root/i18n-config';
import Cookies from 'js-cookie';

export const getLang = () =>
  (Cookies.get(i18nCookieName) || defaultLocale) as Locale;
