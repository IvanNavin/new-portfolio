import { getLang } from '@app/utils/getLang';
import { Locale } from '@root/i18n-config';

export const ROUTES = {
  root: (lang: Locale = getLang()) => `/${lang}`,
  about: (lang: Locale = getLang()) => `/${lang}/about`,
  myWorks: (lang: Locale = getLang()) => `/${lang}/my-works`,
  english: (lang: Locale = getLang()) => `/${lang}/my-works/english`,
  ganttChart: (lang: Locale = getLang()) => `/${lang}/my-works/gantt-chart`,
  miner: (lang: Locale = getLang()) => `/${lang}/my-works/miner`,
  pokedex: (lang: Locale = getLang()) => `/${lang}/my-works/pokedex`,
  portfolio: (lang: Locale = getLang()) => `/${lang}/my-works/portfolio`,
  rpg: (lang: Locale = getLang()) => `/${lang}/my-works/rpg`,
  thanos: (lang: Locale = getLang()) => `/${lang}/my-works/thanos`,
  contact: (lang: Locale = getLang()) => `/${lang}/contact`,
  performances: (lang: Locale = getLang()) => `/${lang}/performances`,
  accessibility: (lang: Locale = getLang()) =>
    `/${lang}/performances/accessibility`,
  regexp: (lang: Locale = getLang()) => `/${lang}/performances/regexp`,
  jest: (lang: Locale = getLang()) => `/${lang}/performances/jest`,
};
