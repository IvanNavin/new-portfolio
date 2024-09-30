import { defaultLocale, i18nCookieName } from '@i18n/settings';
import Cookies from 'js-cookie';

export const getLang = () => Cookies.get(i18nCookieName) || defaultLocale;
