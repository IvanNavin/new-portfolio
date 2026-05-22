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
  talks: (lang: Locale = getLang()) => `/${lang}/talks`,
  accessibility: (lang: Locale = getLang()) => `/${lang}/talks/accessibility`,
  regexp: (lang: Locale = getLang()) => `/${lang}/talks/regexp`,
  jest: (lang: Locale = getLang()) => `/${lang}/talks/jest`,
  typeVsInterface: (lang: Locale = getLang()) =>
    `/${lang}/talks/type-vs-interface`,
  solitaire: (lang: Locale = getLang()) => `/${lang}/my-works/solitaire`,
  snake: (lang: Locale = getLang()) => `/${lang}/my-works/snake`,
  game2048: (lang: Locale = getLang()) => `/${lang}/my-works/game-2048`,
};
